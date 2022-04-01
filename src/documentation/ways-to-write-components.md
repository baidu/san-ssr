# 组件的两种写法

有两种方式可以进行组件的定义，得到的都是组件类。San-SSR 在使用他们时[有一定的区别][how-san-ssr-use-component-class]。

## san.defineComponent

```javascript
san.defineComponent({
    components: { 'my-component': container },
    template: `<my-component>aaa{{name}}<span></span></my-component>`
})
```

## class

```javascript
class MyComponent extends san.Component {
    static components = { 'my-component': container }
    static template = `<my-component>aaa{{name}}<span></span></my-component>`
}
```

## 区别

推荐使用 `san.defineComponent` 来定义组件，如果使用 class，则**所有[与 San-SSR 有关的](/pages/Documentation/lifecycle.html#属性)属性都需要为 static**。

这是因为在编译阶段 San-SSR 需要能够从类上直接获取到 template、components 等属性。



[how-san-ssr-use-component-class]: /pages/Under%20the%20hood/how-san-ssr-use-component-class.html
