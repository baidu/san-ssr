import { compileExprSource } from './expr-compiler'
import { ElementCompiler } from './element-compiler'
import { stringifier } from './stringifier'
import { SanComponent, isComponentLoader } from '../../models/component'
import { ANode } from '../../models/anode'
import { getANodeProps, getANodePropByName } from '../../utils/anode'

/**
* ANode 的编译方法集合对象
*/
export class ANodeCompiler {
    private elementSourceCompiler: ElementCompiler
    private ssrIndex = 0
    private component: SanComponent

    constructor (elemencompiler: ElementCompiler, component: SanComponent) {
        this.component = component
        this.elementSourceCompiler = elemencompiler
    }
    /**
     * 编译节点
     *
     * @param {JSEmitter} emitter 编译源码的中间buffer
     * @param {Object} extra 编译所需的一些额外信息
     */
    compile (aNode: ANode, emitter, extra = {}) {
        let compileMethod = 'compileElement'

        if (aNode.textExpr) {
            compileMethod = 'compileText'
        } else if (aNode.directives['if']) { // eslint-disable-line dot-notation
            compileMethod = 'compileIf'
        } else if (aNode.directives['for']) { // eslint-disable-line dot-notation
            compileMethod = 'compileFor'
        } else if (aNode.tagName === 'slot') {
            compileMethod = 'compileSlot'
        } else if (aNode.tagName === 'template') {
            compileMethod = 'compileTemplate'
        } else {
            const ComponentType = this.component.getComponentType
                ? this.component.getComponentType(aNode)
                : this.component.components[aNode.tagName]

            if (ComponentType) {
                compileMethod = 'compileComponent'
                extra['ComponentClass'] = ComponentType

                if (isComponentLoader(ComponentType)) {
                    compileMethod = 'compileComponentLoader'
                }
            }
        }
        this[compileMethod](aNode, emitter, extra)
    }

    /**
     * 编译文本节点
     *
     * @param {JSEmitter} emitter 编译源码的中间buffer
     */
    compileText (aNode: ANode, emitter) {
        if (aNode.textExpr.original) {
            emitter.writeIf('!noDataOutput', () => {
                emitter.bufferHTMLLiteral('<!--s-text-->')
            })
        }

        if (aNode.textExpr.value != null) {
            emitter.bufferHTMLLiteral(aNode.textExpr.segs[0].literal)
        } else {
            // sourceBuffer.joinExpr(aNode.textExpr)
            emitter.writeHTML(compileExprSource.expr(aNode.textExpr))
        }

        if (aNode.textExpr.original) {
            emitter.writeIf('!noDataOutput', () => {
                emitter.bufferHTMLLiteral('<!--/s-text-->')
            })
        }
    }

    /**
     * 编译template节点
     *
     * @param {JSEmitter} emitter 编译源码的中间buffer
     */
    compileTemplate (aNode: ANode, emitter) {
        this.elementSourceCompiler.inner(emitter, aNode)
    }

    /**
     * 编译 if 节点
     *
     * @param {JSEmitter} emitter 编译源码的中间buffer
     */
    compileIf (aNode: ANode, emitter) {
        // output main if
        const ifDirective = aNode.directives['if'] // eslint-disable-line dot-notation
        emitter.writeIf(compileExprSource.expr(ifDirective.value), () => {
            // emitter.writeLine(this.compile(aNode.ifRinsed, emitter))
            this.compile(aNode.ifRinsed, emitter)
        })

        // output elif and else
        for (const elseANode of aNode.elses || []) {
            const elifDirective = elseANode.directives.elif
            if (elifDirective) {
                emitter.writeLine('else if (' + compileExprSource.expr(elifDirective.value) + ') {')
            } else {
                emitter.writeLine('else {')
            }
            emitter.indent()
            // emitter.writeLine(this.compile(elseANode, emitter))
            this.compile(elseANode, emitter)
            emitter.unindent()
            emitter.writeLine('}')
        }
    }

    /**
     * 编译 for 节点
     *
     * @param {JSEmitter} emitter 编译源码的中间buffer
     */
    compileFor (aNode: ANode, emitter) {
        const forElementANode = {
            children: aNode.children,
            props: aNode.props,
            events: aNode.events,
            tagName: aNode.tagName,
            directives: { ...aNode.directives },
            hotspot: aNode.hotspot
        }
        forElementANode.directives['for'] = null

        const forDirective = aNode.directives['for'] // eslint-disable-line dot-notation
        const itemName = forDirective.item
        const indexName = forDirective.index || this.nextID()
        const listName = this.nextID()

        emitter.writeLine('var ' + listName + ' = ' + compileExprSource.expr(forDirective.value) + '')
        emitter.writeIf(listName + ' instanceof Array', () => {
            // for array
            emitter.writeFor('var ' + indexName + ' = 0; ' +
            indexName + ' < ' + listName + '.length; ' +
            indexName + '++', () => {
                emitter.writeLine('componentCtx.data.' + indexName + '=' + indexName)
                emitter.writeLine('componentCtx.data.' + itemName + '= ' + listName + '[' + indexName + ']')
                // emitter.writeLine(this.compile(forElementANode, emitter))
                this.compile(forElementANode, emitter)
            })
        })

        // for object
        emitter.beginElseIf('typeof ' + listName + ' === "object"')
        emitter.writeFor('var ' + indexName + ' in ' + listName, () => {
            emitter.writeIf(listName + '[' + indexName + '] != null', () => {
                emitter.writeLine('componentCtx.data.' + indexName + '=' + indexName + '')
                emitter.writeLine('componentCtx.data.' + itemName + '= ' + listName + '[' + indexName + ']')
                this.compile(forElementANode, emitter)
            })
        })
        emitter.endIf()
    }

    /**
     * 编译 slot 节点
     *
     * @param {JSEmitter} emitter 编译源码的中间buffer
     */
    compileSlot (aNode: ANode, emitter) {
        const rendererId = this.nextID()

        emitter.writeLine('componentCtx.slotRenderers.' + rendererId +
        ' = componentCtx.slotRenderers.' + rendererId + ' || function () {')
        emitter.indent()

        emitter.nextLine('')
        emitter.writeFunction('$defaultSlotRender', ['componentCtx'], () => {
            emitter.writeLine('var html = "";')
            for (const aNodeChild of aNode.children) {
                // emitter.writeLine(this.compile(aNodeChild, emitter))
                this.compile(aNodeChild, emitter)
            }
            emitter.writeLine('return html;')
        })

        emitter.writeLine('var $isInserted = false;')
        emitter.writeLine('var $ctxSourceSlots = componentCtx.sourceSlots;')
        emitter.writeLine('var $mySourceSlots = [];')

        const nameProp = getANodePropByName(aNode, 'name')
        if (nameProp) {
            emitter.writeLine('var $slotName = ' + compileExprSource.expr(nameProp.expr) + ';')

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
        emitter.writeLine('var $slotCtx = $isInserted ? componentCtx.owner : componentCtx;')

        if (aNode.vars || aNode.directives.bind) {
            emitter.writeLine('$slotCtx = {data: _.extend({}, $slotCtx.data), instance: $slotCtx.instance, owner: $slotCtx.owner};')

            if (aNode.directives.bind) {
                emitter.writeLine('_.extend($slotCtx.data, ' + compileExprSource.expr(aNode.directives.bind.value) + ');')
            }

            for (const varItem of aNode.vars) {
                emitter.writeLine(
                    '$slotCtx.data["' + varItem.name + '"] = ' +
                    compileExprSource.expr(varItem.expr) +
                    ';'
                )
            }
        }

        emitter.writeFor('var $renderIndex = 0; $renderIndex < $mySourceSlots.length; $renderIndex++', () => {
            emitter.writeLine('html += $mySourceSlots[$renderIndex]($slotCtx);')
        })

        emitter.unindent()
        emitter.writeLine('};')
        emitter.writeLine('componentCtx.slotRenderers.' + rendererId + '();')
    }

    /**
     * 编译普通节点
     *
     * @param {JSEmitter} emitter 编译源码的中间buffer
     * @param {Object} extra 编译所需的一些额外信息
     */
    compileElement (aNode: ANode, emitter) {
        this.elementSourceCompiler.tagStart(emitter, aNode)
        this.elementSourceCompiler.inner(emitter, aNode)
        this.elementSourceCompiler.tagEnd(emitter, aNode)
    }

    /**
     * 编译组件节点
     *
     * @param {JSEmitter} emitter 编译源码的中间buffer
     * @param {Object} extra 编译所需的一些额外信息
     * @param {Function} extra.ComponentClass 对应组件类
     */
    compileComponent (aNode: ANode, emitter, extra) {
        let dataLiteral = '{}'

        emitter.writeLine('var $sourceSlots = [];')
        if (aNode.children) {
            const defaultSourceSlots = []
            const sourceSlotCodes = {}

            for (const child of aNode.children) {
                const slotBind = !child.textExpr && getANodePropByName(child, 'slot')
                if (slotBind) {
                    if (!sourceSlotCodes[slotBind.raw]) {
                        sourceSlotCodes[slotBind.raw] = {
                            children: [],
                            prop: slotBind
                        }
                    }

                    sourceSlotCodes[slotBind.raw].children.push(child)
                } else {
                    defaultSourceSlots.push(child)
                }
            }

            if (defaultSourceSlots.length) {
                emitter.writeLine('$sourceSlots.push([function (componentCtx) {')
                emitter.indent()
                emitter.writeLine('var html = "";')
                defaultSourceSlots.forEach(child => this.compile(child, emitter))
                emitter.writeLine('return html;')
                emitter.unindent()
                emitter.writeLine('}]);')
            }

            for (const key in sourceSlotCodes) {
                const sourceSlotCode = sourceSlotCodes[key]
                emitter.writeLine('$sourceSlots.push([function (componentCtx) {')
                emitter.indent()
                emitter.writeLine('var html = "";')
                // emitter.writeLine(sourceSlotCode.children.forEach((child) => {
                //     this.compile(child, emitter)
                // }))
                sourceSlotCode.children.forEach((child) => {
                    this.compile(child, emitter)
                })
                emitter.writeLine('return html;')
                emitter.unindent()
                emitter.writeLine('}, ' + compileExprSource.expr(sourceSlotCode.prop.expr) + ']);')
            }
        }

        const givenData = []
        for (const prop of getANodeProps(aNode)) {
            givenData.push(
                compileExprSource.stringLiteralize(prop.name) +
                ':' +
                compileExprSource.expr(prop.expr)
            )
        }

        dataLiteral = '{' + givenData.join(',\n') + '}'
        if (aNode.directives.bind) {
            dataLiteral = '_.extend(' +
            compileExprSource.expr(aNode.directives.bind.value) +
            ', ' +
            dataLiteral +
            ')'
        }

        const funcName = 'sanssrRuntime.renderer' + extra.ComponentClass.sanssrCid
        emitter.nextLine(`html += ${funcName}(`)
        emitter.write(dataLiteral + ', true, sanssrRuntime, componentCtx, ' +
        stringifier.str(aNode.tagName) + ', $sourceSlots);')
        emitter.writeLine('$sourceSlots = null;')
    }

    /**
     * 编译组件加载器节点
     *
     * @param {JSEmitter} emitter 编译源码的中间buffer
     * @param {Object} extra 编译所需的一些额外信息
     * @param {Function} extra.ComponentClass 对应类
     */
    compileComponentLoader (aNode: ANode, emitter, extra) {
        const LoadingComponent = extra.ComponentClass.placeholder
        if (typeof LoadingComponent === 'function') {
            this.compileComponent(aNode, emitter, {
                ComponentClass: LoadingComponent
            })
        }
    }

    private nextID () {
        return 'sanssrId' + (this.ssrIndex++)
    }
}
