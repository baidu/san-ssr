import { SanSourceFile } from '../parser/san-sourcefile'

type ComponentClassInfo = {
    name: string
    path: string
}

export class ComponentRegistry {
    private components: Map<number, ComponentClassInfo> = new Map()

    registerComponents (file: SanSourceFile) {
        for (const [cid, clazz] of file.componentClasses) {
            this.components.set(cid, {
                path: file.getFilePath(),
                name: clazz.getName()
            })
        }
    }

    genComponentRegistry (ns: (file: string) => string) {
        const lines = []
        for (const [cid, { name, path }] of this.components) {
            const classReference = `\\${ns(path)}\\${name}`
            lines.push(`"${cid}" => "${classReference.replace(/\\/g, '\\\\')}"`)
        }
        let code = ''
        code += `namespace san\\runtime {\n`
        code += '    class ComponentRegistry {\n'
        code += '        public static $comps;\n'
        code += '        public static function get($cid){\n'
        code += '            return ComponentRegistry::$comps[$cid];\n'
        code += '        }\n'
        code += '    }\n'
        code += `    ComponentRegistry::$comps = [${lines.join(',\n')}];\n`
        code += '}\n'
        return code
    }
}
