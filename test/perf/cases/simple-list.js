const common = require('../utils/common')

const bench = common.createBenchmark(main, {
    type: ['san', 'artTpl', 'swig', 'eptl', 'ejs', 'handlebars', 'mustache'],
    n: [1e2]
})
const san = require('san')
const { compileToRenderer } = require('../../../dist/index')
const swig = require('swig-templates')
const art = require('art-template')
const etpl = require('etpl')
const ejs = require('ejs')
const mustache = require('mustache')
const handlebars = require('handlebars')

const App = san.defineComponent({
    template: '<div id=\'app\'><ul><li s-for=\'item in items\'>{{item}}</li></ul></div>'
})

const Item = san.defineComponent({
    template: '<li>{{item}}</li>'
})
const App2 = san.defineComponent({
    components: {
        'x-item': Item
    },
    template: '<div id=\'app\'><ul><x-item s-for=\'item in items\' item="{{item}}"/></ul></div>'
})

const data = { items: [] }
for (let i = 0; i < 10000; i++) {
    data.items.push(i)
}

const renderer = compileToRenderer(App)
const renderer2 = compileToRenderer(App2)
const swigRenderer = swig.compile('<div id=\'app\'><ul>{% for item in items %}<li>{{item}}</li>{% endfor %}</ul></div>')
const artRenderer = art.compile(
    '<div id=\'app\'><ul><% for(let i = 0; i < items.length; i++){ %><li><%= items[i] %></li><% } %></ul></div>'
)
const etplRenderer = etpl.compile(
    '<div id=\'app\'><ul><!-- for: ${items} as ${item} --><li>${item}</li><!-- /for --></ul></div>'
)
const ejsRenderer = ejs.compile(
    '<div id=\'app\'><ul>{<% for(let i = 0; i < items.length; i++){ %><li><%= items[i] %></li><% } %></ul></div>'
)
const handlebarsRenderer = handlebars.compile('<div id=\'app\'><ul>{{#items}}<li>{{.}}</li>{{/items}}</ul></div>')

function main ({ type, n }) {
    switch (type) {
    case 'san':
        console.log('----- Simple List SSR Perf (10000 items x 100 times) -----')
        bench.start()
        for (let i = 0; i < n; i++) {
            renderer(data, true)
        }
        bench.end(n)
        break

    case 'san(item as component)':
        bench.start()
        for (let i = 0; i < n; i++) {
            renderer2(data, true)
        }
        bench.end(n)
        break

    case 'swig':
        bench.start()
        for (let i = 0; i < n; i++) {
            swigRenderer(data)
        }
        bench.end(n)
        break

    case 'artTpl':
        bench.start()
        for (let i = 0; i < n; i++) {
            artRenderer(data)
        }
        bench.end(n)
        break

    case 'etpl':
        bench.start()
        for (let i = 0; i < n; i++) {
            etplRenderer(data)
        }
        bench.end(n)
        break

    case 'ejs':
        bench.start()
        for (let i = 0; i < n; i++) {
            ejsRenderer(data)
        }
        bench.end(n)
        break

    case 'handlebars':
        bench.start()
        for (let i = 0; i < n; i++) {
            handlebarsRenderer(data)
        }
        bench.end(n)
        break

    case 'mustache':
        bench.start()
        for (let i = 0; i < n; i++) {
            mustache.render('<div id=\'app\'><ul>{{#items}}<li>{{.}}</li>{{/items}}</ul></div>', data)
        }
        bench.end(n)
        break
    }
}
