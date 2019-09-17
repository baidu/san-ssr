import { compileAllToJS, compileToJS } from './case'

const caseName = process.argv[2]
if (caseName === '--all') compileAllToJS()
else compileToJS(caseName)
