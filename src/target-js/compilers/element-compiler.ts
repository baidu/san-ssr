import { expr } from './expr-compiler'
import { JSEmitter } from '../js-emitter'
import { getANodePropByName } from '../../utils/anode-util'
import { autoCloseTags } from '../../utils/dom-util'
import { ANodeCompiler } from './anode-compiler'
import { ANodeProperty, Directive, ExprType, ANode } from 'san'
import { isExprStringNode, isExprBoolNode } from '../../utils/type-guards'
import { stringifier } from './stringifier'

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
        const { name } = prop
        const { emitter } = this
        if (name === 'slot') return

        if (isExprBoolNode(prop.expr)) return emitter.writeHTMLLiteral(' ' + name)
        if (isExprStringNode(prop.expr)) return emitter.writeHTMLLiteral(` ${name}=${stringifier.str(prop.expr.value)}`)
        if (prop.expr.value != null) return emitter.writeHTMLLiteral(` ${name}="${expr(prop.expr)}"`)

        if (name === 'value') {
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

        if (name === 'readonly' || name === 'disabled' || name === 'multiple') {
            return emitter.writeHTMLExpression(`_.boolAttrFilter("${name}", ${expr(prop.expr)})`)
        }

        const valueProp = propsIndex['value']
        const inputType = propsIndex['type']
        if (name === 'checked' && tagName === 'input' && valueProp && inputType) {
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

        const onlyOneAccessor = prop.expr.type === ExprType.ACCESSOR
        const escp = (prop.x || onlyOneAccessor ? ', true' : '')
        emitter.writeHTMLExpression(`_.attrFilter("${name}", ${expr(prop.expr)}${escp})`)
    }

    private compileBindProperties (tagName: string, bindDirective: Directive<any>) {
        const { emitter } = this
        // start function
        emitter.writeLine('(function ($bindObj) {')
        emitter.indent()

        emitter.writeFor('var $key in $bindObj', () => {
            emitter.writeLine('var $value = $bindObj[$key]')
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
        // end function
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
            if (valueProp) emitter.writeHTMLExpression(`_.escapeHTML(${expr(valueProp.expr)})`)
            return
        }

        const htmlDirective = aNode.directives.html
        if (htmlDirective) {
            emitter.writeHTMLExpression(expr(htmlDirective.value))
            return
        }
        // only ATextNode#children is not defined, it has been taken over by ANodeCompiler#compileText()
        for (const aNodeChild of aNode.children!) this.aNodeCompiler.compile(aNodeChild, false)
    }
}
