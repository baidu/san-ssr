import { defineComponent } from 'san'

export const MyComponent = defineComponent({
    filters: {
        year: function (date: Date) {
            return date.getFullYear()
        }
    },
    template: '<div>' +
        '<b title="{{date|year}}">{{date|year}}</b>' +
        '</div>'
})
