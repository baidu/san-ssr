// two way binding textarea value
var san = require('san');
var MyComponent = san.defineComponent({
    template: '<div><span title="{{name}}">{{name}}</span> <textarea value="{=name=}"></textarea></div>'
});

exports = module.exports = MyComponent;
