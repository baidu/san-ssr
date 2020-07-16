const { Component } = require('san')

class MyComponent extends Component {}
MyComponent.trimWhitespace = 'blank'
MyComponent.template = `
    <div>
        <a>Foo</a> <span>bar</span>
    </div>
`

module.exports = exports = MyComponent
