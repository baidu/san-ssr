import { expr } from './expr-compiler'
import { camelCase } from 'lodash'
import { JSEmitter } from '../js-emitter'
import { ANode, AIfNode, AForNode, ASlotNode, ATemplateNode, AFragmentNode, ATextNode } from 'san'
import { ComponentInfo } from '../../models/component-info'
import { ComponentReference } from '../../models/component-reference'
import { ElementCompiler } from './element-compiler'
import { stringifier } from './stringifier'
import { getANodePropByName } from '../../utils/anode-util'
import * as TypeGuards from '../../utils/type-guards'

/**
 * ANode 编译
 *
 * 负责单个 ComponentClass 的编译，每个 ANodeCompiler 对应于一个 ComponentInfo。
 */
export class ANodeCompiler<T extends 'none' | 'typed'> {
    private ssrIndex = 0
    private elementCompiler: ElementCompiler

    /**
     * @param componentInfo 要被编译的节点所在组件的信息
     * @param componentTree 当前组件所在的组件树
     * @param ssrOnly san-ssr 当做模板引擎来使用（产出 HTML 更简单，但无法反解）
     * @param emitter 代码输出器，产出代码塞到这里面
     */
    constructor (
        private componentInfo: ComponentInfo,
        private ssrOnly: boolean,
        public emitter: JSEmitter
    ) {
        this.elementCompiler = new ElementCompiler(this, emitter)
    }

    compile (aNode: ANode, isRootElement: boolean) {
        if (TypeGuards.isATextNode(aNode)) return this.compileText(aNode)
        if (TypeGuards.isAIfNode(aNode)) return this.compileIf(aNode)
        if (TypeGuards.isAForNode(aNode)) return this.compileFor(aNode)
        if (TypeGuards.isASlotNode(aNode)) return this.compileSlot(aNode)
        if (TypeGuards.isATemplateNode(aNode)) return this.compileTemplate(aNode)
        if (TypeGuards.isAFragmentNode(aNode)) return this.compileFragment(aNode)

        const ref = this.componentInfo.getChildComponentRenference(aNode)
        if (ref) {
            return this.compileComponent(aNode, ref, isRootElement)
        }
        return this.compileElement(aNode, isRootElement)
    }

    private compileText (aNode: ATextNode) {
        const { emitter } = this
        const shouldEmitComment = TypeGuards.isExprTextNode(aNode.textExpr) && aNode.textExpr.original && !this.ssrOnly

        if (shouldEmitComment) emitter.writeHTMLLiteral('<!--s-text-->')
        emitter.writeHTMLExpression(expr(aNode.textExpr, true))
        if (shouldEmitComment) emitter.writeHTMLLiteral('<!--/s-text-->')
    }

    compileTemplate (aNode: ATemplateNode) {
        // if、for 等区块 wrap，只渲染内容。
        // 注意：<template> 为组件根节点时，tagName=null, isATemplateNode=false
        this.elementCompiler.inner(aNode)
    }

    compileFragment (aNode: AFragmentNode) {
        if (TypeGuards.isATextNode(aNode.children[0]) && !this.ssrOnly) {
            this.emitter.writeHTMLLiteral('<!--s-frag-->')
        }
        this.elementCompiler.inner(aNode)
        if (TypeGuards.isATextNode(aNode.children[aNode.children.length - 1]) && !this.ssrOnly) {
            this.emitter.writeHTMLLiteral('<!--/s-frag-->')
        }
    }

    private compileIf (aNode: AIfNode) {
        const { emitter } = this
        // output if
        const ifDirective = aNode.directives['if']
        const aNodeWithoutIf = Object.assign({}, aNode)
        delete aNodeWithoutIf.directives['if']
        emitter.writeIf(expr(ifDirective.value), () => this.compile(aNodeWithoutIf, false))

        // output elif and else
        for (const elseANode of aNode.elses || []) {
            const elifDirective = elseANode.directives.elif
            if (elifDirective) {
                emitter.writeLine('else if (' + expr(elifDirective.value) + ') {')
            } else {
                emitter.writeLine('else {')
            }
            emitter.indent()
            this.compile(elseANode, false)
            emitter.unindent()
            emitter.writeLine('}')
        }
    }

    private compileFor (aNode: AForNode) {
        const { emitter } = this
        const forElementANode = {
            children: aNode.children,
            props: aNode.props,
            events: aNode.events,
            tagName: aNode.tagName,
            directives: { ...aNode.directives }
        }
        delete forElementANode.directives.for

        const forDirective = aNode.directives.for
        const itemName = forDirective.item
        const indexName = forDirective.index || this.nextID()
        const listName = this.nextID()

        emitter.writeLine('var ' + listName + ' = ' + expr(forDirective.value) + ';')
        emitter.writeIf(listName + ' instanceof Array', () => {
            // for array
            emitter.writeFor('var ' + indexName + ' = 0; ' +
            indexName + ' < ' + listName + '.length; ' +
            indexName + '++', () => {
                emitter.writeLine('ctx.data.' + indexName + '=' + indexName + ';')
                emitter.writeLine('ctx.data.' + itemName + '= ' + listName + '[' + indexName + '];')
                this.compile(forElementANode, false)
            })
        })

        // for object
        emitter.beginElseIf('typeof ' + listName + ' === "object"')
        emitter.writeFor('var ' + indexName + ' in ' + listName, () => {
            emitter.writeIf(listName + '[' + indexName + '] != null', () => {
                emitter.writeLine('ctx.data.' + indexName + '=' + indexName + ';')
                emitter.writeLine('ctx.data.' + itemName + '= ' + listName + '[' + indexName + '];')
                this.compile(forElementANode, false)
            })
        })
        emitter.endIf()
    }

    private compileSlot (aNode: ASlotNode) {
        const { emitter } = this

        emitter.nextLine(`(`)
        emitter.writeAnonymousFunction([], () => {
            emitter.nextLine('const defaultRender = ')
            this.compileSlotRenderer(aNode.children)
            emitter.feedLine(';')

            emitter.writeBlock('let data =', () => {
                if (aNode.directives.bind) {
                    emitter.writeLine('...' + expr(aNode.directives.bind.value) + ',')
                }
                for (const item of aNode.vars || []) {
                    emitter.writeLine(`"${item.name}": ${expr(item.expr)},`)
                }
            })

            const nameProp = getANodePropByName(aNode, 'name')
            const slotNameExpr = nameProp ? expr(nameProp.expr) : '""'
            emitter.writeLine(`let slotName = ${slotNameExpr};`)
            emitter.writeLine(`let render = ctx.slots[slotName] || defaultRender;`)
            emitter.writeLine(`html += render(parentCtx, data);`)
        })
        emitter.feedLine(')();')
    }

    private compileElement (aNode: ANode, isRootElement: boolean) {
        this.elementCompiler.tagStart(aNode)
        if (isRootElement && !this.ssrOnly) this.outputData()
        this.elementCompiler.inner(aNode)
        this.elementCompiler.tagEnd(aNode)
    }

    private outputData () {
        this.emitter.writeIf('!noDataOutput', () => this.emitter.writeDataComment())
    }

    private compileComponent (aNode: ANode, ref: ComponentReference, isRootElement: boolean) {
        const { emitter } = this

        const defaultSourceSlots: ANode[] = []
        const sourceSlotCodes = new Map()

        for (const child of aNode.children!) { // nodes without children (like pATextNode) has been taken over by other methods
            const slotBind = !child.textExpr && getANodePropByName(child, 'slot')
            if (slotBind) {
                const slotName = slotBind.expr.value
                if (!sourceSlotCodes.has(slotName)) {
                    sourceSlotCodes.set(slotName, {
                        children: [],
                        prop: slotBind
                    })
                }
                sourceSlotCodes.get(slotName).children.push(child)
            } else {
                defaultSourceSlots.push(child)
            }
        }

        emitter.writeLine('var slots = {};')
        if (defaultSourceSlots.length) {
            emitter.nextLine('slots[""] = ')
            this.compileSlotRenderer(defaultSourceSlots)
            emitter.feedLine(';')
        }

        for (const sourceSlotCode of sourceSlotCodes.values()) {
            emitter.nextLine(`slots[${expr(sourceSlotCode.prop.expr)}] = `)
            this.compileSlotRenderer(sourceSlotCode.children)
            emitter.feedLine(';')
        }

        const ndo = isRootElement ? 'noDataOutput' : 'true'

        emitter.nextLine('html += ')
        emitter.writeFunctionCall(
            `runtime.resolver.getRenderer("${ref.id}", "${ref.specifier}")`,
            [ this.componentDataCode(aNode), ndo, 'runtime', 'parentCtx', stringifier.str(aNode.tagName) + ', slots' ]
        )
    }

    private compileSlotRenderer (content: ANode[]) {
        const { emitter } = this
        emitter.writeAnonymousFunction(['parentCtx', 'data'], () => {
            if (!content.length) {
                emitter.writeLine('return "";')
                return
            }
            emitter.writeLine('var html = "";')
            emitter.writeLine('ctx = {...ctx, data: Object.assign({}, ctx.data, data)};')
            for (const child of content) this.compile(child, false)
            emitter.writeLine('return html;')
        })
    }

    private componentDataCode (aNode: ANode) {
        const givenData = '{' + aNode.props.map(prop => {
            const key = stringifier.str(camelCase(prop.name))
            const val = expr(prop.expr)
            return `${key}: ${val}`
        }).join(', ') + '}'

        const bindDirective = aNode.directives.bind
        return bindDirective ? `Object.assign(${expr(bindDirective.value)}, ${givenData})` : givenData
    }

    private nextID () {
        return 'sanSSRID' + (this.ssrIndex++)
    }
}
