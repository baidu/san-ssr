import { expr } from '../target-js/compilers/expr-compiler'
import assert from 'assert'
import { camelCase } from 'lodash'
import { JSEmitter } from '../target-js/js-emitter'
import { ANode, AIfNode, AForNode, ASlotNode, ATemplateNode, AFragmentNode, ATextNode } from 'san'
import { ComponentInfo } from '../models/component-info'
import { ElementCompiler } from './element-compiler'
import { stringifier } from '../target-js/compilers/stringifier'
import { getANodePropByName } from '../utils/anode-util'
import * as TypeGuards from '../utils/type-guards'

/**
 * ANode 编译
 *
 * 负责单个 ComponentClass 的编译，每个 ANodeCompiler 对应于一个 ComponentInfo。
 */
export class ANodeCompiler<T extends 'none' | 'typed'> {
    private ssrIndex = 0
    private elementCompiler: ElementCompiler
    private inScript = false

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

        const childComponentReference = this.generateRef(aNode)
        if (childComponentReference) {
            return this.compileComponent(aNode, childComponentReference, isRootElement)
        }
        return this.compileElement(aNode, isRootElement)
    }

    private generateRef (aNode: ANode) {
        if (aNode.directives.is) {
            this.emitter.writeLine(`let ref = ctx.refs[${expr(aNode.directives.is.value)}];`)
            return 'ref'
        }
        if (this.componentInfo.childComponents.has(aNode.tagName)) {
            return this.componentInfo.childComponents.get(aNode.tagName)!.toString()
        }
    }

    private compileText (aNode: ATextNode) {
        const { emitter } = this
        const shouldEmitComment = TypeGuards.isExprTextNode(aNode.textExpr) && aNode.textExpr.original && !this.ssrOnly && !this.inScript
        const outputType = this.inScript ? 'rawhtml' : 'html'

        if (shouldEmitComment) emitter.writeHTMLLiteral('<!--s-text-->')
        emitter.writeHTMLExpression(expr(aNode.textExpr, outputType))
        if (shouldEmitComment) emitter.writeHTMLLiteral('<!--/s-text-->')
    }

    compileTemplate (aNode: ATemplateNode) {
        // if、for 等区块 wrap，只渲染内容。
        // 注意：<template> 为组件根节点时，tagName=null, isATemplateNode=false
        this.elementCompiler.inner(aNode)
    }

    compileFragment (aNode: AFragmentNode) {
        if (TypeGuards.isATextNode(aNode.children[0]) && !this.ssrOnly && !this.inScript) {
            this.emitter.writeHTMLLiteral('<!--s-frag-->')
        }
        this.elementCompiler.inner(aNode)
        if (TypeGuards.isATextNode(aNode.children[aNode.children.length - 1]) && !this.ssrOnly && !this.inScript) {
            this.emitter.writeHTMLLiteral('<!--/s-frag-->')
        }
    }

    private compileIf (aNode: AIfNode) {
        const { emitter } = this
        // output if
        const ifDirective = aNode.directives.if
        const aNodeWithoutIf = Object.assign({}, aNode)
        delete aNodeWithoutIf.directives.if
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

        const { item, index, value } = aNode.directives.for
        const list = emitter.genID('list')
        const i = emitter.genID('i')

        emitter.writeLine('let ' + list + ' = ' + expr(value) + ';')
        emitter.writeIf(list + ' instanceof Array', () => {
            // for array
            emitter.writeFor(`let ${i} = 0; ${i} < ${list}.length; ${i}++`, () => {
                if (index) emitter.writeLine(`ctx.data.${index} = ${i};`)
                emitter.writeLine(`ctx.data.${item} = ${list}[${i}];`)
                this.compile(forElementANode, false)
            })
        })

        // for object
        emitter.beginElseIf(`typeof ${list} === "object"`)
        emitter.writeFor(`let ${i} in ${list}`, () => {
            emitter.writeIf(`${list}[${i}] != null`, () => {
                if (index) emitter.writeLine(`ctx.data.${index} = ${i};`)
                emitter.writeLine(`ctx.data.${item} = ${list}[${i}];`)
                this.compile(forElementANode, false)
            })
        })
        emitter.endIf()
    }

    private compileSlot (aNode: ASlotNode) {
        const { emitter } = this
        assert(!this.inScript, '<slot> is not allowed inside <script>')

        emitter.nextLine('(')
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
            emitter.writeLine('let render = ctx.slots[slotName] || defaultRender;')
            emitter.writeLine('html += render(parentCtx, data);')
        })
        emitter.feedLine(')();')
    }

    private compileElement (aNode: ANode, isRootElement: boolean) {
        this.elementCompiler.tagStart(aNode)
        if (aNode.tagName === 'script') this.inScript = true
        if (isRootElement && !this.ssrOnly && !this.inScript) {
            this.emitter.writeIf('!noDataOutput', () => this.emitter.writeDataComment())
        }
        this.elementCompiler.inner(aNode)
        this.inScript = false
        this.elementCompiler.tagEnd(aNode)
    }

    private compileComponent (aNode: ANode, ref: string, isRootElement: boolean) {
        const { emitter } = this
        const defaultSourceSlots: ANode[] = []
        const sourceSlotCodes = new Map()

        assert(!this.inScript, 'component reference is not allowed inside <script>')

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

        const slots = emitter.genID('slots')
        emitter.writeLine(`let ${slots} = {};`)
        if (defaultSourceSlots.length) {
            emitter.nextLine(`${slots}[""] = `)
            this.compileSlotRenderer(defaultSourceSlots)
            emitter.feedLine(';')
        }

        for (const sourceSlotCode of sourceSlotCodes.values()) {
            emitter.nextLine(`${slots}[${expr(sourceSlotCode.prop.expr)}] = `)
            this.compileSlotRenderer(sourceSlotCode.children)
            emitter.feedLine(';')
        }

        const ndo = isRootElement ? 'noDataOutput' : 'true'

        emitter.nextLine('html += ')
        emitter.writeFunctionCall(
            `helpers.resolver.getRenderer(${ref})`,
            [this.componentDataCode(aNode), ndo, 'helpers', 'parentCtx', stringifier.str(aNode.tagName) + `, ${slots}`]
        )
    }

    private compileSlotRenderer (content: ANode[]) {
        const { emitter } = this
        emitter.writeAnonymousFunction(['parentCtx', 'data'], () => {
            if (!content.length) {
                emitter.writeLine('return "";')
                return
            }
            emitter.writeLine('let html = "";')
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
}
