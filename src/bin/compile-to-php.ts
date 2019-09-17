import { compileToPHP, compileAllToPHP } from './case'

const caseName = process.argv[2]

if (caseName === '--all') compileAllToPHP()
else compileToPHP(caseName)
