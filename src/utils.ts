
/**
* 遍历数组集合
*
* @param {Array} array 数组源
* @param {function(Any,number):boolean} iterator 遍历函数
*/
export function each (array, iterator) {
    if (array && array.length > 0) {
        for (let i = 0, l = array.length; i < l; i++) {
            if (iterator(array[i], i) === false) {
                break
            }
        }
    }
}

/**
* 判断数组中是否包含某项
*
* @param {Array} array 数组
* @param {*} value 包含的项
* @return {boolean}
*/
export function contains (array, value) {
    let result = false
    each(array, function (item) {
        result = item === value
        return !result
    })

    return result
}

/**
* 构建类之间的继承关系
*
* @param {Function} subClass 子类函数
* @param {Function} superClass 父类函数
*/
export function inherits (subClass, superClass) {
    const subClassProto = subClass.prototype
    const F = new Function() as {new(): typeof F}   // eslint-disable-line
    F.prototype = superClass.prototype
    subClass.prototype = new F()
    subClass.prototype.constructor = subClass
    extend(subClass.prototype, subClassProto)
}

/**
* Function.prototype.bind 方法的兼容性封装
*
* @param {Function} func 要bind的函数
* @param {Object} thisArg this指向对象
* @param {...*} args 预设的初始参数
* @return {Function}
*/
export function bind (func, thisArg) {
    const nativeBind = Function.prototype.bind
    const slice = Array.prototype.slice
    // #[begin] allua
    if (nativeBind && func.bind === nativeBind) {
    // #[end]
        return nativeBind.apply(func, slice.call(arguments, 1))
    // #[begin] allua
    }

    /* istanbul ignore next */
    const args = slice.call(arguments, 2)
    /* istanbul ignore next */
    return function () {
        return func.apply(thisArg, args.concat(slice.call(arguments)))
    }
// #[end]
}

export function empty () {}

/**
* 对象属性拷贝
*
* @param {Object} target 目标对象
* @param {Object} source 源对象
* @return {Object} 返回目标对象
*/
export function extend (target, source) {
    for (const key in source) {
    /* istanbul ignore else  */
        if (source.hasOwnProperty(key)) {
            const value = source[key]
            if (typeof value !== 'undefined') {
                target[key] = value
            }
        }
    }

    return target
}
