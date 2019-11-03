#!/usr/bin/env node

const fs = require('fs')
const { join, resolve } = require('path')
const testRoot = resolve(__dirname, '../test')
const { tsCode2js } = require('../dist/target-js/compilers/ts2js')
const tsConfig = require('../test/tsconfig.json')
const { supportE2E } = require('../dist/utils/case')

let html = ''
let specTpls = ''

// generate html
function genContent ({ componentSource, componentDataLiteral, specTpl, dirName, result }) {
    const id = dirName
    const noDataOutput = /-ndo$/.test(dirName)

    // if no inject mark, add it
    if (!/\/\/\s*\[inject\]/.test(specTpl)) {
        specTpl = specTpl.replace(/function\s*\([a-z0-9_,$\s]*\)\s*\{/, function ($0) {
            return $0 + '\n// [inject] init'
        })
    }

    html += `<div id="${id}">${result}</div>\n\n`

    let preCode = `
        ${componentSource}
        var wrap = document.getElementById('${id}');
        var myComponent = new MyComponent({
            el: wrap.firstChild
    `

    if (noDataOutput) {
        preCode += ',data:' + componentDataLiteral
    }
    preCode += '        });'
    specTpl = specTpl.replace(/\/\/\s*\[inject\]\s* init/, preCode)
    specTpls += specTpl
};

function buildFile (caseDir) {
    const files = fs.readdirSync(caseDir)
    let componentSource
    let specTpl
    let componentDataLiteral
    let result
    let sourceFile = ''

    if (!files.length) {
        return
    }

    files.forEach(filename => {
        // absolute path
        const abFilePath = join(caseDir, filename)
        const stats = fs.statSync(abFilePath)
        const isFile = stats.isFile()
        const isDir = stats.isDirectory()

        // if it's a file, init data
        if (isFile) {
            switch (filename) {
            case 'component.ts':
                componentSource = tsCode2js(
                    fs.readFileSync(abFilePath, 'UTF-8'),
                    tsConfig.compilerOptions
                )
                    .replace(/(\S+)\s*=\s*require\("san"\)/, '$1 = san')
                    .split('\n')
                    .filter(x => !/exports.default/.test(x))
                    .filter(x => !/__esModule/.test(x))
                    .join('\n')
                sourceFile = filename
                break

            case 'component.js':
                componentSource = fs.readFileSync(abFilePath, 'UTF-8')
                    .split('\n')
                    .map(line => {
                        if (/(\.|\s)exports\s*=/.test(line) ||
                                /san\s*=\s*require\(/.test(line)
                        ) {
                            return ''
                        }

                        return line
                    })
                    .join('\n')
                sourceFile = filename
                break

            case 'spec.js':
                specTpl = fs.readFileSync(abFilePath, 'UTF-8')
                break

            case 'data.js':
                componentDataLiteral = fs.readFileSync(abFilePath, 'UTF-8')
                componentDataLiteral = componentDataLiteral
                    .slice(componentDataLiteral.indexOf('{'))
                    .replace(/;\s*$/, '')
                break

            case 'data.json':
                componentDataLiteral = fs.readFileSync(abFilePath, 'UTF-8')
                break

            case 'result.html':
                result = fs.readFileSync(abFilePath, 'UTF-8').replace('\n', '')
                break
            }
        }

        // iterate
        if (isDir && supportE2E(filename)) {
            console.log(`[Build SSR spec] ${filename}`)
            buildFile(abFilePath)
        }
    })

    const match = caseDir.match(/[/\\]([a-zA-Z0-9_,$-]*)$/)
    // dirName is the identity of each component
    const dirName = match[1]
    // generate html when it has source file
    if (sourceFile) {
        genContent({
            componentSource,
            componentDataLiteral,
            specTpl,
            dirName,
            result
        })
    }
};

function writeIn ({ html, specTpls }) {
    const karmaHtml = fs.readFileSync(join(testRoot, 'karma-context.html.tpl'), 'UTF-8')
    fs.writeFileSync(
        join(testRoot, 'karma-context.html'),
        karmaHtml.replace('##ssr-elements##', html),
        'UTF-8'
    )

    fs.writeFileSync(
        join(testRoot, 'e2e.spec.js'),
        specTpls,
        'UTF-8'
    )
};

console.log()
console.log('----- Build SSR Specs -----')

buildFile(resolve(testRoot, 'cases'))
// write into file
writeIn({ html, specTpls })

console.log()
