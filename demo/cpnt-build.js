const { SanProject } = require('san-ssr')
const { writeFileSync } = require('fs')
const componentClass = require('./src/index.ts').default

const project = new SanProject()
const targetCode = project.compile(componentClass)

writeFileSync('./dist/ssr.js', targetCode)
