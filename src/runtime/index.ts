import { resolve } from 'path'
import { _ } from './underscore'
import { SanData } from './san-data'

export const RUNTIME_FILES = [
    resolve(__dirname, '../../dist/runtime/underscore.js'),
    resolve(__dirname, '../../dist/runtime/san-data.js')
]

export function createRuntime () {
    return { _, SanData }
}
