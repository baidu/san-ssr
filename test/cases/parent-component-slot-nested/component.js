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

class Table extends Component {}
Table.components = { 'row': Row, 'grid': Grid }
Table.template = '<div class="table"><row><slot/></row></div>'

class App extends Component {}
App.components = { 'i-table': Table, 'grid': Grid }
App.template = '<div><i-table><grid content="CONTENT"/></i-table></div>'

exports = module.exports = App
