import { ExpressionStatement, MethodDefinition, ObjectExpression, CallExpression, Node } from 'estree'
import { JavaScriptSanParser } from './javascript-san-parser'
import assert from 'assert'
import { isClass, getConstructor, addStringPropertyForObject, assertObjectExpression, isCallExpression, isObjectExpression, findDefaultExport } from '../ast/js-ast-util'

export class SanFileParser {
    private readonly parser: JavaScriptSanParser

    constructor (
        public readonly scriptContent: string,
        public readonly templateContent: string,
        private readonly filePath: string
    ) {
        this.parser = new JavaScriptSanParser(filePath, scriptContent, 'module')
    }

    parse () {
        const expr = findDefaultExport(this.parser.root)
        assert(expr, 'default export not found')

        // export default { inited() {} }
        if (isObjectExpression(expr)) this.expandToSanComponent(expr)

        // defineComponent({}) -> defineComponent({ template: `${templateContent}` })
        this.insertTemplate(expr)

        return this.parser.parse()
    }

    /**
     * 把简写的 san options 替换为 san Component。
     * { inited(){} } -> require('san').defineComponent({ inited(){} })
     */
    private expandToSanComponent (options: ObjectExpression) {
        const defineComponent: CallExpression = {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: {
                    type: 'CallExpression',
                    callee: { type: 'Identifier', name: 'require' },
                    arguments: [{ type: 'Literal', value: 'san', raw: "'san'" }],
                    optional: false
                },
                property: { type: 'Identifier', name: 'defineComponent' },
                computed: false,
                optional: false
            },
            arguments: [{ ...options }],
            optional: false
        }
        Object.assign(options, defineComponent)
    }

    /**
     * 把模板字符串插入到 san 组件定义中
     * - 情况一：defineComponent({ inited(){} }) -> defineComponent({ inited(){}, template: '<div>...</div>' })
     * - 情况二：class XComponent { constructor() {} } -> class XComponent { constructor() { this.template='<div>...</div>' } }
     */
    private insertTemplate (expr: Node) {
        if (isCallExpression(expr)) {
            assert(expr.arguments[0], 'cannot parse san script')
            assertObjectExpression(expr.arguments[0])
            addStringPropertyForObject(expr.arguments[0], 'template', this.templateContent)
        } else if (isClass(expr)) {
            let fn = getConstructor(expr)
            if (!fn) {
                fn = this.createEmptyConstructor()
                expr.body.body.push(fn)
            }
            fn.value.body.body.push(this.createTemplateAssignmentExpression())
        } else {
            throw new Error('entry component not found')
        }
    }

    private createEmptyConstructor (): MethodDefinition {
        return {
            type: 'MethodDefinition',
            kind: 'constructor',
            static: false,
            computed: false,
            key: { type: 'Identifier', name: 'constructor' },
            value: {
                type: 'FunctionExpression',
                id: null,
                generator: false,
                async: false,
                params: [],
                body: { type: 'BlockStatement', body: [] }
            }
        }
    }

    /**
     * 创建给 this.template 赋值为 this.templateContent 的表达式
     */
    private createTemplateAssignmentExpression (): ExpressionStatement {
        return {
            type: 'ExpressionStatement',
            expression: {
                type: 'AssignmentExpression',
                operator: '=',
                left: {
                    type: 'MemberExpression',
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'template' },
                    computed: false,
                    optional: false
                },
                right: {
                    type: 'Literal',
                    value: this.templateContent,
                    raw: JSON.stringify(this.templateContent)
                }
            }
        }
    }
}
