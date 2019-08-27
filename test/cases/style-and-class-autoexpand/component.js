// class and style auto expand
const san = require('san')

var Label = san.defineComponent({   // eslint-disable-line
    components: {
        'ui-label': Label   // eslint-disable-line
    },

    template: '<span class="{{classes.main}}" style="{{styles.main}}">label</span>',

    initData: function () {
        return {
            styles: {
                main: {
                    position: 'fixed',
                    display: 'block'
                }
            },

            classes: {
                main: ['ui', 'ui-label']
            }
        }
    }
})

const MyComponent = san.defineComponent({
    components: {
        'ui-label': Label
    },

    template: '<a class="{{classes.main}}" style="{{styles.main}}">' +
        '<h3 class="{{classes.title}}" style="{{styles.title}}"></h3>' +
        '<ui-label />' +
        '</a>',

    initData: function () {
        return {
            styles: {
                main: {
                    width: '50px',
                    height: '50px'
                },

                title: {
                    width: '50px',
                    height: '20px'
                }
            },

            classes: {
                main: ['app', 'main'],
                title: ['app-title', 'main-title']
            }
        }
    }
})

exports = module.exports = MyComponent
