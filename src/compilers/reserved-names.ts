export const RESERVED_NAMES = {
    // for server render component
    renderOnly: 'renderOnly'
}

/**
 * 标记 Component 实例中是否有动态 this 表达式，如果有则编译器会增加 DYNAMIC_THIS_FLAG 标记，用于设置 data proxy 数据
 *
 * 例如：
 * ```javascript
 * class A extends san.Component{
 *  init() {
 *      call(this)
 *  }
 *  _ssrHasDynamicThis = true
 * }
 * ```
 * 或者
 * ```javascript
 * san.defineComponent({
 *  init() {
 *      call(this)
 *  },
 *  _ssrHasDynamicThis = true
 * })
 * ```
 */
export const DYNAMIC_THIS_FLAG = '_ssrHasDynamicThis'
