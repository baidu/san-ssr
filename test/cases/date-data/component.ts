import { Component } from 'san'

// date data
export default class MyComponent extends Component {
    public static filters = {
        year: function (date: Date) {
            return date.getFullYear()
        }
    }
    public static template = '<div><b title="{{date|year}}">{{date|year}}</b></div>'
}
