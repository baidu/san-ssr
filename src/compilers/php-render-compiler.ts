/**
 * 将组件树编译成 render 函数之间的递归调用
 * 提供 generateRenderModule 方法
 */
import { each, extend } from '../utils/underscore'
import { PHPEmitter } from '../emitters/php-emitter'
import { ExpressionEmitter } from '../emitters/expression-emitter'

/**
* 将字符串逗号切分返回对象
*
* @param {string} source 源字符串
* @return {Object}
*/
function splitStr2Obj (source) {
    const result = {}
    each(
        source.split(','),
        function (key) {
            result[key] = key
        }
    )
    return result
}

/**
* 自闭合标签列表
*
* @type {Object}
*/
const autoCloseTags = splitStr2Obj('area,base,br,col,embed,hr,img,input,keygen,param,source,track,wbr')

/**
* 把 kebab case 字符串转换成 camel case
*
* @param {string} source 源字符串
* @return {string}
*/
function kebab2camel (source) {
    return source.replace(/-+(.)/ig, function (match, alpha) {
        return alpha.toUpperCase()
    })
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
function postProp (prop) {
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

function defaultStyleFilter (source) {
    if (typeof source === 'object') {
        let result = ''
        for (const key in source) {
            /* istanbul ignore else  */
            if (source.hasOwnProperty(key)) {
                result += key + ':' + source[key] + ';'
            }
        }

        return result
    }

    return source
}

/**
* 默认filter
*
* @const
* @type {Object}
*/
const DEFAULT_FILTERS = {

    /**
     * URL编码filter
     *
     * @param {string} source 源串
     * @return {string} 替换结果串
     */
    url: encodeURIComponent,

    _class: function (source) {
        if (source instanceof Array) {
            return source.join(' ')
        }

        return source
    },
    _style: defaultStyleFilter,

    _xclass: function (outer, inner) {
        if (outer instanceof Array) {
            outer = outer.join(' ')
        }

        if (outer) {
            return inner ? inner + ' ' + outer : outer
        }
        return inner
    },

    _xstyle: function (outer, inner) {
        outer = outer && defaultStyleFilter(outer)
        if (outer) {
            return inner ? inner + ';' + outer : outer
        }
        return inner
    }
}
/* eslint-enable fecs-camelcase */

/**
* 计算表达式的值
*
* @param {Object} expr 表达式对象
* @param {Data} data 数据容器对象
* @param {Component=} owner 所属组件环境
* @return {*}
*/
function evalExpr (expr, data, owner?) {
    if (expr.value != null) {
        return expr.value
    }

    let value

    switch (expr.type) {
    case 13:
        return null

    case 9:
        value = evalExpr(expr.expr, data, owner)
        switch (expr.operator) {
        case 33:
            value = !value
            break

        case 45:
            value = 0 - value
            break
        }
        return value

    case 8:
        value = evalExpr(expr.segs[0], data, owner)
        const rightValue = evalExpr(expr.segs[1], data, owner)

        /* eslint-disable eqeqeq */
        switch (expr.operator) {
        case 37:
            value = value % rightValue
            break

        case 43:
            value = value + rightValue
            break

        case 45:
            value = value - rightValue
            break

        case 42:
            value = value * rightValue
            break

        case 47:
            value = value / rightValue
            break

        case 60:
            value = value < rightValue
            break

        case 62:
            value = value > rightValue
            break

        case 76:
            value = value && rightValue
            break

        case 94:
            value = value != rightValue
            break

        case 121:
            value = value <= rightValue
            break

        case 122:
            value = value == rightValue
            break

        case 123:
            value = value >= rightValue
            break

        case 155:
            value = value !== rightValue
            break

        case 183:
            value = value === rightValue
            break

        case 248:
            value = value || rightValue
            break
        }
        /* eslint-enable eqeqeq */
        return value

    case 10:
        return evalExpr(
            expr.segs[evalExpr(expr.segs[0], data, owner) ? 1 : 2],
            data,
            owner
        )

    case 12:
        value = []
        for (let i = 0, l = expr.items.length; i < l; i++) {
            const item = expr.items[i]
            const itemValue = evalExpr(item.expr, data, owner)

            if (item.spread) {
                itemValue && (value = value.concat(itemValue))
            } else {
                value.push(itemValue)
            }
        }
        return value

    case 11:
        value = {}
        for (let i = 0, l = expr.items.length; i < l; i++) {
            const item = expr.items[i]
            const itemValue = evalExpr(item.expr, data, owner)

            if (item.spread) {
                itemValue && extend(value, itemValue)
            } else {
                value[evalExpr(item.name, data, owner)] = itemValue
            }
        }
        return value

    case 4:
        return data.get(expr)

    case 5:
        value = evalExpr(expr.expr, data, owner)

        if (owner) {
            for (let i = 0, l = expr.filters.length; i < l; i++) {
                const filter = expr.filters[i]
                const filterName = filter.name.paths[0].value

                switch (filterName) {
                case 'url':
                case '_class':
                case '_style':
                    value = DEFAULT_FILTERS[filterName](value)
                    break

                case '_xclass':
                case '_xstyle':
                    value = value = DEFAULT_FILTERS[filterName](value, evalExpr(filter.args[0], data, owner))
                    break

                default:
                    value = owner.filters[filterName] && owner.filters[filterName].apply(
                        owner,
                        [value].concat(evalArgs(filter.args, data, owner))
                    )
                }
            }
        }

        if (value == null) {
            value = ''
        }

        return value

    case 6:
        if (owner && expr.name.type === 4) {
            let method = owner
            const pathsLen = expr.name.paths.length

            for (let i = 0; method && i < pathsLen; i++) {
                method = method[evalExpr(expr.name.paths[i], data, owner)]
            }

            if (method) {
                value = method.apply(owner, evalArgs(expr.args, data, owner))
            }
        }

        break

        /* eslint-disable no-redeclare */
    case 7:
        let buf = ''
        for (let i = 0, l = expr.segs.length; i < l; i++) {
            const seg = expr.segs[i]
            buf += seg.value || evalExpr(seg, data, owner)
        }
        return buf
    }

    return value
}

/**
* 为函数调用计算参数数组的值
*
* @param {Array} args 参数表达式列表
* @param {Data} data 数据环境
* @param {Component} owner 组件环境
* @return {Array}
*/
function evalArgs (args, data, owner) {
    const result = []
    for (let i = 0; i < args.length; i++) {
        result.push(evalExpr(args[i], data, owner))
    }

    return result
}

/**
* 获取 ANode props 数组中相应 name 的项
*
* @param {Object} aNode ANode对象
* @param {string} name name属性匹配串
* @return {Object}
*/
function getANodeProp (aNode, name) {
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
function camelComponentBinds (binds) {
    const result = []
    each(binds, function (bind) {
        result.push({
            name: kebab2camel(bind.name),
            expr: bind.expr,
            x: bind.x,
            raw: bind.raw
        })
    })

    return result
}

let ssrIndex = 0

function genSSRId () {
    return 'sanssrId' + (ssrIndex++)
}

const stringifier = {
    obj: function (source) {
        let prefixComma
        let result = '(object)['

        for (const key in source) {
            if (!source.hasOwnProperty(key) || typeof source[key] === 'undefined') {
                continue
            }

            if (prefixComma) {
                result += ','
            }
            prefixComma = 1

            const k = ExpressionEmitter.stringLiteralize(key)
            const v = stringifier.any(source[key])
            result += `${k} => ${v}`
        }

        return result + ']'
    },

    arr: function (source) {
        let prefixComma
        let result = '['

        each(source, function (value) {
            if (prefixComma) {
                result += ','
            }
            prefixComma = 1

            result += stringifier.any(value)
        })

        return result + ']'
    },

    str: function (source) {
        return ExpressionEmitter.stringLiteralize(source)
    },

    date: function (source) {
        return 'new \\san\\runtime\\Ts2Php_Date(' + source.getTime() + ')'
    },

    any: function (source) {
        switch (typeof source) {
        case 'string':
            return stringifier.str(source)

        case 'number':
            return '' + source

        case 'boolean':
            return source ? 'true' : 'false'

        case 'object':
            if (!source) {
                return null
            }

            if (source instanceof Array) {
                return stringifier.arr(source)
            }

            if (source instanceof Date) {
                return stringifier.date(source)
            }

            return stringifier.obj(source)
        }

        throw new Error('Cannot Stringify:' + source)
    }
}

/**
* 生成序列化时起始桩的html
*
* @param {string} type 桩类型标识
* @param {string?} content 桩内的内容
* @return {string}
*/
function serializeStump (type, content?) {
    return '<!--s-' + type + (content ? ':' + content : '') + '-->'
}

/**
* 生成序列化时结束桩的html
*
* @param {string} type 桩类型标识
* @return {string}
*/
function serializeStumpEnd (type) {
    return '<!--/s-' + type + '-->'
}

/**
* element 的编译方法集合对象
*
* @inner
*/
const elementSourceCompiler = {

    /* eslint-disable max-params */

    /**
     * 编译元素标签头
     *
     * @param {PHPEmitter} emitter 编译源码的中间buffer
     * @param {ANode} aNode 抽象节点
     * @param {string=} tagNameVariable 组件标签为外部动态传入时的标签变量名
     */
    tagStart: function (emitter, aNode, tagNameVariable?) {
        const props = aNode.props
        const bindDirective = aNode.directives.bind
        const tagName = aNode.tagName

        if (tagName) {
            emitter.bufferHTMLLiteral('<' + tagName)
        } else if (tagNameVariable) {
            emitter.bufferHTMLLiteral('<')
            emitter.writeHTML(`$${tagNameVariable} ? $${tagNameVariable} : "div"`)
        } else {
            emitter.bufferHTMLLiteral('<div')
        }

        // index list
        const propsIndex:any = {}
        each(props, function (prop) {
            propsIndex[prop.name] = prop

            if (prop.name !== 'slot' && prop.expr.value != null) {
                emitter.bufferHTMLLiteral(' ' + prop.name + '="' + prop.expr.segs[0].literal + '"')
            }
        })

        each(props, function (prop) {
            if (prop.name === 'slot' || prop.expr.value != null) {
                return
            }

            if (prop.name === 'value') {
                switch (tagName) {
                case 'textarea':
                    return

                case 'select':
                    emitter.writeLine('$selectValue = ' +
                        ExpressionEmitter.expr(prop.expr) + '?' +
                        ExpressionEmitter.expr(prop.expr) + ': "";'
                    )
                    return

                case 'option':
                    emitter.writeLine('$optionValue = ' +
                        ExpressionEmitter.expr(prop.expr) +
                        ';'
                    )
                    // value
                    emitter.writeIf('isset($optionValue)', () => {
                        emitter.writeHTML('" value=\\"" . $optionValue . "\\""')
                    })

                    // selected
                    emitter.writeIf('$optionValue == $selectValue', () => {
                        emitter.bufferHTMLLiteral(' selected')
                    })
                    return
                }
            }

            switch (prop.name) {
            case 'readonly':
            case 'disabled':
            case 'multiple':
                if (prop.raw == null) {
                    emitter.bufferHTMLLiteral(' ' + prop.name)
                } else {
                    emitter.writeHTML('_::boolAttrFilter(\'' + prop.name + '\', ' +
                        ExpressionEmitter.expr(prop.expr) +
                        ')'
                    )
                }
                break

            case 'checked':
                if (tagName === 'input') {
                    const valueProp = propsIndex.value
                    const valueCode = ExpressionEmitter.expr(valueProp.expr)

                    if (valueProp) {
                        switch (propsIndex.type.raw) {
                        case 'checkbox':
                            emitter.writeIf(`_::contains(${ExpressionEmitter.expr(prop.expr)}, ${valueCode})`, () => {
                                emitter.bufferHTMLLiteral(' checked')
                            })
                            break
                        case 'radio':
                            emitter.writeIf(`${ExpressionEmitter.expr(prop.expr)} === ${valueCode}`, () => {
                                emitter.bufferHTMLLiteral(' checked')
                            })
                            break
                        }
                    }
                }
                break

            default:
                let onlyOneAccessor = false
                let preCondExpr

                if (prop.expr.type === 4) {
                    onlyOneAccessor = true
                    preCondExpr = prop.expr
                } else if (prop.expr.type === 7 && prop.expr.segs.length === 1) {
                    const interpExpr = prop.expr.segs[0]
                    const interpFilters = interpExpr.filters

                    if (!interpFilters.length ||
                        (interpFilters.length === 1 && interpFilters[0].args.length === 0)
                    ) {
                        onlyOneAccessor = true
                        preCondExpr = prop.expr.segs[0].expr
                    }
                }

                if (onlyOneAccessor) {
                    emitter.beginIf(ExpressionEmitter.expr(preCondExpr))
                }

                emitter.writeHTML('_::attrFilter(\'' + prop.name + '\', ' +
                    (prop.x ? '_::escapeHTML(' : '') +
                    ExpressionEmitter.expr(prop.expr) +
                    (prop.x ? ')' : '') +
                    ')'
                )

                if (onlyOneAccessor) {
                    emitter.endIf()
                }

                break
            }
        })

        if (bindDirective) {
            emitter.writeLine(
                '(function ($bindObj) use (&$html){foreach ($bindObj as $key => $value) {'
            )

            if (tagName === 'textarea') {
                emitter.writeIf('$key == "value"', () => {
                    emitter.writeLine('continue;')
                })
            }

            emitter.writeLine('switch ($key) {\n' +
            'case "readonly":\n' +
            'case "disabled":\n' +
            'case "multiple":\n' +
            'case "multiple":\n' +
            '$html .= _::boolAttrFilter($key, _::escapeHTML($value));\n' +
            'break;\n' +
            'default:\n' +
            '$html .= _::attrFilter($key, _::escapeHTML($value));' +
            '}'
            )

            emitter.writeLine(
                '}})(' +
            ExpressionEmitter.expr(bindDirective.value) +
            ');'
            )
        }

        emitter.bufferHTMLLiteral('>')
    },
    /* eslint-enable max-params */

    /**
     * 编译元素闭合
     *
     * @param {PHPEmitter} emitter 编译源码的中间buffer
     * @param {ANode} aNode 抽象节点
     * @param {string=} tagNameVariable 组件标签为外部动态传入时的标签变量名
     */
    tagEnd: function (emitter, aNode, tagNameVariable?) {
        const tagName = aNode.tagName

        if (tagName) {
            if (!autoCloseTags[tagName]) {
                emitter.bufferHTMLLiteral('</' + tagName + '>')
            }

            if (tagName === 'select') {
                emitter.writeLine('$selectValue = null;')
            }

            if (tagName === 'option') {
                emitter.writeLine('$optionValue = null;')
            }
        } else {
            emitter.bufferHTMLLiteral('</')
            emitter.writeHTML(`$${tagNameVariable} ? $${tagNameVariable} : "div"`)
            emitter.bufferHTMLLiteral('>')
        }
    },

    /**
     * 编译元素内容
     *
     * @param {PHPEmitter} emitter 编译源码的中间buffer
     * @param {ANode} aNode 元素的抽象节点信息
     * @param {Component} owner 所属组件实例环境
     */
    inner: function (emitter, aNode, owner) {
        // inner content
        if (aNode.tagName === 'textarea') {
            const valueProp = getANodeProp(aNode, 'value')
            if (valueProp) {
                emitter.writeHTML('_::escapeHTML(' +
                ExpressionEmitter.expr(valueProp.expr) +
                ')'
                )
            }

            return
        }

        const htmlDirective = aNode.directives.html
        if (htmlDirective) {
            emitter.writeHTML(ExpressionEmitter.expr(htmlDirective.value))
        } else {
            each(aNode.children, function (aNodeChild) {
                aNodeCompiler.compile(aNodeChild, emitter, owner)
            })
        }
    }
}

/**
* ANode 的编译方法集合对象
*
* @inner
*/
const aNodeCompiler = {

    /**
     * 编译节点
     *
     * @param {ANode} aNode 抽象节点
     * @param {PHPEmitter} emitter 编译源码的中间buffer
     * @param {Component} owner 所属组件实例环境
     * @param {Object} extra 编译所需的一些额外信息
     */
    compile: function (aNode, emitter, owner, extra?) {
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
            const ComponentType = owner.getComponentType
                ? owner.getComponentType(aNode)
                : owner.components[aNode.tagName]

            if (ComponentType) {
                compileMethod = 'compileComponent'
                extra.ComponentClass = ComponentType

                if (isComponentLoader(ComponentType)) {
                    compileMethod = 'compileComponentLoader'
                }
            }
        }

        aNodeCompiler[compileMethod](aNode, emitter, owner, extra)
    },

    /**
     * 编译文本节点
     *
     * @param aNode 节点对象
     * @param emitter 编译源码的中间buffer
     */
    compileText: function (aNode, emitter) {
        if (aNode.textExpr.original) {
            emitter.bufferHTMLLiteral(serializeStump('text'))
        }

        if (aNode.textExpr.value != null) {
            emitter.bufferHTMLLiteral(aNode.textExpr.segs[0].literal)
        } else {
            emitter.writeHTML(ExpressionEmitter.expr(aNode.textExpr))
        }

        if (aNode.textExpr.original) {
            emitter.bufferHTMLLiteral(serializeStumpEnd('text'))
        }
    },

    /**
     * 编译template节点
     *
     * @param {ANode} aNode 节点对象
     * @param emitter 编译源码的中间buffer
     * @param {Component} owner 所属组件实例环境
     */
    compileTemplate: function (aNode, emitter: PHPEmitter, owner) {
        elementSourceCompiler.inner(emitter, aNode, owner)
    },

    /**
     * 编译 if 节点
     *
     * @param {ANode} aNode 节点对象
     * @param emitter 编译源码的中间buffer
     * @param {Component} owner 所属组件实例环境
     */
    compileIf: function (aNode, emitter: PHPEmitter, owner) {
        // output main if
        const ifDirective = aNode.directives['if'] // eslint-disable-line dot-notation
        emitter.writeIf(ExpressionEmitter.expr(ifDirective.value), () => {
            aNodeCompiler.compile(aNode.ifRinsed, emitter, owner)
        })

        // output elif and else
        each(aNode.elses, function (elseANode) {
            const elifDirective = elseANode.directives.elif
            if (elifDirective) {
                emitter.beginElseIf(ExpressionEmitter.expr(elifDirective.value))
            } else {
                emitter.beginElse()
            }

            aNodeCompiler.compile(elseANode, emitter, owner)
            emitter.endBlock()
        })
    },

    /**
     * 编译 for 节点
     *
     * @param {ANode} aNode 节点对象
     * @param {PHPEmitter} emitter 编译源码的中间buffer
     * @param {Component} owner 所属组件实例环境
     */
    compileFor: function (aNode, emitter, owner) {
        const forElementANode = {
            children: aNode.children,
            props: aNode.props,
            events: aNode.events,
            tagName: aNode.tagName,
            directives: extend({}, aNode.directives),
            hotspot: aNode.hotspot
        }
        forElementANode.directives['for'] = null

        const forDirective = aNode.directives['for'] // eslint-disable-line dot-notation
        const itemName = forDirective.item
        const indexName = forDirective.index || genSSRId()
        const listName = genSSRId()

        emitter.writeLine('$' + listName + ' = ' + ExpressionEmitter.expr(forDirective.value) + ';')
        emitter.writeIf(`is_array($${listName}) || is_object($${listName})`, () => {
            emitter.writeForeach(`$${listName} as $${indexName} => $value`, () => {
                emitter.writeLine(`$ctx->data->${indexName} = $${indexName};`)
                emitter.writeLine(`$ctx->data->${itemName} = $value;`)
                aNodeCompiler.compile(forElementANode, emitter, owner)
            })
        })
    },

    /**
     * 编译 slot 节点
     *
     * @param {ANode} aNode 节点对象
     * @param emitter 编译源码的中间buffer
     * @param {Component} owner 所属组件实例环境
     */
    compileSlot: function (aNode, emitter: PHPEmitter, owner) {
        const rendererId = genSSRId()

        emitter.writeIf(`!isset($ctx->slotRenderers["${rendererId}"])`, () => {
            emitter.writeIndent()
            emitter.write(`$ctx->slotRenderers["${rendererId}"] = `)
            emitter.writeAnonymousFunction([], ['&$ctx', '&$html'], () => {
                emitter.writeIndent()
                emitter.write('$defaultSlotRender = ')
                emitter.writeAnonymousFunction(['$ctx'], [], () => {
                    emitter.writeLine('$html = "";')
                    each(aNode.children, aNodeChild => aNodeCompiler.compile(aNodeChild, emitter, owner))
                    emitter.writeLine('return $html;')
                })
                emitter.write(';')

                emitter.writeLine('$isInserted = false;')
                emitter.writeLine('$ctxSourceSlots = $ctx->sourceSlots;')
                emitter.writeLine('$mySourceSlots = [];')

                const nameProp = getANodeProp(aNode, 'name')
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

                    each(aNode.vars, function (varItem) {
                        emitter.writeLine(
                            '$slotCtx->data->' + varItem.name + ' = ' +
                        ExpressionEmitter.expr(varItem.expr) +
                        ';'
                        )
                    })
                }

                emitter.writeForeach('$mySourceSlots as $renderIndex => $slot', () => {
                    emitter.writeHTML('$slot($slotCtx);')
                })
            })
            emitter.write(';')
            emitter.writeNewLine()
        })
        emitter.writeLine(`call_user_func($ctx->slotRenderers["${rendererId}"]);`)
    },

    /**
     * 编译普通节点
     *
     * @param {ANode} aNode 节点对象
     * @param emitter 编译源码的中间buffer
     * @param {Component} owner 所属组件实例环境
     * @param {Object} extra 编译所需的一些额外信息
     */
    compileElement: function (aNode, emitter, owner) {
        elementSourceCompiler.tagStart(emitter, aNode)
        elementSourceCompiler.inner(emitter, aNode, owner)
        elementSourceCompiler.tagEnd(emitter, aNode)
    },

    /**
     * 编译组件节点
     *
     * @param {ANode} aNode 节点对象
     * @param {PHPEmitter} emitter 编译源码的中间buffer
     * @param {Component} owner 所属组件实例环境
     * @param {Object} extra 编译所需的一些额外信息
     * @param {Function} extra.ComponentClass 对应组件类
     */
    compileComponent: function (aNode, emitter, owner, extra) {
        let dataLiteral = '(object)[]'

        emitter.writeLine('$sourceSlots = [];')
        if (aNode.children) {
            const defaultSourceSlots = []
            const sourceSlotCodes = {}

            each(aNode.children, function (child) {
                const slotBind = !child.textExpr && getANodeProp(child, 'slot')
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
            })

            if (defaultSourceSlots.length) {
                emitter.nextLine('array_push($sourceSlots, [')
                emitter.writeAnonymousFunction(['$ctx'], [], () => {
                    emitter.writeLine('$html = "";')
                    defaultSourceSlots.forEach(child => aNodeCompiler.compile(child, emitter, owner))
                    emitter.writeLine('return $html;')
                })
                emitter.feedLine(']);')
            }

            for (const key in sourceSlotCodes) {
                const sourceSlotCode = sourceSlotCodes[key]
                emitter.nextLine('array_push($sourceSlots, [')
                emitter.writeAnonymousFunction(['$ctx'], [], () => {
                    emitter.writeLine('$html = "";')
                    sourceSlotCode.children.forEach(child => aNodeCompiler.compile(child, emitter, owner))
                    emitter.writeLine('return $html;')
                })
                emitter.feedLine(', ' + ExpressionEmitter.expr(sourceSlotCode.prop.expr) + ']);')
            }
        }

        const givenData = []
        each(camelComponentBinds(aNode.props), function (prop) {
            postProp(prop)
            const key = ExpressionEmitter.stringLiteralize(prop.name)
            const val = ExpressionEmitter.expr(prop.expr)
            givenData.push(`${key} => ${val}`)
        })

        dataLiteral = '(object)[' + givenData.join(',\n') + ']'
        if (aNode.directives.bind) {
            dataLiteral = '_::extend(' +
            ExpressionEmitter.expr(aNode.directives.bind.value) +
            ', ' +
            dataLiteral +
            ')'
        }

        const renderId = compileComponentSource(emitter, extra.ComponentClass, owner.ssrContextId)
        emitter.nextLine(`$html .= `)
        emitter.writeFunctionCall(renderId, [dataLiteral, 'true', '$ctx', stringifier.str(aNode.tagName), '$sourceSlots'])
        emitter.feedLine(';')
        emitter.writeLine('$sourceSlots = null;')
    },

    /**
     * 编译组件加载器节点
     *
     * @param {ANode} aNode 节点对象
     * @param {PHPEmitter} emitter 编译源码的中间buffer
     * @param {Component} owner 所属组件实例环境
     * @param {Object} extra 编译所需的一些额外信息
     * @param {Function} extra.ComponentClass 对应类
     */
    compileComponentLoader: function (aNode, emitter, owner, extra) {
        const LoadingComponent = extra.ComponentClass.placeholder
        if (typeof LoadingComponent === 'function') {
            aNodeCompiler.compileComponent(aNode, emitter, owner, {
                ComponentClass: LoadingComponent
            })
        }
    }
}

function isComponentLoader (cmpt) {
    return cmpt && cmpt.hasOwnProperty('load') && cmpt.hasOwnProperty('placeholder')
}

/**
* 生成组件构建的代码
*
* @inner
* @param {PHPEmitter} emitter 编译源码的中间buffer
* @param {Function} ComponentClass 组件类
* @param {string} contextId 构建render环境的id
* @return {string} 组件在当前环境下的方法标识
*/
function compileComponentSource (emitter, ComponentClass, contextId) {
    ComponentClass.ssrContext = ComponentClass.ssrContext || {}
    let cid = ComponentClass.ssrContext[contextId]

    if (!cid) {
        cid = genSSRId()
        ComponentClass.ssrContext[contextId] = cid

        // 先初始化个实例，让模板编译成 ANode，并且能获得初始化数据
        const component = new ComponentClass()
        component.ssrContextId = contextId

        if (component.components) {
            Object.keys(component.components).forEach(
                function (key) {
                    let CmptClass = component.components[key]
                    if (isComponentLoader(CmptClass)) {
                        CmptClass = CmptClass.placeholder
                    }

                    if (CmptClass) {
                        compileComponentSource(emitter, CmptClass, contextId)
                    }
                }
            )
        }

        emitter.writeIndent()
        emitter.writeFunction(cid, ['$data', '$noDataOutput = false', '$parentCtx = []', '$tagName = null', '$sourceSlots = []'], [], () => {
            emitter.writeLine('$html = "";')

            genComponentContextCode(component, emitter)

            // init data
            const defaultData = component.data.get()
            emitter.writeIf('$data', () => {
                for (const key of Object.keys(defaultData)) {
                    const val = stringifier.any(defaultData[key])
                    if (val === 'NaN') continue
                    emitter.writeLine(`$ctx->data->${key} = isset($ctx->data->${key}) ? $ctx->data->${key} : ${val};`)
                }
            })

            // calc computed
            emitter.writeForeach('$ctx->computedNames as $i => $computedName', () => {
                emitter.writeLine('$data->$computedName = _::callComputed($ctx, $computedName);')
            })

            const ifDirective = component.aNode.directives['if']
            if (ifDirective) {
                emitter.writeLine('if (' + ExpressionEmitter.expr(ifDirective.value) + ') {')
                emitter.indent()
            }

            elementSourceCompiler.tagStart(emitter, component.aNode, 'tagName')

            emitter.writeIf('!$noDataOutput', () => {
                emitter.writeDataComment()
            })

            elementSourceCompiler.inner(emitter, component.aNode, component)
            elementSourceCompiler.tagEnd(emitter, component.aNode, 'tagName')

            if (ifDirective) {
                emitter.unindent()
                emitter.writeLine('}')
            }

            emitter.writeLine('return $html;')
        })
    }

    return cid
}

/**
* 生成组件 renderer 时 ctx 对象构建的代码
*
* @inner
* @param {Object} component 组件实例
* @return {string}
*/
function genComponentContextCode (component, emitter) {
    emitter.nextLine('$ctx = (object)[')
    emitter.indent()

    emitter.nextLine('"computedNames" => [')
    emitter.write(Object.keys(component.computed).map(x => `"${x}"`).join(','))
    emitter.feedLine('],')

    emitter.writeLine(`"sanssrCid" => ${component.constructor.sanssrCid || 0},`)
    emitter.writeLine('"sourceSlots" => $sourceSlots,')
    emitter.writeLine('"data" => $data ? $data : (object)[],')
    emitter.writeLine('"owner" => $parentCtx,')
    emitter.writeLine('"slotRenderers" => []')

    emitter.unindent()
    emitter.feedLine('];')
    emitter.writeLine('$ctx->instance = _::createComponent($ctx);')
}

/**
* 将组件编译成 render 方法的 js 源码
*
* @param {Function} ComponentClass 组件类
* @return {string}
*/
export function generateRenderModule ({
    ComponentClass,
    funcName = '',
    ns = 'san\\renderer',
    emitter = new PHPEmitter()
}) {
    if (typeof ComponentClass !== 'function') {
        throw new Error('ComponentClass is needed to generate render function')
    }
    emitter.beginNamespace(ns)
    emitter.writeLine(`use \\san\\runtime\\_;`)
    ssrIndex = 0

    const contextId = genSSRId()

    emitter.writeIndent()
    emitter.writeFunction(funcName, ['$data', '$noDataOutput'], [], () => {
        const renderId = compileComponentSource(emitter, ComponentClass, contextId)
        emitter.writeLine(`return ${renderId}($data, $noDataOutput);`)
    })

    emitter.endNamespace()
    return emitter.fullText()
}
