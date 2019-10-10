import { Component } from 'san'

export class XList extends Component {
    static template = '<ul><li s-for="item in list">{{item}}</li></ul>'
}
