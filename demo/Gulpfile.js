const { src, dest, parallel } = require('gulp')
const gulpSanSSR = require('./plugins/gulp-san-ssr.js')

function php () {
    return src('src/index.ts')
        .pipe(gulpSanSSR({ target: 'php', nsPrefix: 'demo\\' }))
        .pipe(dest('dist'))
}

function js () {
    return src('src/index.ts')
        .pipe(gulpSanSSR({ target: 'js' }))
        .pipe(dest('dist'))
}

exports.js = js
exports.php = php
exports.default = parallel(php, js)
