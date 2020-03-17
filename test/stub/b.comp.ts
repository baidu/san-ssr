import { Component } from 'san'
import A from './a.comp'

export default class B extends Component {
    public static template = 'B'
    components: { a: A }
}

export class C {}
