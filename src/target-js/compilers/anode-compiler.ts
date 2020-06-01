import { stringLiteralize, expr } from './expr-compiler'
import { ComponentTree } from '../../models/component-tree'
import { JSEmitter } from '../emitters/emitter'
import { ANode, ExprStringNode, AIfNode, AForNode, ASlotNode, ATemplateNode, AFragmentNode, ATextNode } from 'san'
import { ComponentInfo } from '../../models/component-info'
import { ElementCompiler } from './element-compiler'
import { stringifier } from './stringifier'
import { getANodeProps, getANodePropByName } from '../../utils/anode-util'
import * as TypeGuards from '../../utils/type-guards'

/**
 * ANode 编译
 *
 * 负责单个 ComponentClass 的编译，每个 ANodeCompiler 对应于一个 ComponentInfo。
 */
export class ANodeCompiler {
    private ssrIndex = 0
    private elementCompiler: ElementCompiler

    constructor (
        private owner: ComponentInfo,
        private tree: ComponentTree,
        noTemplateOutput: boolean,
        public emitter: JSEmitter
    ) {
        this.elementCompiler = new ElementCompiler(
            owner,
            tree,
            noTemplateOutput,
            this,
            emitter
        )
    }

    compile (aNode: ANode, parentNode: ANode | undefined, needOutputData: boolean) {
        if (TypeGuards.isATextNode(aNode)) return this.compileText(aNode, parentNode)
        if (TypeGuards.isAIfNode(aNode)) return this.compileIf(aNode)
        if (TypeGuards.isAForNode(aNode)) return this.compileFor(aNode)
        if (TypeGuards.isASlotNode(aNode)) return this.compileSlot(aNode)
        if (TypeGuards.isATemplateNode(aNode)) return this.compileTemplate(aNode)
        if (TypeGuards.isAFragmentNode(aNode)) return this.compileTemplate(aNode)

        const ComponentClass = this.owner.getChildComponentClass(aNode)
        if (ComponentClass) {
            const info = this.tree.addComponentClass(ComponentClass)
            return info ? this.compileComponent(aNode, info, needOutputData) : undefined
        }
        return this.compileElement(aNode, needOutputData)
    }

    private compileText (aNode: ATextNode, parentNode: ANode | undefined) {
        const { emitter } = this
        if (parentNode && TypeGuards.isAFragmentNode(parentNode) && parentNode.children[0] === aNode) {
            emitter.writeHTMLLiteral('<!--s-frag-->')
        }
        if (aNode.textExpr.original) {
            emitter.writeIf('!noDataOutput', () => {
                emitter.writeHTMLLiteral('<!--s-text-->')
            })
        }

        if (aNode.textExpr.value != null) {
            emitter.writeHTMLLiteral((aNode.textExpr.segs[0] as ExprStringNode).literal!)
        } else {
            emitter.writeHTMLExpression(expr(aNode.textExpr))
        }

        if (aNode.textExpr.original) {
            emitter.writeIf('!noDataOutput', () => {
                emitter.writeHTMLLiteral('<!--/s-text-->')
            })
        }
        if (parentNode && TypeGuards.isAFragmentNode(parentNode) && parentNode.children[parentNode.children.length - 1] === aNode) {
            emitter.writeHTMLLiteral('<!--s-frag-->')
        }
    }

    compileTemplate (aNode: ATemplateNode | AFragmentNode) {
        this.elementCompiler.inner(aNode)
    }

    private compileIf (aNode: AIfNode) {
        const { emitter } = this
        // output if
        const ifDirective = aNode.directives['if'] // eslint-disable-line dot-notation
        emitter.writeIf(expr(ifDirective.value), () => this.compile(aNode.ifRinsed, aNode, false))

        // output elif and else
        for (const elseANode of aNode.elses || []) {
            const elifDirective = elseANode.directives.elif
            if (elifDirective) {
                emitter.writeLine('else if (' + expr(elifDirective.value) + ') {')
            } else {
                emitter.writeLine('else {')
            }
            emitter.indent()
            this.compile(elseANode, aNode, false)
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
                this.compile(forElementANode, aNode, false)
            })
        })

        // for object
        emitter.beginElseIf('typeof ' + listName + ' === "object"')
        emitter.writeFor('var ' + indexName + ' in ' + listName, () => {
            emitter.writeIf(listName + '[' + indexName + '] != null', () => {
                emitter.writeLine('ctx.data.' + indexName + '=' + indexName + ';')
                emitter.writeLine('ctx.data.' + itemName + '= ' + listName + '[' + indexName + '];')
                this.compile(forElementANode, aNode, false)
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
        emitter.writeFunction('$defaultSlotRender', ['ctx', 'currentCtx'], () => {
            emitter.writeLine('var html = "";')
            for (const aNodeChild of aNode.children) {
                this.compile(aNodeChild, aNode, false)
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
            emitter.writeLine('html += $mySourceSlots[$renderIndex]($slotCtx, currentCtx);')
        })

        emitter.unindent()
        emitter.writeLine('};')
        emitter.writeLine('ctx.slotRenderers.' + rendererId + '();')
    }

    private compileElement (aNode: ANode, needOutputData: boolean) {
        this.elementCompiler.tagStart(aNode)
        if (needOutputData) this.outputData()
        this.elementCompiler.inner(aNode)
        this.elementCompiler.tagEnd(aNode)
    }

    private outputData () {
        this.emitter.writeIf('!noDataOutput', () => this.emitter.writeDataComment())
    }

    private compileComponent (aNode: ANode, info: ComponentInfo, needOutputData: boolean) {
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
            emitter.nextLine('$sourceSlots.push([')
            this.compileSlotRenderer(defaultSourceSlots, aNode)
            emitter.feedLine(']);')
        }

        for (const sourceSlotCode of sourceSlotCodes.values()) {
            emitter.writeLine('$sourceSlots.push([')
            this.compileSlotRenderer(sourceSlotCode.children, aNode)
            emitter.writeLine(', ' + expr(sourceSlotCode.prop.expr) + ']);')
        }

        const ndo = needOutputData ? 'noDataOutput' : 'true'
        const funcName = 'sanssrRuntime.renderer' + info.cid
        emitter.nextLine(`html += ${funcName}(`)
        emitter.write(this.componentDataCode(aNode) + `, ${ndo}, sanssrRuntime, ctx, currentCtx, ` +
        stringifier.str(aNode.tagName) + ', $sourceSlots);')
        emitter.writeLine('$sourceSlots = null;')
    }

    private compileSlotRenderer (slots: ANode[], parentANode: ANode) {
        const { emitter } = this
        emitter.writeAnonymousFunction(['ctx', 'currentCtx'], () => {
            emitter.writeLine('var html = "";')
            for (const slot of slots) this.compile(slot, parentANode, false)
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
