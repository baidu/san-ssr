/**
 * 把 ANode 编译成 SSR 代码块
 *
 * 每个组件的 template 对应于一个根 ANode。从它出发递归地编译整个 template。
 * 这里要做的就是区分 ANode 类型，做不同的编译。
 */
import assert from 'assert'
import { camelCase } from 'lodash'
import { ANode, AIfNode, AForNode, ASlotNode, AFragmentNode, AText, ADynamicNode, AElement, StringLiteral } from 'san'
import { ComponentInfo } from '../models/component-info'
import { ElementCompiler } from './element-compiler'
import { getANodePropByName } from '../ast/san-ast-util'
import * as TypeGuards from '../ast/san-ast-type-guards'
import { IDGenerator } from '../utils/id-generator'
import {
    JSONStringify, RegexpReplace, Statement, SlotRendererDefinition, ElseIf, Else, MapAssign, Foreach, If, MapLiteral,
    ComponentRendererReference, FunctionCall, SlotRenderCall, Expression, GetRootCtxCall, ComponentReferenceLiteral,
    ComponentClassReference,
    VariableDefinition,
    ConditionalExpression,
    Typeof,
    AssignmentStatement,
    ArrayLiteral
} from '../ast/renderer-ast-dfn'
import {
    CTX_DATA,
    createHTMLExpressionAppend,
    createHTMLLiteralAppend,
    L,
    I,
    ASSIGN,
    STATEMENT,
    UNARY,
    DEF,
    BINARY,
    RETURN,
    CONDITIONAL
} from '../ast/renderer-ast-util'
import { sanExpr, OutputType } from './san-expr-compiler'
import type { RenderOptions } from './renderer-options'

/**
 * ANode 编译
 *
 * 负责单个 ComponentClass 的编译，每个 ANodeCompiler 对应于一个 ComponentInfo。
 */
export class ANodeCompiler {
    private elementCompiler: ElementCompiler
    private inScript = false

    /**
     * @param componentInfo 要被编译的节点所在组件的信息
     * @param ssrOnly san-ssr 当做模板引擎来使用（产出 HTML 更简单，但无法反解）
     * @param id 抗冲突变量名产生器
     */
    constructor (
        private componentInfo: ComponentInfo,
        private ssrOnly: boolean,
        private id: IDGenerator,
        private useProvidedComponentClass: RenderOptions['useProvidedComponentClass'] = false
    ) {
        this.elementCompiler = new ElementCompiler(this, this.id)
    }

    compile (aNode: ANode, isRootElement: boolean): Generator<Statement> {
        if (TypeGuards.isATextNode(aNode)) return this.compileText(aNode)
        if (TypeGuards.isAIfNode(aNode)) return this.compileIf(aNode, isRootElement)
        if (TypeGuards.isAForNode(aNode)) return this.compileFor(aNode)
        if (TypeGuards.isASlotNode(aNode)) return this.compileSlot(aNode)
        if (TypeGuards.isAFragmentNode(aNode) && aNode.tagName === 'template') return this.compileTemplate(aNode)
        if (TypeGuards.isAFragmentNode(aNode) && aNode.tagName === 'fragment') return this.compileFragment(aNode)
        if (TypeGuards.isADynamicNode(aNode)) return this.compileDynamic(aNode, isRootElement)

        const childComponentReference = this.generateRef(aNode)
        if (childComponentReference) {
            return this.compileComponent(aNode, childComponentReference, isRootElement)
        }
        return this.compileElement(aNode, undefined, isRootElement)
    }

    private generateRef (aNode: ANode) {
        if (
            !TypeGuards.isATextNode(aNode) &&
            aNode.tagName &&
            this.componentInfo.childComponents.has(aNode.tagName)
        ) {
            return new ComponentReferenceLiteral(this.componentInfo.childComponents.get(aNode.tagName)!)
        }
    }

    private * compileText (aNode: AText): Generator<Statement> {
        const shouldEmitComment = (
            TypeGuards.isExprTextNode(aNode.textExpr) ||
            TypeGuards.isExprInterpNode(aNode.textExpr)
        ) && aNode.textExpr.original && !this.ssrOnly && !this.inScript
        const outputType = this.inScript ? OutputType.HTML : OutputType.ESCAPE_HTML
        if (shouldEmitComment) yield createHTMLLiteralAppend('<!--s-text-->')
        yield createHTMLExpressionAppend(sanExpr(aNode.textExpr, outputType))
        if (shouldEmitComment) yield createHTMLLiteralAppend('<!--/s-text-->')
    }

    private * compileTemplate (aNode: AFragmentNode) {
        // if、for 等区块 wrap，只渲染内容。
        // 注意：<template> 为组件根节点时，tagName=null, isATemplateNode=false
        yield * this.elementCompiler.inner(aNode)
    }

    private * compileFragment (aNode: AFragmentNode) {
        if (TypeGuards.isATextNode(aNode.children[0]) && !this.ssrOnly && !this.inScript) {
            yield createHTMLLiteralAppend('<!--s-frag-->')
        }
        yield * this.elementCompiler.inner(aNode)
        if (TypeGuards.isATextNode(aNode.children[aNode.children.length - 1]) && !this.ssrOnly && !this.inScript) {
            yield createHTMLLiteralAppend('<!--/s-frag-->')
        }
    }

    private * compileDynamic (aNode: ADynamicNode, isRootElement: boolean) {
        const dynamicTagName = this.id.next('dynamicTagName')
        yield DEF(dynamicTagName, sanExpr(aNode.directives.is.value))
        const refs = BINARY(I('ctx'), '.', I('refs'))

        // 这里会对 aNode 编译两次，期间一定不能有对 aNode 的修改，否则第二次会有问题
        yield new If(
            BINARY(refs, '[]', I(dynamicTagName)),
            this.compileComponent(aNode, BINARY(refs, '[]', I(dynamicTagName)), isRootElement, dynamicTagName)
        )
        yield new Else(this.compileElement(aNode, dynamicTagName, isRootElement))
    }

    private * compileIf (aNode: AIfNode, isRootElement: boolean): Generator<Statement> {
        const ifDirective = aNode.directives.if

        // 动态节点 s-is 的子节点，会被编译两次。期间不能被修改。
        // 这里复制一份。
        const aNodeWithoutIf = Object.assign({}, aNode)
        aNodeWithoutIf.directives = Object.assign({}, aNode.directives)

        // 防止重新进入 compileIf：删掉 if 指令，再递归进入当前 aNode
        // @ts-ignore
        delete aNodeWithoutIf.directives.if

        yield new If(sanExpr(ifDirective.value), this.compile(aNodeWithoutIf, isRootElement))

        for (const elseANode of aNode.elses || []) {
            const elifDirective = elseANode.directives.elif
            const body = this.compile(elseANode, isRootElement)
            yield elifDirective ? new ElseIf(sanExpr(elifDirective.value), body) : new Else(body)
        }
    }

    private * compileFor (aNode: AForNode): Generator<Statement> {
        const { id } = this
        const forElementANode = {
            children: aNode.children,
            props: aNode.props,
            events: aNode.events,
            tagName: aNode.tagName,
            directives: { ...aNode.directives }
        }
        // 防止重新进入 compileFor
        // @ts-ignore
        delete forElementANode.directives.for

        const { item, index, value } = aNode.directives.for
        const key = I(id.next('key'))
        const val = I(id.next('val'))
        const list = id.next('list')

        yield DEF(list, sanExpr(value))
        yield new Foreach(key, val, I(list), [
            ...index ? [ASSIGN(BINARY(CTX_DATA, '[]', L(index)), key)] : [],
            ASSIGN(BINARY(CTX_DATA, '[]', L(item!)), val),
            ...this.compile(forElementANode, false)
        ])
    }

    private * compileSlot (aNode: ASlotNode): Generator<Statement> {
        const { id } = this
        assert(!this.inScript, '<slot> is not allowed inside <script>')

        const defaultRender = I(id.next('defaultRender'))
        yield DEF(defaultRender.name, this.compileSlotRenderer(aNode.children))

        const slotData = I(id.next('slotData'))
        yield DEF(slotData.name, new MapLiteral([]))
        if (aNode.directives.bind) {
            yield STATEMENT(new MapAssign(slotData, [sanExpr(aNode.directives.bind.value)]))
        }

        const props = aNode.vars || []
        if (props.length) {
            yield STATEMENT(new MapAssign(
                slotData,
                [new MapLiteral(props.map(prop => [L(prop.name), sanExpr(prop.expr)]))]
            ))
        }

        const slotName = I(id.next('slotName'))
        const render = I(id.next('render'))

        const nameProp = getANodePropByName(aNode, 'name')
        yield DEF(slotName.name, nameProp ? sanExpr(nameProp.expr) : L(''))
        yield (DEF(render.name, BINARY(
            BINARY(BINARY(I('ctx'), '.', I('slots')), '[]', slotName),
            '||',
            defaultRender
        )))
        yield createHTMLExpressionAppend(new SlotRenderCall(render, [I('parentCtx'), slotData]))
    }

    private * compileElement (
        aNode: AElement,
        dynamicTagName: string | undefined = undefined,
        isRootElement: boolean
    ): Generator<Statement> {
        yield * this.elementCompiler.tagStart(
            aNode,
            dynamicTagName,
            isRootElement ? this.compileRootAttrs : undefined
        )
        if (aNode.tagName === 'script') this.inScript = true
        if (isRootElement && !this.ssrOnly && !this.inScript) {
            let dataOutputCondition = UNARY('!', I('noDataOutput')) as Expression
            if (
                this.componentInfo.componentType !== 'template' &&
                (this.componentInfo.ssrType === 'render-only' || this.componentInfo.ssrType === undefined)) {
                dataOutputCondition = BINARY(dataOutputCondition, '&&', UNARY('!', I('renderOnly')))
            }
            yield new If(dataOutputCondition, this.createDataComment())
        }

        yield * this.elementCompiler.inner(aNode)
        this.inScript = false
        yield * this.elementCompiler.tagEnd(aNode, dynamicTagName)
    }

    /**
     * add attrs to root element
     */
    private * compileRootAttrs () {
        yield new If(BINARY(I('attrs'), '&&', BINARY(I('attrs'), '.', I('length'))), [
            createHTMLLiteralAppend(' '),
            createHTMLExpressionAppend(new FunctionCall(BINARY(I('attrs'), '.', I('join')), [L(' ')]))
        ])
    }

    private createDataComment () {
        const dataExpr = CONDITIONAL(
            BINARY(I('info'), '.', I('preferRenderOnly')),
            BINARY(I('ctx'), '.', I('data')),
            BINARY(new GetRootCtxCall([I('ctx')]), '.', I('data'))
        )
        const outputDataExpr = BINARY(I('info'), '.', I('outputData'))
        return [
            new VariableDefinition('data', dataExpr),
            new If(outputDataExpr, [
                new AssignmentStatement(
                    I('data'),
                    new ConditionalExpression(
                        BINARY(new Typeof(outputDataExpr), '===', L('function')),
                        new FunctionCall(outputDataExpr, [I('data')]),
                        outputDataExpr
                    )
                )
            ]),
            createHTMLLiteralAppend('<!--s-data:'),
            createHTMLExpressionAppend(new RegexpReplace(new JSONStringify(I('data')), '(?<=-)-', L('\\-'))),
            createHTMLLiteralAppend('-->')
        ]
    }

    private * compileComponent (
        aNode: AElement,
        ref: Expression,
        isRootElement: boolean,
        dynamicTagName: string | undefined = undefined
    ) {
        assert(!this.inScript, 'component reference is not allowed inside <script>')

        // slot
        const defaultSlotContents: ANode[] = []
        const namedSlotContents = new Map()

        // nodes without children (like pATextNode) has been taken over by other methods
        for (const child of aNode.children!) {
            const slotBind = !TypeGuards.isATextNode(child) && getANodePropByName(child, 'slot')
            if (slotBind) {
                const slotName = (slotBind.expr as StringLiteral).value
                if (!namedSlotContents.has(slotName)) {
                    namedSlotContents.set(slotName, { children: [], prop: slotBind })
                }
                namedSlotContents.get(slotName).children.push(child)
            } else {
                defaultSlotContents.push(child)
            }
        }

        const childSlots = I(this.id.next('childSlots'))
        yield DEF(childSlots.name, new MapLiteral([]))
        if (defaultSlotContents.length) {
            yield ASSIGN(
                BINARY(childSlots, '[]', L('')),
                this.compileSlotRenderer(defaultSlotContents)
            )
        }

        for (const sourceSlotCode of namedSlotContents.values()) {
            yield ASSIGN(
                BINARY(childSlots, '[]', sanExpr(sourceSlotCode.prop.expr)),
                this.compileSlotRenderer(sourceSlotCode.children)
            )
        }

        // data output
        const normalNoDataOutput = isRootElement ? I('noDataOutput') : L(true)
        const ndo = (this.componentInfo.ssrType === 'render-only' || this.componentInfo.ssrType === undefined)
            ? CONDITIONAL(I('renderOnly'), L(false), normalNoDataOutput) : normalNoDataOutput

        // child component class
        let ChildComponentClassName = ''
        if (this.useProvidedComponentClass) {
            ChildComponentClassName = this.id.next('ChildComponentClass')
            yield DEF(
                ChildComponentClassName,
                new ComponentClassReference(ref, dynamicTagName ? I(dynamicTagName) : L(aNode.tagName))
            )
        }

        // get and call renderer
        const mapItems = [
            [I('noDataOutput'), ndo],
            [I('parentCtx'), I('parentCtx')],
            [I('tagName'), L(aNode.tagName)],
            [I('slots'), childSlots],
            [I('isChild'), L(true)]
        ] as ConstructorParameters<typeof MapLiteral>[0]
        if (this.useProvidedComponentClass) {
            assert(ChildComponentClassName !== '')
            mapItems.push([I('ComponentClass'), I(ChildComponentClassName)])
        }
        if (isRootElement) {
            mapItems.push([I('attrs'), I('attrs')])
        }
        if (this.componentInfo.ssrType === 'render-only' || this.componentInfo.ssrType === undefined) {
            mapItems.push([I('preferRenderOnly'), this.compileComponentRenderOnlyParam(aNode.tagName)])
        }

        const args = [this.childRenderData(aNode), new MapLiteral(mapItems)]
        const childRenderCall = new FunctionCall(
            new ComponentRendererReference(ref, L(aNode.tagName)),
            args
        )
        yield createHTMLExpressionAppend(childRenderCall)
    }

    /**
     * renderOnly
     *     ? typeof (info.preferRenderOnly) === "object" ? {cmpt: [...info.preferRenderOnly.cmpt, "ui-c"]}
     *     : {cmpt: ["ui-c"]} : false
     */
    private compileComponentRenderOnlyParam (tagName: AElement['tagName']) {
        const thenValue = CONDITIONAL(
            BINARY(new Typeof(BINARY(I('info'), '.', I('preferRenderOnly'))), '===', L('object')),
            new MapLiteral([[
                I('cmpt'),
                new ArrayLiteral([
                    [BINARY(I('info'), '.', BINARY(I('preferRenderOnly'), '.', I('cmpt'))), true],
                    [L(tagName), false]
                ])
            ]]),
            new MapLiteral([[
                I('cmpt'),
                new ArrayLiteral([[L(tagName), false]])
            ]])
        )
        return CONDITIONAL(I('renderOnly'), thenValue, L(false))
    }

    private compileSlotRenderer (content: ANode[]) {
        const args = [DEF('parentCtx'), DEF('data')]
        const body: Statement[] = []
        if (content.length) {
            const shouldEmitComment = emitComment(content)
            body.push(DEF('html', L('')))

            if (shouldEmitComment) {
                body.push(createHTMLLiteralAppend('<!--s-slot-->'))
            }

            const compData = this.id.next('compData')
            body.push(DEF(compData, CTX_DATA))
            body.push(STATEMENT(new MapAssign(CTX_DATA, [I('data')])))

            for (const child of content) body.push(...this.compile(child, false))

            if (shouldEmitComment) {
                body.push(createHTMLLiteralAppend('<!--/s-slot-->'))
            }

            body.push(ASSIGN(CTX_DATA, I(compData)))
            body.push(RETURN(I('html')))
        } else {
            body.push(RETURN(L('')))
        }
        return new SlotRendererDefinition('', args, body)

        // 第一个或最后一个，不为空的节点为 text node
        function emitComment (content: ANode[]) {
            let i = 0
            while (i < content.length) {
                const c = content[i]
                if (!TypeGuards.isATextNode(c)) {
                    break
                }

                const textExprValue = TypeGuards.isExprInterpNode(c.textExpr)
                    ? (c.textExpr.expr as StringLiteral).value : c.textExpr.value
                if (!textExprValue || textExprValue.trim() !== '') {
                    return true
                }
                i++
            }
            let j = content.length - 1
            while (j > i) {
                const c = content[j]
                if (!TypeGuards.isATextNode(c)) {
                    break
                }

                const textExprValue = TypeGuards.isExprInterpNode(c.textExpr)
                    ? (c.textExpr.expr as StringLiteral).value : c.textExpr.value
                if (!textExprValue || textExprValue.trim() !== '') {
                    return true
                }
                j--
            }
            return false
        }
    }

    private childRenderData (aNode: AElement) {
        const propData = new MapLiteral(
            aNode.props.map(prop => [L(camelCase(prop.name)), sanExpr(prop.expr)])
        )
        const bindDirective = aNode.directives.bind
        return bindDirective
            ? new MapAssign(
                BINARY(sanExpr(bindDirective.value), '||', new MapLiteral([])),
                [propData]
            )
            : propData
    }
}
