import { Component } from 'san'
import { XList } from './List'

export default class MyComponent extends Component {
    static components = {
        'x-l': XList
    }
    static template = '<div><x-l list="{{[1, true, ...ext, \'erik\', ...ext2]}}"/></div>'
}
