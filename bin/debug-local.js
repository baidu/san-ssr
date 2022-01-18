const { SanProject } = require('../dist/index')
const fs = require('fs')
const path = require('path')

function compile (componentPath, externalPath, outputPath) {
    // offline
    const MyComponent = require(componentPath)
    const sanProject = new SanProject()
    const res = sanProject.compileToSource(MyComponent, 'js')

    fs.writeFileSync(path.resolve(__dirname, outputPath), res)
}

compile('./sample/component', './component2', './dist/component.js')
// compile('./component2', './component', './dist/component2')

// // online
// const Component = require('./component')
const render = require('./dist/component')

const html = render({})
// const html = render({}, { ComponentClass: Component })

console.log(html)
