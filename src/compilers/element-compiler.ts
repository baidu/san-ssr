import { expr } from '../target-js/compilers/expr-compiler'
import { JSEmitter } from '../target-js/js-emitter'
import { getANodePropByName } from '../utils/anode-util'
import { _ } from '../runtime/underscore'
import { autoCloseTags } from '../utils/dom-util'
import { ANodeCompiler } from './anode-compiler'
import { ExprNode, ANodeProperty, Directive, ANode } from 'san'
import { isExprNumberNode, isExprStringNode, isExprBoolNode } from '../utils/type-guards'

/**
 * 编译一个 HTML 标签
 *
 * 每个 ElementCompiler 对象对应于一个 ComponentClass，可以用来编译该组件中的所有 HTML 标签，并递归地调用 ANodeCompiler 来编译标签内容。
 */
export class ElementCompiler {
    /**
     * @param aNodeCompiler 编译 aNode 的对象，编译标签内容时用
     * @param emitter 代码输出器，产出代码塞到这里面
     */
    constructor (
        private aNodeCompiler: ANodeCompiler<never>,
        private emitter: JSEmitter = new JSEmitter()
    ) {}

    /**
     * 编译元素标签头
     */
    tagStart (aNode: ANode) {
        const props = aNode.props
        const bindDirective = aNode.directives.bind
        const tagName = aNode.tagName
        const { emitter } = this

        // element start '<'
        if (tagName) {
            emitter.writeHTMLLiteral('<' + tagName)
        } else {
            emitter.writeHTMLLiteral('<')
            emitter.writeHTMLExpression('tagName')
        }

        // element properties
        const propsIndex = {}
        for (const prop of props) propsIndex[prop.name] = prop
        for (const prop of props) this.compileProperty(tagName, prop, propsIndex)
        if (bindDirective) this.compileBindProperties(tagName, bindDirective)

        // element end '>'
        emitter.writeHTMLLiteral('>')
    }

    private compileProperty (tagName: string, prop: ANodeProperty, propsIndex: { [key: string]: ANodeProperty }) {
        const { emitter } = this

        if (prop.name === 'slot') return
        if (prop.name === 'value') {
            if (tagName === 'textarea') return
            if (tagName === 'select') {
                return emitter.writeLine(`$selectValue = ${expr(prop.expr)} || "";`)
            }
            if (tagName === 'option') {
                emitter.writeLine(`$optionValue = ${expr(prop.expr)};`)
                emitter.writeIf('$optionValue != null', () => {
                    emitter.writeHTMLExpression('" value=\\"" + $optionValue + "\\""') // value attr
                })
                emitter.writeIf('$optionValue === $selectValue', () => {
                    emitter.writeHTMLLiteral(' selected') // selected attr
                })
                return
            }
        }

        if (prop.name === 'readonly' || prop.name === 'disabled' || prop.name === 'multiple') {
            if (this.isLiteral(prop.expr)) {
                if (_.boolAttrFilter(prop.name, prop.expr.value)) emitter.writeHTMLLiteral(` ${prop.name}`)
            } else {
                emitter.writeHTMLExpression(`_.boolAttrFilter("${prop.name}", ${expr(prop.expr)})`)
            }
            return
        }

        const valueProp = propsIndex.value
        const inputType = propsIndex.type
        if (prop.name === 'checked' && tagName === 'input' && valueProp && inputType) {
            switch (inputType.expr.value) {
            case 'checkbox':
                return emitter.writeIf(`_.includes(${expr(prop.expr)}, ${expr(valueProp.expr)})`, () => {
                    emitter.writeHTMLLiteral(' checked')
                })
            case 'radio':
                return emitter.writeIf(`${expr(prop.expr)} === ${expr(valueProp.expr)}`, () => {
                    emitter.writeHTMLLiteral(' checked')
                })
            }
        }
        if (this.isLiteral(prop.expr)) {
            emitter.writeHTMLLiteral(_.attrFilter(prop.name, prop.expr.value, true))
        } else {
            emitter.writeHTMLExpression(`_.attrFilter("${prop.name}", ${expr(prop.expr)}, true)`)
        }
    }

    private isLiteral (expr: ExprNode) {
        return isExprBoolNode(expr) || isExprStringNode(expr) || isExprNumberNode(expr)
    }

    private compileBindProperties (tagName: string, bindDirective: Directive<any>) {
        const { emitter } = this
        emitter.writeLine('(function ($bindObj) {')
        emitter.indent()

        emitter.writeFor('let $key in $bindObj', () => {
            emitter.writeLine('let $value = $bindObj[$key]')
            emitter.writeSwitch('$key', () => {
                emitter.writeCase('"readonly"')
                emitter.writeCase('"disabled"')
                emitter.writeCase('"multiple"')
                emitter.writeCase('"checked"', () => {
                    emitter.writeHTMLExpression('_.boolAttrFilter($key, $value)')
                    emitter.writeBreak()
                })
                emitter.writeDefault(() => {
                    emitter.writeHTMLExpression('_.attrFilter($key, $value, true)')
                })
            })
        })
        emitter.unindent()
        emitter.writeLine(`})(${expr(bindDirective.value)})`)
    }

    /**
     * 编译元素闭合
     */
    tagEnd (aNode: ANode) {
        const { emitter } = this
        const tagName = aNode.tagName

        if (tagName) {
            if (!autoCloseTags.has(tagName)) {
                emitter.writeHTMLLiteral('</' + tagName + '>')
            }
            if (tagName === 'select') {
                emitter.writeLine('$selectValue = null;')
            }
            if (tagName === 'option') {
                emitter.writeLine('$optionValue = null;')
            }
        } else {
            emitter.writeHTMLLiteral('</')
            emitter.writeHTMLExpression('tagName')
            emitter.writeHTMLLiteral('>')
        }
    }

    /**
     * 编译元素内容
     */
    inner (aNode: ANode) {
        const { emitter } = this
        // inner content
        if (aNode.tagName === 'textarea') {
            const valueProp = getANodePropByName(aNode, 'value')
            if (valueProp) emitter.writeHTMLExpression(expr(valueProp.expr, 'html'))
            return
        }

        const htmlDirective = aNode.directives.html
        if (htmlDirective) {
            emitter.writeHTMLExpression(expr(htmlDirective.value, 'rawhtml'))
            return
        }
        // only ATextNode#children is not defined, it has been taken over by ANodeCompiler#compileText()
        for (const aNodeChild of aNode.children!) this.aNodeCompiler.compile(aNodeChild, false)
    }
}
