/// <reference path="./remove-modules.d.ts"/>
import foo from 'foo'
import bar from 'bar'
import { Component } from 'san'

export default class RemoveModulesComp extends Component {
    public static template = '<div>Remove foo</div>'
    mounted () {
        foo()
        bar()
    }
}
