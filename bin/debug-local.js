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

const { MyComponent } = require('./component')

const sanProject = new SanProject()
const res = sanProject.compileToSource(MyComponent)

console.log(res)

fs.writeFileSync(path.resolve(__dirname, './output.js'), res)

// const render = require('./output')

// const res = render({})

// console.log(res)
