const { readFileSync } = require('fs')
const rDate = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/

exports.read = function (datafile) {
    return JSON.parse(readFileSync(datafile, 'utf8'), (k, v) => {
        if (rDate.test(v)) {
            return new Date(v)
        }
        return v
    })
}
