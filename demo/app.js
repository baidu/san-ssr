const { defineComponent } = require('san')

module.exports = defineComponent({
    filters: {
        sum: function (a, b) {
            return a + b
        }
    },
    computed: {
        name: function () {
            const f = this.data.get('firstName')
            const l = this.data.get('lastName')
            return `${f} ${l}`
        }
    },
    template: '<div><h1>{{name}}</h1></div>'
})