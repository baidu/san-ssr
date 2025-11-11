import san from 'san'
import { getANodeExprCalls } from '../../../../../src/target-js/compilers/ssr-data/san-utils'

describe('target-js/compilers/ssr-data/san-utils', () => {
    describe('#getANodeExprCalls', () => {
        it('should return empty', () => {
            const result = getANodeExprCalls(null)
            expect(result).toEqual({ calls: [], filterCalls: [] })
        })
        it('should return empty', () => {
            const result = getANodeExprCalls(san.parseTemplate('hello world'))
            expect(result).toEqual({ calls: [], filterCalls: [] })
        })
        it('should return fn calls', () => {
            const result = getANodeExprCalls(san.parseTemplate(`
            <div s-if="isShowFn()" s-for="item in list[listFn()]" attr="{{a ? attr1() : [attr2(1)]}}">
                {{ formatFn(item.name, text1()) | upperFn(text2()) | filter2 }}
                {{text3(text4()) || text5()}}
                {{ text6() + text7() - a[text8() * text9() / text10()] }}
                <span s-if="-if1() ? if2() : if3()" class="{{className}}"></span>
                <span s-elif="1 + elif1()"></span>
                <span s-show="show1() || true"></span>
                <span s-is="is1()"></span>
                <span s-bind="{{{
                    key: bindKeyFn(),
                }}}"></span>

                <!-- not support filter chain expr -->
                <span title="cc|filterchain()()">{{callchain()()}}</span>
                <!-- not support call value expr -->
                {{ callchain2()[val1()] }}
                <div on-click="clickHandler" on-mouse-down="e => mouseDown()">
                    <div on=""></div>
                </div>
                <div>{{[abc]()}}</div>
            </div>`))
            expect(result).toEqual({
                calls: [
                    'isShowFn', 'listFn', 'attr1', 'attr2', 'formatFn',
                    'text1', 'text2', 'text3', 'text4', 'text5',
                    'text6', 'text7', 'text8', 'text9', 'text10',
                    'if1', 'if2', 'if3', 'elif1', 'show1', 'is1', 'bindKeyFn',
                    'callchain', 'callchain2'
                ],
                filterCalls: ['upperFn', 'filter2', '_class']
            })
        })
    })
})
