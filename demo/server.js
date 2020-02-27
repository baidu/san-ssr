const { SanProject } = require('san-ssr')
const project = new SanProject()

const render = project.compileToRenderer(require('./app.js'))
const html = render(require('./data.json'))

process.stdout.write(html)
