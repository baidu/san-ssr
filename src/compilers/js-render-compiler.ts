import { parseExpr } from 'san'

/**
* 编译源码的 helper 方法集合对象
*/
const compileExprSource = {

    /**
     * 字符串字面化
     *
     * @param {string} source 需要字面化的字符串
     * @return {string} 字符串字面化结果
     */
    stringLiteralize: function (source) {
        return '"' +
        source
            .replace(/\x5C/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\x0A/g, '\\n')    // eslint-disable-line
            .replace(/\x09/g, '\\t')    // eslint-disable-line
            .replace(/\x0D/g, '\\r') +    // eslint-disable-line
        // .replace( /\x08/g, '\\b' )
        // .replace( /\x0C/g, '\\f' )
        '"'
    },

    /**
     * 生成数据访问表达式代码
     *
     * @param {Object?} accessorExpr accessor表达式对象
     * @return {string}
     */
    dataAccess: function (accessorExpr?) {
        let code = 'componentCtx.data'
        if (accessorExpr) {
            for (const path of accessorExpr.paths) {
                if (path.type === 4) {
                    code += '[' + compileExprSource.dataAccess(path) + ']'
                    continue
                }

                switch (typeof path.value) {
                case 'string':
                    code += '.' + path.value
                    continue

                case 'number':
                    code += '[' + path.value + ']'
                    continue
                }
            }
        }

        return code
    },

    /**
     * 生成调用表达式代码
     *
     * @param {Object?} callExpr 调用表达式对象
     * @return {string}
     */
    callExpr: function (callExpr) {
        const paths = callExpr.name.paths
        let code = 'componentCtx.proto.' + paths[0].value

        for (let i = 1; i < paths.length; i++) {
            const path = paths[i]

            switch (path.type) {
            case 1:
                code += '.' + path.value
                break

            case 2:
                code += '[' + path.value + ']'
                break

            default:
                code += '[' + compileExprSource.expr(path) + ']'
            }
        }

        code += '('
        code += callExpr.args
            .map(arg => compileExprSource.expr(arg))
            .join(',')
        code += ')'

        return code
    },

    /**
     * 生成插值代码
     *
     * @param {Object} interpExpr 插值表达式对象
     * @return {string}
     */
    interp: function (interpExpr) {
        let code = compileExprSource.expr(interpExpr.expr)

        for (const filter of interpExpr.filters) {
            const filterName = filter.name.paths[0].value

            switch (filterName) {
            case '_style':
            case '_class':
                code = filterName + 'Filter(' + code + ')'
                break

            case '_xstyle':
            case '_xclass':
                code = filterName + 'Filter(' + code + ', ' + compileExprSource.expr(filter.args[0]) + ')'
                break

            case 'url':
                code = 'encodeURIComponent(' + code + ')'
                break

            default:
                code = 'callFilter(componentCtx, "' + filterName + '", [' + code
                for (const arg of filter.args) {
                    code += ', ' + compileExprSource.expr(arg)
                }
                code += '])'
            }
        }

        if (!interpExpr.original) {
            return 'escapeHTML(' + code + ')'
        }

        return code
    },

    /**
     * 生成文本片段代码
     *
     * @param {Object} textExpr 文本片段表达式对象
     * @return {string}
     */
    text: function (textExpr) {
        if (textExpr.segs.length === 0) {
            return '""'
        }

        let code = ''

        for (const seg of textExpr.segs) {
            const segCode = compileExprSource.expr(seg)
            code += code ? ' + ' + segCode : segCode
        }

        return code
    },

    /**
     * 生成数组字面量代码
     *
     * @param {Object} arrayExpr 数组字面量表达式对象
     * @return {string}
     */
    array: function (arrayExpr) {
        return '[\n' +
            arrayExpr.items
                .map(expr => (expr.spread ? '...' : '') + compileExprSource.expr(expr.expr))
                .join(',\n') +
            '\n]'
    },

    /**
     * 生成对象字面量代码
     *
     * @param {Object} objExpr 对象字面量表达式对象
     * @return {string}
     */
    object: function (objExpr) {
        const code = []

        for (const item of objExpr.items) {
            if (item.spread) {
                code.push('...' + compileExprSource.expr(item.expr))
            } else {
                code.push(compileExprSource.expr(item.name) + ':' + compileExprSource.expr(item.expr))
            }
        }

        return '{\n' + code.join(',\n') + '\n}'
    },

    /**
     * 二元表达式操作符映射表
     *
     * @type {Object}
     */
    binaryOp: {
    /* eslint-disable */
    43: '+',
    45: '-',
    42: '*',
    47: '/',
    60: '<',
    62: '>',
    76: '&&',
    94: '!=',
    121: '<=',
    122: '==',
    123: '>=',
    155: '!==',
    183: '===',
    248: '||'
    /* eslint-enable */
    },

    /**
     * 生成表达式代码
     *
     * @param {Object} expr 表达式对象
     * @return {string}
     */
    expr: function (expr) {
        if (expr.parenthesized) {
            return '(' + compileExprSource._expr(expr) + ')'
        }

        return compileExprSource._expr(expr)
    },

    /**
     * 根据表达式类型进行生成代码函数的中转分发
     *
     * @param {Object} expr 表达式对象
     * @return {string}
     */
    _expr: function (expr) {
        switch (expr.type) {
        case 9:
            switch (expr.operator) {
            case 33:
                return '!' + compileExprSource.expr(expr.expr)
            case 45:
                return '-' + compileExprSource.expr(expr.expr)
            }
            return ''

        case 8:
            return compileExprSource.expr(expr.segs[0]) +
                compileExprSource.binaryOp[expr.operator] +
                compileExprSource.expr(expr.segs[1])

        case 10:
            return compileExprSource.expr(expr.segs[0]) +
                '?' + compileExprSource.expr(expr.segs[1]) +
                ':' + compileExprSource.expr(expr.segs[2])

        case 1:
            return compileExprSource.stringLiteralize(expr.literal || expr.value)

        case 2:
            return expr.value

        case 3:
            return expr.value ? 'true' : 'false'

        case 4:
            return compileExprSource.dataAccess(expr)

        case 5:
            return compileExprSource.interp(expr)

        case 7:
            return compileExprSource.text(expr)

        case 12:
            return compileExprSource.array(expr)

        case 11:
            return compileExprSource.object(expr)

        case 6:
            return compileExprSource.callExpr(expr)

        case 13:
            return 'null'
        }
    }
}

function functionString (fn) {
    let str = fn.toString()
    if (!/^function /.test(fn)) { // es6 method
        str = 'function ' + str
    }
    return str
}

/**
* 编译源码的中间buffer类
*
* @class
*/
class CompileSourceBuffer {
    segs: any[]
    constructor () {
        this.segs = []
    }
    /**
    * 添加原始代码，将原封不动输出
    *
    * @param {string} code 原始代码
    */
    addRaw (code) {
        this.segs.push({
            type: 'RAW',
            code: code
        })
    }

    /**
    * 添加被拼接为html的原始代码
    *
    * @param {string} code 原始代码
    */
    joinRaw (code) {
        this.segs.push({
            type: 'JOIN_RAW',
            code: code
        })
    }

    /**
    * 添加被拼接为html的静态字符串
    *
    * @param {string} str 被拼接的字符串
    */
    joinString (str) {
        this.segs.push({
            str: str,
            type: 'JOIN_STRING'
        })
    }

    /**
    * 添加被拼接为html的数据访问
    *
    * @param {Object?} accessor 数据访问表达式对象
    */
    joinDataStringify () {
        this.segs.push({
            type: 'JOIN_DATA_STRINGIFY'
        })
    }

    /**
    * 添加被拼接为html的表达式
    *
    * @param {Object} expr 表达式对象
    */
    joinExpr (expr) {
        this.segs.push({
            expr: expr,
            type: 'JOIN_EXPR'
        })
    }

    /**
    * 生成编译后代码
    *
    * @return {string}
    */
    toCode () {
        const code = []
        let temp = ''

        function genStrLiteral () {
            if (temp) {
                code.push('html += ' + compileExprSource.stringLiteralize(temp) + ';')
            }

            temp = ''
        }

        for (const seg of this.segs) {
            if (seg.type === 'JOIN_STRING') {
                temp += seg.str
                continue
            }

            genStrLiteral()
            switch (seg.type) {
            case 'JOIN_DATA_STRINGIFY':
                code.push('html += "<!--s-data:" + JSON.stringify(' +
                compileExprSource.dataAccess() + ') + "-->";')
                break

            case 'JOIN_EXPR':
                code.push('html += ' + compileExprSource.expr(seg.expr) + ';')
                break

            case 'JOIN_RAW':
                code.push('html += ' + seg.code + ';')
                break

            case 'RAW':
                code.push(seg.code)
                break
            }
        }

        genStrLiteral()

        return code.join('\n')
    }
}

/**
* 将字符串逗号切分返回对象
*
* @param {string} source 源字符串
* @return {Object}
*/
function splitStr2Obj (source) {
    const result = {}
    for (const key of source.split(',')) result[key] = key
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
    return binds.map(bind => ({ ...bind, name: kebab2camel(bind.name) }))
}

// #[begin] ssr

let ssrIndex = 0
function genSSRId () {
    return '_id' + (ssrIndex++)
}

const stringifier = {
    obj: function (source) {
        let prefixComma
        let result = '{'

        for (const key in source) {
            if (!source.hasOwnProperty(key) || typeof source[key] === 'undefined') {
                continue
            }

            if (prefixComma) {
                result += ','
            }
            prefixComma = 1

            result += compileExprSource.stringLiteralize(key) + ':' + stringifier.any(source[key])
        }

        return result + '}'
    },

    arr: function (source) {
        let prefixComma
        let result = '['

        for (const value of source) {
            if (prefixComma) {
                result += ','
            }
            prefixComma = 1

            result += stringifier.any(value)
        }

        return result + ']'
    },

    str: function (source) {
        return compileExprSource.stringLiteralize(source)
    },

    date: function (source) {
        return 'new Date(' + source.getTime() + ')'
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

const COMPONENT_RESERVED_MEMBERS = splitStr2Obj('aNode,computed,filters,components,' +
'initData,template,attached,created,detached,disposed,compiled'
)

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
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     * @param {ANode} aNode 抽象节点
     * @param {string=} tagNameVariable 组件标签为外部动态传入时的标签变量名
     */
    tagStart: function (sourceBuffer, aNode, tagNameVariable?) {
        const props = aNode.props
        const bindDirective = aNode.directives.bind
        const tagName = aNode.tagName

        if (tagName) {
            sourceBuffer.joinString('<' + tagName)
        } else if (tagNameVariable) {
            sourceBuffer.joinString('<')
            sourceBuffer.joinRaw(tagNameVariable + ' || "div"')
        } else {
            sourceBuffer.joinString('<div')
        }

        // index list
        const propsIndex = {}
        for (const prop of props) {
            propsIndex[prop.name] = prop

            if (prop.name !== 'slot' && prop.expr.value != null) {
                sourceBuffer.joinString(' ' + prop.name + '="' + prop.expr.segs[0].literal + '"')
            }
        }

        for (const prop of props) {
            if (prop.name === 'slot' || prop.expr.value != null) {
                continue
            }

            if (prop.name === 'value') {
                switch (tagName) {
                case 'textarea':
                    continue

                case 'select':
                    sourceBuffer.addRaw('$selectValue = ' +
                        compileExprSource.expr(prop.expr) +
                        ' || "";'
                    )
                    continue

                case 'option':
                    sourceBuffer.addRaw('$optionValue = ' +
                        compileExprSource.expr(prop.expr) +
                        ';'
                    )
                    // value
                    sourceBuffer.addRaw('if ($optionValue != null) {')
                    sourceBuffer.joinRaw('" value=\\"" + $optionValue + "\\""')
                    sourceBuffer.addRaw('}')

                    // selected
                    sourceBuffer.addRaw('if ($optionValue === $selectValue) {')
                    sourceBuffer.joinString(' selected')
                    sourceBuffer.addRaw('}')
                    continue
                }
            }

            switch (prop.name) {
            case 'readonly':
            case 'disabled':
            case 'multiple':
                if (prop.raw == null) {
                    sourceBuffer.joinString(' ' + prop.name)
                } else {
                    sourceBuffer.joinRaw(
                        'boolAttrFilter("' + prop.name + '", ' +
                        compileExprSource.expr(prop.expr) +
                        ')'
                    )
                }
                break

            case 'checked':
                if (tagName === 'input') {
                    const valueProp = propsIndex['value']
                    const valueCode = compileExprSource.expr(valueProp.expr)

                    if (valueProp) {
                        switch (propsIndex['type'].raw) {
                        case 'checkbox':
                            sourceBuffer.addRaw('if (contains(' +
                                    compileExprSource.expr(prop.expr) +
                                    ', ' +
                                    valueCode +
                                    ')) {'
                            )
                            sourceBuffer.joinString(' checked')
                            sourceBuffer.addRaw('}')
                            break

                        case 'radio':
                            sourceBuffer.addRaw('if (' +
                                    compileExprSource.expr(prop.expr) +
                                    ' === ' +
                                    valueCode +
                                    ') {'
                            )
                            sourceBuffer.joinString(' checked')
                            sourceBuffer.addRaw('}')
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
                    sourceBuffer.addRaw('if (' + compileExprSource.expr(preCondExpr) + ') {')
                }

                sourceBuffer.joinRaw('attrFilter("' + prop.name + '", ' +
                    (prop.x ? 'escapeHTML(' : '') +
                    compileExprSource.expr(prop.expr) +
                    (prop.x ? ')' : '') +
                    ')'
                )

                if (onlyOneAccessor) {
                    sourceBuffer.addRaw('}')
                }

                break
            }
        }

        if (bindDirective) {
            sourceBuffer.addRaw(
                '(function ($bindObj) {for (var $key in $bindObj) {' +
            'var $value = $bindObj[$key];'
            )

            if (tagName === 'textarea') {
                sourceBuffer.addRaw(
                    'if ($key === "value") {' +
                'continue;' +
                '}'
                )
            }

            sourceBuffer.addRaw('switch ($key) {\n' +
            'case "readonly":\n' +
            'case "disabled":\n' +
            'case "multiple":\n' +
            'case "multiple":\n' +
            'html += boolAttrFilter($key, escapeHTML($value));\n' +
            'break;\n' +
            'default:\n' +
            'html += attrFilter($key, escapeHTML($value));' +
            '}'
            )

            sourceBuffer.addRaw(
                '}})(' +
            compileExprSource.expr(bindDirective.value) +
            ');'
            )
        }

        sourceBuffer.joinString('>')
    },
    /* eslint-enable max-params */

    /**
     * 编译元素闭合
     *
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     * @param {ANode} aNode 抽象节点
     * @param {string=} tagNameVariable 组件标签为外部动态传入时的标签变量名
     */
    tagEnd: function (sourceBuffer, aNode, tagNameVariable?) {
        const tagName = aNode.tagName

        if (tagName) {
            if (!autoCloseTags[tagName]) {
                sourceBuffer.joinString('</' + tagName + '>')
            }

            if (tagName === 'select') {
                sourceBuffer.addRaw('$selectValue = null;')
            }

            if (tagName === 'option') {
                sourceBuffer.addRaw('$optionValue = null;')
            }
        } else {
            sourceBuffer.joinString('</')
            sourceBuffer.joinRaw(tagNameVariable + ' || "div"')
            sourceBuffer.joinString('>')
        }
    },

    /**
     * 编译元素内容
     *
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     * @param {ANode} aNode 元素的抽象节点信息
     * @param {Component} owner 所属组件实例环境
     */
    inner: function (sourceBuffer, aNode, owner) {
        // inner content
        if (aNode.tagName === 'textarea') {
            const valueProp = getANodeProp(aNode, 'value')
            if (valueProp) {
                sourceBuffer.joinRaw('escapeHTML(' +
                compileExprSource.expr(valueProp.expr) +
                ')'
                )
            }

            return
        }

        const htmlDirective = aNode.directives.html
        if (htmlDirective) {
            sourceBuffer.joinExpr(htmlDirective.value)
        } else {
            for (const aNodeChild of aNode.children) {
                aNodeCompiler.compile(aNodeChild, sourceBuffer, owner)
            }
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
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     * @param {Component} owner 所属组件实例环境
     * @param {Object} extra 编译所需的一些额外信息
     */
    compile: function (aNode, sourceBuffer, owner, extra = {}) {
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
                extra['ComponentClass'] = ComponentType

                if (isComponentLoader(ComponentType)) {
                    compileMethod = 'compileComponentLoader'
                }
            }
        }

        aNodeCompiler[compileMethod](aNode, sourceBuffer, owner, extra)
    },

    /**
     * 编译文本节点
     *
     * @param {ANode} aNode 节点对象
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     */
    compileText: function (aNode, sourceBuffer) {
        if (aNode.textExpr.original) {
            sourceBuffer.joinString(serializeStump('text'))
        }

        if (aNode.textExpr.value != null) {
            sourceBuffer.joinString(aNode.textExpr.segs[0].literal)
        } else {
            sourceBuffer.joinExpr(aNode.textExpr)
        }

        if (aNode.textExpr.original) {
            sourceBuffer.joinString(serializeStumpEnd('text'))
        }
    },

    /**
     * 编译template节点
     *
     * @param {ANode} aNode 节点对象
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     * @param {Component} owner 所属组件实例环境
     */
    compileTemplate: function (aNode, sourceBuffer, owner) {
        elementSourceCompiler.inner(sourceBuffer, aNode, owner)
    },

    /**
     * 编译 if 节点
     *
     * @param {ANode} aNode 节点对象
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     * @param {Component} owner 所属组件实例环境
     */
    compileIf: function (aNode, sourceBuffer, owner) {
        // output main if
        const ifDirective = aNode.directives['if'] // eslint-disable-line dot-notation
        sourceBuffer.addRaw('if (' + compileExprSource.expr(ifDirective.value) + ') {')
        sourceBuffer.addRaw(
            aNodeCompiler.compile(
                aNode.ifRinsed,
                sourceBuffer,
                owner
            )
        )
        sourceBuffer.addRaw('}')

        // output elif and else
        for (const elseANode of aNode.elses || []) {
            const elifDirective = elseANode.directives.elif
            if (elifDirective) {
                sourceBuffer.addRaw('else if (' + compileExprSource.expr(elifDirective.value) + ') {')
            } else {
                sourceBuffer.addRaw('else {')
            }

            sourceBuffer.addRaw(
                aNodeCompiler.compile(
                    elseANode,
                    sourceBuffer,
                    owner
                )
            )
            sourceBuffer.addRaw('}')
        }
    },

    /**
     * 编译 for 节点
     *
     * @param {ANode} aNode 节点对象
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     * @param {Component} owner 所属组件实例环境
     */
    compileFor: function (aNode, sourceBuffer, owner) {
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
        const indexName = forDirective.index || genSSRId()
        const listName = genSSRId()

        sourceBuffer.addRaw('var ' + listName + ' = ' + compileExprSource.expr(forDirective.value) + ';')
        sourceBuffer.addRaw('if (' + listName + ' instanceof Array) {')

        // for array
        sourceBuffer.addRaw('for (' +
        'var ' + indexName + ' = 0; ' +
        indexName + ' < ' + listName + '.length; ' +
        indexName + '++) {'
        )
        sourceBuffer.addRaw('componentCtx.data.' + indexName + '=' + indexName + ';')
        sourceBuffer.addRaw('componentCtx.data.' + itemName + '= ' + listName + '[' + indexName + '];')
        sourceBuffer.addRaw(
            aNodeCompiler.compile(
                forElementANode,
                sourceBuffer,
                owner
            )
        )
        sourceBuffer.addRaw('}')

        sourceBuffer.addRaw('} else if (typeof ' + listName + ' === "object") {')

        // for object
        sourceBuffer.addRaw('for (var ' + indexName + ' in ' + listName + ') {')
        sourceBuffer.addRaw('if (' + listName + '[' + indexName + '] != null) {')
        sourceBuffer.addRaw('componentCtx.data.' + indexName + '=' + indexName + ';')
        sourceBuffer.addRaw('componentCtx.data.' + itemName + '= ' + listName + '[' + indexName + '];')
        sourceBuffer.addRaw(
            aNodeCompiler.compile(
                forElementANode,
                sourceBuffer,
                owner
            )
        )
        sourceBuffer.addRaw('}')
        sourceBuffer.addRaw('}')

        sourceBuffer.addRaw('}')
    },

    /**
     * 编译 slot 节点
     *
     * @param {ANode} aNode 节点对象
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     * @param {Component} owner 所属组件实例环境
     */
    compileSlot: function (aNode, sourceBuffer, owner) {
        const rendererId = genSSRId()

        sourceBuffer.addRaw('componentCtx.slotRenderers.' + rendererId +
        ' = componentCtx.slotRenderers.' + rendererId + ' || function () {')

        sourceBuffer.addRaw('function $defaultSlotRender(componentCtx) {')
        sourceBuffer.addRaw('  var html = "";')
        for (const aNodeChild of aNode.children) {
            sourceBuffer.addRaw(aNodeCompiler.compile(aNodeChild, sourceBuffer, owner))
        }
        sourceBuffer.addRaw('  return html;')
        sourceBuffer.addRaw('}')

        sourceBuffer.addRaw('var $isInserted = false;')
        sourceBuffer.addRaw('var $ctxSourceSlots = componentCtx.sourceSlots;')
        sourceBuffer.addRaw('var $mySourceSlots = [];')

        const nameProp = getANodeProp(aNode, 'name')
        if (nameProp) {
            sourceBuffer.addRaw('var $slotName = ' + compileExprSource.expr(nameProp.expr) + ';')

            sourceBuffer.addRaw('for (var $i = 0; $i < $ctxSourceSlots.length; $i++) {')
            sourceBuffer.addRaw('  if ($ctxSourceSlots[$i][1] == $slotName) {')
            sourceBuffer.addRaw('    $mySourceSlots.push($ctxSourceSlots[$i][0]);')
            sourceBuffer.addRaw('    $isInserted = true;')
            sourceBuffer.addRaw('  }')
            sourceBuffer.addRaw('}')
        } else {
            sourceBuffer.addRaw('if ($ctxSourceSlots[0] && $ctxSourceSlots[0][1] == null) {')
            sourceBuffer.addRaw('  $mySourceSlots.push($ctxSourceSlots[0][0]);')
            sourceBuffer.addRaw('  $isInserted = true;')
            sourceBuffer.addRaw('}')
        }

        sourceBuffer.addRaw('if (!$isInserted) { $mySourceSlots.push($defaultSlotRender); }')
        sourceBuffer.addRaw('var $slotCtx = $isInserted ? componentCtx.owner : componentCtx;')

        if (aNode.vars || aNode.directives.bind) {
            sourceBuffer.addRaw('$slotCtx = {data: extend({}, $slotCtx.data), proto: $slotCtx.proto, owner: $slotCtx.owner};')

            if (aNode.directives.bind) {
                sourceBuffer.addRaw('extend($slotCtx.data, ' + compileExprSource.expr(aNode.directives.bind.value) + ');')
            }

            for (const varItem of aNode.vars) {
                sourceBuffer.addRaw(
                    '$slotCtx.data["' + varItem.name + '"] = ' +
                    compileExprSource.expr(varItem.expr) +
                    ';'
                )
            }
        }

        sourceBuffer.addRaw('for (var $renderIndex = 0; $renderIndex < $mySourceSlots.length; $renderIndex++) {')
        sourceBuffer.addRaw('  html += $mySourceSlots[$renderIndex]($slotCtx);')
        sourceBuffer.addRaw('}')

        sourceBuffer.addRaw('};')
        sourceBuffer.addRaw('componentCtx.slotRenderers.' + rendererId + '();')
    },

    /**
     * 编译普通节点
     *
     * @param {ANode} aNode 节点对象
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     * @param {Component} owner 所属组件实例环境
     * @param {Object} extra 编译所需的一些额外信息
     */
    compileElement: function (aNode, sourceBuffer, owner) {
        elementSourceCompiler.tagStart(sourceBuffer, aNode)
        elementSourceCompiler.inner(sourceBuffer, aNode, owner)
        elementSourceCompiler.tagEnd(sourceBuffer, aNode)
    },

    /**
     * 编译组件节点
     *
     * @param {ANode} aNode 节点对象
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     * @param {Component} owner 所属组件实例环境
     * @param {Object} extra 编译所需的一些额外信息
     * @param {Function} extra.ComponentClass 对应组件类
     */
    compileComponent: function (aNode, sourceBuffer, owner, extra) {
        let dataLiteral = '{}'

        sourceBuffer.addRaw('var $sourceSlots = [];')
        if (aNode.children) {
            const defaultSourceSlots = []
            const sourceSlotCodes = {}

            for (const child of aNode.children) {
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
            }

            if (defaultSourceSlots.length) {
                sourceBuffer.addRaw('$sourceSlots.push([function (componentCtx) {')
                sourceBuffer.addRaw('  var html = "";')
                defaultSourceSlots.forEach(child => aNodeCompiler.compile(child, sourceBuffer, owner))
                sourceBuffer.addRaw('  return html;')
                sourceBuffer.addRaw('}]);')
            }

            for (const key in sourceSlotCodes) {
                const sourceSlotCode = sourceSlotCodes[key]
                sourceBuffer.addRaw('$sourceSlots.push([function (componentCtx) {')
                sourceBuffer.addRaw('  var html = "";')
                sourceBuffer.addRaw(sourceSlotCode.children.forEach(function (child) {
                    aNodeCompiler.compile(child, sourceBuffer, owner)
                }))
                sourceBuffer.addRaw('  return html;')
                sourceBuffer.addRaw('}, ' + compileExprSource.expr(sourceSlotCode.prop.expr) + ']);')
            }
        }

        const givenData = []
        for (const prop of camelComponentBinds(aNode.props)) {
            postProp(prop)
            givenData.push(
                compileExprSource.stringLiteralize(prop.name) +
                ':' +
                compileExprSource.expr(prop.expr)
            )
        }

        dataLiteral = '{' + givenData.join(',\n') + '}'
        if (aNode.directives.bind) {
            dataLiteral = 'extend(' +
            compileExprSource.expr(aNode.directives.bind.value) +
            ', ' +
            dataLiteral +
            ')'
        }

        const renderId = compileComponentSource(sourceBuffer, extra.ComponentClass, owner.ssrContextId)
        sourceBuffer.addRaw('html += componentRenderers.' + renderId + '(')
        sourceBuffer.addRaw(dataLiteral + ', true, componentCtx, ' +
        stringifier.str(aNode.tagName) + ', $sourceSlots);')
        sourceBuffer.addRaw('$sourceSlots = null;')
    },

    /**
     * 编译组件加载器节点
     *
     * @param {ANode} aNode 节点对象
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     * @param {Component} owner 所属组件实例环境
     * @param {Object} extra 编译所需的一些额外信息
     * @param {Function} extra.ComponentClass 对应类
     */
    compileComponentLoader: function (aNode, sourceBuffer, owner, extra) {
        const LoadingComponent = extra.ComponentClass.placeholder
        if (typeof LoadingComponent === 'function') {
            aNodeCompiler.compileComponent(aNode, sourceBuffer, owner, {
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
* @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
* @param {Function} ComponentClass 组件类
* @param {string} contextId 构建render环境的id
* @return {string} 组件在当前环境下的方法标识
*/
function compileComponentSource (sourceBuffer, ComponentClass, contextId) {
    ComponentClass.ssrContext = ComponentClass.ssrContext || {}
    let componentIdInContext = ComponentClass.ssrContext[contextId]

    if (!componentIdInContext) {
        componentIdInContext = genSSRId()
        ComponentClass.ssrContext[contextId] = componentIdInContext

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
                        compileComponentSource(sourceBuffer, CmptClass, contextId)
                    }
                }
            )
        }

        sourceBuffer.addRaw('componentRenderers.' + componentIdInContext + ' = componentRenderers.' +
        componentIdInContext + '|| ' + componentIdInContext + ';')

        sourceBuffer.addRaw('var ' + componentIdInContext + 'Proto = ' + genComponentProtoCode(component))
        sourceBuffer.addRaw('function ' + componentIdInContext +
        '(data, noDataOutput, parentCtx, tagName, sourceSlots) {')
        sourceBuffer.addRaw('var html = "";')

        sourceBuffer.addRaw(genComponentContextCode(component, componentIdInContext))

        // init data
        const defaultData = component.data.get()
        sourceBuffer.addRaw('if (data) {')
        Object.keys(defaultData).forEach(function (key) {
            sourceBuffer.addRaw('componentCtx.data["' + key + '"] = componentCtx.data["' + key + '"] || ' +
            stringifier.any(defaultData[key]) + ';')
        })
        sourceBuffer.addRaw('}')

        // calc computed
        sourceBuffer.addRaw('var computedNames = componentCtx.proto.computedNames;')
        sourceBuffer.addRaw('for (var $i = 0; $i < computedNames.length; $i++) {')
        sourceBuffer.addRaw('  var $computedName = computedNames[$i];')
        sourceBuffer.addRaw('  data[$computedName] = componentCtx.proto.computed[$computedName](componentCtx);')
        sourceBuffer.addRaw('}')

        const ifDirective = component.aNode.directives['if'] // eslint-disable-line dot-notation
        if (ifDirective) {
            sourceBuffer.addRaw('if (' + compileExprSource.expr(ifDirective.value) + ') {')
        }

        elementSourceCompiler.tagStart(sourceBuffer, component.aNode, 'tagName')

        sourceBuffer.addRaw('if (!noDataOutput) {')
        sourceBuffer.joinDataStringify()
        sourceBuffer.addRaw('}')

        elementSourceCompiler.inner(sourceBuffer, component.aNode, component)
        elementSourceCompiler.tagEnd(sourceBuffer, component.aNode, 'tagName')

        if (ifDirective) {
            sourceBuffer.addRaw('}')
        }

        sourceBuffer.addRaw('return html;')
        sourceBuffer.addRaw('};')
    }

    return componentIdInContext
}

/**
* 生成组件 renderer 时 ctx 对象构建的代码
*
* @inner
* @param {Object} component 组件实例
* @return {string}
*/
function genComponentContextCode (component, componentIdInContext) {
    const code = ['var componentCtx = {']

    // proto
    code.push('proto: ' + componentIdInContext + 'Proto,')

    // sourceSlots
    code.push('sourceSlots: sourceSlots,')

    // data
    const defaultData = component.data.get()
    code.push('data: data || ' + stringifier.any(defaultData) + ',')

    // parentCtx
    code.push('owner: parentCtx,')

    // slotRenderers
    code.push('slotRenderers: {}')

    code.push('};')

    return code.join('\n')
}

/**
* 生成组件 proto 对象构建的代码
*
* @inner
* @param {Object} component 组件实例
* @return {string}
*/
function genComponentProtoCode (component) {
    const code = ['{']

    // members for call expr
    const ComponentProto = component.constructor.prototype

    const builtinKeys = ['components', '_cmptReady', 'aNode', 'constructor']

    Object.getOwnPropertyNames(ComponentProto).forEach(function (protoMemberKey) {
        if (builtinKeys.includes(protoMemberKey)) return

        const protoMember = ComponentProto[protoMemberKey]
        if (COMPONENT_RESERVED_MEMBERS[protoMemberKey] || !protoMember) {
            return
        }

        switch (typeof protoMember) {
        case 'function':
            code.push(protoMemberKey + ': ' + functionString(protoMember) + ',')
            break

        case 'object':
            code.push(protoMemberKey + ':')

            if (protoMember instanceof Array) {
                code.push('[')
                protoMember.forEach(function (item) {
                    code.push(typeof item === 'function' ? functionString(item) : '' + ',')
                })
                code.push(']')
            } else {
                code.push('{')

                Object.getOwnPropertyNames(protoMember).forEach(function (itemKey) {
                    const item = protoMember[itemKey]
                    if (typeof item === 'function') {
                        code.push(itemKey + ':' + functionString(item) + ',')
                    }
                })
                code.push('}')
            }

            code.push(',')
        }
    })

    // filters
    code.push('filters: {')
    const filterCode = []
    for (const key in component.filters) {
        if (component.filters.hasOwnProperty(key)) {
            const filter = component.filters[key]

            if (typeof filter === 'function') {
                filterCode.push(key + ': ' + functionString(filter))
            }
        }
    }
    code.push(filterCode.join(','))
    code.push('},')

    /* eslint-disable no-redeclare */
    // computed obj
    code.push('computed: {')
    const computedCode = []
    const computedNamesCode = []
    const computedNamesIndex = {}
    for (const key in component.computed) {
        if (component.computed.hasOwnProperty(key)) {
            const computed = component.computed[key]

            if (typeof computed === 'function') {
                if (!computedNamesIndex[key]) {
                    computedNamesIndex[key] = 1
                    computedNamesCode.push('"' + key + '"')
                }

                let fn = functionString(computed)
                fn = fn
                    .replace(/^\s*function\s*(\S+)?\(/, 'function $1 (componentCtx')
                    .replace(
                        /this.data.get\(([^)]+)\)/g,
                        function (match, exprLiteral) {
                            const exprStr = (new Function('return ' + exprLiteral))()   // eslint-disable-line
                            const expr = parseExpr(exprStr) as any

                            const ident = expr.paths[0].value
                            if (component.computed.hasOwnProperty(ident) &&
                                !computedNamesIndex[ident]
                            ) {
                                computedNamesIndex[ident] = 1
                                computedNamesCode.unshift('"' + ident + '"')
                            }

                            return compileExprSource.expr(expr)
                        }
                    )
                computedCode.push(key + ': ' + fn)
            }
        }
    }
    code.push(computedCode.join(','))
    code.push('},')

    // computed names
    code.push('computedNames: [')
    code.push(computedNamesCode.join(','))
    code.push('],')
    /* eslint-enable no-redeclare */

    // tagName
    code.push('tagName: "' + component.tagName + '"')
    code.push('};')

    return code.join('\n')
}

/* eslint-enable guard-for-in */

/**
* 将组件编译成 render 方法的 js 源码
*
* @param {Function} ComponentClass 组件类
* @return {string}
*/
export function generateRenderFunction (ComponentClass) {
    ssrIndex = 0
    const sourceBuffer = new CompileSourceBuffer()
    const contextId = genSSRId()

    const renderId = compileComponentSource(sourceBuffer, ComponentClass, contextId)
    sourceBuffer.addRaw('return componentRenderers.' + renderId + '(data, noDataOutput)')

    return sourceBuffer.toCode()
}

/**
 * 将组件类编译成 renderer 方法
 *
 * @param {Function} ComponentClass 组件类
 * @return {function(Object):string}
 */
export function compileToRenderer (ComponentClass) {
    let renderer = null

    if (!renderer) {
        const code = generateRenderFunction(ComponentClass)
        renderer = (new Function('return ' + code))()   // eslint-disable-line
        ComponentClass.__ssrRenderer = renderer
    }

    return renderer
}
