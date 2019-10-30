#!/usr/bin/env node

import chalk from 'chalk'
import { SanProject, Target } from '../models/san-project'
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
    .option('prefix', {
        alias: 'p',
        default: 'san\\',
        description: 'namespace prefix for ssr.php'
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
const nsPrefix = yargs.argv.prefix as OptionValue
const tsConfigFilePath = yargs.argv.tsconfig as OptionValue
const outputFile = yargs.argv.output as OptionValue
const componentFile = resolve(yargs.argv._[0])
console.error(chalk.gray('compiling'), componentFile, 'to', target)

const compiler = new SanProject({ tsConfigFilePath })
const targetCode = compiler.compile(componentFile, Target.php, { nsPrefix })

if (outputFile !== undefined) {
    writeFileSync(outputFile, targetCode)
} else {
    process.stdout.write(targetCode)
}
console.error(chalk.green('success'), `${byteCount(targetCode)} bytes written`)
