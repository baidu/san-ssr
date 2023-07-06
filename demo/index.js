const { SanProject } = require('..')
const { readFileSync, writeFileSync } = require('fs')
const data = require('./data.json')
const { JSDOM } = require('jsdom')

const project = new SanProject()
let render = null

// compile component.js to renderer
console.log('---- ComponentClass to Renderer ------')
render = project.compileToRenderer(require('./component.js'))
console.log(render(data))

// compile component.js to source
console.log('---- .js to Source Code ---')
writeFileSync('./dist/render-from-js.js', project.compileToSource('./component.js'))
render = require('./dist/render-from-js.js')
console.log(render(data))

// compile component.js to source(case2)
// Tips: in this case, your fileContent must strictly follow the writing rules
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
render = require('./dist/render-from-js2.js')
console.log(render(data))

// compile component.san.html to source
console.log('---- .san to Source Code ---')
const dom = new JSDOM(readFileSync('./component.san.html'))
writeFileSync('./dist/render-from-san.js', project.compileToSource({
    filePath: './component.san.html',
    templateContent: dom.window.document.querySelector('template').innerHTML.trim(),
    scriptContent: dom.window.document.querySelector('script').textContent
}))
render = require('./dist/render-from-san.js')
console.log(render(data))

// compile component.ts to source
console.log('---- .ts to Source Code ---')
writeFileSync('./dist/render-from-ts.js', project.compileToSource('./component.ts'))
render = require('./dist/render-from-ts.js')
console.log(render(data))
