import { ComponentConstructor } from 'san'

export interface ComponentReference {
    /**
     * 组件所在源文件的相对路径
     */
    specifier: string
    /**
     * 组件的 id。见下面的说明。
     */
    id: string
    /**
     * 是否是该源文件的默认导出（export default 或 module.exports）
     */
    isDefault: boolean
}

/**
 * ComponentReference 的特型，用于 ComponentClassParser
 */
export interface DynamicComponentReference extends ComponentReference {
    /**
     * 从 ComponentClass 解析时，可以引用到子组件的 ComponentClass
     */
    componentClass: ComponentConstructor<{}, {}>
}

/**
 * 组件在所属 SanSourceFile 中的唯一标识。
 *
 * 1. 对于 ComponentClass 打包编译：可以从 ComponentClass 映射到 ID。
 *   - 此时不对源码的结构做任何要求，因此是一个包含递增数字的合法标识符名
 *   - 例如：0 为第一个，1 为第二个…
 *
 * 2. 对于 TypeScript San 源文件单独编译：可以从 import 语句映射到 ID。
 *   - 此时要求它是 sourceFile 内 top level 的名字，因此是唯一的
 *   - 例如：named export 组件，ID 为 ClassDeclaration#.getName()
 *   - 特例：default export 的组件，ID 为 0
 *
 * Note: ID 的作用只是确保文件中唯一，不可直接用于目标语言文件中的标识符
 */
export function getComponentClassID (id: number) {
    return '' + id
}
export function getExportedComponentID (name: string) {
    return name
}
/**
 * 默认导出需要有固定的名字，因为它的引用不包含它的名字信息。
 *
 * 例如：
 * // a.san.ts
 * export default class A extends Component {}
 *
 * // b.san.ts
 * import AComponent from './a.san'
 *
 * // 对于如下 Component Reference，
 * // 如果 id 为 AComponent 将无法定位到 a.san.ts 中的 class A
 * { specifier: './a.san', id: '0', isDefault: true }
 */
export function getDefaultExportedComponentID () {
    return '0'
}
