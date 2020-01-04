import { compileExprSource } from './expr-compiler'
import { ANode } from '../../models/anode'
import { getANodePropByName } from '../../utils/anode'
import { autoCloseTags } from '../../utils/element'
import { ExprType } from 'san'

/*
* element 的编译方法集合对象
*/
export class ElementCompiler {
    private compileAnode
    private noTemplateOutput: boolean

    constructor (compileAnode, noTemplateOutput) {
        this.compileAnode = compileAnode
        this.noTemplateOutput = noTemplateOutput
    }

    /**
     * 编译元素标签头
     *
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     * @param {ANode} aNode 抽象节点
     * @param {string=} tagNameVariable 组件标签为外部动态传入时的标签变量名
     */
    tagStart (sourceBuffer, aNode, tagNameVariable?) {
        const props = aNode.props
        const bindDirective = aNode.directives.bind
        const tagName = aNode.tagName

        if (tagName) {
            sourceBuffer.joinString('<' + tagName)
        } else if (this.noTemplateOutput) {
            return
        } else if (tagNameVariable) {
            sourceBuffer.joinString('<')
            sourceBuffer.joinRaw(tagNameVariable + ' || "div"')
        } else {
            sourceBuffer.joinString('<div')
        }

        // index list
        const propsIndex = {}
        for (const prop of props) {
            propsIndex[prop.name] = prop

            if (prop.name !== 'slot') {
                switch (prop.expr.type) {
                case ExprType.BOOL:
                    sourceBuffer.joinString(' ' + prop.name)
                    break

                case ExprType.STRING:
                    sourceBuffer.joinString(' ' + prop.name + '="' +
                        prop.expr.literal + '"')
                    break

                default:
                    if (prop.expr.value != null) {
                        sourceBuffer.joinString(' ' + prop.name + '="' +
                            compileExprSource.expr(prop.expr) + '"')
                    }
                    break
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
                    sourceBuffer.addRaw('$selectValue = ' +
                        compileExprSource.expr(prop.expr) +
                        ' || "";'
                    )
                    continue

                case 'option':
                    sourceBuffer.addRaw('$optionValue = ' +
                        compileExprSource.expr(prop.expr) +
                        ';'
                    )
                    // value
                    sourceBuffer.addRaw('if ($optionValue != null) {')
                    sourceBuffer.joinRaw('" value=\\"" + $optionValue + "\\""')
                    sourceBuffer.addRaw('}')

                    // selected
                    sourceBuffer.addRaw('if ($optionValue === $selectValue) {')
                    sourceBuffer.joinString(' selected')
                    sourceBuffer.addRaw('}')
                    continue
                }
            }

            switch (prop.name) {
            case 'readonly':
            case 'disabled':
            case 'multiple':
                if (prop.raw == null) {
                    sourceBuffer.joinString(' ' + prop.name)
                } else {
                    sourceBuffer.joinRaw(
                        '_.boolAttrFilter("' + prop.name + '", ' +
                        compileExprSource.expr(prop.expr) +
                        ')'
                    )
                }
                break

            case 'checked':
                if (tagName === 'input') {
                    const valueProp = propsIndex['value']
                    const valueCode = compileExprSource.expr(valueProp.expr)

                    if (valueProp) {
                        switch (propsIndex['type'].raw) {
                        case 'checkbox':
                            sourceBuffer.addRaw('if (_.contains(' +
                                    compileExprSource.expr(prop.expr) +
                                    ', ' +
                                    valueCode +
                                    ')) {'
                            )
                            sourceBuffer.joinString(' checked')
                            sourceBuffer.addRaw('}')
                            break

                        case 'radio':
                            sourceBuffer.addRaw('if (' +
                                    compileExprSource.expr(prop.expr) +
                                    ' === ' +
                                    valueCode +
                                    ') {'
                            )
                            sourceBuffer.joinString(' checked')
                            sourceBuffer.addRaw('}')
                            break
                        }
                    }
                }
                break

            default:
                const onlyOneAccessor = prop.expr.type === ExprType.ACCESSOR
                sourceBuffer.joinRaw('_.attrFilter("' + prop.name + '", ' +
                    compileExprSource.expr(prop.expr) +
                    (prop.x || onlyOneAccessor ? ', true' : '') +
                    ')'
                )
                break
            }
        }

        if (bindDirective) {
            sourceBuffer.addRaw(
                '(function ($bindObj) {for (var $key in $bindObj) {' +
            'var $value = $bindObj[$key];'
            )

            if (tagName === 'textarea') {
                sourceBuffer.addRaw(
                    'if ($key === "value") {' +
                'continue;' +
                '}'
                )
            }

            sourceBuffer.addRaw('switch ($key) {\n' +
            'case "readonly":\n' +
            'case "disabled":\n' +
            'case "multiple":\n' +
            'case "checked":\n' +
            'html += _.boolAttrFilter($key, $value);\n' +
            'break;\n' +
            'default:\n' +
            'html += _.attrFilter($key, $value, true);' +
            '}'
            )

            sourceBuffer.addRaw(
                '}})(' +
            compileExprSource.expr(bindDirective.value) +
            ');'
            )
        }

        sourceBuffer.joinString('>')
    }

    /**
     * 编译元素闭合
     *
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     * @param {ANode} aNode 抽象节点
     * @param {string=} tagNameVariable 组件标签为外部动态传入时的标签变量名
     */
    tagEnd (sourceBuffer, aNode, tagNameVariable?) {
        const tagName = aNode.tagName

        if (tagName) {
            if (!autoCloseTags.has(tagName)) {
                sourceBuffer.joinString('</' + tagName + '>')
            }

            if (tagName === 'select') {
                sourceBuffer.addRaw('$selectValue = null;')
            }

            if (tagName === 'option') {
                sourceBuffer.addRaw('$optionValue = null;')
            }
        } else if (this.noTemplateOutput) {
            // noop
        } else {
            sourceBuffer.joinString('</')
            sourceBuffer.joinRaw(tagNameVariable + ' || "div"')
            sourceBuffer.joinString('>')
        }
    }

    /**
     * 编译元素内容
     *
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     */
    inner (sourceBuffer, aNode: ANode) {
        // inner content
        if (aNode.tagName === 'textarea') {
            const valueProp = getANodePropByName(aNode, 'value')
            if (valueProp) {
                sourceBuffer.joinRaw('_.escapeHTML(' +
                compileExprSource.expr(valueProp.expr) +
                ')'
                )
            }
            return
        }

        const htmlDirective = aNode.directives.html
        if (htmlDirective) {
            sourceBuffer.joinExpr(htmlDirective.value)
        } else {
            for (const aNodeChild of aNode.children) {
                this.compileAnode(aNodeChild, sourceBuffer)
            }
        }
    }
}
