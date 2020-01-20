import { ComponentConstructor } from 'san'
import { SanApp } from '../models/san-app'
import debugFactory from 'debug'

const debug = debugFactory('component-parser')

export interface SanAppParser {
    parseSanAppFromComponentClass (ComponentClass: ComponentConstructor<{}, {}>): SanApp
    parseSanApp (entryFilePath: string): SanApp
}
