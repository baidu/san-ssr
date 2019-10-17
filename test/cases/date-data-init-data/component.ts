import { Component } from 'san'
import { FilterDeclarations } from '../../..'

// date init data
export default class MyComponent extends Component {
    public static filters: FilterDeclarations = {
        year: function (date: Date) {
            return date.getFullYear()
        }
    }
    public static template = '<div><b title="{{date|year}}">{{date|year}}</b></div>'

    initData () {
        return {
            date: new Date(838366400000)
        }
    }
}
