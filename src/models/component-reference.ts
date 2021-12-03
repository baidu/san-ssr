/**
 * 组件之间的引用
 *
 * 组件之间的引用通过 San 组件的 components 字段来定义。
 * SSR 时需要维护这一引用关系，在运行时找到并调用子组件。
 *
 * ComponentClass 作为输入时，没有文件信息，引用关系用递增 ID 来表达；
 * TS/JS/San 源码作为输入时，有源码文件目录结构信息，用文件+导出类名表达。
 */
import { Component } from 'san'

/**
 * 表示一个组件的引用，被引用组件可能在当前文件，也可能在外部文件。例如：
 *
 * // ComponentReference { specifier: './b.san', id: 'default' }
 * import AComponent from './b.san'
 *
 * // ComponentReference { specifier: './b.san', id: 'AComponent' }
 * import { AComponent } from './b.san'
 */
export class ComponentReference {
    constructor (
        /**
         * 组件所在源文件的相对路径
         */
        public readonly specifier: string,
        /**
         * 组件在所属 SanSourceFile 中的唯一标识，用来文件间引用组件。
         *
         * - 默认导出为的 ID 为 default，包括 module.exports = Component, export default Component
         * - 其他导出的 ID 为 class 名，对于 ComponentClass（没有 Class 名）为递增数字
         * - ID 是语言无关的。不可直接用于目标语言文件中的标识符，后者需要解决名字冲突和标识符合法性的问题，是语言相关的。
         */
        public readonly id: string
    ) {}
}

/**
 * ComponentReference 的特型，用于 ComponentClassParser
 */
export class DynamicComponentReference extends ComponentReference {
    constructor (
        public readonly specifier: string,
        public readonly id: string,
        /**
         * 从 ComponentClass 解析时，可以引用到子组件的 ComponentClass
         */
        public readonly componentClass: Component<{}>
    ) {
        super(specifier, id)
    }
}

export function componentID (isDefault: boolean, genID: string | (() => string)) {
    return isDefault ? 'default' : (typeof genID === 'function' ? genID() : genID)
}
