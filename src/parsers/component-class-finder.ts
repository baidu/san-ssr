import { Component } from '../models/component'

export class ComponentClassFinder {
    private root: typeof Component
    private children: Set<typeof Component> = new Set()

    constructor (componentClass: typeof Component) {
        this.root = componentClass
    }

    public find (): typeof Component[] {
        this.findRecursively(this.root)
        return [...this.children]
    }

    private findRecursively (clazz: typeof Component) {
        if (this.children.has(clazz)) return
        this.children.add(clazz)

        for (let child of Object.values(this.getChildComponentClasses(clazz))) {
            if (this.isComponentLoader(child)) {
                child = child['placeholder']
            }
            if (!child) continue
            this.findRecursively(child as typeof Component)
        }
    }
    private getChildComponentClasses (componentClass: typeof Component) {
        if (componentClass.components) return componentClass.components
        if (componentClass.prototype && componentClass.prototype.components) {
            return componentClass.prototype.components
        }
        return {}
    }

    private isComponentLoader (cmpt: any): {placeholder: typeof Component} {
        return cmpt && cmpt.hasOwnProperty('load') && cmpt.hasOwnProperty('placeholder')
    }
}
