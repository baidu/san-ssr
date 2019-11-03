import { compileExprSource } from '../compilers/expr-compiler'

export class Stringifier {
    private nsPrefix = ''

    constructor (nsPrefix: string) {
        this.nsPrefix = nsPrefix
    }

    obj (source) {
        let prefixComma
        let result = '(object)['

        for (const key in source) {
            if (!source.hasOwnProperty(key) || typeof source[key] === 'undefined') {
                continue
            }

            if (prefixComma) {
                result += ','
            }
            prefixComma = 1

            const k = compileExprSource.stringLiteralize(key)
            const v = this.any(source[key])
            result += `${k} => ${v}`
        }

        return result + ']'
    }

    arr (source) {
        let prefixComma
        let result = '['

        for (const value of source) {
            if (prefixComma) {
                result += ','
            }
            prefixComma = 1

            result += this.any(value)
        }

        return result + ']'
    }

    str (source) {
        return compileExprSource.stringLiteralize(source)
    }

    date (source) {
        return `new \\${this.nsPrefix}runtime\\Ts2Php_Date(` + source.getTime() + ')'
    }

    any (source) {
        switch (typeof source) {
        case 'string':
            return this.str(source)

        case 'number':
            return '' + source

        case 'boolean':
            return source ? 'true' : 'false'

        case 'object':
            if (!source) {
                return null
            }

            if (source instanceof Array) {
                return this.arr(source)
            }

            if (source instanceof Date) {
                return this.date(source)
            }

            return this.obj(source)
        }

        throw new Error('Cannot Stringify:' + source)
    }
}
