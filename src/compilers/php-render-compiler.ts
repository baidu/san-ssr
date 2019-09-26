/**
 * 将组件树编译成 render 函数之间的递归调用
 * 提供 compileRenderFunction 方法
 */
import { each, extend, inherits } from '../utils/underscore'
import { createAccessor, Walker, readTertiaryExpr } from '../parsers/walker'
import { PHPEmitter } from '../emitters/php-emitter'
import { ExpressionEmitter } from '../emitters/expression-emitter'

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
* 将 DOM 从页面中移除
*
* @param {HTMLElement} el DOM元素
*/
function removeEl (el) {
    if (el && el.parentNode) {
        el.parentNode.removeChild(el)
    }
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
* 默认的元素的属性设置的变换方法
*
* @inner
* @type {Object}
*/

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
        this.lifeCycle = LifeCycle.attached
    }
// #[end]
}

Element.prototype.nodeType = 4

Element.prototype._onEl = elementOwnOnEl

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

        insertBefore(this.el, reverseWalker.target, reverseWalker.current)
    }
// #[end]
}

ForNode.prototype.nodeType = 3

/**
* 创建子元素
*/
ForNode.prototype._createChildren = function () {
    const listData = this.listData

    if (listData instanceof Array) {
        for (let i = 0; i < listData.length; i++) {
            const child = createNode(this.aNode.forRinsed, this, new ForItemData(this, listData[i], i), this.owner)
            this.children.push(child)
        }
    } else if (listData && typeof listData === 'object') {
        for (const i in listData) {
            if (listData.hasOwnProperty(i) && listData[i] != null) {
                const child = createNode(this.aNode.forRinsed, this, new ForItemData(this, listData[i], i), this.owner)
                this.children.push(child)
            }
        }
    }
}

ForNode.prototype.opti = typeof navigator !== 'undefined' &&
/chrome\/[0-9]+/i.test(navigator.userAgent)

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

        insertBefore(this.el, reverseWalker.target, reverseWalker.current)
    }
// #[end]
}

IfNode.prototype.nodeType = 2

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
            /* eslint-disable no-use-before-define */
            each(aNode.children, function (aNodeChild) {
                aNodeCompiler.compile(aNodeChild, emitter, owner)
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
                    emitter.writeLine('$slotCtx = (object)["spsrCid" => $slotCtx->spsrCid, "data" => $slotCtx->data, "instance" => $slotCtx->instance, "owner" => $slotCtx->owner];')

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

    emitter.writeLine(`"spsrCid" => ${component.constructor.spsrCid || 0},`)
    emitter.writeLine('"sourceSlots" => $sourceSlots,')
    emitter.writeLine('"data" => $data ? $data : ' + stringifier.any(component.data.get()) + ',')
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
export function compileRenderFunction ({
    ComponentClass,
    funcName = '',
    ns = 'san\\renderer',
    emitter = new PHPEmitter()
}) {
    emitter.beginNamespace(ns)
    emitter.writeLine(`use \\san\\runtime\\_;`)
    guid = 1
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
