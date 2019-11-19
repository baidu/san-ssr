const { SanProject } = require('san-ssr')
const { writeFileSync } = require('fs')

const project = new SanProject()
const targetCode = project.compile(
    './src/index.ts',
    'js',
    { nsPrefix: 'demo\\' }
)

writeFileSync('./dist/ssr.js', targetCode)
