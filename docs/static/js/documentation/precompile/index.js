!function(n){function s(s){for(var t,o,c=s[0],r=s[1],u=s[2],i=0,k=[];i<c.length;i++)o=c[i],Object.prototype.hasOwnProperty.call(e,o)&&e[o]&&k.push(e[o][0]),e[o]=0;for(t in r)Object.prototype.hasOwnProperty.call(r,t)&&(n[t]=r[t]);for(l&&l(s);k.length;)k.shift()();return p.push.apply(p,u||[]),a()}function a(){for(var n,s=0;s<p.length;s++){for(var a=p[s],t=!0,c=1;c<a.length;c++){var r=a[c];0!==e[r]&&(t=!1)}t&&(p.splice(s--,1),n=o(o.s=a[0]))}return n}var t={},e={3:0,15:0},p=[];function o(s){if(t[s])return t[s].exports;var a=t[s]={i:s,l:!1,exports:{}};return n[s].call(a.exports,a,a.exports,o),a.l=!0,a.exports}o.e=function(){return Promise.resolve()},o.m=n,o.c=t,o.d=function(n,s,a){o.o(n,s)||Object.defineProperty(n,s,{enumerable:!0,get:a})},o.r=function(n){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})},o.t=function(n,s){if(1&s&&(n=o(n)),8&s)return n;if(4&s&&"object"==typeof n&&n&&n.__esModule)return n;var a=Object.create(null);if(o.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:n}),2&s&&"string"!=typeof n)for(var t in n)o.d(a,t,function(s){return n[s]}.bind(null,t));return a},o.n=function(n){var s=n&&n.__esModule?function(){return n.default}:function(){return n};return o.d(s,"a",s),s},o.o=function(n,s){return Object.prototype.hasOwnProperty.call(n,s)},o.p="/san-ssr/";var c=window.webpackJsonp=window.webpackJsonp||[],r=c.push.bind(c);c.push=s,c=c.slice();for(var u=0;u<c.length;u++)s(c[u]);var l=r;p.push([48,0]),a()}({13:function(n,s,a){"use strict";a.r(s),function(n){a.d(s,"default",(function(){return c}));var t,e,p,o=a(0);class c extends o.a{inited(){n.hub&&n.hub.fire&&n.hub.fire("changed",{level:0})}}p={},(e="components")in(t=c)?Object.defineProperty(t,e,{value:p,enumerable:!0,configurable:!0,writable:!0}):t[e]=p}.call(this,a(3))},37:function(n,s){n.exports=' <div class="content markdown-content"><div class="markdown"><h1 id="%E9%A2%84%E7%BC%96%E8%AF%91%E7%BB%84%E4%BB%B6%E4%BB%A3%E7%A0%81">预编译组件代码</h1> <p>从名字即可看出，将组件传入 <code>compileToRender</code> 得到 render 函数是一个编译过程，需要一定的编译时间。</p> <p>这一编译过程只会进行一次，后续渲染可以直接使用 render 函数。但如果对启动时间比较介意，可以在线下对 San 组件进行预编译。</p> <p>使用 San-SSR 提供的 <code>compileToSource</code> 方法可以得到 render 函数的字符串版本：</p> <pre class="language-javascript"><code class="language-javascript"><span class="token keyword">const</span> <span class="token punctuation">{</span> SanProject <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'san-ssr\'</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> fs <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'fs\'</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> path <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'path\'</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> san <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'san\'</span><span class="token punctuation">)</span>\n\n<span class="token keyword">let</span> MyComponent <span class="token operator">=</span> san<span class="token punctuation">.</span><span class="token function">defineComponent</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n    <span class="token literal-property property">template</span><span class="token operator">:</span> <span class="token string">"&lt;div>Hello &#123;&#123; name }}&lt;/div>"</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\n\n<span class="token keyword">const</span> project <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">SanProject</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n\n<span class="token comment">// 得到的是 render 函数文件内容</span>\n<span class="token keyword">const</span> renderStr <span class="token operator">=</span> project<span class="token punctuation">.</span><span class="token function">compileToSource</span><span class="token punctuation">(</span>MyComponent<span class="token punctuation">)</span>\n\nfs<span class="token punctuation">.</span><span class="token function">writeFileSync</span><span class="token punctuation">(</span>path<span class="token punctuation">.</span><span class="token function">resolve</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">\'output.js\'</span><span class="token punctuation">)</span><span class="token punctuation">,</span> renderStr<span class="token punctuation">)</span>\n\n\n<span class="token comment">// 在服务器端执行以下代码进行渲染</span>\n<span class="token keyword">const</span> render <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'./output.js\'</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> html <span class="token operator">=</span> <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">{</span><span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">\'San\'</span><span class="token punctuation">}</span><span class="token punctuation">)</span></code></pre> </div></div> '},48:function(n,s,a){var t=a(1),e=a(37),p=a(13).default;n.exports=a(13),n.exports.default=t(p,e,[])}});