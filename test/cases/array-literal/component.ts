import { Component } from 'san'

class List extends Component {
    static template = '<ul><li s-for="item in list">{{item}}</li></ul>'
}

export default class MyComponent extends Component {
    static components = {
        'x-l': List
    }
    static template = '<div><x-l list="{{[1, true, ...ext, \'erik\', ...ext2]}}"/></div>'
}
