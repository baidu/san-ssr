import { each, contains, empty, extend, bind, inherits } from './utils/underscore'
import { PHPEmitter } from './emitters/php-emitter'

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
        let code = '$componentCtx["data"]'
        if (!accessorExpr) return code

        each(accessorExpr.paths, function (path) {
            if (path.type === 4) {
                code += `->{${compileExprSource.dataAccess(path)}}`
            } else if (typeof path.value === 'string') {
                code += `->{"${path.value}"}`
            } else if (typeof path.value === 'number') {
                code += `[${path.value}]`
            }
        })
        return `(isset(${code}) ? ${code} : null)`
    },

    /**
     * 生成调用表达式代码
     *
     * @param {Object?} callExpr 调用表达式对象
     * @return {string}
     */
    callExpr: function (callExpr) {
        const paths = callExpr.name.paths
        let code = `$componentCtx["instance"]->${paths[0].value}`

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
        each(callExpr.args, function (arg, index) {
            code += (index > 0 ? ', ' : '') + compileExprSource.expr(arg)
        })
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

        each(interpExpr.filters, function (filter) {
            const filterName = filter.name.paths[0].value

            switch (filterName) {
            case '_style':
            case '_class':
                code = '_::' + filterName + 'Filter(' + code + ')'
                break

            case '_xstyle':
            case '_xclass':
                code = '_::' + filterName + 'Filter(' + code + ', ' + compileExprSource.expr(filter.args[0]) + ')'
                break

            case 'url':
                code = 'encodeURIComponent(' + code + ')'
                break

            default:
                code = '_::callFilter($componentCtx, "' + filterName + '", [' + code
                each(filter.args, function (arg) {
                    code += ', ' + compileExprSource.expr(arg)
                })
                code += '])'
            }
        })

        if (!interpExpr.original) {
            return '_::escapeHTML(' + code + ')'
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

        each(textExpr.segs, function (seg) {
            const segCode = compileExprSource.expr(seg)
            code += code ? ' . ' + segCode : segCode
        })

        return code
    },

    /**
     * 生成数组字面量代码
     *
     * @param {Object} arrayExpr 数组字面量表达式对象
     * @return {string}
     */
    array: function (arrayExpr) {
        const items = []
        const spread = []

        each(arrayExpr.items, function (item) {
            items.push(compileExprSource.expr(item.expr))
            spread.push(item.spread ? 1 : 0)
        })

        return `_::spread([${items.join(', ')}], ${JSON.stringify(spread)})`
    },

    /**
     * 生成对象字面量代码
     *
     * @param {Object} objExpr 对象字面量表达式对象
     * @return {string}
     */
    object: function (objExpr) {
        const items = []
        const spread = []

        each(objExpr.items, function (item) {
            if (item.spread) {
                spread.push(1)
                items.push(compileExprSource.expr(item.expr))
            } else {
                spread.push(0)
                const key = compileExprSource.expr(item.name)
                const val = compileExprSource.expr(item.expr)
                items.push(`[${key}, ${val}]`)
            }
        })
        return `_::objSpread([${items.join(',')}], ${JSON.stringify(spread)})`
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
    * 添加renderer方法的起始源码
    */
    addRendererStart (funcName) {
        this.addRaw(`function ${funcName}($data, $noDataOutput) {`)
    }

    /**
    * 添加renderer方法的结束源码
    */
    addRendererEnd () {
        this.addRaw('}')
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
                code.push('$html .= ' + compileExprSource.stringLiteralize(temp) + ';')
            }

            temp = ''
        }

        each(this.segs, function (seg) {
            if (seg.type === 'JOIN_STRING') {
                temp += seg.str
                return
            }

            genStrLiteral()
            switch (seg.type) {
            case 'JOIN_DATA_STRINGIFY':
                code.push('$html .= "<!--s-data:" . json_encode(' +
                compileExprSource.dataAccess() + ', JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "-->";')
                break

            case 'JOIN_EXPR':
                code.push('$html .= ' + compileExprSource.expr(seg.expr) + ';')
                break

            case 'JOIN_RAW':
                code.push('$html .= ' + seg.code + ';')
                break

            case 'RAW':
                code.push(seg.code)
                break
            }
        })

        genStrLiteral()

        return code.join('\n')
    }
}

/**
* 获取唯一id
*
* @type {number} 唯一id
*/
let guid = 1

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
* svgTags
*
* @see https://www.w3.org/TR/SVG/svgdtd.html 只取常用
* @type {Object}
*/
const svgTags = splitStr2Obj('' +
// structure
'svg,g,defs,desc,metadata,symbol,use,' +
// image & shape
'image,path,rect,circle,line,ellipse,polyline,polygon,' +
// text
'text,tspan,tref,textpath,' +
// other
'marker,pattern,clippath,mask,filter,cursor,view,animate,' +
// font
'font,font-face,glyph,missing-glyph,' +
// camel
'animateColor,animateMotion,animateTransform,textPath,foreignObject'
)

/**
* 创建 DOM 元素
*
* @param  {string} tagName tagName
* @return {HTMLElement}
*/
function createEl (tagName) {
    if (svgTags[tagName]) {
        return document.createElementNS('http://www.w3.org/2000/svg', tagName)
    }

    return document.createElement(tagName)
}

/**
* 将 DOM 从页面中移除
*
* @param {HTMLElement} el DOM元素
*/
function removeEl (el) {
    if (el && el.parentNode) {
        el.parentNode.removeChild(el)
    }
}

// 该方法参照了vue2.5.0的实现，感谢vue团队
// SEE: https://github.com/vuejs/vue/blob/0948d999f2fddf9f90991956493f976273c5da1f/src/core/util/env.js#L68

/**
* 下一个周期要执行的任务列表
*
* @inner
* @type {Array}
*/
let nextTasks = []

/**
* 执行下一个周期任务的函数
*
* @inner
* @type {Function}
*/
let nextHandler

/**
* 在下一个时间周期运行任务
*
* @inner
* @param {Function} fn 要运行的任务函数
* @param {Object=} thisArg this指向对象
*/
function nextTick (fn, thisArg) {
    if (thisArg) {
        fn = bind(fn, thisArg)
    }
    nextTasks.push(fn)

    if (nextHandler) {
        return
    }

    nextHandler = function () {
        const tasks = nextTasks.slice(0)
        nextTasks = []
        nextHandler = null

        for (let i = 0, l = tasks.length; i < l; i++) {
            tasks[i]()
        }
    }

    // 非标准方法，但是此方法非常吻合要求。
    /* istanbul ignore next */
    if (typeof setImmediate === 'function') {
        setImmediate(nextHandler)
    } else if (typeof MessageChannel === 'function') {
    // 用MessageChannel去做setImmediate的polyfill
    // 原理是将新的message事件加入到原有的dom events之后
        const channel = new MessageChannel()
        const port = channel.port2
        channel.port1.onmessage = nextHandler
        port.postMessage(1)
    } else {
        setTimeout(nextHandler, 0)
    }
}

/**
* 自闭合标签列表
*
* @type {Object}
*/
const autoCloseTags = splitStr2Obj('area,base,br,col,embed,hr,img,input,keygen,param,source,track,wbr')

/**
* 字符串源码读取类，用于模板字符串解析过程
*
* @class
* @param {string} source 要读取的字符串
*/
class Walker {
    source: any
    len: number
    index: number
    constructor (source) {
        this.source = source
        this.len = this.source.length
        this.index = 0
    }

    /**
    * 获取当前字符码
    *
    * @return {number}
    */
    currentCode () {
        return this.source.charCodeAt(this.index)
    }

    /**
    * 截取字符串片段
    *
    * @param {number} start 起始位置
    * @param {number} end 结束位置
    * @return {string}
    */
    cut (start, end?) {
        return this.source.slice(start, end)
    }

    /**
    * 向前读取字符
    *
    * @param {number} distance 读取字符数
    */
    go (distance) {
        this.index += distance
    }

    /**
    * 读取下一个字符，返回下一个字符的 code
    *
    * @return {number}
    */
    nextCode () {
        this.go(1)
        return this.currentCode()
    }

    /**
    * 获取相应位置字符的 code
    *
    * @param {number} index 字符位置
    * @return {number}
    */
    charCode (index) {
        return this.source.charCodeAt(index)
    }

    /**
    * 向前读取字符，直到遇到指定字符再停止
    * 未指定字符时，当遇到第一个非空格、制表符的字符停止
    *
    * @param {number=} charCode 指定字符的code
    * @return {boolean} 当指定字符时，返回是否碰到指定的字符
    */
    goUntil (charCode) {
        let code
        while (this.index < this.len && (code = this.currentCode())) {
            switch (code) {
            case 32: // 空格 space
            case 9: // 制表符 tab
            case 13: // \r
            case 10: // \n
                this.index++
                break

            default:
                if (code === charCode) {
                    this.index++
                    return 1
                }
                return
            }
        }
    }

    /**
    * 向前读取符合规则的字符片段，并返回规则匹配结果
    *
    * @param {RegExp} reg 字符片段的正则表达式
    * @param {boolean} isMatchStart 是否必须匹配当前位置
    * @return {Array?}
    */
    match (reg, isMatchStart?) {
        reg.lastIndex = this.index

        const match = reg.exec(this.source)
        if (match && (!isMatchStart || this.index === match.index)) {
            this.index = reg.lastIndex
            return match
        }
    }
}

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
* 创建访问表达式对象
*
* @param {Array} paths 访问路径
* @return {Object}
*/
function createAccessor (paths) {
    return {
        type: 4,
        paths: paths
    }
}

/**
* 读取字符串
*
* @param {Walker} walker 源码读取对象
* @return {Object}
*/
function readString (walker) {
    const startCode = walker.currentCode()
    const startIndex = walker.index
    let charCode

    walkLoop: while ((charCode = walker.nextCode())) {
        switch (charCode) {
        case 92: // \
            walker.go(1)
            break
        case startCode:
            walker.go(1)
            break walkLoop
        }
    }

    const literal = walker.cut(startIndex, walker.index)
    return {
        type: 1,
        // 处理字符转义
    value: (new Function('return ' + literal))()    // eslint-disable-line
    }
}

/**
* 读取一元表达式
*
* @param {Walker} walker 源码读取对象
* @return {Object}
*/
function readUnaryExpr (walker) {
    walker.goUntil()

    switch (walker.currentCode()) {
    case 33: // !
        walker.go(1)
        return {
            type: 9,
            expr: readUnaryExpr(walker),
            operator: 33
        }

    case 34: // "
    case 39: // '
        return readString(walker)

    case 45: // -
    case 48: // number
    case 49:
    case 50:
    case 51:
    case 52:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57:
        return readNumber(walker)

    case 40: // (
        return readParenthesizedExpr(walker)

        // array literal
    case 91: // [
        walker.go(1)
        const arrItems = []
        while (!walker.goUntil(93)) { // ]
            const item: any = {}
            arrItems.push(item)

            if (walker.currentCode() === 46 && walker.match(/\.\.\.\s*/g)) {
                item.spread = true
            }

            item.expr = readTertiaryExpr(walker)
            walker.goUntil(44) // ,
        }

        return {
            type: 12,
            items: arrItems
        }

        // object literal
    case 123: // {
        walker.go(1)
        const objItems = []

        while (!walker.goUntil(125)) { // }
            const item: any = {}
            objItems.push(item)

            if (walker.currentCode() === 46 && walker.match(/\.\.\.\s*/g)) {
                item.spread = true
                item.expr = readTertiaryExpr(walker)
            } else {
                // #[begin] error
                const walkerIndexBeforeName = walker.index
                // #[end]

                item.name = readUnaryExpr(walker)

                // #[begin] error
                if (item.name.type > 4) {
                    throw new Error(
                        '[SAN FATAL] unexpect object name: ' +
                        walker.cut(walkerIndexBeforeName, walker.index)
                    )
                }
                // #[end]

                if (walker.goUntil(58)) { // :
                    item.expr = readTertiaryExpr(walker)
                } else {
                    item.expr = item.name
                }

                if (item.name.type === 4) {
                    item.name = item.name.paths[0]
                }
            }

            walker.goUntil(44) // ,
        }

        return {
            type: 11,
            items: objItems
        }
    }

    return readCall(walker)
}

/**
* 读取数字
*
* @inner
* @param {Walker} walker 源码读取对象
* @return {Object}
*/
function readNumber (walker) {
    const match = walker.match(/\s*(-?[0-9]+(\.[0-9]+)?)/g, 1)

    if (match) {
        return {
            type: 2,
            value: +match[1]
        }
    } else if (walker.currentCode() === 45) {
        walker.go(1)
        return {
            type: 9,
            expr: readUnaryExpr(walker),
            operator: 45
        }
    }
}

/**
* 读取ident
* 这里的 ident 指标识符(identifier)，也就是通常意义上的变量名
* 这里默认的变量名规则为：由美元符号($)、数字、字母或者下划线(_)构成的字符串
*
* @inner
* @param {Walker} walker 源码读取对象
* @return {string}
*/
function readIdent (walker) {
    const match = walker.match(/\s*([$0-9a-z_]+)/ig, 1)

    // #[begin] error
    if (!match) {
        throw new Error('[SAN FATAL] expect an ident: ' + walker.cut(walker.index))
    }
    // #[end]

    return match[1]
}

/**
* 读取三元表达式
*
* @param {Walker} walker 源码读取对象
* @return {Object}
*/
function readTertiaryExpr (walker) {
    const conditional = readLogicalORExpr(walker)
    walker.goUntil()

    if (walker.currentCode() === 63) { // ?
        walker.go(1)
        const yesExpr = readTertiaryExpr(walker)
        walker.goUntil()

        if (walker.currentCode() === 58) { // :
            walker.go(1)
            return {
                type: 10,
                segs: [
                    conditional,
                    yesExpr,
                    readTertiaryExpr(walker)
                ]
            }
        }
    }

    return conditional
}

// var readTertiaryExpr = require('./read-tertiary-expr');

/**
* 读取访问表达式
*
* @param {Walker} walker 源码读取对象
* @return {Object}
*/
function readAccessor (walker) {
    const firstSeg = readIdent(walker)
    switch (firstSeg) {
    case 'true':
    case 'false':
        return {
            type: 3,
            value: firstSeg === 'true'
        }
    case 'null':
        return {
            type: 13
        }
    }

    const result = createAccessor([
        {
            type: 1,
            value: firstSeg
        }
    ])

    /* eslint-disable no-constant-condition */
    accessorLoop: while (1) {
    /* eslint-enable no-constant-condition */

        switch (walker.currentCode()) {
        case 46: // .
            walker.go(1)

            // ident as string
            result.paths.push({
                type: 1,
                value: readIdent(walker)
            })
            break

        case 91: // [
            walker.go(1)
            result.paths.push(readTertiaryExpr(walker))
            walker.goUntil(93) // ]
            break

        default:
            break accessorLoop
        }
    }

    return result
}

/**
* 读取调用
*
* @param {Walker} walker 源码读取对象
* @param {Array=} defaultArgs 默认参数
* @return {Object}
*/
function readCall (walker, defaultArgs?) {
    walker.goUntil()
    const result = readAccessor(walker)

    let args
    if (walker.goUntil(40)) { // (
        args = []

        while (!walker.goUntil(41)) { // )
            args.push(readTertiaryExpr(walker))
            walker.goUntil(44) // ,
        }
    } else if (defaultArgs) {
        args = defaultArgs
    }

    if (args) {
        return {
            type: 6,
            name: result,
            args: args
        }
    }

    return result
}

/**
* 读取括号表达式
*
* @param {Walker} walker 源码读取对象
* @return {Object}
*/
function readParenthesizedExpr (walker) {
    walker.go(1)
    const expr = readTertiaryExpr(walker)
    walker.goUntil(41) // )

    expr.parenthesized = true
    return expr
}

/**
* 读取乘法表达式
*
* @param {Walker} walker 源码读取对象
* @return {Object}
*/
function readMultiplicativeExpr (walker) {
    let expr = readUnaryExpr(walker)

    while (1) {
        walker.goUntil()

        const code = walker.currentCode()
        switch (code) {
        case 37: // %
        case 42: // *
        case 47: // /
            walker.go(1)
            expr = {
                type: 8,
                operator: code,
                segs: [expr, readUnaryExpr(walker)]
            }
            continue
        }

        break
    }

    return expr
}

/**
* 读取加法表达式
*
* @param {Walker} walker 源码读取对象
* @return {Object}
*/
function readAdditiveExpr (walker) {
    let expr = readMultiplicativeExpr(walker)

    while (1) {
        walker.goUntil()
        const code = walker.currentCode()

        switch (code) {
        case 43: // +
        case 45: // -
            walker.go(1)
            expr = {
                type: 8,
                operator: code,
                segs: [expr, readMultiplicativeExpr(walker)]
            }
            continue
        }

        break
    }

    return expr
}

/**
* 读取关系判断表达式
*
* @param {Walker} walker 源码读取对象
* @return {Object}
*/
function readRelationalExpr (walker) {
    const expr = readAdditiveExpr(walker)
    walker.goUntil()

    let code = walker.currentCode()
    switch (code) {
    case 60: // <
    case 62: // >
        if (walker.nextCode() === 61) {
            code += 61
            walker.go(1)
        }

        return {
            type: 8,
            operator: code,
            segs: [expr, readAdditiveExpr(walker)]
        }
    }

    return expr
}

/**
* 读取相等比对表达式
*
* @param {Walker} walker 源码读取对象
* @return {Object}
*/
function readEqualityExpr (walker) {
    const expr = readRelationalExpr(walker)
    walker.goUntil()

    let code = walker.currentCode()
    switch (code) {
    case 61: // =
    case 33: // !
        if (walker.nextCode() === 61) {
            code += 61
            if (walker.nextCode() === 61) {
                code += 61
                walker.go(1)
            }

            return {
                type: 8,
                operator: code,
                segs: [expr, readRelationalExpr(walker)]
            }
        }

        walker.go(-1)
    }

    return expr
}

/**
* 读取逻辑与表达式
*
* @param {Walker} walker 源码读取对象
* @return {Object}
*/
function readLogicalANDExpr (walker) {
    const expr = readEqualityExpr(walker)
    walker.goUntil()

    if (walker.currentCode() === 38) { // &
        if (walker.nextCode() === 38) {
            walker.go(1)
            return {
                type: 8,
                operator: 76,
                segs: [expr, readLogicalANDExpr(walker)]
            }
        }

        walker.go(-1)
    }

    return expr
}

/**
* 读取逻辑或表达式
*
* @param {Walker} walker 源码读取对象
* @return {Object}
*/
function readLogicalORExpr (walker) {
    const expr = readLogicalANDExpr(walker)
    walker.goUntil()

    if (walker.currentCode() === 124) { // |
        if (walker.nextCode() === 124) {
            walker.go(1)
            return {
                type: 8,
                operator: 248,
                segs: [expr, readLogicalORExpr(walker)]
            }
        }

        walker.go(-1)
    }

    return expr
}

/**
* 解析表达式
*
* @param {string} source 源码
* @return {Object}
*/
function parseExpr (source) {
    if (!source) {
        return
    }

    if (typeof source === 'object' && source.type) {
        return source
    }

    const expr = readTertiaryExpr(new Walker(source))
    expr.raw = source
    return expr
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
            if (inner) {
                return inner + ' ' + outer
            }

            return outer
        }

        return inner
    },

    _xstyle: function (outer, inner) {
        outer = outer && defaultStyleFilter(outer)
        if (outer) {
            if (inner) {
                return inner + ';' + outer
            }

            return outer
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
* 判断变更表达式与多个表达式之间的关系，0为完全没关系，1为有关系
*
* @inner
* @param {Object} changeExpr 目标表达式
* @param {Array} exprs 多个源表达式
* @param {Data} data 表达式所属数据环境
* @return {number}
*/
function changeExprCompareExprs (changeExpr, exprs, data) {
    for (let i = 0, l = exprs.length; i < l; i++) {
        if (changeExprCompare(changeExpr, exprs[i], data)) {
            return 1
        }
    }

    return 0
}

/**
* 比较变更表达式与目标表达式之间的关系，用于视图更新判断
* 视图更新需要根据其关系，做出相应的更新行为
*
* 0: 完全没关系
* 1: 变更表达式是目标表达式的母项(如a与a.b) 或 表示需要完全变化
* 2: 变更表达式是目标表达式相等
* >2: 变更表达式是目标表达式的子项，如a.b.c与a.b
*
* @param {Object} changeExpr 变更表达式
* @param {Object} expr 要比较的目标表达式
* @param {Data} data 表达式所属数据环境
* @return {number}
*/
function changeExprCompare (changeExpr, expr, data) {
    let result = 0
    if (!expr.changeCache) {
        expr.changeCache = {}
    }

    if (changeExpr.raw && !expr.dynamic) {
        if (expr.changeCache[changeExpr.raw] != null) {
            return expr.changeCache[changeExpr.raw]
        }
    }

    switch (expr.type) {
    case 4:
        const paths = expr.paths
        const pathsLen = paths.length
        const changePaths = changeExpr.paths
        const changeLen = changePaths.length

        result = 1
        for (let i = 0; i < pathsLen; i++) {
            const pathExpr = paths[i]
            const pathExprValue = pathExpr.value

            if (pathExprValue == null && changeExprCompare(changeExpr, pathExpr, data)) {
                result = 1
                break
            }

            if (result && i < changeLen &&
                /* eslint-disable eqeqeq */
                (pathExprValue || evalExpr(pathExpr, data)) != changePaths[i].value
                /* eslint-enable eqeqeq */
            ) {
                result = 0
            }
        }

        if (result) {
            result = Math.max(1, changeLen - pathsLen + 2)
        }
        break

    case 9:
        result = changeExprCompare(changeExpr, expr.expr, data) ? 1 : 0
        break

    case 7:
    case 8:
    case 10:
        result = changeExprCompareExprs(changeExpr, expr.segs, data)
        break

    case 12:
    case 11:
        for (let i = 0; i < expr.items.length; i++) {
            if (changeExprCompare(changeExpr, expr.items[i].expr, data)) {
                result = 1
                break
            }
        }

        break

    case 5:
        if (changeExprCompare(changeExpr, expr.expr, data)) {
            result = 1
        } else {
            for (let i = 0; i < expr.filters.length; i++) {
                if (changeExprCompareExprs(changeExpr, expr.filters[i].args, data)) {
                    result = 1
                    break
                }
            }
        }

        break

    case 6:
        if (changeExprCompareExprs(changeExpr, expr.name.paths, data) ||
            changeExprCompareExprs(changeExpr, expr.args, data)
        ) {
            result = 1
        }
        break
    }

    if (changeExpr.raw && !expr.dynamic) {
        expr.changeCache[changeExpr.raw] = result
    }

    return result
}

function lifeCycleOwnIs (name) {
    return this[name]
}

/* eslint-disable fecs-valid-var-jsdoc */
/**
* 节点生命周期信息
*
* @inner
* @type {Object}
*/
const LifeCycle = {
    start: {},

    compiled: {
        is: lifeCycleOwnIs,
        compiled: true
    },

    inited: {
        is: lifeCycleOwnIs,
        compiled: true,
        inited: true
    },

    created: {
        is: lifeCycleOwnIs,
        compiled: true,
        inited: true,
        created: true
    },

    attached: {
        is: lifeCycleOwnIs,
        compiled: true,
        inited: true,
        created: true,
        attached: true
    },

    leaving: {
        is: lifeCycleOwnIs,
        compiled: true,
        inited: true,
        created: true,
        attached: true,
        leaving: true
    },

    detached: {
        is: lifeCycleOwnIs,
        compiled: true,
        inited: true,
        created: true,
        detached: true
    },

    disposed: {
        is: lifeCycleOwnIs,
        disposed: true
    }
}
/* eslint-enable fecs-valid-var-jsdoc */

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
* HTML 属性和 DOM 操作属性的对照表
*
* @inner
* @const
* @type {Object}
*/
const HTML_ATTR_PROP_MAP = {
    'readonly': 'readOnly',
    'cellpadding': 'cellPadding',
    'cellspacing': 'cellSpacing',
    'colspan': 'colSpan',
    'rowspan': 'rowSpan',
    'valign': 'vAlign',
    'usemap': 'useMap',
    'frameborder': 'frameBorder',
    'for': 'htmlFor'
}

/**
* 默认的元素的属性设置的变换方法
*
* @inner
* @type {Object}
*/

function defaultElementPropHandler (el, value, name) {
    const propName = HTML_ATTR_PROP_MAP[name] || name
    value = value == null ? '' : value
    // input 的 type 是个特殊属性，其实也应该用 setAttribute
    // 但是 type 不应该运行时动态改变，否则会有兼容性问题
    // 所以这里直接就不管了
    if (propName in el) {
        el[propName] = value
    } else {
        el.setAttribute(name, value)
    }

// attribute 绑定的是 text，所以不会出现 null 的情况，这里无需处理
// 换句话来说，san 是做不到 attribute 时有时无的
// if (value == null) {
//     el.removeAttribute(name);
// }
}

function svgPropHandler (el, value, name) {
    el.setAttribute(name, value)
}

function boolPropHandler (el, value, name, element, prop?) {
    const propName = HTML_ATTR_PROP_MAP[name] || name
    el[propName] = !!((prop && prop.raw == null) ||
    (value && value !== 'false' && value !== '0'))
}

/* eslint-disable fecs-properties-quote */
/**
* 默认的属性设置变换方法
*
* @inner
* @type {Object}
*/
const defaultElementPropHandlers = {
    style: function (el, value) {
        el.style.cssText = value
    },

'class': function (el, value) { // eslint-disable-line
        if (el.className !== value) {
            el.className = value
        }
    },

    slot: empty,

    draggable: boolPropHandler
}
/* eslint-enable fecs-properties-quote */

const analInputChecker = {
    checkbox: contains,
    radio: function (a, b) {
        return a === b
    }
}

function analInputCheckedState (element, value) {
    const bindValue = getANodeProp(element.aNode, 'value')
    const bindType = getANodeProp(element.aNode, 'type')

    if (bindValue && bindType) {
        const type = evalExpr(bindType.expr, element.scope, element.owner)

        if (analInputChecker[type]) {
            const bindChecked = getANodeProp(element.aNode, 'checked')
            if (bindChecked != null && !bindChecked.hintExpr) {
                bindChecked.hintExpr = bindValue.expr
            }

            return !!analInputChecker[type](
                value,
                element.data
                    ? evalExpr(bindValue.expr, element.data, element)
                    : evalExpr(bindValue.expr, element.scope, element.owner)
            )
        }
    }
}

const elementPropHandlers = {
    input: {
        multiple: boolPropHandler,
        checked: function (el, value, name, element) {
            const state = analInputCheckedState(element, value)
            boolPropHandler(
                el,
                state != null ? state : value,
                'checked',
                element
            )
        },
        readonly: boolPropHandler,
        disabled: boolPropHandler,
        autofocus: boolPropHandler,
        required: boolPropHandler
    },

    option: {
        value: function (el, value, name, element) {
            defaultElementPropHandler(el, value, name)

            if (isOptionSelected(element, value)) {
                el.selected = true
            }
        }
    },

    select: {
        value: function (el, value) {
            el.value = value || ''
        },
        readonly: boolPropHandler,
        disabled: boolPropHandler,
        autofocus: boolPropHandler,
        required: boolPropHandler
    },

    textarea: {
        readonly: boolPropHandler,
        disabled: boolPropHandler,
        autofocus: boolPropHandler,
        required: boolPropHandler
    },

    button: {
        disabled: boolPropHandler,
        autofocus: boolPropHandler,
        type: function (el, value) {
            el.setAttribute('type', value)
        }
    }
}

function isOptionSelected (element, value) {
    let parentSelect = element.parent
    while (parentSelect) {
        if (parentSelect.tagName === 'select') {
            break
        }

        parentSelect = parentSelect.parent
    }

    if (parentSelect) {
        let selectValue = null
        let prop
        let expr

        if ((prop = getANodeProp(parentSelect.aNode, 'value')) &&
        (expr = prop.expr)
        ) {
            selectValue = parentSelect.nodeType === 5
                ? evalExpr(expr, parentSelect.data, parentSelect)
                : evalExpr(expr, parentSelect.scope, parentSelect.owner) ||
            ''
        }

        if (selectValue === value) {
            return 1
        }
    }
}

/**
* 获取属性处理对象
*
* @param {string} tagName 元素tag
* @param {string} attrName 属性名
* @return {Object}
*/
function getPropHandler (tagName, attrName) {
    if (svgTags[tagName]) {
        return svgPropHandler
    }

    let tagPropHandlers = elementPropHandlers[tagName]
    if (!tagPropHandlers) {
        tagPropHandlers = elementPropHandlers[tagName] = {}
    }

    let propHandler = tagPropHandlers[attrName]
    if (!propHandler) {
        propHandler = defaultElementPropHandlers[attrName] || defaultElementPropHandler
        tagPropHandlers[attrName] = propHandler
    }

    return propHandler
}

/**
* 判断变更是否来源于元素，来源于元素时，视图更新需要阻断
*
* @param {Object} change 变更对象
* @param {Element} element 元素
* @param {string?} propName 属性名，可选。需要精确判断是否来源于此属性时传入
* @return {boolean}
*/
function isDataChangeByElement (change, element, propName?) {
    const changeTarget = change.option.target
    return changeTarget && changeTarget.node === element &&
    (!propName || changeTarget.prop === propName)
}

/**
* 在对象上使用accessor表达式查找方法
*
* @param {Object} source 源对象
* @param {Object} nameExpr 表达式
* @param {Data} data 所属数据环境
* @return {Function}
*/
function findMethod (source, nameExpr, data?) {
    let method = source

    for (let i = 0; method != null && i < nameExpr.paths.length; i++) {
        method = method[evalExpr(nameExpr.paths[i], data)]
    }

    return method
}

/**
* 数据类
*
* @class
* @param {Object?} data 初始数据
* @param {Model?} parent 父级数据容器
*/
class Data {
    parent: any
    raw: any
    listeners: any[]
    typeChecker: any
    constructor (data, parent) {
        this.parent = parent
        this.raw = data || {}
        this.listeners = []
    }

    // #[begin] error
    // 以下两个函数只在开发模式下可用，在生产模式下不存在
    /**
    * DataTypes 检测
    */
    checkDataTypes () {
        if (this.typeChecker) {
            this.typeChecker(this.raw)
        }
    }

    /**
    * 设置 type checker
    *
    * @param  {Function} typeChecker 类型校验器
    */
    setTypeChecker (typeChecker) {
        this.typeChecker = typeChecker
    }

    // #[end]

    /**
    * 添加数据变更的事件监听器
    *
    * @param {Function} listener 监听函数
    */
    listen (listener) {
        if (typeof listener === 'function') {
            this.listeners.push(listener)
        }
    }

    /**
    * 移除数据变更的事件监听器
    *
    * @param {Function} listener 监听函数
    */
    unlisten (listener) {
        let len = this.listeners.length
        while (len--) {
            if (!listener || this.listeners[len] === listener) {
                this.listeners.splice(len, 1)
            }
        }
    }

    /**
    * 触发数据变更
    *
    * @param {Object} change 变更信息对象
    */
    fire (change) {
        if (change.option.silent || change.option.silence || change.option.quiet) {
            return
        }

        for (let i = 0; i < this.listeners.length; i++) {
            this.listeners[i].call(this, change)
        }
    }

    /**
    * 获取数据项
    *
    * @param {string|Object?} expr 数据项路径
    * @param {Data?} callee 当前数据获取的调用环境
    * @return {*}
    */
    get (expr, callee?) {
        let value = this.raw
        if (!expr) {
            return value
        }

        if (typeof expr !== 'object') {
            expr = parseExpr(expr)
        }

        const paths = expr.paths
        callee = callee || this

        value = value[paths[0].value]

        if (value == null && this.parent) {
            value = this.parent.get(expr, callee)
        } else {
            for (let i = 1, l = paths.length; value != null && i < l; i++) {
                value = value[paths[i].value || evalExpr(paths[i], callee)]
            }
        }

        return value
    }
    push (expr, item, option) {
        const target = this.get(expr)

        if (target instanceof Array) {
            this.splice(expr, [target.length, 0, item], option)
            return target.length + 1
        }
    }

    pop (expr, option) {
        const target = this.get(expr)

        if (target instanceof Array) {
            const len = target.length
            if (len) {
                return this.splice(expr, [len - 1, 1], option)[0]
            }
        }
    }
    shift (expr, option) {
        return this.splice(expr, [0, 1], option)[0]
    }

    unshift (expr, item, option) {
        const target = this.get(expr)

        if (target instanceof Array) {
            this.splice(expr, [0, 0, item], option)
            return target.length + 1
        }
    }

    removeAt (expr, index, option) {
        this.splice(expr, [index, 1], option)
    }
    remove (expr, value, option) {
        const target = this.get(expr)

        if (target instanceof Array) {
            let len = target.length
            while (len--) {
                if (target[len] === value) {
                    this.splice(expr, [len, 1], option)
                    break
                }
            }
        }
    }
    set (expr, value, option = { force: false }) {
        const exprRaw = expr

        expr = parseExpr(expr)

        if (expr.type !== 4) {
            throw new Error('[SAN ERROR] Invalid Expression in Data set: ' + exprRaw)
        }

        if (this.get(expr) === value && !option.force) {
            return
        }

        const prop = expr.paths[0].value
        this.raw[prop] = immutableSet(this.raw[prop], expr.paths, 1, expr.paths.length, value, this)

        this.fire({
            type: 1,
            expr: expr,
            value: value,
            option: option
        })

        this.checkDataTypes()
    }

    merge (expr, source, option) {
        option = option || {}

        // #[begin] error
        const exprRaw = expr
        // #[end]

        expr = parseExpr(expr)

        // #[begin] error
        if (expr.type !== 4) {
            throw new Error('[SAN ERROR] Invalid Expression in Data merge: ' + exprRaw)
        }

        if (typeof source !== 'object') {
            throw new Error('[SAN ERROR] Merge Expects a Source of Type \'object\'; got ' + typeof source)
        }
        // #[end]

    for (var key in source) { // eslint-disable-line
            this.set(
                createAccessor(
                    expr.paths.concat(
                        [
                            {
                                type: 1,
                                value: key
                            }
                        ]
                    )
                ),
                source[key],
                option
            )
        }
    }

    apply (expr, fn, option) {
    // #[begin] error
        const exprRaw = expr
        // #[end]

        expr = parseExpr(expr)

        // #[begin] error
        if (expr.type !== 4) {
            throw new Error('[SAN ERROR] Invalid Expression in Data apply: ' + exprRaw)
        }
        // #[end]

        const oldValue = this.get(expr)

        // #[begin] error
        if (typeof fn !== 'function') {
            throw new Error(
                '[SAN ERROR] Invalid Argument\'s Type in Data apply: ' +
            'Expected Function but got ' + typeof fn
            )
        }
        // #[end]

        this.set(expr, fn(oldValue), option)
    }

    splice (expr, args, option) {
        option = option || {}
        // #[begin] error
        const exprRaw = expr
        // #[end]

        expr = parseExpr(expr)

        // #[begin] error
        if (expr.type !== 4) {
            throw new Error('[SAN ERROR] Invalid Expression in Data splice: ' + exprRaw)
        }
        // #[end]

        const target = this.get(expr)
        let returnValue = []

        if (target instanceof Array) {
            let index = args[0]
            const len = target.length
            if (index > len) {
                index = len
            } else if (index < 0) {
                index = len + index
                if (index < 0) {
                    index = 0
                }
            }

            const newArray = target.slice(0)
            returnValue = newArray.splice.apply(newArray, args)

            this.raw = immutableSet(this.raw, expr.paths, 0, expr.paths.length, newArray, this)

            this.fire({
                expr: expr,
                type: 2,
                index: index,
                deleteCount: returnValue.length,
                value: returnValue,
                insertions: args.slice(2),
                option: option
            })
        }

        // #[begin] error
        this.checkDataTypes()
        // #[end]

        return returnValue
    }
}

/**
* 数据对象变更操作
*
* @inner
* @param {Object|Array} source 要变更的源数据
* @param {Array} exprPaths 属性路径
* @param {number} pathsStart 当前处理的属性路径指针位置
* @param {number} pathsLen 属性路径长度
* @param {*} value 变更属性值
* @param {Data} data 对应的Data对象
* @return {*} 变更后的新数据
*/
function immutableSet (source, exprPaths, pathsStart, pathsLen, value, data) {
    if (pathsStart >= pathsLen) {
        return value
    }

    if (source == null) {
        source = {}
    }

    const pathExpr = exprPaths[pathsStart]
    let prop = evalExpr(pathExpr, data)
    let result = source

    if (source instanceof Array) {
        const index = +prop
        prop = isNaN(index) ? prop : index

        result = source.slice(0)
        result[prop] = immutableSet(source[prop], exprPaths, pathsStart + 1, pathsLen, value, data)
    } else if (typeof source === 'object') {
        result = {}

        for (const key in source) {
            /* istanbul ignore else  */
            if (key !== prop && source.hasOwnProperty(key)) {
                result[key] = source[key]
            }
        }

        result[prop] = immutableSet(source[prop], exprPaths, pathsStart + 1, pathsLen, value, data)
    }

    if (pathExpr.value == null) {
        exprPaths[pathsStart] = {
            type: typeof prop === 'string' ? 1 : 2,
            value: prop
        }
    }

    return result
}

/**
* 判断变更数组是否影响到数据引用摘要
*
* @param {Array} changes 变更数组
* @param {Object} dataRef 数据引用摘要
* @return {boolean}
*/
function changesIsInDataRef (changes, dataRef) {
    if (dataRef) {
        for (let i = 0; i < changes.length; i++) {
            const change = changes[i]

            if (!change.overview) {
                const paths = change.expr.paths
                change.overview = paths[0].value

                if (paths.length > 1) {
                    change.extOverview = paths[0].value + '.' + paths[1].value
                    change.wildOverview = paths[0].value + '.*'
                }
            }

            if (dataRef[change.overview] ||
            (change.wildOverview && dataRef[change.wildOverview]) ||
            (change.extOverview && dataRef[change.extOverview])
            ) {
                return true
            }
        }
    }
}

/**
* insertBefore 方法的兼容性封装
*
* @param {HTMLNode} targetEl 要插入的节点
* @param {HTMLElement} parentEl 父元素
* @param {HTMLElement?} beforeEl 在此元素之前插入
*/
function insertBefore (targetEl, parentEl, beforeEl) {
    if (parentEl) {
        if (beforeEl) {
            parentEl.insertBefore(targetEl, beforeEl)
        } else {
            parentEl.appendChild(targetEl)
        }
    }
}

const baseProps = {
    'class': 1,
    'style': 1,
    'id': 1
}

// #[begin] reverse
/**
* 元素子节点遍历操作类
*
* @inner
* @class
* @param {HTMLElement} el 要遍历的元素
*/
function DOMChildrenWalker (el) {
    this.raw = []
    this.index = 0
    this.target = el

    let child = el.firstChild
    let next
    while (child) {
        next = child.nextSibling

        switch (child.nodeType) {
        case 3:
            if (/^\s*$/.test(child.data || child.textContent)) {
                removeEl(child)
            } else {
                this.raw.push(child)
            }
            break

        case 1:
        case 8:
            this.raw.push(child)
        }

        child = next
    }

    this.current = this.raw[this.index]
    this.next = this.raw[this.index + 1]
}

/**
* 往下走一个元素
*/
DOMChildrenWalker.prototype.goNext = function () {
    this.current = this.raw[++this.index]
    this.next = this.raw[this.index + 1]
}
// #[end]

/**
* 元素节点类
*
* @class
* @param {Object} aNode 抽象节点
* @param {Node} parent 父亲节点
* @param {Model} scope 所属数据环境
* @param {Component} owner 所属组件环境
* @param {DOMChildrenWalker?} reverseWalker 子元素遍历对象
*/
function Element (aNode, parent, scope, owner, reverseWalker?) {
    this.aNode = aNode
    this.owner = owner
    this.scope = scope
    this.parent = parent

    this.lifeCycle = LifeCycle.start
    this.children = []
    this._elFns = []
    this.parentComponent = parent.nodeType === 5
        ? parent
        : parent.parentComponent

    this.tagName = aNode.tagName

    nodeSBindInit(this, aNode.directives.bind)
    this.lifeCycle = LifeCycle.inited

    // #[begin] reverse
    if (reverseWalker) {
        const currentNode = reverseWalker.current

        /* istanbul ignore if */
        if (!currentNode) {
            throw new Error('[SAN REVERSE ERROR] Element not found. \nPaths: ' +
            getNodePath(this).join(' > '))
        }

        /* istanbul ignore if */
        if (currentNode.nodeType !== 1) {
            throw new Error('[SAN REVERSE ERROR] Element type not match, expect 1 but ' +
            currentNode.nodeType + '.\nPaths: ' +
            getNodePath(this).join(' > '))
        }

        /* istanbul ignore if */
        if (currentNode.tagName.toLowerCase() !== this.tagName) {
            throw new Error('[SAN REVERSE ERROR] Element tagName not match, expect ' +
            this.tagName + ' but meat ' + currentNode.tagName.toLowerCase() + '.\nPaths: ' +
            getNodePath(this).join(' > '))
        }

        this.el = currentNode
        reverseWalker.goNext()

        reverseElementChildren(this, this.scope, this.owner)

        this.lifeCycle = LifeCycle.created
        this._attached()
        this.lifeCycle = LifeCycle.attached
    }
// #[end]
}

Element.prototype.nodeType = 4

Element.prototype.detach = elementOwnDetach
Element.prototype.dispose = elementOwnDispose
Element.prototype._onEl = elementOwnOnEl

/**
* 创建节点对应的 stump comment 主元素
*/
function nodeOwnCreateStump () {
    this.el = this.el || document.createComment(this.id)
}

/**
* 销毁释放元素的子元素
*
* @param {Array=} children 子元素数组
* @param {boolean=} noDetach 是否不要把节点从dom移除
* @param {boolean=} noTransition 是否不显示过渡动画效果
*/
function elementDisposeChildren (children, noDetach, noTransition) {
    let len = children && children.length
    while (len--) {
        children[len].dispose(noDetach, noTransition)
    }
}

/**
* 简单执行销毁节点的行为
*
* @param {boolean=} noDetach 是否不要把节点从dom移除
*/
function nodeOwnSimpleDispose (noDetach) {
    elementDisposeChildren(this.children, noDetach, 1)

    if (!noDetach) {
        removeEl(this.el)
    }

    this.el = null
    this.owner = null
    this.scope = null
    this.children = null

    this.lifeCycle = LifeCycle.disposed
    if (this._ondisposed) {
        this._ondisposed()
    }
}

/**
* 通过组件反解创建节点
*
* @param {ANode} aNode 抽象节点
* @param {Node} parent 父亲节点
* @param {Model} scope 所属数据环境
* @param {Component} owner 所属组件环境
* @param {DOMChildrenWalker} reverseWalker 子元素遍历对象
* @return {Node}
*/
function createReverseNode (aNode, parent, scope, owner, reverseWalker) {
    if (aNode.Clazz) {
        return new aNode.Clazz(aNode, parent, scope, owner, reverseWalker)
    }

    const ComponentOrLoader = owner.getComponentType
        ? owner.getComponentType(aNode, scope)
        : owner.components[aNode.tagName]

    if (ComponentOrLoader) {
        return typeof ComponentOrLoader === 'function'
            ? new ComponentOrLoader({
                source: aNode,
                owner: owner,
                scope: scope,
                parent: parent,
                subTag: aNode.tagName,
                reverseWalker: reverseWalker
            })
            : {}
    }

    return new Element(aNode, parent, scope, owner, reverseWalker)
}
// #[end]

// #[begin] reverse

/**
* 对元素的子节点进行反解
*
* @param {Object} element 元素
*/
function reverseElementChildren (element, scope, owner) {
    const htmlDirective = element.aNode.directives.html

    if (!htmlDirective) {
        const reverseWalker = new DOMChildrenWalker(element.el)

        each(element.aNode.children, function (aNodeChild) {
            element.children.push(
                createReverseNode(aNodeChild, element, scope, owner, reverseWalker)
            )
        })
    }
}
// #[end]

/**
* 创建节点
*
* @param {ANode} aNode 抽象节点
* @param {Node} parent 父亲节点
* @param {Model} scope 所属数据环境
* @param {Component} owner 所属组件环境
* @return {Node}
*/
function createNode (aNode, parent, scope, owner) {
    if (aNode.Clazz) {
        return new aNode.Clazz(aNode, parent, scope, owner)
    }

    const ComponentOrLoader = owner.getComponentType
        ? owner.getComponentType(aNode, scope)
        : owner.components[aNode.tagName]

    if (ComponentOrLoader) {
        return typeof ComponentOrLoader === 'function'
            ? new ComponentOrLoader({
                source: aNode,
                owner: owner,
                scope: scope,
                parent: parent,
                subTag: aNode.tagName
            })
            : {}
    }

    aNode.Clazz = Element
    return new Element(aNode, parent, scope, owner)
}

/**
* 获取 element 的 transition 控制对象
*
* @param {Object} element 元素
* @return {Object?}
*/
function elementGetTransition (element) {
    let directive = element.aNode.directives.transition
    let owner = element.owner

    if (element.nodeType === 5) {
        const cmptGivenTransition = element.source && element.source.directives.transition
        if (cmptGivenTransition) {
            directive = cmptGivenTransition
        } else {
            owner = element
        }
    }

    let transition
    if (directive && owner) {
        transition = findMethod(owner, directive.value.name)

        if (typeof transition === 'function') {
            transition = transition.apply(
                owner,
                evalArgs(directive.value.args, element.scope, owner)
            )
        }
    }

    return transition || element.transition
}

/**
* 将元素从页面上移除
*/
function elementOwnDetach () {
    const lifeCycle = this.lifeCycle
    if (lifeCycle.leaving) {
        return
    }

    if (!this.disposeNoTransition) {
        const transition = elementGetTransition(this)

        if (transition && transition.leave) {
            if (this._toPhase) {
                this._toPhase('leaving')
            } else {
                this.lifeCycle = LifeCycle.leaving
            }

            const me = this
            transition.leave(this.el, function () {
                me._leave()
            })

            return
        }
    }

    this._leave()
}

/**
* 销毁释放元素
*
* @param {boolean=} noDetach 是否不要把节点从dom移除
* @param {boolean=} noTransition 是否不显示过渡动画效果
*/
function elementOwnDispose (noDetach, noTransition) {
    this.leaveDispose = 1
    this.disposeNoDetach = noDetach
    this.disposeNoTransition = noTransition

    this.detach()
}

/**
* 为元素的 el 绑定事件
*
* @param {string} name 事件名
* @param {Function} listener 监听器
* @param {boolean} capture 是否是捕获阶段触发
*/
function elementOwnOnEl (name, listener, capture) {
    capture = !!capture
    this._elFns.push([name, listener, capture])
}

const isBrowser = typeof window !== 'undefined'

// #[begin] error
/**
* 开发时的警告提示
*
* @param {string} message 警告信息
*/
function warn (message) {
    message = '[SAN WARNING] ' + message

    /* eslint-disable no-console */
    /* istanbul ignore next */
    if (typeof console === 'object' && console.warn) {
        console.warn(message)
    } else {
    // 防止警告中断调用堆栈
        setTimeout(function () {
            throw new Error(message)
        }, 0)
    }
/* eslint-enable no-console */
}
// #[end]

/**
* 初始化节点的 s-bind 数据
*
* @param {Object} node 节点对象
* @param {Object} sBind bind指令对象
* @return {boolean}
*/
function nodeSBindInit (node, sBind) {
    if (sBind && node.scope) {
        node._sbindData = evalExpr(sBind.value, node.scope, node.owner)
        return true
    }
}

/**
* 计算两个对象 key 的并集
*
* @param {Object} obj1 目标对象
* @param {Object} obj2 源对象
* @return {Array}
*/
function unionKeys (obj1, obj2) {
    const result = []
    let key

    for (key in obj1) {
    /* istanbul ignore else  */
        if (obj1.hasOwnProperty(key)) {
            result.push(key)
        }
    }

    for (key in obj2) {
    /* istanbul ignore else  */
        if (obj2.hasOwnProperty(key)) {
            !obj1[key] && result.push(key)
        }
    }

    return result
}

/**
* 初始化节点的 s-bind 数据
*
* @param {Object} node 节点对象
* @param {Object} sBind bind指令对象
* @param {Array} changes 变更数组
* @param {Function} updater 绑定对象子项变更的更新函数
*/
function nodeSBindUpdate (node, sBind, changes, updater) {
    if (sBind) {
        let len = changes.length

        while (len--) {
            if (changeExprCompare(changes[len].expr, sBind.value, node.scope)) {
                const newBindData = evalExpr(sBind.value, node.scope, node.owner)
                const keys = unionKeys(newBindData, node._sbindData)

                for (let i = 0, l = keys.length; i < l; i++) {
                    const key = keys[i]
                    const value = newBindData[key]

                    if (value !== node._sbindData[key]) {
                        updater(key, value)
                    }
                }

                node._sbindData = newBindData
                break
            }
        }
    }
}

// some html elements cannot set innerHTML in old ie
// see: https://msdn.microsoft.com/en-us/library/ms533897(VS.85).aspx

/**
* 判断元素是否不允许设置HTML
*
* @param {HTMLElement} el 要判断的元素
* @return {boolean}
*/
function noSetHTML (el) {
    return /^(col|colgroup|frameset|style|table|tbody|tfoot|thead|tr|select)$/i.test(el.tagName)
}

// #[begin] error
/**
* 获取节点 stump 的 comment
*
* @param {HTMLElement} el HTML元素
*/
function warnSetHTML (el) {
// dont warn if not in browser runtime
/* istanbul ignore if */
    if (!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document)) {
        return
    }

    // some html elements cannot set innerHTML in old ie
    // see: https://msdn.microsoft.com/en-us/library/ms533897(VS.85).aspx
    if (noSetHTML(el)) {
        warn('set html for element "' + el.tagName + '" may cause an error in old IE')
    }
}
// #[end]

// #[begin] reverse
/**
* 获取节点在组件树中的路径
*
* @param {Node} node 节点对象
* @return {Array}
*/
/* istanbul ignore next */
function getNodePath (node) {
    const nodePaths = []
    let nodeParent = node
    while (nodeParent) {
        switch (nodeParent.nodeType) {
        case 4:
            nodePaths.unshift(nodeParent.tagName)
            break

        case 2:
            nodePaths.unshift('if')
            break

        case 3:
            nodePaths.unshift('for[' + nodeParent.anode.directives['for'].raw + ']') // eslint-disable-line dot-notation
            break

        case 6:
            nodePaths.unshift('slot[' + (nodeParent.name || 'default') + ']')
            break

        case 7:
            nodePaths.unshift('template')
            break

        case 5:
            nodePaths.unshift('component[' + (nodeParent.subTag || 'root') + ']')
            break

        case 1:
            nodePaths.unshift('text')
            break
        }

        nodeParent = nodeParent.parent
    }

    return nodePaths
}
// #[end]

/**
* 组件类
*
* @class
* @param {Object} options 初始化参数
*/
function Component () {}

/**
* 初始化创建组件外部传入的插槽对象
*
* @protected
* @param {boolean} isFirstTime 是否初次对sourceSlots进行计算
*/
Component.prototype._initSourceSlots = function (isFirstTime) {
    const me = this
    this.sourceSlots.named = {}

    // 组件运行时传入的结构，做slot解析
    this.source && this.scope && each(this.source.children, function (child) {
        let target

        const slotBind = !child.textExpr && getANodeProp(child, 'slot')
        if (slotBind) {
            isFirstTime && me.sourceSlotNameProps.push(slotBind)

            const slotName = evalExpr(slotBind.expr, me.scope, me.owner)
            target = me.sourceSlots.named[slotName]
            if (!target) {
                target = me.sourceSlots.named[slotName] = []
            }
        } else if (isFirstTime) {
            target = me.sourceSlots.noname
            if (!target) {
                target = me.sourceSlots.noname = []
            }
        }

        target && target.push(child)
    })
}

/**
* 类型标识
*
* @type {string}
*/
Component.prototype.nodeType = 5

/**
* 在下一个更新周期运行函数
*
* @param {Function} fn 要运行的函数
*/
Component.prototype.nextTick = nextTick

Component.prototype._ctx = (new Date()).getTime().toString(16)

/* eslint-disable operator-linebreak */
/**
* 使节点到达相应的生命周期
*
* @protected
* @param {string} name 生命周期名称
*/
Component.prototype._callHook =
Component.prototype._toPhase = function (name) {
    if (!this.lifeCycle[name]) {
        this.lifeCycle = LifeCycle[name] || this.lifeCycle
        if (typeof this[name] === 'function') {
            this[name]()
        }
        this['_after' + name] = 1
    }
}
/* eslint-enable operator-linebreak */

/**
* 添加事件监听器
*
* @param {string} name 事件名
* @param {Function} listener 监听器
* @param {string?} declaration 声明式
*/
Component.prototype.on = function (name, listener, declaration) {
    if (typeof listener === 'function') {
        if (!this.listeners[name]) {
            this.listeners[name] = []
        }
        this.listeners[name].push({ fn: listener, declaration: declaration })
    }
}

/**
* 移除事件监听器
*
* @param {string} name 事件名
* @param {Function=} listener 监听器
*/
Component.prototype.un = function (name, listener) {
    const nameListeners = this.listeners[name]
    let len = nameListeners && nameListeners.length

    while (len--) {
        if (!listener || listener === nameListeners[len].fn) {
            nameListeners.splice(len, 1)
        }
    }
}

/**
* 派发事件
*
* @param {string} name 事件名
* @param {Object} event 事件对象
*/
Component.prototype.fire = function (name, event) {
    const me = this
    each(this.listeners[name], function (listener) {
        listener.fn.call(me, event)
    })
}

/**
* 计算 computed 属性的值
*
* @private
* @param {string} computedExpr computed表达式串
*/
Component.prototype._calcComputed = function (computedExpr) {
    let computedDeps = this.computedDeps[computedExpr]
    if (!computedDeps) {
        computedDeps = this.computedDeps[computedExpr] = {}
    }

    const me = this
    this.data.set(computedExpr, this.computed[computedExpr].call({
        data: {
            get: function (expr) {
                // #[begin] error
                if (!expr) {
                    throw new Error('[SAN ERROR] call get method in computed need argument')
                }
                // #[end]

                if (!computedDeps[expr]) {
                    computedDeps[expr] = 1

                    if (me.computed[expr] && !me.computedDeps[expr]) {
                        me._calcComputed(expr)
                    }

                    me.watch(expr, function () {
                        me._calcComputed(computedExpr)
                    })
                }

                return me.data.get(expr)
            }
        }
    }))
}

/**
* 派发消息
* 组件可以派发消息，消息将沿着组件树向上传递，直到遇上第一个处理消息的组件
*
* @param {string} name 消息名称
* @param {*?} value 消息值
*/
Component.prototype.dispatch = function (name, value) {
    let parentComponent = this.parentComponent

    while (parentComponent) {
        const receiver = parentComponent.messages[name] || parentComponent.messages['*']
        if (typeof receiver === 'function') {
            receiver.call(
                parentComponent,
                { target: this, value: value, name: name }
            )
            break
        }

        parentComponent = parentComponent.parentComponent
    }
}

/**
* 获取组件内部的 slot
*
* @param {string=} name slot名称，空为default slot
* @return {Array}
*/
Component.prototype.slot = function (name) {
    const result = []
    const me = this

    function childrenTraversal (children) {
        each(children, function (child) {
            if (child.nodeType === 6 && child.owner === me) {
                if ((child.isNamed && child.name === name) ||
                (!child.isNamed && !name)
                ) {
                    result.push(child)
                }
            } else {
                childrenTraversal(child.children)
            }
        })
    }

    childrenTraversal(this.children)
    return result
}

/**
* 获取带有 san-ref 指令的子组件引用
*
* @param {string} name 子组件的引用名
* @return {Component}
*/
Component.prototype.ref = function (name) {
    let refTarget
    const owner = this

    function childrenTraversal (children) {
        each(children, function (child) {
            elementTraversal(child)
            return !refTarget
        })
    }

    function elementTraversal (element) {
        const nodeType = element.nodeType
        if (nodeType === 1) {
            return
        }

        if (element.owner === owner) {
            let ref
            switch (element.nodeType) {
            case 4:
                ref = element.aNode.directives.ref
                if (ref && evalExpr(ref.value, element.scope, owner) === name) {
                    refTarget = element.el
                }
                break

            case 5:
                ref = element.source.directives.ref
                if (ref && evalExpr(ref.value, element.scope, owner) === name) {
                    refTarget = element
                }
            }

            !refTarget && childrenTraversal(element.slotChildren)
        }

        !refTarget && childrenTraversal(element.children)
    }

    childrenTraversal(this.children)

    return refTarget
}

Component.prototype._updateBindxOwner = function (dataChanges) {
    const me = this
    let xbindUped

    each(dataChanges, function (change) {
        each(me.binds, function (bindItem) {
            const changeExpr = change.expr
            if (bindItem.x &&
            !isDataChangeByElement(change, me.owner) &&
            changeExprCompare(changeExpr, parseExpr(bindItem.name), me.data)
            ) {
                let updateScopeExpr = bindItem.expr
                if (changeExpr.paths.length > 1) {
                    updateScopeExpr = createAccessor(
                        bindItem.expr.paths.concat(changeExpr.paths.slice(1))
                    )
                }

                xbindUped = 1
                me.scope.set(
                    updateScopeExpr,
                    evalExpr(changeExpr, me.data, me),
                    {
                        target: {
                            node: me,
                            prop: bindItem.name
                        }
                    }
                )
            }
        })
    })

    return xbindUped
}

/**
* 重新绘制组件的内容
* 当 dynamic slot name 发生变更或 slot 匹配发生变化时，重新绘制
* 在组件级别重绘有点粗暴，但是能保证视图结果正确性
*/
Component.prototype._repaintChildren = function () {
    if (this.el.nodeType === 1) {
        elementDisposeChildren(this.children, 0, 1)
        this.children = []

        this.slotChildren = []

        for (let i = 0, l = this.aNode.children.length; i < l; i++) {
            const child = createNode(this.aNode.children[i], this, this.data, this)
            this.children.push(child)
            child.attach(this.el)
        }
    }
}

/**
* 组件内部监听数据变化的函数
*
* @private
* @param {Object} change 数据变化信息
*/
Component.prototype._dataChanger = function (change) {
    if (this.lifeCycle.created && this._aftercreated) {
        if (!this._dataChanges) {
            nextTick(this._update, this)
            this._dataChanges = []
        }

        this._dataChanges.push(change)
    } else if (this.lifeCycle.inited && this.owner) {
        this._updateBindxOwner([change])
    }
}

/**
* 监听组件的数据变化
*
* @param {string} dataName 变化的数据项
* @param {Function} listener 监听函数
*/
Component.prototype.watch = function (dataName, listener) {
    const dataExpr = parseExpr(dataName)

    this.data.listen(bind(function (change) {
        if (changeExprCompare(change.expr, dataExpr, this.data)) {
            listener.call(this, evalExpr(dataExpr, this.data, this), change)
        }
    }, this))
}

/**
* 将组件attach到页面
*
* @param {HTMLElement} parentEl 要添加到的父元素
* @param {HTMLElement＝} beforeEl 要添加到哪个元素之前
*/
Component.prototype.attach = function (parentEl, beforeEl) {
    if (!this.lifeCycle.attached) {
        this._attach(parentEl, beforeEl)

        // element 都是内部创建的，只有动态创建的 component 才会进入这个分支
        if (this.owner && !this.parent) {
            this.owner.implicitChildren.push(this)
        }
    }
}

Component.prototype._attach = function (parentEl, beforeEl) {
    const ifDirective = this.aNode.directives['if'] // eslint-disable-line dot-notation

    if (!ifDirective || evalExpr(ifDirective.value, this.data, this)) {
        if (!this.el) {
            const sourceNode = this.aNode.hotspot.sourceNode
            let props = this.aNode.props

            if (sourceNode) {
                this.el = sourceNode.cloneNode(false)
                props = this.aNode.hotspot.dynamicProps
            } else {
                this.el = createEl(this.tagName)
            }

            if (this._sbindData) {
                for (const key in this._sbindData) {
                    if (this._sbindData.hasOwnProperty(key)) {
                        getPropHandler(this.tagName, key)(
                            this.el,
                            this._sbindData[key],
                            key,
                            this
                        )
                    }
                }
            }

            for (let i = 0, l = props.length; i < l; i++) {
                const prop = props[i]
                const value = evalExpr(prop.expr, this.data, this)

                if (value || !baseProps[prop.name]) {
                    prop.handler(this.el, value, prop.name, this, prop)
                }
            }

            this._toPhase('created')
        }

        insertBefore(this.el, parentEl, beforeEl)

        if (!this._contentReady) {
            for (let i = 0, l = this.aNode.children.length; i < l; i++) {
                const childANode = this.aNode.children[i]
                const child = childANode.Clazz
                    ? new childANode.Clazz(childANode, this, this.data, this)
                    : createNode(childANode, this, this.data, this)
                this.children.push(child)
                child.attach(this.el)
            }

            this._contentReady = 1
        }

        this._attached()
    } else {
        this.el = document.createComment(this.id)
        this._toPhase('created')
        insertBefore(this.el, parentEl, beforeEl)
    }

    this._toPhase('attached')
}

/**
* 判断是否结束桩
*
* @param {HTMLElement|HTMLComment} target 要判断的元素
* @param {string} type 桩类型
* @return {boolean}
*/
function isEndStump (target, type) {
    return target.nodeType === 8 && target.data === '/s-' + type
}
// #[end]

/**
* text 节点类
*
* @class
* @param {Object} aNode 抽象节点
* @param {Node} parent 父亲节点
* @param {Model} scope 所属数据环境
* @param {Component} owner 所属组件环境
* @param {DOMChildrenWalker?} reverseWalker 子元素遍历对象
*/
function TextNode (aNode, parent, scope, owner, reverseWalker) {
    this.aNode = aNode
    this.owner = owner
    this.scope = scope
    this.parent = parent

    // #[begin] reverse
    if (reverseWalker) {
        let currentNode = reverseWalker.current
        if (currentNode) {
            switch (currentNode.nodeType) {
            case 8:
                if (currentNode.data === 's-text') {
                    this.sel = currentNode
                    currentNode.data = this.id
                    reverseWalker.goNext()

                    while (1) { // eslint-disable-line
                        currentNode = reverseWalker.current
                        /* istanbul ignore if */
                        if (!currentNode) {
                            throw new Error('[SAN REVERSE ERROR] Text end flag not found. \nPaths: ' +
                                getNodePath(this).join(' > '))
                        }

                        if (isEndStump(currentNode, 'text')) {
                            this.el = currentNode
                            reverseWalker.goNext()
                            currentNode.data = this.id
                            break
                        }

                        reverseWalker.goNext()
                    }
                }
                break

            case 3:
                reverseWalker.goNext()
                if (!this.aNode.textExpr.original) {
                    this.el = currentNode
                }
                break
            }
        } else {
            this.el = document.createTextNode('')
            insertBefore(this.el, reverseWalker.target, reverseWalker.current)
        }
    }
// #[end]
}

TextNode.prototype.nodeType = 1

/**
* 将text attach到页面
*
* @param {HTMLElement} parentEl 要添加到的父元素
* @param {HTMLElement＝} beforeEl 要添加到哪个元素之前
*/
TextNode.prototype.attach = function (parentEl, beforeEl) {
    this.content = evalExpr(this.aNode.textExpr, this.scope, this.owner)

    if (this.aNode.textExpr.original) {
        this.sel = document.createComment(this.id)
        insertBefore(this.sel, parentEl, beforeEl)

        this.el = document.createComment(this.id)
        insertBefore(this.el, parentEl, beforeEl)

        const tempFlag = document.createElement('script')
        parentEl.insertBefore(tempFlag, this.el)
        tempFlag.insertAdjacentHTML('beforebegin', this.content)
        parentEl.removeChild(tempFlag)
    } else {
        this.el = document.createTextNode(this.content)
        insertBefore(this.el, parentEl, beforeEl)
    }
}

/**
* 销毁 text 节点
*
* @param {boolean=} noDetach 是否不要把节点从dom移除
*/
TextNode.prototype.dispose = function (noDetach) {
    if (!noDetach) {
        removeEl(this.el)
        removeEl(this.sel)
    }

    this.el = null
    this.sel = null
}

const textUpdateProp = isBrowser &&
(typeof document.createTextNode('').textContent === 'string'
    ? 'textContent'
    : 'data')

/**
* 更新 text 节点的视图
*
* @param {Array} changes 数据变化信息
*/
TextNode.prototype._update = function (changes) {
    if (this.aNode.textExpr.value) {
        return
    }

    let len = changes.length
    while (len--) {
        if (changeExprCompare(changes[len].expr, this.aNode.textExpr, this.scope)) {
            const text = evalExpr(this.aNode.textExpr, this.scope, this.owner)

            if (text !== this.content) {
                this.content = text

                if (this.aNode.textExpr.original) {
                    let startRemoveEl = this.sel.nextSibling
                    const parentEl = this.el.parentNode

                    while (startRemoveEl !== this.el) {
                        const removeTarget = startRemoveEl
                        startRemoveEl = startRemoveEl.nextSibling
                        removeEl(removeTarget)
                    }

                    // #[begin] error
                    warnSetHTML(parentEl)
                    // #[end]

                    const tempFlag = document.createElement('script')
                    parentEl.insertBefore(tempFlag, this.el)
                    tempFlag.insertAdjacentHTML('beforebegin', text)
                    parentEl.removeChild(tempFlag)
                } else {
                    this.el[textUpdateProp] = text
                }
            }

            return
        }
    }
}

/**
* 将没有 root 只有 children 的元素 attach 到页面
* 主要用于 slot 和 template
*
* @param {HTMLElement} parentEl 要添加到的父元素
* @param {HTMLElement＝} beforeEl 要添加到哪个元素之前
*/
function nodeOwnOnlyChildrenAttach (parentEl, beforeEl) {
    this.sel = document.createComment(this.id)
    insertBefore(this.sel, parentEl, beforeEl)

    for (let i = 0; i < this.aNode.children.length; i++) {
        const child = createNode(
            this.aNode.children[i],
            this,
            this.childScope || this.scope,
            this.childOwner || this.owner
        )
        this.children.push(child)
        child.attach(parentEl, beforeEl)
    }

    this.el = document.createComment(this.id)
    insertBefore(this.el, parentEl, beforeEl)

    this.lifeCycle = LifeCycle.attached
}

/**
* slot 节点类
*
* @class
* @param {Object} aNode 抽象节点
* @param {Node} parent 父亲节点
* @param {Model} scope 所属数据环境
* @param {Component} owner 所属组件环境
* @param {DOMChildrenWalker?} reverseWalker 子元素遍历对象
*/
function SlotNode (aNode, parent, scope, owner, reverseWalker) {
    this.owner = owner
    this.scope = scope
    this.parent = parent
    this.parentComponent = parent.nodeType === 5
        ? parent
        : parent.parentComponent

    this.id = guid++

    this.lifeCycle = LifeCycle.start
    this.children = []

    // calc slot name
    this.nameBind = getANodeProp(aNode, 'name')
    if (this.nameBind) {
        this.isNamed = true
        this.name = evalExpr(this.nameBind.expr, this.scope, this.owner)
    }

    // calc aNode children
    const sourceSlots = owner.sourceSlots
    let matchedSlots
    if (sourceSlots) {
        matchedSlots = this.isNamed ? sourceSlots.named[this.name] : sourceSlots.noname
    }

    if (matchedSlots) {
        this.isInserted = true
    }

    this.aNode = {
        directives: aNode.directives,
        props: [],
        events: [],
        children: matchedSlots || aNode.children.slice(0),
        vars: aNode.vars
    }

    // calc scoped slot vars
    let initData
    if (nodeSBindInit(this, aNode.directives.bind)) {
        initData = extend({}, this._sbindData)
    }

    if (aNode.vars) {
        initData = initData || {}
        each(aNode.vars, function (varItem) {
            initData[varItem.name] = evalExpr(varItem.expr, scope, owner)
        })
    }

    // child owner & child scope
    if (this.isInserted) {
        this.childOwner = owner.owner
        this.childScope = owner.scope
    }

    if (initData) {
        this.isScoped = true
        this.childScope = new Data(initData, this.childScope || this.scope)
    }

    owner.slotChildren.push(this)

    // #[begin] reverse
    if (reverseWalker) {
        this.sel = document.createComment(this.id)
        insertBefore(this.sel, reverseWalker.target, reverseWalker.current)

        const me = this
        each(this.aNode.children, function (aNodeChild) {
            me.children.push(createReverseNode(
                aNodeChild,
                me,
                me.childScope || me.scope,
                me.childOwner || me.owner,
                reverseWalker
            ))
        })

        this.el = document.createComment(this.id)
        insertBefore(this.el, reverseWalker.target, reverseWalker.current)

        this.lifeCycle = LifeCycle.attached
    }
// #[end]
}

SlotNode.prototype.nodeType = 6

/**
* 销毁释放 slot
*
* @param {boolean=} noDetach 是否不要把节点从dom移除
* @param {boolean=} noTransition 是否不显示过渡动画效果
*/
SlotNode.prototype.dispose = function (noDetach, noTransition) {
    this.childOwner = null
    this.childScope = null

    elementDisposeChildren(this.children, noDetach, noTransition)

    if (!noDetach) {
        removeEl(this.el)
        removeEl(this.sel)
    }

    this.sel = null
    this.el = null
    this.owner = null
    this.scope = null
    this.children = null

    this.lifeCycle = LifeCycle.disposed

    if (this._ondisposed) {
        this._ondisposed()
    }
}

SlotNode.prototype.attach = nodeOwnOnlyChildrenAttach

/**
* 视图更新函数
*
* @param {Array} changes 数据变化信息
* @param {boolean=} isFromOuter 变化信息是否来源于父组件之外的组件
* @return {boolean}
*/
SlotNode.prototype._update = function (changes, isFromOuter) {
    const me = this

    if (this.nameBind && evalExpr(this.nameBind.expr, this.scope, this.owner) !== this.name) {
        this.owner._notifyNeedReload()
        return false
    }

    if (isFromOuter) {
        if (this.isInserted) {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i]._update(changes)
            }
        }
    } else {
        if (this.isScoped) {
            const varKeys = {}
            each(this.aNode.vars, function (varItem) {
                varKeys[varItem.name] = 1
                me.childScope.set(varItem.name, evalExpr(varItem.expr, me.scope, me.owner))
            })

            const scopedChanges = []

            nodeSBindUpdate(
                this,
                this.aNode.directives.bind,
                changes,
                function (name, value) {
                    if (varKeys[name]) {
                        return
                    }

                    me.childScope.set(name, value)
                    scopedChanges.push({
                        type: 1,
                        expr: createAccessor([
                            { type: 1, value: name }
                        ]),
                        value: value,
                        option: {}
                    })
                }
            )

            each(changes, function (change) {
                if (!me.isInserted) {
                    scopedChanges.push(change)
                }

                each(me.aNode.vars, function (varItem) {
                    const name = varItem.name
                    const relation = changeExprCompare(change.expr, varItem.expr, me.scope)

                    if (relation < 1) {
                        return
                    }

                    if (change.type !== 2) {
                        scopedChanges.push({
                            type: 1,
                            expr: createAccessor([
                                { type: 1, value: name }
                            ]),
                            value: me.childScope.get(name),
                            option: change.option
                        })
                    } else if (relation === 2) {
                        scopedChanges.push({
                            expr: createAccessor([
                                { type: 1, value: name }
                            ]),
                            type: 2,
                            index: change.index,
                            deleteCount: change.deleteCount,
                            value: change.value,
                            insertions: change.insertions,
                            option: change.option
                        })
                    }
                })
            })

            for (let i = 0; i < this.children.length; i++) {
                this.children[i]._update(scopedChanges)
            }
        } else if (!this.isInserted) {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i]._update(changes)
            }
        }
    }
}

/**
* 循环项的数据容器类
*
* @inner
* @class
* @param {Object} forElement for元素对象
* @param {*} item 当前项的数据
* @param {number} index 当前项的索引
*/
function ForItemData (forElement, item, index) {
    this.parent = forElement.scope
    this.raw = {}
    this.listeners = []

    this.directive = forElement.aNode.directives['for'] // eslint-disable-line dot-notation
    this.indexName = this.directive.index || '$index'

    this.raw[this.directive.item] = item
    this.raw[this.indexName] = index
}

/**
* 将数据操作的表达式，转换成为对parent数据操作的表达式
* 主要是对item和index进行处理
*
* @param {Object} expr 表达式
* @return {Object}
*/
ForItemData.prototype.exprResolve = function (expr) {
    const me = this
    const directive = this.directive

    function resolveItem (expr) {
        if (expr.type === 4 && expr.paths[0].value === directive.item) {
            return createAccessor(
                directive.value.paths.concat(
                    {
                        type: 2,
                        value: me.raw[me.indexName]
                    },
                    expr.paths.slice(1)
                )
            )
        }

        return expr
    }

    expr = resolveItem(expr)

    const resolvedPaths = []

    each(expr.paths, function (item) {
        resolvedPaths.push(
            item.type === 4 && item.paths[0].value === me.indexName
                ? {
                    type: 2,
                    value: me.raw[me.indexName]
                }
                : resolveItem(item)
        )
    })

    return createAccessor(resolvedPaths)
}

// 代理数据操作方法
inherits(ForItemData, Data)
each(
    ['set', 'remove', 'unshift', 'shift', 'push', 'pop', 'splice'],
    function (method) {
        ForItemData.prototype['_' + method] = Data.prototype[method]

        ForItemData.prototype[method] = function (expr) {
            expr = this.exprResolve(parseExpr(expr))
            this.parent[method].apply(
                this.parent,
                [expr].concat(Array.prototype.slice.call(arguments, 1))
            )
        }
    }
)

/**
* for 指令节点类
*
* @class
* @param {Object} aNode 抽象节点
* @param {Node} parent 父亲节点
* @param {Model} scope 所属数据环境
* @param {Component} owner 所属组件环境
* @param {DOMChildrenWalker?} reverseWalker 子元素遍历对象
*/
function ForNode (aNode, parent, scope, owner, reverseWalker) {
    this.aNode = aNode
    this.owner = owner
    this.scope = scope
    this.parent = parent
    this.parentComponent = parent.nodeType === 5
        ? parent
        : parent.parentComponent

    this.id = guid++
    this.children = []

    this.param = aNode.directives['for'] // eslint-disable-line dot-notation

    this.itemPaths = [
        {
            type: 1,
            value: this.param.item
        }
    ]

    this.itemExpr = {
        type: 4,
        paths: this.itemPaths,
        raw: this.param.item
    }

    if (this.param.index) {
        this.indexExpr = createAccessor([{
            type: 1,
            value: '' + this.param.index
        }])
    }

    // #[begin] reverse
    if (reverseWalker) {
        this.listData = evalExpr(this.param.value, this.scope, this.owner)
        if (this.listData instanceof Array) {
            for (let i = 0; i < this.listData.length; i++) {
                this.children.push(createReverseNode(
                    this.aNode.forRinsed,
                    this,
                    new ForItemData(this, this.listData[i], i),
                    this.owner,
                    reverseWalker
                ))
            }
        } else if (this.listData && typeof this.listData === 'object') {
            for (const i in this.listData) {
                if (this.listData.hasOwnProperty(i) && this.listData[i] != null) {
                    this.children.push(createReverseNode(
                        this.aNode.forRinsed,
                        this,
                        new ForItemData(this, this.listData[i], i),
                        this.owner,
                        reverseWalker
                    ))
                }
            }
        }

        this._create()
        insertBefore(this.el, reverseWalker.target, reverseWalker.current)
    }
// #[end]
}

ForNode.prototype.nodeType = 3
ForNode.prototype._create = nodeOwnCreateStump
ForNode.prototype.dispose = nodeOwnSimpleDispose

/**
* 将元素attach到页面的行为
*
* @param {HTMLElement} parentEl 要添加到的父元素
* @param {HTMLElement＝} beforeEl 要添加到哪个元素之前
*/
ForNode.prototype.attach = function (parentEl, beforeEl) {
    this._create()
    insertBefore(this.el, parentEl, beforeEl)
    this.listData = evalExpr(this.param.value, this.scope, this.owner)

    this._createChildren()
}

/**
* 创建子元素
*/
ForNode.prototype._createChildren = function () {
    const parentEl = this.el.parentNode
    const listData = this.listData

    if (listData instanceof Array) {
        for (let i = 0; i < listData.length; i++) {
            const child = createNode(this.aNode.forRinsed, this, new ForItemData(this, listData[i], i), this.owner)
            this.children.push(child)
            child.attach(parentEl, this.el)
        }
    } else if (listData && typeof listData === 'object') {
        for (const i in listData) {
            if (listData.hasOwnProperty(i) && listData[i] != null) {
                const child = createNode(this.aNode.forRinsed, this, new ForItemData(this, listData[i], i), this.owner)
                this.children.push(child)
                child.attach(parentEl, this.el)
            }
        }
    }
}

/* eslint-disable fecs-max-statements */

/**
* 视图更新函数
*
* @param {Array} changes 数据变化信息
*/
ForNode.prototype._update = function (changes) {
    const listData = evalExpr(this.param.value, this.scope, this.owner)
    const oldIsArr = this.listData instanceof Array
    const newIsArr = listData instanceof Array

    if (this.children.length) {
        if (!listData || (newIsArr && listData.length === 0)) {
            this._disposeChildren()
            this.listData = listData
        } else if (oldIsArr !== newIsArr || !newIsArr) {
            // 就是这么暴力
            // 不推荐使用for遍历object，用的话自己负责
            this.listData = listData

            let isListChanged
            for (let cIndex = 0; !isListChanged && cIndex < changes.length; cIndex++) {
                isListChanged = changeExprCompare(changes[cIndex].expr, this.param.value, this.scope)
            }
            const dataHotspot = this.aNode.hotspot.data
            if (isListChanged || (dataHotspot && changesIsInDataRef(changes, dataHotspot))) {
                const me = this
                this._disposeChildren(null, function () {
                    me._createChildren()
                })
            }
        } else {
            this._updateArray(changes, listData)
            this.listData = listData
        }
    } else {
        this.listData = listData
        this._createChildren()
    }
}

/**
* 销毁释放子元素
*
* @param {Array?} children 要销毁的子元素，默认为自身的children
* @param {Function} callback 释放完成的回调函数
*/
ForNode.prototype._disposeChildren = function (children, callback) {
    const parentEl = this.el.parentNode
    const parentFirstChild = parentEl.firstChild
    const parentLastChild = parentEl.lastChild

    let len = this.children.length

    const violentClear = !this.aNode.directives.transition &&
    !children &&
    // 是否 parent 的唯一 child
    len && parentFirstChild === this.children[0].el && parentLastChild === this.el

    if (!children) {
        children = this.children
        this.children = []
    }

    let disposedChildCount = 0
    len = children.length

    // 调用入口处已保证此处必有需要被删除的 child
    for (let i = 0; i < len; i++) {
        const disposeChild = children[i]

        if (violentClear) {
            disposeChild && disposeChild.dispose(violentClear, violentClear)
        } else if (disposeChild) {
            disposeChild._ondisposed = childDisposed
            disposeChild.dispose()
        } else {
            childDisposed()
        }
    }

    if (violentClear) {
        parentEl.textContent = ''
        this.el = document.createComment(this.id)
        parentEl.appendChild(this.el)
        callback && callback()
    }

    function childDisposed () {
        disposedChildCount++
        if (disposedChildCount >= len) {
            callback && callback()
        }
    }
}

ForNode.prototype.opti = typeof navigator !== 'undefined' &&
/chrome\/[0-9]+/i.test(navigator.userAgent)
/**
* 数组类型的视图更新
*
* @param {Array} changes 数据变化信息
* @param {Array} newList 新数组数据
*/
ForNode.prototype._updateArray = function (changes, newList) {
    const oldChildrenLen = this.children.length
    let childrenChanges = new Array(oldChildrenLen)

    function pushToChildrenChanges (change) {
        for (let i = 0, l = childrenChanges.length; i < l; i++) {
            (childrenChanges[i] = childrenChanges[i] || []).push(change)
        }
        childrenNeedUpdate = null
        isOnlyDispose = false
    }

    let disposeChildren = []

    // 控制列表是否整体更新的变量
    let isChildrenRebuild

    //
    let isOnlyDispose = true

    let childrenNeedUpdate = {}

    const newLen = newList.length
    const getItemKey = this.aNode.hotspot.getForKey

    /* eslint-disable no-redeclare */
    for (let cIndex = 0; cIndex < changes.length; cIndex++) {
        let change = changes[cIndex]
        const relation = changeExprCompare(change.expr, this.param.value, this.scope)

        if (!relation) {
            // 无关时，直接传递给子元素更新，列表本身不需要动
            pushToChildrenChanges(change)
        } else {
            if (relation > 2) {
                // 变更表达式是list绑定表达式的子项
                // 只需要对相应的子项进行更新
                const changePaths = change.expr.paths
                const forLen = this.param.value.paths.length
                const changeIndex = +evalExpr(changePaths[forLen], this.scope, this.owner)

                if (isNaN(changeIndex)) {
                    pushToChildrenChanges(change)
                } else if (!isChildrenRebuild) {
                    isOnlyDispose = false
                    childrenNeedUpdate && (childrenNeedUpdate[changeIndex] = 1)

                    childrenChanges[changeIndex] = childrenChanges[changeIndex] || []
                    if (this.param.index) {
                        childrenChanges[changeIndex].push(change)
                    }

                    change = change.type === 1
                        ? {
                            type: change.type,
                            expr: createAccessor(
                                this.itemPaths.concat(changePaths.slice(forLen + 1))
                            ),
                            value: change.value,
                            option: change.option
                        }
                        : {
                            index: change.index,
                            deleteCount: change.deleteCount,
                            insertions: change.insertions,
                            type: change.type,
                            expr: createAccessor(
                                this.itemPaths.concat(changePaths.slice(forLen + 1))
                            ),
                            value: change.value,
                            option: change.option
                        }

                    childrenChanges[changeIndex].push(change)

                    if (change.type === 1) {
                        if (this.children[changeIndex]) {
                            this.children[changeIndex].scope._set(
                                change.expr,
                                change.value,
                                {
                                    silent: 1
                                }
                            )
                        } else {
                            // 设置数组项的索引可能超出数组长度，此时需要新增
                            // 比如当前数组只有2项，但是set list[4]
                            this.children[changeIndex] = 0
                        }
                    } else if (this.children[changeIndex]) {
                        this.children[changeIndex].scope._splice(
                            change.expr,
                            [].concat(change.index, change.deleteCount, change.insertions),
                            {
                                silent: 1
                            }
                        )
                    }
                }
            } else if (isChildrenRebuild) {
                continue
            } else if (relation === 2 && change.type === 2 &&
            (this.owner.updateMode !== 'optimized' || !this.opti || this.aNode.directives.transition)
            ) {
                childrenNeedUpdate = null

                // 变更表达式是list绑定表达式本身数组的splice操作
                // 此时需要删除部分项，创建部分项
                const changeStart = change.index
                const deleteCount = change.deleteCount
                const insertionsLen = change.insertions.length
                const newCount = insertionsLen - deleteCount

                if (newCount) {
                    const indexChange = this.param.index
                        ? {
                            type: 1,
                            option: change.option,
                            expr: this.indexExpr
                        }
                        : null

                    for (let i = changeStart + deleteCount; i < this.children.length; i++) {
                        if (indexChange) {
                            isOnlyDispose = false;
                            (childrenChanges[i] = childrenChanges[i] || []).push(indexChange)
                        }

                        const child = this.children[i]
                        if (child) {
                            child.scope.raw[child.scope.indexName] = i - deleteCount + insertionsLen
                        }
                    }
                }

                let deleteLen = deleteCount
                while (deleteLen--) {
                    if (deleteLen < insertionsLen) {
                        isOnlyDispose = false
                        const i = changeStart + deleteLen;
                        // update
                        (childrenChanges[i] = childrenChanges[i] || []).push({
                            type: 1,
                            option: change.option,
                            expr: this.itemExpr,
                            value: change.insertions[deleteLen]
                        })
                        if (this.children[i]) {
                            this.children[i].scope.raw[this.param.item] = change.insertions[deleteLen]
                        }
                    }
                }

                if (newCount < 0) {
                    disposeChildren = disposeChildren.concat(
                        this.children.splice(changeStart + insertionsLen, -newCount)
                    )
                    childrenChanges.splice(changeStart + insertionsLen, -newCount)
                } else if (newCount > 0) {
                    isOnlyDispose = false
                    const spliceArgs = [changeStart + deleteCount, 0].concat(new Array(newCount))
                    this.children.splice.apply(this.children, spliceArgs)
                    childrenChanges.splice.apply(childrenChanges, spliceArgs)
                }
            } else {
                childrenNeedUpdate = null
                isOnlyDispose = false

                isChildrenRebuild = 1

                // 变更表达式是list绑定表达式本身或母项的重新设值
                // 此时需要更新整个列表

                if (getItemKey && newLen && oldChildrenLen) {
                    // 如果设置了trackBy，用lis更新。开始 ====
                    const newListKeys = []
                    const oldListKeys = []
                    const newListKeysMap = {}
                    const oldListInNew = []
                    const oldListKeyIndex = {}

                    for (let i = 0; i < newList.length; i++) {
                        const itemKey = getItemKey(newList[i])
                        newListKeys.push(itemKey)
                        newListKeysMap[itemKey] = i
                    };

                    for (let i = 0; i < this.listData.length; i++) {
                        const itemKey = getItemKey(this.listData[i])

                        oldListKeys.push(itemKey)
                        oldListKeyIndex[itemKey] = i

                        if (newListKeysMap[itemKey] != null) {
                            oldListInNew[i] = newListKeysMap[itemKey]
                        } else {
                            oldListInNew[i] = -1
                            disposeChildren.push(this.children[i])
                        }
                    };

                    let newIndexStart = 0
                    let newIndexEnd = newLen
                    let oldIndexStart = 0
                    let oldIndexEnd = oldChildrenLen

                    while (newIndexStart < newLen &&
                    oldIndexStart < oldChildrenLen &&
                    newListKeys[newIndexStart] === oldListKeys[oldIndexStart]
                    ) {
                        if (this.listData[oldIndexStart] !== newList[newIndexStart]) {
                            this.children[oldIndexStart].scope.raw[this.param.item] = newList[newIndexStart];
                            (childrenChanges[oldIndexStart] = childrenChanges[oldIndexStart] || []).push({
                                type: 1,
                                option: change.option,
                                expr: this.itemExpr,
                                value: newList[newIndexStart]
                            })
                        }

                        // 对list更上级数据的直接设置
                        if (relation < 2) {
                            (childrenChanges[oldIndexStart] = childrenChanges[oldIndexStart] || []).push(change)
                        }

                        newIndexStart++
                        oldIndexStart++
                    }

                    while (newIndexEnd > newIndexStart && oldIndexEnd > oldIndexStart &&
                    newListKeys[newIndexEnd - 1] === oldListKeys[oldIndexEnd - 1]
                    ) {
                        newIndexEnd--
                        oldIndexEnd--

                        if (this.listData[oldIndexEnd] !== newList[newIndexEnd]) {
                            this.children[oldIndexEnd].scope.raw[this.param.item] = newList[newIndexEnd];
                            (childrenChanges[oldIndexEnd] = childrenChanges[oldIndexEnd] || []).push({
                                type: 1,
                                option: change.option,
                                expr: this.itemExpr,
                                value: newList[newIndexEnd]
                            })
                        }

                        // 对list更上级数据的直接设置
                        if (relation < 2) {
                            (childrenChanges[oldIndexEnd] = childrenChanges[oldIndexEnd] || []).push(change)
                        }
                    }

                    const oldListLIS = []
                    const lisIdx = []
                    let lisPos = -1
                    const lisSource = oldListInNew.slice(oldIndexStart, oldIndexEnd)
                    const len = oldIndexEnd - oldIndexStart
                    const preIdx = new Array(len)

                    for (let i = 0; i < len; i++) {
                        const oldItemInNew = lisSource[i]
                        if (oldItemInNew === -1) {
                            continue
                        }

                        let rePos = -1
                        let rePosEnd = oldListLIS.length

                        if (rePosEnd > 0 && oldListLIS[rePosEnd - 1] <= oldItemInNew) {
                            rePos = rePosEnd - 1
                        } else {
                            while (rePosEnd - rePos > 1) {
                                const mid = Math.floor((rePos + rePosEnd) / 2)
                                if (oldListLIS[mid] > oldItemInNew) {
                                    rePosEnd = mid
                                } else {
                                    rePos = mid
                                }
                            }
                        }

                        if (rePos !== -1) {
                            preIdx[i] = lisIdx[rePos]
                        }

                        if (rePos === lisPos) {
                            lisPos++
                            oldListLIS[lisPos] = oldItemInNew
                            lisIdx[lisPos] = i
                        } else if (oldItemInNew < oldListLIS[rePos + 1]) {
                            oldListLIS[rePos + 1] = oldItemInNew
                            lisIdx[rePos + 1] = i
                        }
                    }

                    for (let i = lisIdx[lisPos]; lisPos >= 0; i = preIdx[i], lisPos--) {
                        oldListLIS[lisPos] = i
                    }

                    let oldListLISPos = oldListLIS.length
                    let staticPos = oldListLISPos ? oldListInNew[oldListLIS[--oldListLISPos] + oldIndexStart] : -1

                    const newChildren = []
                    const newChildrenChanges = []

                    for (let i = newLen - 1; i >= 0; i--) {
                        if (i >= newIndexEnd) {
                            newChildren[i] = this.children[oldChildrenLen - newLen + i]
                            newChildrenChanges[i] = childrenChanges[oldChildrenLen - newLen + i]
                        } else if (i < newIndexStart) {
                            newChildren[i] = this.children[i]
                            newChildrenChanges[i] = childrenChanges[i]
                        } else {
                            const oldListIndex = oldListKeyIndex[newListKeys[i]]

                            if (i === staticPos) {
                                // 如果数据本身引用发生变化，设置变更
                                if (this.listData[oldListIndex] !== newList[i]) {
                                    this.children[oldListIndex].scope.raw[this.param.item] = newList[i];
                                    (childrenChanges[oldListIndex] = childrenChanges[oldListIndex] || []).push({
                                        type: 1,
                                        option: change.option,
                                        expr: this.itemExpr,
                                        value: newList[i]
                                    })
                                }

                                // 对list更上级数据的直接设置
                                if (relation < 2) {
                                    (childrenChanges[oldListIndex] = childrenChanges[oldListIndex] || []).push(change)
                                }

                                newChildren[i] = this.children[oldListIndex]
                                newChildrenChanges[i] = childrenChanges[oldListIndex]

                                staticPos = oldListLISPos ? oldListInNew[oldListLIS[--oldListLISPos] + oldIndexStart] : -1
                            } else {
                                if (oldListIndex != null) {
                                    disposeChildren.push(this.children[oldListIndex])
                                }

                                newChildren[i] = 0
                                newChildrenChanges[i] = 0
                            }
                        }
                    }

                    this.children = newChildren
                    childrenChanges = newChildrenChanges
                    // 如果设置了trackBy，用lis更新。结束 ====
                } else {
                    // 老的比新的多的部分，标记需要dispose
                    if (oldChildrenLen > newLen) {
                        disposeChildren = disposeChildren.concat(this.children.slice(newLen))
                        childrenChanges = childrenChanges.slice(0, newLen)
                        this.children = this.children.slice(0, newLen)
                    }

                    // 剩下的部分整项变更
                    for (let i = 0; i < newLen; i++) {
                        // 对list更上级数据的直接设置
                        if (relation < 2) {
                            (childrenChanges[i] = childrenChanges[i] || []).push(change)
                        }

                        if (this.children[i]) {
                            if (this.children[i].scope.raw[this.param.item] !== newList[i]) {
                                this.children[i].scope.raw[this.param.item] = newList[i];
                                (childrenChanges[i] = childrenChanges[i] || []).push({
                                    type: 1,
                                    option: change.option,
                                    expr: this.itemExpr,
                                    value: newList[i]
                                })
                            }
                        } else {
                            this.children[i] = 0
                        }
                    }
                }
            }
        }
    }

    // 标记 length 是否发生变化
    if (newLen !== oldChildrenLen && this.param.value.paths) {
        const lengthChange = {
            type: 1,
            option: {},
            expr: createAccessor(
                this.param.value.paths.concat({
                    type: 1,
                    value: 'length'
                })
            )
        }

        if (changesIsInDataRef([lengthChange], this.aNode.hotspot.data)) {
            pushToChildrenChanges(lengthChange)
        }
    }

    // 执行视图更新，先删再刷新
    this._doCreateAndUpdate = doCreateAndUpdate

    const me = this
    if (disposeChildren.length === 0) {
        doCreateAndUpdate()
    } else {
        this._disposeChildren(disposeChildren, function () {
            if (doCreateAndUpdate === me._doCreateAndUpdate) {
                doCreateAndUpdate()
            }
        })
    }

    function doCreateAndUpdate () {
        me._doCreateAndUpdate = null

        if (isOnlyDispose) {
            return
        }

        let beforeEl = me.el
        const parentEl = beforeEl.parentNode

        // 对相应的项进行更新
        // 如果不attached则直接创建，如果存在则调用更新函数
        let j = -1
        for (let i = 0; i < newLen; i++) {
            const child = me.children[i]

            if (child) {
                if (childrenChanges[i] && (!childrenNeedUpdate || childrenNeedUpdate[i])) {
                    child._update(childrenChanges[i])
                }
            } else {
                if (j < i) {
                    j = i + 1
                    beforeEl = null
                    while (j < newLen) {
                        const nextChild = me.children[j]
                        if (nextChild) {
                            beforeEl = nextChild.sel || nextChild.el
                            break
                        }
                        j++
                    }
                }

                me.children[i] = createNode(me.aNode.forRinsed, me, new ForItemData(me, newList[i], i), me.owner)
                me.children[i].attach(parentEl, beforeEl || me.el)
            }
        }
    }
}

/**
* if 指令节点类
*
* @class
* @param {Object} aNode 抽象节点
* @param {Node} parent 父亲节点
* @param {Model} scope 所属数据环境
* @param {Component} owner 所属组件环境
* @param {DOMChildrenWalker?} reverseWalker 子元素遍历对象
*/
function IfNode (aNode, parent, scope, owner, reverseWalker) {
    this.aNode = aNode
    this.owner = owner
    this.scope = scope
    this.parent = parent
    this.parentComponent = parent.nodeType === 5
        ? parent
        : parent.parentComponent

    this.id = guid++
    this.children = []

    // #[begin] reverse
    if (reverseWalker) {
        if (evalExpr(this.aNode.directives['if'].value, this.scope, this.owner)) { // eslint-disable-line dot-notation
            this.elseIndex = -1
            this.children[0] = createReverseNode(
                this.aNode.ifRinsed,
                this,
                this.scope,
                this.owner,
                reverseWalker
            )
        } else {
            const me = this
            each(aNode.elses, function (elseANode, index) {
                const elif = elseANode.directives.elif

                if (!elif || (elif && evalExpr(elif.value, me.scope, me.owner))) {
                    me.elseIndex = index
                    me.children[0] = createReverseNode(
                        elseANode,
                        me,
                        me.scope,
                        me.owner,
                        reverseWalker
                    )
                    return false
                }
            })
        }

        this._create()
        insertBefore(this.el, reverseWalker.target, reverseWalker.current)
    }
// #[end]
}

IfNode.prototype.nodeType = 2

IfNode.prototype._create = nodeOwnCreateStump
IfNode.prototype.dispose = nodeOwnSimpleDispose

/**
* attach到页面
*
* @param {HTMLElement} parentEl 要添加到的父元素
* @param {HTMLElement＝} beforeEl 要添加到哪个元素之前
*/
IfNode.prototype.attach = function (parentEl, beforeEl) {
    const me = this
    let elseIndex
    let child

    if (evalExpr(this.aNode.directives['if'].value, this.scope, this.owner)) { // eslint-disable-line dot-notation
        child = createNode(this.aNode.ifRinsed, this, this.scope, this.owner)
        elseIndex = -1
    } else {
        each(this.aNode.elses, function (elseANode, index) {
            const elif = elseANode.directives.elif

            if (!elif || (elif && evalExpr(elif.value, me.scope, me.owner))) {
                child = createNode(elseANode, me, me.scope, me.owner)
                elseIndex = index
                return false
            }
        })
    }

    if (child) {
        this.children[0] = child
        child.attach(parentEl, beforeEl)
        this.elseIndex = elseIndex
    }

    this._create()
    insertBefore(this.el, parentEl, beforeEl)
}

/**
* 视图更新函数
*
* @param {Array} changes 数据变化信息
*/
IfNode.prototype._update = function (changes) {
    const me = this
    let childANode = this.aNode.ifRinsed
    let elseIndex

    if (evalExpr(this.aNode.directives['if'].value, this.scope, this.owner)) { // eslint-disable-line dot-notation
        elseIndex = -1
    } else {
        each(this.aNode.elses, function (elseANode, index) {
            const elif = elseANode.directives.elif

            if ((elif && evalExpr(elif.value, me.scope, me.owner)) || !elif) {
                elseIndex = index
                childANode = elseANode
                return false
            }
        })
    }

    const child = this.children[0]
    if (elseIndex === this.elseIndex) {
        child && child._update(changes)
    } else {
        this.children = []
        if (child) {
            child._ondisposed = newChild
            child.dispose()
        } else {
            newChild()
        }

        this.elseIndex = elseIndex
    }

    function newChild () {
        if (typeof elseIndex !== 'undefined') {
            (me.children[0] = createNode(childANode, me, me.scope, me.owner))
                .attach(me.el.parentNode, me.el)
        }
    }
}

/**
* template 节点类
*
* @class
* @param {Object} aNode 抽象节点
* @param {Node} parent 父亲节点
* @param {Model} scope 所属数据环境
* @param {Component} owner 所属组件环境
* @param {DOMChildrenWalker?} reverseWalker 子元素遍历对象
*/
function TemplateNode (aNode, parent, scope, owner, reverseWalker) {
    this.aNode = aNode
    this.owner = owner
    this.scope = scope
    this.parent = parent
    this.parentComponent = parent.nodeType === 5
        ? parent
        : parent.parentComponent

    this.id = guid++
    this.lifeCycle = LifeCycle.start
    this.children = []

    // #[begin] reverse
    if (reverseWalker) {
        this.sel = document.createComment(this.id)
        insertBefore(this.sel, reverseWalker.target, reverseWalker.current)

        const me = this
        each(this.aNode.children, function (aNodeChild) {
            me.children.push(createReverseNode(aNodeChild, me, me.scope, me.owner, reverseWalker))
        })

        this.el = document.createComment(this.id)
        insertBefore(this.el, reverseWalker.target, reverseWalker.current)

        this.lifeCycle = LifeCycle.attached
    }
// #[end]
}

TemplateNode.prototype.nodeType = 7

TemplateNode.prototype.attach = nodeOwnOnlyChildrenAttach

/**
* 销毁释放
*
* @param {boolean=} noDetach 是否不要把节点从dom移除
* @param {boolean=} noTransition 是否不显示过渡动画效果
*/
TemplateNode.prototype.dispose = function (noDetach, noTransition) {
    elementDisposeChildren(this.children, noDetach, noTransition)

    if (!noDetach) {
        removeEl(this.el)
        removeEl(this.sel)
    }

    this.sel = null
    this.el = null
    this.owner = null
    this.scope = null
    this.children = null

    this.lifeCycle = LifeCycle.disposed

    if (this._ondisposed) {
        this._ondisposed()
    }
}

/**
* 视图更新函数
*
* @param {Array} changes 数据变化信息
*/
TemplateNode.prototype._update = function (changes) {
    for (let i = 0; i < this.children.length; i++) {
        this.children[i]._update(changes)
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
    return '_spsrId' + (ssrIndex++)
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

            const k = compileExprSource.stringLiteralize(key)
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

// const COMPONENT_RESERVED_MEMBERS = splitStr2Obj('aNode,computed,filters,components,' +
// 'initData,template,attached,created,detached,disposed,compiled'
// )

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
            sourceBuffer.joinRaw(`$${tagNameVariable} ? $${tagNameVariable} : "div"`)
        } else {
            sourceBuffer.joinString('<div')
        }

        // index list
        const propsIndex:any = {}
        each(props, function (prop) {
            propsIndex[prop.name] = prop

            if (prop.name !== 'slot' && prop.expr.value != null) {
                sourceBuffer.joinString(' ' + prop.name + '="' + prop.expr.segs[0].literal + '"')
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
                    sourceBuffer.addRaw('$selectValue = ' +
                        compileExprSource.expr(prop.expr) + '?' +
                        compileExprSource.expr(prop.expr) + ': "";'
                    )
                    return

                case 'option':
                    sourceBuffer.addRaw('$optionValue = ' +
                        compileExprSource.expr(prop.expr) +
                        ';'
                    )
                    // value
                    sourceBuffer.addRaw('if (isset($optionValue)) {')
                    sourceBuffer.joinRaw('" value=\\"" . $optionValue . "\\""')
                    sourceBuffer.addRaw('}')

                    // selected
                    sourceBuffer.addRaw('if ($optionValue == $selectValue) {')
                    sourceBuffer.joinString(' selected')
                    sourceBuffer.addRaw('}')
                    return
                }
            }

            switch (prop.name) {
            case 'readonly':
            case 'disabled':
            case 'multiple':
                if (prop.raw == null) {
                    sourceBuffer.joinString(' ' + prop.name)
                } else {
                    sourceBuffer.joinRaw('_::boolAttrFilter(\'' + prop.name + '\', ' +
                        compileExprSource.expr(prop.expr) +
                        ')'
                    )
                }
                break

            case 'checked':
                if (tagName === 'input') {
                    const valueProp = propsIndex.value
                    const valueCode = compileExprSource.expr(valueProp.expr)

                    if (valueProp) {
                        switch (propsIndex.type.raw) {
                        case 'checkbox':
                            sourceBuffer.addRaw('if (_::contains(' +
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

                sourceBuffer.joinRaw('_::attrFilter(\'' + prop.name + '\', ' +
                    (prop.x ? '_::escapeHTML(' : '') +
                    compileExprSource.expr(prop.expr) +
                    (prop.x ? ')' : '') +
                    ')'
                )

                if (onlyOneAccessor) {
                    sourceBuffer.addRaw('}')
                }

                break
            }
        })

        if (bindDirective) {
            sourceBuffer.addRaw(
                '(function ($bindObj) use (&$html){foreach ($bindObj as $key => $value) {'
            )

            if (tagName === 'textarea') {
                sourceBuffer.addRaw(
                    'if ($key == "value") {' +
                'continue;' +
                '}'
                )
            }

            sourceBuffer.addRaw('switch ($key) {\n' +
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
            sourceBuffer.joinRaw(`$${tagNameVariable} ? $${tagNameVariable} : "div"`)
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
                sourceBuffer.joinRaw('_::escapeHTML(' +
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
            /* eslint-disable no-use-before-define */
            each(aNode.children, function (aNodeChild) {
                aNodeCompiler.compile(aNodeChild, sourceBuffer, owner)
            })
            /* eslint-enable no-use-before-define */
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
    compile: function (aNode, sourceBuffer, owner, extra?) {
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
        each(aNode.elses, function (elseANode) {
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
        })
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
            directives: extend({}, aNode.directives),
            hotspot: aNode.hotspot
        }
        forElementANode.directives['for'] = null

        const forDirective = aNode.directives['for'] // eslint-disable-line dot-notation
        const itemName = forDirective.item
        const indexName = forDirective.index || genSSRId()
        const listName = genSSRId()

        sourceBuffer.addRaw('$' + listName + ' = ' + compileExprSource.expr(forDirective.value) + ';')
        sourceBuffer.addRaw(`if (is_array($${listName}) || is_object($${listName})) {`)

        // for array
        sourceBuffer.addRaw(`foreach ($${listName} as $${indexName} => $value) {`)
        sourceBuffer.addRaw(`$componentCtx["data"]->${indexName} = $${indexName};`)
        sourceBuffer.addRaw(`$componentCtx["data"]->${itemName} = $value;`)
        sourceBuffer.addRaw(
            aNodeCompiler.compile(
                forElementANode,
                sourceBuffer,
                owner
            )
        )
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

        sourceBuffer.addRaw(`if (!isset($componentCtx["slotRenderers"]["${rendererId}"])) ` +
        `$componentCtx["slotRenderers"]["${rendererId}"] = function () use (&$componentCtx, &$html){`)

        sourceBuffer.addRaw('$defaultSlotRender = function ($componentCtx) {')
        sourceBuffer.addRaw('  $html = "";')
        each(aNode.children, function (aNodeChild) {
            sourceBuffer.addRaw(aNodeCompiler.compile(aNodeChild, sourceBuffer, owner))
        })
        sourceBuffer.addRaw('  return $html;')
        sourceBuffer.addRaw('};')

        sourceBuffer.addRaw('$isInserted = false;')
        sourceBuffer.addRaw('$ctxSourceSlots = $componentCtx["sourceSlots"];')
        sourceBuffer.addRaw('$mySourceSlots = [];')

        const nameProp = getANodeProp(aNode, 'name')
        if (nameProp) {
            sourceBuffer.addRaw('$slotName = ' + compileExprSource.expr(nameProp.expr) + ';')

            sourceBuffer.addRaw('foreach ($ctxSourceSlots as $i => $slot) {')
            sourceBuffer.addRaw('  if (count($slot) > 1 && $slot[1] == $slotName) {')
            sourceBuffer.addRaw('    array_push($mySourceSlots, $slot[0]);')
            sourceBuffer.addRaw('    $isInserted = true;')
            sourceBuffer.addRaw('  }')
            sourceBuffer.addRaw('}')
        } else {
            sourceBuffer.addRaw('if (count($ctxSourceSlots) > 0 && !isset($ctxSourceSlots[0][1])) {')
            sourceBuffer.addRaw('  array_push($mySourceSlots, $ctxSourceSlots[0][0]);')
            sourceBuffer.addRaw('  $isInserted = true;')
            sourceBuffer.addRaw('}')
        }

        sourceBuffer.addRaw('if (!$isInserted) { array_push($mySourceSlots, $defaultSlotRender); }')
        sourceBuffer.addRaw('$slotCtx = $isInserted ? $componentCtx["owner"] : $componentCtx;')

        if (aNode.vars || aNode.directives.bind) {
            sourceBuffer.addRaw('$slotCtx = ["spsrCid" => $slotCtx["spsrCid"], "data" => $slotCtx["data"], "instance" => $slotCtx["instance"], "owner" => $slotCtx["owner"]];')

            if (aNode.directives.bind) {
                sourceBuffer.addRaw('_::extend($slotCtx["data"], ' + compileExprSource.expr(aNode.directives.bind.value) + ');'); // eslint-disable-line
            }

            each(aNode.vars, function (varItem) {
                sourceBuffer.addRaw(
                    '$slotCtx["data"]->' + varItem.name + ' = ' +
                compileExprSource.expr(varItem.expr) +
                ';'
                )
            })
        }

        sourceBuffer.addRaw('foreach ($mySourceSlots as $renderIndex => $slot) {')
        sourceBuffer.addRaw('  $html .= $slot($slotCtx);')
        sourceBuffer.addRaw('}')

        sourceBuffer.addRaw('};')
        sourceBuffer.addRaw(`call_user_func($componentCtx["slotRenderers"]["${rendererId}"]);`)
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
        let dataLiteral = '(object)[]'

        sourceBuffer.addRaw('$sourceSlots = [];')
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
                sourceBuffer.addRaw('array_push($sourceSlots, [function ($componentCtx) {')
                sourceBuffer.addRaw('  $html = "";')
                defaultSourceSlots.forEach(function (child) {
                    aNodeCompiler.compile(child, sourceBuffer, owner)
                })
                sourceBuffer.addRaw('  return $html;')
                sourceBuffer.addRaw('}]);')
            }

            for (const key in sourceSlotCodes) {
                const sourceSlotCode = sourceSlotCodes[key]
                sourceBuffer.addRaw('array_push($sourceSlots, [function ($componentCtx) {')
                sourceBuffer.addRaw('  $html = "";')
                sourceBuffer.addRaw(sourceSlotCode.children.forEach(function (child) {
                    aNodeCompiler.compile(child, sourceBuffer, owner)
                }))
                sourceBuffer.addRaw('  return $html;')
                sourceBuffer.addRaw('}, ' + compileExprSource.expr(sourceSlotCode.prop.expr) + ']);')
            }
        }

        const givenData = []
        each(camelComponentBinds(aNode.props), function (prop) {
            postProp(prop)
            const key = compileExprSource.stringLiteralize(prop.name)
            const val = compileExprSource.expr(prop.expr)
            givenData.push(`${key} => ${val}`)
        })

        dataLiteral = '(object)[' + givenData.join(',\n') + ']'
        if (aNode.directives.bind) {
            dataLiteral = '_::extend(' +
            compileExprSource.expr(aNode.directives.bind.value) +
            ', ' +
            dataLiteral +
            ')'
        }

        const renderId = compileComponentSource(sourceBuffer, extra.ComponentClass, owner.ssrContextId)
        sourceBuffer.addRaw(`$html .= ${renderId}(`)
        sourceBuffer.addRaw(dataLiteral + ', true, $componentCtx, ' +
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
                        compileComponentSource(sourceBuffer, CmptClass, contextId)
                    }
                }
            )
        }

        sourceBuffer.addRaw(`function ${cid}($data, $noDataOutput = false, $parentCtx = [], $tagName = null, $sourceSlots = []) {`)
        sourceBuffer.addRaw('$html = "";')

        sourceBuffer.addRaw(genComponentContextCode(component))

        // init data
        const defaultData = component.data.get()
        sourceBuffer.addRaw('if ($data) {')
        Object.keys(defaultData).forEach(function (key) {
            const val = stringifier.any(defaultData[key])
            if (val === 'NaN') return
            sourceBuffer.addRaw(`$componentCtx["data"]->${key} = isset($componentCtx["data"]->${key}) ? $componentCtx["data"]->${key} : ${val};`)
        })
        sourceBuffer.addRaw('}')

        // calc computed
        sourceBuffer.addRaw('foreach ($componentCtx["computedNames"] as $i => $computedName) {')
        sourceBuffer.addRaw('  $data->$computedName = _::callComputed($componentCtx, $computedName);')
        sourceBuffer.addRaw('}')

        const ifDirective = component.aNode.directives['if']
        if (ifDirective) {
            sourceBuffer.addRaw('if (' + compileExprSource.expr(ifDirective.value) + ') {')
        }

        elementSourceCompiler.tagStart(sourceBuffer, component.aNode, 'tagName')

        sourceBuffer.addRaw('if (!$noDataOutput) {')
        sourceBuffer.joinDataStringify()
        sourceBuffer.addRaw('}')

        elementSourceCompiler.inner(sourceBuffer, component.aNode, component)
        elementSourceCompiler.tagEnd(sourceBuffer, component.aNode, 'tagName')

        if (ifDirective) {
            sourceBuffer.addRaw('}')
        }

        sourceBuffer.addRaw('return $html;')
        sourceBuffer.addRaw('};')
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
function genComponentContextCode (component) {
    const code = ['$componentCtx = [']

    code.push('"computedNames" => [')
    code.push(Object.keys(component.computed).map(x => `"${x}"`).join(','))
    code.push('],')

    code.push(`"spsrCid" => ${component.constructor.spsrCid || 0},`)

    // sourceSlots
    code.push('"sourceSlots" => $sourceSlots,')

    // data
    const defaultData = component.data.get()
    code.push('"data" => $data ? $data : ' + stringifier.any(defaultData) + ',')

    // parentCtx
    code.push('"owner" => $parentCtx,')

    // slotRenderers
    code.push('"slotRenderers" => []')

    code.push('];')

    // create proto
    code.push('$componentCtx["instance"] = _::createComponent($componentCtx);')

    return code.join('\n')
}

/**
* 将组件编译成 render 方法的 js 源码
*
* @param {Function} ComponentClass 组件类
* @return {string}
*/
export function compileToSource (ComponentClass, { funcName = '' } = {}) {
    guid = 1
    ssrIndex = 0

    const sourceBuffer = new CompileSourceBuffer()
    const contextId = genSSRId()

    sourceBuffer.addRendererStart(funcName)
    const renderId = compileComponentSource(sourceBuffer, ComponentClass, contextId)
    sourceBuffer.addRaw(`return ${renderId}($data, $noDataOutput);`)
    sourceBuffer.addRendererEnd()

    return sourceBuffer.toCode()
}

export function compileToRenderer (ComponentClass) {
    let renderer = null

    if (!renderer) {
        const code = compileToSource(ComponentClass)
        renderer = (new Function('return ' + code))()   // eslint-disable-line
        ComponentClass.__ssrRenderer = renderer
    }

    return renderer
}
