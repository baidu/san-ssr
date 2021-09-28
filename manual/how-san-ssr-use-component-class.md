San-SSR 在执行过程中会在编译和渲染两个阶段都用到组件类。

# 编译阶段

在编译阶段，San-SSR 需要获取组件类上的 template、components、initData 等属性。

此时，San-SSR 不会去尝试创建组件类实例，当输入为文件路径时，会通过静态分析的方式来获取这些属性。

而当输入为组件类时，则需要从组件类上直接获取，因此这些属性需要能直接从组件类上读取到。

- 对于使用 `const MyComponent = san.defineComponent` 定义的组件，San-SSR 会尝试从 `MyComponent.prototype` 上读取这些属性。
- 对于使用 `MyComponent extends san.Component` 定义的组件，San-SSR 会尝试从 `MyComponent` 上直接读取这些属性。这也是为什么这些属性需要[使用 static 来定义](/pages/Documentation/ways-to-write-components.html)。


# 渲染阶段

在渲染阶段，San-SSR 会通过 new 的形式创建组件实例，但**该实例仅会被创建一次**，所有的 render 过程中用到的实例，都是通过 Object.create 创建出来的。

所以组件中的方法有一下注意事项：

1. 可以在 this 上添加属性，不会影响二次渲染。
2. 不可以修改 this 上[会被 San-SSR 用到的属性](/pages/Documentation/lifecycle.html#属性)，因为该操作会修改唯一的组件实例，该修改会保留，影响后续的渲染过程。