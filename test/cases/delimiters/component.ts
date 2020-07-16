import { Component } from 'san'

export default class MyComponent extends Component {
    static template = `<div>[[ title ]]</div>`
    delimiters = ['[[', ']]']
}
