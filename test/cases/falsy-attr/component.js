// falsy attr
const san = require('san')
const MyComponent = san.defineComponent({
    template: `<div a1="{{''}}" a2="{{null}}" a3="{{false}}" a4="{{undefined}}" a5="{{0}}" a6="{{[]}}" a7="{{true}}" a8="{{}}" a9></div>`
})

exports = module.exports = MyComponent
