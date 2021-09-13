---
name: Bug report
about: Create a report to help us improve
title: "[BUG]"
labels: ''
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

> 请先尝试升级 San、San-SSR 到最新的版本。

**To Reproduce**

请提供一个可以复现的最小 case，例如：

反解错误时：
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bug Report</title>
</head>

<body>
    <script src="./node_modules/san/dist/san.js"></script>
    <div id="root">
        <!-- San-SSR 的输出结果 -->
    </div>
    <script>
    // 组件定义
    let MyApp = san.defineComponent({
        template: ``,
    })
    let myApp = new MyApp({el: document.getElementById('root').firstElementChild});
    myApp.attach(document.getElementById('root'));
    </script>
</body>
</html>
```

编译错误时：
```javascript
const san = require('san')

const MyComponent = san.defineComponent({
    template: '',
    initData () {
        return {
        }
    }
})

module.exports = MyComponent
```

**Versions (please complete the following information):**
 - San: [e.g. x.x.x]
 - San-SSR: [e.g. x.x.x]

**Additional context**
Add any other context about the problem here.
