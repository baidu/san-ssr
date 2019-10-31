import { PHPEmitter } from '../emitters/php-emitter'
import { camelCase } from 'lodash'
import { ExpressionEmitter } from '../emitters/expression-emitter'

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

    private nextID () {
        return 'sanssrId' + (this.id++)
    }

    /**
    * 对属性信息进行处理
    * 对组件的 binds 或者特殊的属性（比如 input 的 checked）需要处理
    *
    * 扁平化：
    * 当 text 解析只有一项时，要么就是 string，要么就是 interp
    * interp 有可能是绑定到组件属性的表达式，不希望被 eval text 成 string
    * 所以这里做个处理，只有一项时直接抽出来
    *
    * bool属性：
    * 当绑定项没有值时，默认为true
    *
    * @param {Object} prop 属性对象
    */
    postProp (prop) {
        let expr = prop.expr

        if (expr.type === 7) {
            switch (expr.segs.length) {
            case 0:
                if (prop.raw == null) {
                    prop.expr = {
                        type: 3,
                        value: true
                    }
                }
                break

            case 1:
                expr = prop.expr = expr.segs[0]
                if (expr.type === 5 && expr.filters.length === 0) {
                    prop.expr = expr.expr
                }
            }
        }
    }

    /**
     * 编译节点
     *
     * @param {ANode} aNode 抽象节点
     * @param {PHPEmitter} emitter 编译源码的中间buffer
     * @param {Object} extra 编译所需的一些额外信息
     */
    compile (aNode, emitter, extra?) {
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

                if (this.isComponentLoader(ComponentType)) {
                    compileMethod = 'compileComponentLoader'
                }
            }
        }

        this[compileMethod](aNode, emitter, extra)
    }

    /**
     * 编译文本节点
     *
     * @param aNode 节点对象
     * @param emitter 编译源码的中间buffer
     */
    compileText (aNode, emitter) {
        if (aNode.textExpr.original) {
            emitter.bufferHTMLLiteral('<!--s-text-->')
        }

        if (aNode.textExpr.value != null) {
            emitter.bufferHTMLLiteral(aNode.textExpr.segs[0].literal)
        } else {
            emitter.writeHTML(ExpressionEmitter.expr(aNode.textExpr))
        }

        if (aNode.textExpr.original) {
            emitter.bufferHTMLLiteral('<!--/s-text-->')
        }
    }

    /**
     * 编译template节点
     *
     * @param {ANode} aNode 节点对象
     * @param emitter 编译源码的中间buffer
     */
    compileTemplate (aNode, emitter: PHPEmitter) {
        this.elementCompiler.inner(emitter, aNode)
    }

    /**
     * 编译 if 节点
     *
     * @param {ANode} aNode 节点对象
     * @param emitter 编译源码的中间buffer
     */
    compileIf (aNode, emitter: PHPEmitter) {
        // output main if
        const ifDirective = aNode.directives['if'] // eslint-disable-line dot-notation
        emitter.writeIf(ExpressionEmitter.expr(ifDirective.value), () => {
            this.compile(aNode.ifRinsed, emitter)
        })

        // output elif and else
        for (const elseANode of aNode.elses || []) {
            const elifDirective = elseANode.directives.elif
            if (elifDirective) {
                emitter.beginElseIf(ExpressionEmitter.expr(elifDirective.value))
            } else {
                emitter.beginElse()
            }

            this.compile(elseANode, emitter)
            emitter.endBlock()
        }
    }

    /**
     * 编译 for 节点
     *
     * @param {ANode} aNode 节点对象
     * @param {PHPEmitter} emitter 编译源码的中间buffer
     */
    compileFor (aNode, emitter) {
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

        emitter.writeLine('$' + listName + ' = ' + ExpressionEmitter.expr(forDirective.value) + ';')
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
    compileSlot (aNode, emitter: PHPEmitter) {
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

                const nameProp = this.getANodeProp(aNode, 'name')
                if (nameProp) {
                    emitter.writeLine('$slotName = ' + ExpressionEmitter.expr(nameProp.expr) + ';')

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
                        emitter.writeLine('_::extend($slotCtx->data, ' + ExpressionEmitter.expr(aNode.directives.bind.value) + ');'); // eslint-disable-line
                    }

                    for (const varItem of aNode.vars) {
                        emitter.writeLine(
                            '$slotCtx->data->' + varItem.name + ' = ' +
                            ExpressionEmitter.expr(varItem.expr) + ';'
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
     * @param {ANode} aNode 节点对象
     * @param {PHPEmitter} emitter 编译源码的中间buffer
     * @param {Object} extra 编译所需的一些额外信息
     * @param {Function} extra.ComponentClass 对应组件类
     */
    compileComponent (aNode, emitter, extra) {
        let dataLiteral = '(object)[]'

        emitter.writeLine('$sourceSlots = [];')
        if (aNode.children) {
            const defaultSourceSlots = []
            const sourceSlotCodes = {}

            for (const child of aNode.children) {
                const slotBind = !child.textExpr && this.getANodeProp(child, 'slot')
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
                emitter.feedLine(', ' + ExpressionEmitter.expr(sourceSlotCode.prop.expr) + ']);')
            }
        }

        const givenData = []
        for (const prop of this.camelComponentBinds(aNode.props)) {
            this.postProp(prop)
            const key = ExpressionEmitter.stringLiteralize(prop.name)
            const val = ExpressionEmitter.expr(prop.expr)
            givenData.push(`${key} => ${val}`)
        }

        dataLiteral = '(object)[' + givenData.join(',\n') + ']'
        if (aNode.directives.bind) {
            dataLiteral = '_::extend(' +
            ExpressionEmitter.expr(aNode.directives.bind.value) +
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
     * @param {ANode} aNode 节点对象
     * @param {PHPEmitter} emitter 编译源码的中间buffer
     * @param {Object} extra 编译所需的一些额外信息
     * @param {Function} extra.ComponentClass 对应类
     */
    compileComponentLoader (aNode, emitter, extra) {
        const LoadingComponent = extra.ComponentClass.placeholder
        if (typeof LoadingComponent === 'function') {
            this.compileComponent(aNode, emitter, {
                ComponentClass: LoadingComponent
            })
        }
    }

    private isComponentLoader (cmpt) {
        return cmpt && cmpt.hasOwnProperty('load') && cmpt.hasOwnProperty('placeholder')
    }

    /**
    * 获取 ANode props 数组中相应 name 的项
    *
    * @param {Object} aNode ANode对象
    * @param {string} name name属性匹配串
    */
    private getANodeProp (aNode, name) {
        const index = aNode.hotspot.props[name]
        if (index != null) {
            return aNode.props[index]
        }
    }

    /**
    * 将 binds 的 name 从 kebabcase 转换成 camelcase
    *
    * @param {Array} binds binds集合
    * @return {Array}
    */
    camelComponentBinds (binds) {
        const result = []
        for (const bind of binds) {
            result.push({
                name: camelCase(bind.name),
                expr: bind.expr,
                x: bind.x,
                raw: bind.raw
            })
        }
        return result
    }
}
