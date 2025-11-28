#!/usr/bin/env node

import chalk from 'chalk'
import { SanProject } from '../models/san-project'
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import * as yargs from 'yargs'
import { byteCount } from '../utils/buffer'

type OptionValue = string | undefined

yargs
    .usage('$0 -o <OUT_FILE> [OPTION]... <FILE>')
    .option('output', {
        alias: 'o',
        type: 'string',
        description: 'output file path, output to STDOUT if not specified'
    })
    .option('helpers', {
        description: 'emit source code for helpers'
    })
    .option('target', {
        alias: 't',
        default: 'js',
        type: 'string',
        description: 'target SSR file format'
    })
    .option('targetOptions', {
        alias: 'j',
        type: 'string',
        default: '{}',
        description: 'JSON format options to target code generation'
    })
    .option('tsconfig', {
        alias: 'c',
        type: 'string',
        description: 'tsconfig path, will auto resolve if not specified'
    })
    .check(argv => {
        if (argv._.length === 0 && !argv.helpers) {
            throw new Error('component file must be provided')
        }
        return true
    })

const target = yargs.argv.target as string
const options = JSON.parse(yargs.argv.targetOptions as string)
const tsConfigFilePath = yargs.argv.tsconfig as OptionValue
const outputFile = yargs.argv.output as OptionValue
const helpers = yargs.argv.helpers as string

const project = new SanProject(tsConfigFilePath)

if (helpers) {
    const helpers = project.emitHelpers(target, options)
    output(helpers)
    process.exit(0)
}

const componentFile = resolve(String(yargs.argv._[0]))
const targetCode = project.compile(componentFile, target, options)
output(targetCode)

function output (content: string) {
    console.error(chalk.gray('emitting'), 'to', outputFile || 'STDOUT')
    if (outputFile !== undefined) {
        writeFileSync(outputFile, content)
        console.error(chalk.green('success'), `${byteCount(content)} bytes written`)
    } else {
        process.stdout.write(content)
        console.error(chalk.green('success'), `${byteCount(content)} bytes in total`)
    }
}
