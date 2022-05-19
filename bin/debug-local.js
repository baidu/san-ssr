const { markExternalComponent, SanProject, cancelMarkExternalComponent } = require('../dist/index')
const fs = require('fs')
const path = require('path')

// component to source
// function compile (componentPath, externalPath, outputPath) {
//     markExternalComponent({
//         isExternalComponent (id) {
//             if (id === externalPath) {
//                 return true
//             }
//         }
//     })

//     // offline
//     const MyComponent = require(componentPath)
//     const sanProject = new SanProject()
//     const res = sanProject.compileToSource(MyComponent, 'js', {
//         useProvidedComponentClass: true
//     })

//     cancelMarkExternalComponent()

//     fs.writeFileSync(path.resolve(__dirname, outputPath), res)
// }

// js to source
function compile (componentPath, _, outputPath) {
    const sanProject = new SanProject()
    const res = sanProject.compileToSource(path.resolve(__dirname, componentPath), 'js')
    fs.writeFileSync(path.resolve(__dirname, outputPath), res);
}

compile('./sample/component.js', './component2', './dist/component.js')
compile('./sample/component2.js', './component', './dist/component2.js')

// // online
const Component = require('./sample/component')
const render = require('./dist/component')

// const html = render({})
const html = render({}, { ComponentClass: Component })

console.log(html)
