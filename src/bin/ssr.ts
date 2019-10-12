#!/usr/bin/env node

import chalk from 'chalk'
import { ToPHPCompiler } from '../compilers/to-php-compiler'
import { ToJSCompiler } from '../compilers/to-js-compiler'
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import * as yargs from 'yargs'
import { byteCount } from '../utils/buffer'

type OptionValue = string | undefined

yargs
    .usage('$0 -o <OUT_FILE> [OPTION]... <FILE>')
    .option('output', {
        alias: 'o',
        description: 'output file path, output to STDOUT if not specified'
    })
    .option('target', {
        alias: 't',
        required: true,
        choices: ['php', 'js'],
        description: 'target SSR file'
    })
    .option('tsconfig', {
        alias: 'c',
        description: 'tsconfig path, will auto resolve if not specified'
    })
    .check(argv => {
        if (argv._.length === 0) {
            throw new Error('component file must be provided')
        }
        return true
    })

const target = yargs.argv.target as OptionValue
const tsConfigFilePath = yargs.argv.tsconfig as OptionValue
const outputFile = yargs.argv.output as OptionValue
const componentFile = resolve(yargs.argv._[0])
console.error(chalk.gray('compiling'), componentFile, 'to', target)

let targetCode = ''
if (target === 'php') {
    const toPHPCompiler = new ToPHPCompiler({
        tsConfigFilePath,
        externalModules: [{ name: '../../..', required: true }],
        nsPrefix: 'san\\components\\test\\'
    })
    targetCode = toPHPCompiler.compile(componentFile, { ns: `san\\renderer` })
} else {
    const toJSCompiler = new ToJSCompiler(tsConfigFilePath)
    targetCode = toJSCompiler.compile(componentFile)
}

if (outputFile !== undefined) {
    writeFileSync(outputFile, targetCode)
} else {
    process.stdout.write(targetCode)
}
console.error(chalk.green('success'), `${byteCount(targetCode)} bytes written`)
