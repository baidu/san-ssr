
declare module 'san' {
    import {
        AProperty,
        ComponentDefineOptionComponents,
        ComponentNewOptions,
        ADirectiveIs,
        AElement as RawAElement,
        Component,
        ComponentDefineOptionComputed
    } from "san/types/index";

    export interface AElement extends RawAElement {
        attrs?: AProperty[];
    }
    export interface ADynamicNode extends AElement {
        directives: {is: ADirectiveIs};
    }

    /** san Component Class definition */
    export interface ComponentClazz<T extends {} = {}> extends Component<T> {
        new(option?: ComponentNewOptions<T>): Component<T>;
        components?: ComponentDefineOptionComponents;
        template?: string;
        computed?: ComponentDefineOptionComputed<T>;
    }

    export {
        Data,
        Component,
        ComponentDefineOptions,
        defineComponent,
        DefinedComponentClass,
        parseTemplate,
        AProperty,
        ADirectiveBind, BoolLiteral,
        Expr,
        NumberLiteral,
        StringLiteral,
        ExprType,
        NodeType,
        NullLiteral,
        ANode,
        AIfNode,
        AForNode,
        ASlotNode,
        AText,
        AccessorExpr,
        InterpExpr,
        CallExpr,
        TextExpr,
        BinaryExpr,
        UnaryExpr,
        TertiaryExpr,
        ArrayLiteral,
        ObjectLiteral,
        AFragmentNode,
        ADirectiveIs
    } from "san/types/index";
}
