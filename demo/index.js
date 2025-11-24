/* eslint-disable max-len */
const { SanProject } = require('..')
const { readFileSync, writeFileSync } = require('fs')
const data = require('./data.json')
const { JSDOM } = require('jsdom')
const assert = require('assert')

const project = new SanProject()

// compile javascript component to renderer
{
    console.log('---- ComponentClass to Renderer ------')
    const render = project.compileToRenderer(require('./render-from-js.js'))
    const html = render(data)
    assert.strictEqual(html, '<div><!--s-data:{"firstName":"John","lastName":"Smith","list":[]}--><h1>John Smith</h1><h3>John Smith - MyComponent-Inited</h3><h4>MyComponent2</h4></div>')
    console.log(html)
}
// compile javascript component to source
{
    console.log('---- .js to Source Code ---')
    writeFileSync('./dist/render-from-js.js', project.compileToSource('./render-from-js.js'))
    const render = require('./dist/render-from-js.js')
    const html = render(data)
    assert.strictEqual(html, '<div><!--s-data:{"firstName":"John","lastName":"Smith","list":[],"name":"John Smith"}--><h1>John Smith</h1><h3>John Smith - MyComponent-Inited</h3><h4>MyComponent2</h4></div>')
    console.log(html)
}
// compile javascript component to source(case2)
// Tips: in this case, your fileContent must strictly follow the writing rules
{
    console.log('---- .js to Source Code(case2) ---')
    writeFileSync('./dist/render-from-js2.js', project.compileToSource({
        filePath: '__virtual.js',
        fileContent: `const { defineComponent } = require('san')

        module.exports = defineComponent({
            computed: {
                name: function () {
                    const f = this.data.get('firstName')
                    const l = this.data.get('lastName')
                    return f + ' ' + l
                }
            },
            template: '<div><h1>{{name}}</h1></div>'
        })
        `
    }))
    const render = require('./dist/render-from-js2.js')
    const html = render(data)
    assert.strictEqual(html, '<div><!--s-data:{"firstName":"John","lastName":"Smith","list":[],"name":"John Smith"}--><h1>John Smith</h1></div>')
    console.log(html)
}
// compile san component file to source
{
    console.log('---- .san to Source Code ---')
    const dom = new JSDOM(readFileSync('./render-from-san.html'))
    writeFileSync('./dist/render-from-san.js', project.compileToSource({
        filePath: './ender-from-san.html',
        templateContent: dom.window.document.querySelector('template').innerHTML.trim(),
        scriptContent: dom.window.document.querySelector('script').textContent
    }))
    const render = require('./dist/render-from-san.js')
    const html = render(data)
    assert.strictEqual(html, '<div><!--s-data:{"firstName":"John","lastName":"Smith","list":[],"name":"John Smith"}--><h1>John Smith</h1></div>')
    console.log(html)
}
// compile typescript component to source
{
    console.log('---- .ts to Source Code ---')
    writeFileSync('./dist/render-from-ts.js', project.compileToSource('./render-from-ts.ts'))
    const render = require('./dist/render-from-ts.js')
    const html = render(data)
    assert.strictEqual(html, '<div><!--s-data:{"firstName":"John","lastName":"Smith","list":[],"name":"John Smith","ssr":{"count":1}}--><h1>John Smith - inited-proxy - inited-set - 2 - 2</h1></div>')
    console.log(html)
}
