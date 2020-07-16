import { Component } from 'san'

export default class MyComponent extends Component {
    static template = `
    <div>
        <a>Foo</a> <span>bar</span>
    </div>`
    trimWhitespace = 'blank'
}
