const fs = require('fs')
const path = require('path')
const { compileToRenderer } = require('../../dist/index')
const TTIComponent = require('./tti-component')

const componentCode = fs.readFileSync(path.resolve(__dirname, 'tti-component.js'), 'UTF-8')
    .replace('const san', '//')
    .replace('exports ', '//')
const htmlTpl = fs.readFileSync(path.resolve(__dirname, 'tti.tpl.html'), 'UTF-8')

const renderer = compileToRenderer(TTIComponent)
const items = []
for (let i = 0; i < 1000; i++) {
    items.push(i)
}
const data = { items }

const html = htmlTpl
    .replace('// cmpt', componentCode)
    .replace('<!--html-->', renderer(data))

fs.writeFileSync(path.resolve(__dirname, 'tti.html'), html, 'UTF-8')
