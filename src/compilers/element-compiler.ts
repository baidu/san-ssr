/**
 * 编译一个 HTML 标签
 *
 * 对于 Element 类型的 ANode，采用这个编译器。
 * 大概就是先产出一个开始标签，再递归编译其内容，再产出一个结束标签。
 */
import { getANodePropByName } from '../ast/san-ast-util'
import { _ } from '../runtime/underscore'
import { IDGenerator } from '../utils/id-generator'
import { autoCloseTags } from '../utils/dom-util'
import { ANodeCompiler } from './anode-compiler'
import { ADirectiveBind, AElement, AProperty, BoolLiteral, Expr, NumberLiteral, StringLiteral } from 'san'
import { isExprNumberNode, isExprStringNode, isExprBoolNode, isExprWithValue } from '../ast/san-ast-type-guards'
import {
    createIfStrictEqual, createIfNotNull, createDefaultValue, createHTMLLiteralAppend, createHTMLExpressionAppend, NULL,
    L, I, ASSIGN, DEF, BINARY
} from '../ast/renderer-ast-util'
import { HelperCall, ArrayIncludes, Else, Foreach, If, MapLiteral, Statement } from '../ast/renderer-ast-dfn'
import { sanExpr, OutputType } from './san-expr-compiler'
import assert from 'assert'
import { ComponentInfo } from '../models/component-info'

const BOOL_ATTRIBUTES = ['readonly', 'disabled', 'multiple', 'checked']

/**
 * Element 的编译器
 *
 * 每个 ElementCompiler 对象对应于一个 ComponentClass，可以用来编译该组件中的所有 HTML 标签，并递归地调用 ANodeCompiler 来编译标签内容。
 */
export class ElementCompiler {
    /**
     * @param aNodeCompiler 编译 aNode 的对象，编译标签内容时用
     * @param id 抗冲突变量名产生器
     */
    constructor (
        private aNodeCompiler: ANodeCompiler,
        private id: IDGenerator
    ) {}

    /**
     * 编译元素标签头
     */
    * tagStart (
        aNode: AElement,
        componentInfo: ComponentInfo,
        dynamicTagName?: string,
        beforeEnd?: (aNode: AElement, propsAssign: any) => Generator<Statement, void, unknown>
    ) {
        const props = aNode.props
        const bindDirective = aNode.directives.bind
        const tagName = aNode.tagName!

        // element start '<'
        if (dynamicTagName) {
            yield createHTMLLiteralAppend('<')
            yield createHTMLExpressionAppend(I(dynamicTagName))
        } else if (tagName) {
            yield createHTMLLiteralAppend('<' + tagName)
        } else {
            yield createHTMLLiteralAppend('<')
            yield createHTMLExpressionAppend(I('tagName'))
        }

        // element properties
        const propsIndex = {}
        for (const prop of props) propsIndex[prop.name] = prop
        const propsAssign = {}
        if (componentInfo.inheritAttrs) {
            for (const prop of props) {
                yield * this.compileProperty(tagName, prop, propsIndex, propsAssign)
            }
        }
        if (bindDirective) yield * this.compileBindProperties(tagName, bindDirective)

        if (beforeEnd) yield * beforeEnd(aNode, propsAssign)

        // element end '>'
        yield createHTMLLiteralAppend('>')
    }

    private * compileProperty (
        tagName: string, prop: AProperty, propsIndex: { [key: string]: AProperty }, propsAssign: any) {
        if (prop.name === 'slot') return
        if (prop.name === 'value') {
            if (tagName === 'textarea') return
            if (tagName === 'select') {
                yield DEF('selectValue', sanExpr(prop.expr))
                yield createDefaultValue(I('selectValue'), L(''))
                return
            }
            if (tagName === 'option') {
                yield DEF('optionValue', sanExpr(prop.expr))
                yield createIfNotNull(I('optionValue'), [
                    createHTMLLiteralAppend(' value="'),
                    createHTMLExpressionAppend(I('optionValue')),
                    createHTMLLiteralAppend('"')
                ])
                yield createIfStrictEqual(I('optionValue'), I('selectValue'), [
                    createHTMLLiteralAppend(' selected')
                ])
                return
            }
        }

        if (prop.name === 'readonly' || prop.name === 'disabled' || prop.name === 'multiple') {
            if (this.isLiteral(prop.expr)) {
                if (_.boolAttrFilter(prop.name, prop.expr.value)) {
                    yield createHTMLLiteralAppend(` ${prop.name}`)
                }
            } else {
                yield createHTMLExpressionAppend(new HelperCall('boolAttrFilter', [L(prop.name), sanExpr(prop.expr)]))
            }
            return
        }

        const valueProp = propsIndex.value
        const inputType = propsIndex.type
        if (prop.name === 'checked' && tagName === 'input' && valueProp && inputType) {
            assert(isExprWithValue(inputType.expr))
            switch (inputType.expr.value) {
            case 'checkbox':
                yield new If(
                    new ArrayIncludes(sanExpr(prop.expr), sanExpr(valueProp.expr)),
                    [createHTMLLiteralAppend(' checked')]
                )
                return
            case 'radio':
                yield createIfStrictEqual(sanExpr(prop.expr), sanExpr(valueProp.expr), [
                    createHTMLLiteralAppend(' checked')
                ])
                return
            }
        }
        if (this.isLiteral(prop.expr)) {
            propsAssign[prop.name] = 1
            yield createHTMLLiteralAppend(_.attrFilter(prop.name, prop.expr.value, true))
        } else {
            yield createHTMLExpressionAppend(
                new HelperCall('attrFilter', [L(prop.name), sanExpr(prop.expr, OutputType.ESCAPE), L(false)])
            )
        }
    }

    private isLiteral (expr: Expr): expr is BoolLiteral | StringLiteral | NumberLiteral {
        return isExprBoolNode(expr) || isExprStringNode(expr) || isExprNumberNode(expr)
    }

    private * compileBindProperties (tagName: string, bindDirective: ADirectiveBind) {
        const bindProps = this.id.next('bindProps')
        yield DEF(bindProps, BINARY(sanExpr(bindDirective.value), '||', new MapLiteral([])))

        const key = I('key')
        const value = I('value')
        const iterable = I(bindProps)
        yield new Foreach(key, value, iterable, [
            new If(new ArrayIncludes(L(BOOL_ATTRIBUTES), key), [
                createHTMLExpressionAppend(new HelperCall('boolAttrFilter', [key, value]))
            ]),
            new Else([
                createHTMLExpressionAppend(new HelperCall('attrFilter', [key, value, L(true)]))
            ])
        ])
    }

    /**
     * 编译元素闭合
     */
    * tagEnd (aNode: AElement, dynamicTagName?: string) {
        const tagName = aNode.tagName

        if (dynamicTagName) {
            yield createHTMLLiteralAppend('</')
            yield createHTMLExpressionAppend(I(dynamicTagName))
            yield createHTMLLiteralAppend('>')
        } else if (tagName) {
            if (!autoCloseTags.has(tagName)) {
                yield createHTMLLiteralAppend('</' + tagName + '>')
            }
            if (tagName === 'select') {
                yield ASSIGN(I('selectValue'), NULL)
            }
            if (tagName === 'option') {
                yield ASSIGN(I('optionValue'), NULL)
            }
        } else {
            yield createHTMLLiteralAppend('</')
            yield createHTMLExpressionAppend(I('tagName'))
            yield createHTMLLiteralAppend('>')
        }
    }

    /**
     * 编译元素内容
     */
    * inner (aNode: AElement) {
        // inner content
        if (aNode.tagName === 'textarea') {
            const valueProp = getANodePropByName(aNode, 'value')
            if (valueProp) yield createHTMLExpressionAppend(sanExpr(valueProp.expr, OutputType.ESCAPE_HTML))
            return
        }

        const htmlDirective = aNode.directives.html
        if (htmlDirective) {
            yield createHTMLExpressionAppend(sanExpr(htmlDirective.value, OutputType.HTML))
            return
        }
        // 只有 ATextNode 没有 children 属性，它的编译走了 ANodeCompiler#compileText()，不会进入这里
        for (const aNodeChild of aNode.children!) yield * this.aNodeCompiler.compile(aNodeChild, false)
    }
}
