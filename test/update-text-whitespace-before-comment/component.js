// update text
var san = require('san');
var MyComponent = san.defineComponent({
    template: '<a><span title="{{email}}">{{name}}</span></a>'
});

exports = module.exports = MyComponent;
