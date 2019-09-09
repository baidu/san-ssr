import { Component } from 'san'

export default class extends Component {
    static filters = {
        year: function (date: Date) {
            return date.getFullYear()
        }
    }
    static template = '<div>' +
        '<b title="{{date|year}}">{{date|year}}</b>' +
        '</div>'
}
