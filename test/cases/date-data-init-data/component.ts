import { Component } from 'san'

// date init data
export default class MyComponent extends Component {
    public static filters = {
        year: function (date: Date) {
            return date.getFullYear()
        }
    }
    public static template = '<div><b title="{{date|year}}">{{date|year}}</b></div>'

    initData () {
        return {
            date: new Date('1996-07-26T07:33:20.000Z')
        }
    }
}
