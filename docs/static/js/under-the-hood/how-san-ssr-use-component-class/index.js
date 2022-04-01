!function(e){function n(n){for(var o,a,l=n[0],c=n[1],u=n[2],s=0,f=[];s<l.length;s++)a=l[s],Object.prototype.hasOwnProperty.call(r,a)&&r[a]&&f.push(r[a][0]),r[a]=0;for(o in c)Object.prototype.hasOwnProperty.call(c,o)&&(e[o]=c[o]);for(p&&p(n);f.length;)f.shift()();return i.push.apply(i,u||[]),t()}function t(){for(var e,n=0;n<i.length;n++){for(var t=i[n],o=!0,l=1;l<t.length;l++){var c=t[l];0!==r[c]&&(o=!1)}o&&(i.splice(n--,1),e=a(a.s=t[0]))}return e}var o={},r={12:0,23:0},i=[];function a(n){if(o[n])return o[n].exports;var t=o[n]={i:n,l:!1,exports:{}};return e[n].call(t.exports,t,t.exports,a),t.l=!0,t.exports}a.e=function(){return Promise.resolve()},a.m=e,a.c=o,a.d=function(e,n,t){a.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:t})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,n){if(1&n&&(e=a(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(a.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var o in e)a.d(t,o,function(n){return e[n]}.bind(null,o));return t},a.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(n,"a",n),n},a.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},a.p="/san-ssr/";var l=window.webpackJsonp=window.webpackJsonp||[],c=l.push.bind(l);l.push=n,l=l.slice();for(var u=0;u<l.length;u++)n(l[u]);var p=c;i.push([56,0]),t()}({21:function(e,n,t){"use strict";t.r(n),function(e){t.d(n,"default",(function(){return l}));var o,r,i,a=t(0);class l extends a.a{inited(){e.hub&&e.hub.fire&&e.hub.fire("changed",{level:0,children:[{level:2,title:"编译阶段",hash:"%E7%BC%96%E8%AF%91%E9%98%B6%E6%AE%B5"},{level:2,title:"渲染阶段",hash:"%E6%B8%B2%E6%9F%93%E9%98%B6%E6%AE%B5"}]})}}i={},(r="components")in(o=l)?Object.defineProperty(o,r,{value:i,enumerable:!0,configurable:!0,writable:!0}):o[r]=i}.call(this,t(3))},45:function(e,n){e.exports=' <div class="content markdown-content"><div class="markdown"><h1 id="san-ssr-%E6%98%AF%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8%E7%BB%84%E4%BB%B6%E7%B1%BB%E7%9A%84">San-SSR 是如何使用组件类的</h1> <p>San-SSR 在执行过程中会在编译和渲染两个阶段都用到组件类。</p> <h2 id="%E7%BC%96%E8%AF%91%E9%98%B6%E6%AE%B5">编译阶段</h2> <p>在编译阶段，San-SSR 需要获取组件类上的 template、components、initData 等属性。</p> <p>此时，San-SSR 不会去尝试创建组件类实例，当输入为文件路径时，会通过静态分析的方式来获取这些属性。</p> <p>而当输入为组件类时，则需要从组件类上直接获取，因此这些属性需要能直接从组件类上读取到。</p> <ul> <li>对于使用 <code>const MyComponent = san.defineComponent</code> 定义的组件，San-SSR 会尝试从 <code>MyComponent.prototype</code> 上读取这些属性。</li> <li>对于使用 <code>MyComponent extends san.Component</code> 定义的组件，San-SSR 会尝试从 <code>MyComponent</code> 上直接读取这些属性。这也是为什么这些属性需要<a href="/pages/Documentation/ways-to-write-components.html">使用 static 来定义</a>。</li> </ul> <h2 id="%E6%B8%B2%E6%9F%93%E9%98%B6%E6%AE%B5">渲染阶段</h2> <p>在渲染阶段，San-SSR 会通过 new 的形式创建组件实例，但<strong>该实例仅会被创建一次</strong>，所有的 render 过程中用到的实例，都是通过 Object.create 创建出来的。</p> <p>所以组件中的方法有一下注意事项：</p> <ol> <li>可以在 this 上添加属性，不会影响二次渲染。</li> <li>不可以修改 this 上<a href="/pages/Documentation/lifecycle.html#%E5%B1%9E%E6%80%A7">会被 San-SSR 用到的属性</a>，因为该操作会修改唯一的组件实例，该修改会保留，影响后续的渲染过程。</li> </ol> </div></div> '},56:function(e,n,t){var o=t(1),r=t(45),i=t(21).default;e.exports=t(21),e.exports.default=o(i,r,[])}});