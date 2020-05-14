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
Grid.template = '<span class="{{cls}}">{{content}}</span>'

class Row extends Component {
    inited () {
        this.isRow = true
        this.data.set('gutter', 4)
    }
}
Row.components = { 'grid': Grid }
Row.template = '<div><grid content="CONTENT"/></div>'

exports = module.exports = Row
