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
        if (argv._.length === 0) {
            throw new Error('component file must be provided')
        }
        return true
    })

const target = yargs.argv.target as OptionValue
const options = JSON.parse(yargs.argv.targetOptions as string)
const tsConfigFilePath = yargs.argv.tsconfig as OptionValue
const outputFile = yargs.argv.output as OptionValue
const componentFile = resolve(yargs.argv._[0])
console.error(chalk.gray('compiling'), componentFile, 'to', target)

const project = new SanProject(tsConfigFilePath)
const targetCode = project.compile(componentFile, target, options)

if (outputFile !== undefined) {
    writeFileSync(outputFile, targetCode)
    console.error(chalk.green('success'), `${byteCount(targetCode)} bytes written`)
} else {
    process.stdout.write(targetCode)
    console.error(chalk.green('success'), `${byteCount(targetCode)} bytes in total`)
}
