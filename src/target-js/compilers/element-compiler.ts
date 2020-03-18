import { expr } from './expr-compiler'
import { JSEmitter } from '../emitters/emitter'
import { getANodePropByName } from '../../utils/anode-util'
import { autoCloseTags } from '../../utils/dom-util'
import { ExprType, ANode } from 'san'
import * as TypeGuards from '../../utils/type-guards'

/*
* element 的编译方法集合对象
*/
export class ElementCompiler {
    constructor (
        private compileAnode: (aNode: ANode, emitter: JSEmitter) => void,
        private noTemplateOutput: boolean,
        private emitter: JSEmitter
    ) {}

    /**
     * 编译元素标签头
     *
     * @param aNode 抽象节点
     * @param tagNameVariable 组件标签为外部动态传入时的标签变量名
     */
    tagStart (aNode: ANode, tagNameVariable?: string) {
        const props = aNode.props
        const bindDirective = aNode.directives.bind
        const tagName = aNode.tagName
        const { emitter } = this

        if (tagName) {
            emitter.bufferHTMLLiteral('<' + tagName)
        } else if (this.noTemplateOutput) {
            return
        } else if (tagNameVariable) {
            emitter.bufferHTMLLiteral('<')
            emitter.writeHTML(tagNameVariable + ' || "div"')
        } else {
            emitter.bufferHTMLLiteral('<div')
        }

        // index list
        const propsIndex = {}
        for (const prop of props) {
            propsIndex[prop.name] = prop

            if (prop.name !== 'slot') {
                if (TypeGuards.isExprBoolNode(prop.expr)) {
                    emitter.bufferHTMLLiteral(' ' + prop.name)
                } else if (TypeGuards.isExprStringNode(prop.expr)) {
                    emitter.bufferHTMLLiteral(` ${prop.name}="${prop.expr.literal}"`)
                } else if (prop.expr.value != null) {
                    emitter.bufferHTMLLiteral(` ${prop.name}="${expr(prop.expr)}"`)
                }
            }
        }

        for (const prop of props) {
            if (prop.name === 'slot' || prop.expr.value != null) {
                continue
            }

            if (prop.name === 'value') {
                switch (tagName) {
                case 'textarea':
                    continue

                case 'select':
                    emitter.writeLine('$selectValue = ' +
                        expr(prop.expr) +
                        ' || "";'
                    )
                    continue

                case 'option':
                    emitter.writeLine('$optionValue = ' +
                        expr(prop.expr) +
                        ';'
                    )
                    // value
                    emitter.writeIf('$optionValue != null', () => {
                        emitter.writeHTML('" value=\\"" + $optionValue + "\\""')
                    })

                    // selected
                    emitter.writeIf('$optionValue === $selectValue', () => {
                        emitter.bufferHTMLLiteral(' selected')
                    })
                    continue
                }
            }

            switch (prop.name) {
            case 'readonly':
            case 'disabled':
            case 'multiple':
                if (prop.raw == null) {
                    emitter.bufferHTMLLiteral(' ' + prop.name)
                } else {
                    emitter.writeHTML(
                        '_.boolAttrFilter("' + prop.name + '", ' +
                        expr(prop.expr) +
                        ')'
                    )
                }
                break

            case 'checked':
                if (tagName === 'input') {
                    const valueProp = propsIndex['value']
                    const valueCode = expr(valueProp.expr)

                    if (valueProp) {
                        switch (propsIndex['type'].raw) {
                        case 'checkbox':
                            emitter.writeIf(`_.includes(${expr(prop.expr)}, ${valueCode})`, () => {
                                emitter.bufferHTMLLiteral(' checked')
                            })
                            break

                        case 'radio':
                            emitter.writeIf(`${expr(prop.expr)} === ${valueCode}`, () => {
                                emitter.bufferHTMLLiteral(' checked')
                            })
                            break
                        }
                    }
                }
                break

            default:
                const onlyOneAccessor = prop.expr.type === ExprType.ACCESSOR
                emitter.writeHTML('_.attrFilter("' + prop.name + '", ' +
                    expr(prop.expr) +
                    (prop.x || onlyOneAccessor ? ', true' : '') +
                    ')'
                )
                break
            }
        }

        if (bindDirective) {
            // start function
            emitter.writeLine('(function ($bindObj) {')
            emitter.indent()

            emitter.writeFor('var $key in $bindObj', () => {
                emitter.writeLine('var $value = $bindObj[$key]')

                if (tagName === 'textarea') {
                    emitter.writeIf('$key === "value"', () => {
                        emitter.writeLine('continue')
                    })
                }

                emitter.writeSwitch('$key', () => {
                    emitter.writeCase('"readonly"')
                    emitter.writeCase('"disabled"')
                    emitter.writeCase('"multiple"')
                    emitter.writeCase('"checked"', () => {
                        emitter.writeHTML('_.boolAttrFilter($key, $value)')
                        emitter.writeBreak()
                    })
                    emitter.writeDefault(() => {
                        emitter.writeHTML('_.attrFilter($key, $value, true)')
                    })
                })
            })
            // end function
            emitter.unindent()
            emitter.writeLine(`})(${expr(bindDirective.value)})`)
        }

        emitter.bufferHTMLLiteral('>')
    }

    /**
     * 编译元素闭合
     *
     * @param aNode 抽象节点
     * @param tagNameVariable 组件标签为外部动态传入时的标签变量名
     */
    tagEnd (aNode: ANode, tagNameVariable?: string) {
        const { emitter } = this
        const tagName = aNode.tagName

        if (tagName) {
            if (!autoCloseTags.has(tagName)) {
                emitter.bufferHTMLLiteral('</' + tagName + '>')
            }

            if (tagName === 'select') {
                emitter.writeLine('$selectValue = null;')
            }

            if (tagName === 'option') {
                emitter.writeLine('$optionValue = null;')
            }
        } else if (this.noTemplateOutput) {
            // noop
        } else {
            emitter.bufferHTMLLiteral('</')
            emitter.writeHTML(tagNameVariable + ' || "div"')
            emitter.bufferHTMLLiteral('>')
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
            if (valueProp) {
                emitter.writeHTML('_.escapeHTML(' +
                expr(valueProp.expr) +
                ')'
                )
            }
            return
        }

        const htmlDirective = aNode.directives.html
        if (htmlDirective) {
            emitter.writeHTML(expr(htmlDirective.value))
        } else {
            for (const aNodeChild of aNode.children || []) {
                this.compileAnode(aNodeChild, emitter)
            }
        }
    }
}
