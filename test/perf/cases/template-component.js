const common = require('../utils/common')

const bench = common.createBenchmark(main, {
    type: [
        'component',
        'template component'
    ],
    n: [1e4]
})

const san = require('san')
const { compileToRenderer } = require('../../../dist/index')

const Container = san.defineTemplateComponent({
    template: '<p>Hello<slot/>!</p>'
})

const MyComponent = san.defineComponent({
    components: { 'my-component': Container },
    template: '<my-component>aaa{{name}}<span></span></my-component>'
})

const Container2 = san.defineComponent({
    template: '<p>Hello<slot/>!</p>'
})

const MyComponent2 = san.defineComponent({
    components: { 'my-component': Container2 },
    template: '<my-component>aaa{{name}}<span></span></my-component>'
})

const templateComponentRenderer = compileToRenderer(MyComponent)
const componentRenderer = compileToRenderer(MyComponent2)
const data = {
    link: 'https://baidu.github.io/san/',
    framework: 'San',
    linkText: 'HomePage'
}

function main ({ type, n }) {
    switch (type) {
    case 'component':
        bench.start()
        for (let i = 0; i < n; i++) {
            componentRenderer(data)
        }
        bench.end(n)
        break
    case 'template component':
        bench.start()
        for (let i = 0; i < n; i++) {
            templateComponentRenderer(data)
        }
        bench.end(n)
        break
    }
}
