const san = require('san')

var MyComponent = san.defineComponent({
    template: '<div s-bind="sb">test</div>'
});

exports = module.exports = MyComponent;
