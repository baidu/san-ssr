# 生命周期

与 San-SSR 相关的生命周期为：compile、inited。

在创建组件实例时，会执行 compile。

在 render 过程中，会执行 inited。

总体执行顺序：

![](https://user-images.githubusercontent.com/9262426/135042920-85d8b312-9d37-48e3-8e32-fc10add7707f.jpg)

# 方法

与 San-SSR 相关的方法目前只有 initData。

每次 render 过程中会执行 initData 得到新的初始化数据。

# 属性

| 名称           | 需要的阶段      | 说明                                                         |
| -------------- | --------------- | :----------------------------------------------------------- |
| template       | compile         | 组件模板                                                     |
| filters        | compile、render | [过滤器](https://baidu.github.io/san/tutorial/component/#%E8%BF%87%E6%BB%A4%E5%99%A8) |
| components     | compile         | 子组件                                                       |
| computed       | compile、render | 计算属性                                                     |
| trimWhitespace | compile         | 定义组件模板解析时对空白字符的 trim 模式                     |
| delimiters     | compile         | 定义组件模板解析时插值的分隔符。                             |

