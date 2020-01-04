import { compileExprSource } from './expr-compiler'
import { ElementCompiler } from './element-compiler'
import { stringifier } from './stringifier'
import { SanComponent, isComponentLoader } from '../../models/component'
import { ANode } from '../../models/anode'
import { getANodeProps, getANodePropByName } from '../../utils/anode'

/**
* ANode 的编译方法集合对象
*/
export class ANodeCompiler {
    private elementSourceCompiler: ElementCompiler
    private ssrIndex = 0
    private component: SanComponent

    constructor (elemencompiler: ElementCompiler, component: SanComponent) {
        this.component = component
        this.elementSourceCompiler = elemencompiler
    }
    /**
     * 编译节点
     *
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     * @param {Object} extra 编译所需的一些额外信息
     */
    compile (aNode: ANode, sourceBuffer, extra = {}) {
        let compileMethod = 'compileElement'

        if (aNode.textExpr) {
            compileMethod = 'compileText'
        } else if (aNode.directives['if']) { // eslint-disable-line dot-notation
            compileMethod = 'compileIf'
        } else if (aNode.directives['for']) { // eslint-disable-line dot-notation
            compileMethod = 'compileFor'
        } else if (aNode.tagName === 'slot') {
            compileMethod = 'compileSlot'
        } else if (aNode.tagName === 'template') {
            compileMethod = 'compileTemplate'
        } else {
            const ComponentType = this.component.getComponentType
                ? this.component.getComponentType(aNode)
                : this.component.components[aNode.tagName]

            if (ComponentType) {
                compileMethod = 'compileComponent'
                extra['ComponentClass'] = ComponentType

                if (isComponentLoader(ComponentType)) {
                    compileMethod = 'compileComponentLoader'
                }
            }
        }
        this[compileMethod](aNode, sourceBuffer, extra)
    }

    /**
     * 编译文本节点
     *
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     */
    compileText (aNode: ANode, sourceBuffer) {
        if (aNode.textExpr.original) {
            sourceBuffer.addRaw('if (!noDataOutput) {')
            sourceBuffer.joinString('<!--s-text-->')
            sourceBuffer.addRaw('}')
        }

        if (aNode.textExpr.value != null) {
            sourceBuffer.joinString(aNode.textExpr.segs[0].literal)
        } else {
            sourceBuffer.joinExpr(aNode.textExpr)
        }

        if (aNode.textExpr.original) {
            sourceBuffer.addRaw('if (!noDataOutput) {')
            sourceBuffer.joinString('<!--/s-text-->')
            sourceBuffer.addRaw('}')
        }
    }

    /**
     * 编译template节点
     *
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     */
    compileTemplate (aNode: ANode, sourceBuffer) {
        this.elementSourceCompiler.inner(sourceBuffer, aNode)
    }

    /**
     * 编译 if 节点
     *
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     */
    compileIf (aNode: ANode, sourceBuffer) {
        // output main if
        const ifDirective = aNode.directives['if'] // eslint-disable-line dot-notation
        sourceBuffer.addRaw('if (' + compileExprSource.expr(ifDirective.value) + ') {')
        sourceBuffer.addRaw(this.compile(aNode.ifRinsed, sourceBuffer))
        sourceBuffer.addRaw('}')

        // output elif and else
        for (const elseANode of aNode.elses || []) {
            const elifDirective = elseANode.directives.elif
            if (elifDirective) {
                sourceBuffer.addRaw('else if (' + compileExprSource.expr(elifDirective.value) + ') {')
            } else {
                sourceBuffer.addRaw('else {')
            }

            sourceBuffer.addRaw(this.compile(elseANode, sourceBuffer))
            sourceBuffer.addRaw('}')
        }
    }

    /**
     * 编译 for 节点
     *
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     */
    compileFor (aNode: ANode, sourceBuffer) {
        const forElementANode = {
            children: aNode.children,
            props: aNode.props,
            events: aNode.events,
            tagName: aNode.tagName,
            directives: { ...aNode.directives },
            hotspot: aNode.hotspot
        }
        forElementANode.directives['for'] = null

        const forDirective = aNode.directives['for'] // eslint-disable-line dot-notation
        const itemName = forDirective.item
        const indexName = forDirective.index || this.nextID()
        const listName = this.nextID()

        sourceBuffer.addRaw('var ' + listName + ' = ' + compileExprSource.expr(forDirective.value) + ';')
        sourceBuffer.addRaw('if (' + listName + ' instanceof Array) {')

        // for array
        sourceBuffer.addRaw('for (' +
        'var ' + indexName + ' = 0; ' +
        indexName + ' < ' + listName + '.length; ' +
        indexName + '++) {'
        )
        sourceBuffer.addRaw('componentCtx.data.' + indexName + '=' + indexName + ';')
        sourceBuffer.addRaw('componentCtx.data.' + itemName + '= ' + listName + '[' + indexName + '];')
        sourceBuffer.addRaw(this.compile(forElementANode, sourceBuffer))
        sourceBuffer.addRaw('}')

        sourceBuffer.addRaw('} else if (typeof ' + listName + ' === "object") {')

        // for object
        sourceBuffer.addRaw('for (var ' + indexName + ' in ' + listName + ') {')
        sourceBuffer.addRaw('if (' + listName + '[' + indexName + '] != null) {')
        sourceBuffer.addRaw('componentCtx.data.' + indexName + '=' + indexName + ';')
        sourceBuffer.addRaw('componentCtx.data.' + itemName + '= ' + listName + '[' + indexName + '];')
        sourceBuffer.addRaw(this.compile(forElementANode, sourceBuffer))
        sourceBuffer.addRaw('}')
        sourceBuffer.addRaw('}')

        sourceBuffer.addRaw('}')
    }

    /**
     * 编译 slot 节点
     *
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     */
    compileSlot (aNode: ANode, sourceBuffer) {
        const rendererId = this.nextID()

        sourceBuffer.addRaw('componentCtx.slotRenderers.' + rendererId +
        ' = componentCtx.slotRenderers.' + rendererId + ' || function () {')

        sourceBuffer.addRaw('function $defaultSlotRender(componentCtx) {')
        sourceBuffer.addRaw('  var html = "";')
        for (const aNodeChild of aNode.children) {
            sourceBuffer.addRaw(this.compile(aNodeChild, sourceBuffer))
        }
        sourceBuffer.addRaw('  return html;')
        sourceBuffer.addRaw('}')

        sourceBuffer.addRaw('var $isInserted = false;')
        sourceBuffer.addRaw('var $ctxSourceSlots = componentCtx.sourceSlots;')
        sourceBuffer.addRaw('var $mySourceSlots = [];')

        const nameProp = getANodePropByName(aNode, 'name')
        if (nameProp) {
            sourceBuffer.addRaw('var $slotName = ' + compileExprSource.expr(nameProp.expr) + ';')

            sourceBuffer.addRaw('for (var $i = 0; $i < $ctxSourceSlots.length; $i++) {')
            sourceBuffer.addRaw('  if ($ctxSourceSlots[$i][1] == $slotName) {')
            sourceBuffer.addRaw('    $mySourceSlots.push($ctxSourceSlots[$i][0]);')
            sourceBuffer.addRaw('    $isInserted = true;')
            sourceBuffer.addRaw('  }')
            sourceBuffer.addRaw('}')
        } else {
            sourceBuffer.addRaw('if ($ctxSourceSlots[0] && $ctxSourceSlots[0][1] == null) {')
            sourceBuffer.addRaw('  $mySourceSlots.push($ctxSourceSlots[0][0]);')
            sourceBuffer.addRaw('  $isInserted = true;')
            sourceBuffer.addRaw('}')
        }

        sourceBuffer.addRaw('if (!$isInserted) { $mySourceSlots.push($defaultSlotRender); }')
        sourceBuffer.addRaw('var $slotCtx = $isInserted ? componentCtx.owner : componentCtx;')

        if (aNode.vars || aNode.directives.bind) {
            sourceBuffer.addRaw('$slotCtx = {data: _.extend({}, $slotCtx.data), instance: $slotCtx.instance, owner: $slotCtx.owner};')

            if (aNode.directives.bind) {
                sourceBuffer.addRaw('_.extend($slotCtx.data, ' + compileExprSource.expr(aNode.directives.bind.value) + ');')
            }

            for (const varItem of aNode.vars) {
                sourceBuffer.addRaw(
                    '$slotCtx.data["' + varItem.name + '"] = ' +
                    compileExprSource.expr(varItem.expr) +
                    ';'
                )
            }
        }

        sourceBuffer.addRaw('for (var $renderIndex = 0; $renderIndex < $mySourceSlots.length; $renderIndex++) {')
        sourceBuffer.addRaw('  html += $mySourceSlots[$renderIndex]($slotCtx);')
        sourceBuffer.addRaw('}')

        sourceBuffer.addRaw('};')
        sourceBuffer.addRaw('componentCtx.slotRenderers.' + rendererId + '();')
    }

    /**
     * 编译普通节点
     *
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     * @param {Object} extra 编译所需的一些额外信息
     */
    compileElement (aNode: ANode, sourceBuffer) {
        this.elementSourceCompiler.tagStart(sourceBuffer, aNode)
        this.elementSourceCompiler.inner(sourceBuffer, aNode)
        this.elementSourceCompiler.tagEnd(sourceBuffer, aNode)
    }

    /**
     * 编译组件节点
     *
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     * @param {Object} extra 编译所需的一些额外信息
     * @param {Function} extra.ComponentClass 对应组件类
     */
    compileComponent (aNode: ANode, sourceBuffer, extra) {
        let dataLiteral = '{}'

        sourceBuffer.addRaw('var $sourceSlots = [];')
        if (aNode.children) {
            const defaultSourceSlots = []
            const sourceSlotCodes = {}

            for (const child of aNode.children) {
                const slotBind = !child.textExpr && getANodePropByName(child, 'slot')
                if (slotBind) {
                    if (!sourceSlotCodes[slotBind.raw]) {
                        sourceSlotCodes[slotBind.raw] = {
                            children: [],
                            prop: slotBind
                        }
                    }

                    sourceSlotCodes[slotBind.raw].children.push(child)
                } else {
                    defaultSourceSlots.push(child)
                }
            }

            if (defaultSourceSlots.length) {
                sourceBuffer.addRaw('$sourceSlots.push([function (componentCtx) {')
                sourceBuffer.addRaw('  var html = "";')
                defaultSourceSlots.forEach(child => this.compile(child, sourceBuffer))
                sourceBuffer.addRaw('  return html;')
                sourceBuffer.addRaw('}]);')
            }

            for (const key in sourceSlotCodes) {
                const sourceSlotCode = sourceSlotCodes[key]
                sourceBuffer.addRaw('$sourceSlots.push([function (componentCtx) {')
                sourceBuffer.addRaw('  var html = "";')
                sourceBuffer.addRaw(sourceSlotCode.children.forEach((child) => {
                    this.compile(child, sourceBuffer)
                }))
                sourceBuffer.addRaw('  return html;')
                sourceBuffer.addRaw('}, ' + compileExprSource.expr(sourceSlotCode.prop.expr) + ']);')
            }
        }

        const givenData = []
        for (const prop of getANodeProps(aNode)) {
            givenData.push(
                compileExprSource.stringLiteralize(prop.name) +
                ':' +
                compileExprSource.expr(prop.expr)
            )
        }

        dataLiteral = '{' + givenData.join(',\n') + '}'
        if (aNode.directives.bind) {
            dataLiteral = '_.extend(' +
            compileExprSource.expr(aNode.directives.bind.value) +
            ', ' +
            dataLiteral +
            ')'
        }

        const funcName = 'sanssrRenderer' + extra.ComponentClass.sanssrCid
        sourceBuffer.addRaw(`html += ${funcName}(sanssrRuntime, `)
        sourceBuffer.addRaw(dataLiteral + ', true, componentCtx, ' +
        stringifier.str(aNode.tagName) + ', $sourceSlots);')
        sourceBuffer.addRaw('$sourceSlots = null;')
    }

    /**
     * 编译组件加载器节点
     *
     * @param {CompileSourceBuffer} sourceBuffer 编译源码的中间buffer
     * @param {Object} extra 编译所需的一些额外信息
     * @param {Function} extra.ComponentClass 对应类
     */
    compileComponentLoader (aNode: ANode, sourceBuffer, extra) {
        const LoadingComponent = extra.ComponentClass.placeholder
        if (typeof LoadingComponent === 'function') {
            this.compileComponent(aNode, sourceBuffer, {
                ComponentClass: LoadingComponent
            })
        }
    }

    private nextID () {
        return 'sanssrId' + (this.ssrIndex++)
    }
}
