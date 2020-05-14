const { Component } = require('san')

class Grid extends Component {
    inited () {
        const $parent = this.parentComponent
        if ($parent.isRow) {
            const padding = $parent.data.get('gutter')
            this.data.set(
                'cls',
                `padding-${padding}`
            )
        }
    }
}
Grid.template = '<span class="grid {{cls}}">{{content}}</span>'

class Row extends Component {
    inited () {
        this.isRow = true
        this.data.set('gutter', 4)
    }
}
Row.template = '<div class="row"><slot/></div>'

class App extends Component {}
App.components = { 'row': Row, 'grid': Grid }
App.template = '<div><row><grid content="CONTENT"/></row></div>'

exports = module.exports = App
