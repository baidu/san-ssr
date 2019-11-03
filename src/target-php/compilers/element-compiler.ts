import { compileExprSource } from '../compilers/expr-compiler'
import { autoCloseTags } from '../..'

/**
* element 的编译方法集合对象
*/
export class ElementCompiler {
    private compileANode

    constructor (compileANode) {
        this.compileANode = compileANode
    }
    /**
     * 编译元素标签头
     *
     * @param {PHPEmitter} emitter 编译源码的中间buffer
     * @param {ANode} aNode 抽象节点
     * @param {string=} tagNameVariable 组件标签为外部动态传入时的标签变量名
     */
    tagStart (emitter, aNode, tagNameVariable?) {
        const props = aNode.props
        const bindDirective = aNode.directives.bind
        const tagName = aNode.tagName

        if (tagName) {
            emitter.bufferHTMLLiteral('<' + tagName)
        } else if (tagNameVariable) {
            emitter.bufferHTMLLiteral('<')
            emitter.writeHTML(`$${tagNameVariable} ? $${tagNameVariable} : "div"`)
        } else {
            emitter.bufferHTMLLiteral('<div')
        }

        // index list
        const propsIndex:any = {}
        for (const prop of props) {
            propsIndex[prop.name] = prop

            if (prop.name !== 'slot' && prop.expr.value != null) {
                emitter.bufferHTMLLiteral(' ' + prop.name + '="' + prop.expr.segs[0].literal + '"')
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
                        compileExprSource.expr(prop.expr) + '?' +
                        compileExprSource.expr(prop.expr) + ': "";'
                    )
                    continue

                case 'option':
                    emitter.writeLine('$optionValue = ' +
                        compileExprSource.expr(prop.expr) +
                        ';'
                    )
                    // value
                    emitter.writeIf('isset($optionValue)', () => {
                        emitter.writeHTML('" value=\\"" . $optionValue . "\\""')
                    })

                    // selected
                    emitter.writeIf('$optionValue == $selectValue', () => {
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
                    emitter.writeHTML('_::boolAttrFilter(\'' + prop.name + '\', ' +
                        compileExprSource.expr(prop.expr) +
                        ')'
                    )
                }
                break

            case 'checked':
                if (tagName === 'input') {
                    const valueProp = propsIndex.value
                    const valueCode = compileExprSource.expr(valueProp.expr)

                    if (valueProp) {
                        switch (propsIndex.type.raw) {
                        case 'checkbox':
                            emitter.writeIf(`_::contains(${compileExprSource.expr(prop.expr)}, ${valueCode})`, () => {
                                emitter.bufferHTMLLiteral(' checked')
                            })
                            break
                        case 'radio':
                            emitter.writeIf(`${compileExprSource.expr(prop.expr)} === ${valueCode}`, () => {
                                emitter.bufferHTMLLiteral(' checked')
                            })
                            break
                        }
                    }
                }
                break

            default:
                let onlyOneAccessor = false
                let preCondExpr

                if (prop.expr.type === 4) {
                    onlyOneAccessor = true
                    preCondExpr = prop.expr
                } else if (prop.expr.type === 7 && prop.expr.segs.length === 1) {
                    const interpExpr = prop.expr.segs[0]
                    const interpFilters = interpExpr.filters

                    if (!interpFilters.length ||
                        (interpFilters.length === 1 && interpFilters[0].args.length === 0)
                    ) {
                        onlyOneAccessor = true
                        preCondExpr = prop.expr.segs[0].expr
                    }
                }

                if (onlyOneAccessor) {
                    emitter.beginIf(compileExprSource.expr(preCondExpr))
                }

                emitter.writeHTML('_::attrFilter(\'' + prop.name + '\', ' +
                    (prop.x ? '_::escapeHTML(' : '') +
                    compileExprSource.expr(prop.expr) +
                    (prop.x ? ')' : '') +
                    ')'
                )

                if (onlyOneAccessor) {
                    emitter.endIf()
                }

                break
            }
        }

        if (bindDirective) {
            emitter.nextLine('(')
            emitter.writeAnonymousFunction(['$bindObj'], ['&$html'], () => {
                emitter.writeForeach('$bindObj as $key => $value', () => {
                    if (tagName === 'textarea') {
                        emitter.writeIf('$key == "value"', () => emitter.writeContinue())
                    }

                    emitter.writeSwitch('$key', () => {
                        emitter.writeCase('"readonly"')
                        emitter.writeCase('"disabled"')
                        emitter.writeCase('"multiple"', () => {
                            emitter.writeLine('$html .= _::boolAttrFilter($key, _::escapeHTML($value));')
                            emitter.writeBreak()
                        })
                        emitter.writeDefault(() => {
                            emitter.writeLine('$html .= _::attrFilter($key, _::escapeHTML($value));')
                        })
                    })
                })
            })

            emitter.write(')(')
            emitter.write(compileExprSource.expr(bindDirective.value))
            emitter.feedLine(');')
        }

        emitter.bufferHTMLLiteral('>')
    }

    /**
     * 编译元素闭合
     *
     * @param {PHPEmitter} emitter 编译源码的中间buffer
     * @param {ANode} aNode 抽象节点
     * @param {string=} tagNameVariable 组件标签为外部动态传入时的标签变量名
     */
    tagEnd (emitter, aNode, tagNameVariable?) {
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
        } else {
            emitter.bufferHTMLLiteral('</')
            emitter.writeHTML(`$${tagNameVariable} ? $${tagNameVariable} : "div"`)
            emitter.bufferHTMLLiteral('>')
        }
    }

    /**
     * 编译元素内容
     *
     * @param {PHPEmitter} emitter 编译源码的中间buffer
     * @param {ANode} aNode 元素的抽象节点信息
     */
    inner (emitter, aNode) {
        if (aNode.tagName === 'textarea') {
            const valueProp = aNode.props[aNode.hotspot.props['value']]
            if (valueProp) {
                emitter.writeHTML(
                    '_::escapeHTML(' +
                    compileExprSource.expr(valueProp.expr) +
                    ')'
                )
            }
            return
        }

        const htmlDirective = aNode.directives.html
        if (htmlDirective) {
            emitter.writeHTML(compileExprSource.expr(htmlDirective.value))
        } else {
            for (const aNodeChild of aNode.children) {
                this.compileANode(aNodeChild, emitter)
            }
        }
    }
}
