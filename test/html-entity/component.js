
const san = require('san')

const entityStr = '&#39;&#x00021;&emsp;&ensp;&thinsp;&copy;&lt;p&gt;&reg;&lt;/p&gt;&reg;&zwnj;&zwj;&lt;&nbsp;&gt;&quot;'
const MyComponent = san.defineComponent({
    template: '<u>' + entityStr + '</u>'
})

exports = module.exports = MyComponent
