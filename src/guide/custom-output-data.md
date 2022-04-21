# 自定义数据输出

> Added in: v5.3.0

San-SSR 会将数据以注释的形式输出在 HTML 结果中，用于在浏览器中反解，例如：

组件：

```javascript
const { Component } = require('san')
class MyComponent extends Component {}
MyComponent.template = '<div>{{staff[0].first}} {{staff.0.last}}</div>'
module.exports = exports = MyComponent
```

数据：

```json
{
    "staff": [{
        "first": "Berg",
        "last": "Lay"
    }]
}
```

会得到如下结果，注意到数据以注释方式输出在了 HTML 中：

```html
<div><!--s-data:{"staff":[{"first":"Berg","last":"Lay"}]}-->Berg Lay</div>
```

## 问题

当我们渲染的内容大部分为静态内容时，数据会在输出的 HTML 中占用较大体积。一个极端的例子是使用 `s-html` 渲染大量内容。

组件：

```javascript
var san = require('san');
var MyComponent = san.defineComponent({
    template: '<div id="output-data-outer">'
        + '<b>{{title}}</b>'
        + '<div s-html="{{content}}"></div>'
        + '</div>'
});

exports = module.exports = MyComponent;
```

数据：

```json
{
    "title": "The Last of the Mohicans",
    "content": "<p>The Last of the Mohicans is a 1992 American epic historical drama film set 
    in 1757 during the French and Indian War. </p><p>It was directed by Michael Mann and was 
    based on the 1826 novel The Last of the Mohicans: A Narrative of 1757 by James Fenimore 
    Cooper and the 1936 film adaptation, owing more to the film than the novel. The film stars 
    Daniel Day-Lewis and Madeleine Stowe, with Jodhi May, Russell Means, Wes Studi, Eric 
    Schweig, and Steven Waddington in supporting roles.</p>"
}
```

如果直接使用 San-SSR 渲染，会得到如下结果：

```html
<div id="output-data-outer"><!--s-data:{"title":"The Last of the Mohicans","content":"<p>The 
    Last of the Mohicans is a 1992 American epic historical drama film set in 1757 during the 
    French and Indian War. </p><p>It was directed by Michael Mann and was based on the 1826 
    novel The Last of the Mohicans: A Narrative of 1757 by James Fenimore Cooper and the 1936 
    film adaptation, owing more to the film than the novel. The film stars Daniel Day-Lewis and 
    Madeleine Stowe, with Jodhi May, Russell Means, Wes Studi, Eric Schweig, and Steven 
    Waddington in supporting roles.</p>"}--><b>The Last of the Mohicans</b><div><p>The Last of 
    the Mohicans is a 1992 American epic historical drama film set in 1757 during the French 
    and Indian War. </p><p>It was directed by Michael Mann and was based on the 1826 novel The 
    Last of the Mohicans: A Narrative of 1757 by James Fenimore Cooper and the 1936 film 
    adaptation, owing more to the film than the novel. The film stars Daniel Day-Lewis and 
    Madeleine Stowe, with Jodhi May, Russell Means, Wes Studi, Eric Schweig, and Steven 
    Waddington in supporting roles.</p></div></div>
```

## 使用 `outputData` 精简数据输出

在调用 `render` 函数时，可以通过传入 `outputData` 的方式来控制数据产出。此时反解阶段会直接使用 HTML 中的现有数据，请自己负责正确性。

`outputData` 支持两种类型：

- `Object`：代替 data，直接使用该字段输出在 HTML 中。
- `Function`：传入 data，输出结果输出在 HTML 中。

还是上面的组件，这里我们在调用 render 函数时，可以传入 `outputData` 参数来控制数据输出：

```javascript
// 对象形式
const html = render(data, {
    outputData: {
        title: data.title
    }
})
```

```javascript
// 函数形式
const html = render(data, {
    outputData(data) {
        return {
            title: data.title
        }
    }
})
```

输出的 HTML 内容中不再有 content 数据，体积得到了显著改善：

```html
<div id="output-data-outer"><!--s-data:{"title":"The Last of the Mohicans"}--><b>The Last of the 
    Mohicans</b><div><p>The Last of the Mohicans is a 1992 American epic historical drama film 
    set in 1757 during the French and Indian War. </p><p>It was directed by Michael Mann and was 
    based on the 1826 novel The Last of the Mohicans: A Narrative of 1757 by James Fenimore 
    Cooper and the 1936 film adaptation, owing more to the film than the novel. The film stars 
    Daniel Day-Lewis and Madeleine Stowe, with Jodhi May, Russell Means, Wes Studi, Eric Schweig, 
    and Steven Waddington in supporting roles.</p></div></div>
```