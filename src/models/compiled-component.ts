import { ANode, SanComponent, ComponentConstructor } from 'san'

export interface CompiledComponent<T> extends SanComponent<T> {
    aNode: ANode
    initData?(): T
    inited?(): void
    getComponentType?(aNode: ANode): ComponentConstructor<{}, {}>
    components: {
        [key: string]: ComponentConstructor<{}, {}>
    }
}
