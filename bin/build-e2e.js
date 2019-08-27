#!/usr/bin/env node

const fs = require('fs')
const { join, resolve } = require('path')
const testRoot = resolve(__dirname, '../test')

let html = ''
let specTpls = ''

// generate html
function genContent ({ componentClass, componentSource, compontentData, componentDataLiteral, specTpl, dirName, result }) {
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
    let componentClass
    let componentSource
    let specTpl
    let compontentData
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
            case 'component.js':
                componentClass = require(abFilePath)
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

            case 'data.json':
                compontentData = require(abFilePath)
                componentDataLiteral = fs.readFileSync(abFilePath, 'UTF-8')
                break

            case 'result.html':
                result = fs.readFileSync(abFilePath, 'UTF-8').replace('\n', '')
                break
            }
        }

        // iterate
        if (isDir) {
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
            componentClass,
            componentSource,
            compontentData,
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
