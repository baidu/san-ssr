#!/usr/bin/env node

import chalk from 'chalk'
import { ToPHPCompiler } from '../compilers/to-php-compiler'
import { ToJSCompiler } from '../compilers/to-js-compiler'
import { writeFileSync } from 'fs'
import { extname, resolve } from 'path'
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
        default: 'php',
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

if (target === 'php') {
    const toPHPCompiler = new ToPHPCompiler({
        tsConfigFilePath,
        externalModules: [{ name: '../../..', required: true }],
        nsPrefix: 'san\\components\\test\\'
    })
    const ext = extname(componentFile)
    const options = {
        ns: `san\\renderer`
    }
    if (ext === '.ts') {
        print(toPHPCompiler.compileFromTS(componentFile, options))
    } else if (ext === '.js') {
        print(toPHPCompiler.compileFromJS(componentFile, options))
    } else {
        throw new Error(`not recognized file extension: ${ext}`)
    }
} else {
    const toJSCompiler = new ToJSCompiler(tsConfigFilePath)
    const ext = extname(componentFile)
    if (ext === '.ts') {
        print(toJSCompiler.compileFromTS(componentFile))
    } else if (ext === '.js') {
        print(toJSCompiler.compileFromJS(componentFile))
    } else {
        throw new Error(`not recognized file extension: ${ext}`)
    }
}

function print (targetCode) {
    if (outputFile !== undefined) {
        writeFileSync(outputFile, targetCode)
    } else {
        process.stdout.write(targetCode)
    }
    console.error(chalk.green('success'), `${byteCount(targetCode)} bytes written`)
}
