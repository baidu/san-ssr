import { Component } from 'san'
import { ComputedDeclarations } from '../../..'

export default class MyComponent extends Component {
    computed: ComputedDeclarations = {
        less () {
            return this.data.get('normal') - 1
        },

        normal () {
            return this.data.get('num')
        },

        more () {
            return this.data.get('normal') + 1
        }
    }

    static template = '<div><a>{{less}}</a><u>{{normal}}</u><b>{{more}}</b></div>'
}
