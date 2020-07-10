import { expr } from './expr-compiler'
import { camelCase } from 'lodash'
import { JSEmitter } from '../js-emitter'
import { ANode, AIfNode, AForNode, ASlotNode, ATemplateNode, AFragmentNode, ATextNode } from 'san'
import { ComponentInfo } from '../../models/component-info'
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
            return this.compileComponent(aNode, ref.id, isRootElement)
        }
        return this.compileElement(aNode, isRootElement)
    }

    private compileText (aNode: ATextNode) {
        const { emitter } = this
        const shouldEmitComment = TypeGuards.isExprTextNode(aNode.textExpr) && aNode.textExpr.original && !this.ssrOnly

        if (shouldEmitComment) emitter.writeHTMLLiteral('<!--s-text-->')
        emitter.writeHTMLExpression(expr(aNode.textExpr))
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
        const rendererId = this.nextID()

        emitter.writeLine('ctx.slotRenderers.' + rendererId +
        ' = ctx.slotRenderers.' + rendererId + ' || function () {')
        emitter.indent()

        emitter.nextLine('')
        emitter.writeFunction('$defaultSlotRender', ['ctx', 'currentCtx'], () => {
            emitter.writeLine('var html = "";')
            for (const aNodeChild of aNode.children) {
                this.compile(aNodeChild, false)
            }
            emitter.writeLine('return html;')
        })

        emitter.writeLine('var $isInserted = false;')
        emitter.writeLine('var $ctxSourceSlots = ctx.sourceSlots;')
        emitter.writeLine('var $mySourceSlots = [];')

        const nameProp = getANodePropByName(aNode, 'name')
        if (nameProp) {
            emitter.writeLine('var $slotName = ' + expr(nameProp.expr) + ';')

            emitter.writeFor('var $i = 0; $i < $ctxSourceSlots.length; $i++', () => {
                emitter.writeIf('$ctxSourceSlots[$i][1] == $slotName', () => {
                    emitter.writeLine('$mySourceSlots.push($ctxSourceSlots[$i][0]);')
                    emitter.writeLine('$isInserted = true;')
                })
            })
        } else {
            emitter.writeIf('$ctxSourceSlots[0] && $ctxSourceSlots[0][1] == null', () => {
                emitter.writeLine('$mySourceSlots.push($ctxSourceSlots[0][0]);')
                emitter.writeLine('$isInserted = true;')
            })
        }

        emitter.writeLine('if (!$isInserted) { $mySourceSlots.push($defaultSlotRender); }')
        emitter.writeLine('var $slotCtx = $isInserted ? ctx.owner : ctx;')

        if (aNode.vars || aNode.directives.bind) {
            emitter.writeLine('$slotCtx = {data: _.extend({}, $slotCtx.data), instance: $slotCtx.instance, owner: $slotCtx.owner};')
        }
        if (aNode.directives.bind) {
            emitter.writeLine('_.extend($slotCtx.data, ' + expr(aNode.directives.bind.value) + ');')
        }
        for (const item of aNode.vars || []) {
            const line = `$slotCtx.data["${item.name}"] = ${expr(item.expr)};`
            emitter.writeLine(line)
        }

        emitter.writeFor('var $renderIndex = 0; $renderIndex < $mySourceSlots.length; $renderIndex++', () => {
            emitter.writeLine('html += $mySourceSlots[$renderIndex]($slotCtx, currentCtx);')
        })

        emitter.unindent()
        emitter.writeLine('};')
        emitter.writeLine(`ctx.slotRenderers.${rendererId}();`)
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

    private compileComponent (aNode: ANode, cid: string, isRootElement: boolean) {
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

        emitter.writeLine('var $sourceSlots = [];')
        if (defaultSourceSlots.length) {
            emitter.nextLine('$sourceSlots.push([')
            this.compileSlotRenderer(defaultSourceSlots)
            emitter.feedLine(']);')
        }

        for (const sourceSlotCode of sourceSlotCodes.values()) {
            emitter.writeLine('$sourceSlots.push([')
            this.compileSlotRenderer(sourceSlotCode.children)
            emitter.writeLine(', ' + expr(sourceSlotCode.prop.expr) + ']);')
        }

        const ndo = isRootElement ? 'noDataOutput' : 'true'
        const funcName = 'sanSSRRuntime.renderer' + cid
        emitter.nextLine(`html += ${funcName}(`)
        emitter.write(this.componentDataCode(aNode) + `, ${ndo}, sanSSRRuntime, ctx, currentCtx, ` +
        stringifier.str(aNode.tagName) + ', $sourceSlots);')
        emitter.writeLine('$sourceSlots = null;')
    }

    private compileSlotRenderer (slots: ANode[]) {
        const { emitter } = this
        emitter.writeAnonymousFunction(['ctx', 'currentCtx'], () => {
            emitter.writeLine('var html = "";')
            for (const slot of slots) this.compile(slot, false)
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
        return bindDirective ? `_.extend(${expr(bindDirective.value)}, ${givenData})` : givenData
    }

    private nextID () {
        return 'sanSSRID' + (this.ssrIndex++)
    }
}
