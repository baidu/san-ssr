import { stringLiteralize, expr } from './expr-compiler'
import { ComponentTree } from '../../models/component-tree'
import { JSEmitter } from '../emitters/emitter'
import { ANode, ExprStringNode, AIfNode, AForNode, ASlotNode, ATemplateNode, ATextNode } from 'san'
import { ComponentInfo } from '../../models/component-info'
import { ElementCompiler } from './element-compiler'
import { stringifier } from './stringifier'
import { getANodeProps, getANodePropByName } from '../../utils/anode-util'
import * as TypeGuards from '../../utils/type-guards'

/**
* ANode 的编译方法集合对象
*/
export class ANodeCompiler {
    private ssrIndex = 0

    constructor (
        private owner: ComponentInfo,
        private root: ComponentTree,
        private elementSourceCompiler: ElementCompiler,
        public emitter: JSEmitter
    ) {
    }

    compile (aNode: ANode) {
        if (TypeGuards.isATextNode(aNode)) return this.compileText(aNode)
        if (TypeGuards.isAIfNode(aNode)) return this.compileIf(aNode)
        if (TypeGuards.isAForNode(aNode)) return this.compileFor(aNode)
        if (TypeGuards.isASlotNode(aNode)) return this.compileSlot(aNode)
        if (TypeGuards.isATemplateNode(aNode)) return this.compileTemplate(aNode)

        const ComponentClass = this.owner.getChildComponentClass(aNode)
        if (ComponentClass) {
            const info = this.root.addComponentClass(ComponentClass)
            return info ? this.compileComponent(aNode, info) : undefined
        }
        return this.compileElement(aNode)
    }

    compileText (aNode: ATextNode) {
        const { emitter } = this
        if (aNode.textExpr.original) {
            emitter.writeIf('!noDataOutput', () => {
                emitter.bufferHTMLLiteral('<!--s-text-->')
            })
        }

        if (aNode.textExpr.value != null) {
            emitter.bufferHTMLLiteral((aNode.textExpr.segs[0] as ExprStringNode).literal!)
        } else {
            emitter.writeHTML(expr(aNode.textExpr))
        }

        if (aNode.textExpr.original) {
            emitter.writeIf('!noDataOutput', () => {
                emitter.bufferHTMLLiteral('<!--/s-text-->')
            })
        }
    }

    compileTemplate (aNode: ATemplateNode) {
        this.elementSourceCompiler.inner(aNode)
    }

    compileIf (aNode: AIfNode) {
        const { emitter } = this
        // output if
        const ifDirective = aNode.directives['if'] // eslint-disable-line dot-notation
        emitter.writeIf(expr(ifDirective.value), () => this.compile(aNode.ifRinsed))

        // output elif and else
        for (const elseANode of aNode.elses || []) {
            const elifDirective = elseANode.directives.elif
            if (elifDirective) {
                emitter.writeLine('else if (' + expr(elifDirective.value) + ') {')
            } else {
                emitter.writeLine('else {')
            }
            emitter.indent()
            this.compile(elseANode)
            emitter.unindent()
            emitter.writeLine('}')
        }
    }

    compileFor (aNode: AForNode) {
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
                this.compile(forElementANode)
            })
        })

        // for object
        emitter.beginElseIf('typeof ' + listName + ' === "object"')
        emitter.writeFor('var ' + indexName + ' in ' + listName, () => {
            emitter.writeIf(listName + '[' + indexName + '] != null', () => {
                emitter.writeLine('ctx.data.' + indexName + '=' + indexName + ';')
                emitter.writeLine('ctx.data.' + itemName + '= ' + listName + '[' + indexName + '];')
                this.compile(forElementANode)
            })
        })
        emitter.endIf()
    }

    /**
     * 编译 slot 节点
     */
    compileSlot (aNode: ASlotNode) {
        const { emitter } = this
        const rendererId = this.nextID()

        emitter.writeLine('ctx.slotRenderers.' + rendererId +
        ' = ctx.slotRenderers.' + rendererId + ' || function () {')
        emitter.indent()

        emitter.nextLine('')
        emitter.writeFunction('$defaultSlotRender', ['ctx'], () => {
            emitter.writeLine('var html = "";')
            for (const aNodeChild of aNode.children) {
                this.compile(aNodeChild)
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
        if (aNode.vars) {
            for (const varItem of aNode.vars) {
                emitter.writeLine(
                    '$slotCtx.data["' + varItem.name + '"] = ' +
                    expr(varItem.expr) +
                    ';'
                )
            }
        }

        emitter.writeFor('var $renderIndex = 0; $renderIndex < $mySourceSlots.length; $renderIndex++', () => {
            emitter.writeLine('html += $mySourceSlots[$renderIndex]($slotCtx);')
        })

        emitter.unindent()
        emitter.writeLine('};')
        emitter.writeLine('ctx.slotRenderers.' + rendererId + '();')
    }

    compileElement (aNode: ANode) {
        this.elementSourceCompiler.tagStart(aNode)
        this.elementSourceCompiler.inner(aNode)
        this.elementSourceCompiler.tagEnd(aNode)
    }

    private compileComponent (aNode: ANode, info: ComponentInfo) {
        const { emitter } = this

        const defaultSourceSlots: ANode[] = []
        const sourceSlotCodes = new Map()

        for (const child of aNode.children!) { // nodes without children (like pATextNode) has been taken over by other methods
            const slotBind = !child.textExpr && getANodePropByName(child, 'slot')
            if (slotBind) {
                if (!sourceSlotCodes.has(slotBind.raw)) {
                    sourceSlotCodes.set(slotBind.raw, {
                        children: [],
                        prop: slotBind
                    })
                }
                sourceSlotCodes.get(slotBind.raw).children.push(child)
            } else {
                defaultSourceSlots.push(child)
            }
        }

        emitter.writeLine('var $sourceSlots = [];')
        if (defaultSourceSlots.length) {
            emitter.writeLine('$sourceSlots.push([')
            this.compileSlotRenderer(defaultSourceSlots)
            emitter.writeLine(']);')
        }

        for (const sourceSlotCode of sourceSlotCodes.values()) {
            emitter.writeLine('$sourceSlots.push([')
            this.compileSlotRenderer(sourceSlotCode.children)
            emitter.writeLine(', ' + expr(sourceSlotCode.prop.expr) + ']);')
        }

        const funcName = 'sanssrRuntime.renderer' + info.cid
        emitter.nextLine(`html += ${funcName}(`)
        emitter.write(this.componentDataCode(aNode) + ', true, sanssrRuntime, ctx, ' +
        stringifier.str(aNode.tagName) + ', $sourceSlots);')
        emitter.writeLine('$sourceSlots = null;')
    }

    private compileSlotRenderer (slots: ANode[]) {
        const { emitter } = this
        emitter.writeAnonymousFunction(['ctx'], () => {
            emitter.writeLine('var html = "";')
            for (const slot of slots) this.compile(slot)
            emitter.writeLine('return html;')
        })
    }

    private componentDataCode (aNode: ANode) {
        const givenData = '{' + getANodeProps(aNode).map(prop => {
            const key = stringLiteralize(prop.name)
            const val = expr(prop.expr)
            return `${key}: ${val}`
        }).join(', ') + '}'

        const bindDirective = aNode.directives.bind
        return bindDirective ? `_.extend(${expr(bindDirective.value)}, ${givenData})` : givenData
    }

    private nextID () {
        return 'sanssrId' + (this.ssrIndex++)
    }
}
