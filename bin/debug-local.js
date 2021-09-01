const { markExternalComponent, SanProject } = require('../dist/index')
const fs = require('fs')
const path = require('path')

markExternalComponent({
    isExternalComponent (id) {
        if (id === './search-ui') {
            return true
        }
    }
})

// offline
const MyComponent = require('./component')
const sanProject = new SanProject()
const res = sanProject.compileToSource(MyComponent, 'js', {
    useProvidedComponentClass: true
})

fs.writeFileSync(path.resolve(__dirname, './output.js'), res)

// online
const Component = require('./component')
const render = require('./output')

const html = render({}, false, null, 'div', {}, { ComponentClass: Component })

console.log(html)
