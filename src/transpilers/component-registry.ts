import { SanSourceFile } from './san-sourcefile'

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
            lines.push(`"${cid}" => ${classReference}`)
        }
        let code = ''
        code += `namespace \\san\\runtime {\n`
        code += `    $spsr_components = [${lines.join(',\n')}];\n`
        code += '    function get_comp_class($cid) {\n'
        code += '        return $spsr_components[$cid];\n'
        code += '    }\n'
        code += '}\n'
        return code
    }
}
