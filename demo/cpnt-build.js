const { SanProject } = require('san-ssr')
const { writeFileSync } = require('fs')
const componentClass = require('./src/index.ts')

const project = new SanProject()
const targetCode = project.compile(
    componentClass,
    'js',
    { nsPrefix: 'demo\\' }
)

writeFileSync('./dist/ssr.js', targetCode)
