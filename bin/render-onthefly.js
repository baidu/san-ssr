#!/usr/bin/env node

require('source-map-support/register')
const { renderOnthefly, ls } = require('../dist/fixtures/case')
const { join } = require('path')
const fs = require('fs')

function renderOnTheFly (caseName) {
    const caseItem = ls().find(item => item.caseName === caseName)
    const caseRoot = caseItem.caseRoot

    const ssrSpecPath = join(caseRoot, `${caseName}/ssr-spec.js`)
    let ssrSpec
    if (fs.existsSync(ssrSpecPath)) {
        ssrSpec = require(ssrSpecPath)
    }

    const html = renderOnthefly(caseName, caseRoot, ssrSpec.info || {})
    return html
}

module.exports = {
    renderOnTheFly
}
