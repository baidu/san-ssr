#!/usr/bin/env node

require('source-map-support/register')
const { renderOnthefly, ls } = require('../dist/fixtures/case')

function renderOnTheFly (caseName) {
    const caseItem = ls().find(item => item.caseName === caseName)
    const caseRoot = caseItem.caseRoot

    const html = renderOnthefly(caseName, caseRoot)
    return html
}

module.exports = {
    renderOnTheFly
}
