import { SanComponent, ComponentConstructor } from 'san'
import { ANode } from './anode'

export class CompiledComponent<T> extends SanComponent<T> {
    tagName: string
    aNode: ANode
    initData?(): T
    inited?(): void
    getComponentType?(aNode: ANode): ComponentConstructor<{}, {}>
    components: {
        [key: string]: ComponentConstructor<{}, {}>
    }
}
