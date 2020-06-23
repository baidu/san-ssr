import { resolve } from 'path'
import { _ } from './underscore'
import { SanData } from './san-data'

export const RUNTIME_FILES = [
    resolve(__dirname, '../../dist/utils/underscore.js'),
    resolve(__dirname, '../../dist/models/san-data.js')
]

export function createRuntime () {
    return { _, SanData }
}
