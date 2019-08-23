const fs = require('fs');
const san = require('../src/ssr');
const path = require('path');
const files = fs.readdirSync(__dirname);

for (const dir of files) {
    if (dir === 'lib') continue;
    if (!fs.statSync(path.join(__dirname, dir)).isDirectory()) continue;

    const expected = fs.readFileSync(path.join(__dirname, dir, 'result.html'), 'utf8');
    const component = path.join(__dirname, dir, 'component.js');
    const data = path.join(__dirname, dir, 'data.json');

    // if (dir === 'load-success')
    it(dir, function () {
        expect(render(component, data)).toBe(expected);
    });
}

function render(component, data) {
    const ComponentClass = require(component);

    let renderer = san.compileToRenderer(ComponentClass);
    let componentData = JSON.parse(fs.readFileSync(data, 'utf8'), (k, v) => {
        if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(v)) {
            return new Date(v);
        }
        return v;
    })

    let html = renderer(componentData);
    return html;
}
