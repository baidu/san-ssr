import { PHPEmitter } from '../emitters/emitter'
import { compileExprSource } from '../compilers/expr-compiler'
import { ANode, isComponentLoader, getANodePropByName, getANodeProps } from '../..'

/**
* ANode 的编译方法集合对象
*/
export class ANodeCompiler {
    private id = 0
    private elementCompiler
    private stringifier
    private component

    constructor (component, elementCompiler, stringifier) {
        this.component = component
        this.elementCompiler = elementCompiler
        this.stringifier = stringifier
    }

    /**
     * 编译节点
     *
     * @param {Object} extra 编译所需的一些额外信息
     */
    compile (aNode: ANode, emitter: PHPEmitter, extra?) {
        extra = extra || {}
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
                extra.ComponentClass = ComponentType

                if (isComponentLoader(ComponentType)) {
                    compileMethod = 'compileComponentLoader'
                }
            }
        }

        this[compileMethod](aNode, emitter, extra)
    }

    /**
     * 编译文本节点
     */
    compileText (aNode: ANode, emitter: PHPEmitter) {
        if (aNode.textExpr.original) {
            emitter.writeIf('!$noDataOutput', () => {
                emitter.bufferHTMLLiteral('<!--s-text-->')
                emitter.clearStringLiteralBuffer()
            })
        }

        if (aNode.textExpr.value != null) {
            emitter.bufferHTMLLiteral(aNode.textExpr.segs[0].literal)
        } else {
            emitter.writeHTML(compileExprSource.expr(aNode.textExpr))
        }

        if (aNode.textExpr.original) {
            emitter.writeIf('!$noDataOutput', () => {
                emitter.bufferHTMLLiteral('<!--/s-text-->')
                emitter.clearStringLiteralBuffer()
            })
        }
    }

    /**
     * 编译template节点
     */
    compileTemplate (aNode: ANode, emitter: PHPEmitter) {
        this.elementCompiler.inner(emitter, aNode)
    }

    /**
     * 编译 if 节点
     */
    compileIf (aNode: ANode, emitter: PHPEmitter) {
        // output main if
        const ifDirective = aNode.directives['if'] // eslint-disable-line dot-notation
        emitter.writeIf(compileExprSource.expr(ifDirective.value), () => {
            this.compile(aNode.ifRinsed, emitter)
        })

        // output elif and else
        for (const elseANode of aNode.elses || []) {
            const elifDirective = elseANode.directives.elif
            if (elifDirective) {
                emitter.beginElseIf(compileExprSource.expr(elifDirective.value))
            } else {
                emitter.beginElse()
            }

            this.compile(elseANode, emitter)
            emitter.endBlock()
        }
    }

    /**
     * 编译 for 节点
     */
    compileFor (aNode: ANode, emitter: PHPEmitter) {
        const forElementANode: ANode = {
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

        emitter.writeLine('$' + listName + ' = ' + compileExprSource.expr(forDirective.value) + ';')
        emitter.writeIf(`is_array($${listName}) || is_object($${listName})`, () => {
            emitter.writeForeach(`$${listName} as $${indexName} => $value`, () => {
                emitter.writeLine(`$ctx->data->${indexName} = $${indexName};`)
                emitter.writeLine(`$ctx->data->${itemName} = $value;`)
                this.compile(forElementANode, emitter)
            })
        })
    }

    /**
     * 编译 slot 节点
     */
    compileSlot (aNode: ANode, emitter: PHPEmitter) {
        const rendererId = this.nextID()

        emitter.writeIf(`!isset($ctx->slotRenderers["${rendererId}"])`, () => {
            emitter.carriageReturn()
            emitter.write(`$ctx->slotRenderers["${rendererId}"] = `)
            emitter.writeAnonymousFunction([], ['&$ctx', '&$html'], () => {
                emitter.carriageReturn()
                emitter.write('$defaultSlotRender = ')
                emitter.writeAnonymousFunction(['$ctx'], [], () => {
                    emitter.writeLine('$html = "";')
                    for (const aNodeChild of aNode.children) this.compile(aNodeChild, emitter)
                    emitter.writeLine('return $html;')
                })
                emitter.write(';')

                emitter.writeLine('$isInserted = false;')
                emitter.writeLine('$ctxSourceSlots = $ctx->sourceSlots;')
                emitter.writeLine('$mySourceSlots = [];')

                const nameProp = getANodePropByName(aNode, 'name')
                if (nameProp) {
                    emitter.writeLine('$slotName = ' + compileExprSource.expr(nameProp.expr) + ';')

                    emitter.writeForeach('$ctxSourceSlots as $i => $slot', () => {
                        emitter.writeIf('count($slot) > 1 && $slot[1] == $slotName', () => {
                            emitter.writeLine('array_push($mySourceSlots, $slot[0]);')
                            emitter.writeLine('$isInserted = true;')
                        })
                    })
                } else {
                    emitter.writeIf('count($ctxSourceSlots) > 0 && !isset($ctxSourceSlots[0][1])', () => {
                        emitter.writeLine('array_push($mySourceSlots, $ctxSourceSlots[0][0]);')
                        emitter.writeLine('$isInserted = true;')
                    })
                }

                emitter.writeIf('!$isInserted', () => {
                    emitter.writeLine('array_push($mySourceSlots, $defaultSlotRender);')
                })
                emitter.writeLine('$slotCtx = $isInserted ? $ctx->owner : $ctx;')

                if (aNode.vars || aNode.directives.bind) {
                    emitter.writeLine('$slotCtx = (object)["sanssrCid" => $slotCtx->sanssrCid, "data" => $slotCtx->data, "instance" => $slotCtx->instance, "owner" => $slotCtx->owner];')

                    if (aNode.directives.bind) {
                        emitter.writeLine('_::extend($slotCtx->data, ' + compileExprSource.expr(aNode.directives.bind.value) + ');'); // eslint-disable-line
                    }

                    for (const varItem of aNode.vars) {
                        emitter.writeLine(
                            '$slotCtx->data->' + varItem.name + ' = ' +
                            compileExprSource.expr(varItem.expr) + ';'
                        )
                    }
                }

                emitter.writeForeach('$mySourceSlots as $renderIndex => $slot', () => {
                    emitter.writeHTML('$slot($slotCtx);')
                })
            })
            emitter.write(';')
            emitter.writeNewLine()
        })
        emitter.writeLine(`call_user_func($ctx->slotRenderers["${rendererId}"]);`)
    }

    /**
     * 编译普通节点
     */
    compileElement (aNode, emitter) {
        this.elementCompiler.tagStart(emitter, aNode)
        this.elementCompiler.inner(emitter, aNode)
        this.elementCompiler.tagEnd(emitter, aNode)
    }

    /**
     * 编译组件节点
     *
     * @param {Object} extra 编译所需的一些额外信息
     * @param {Function} extra.ComponentClass 对应组件类
     */
    compileComponent (aNode: ANode, emitter: PHPEmitter, extra) {
        let dataLiteral = '(object)[]'

        emitter.writeLine('$sourceSlots = [];')
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
                emitter.nextLine('array_push($sourceSlots, [')
                emitter.writeAnonymousFunction(['$ctx'], [], () => {
                    emitter.writeLine('$html = "";')
                    defaultSourceSlots.forEach(child => this.compile(child, emitter))
                    emitter.writeLine('return $html;')
                })
                emitter.feedLine(']);')
            }

            for (const key in sourceSlotCodes) {
                const sourceSlotCode = sourceSlotCodes[key]
                emitter.nextLine('array_push($sourceSlots, [')
                emitter.writeAnonymousFunction(['$ctx'], [], () => {
                    emitter.writeLine('$html = "";')
                    sourceSlotCode.children.forEach(child => this.compile(child, emitter))
                    emitter.writeLine('return $html;')
                })
                emitter.feedLine(', ' + compileExprSource.expr(sourceSlotCode.prop.expr) + ']);')
            }
        }

        const givenData = []
        for (const prop of getANodeProps(aNode)) {
            const key = compileExprSource.stringLiteralize(prop.name)
            const val = compileExprSource.expr(prop.expr)
            givenData.push(`${key} => ${val}`)
        }

        dataLiteral = '(object)[' + givenData.join(',\n') + ']'
        if (aNode.directives.bind) {
            dataLiteral = '_::extend(' +
            compileExprSource.expr(aNode.directives.bind.value) +
            ', ' +
            dataLiteral +
            ')'
        }

        const renderId = 'sanssrRenderer' + extra.ComponentClass.sanssrCid
        emitter.nextLine(`$html .= `)
        emitter.writeFunctionCall(renderId, [dataLiteral, 'true', '$ctx', this.stringifier.str(aNode.tagName), '$sourceSlots'])
        emitter.feedLine(';')
        emitter.writeLine('$sourceSlots = null;')
    }

    /**
     * 编译组件加载器节点
     *
     * @param {Object} extra 编译所需的一些额外信息
     * @param {Function} extra.ComponentClass 对应类
     */
    compileComponentLoader (aNode: ANode, emitter: PHPEmitter, extra) {
        const LoadingComponent = extra.ComponentClass.placeholder
        if (typeof LoadingComponent === 'function') {
            this.compileComponent(aNode, emitter, {
                ComponentClass: LoadingComponent
            })
        }
    }

    private nextID () {
        return 'sanssrId' + (this.id++)
    }
}
