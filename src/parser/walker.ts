/**
* 创建访问表达式对象
*
* @param {Array} paths 访问路径
* @return {Object}
*/
export function createAccessor (paths) {
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
export function readTertiaryExpr (walker) {
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
* 字符串源码读取类，用于模板字符串解析过程
*
* @class
* @param {string} source 要读取的字符串
*/
export class Walker {
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
