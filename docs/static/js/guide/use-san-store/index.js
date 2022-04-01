!function(n){function s(s){for(var t,e,c=s[0],r=s[1],l=s[2],i=0,k=[];i<c.length;i++)e=c[i],Object.prototype.hasOwnProperty.call(p,e)&&p[e]&&k.push(p[e][0]),p[e]=0;for(t in r)Object.prototype.hasOwnProperty.call(r,t)&&(n[t]=r[t]);for(u&&u(s);k.length;)k.shift()();return o.push.apply(o,l||[]),a()}function a(){for(var n,s=0;s<o.length;s++){for(var a=o[s],t=!0,c=1;c<a.length;c++){var r=a[c];0!==p[r]&&(t=!1)}t&&(o.splice(s--,1),n=e(e.s=a[0]))}return n}var t={},p={10:0,22:0},o=[];function e(s){if(t[s])return t[s].exports;var a=t[s]={i:s,l:!1,exports:{}};return n[s].call(a.exports,a,a.exports,e),a.l=!0,a.exports}e.e=function(){return Promise.resolve()},e.m=n,e.c=t,e.d=function(n,s,a){e.o(n,s)||Object.defineProperty(n,s,{enumerable:!0,get:a})},e.r=function(n){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})},e.t=function(n,s){if(1&s&&(n=e(n)),8&s)return n;if(4&s&&"object"==typeof n&&n&&n.__esModule)return n;var a=Object.create(null);if(e.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:n}),2&s&&"string"!=typeof n)for(var t in n)e.d(a,t,function(s){return n[s]}.bind(null,t));return a},e.n=function(n){var s=n&&n.__esModule?function(){return n.default}:function(){return n};return e.d(s,"a",s),s},e.o=function(n,s){return Object.prototype.hasOwnProperty.call(n,s)},e.p="/san-ssr/";var c=window.webpackJsonp=window.webpackJsonp||[],r=c.push.bind(c);c.push=s,c=c.slice();for(var l=0;l<c.length;l++)s(c[l]);var u=r;o.push([52,0]),a()}({17:function(n,s,a){"use strict";a.r(s),function(n){a.d(s,"default",(function(){return c}));var t,p,o,e=a(0);class c extends e.a{inited(){n.hub&&n.hub.fire&&n.hub.fire("changed",{level:0,children:[{level:2,title:"compileToRender",hash:"compiletorender"},{level:2,title:"compileToSource",hash:"compiletosource"}]})}}o={},(p="components")in(t=c)?Object.defineProperty(t,p,{value:o,enumerable:!0,configurable:!0,writable:!0}):t[p]=o}.call(this,a(3))},41:function(n,s){n.exports=' <div class="content markdown-content"><div class="markdown"><h1 id="%E4%BD%BF%E7%94%A8-san-store">使用 San-Store</h1> <p>目前 San-SSR <strong>只支持以组件类作为输入</strong>进行编译。</p> <p>假设有以下组件：</p> <pre class="language-javascript"><code class="language-javascript"><span class="token comment">// app.js</span>\n<span class="token keyword">const</span> <span class="token punctuation">{</span> connect <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'san-store\'</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> san <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'san\'</span><span class="token punctuation">)</span>\n\n<span class="token keyword">const</span> MyComponent <span class="token operator">=</span> connect<span class="token punctuation">.</span><span class="token function">san</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n    <span class="token string-property property">\'name\'</span><span class="token operator">:</span> <span class="token string">\'text\'</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">(</span>san<span class="token punctuation">.</span><span class="token function">defineComponent</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n    <span class="token literal-property property">template</span><span class="token operator">:</span> <span class="token string">"&lt;div>&#123;&#123; name }}&lt;/div>"</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n\nmodule<span class="token punctuation">.</span>exports <span class="token operator">=</span> MyComponent</code></pre> <h2 id="compiletorender">compileToRender</h2> <pre class="language-javascript"><code class="language-javascript"><span class="token keyword">const</span> <span class="token punctuation">{</span> SanProject <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'san-ssr\'</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> <span class="token punctuation">{</span> connect<span class="token punctuation">,</span> store <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'san-store\'</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> san <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'san\'</span><span class="token punctuation">)</span>\n\n<span class="token keyword">const</span> MyComponent <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'./app.js\'</span><span class="token punctuation">)</span>\n\nstore<span class="token punctuation">.</span>raw <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token literal-property property">text</span><span class="token operator">:</span> <span class="token string">\'san\'</span><span class="token punctuation">}</span>\n\n<span class="token keyword">const</span> project <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">SanProject</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> render <span class="token operator">=</span> project<span class="token punctuation">.</span><span class="token function">compileToRenderer</span><span class="token punctuation">(</span>MyComponent<span class="token punctuation">)</span>\n<span class="token keyword">const</span> html <span class="token operator">=</span> <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">{</span><span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">\'San\'</span><span class="token punctuation">}</span><span class="token punctuation">)</span></code></pre> <h2 id="compiletosource">compileToSource</h2> <p>当 <code>compileToSource</code> 时，必须配合<a href="/pages/Guides/use-outside-component.html">手动传入组件类进行-render</a>特性来使用。</p> <p>编译阶段：</p> <pre class="language-javascript"><code class="language-javascript"><span class="token comment">// compile</span>\n<span class="token keyword">const</span> <span class="token punctuation">{</span> SanProject <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'san-ssr\'</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> <span class="token punctuation">{</span> store <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'san-store\'</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> fs <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'fs\'</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> path <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'path\'</span><span class="token punctuation">)</span>\n\n<span class="token keyword">const</span> MyComponent <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'./app\'</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> project <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">SanProject</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> renderStr <span class="token operator">=</span> project<span class="token punctuation">.</span><span class="token function">compileToSource</span><span class="token punctuation">(</span>MyComponent<span class="token punctuation">,</span> <span class="token string">\'js\'</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>\n    <span class="token literal-property property">useProvidedComponentClass</span><span class="token operator">:</span> <span class="token boolean">true</span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\nfs<span class="token punctuation">.</span><span class="token function">writeFileSync</span><span class="token punctuation">(</span>path<span class="token punctuation">.</span><span class="token function">resolve</span><span class="token punctuation">(</span>__dirname<span class="token punctuation">,</span> <span class="token string">\'./output.js\'</span><span class="token punctuation">)</span><span class="token punctuation">,</span> renderStr<span class="token punctuation">)</span></code></pre> <p>渲染阶段：</p> <pre class="language-javascript"><code class="language-javascript"><span class="token comment">// render</span>\n<span class="token keyword">const</span> <span class="token punctuation">{</span> store <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'san-store\'</span><span class="token punctuation">)</span>\n\n<span class="token keyword">const</span> MyComponent <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'./app\'</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> render <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'./output\'</span><span class="token punctuation">)</span>\nstore<span class="token punctuation">.</span>raw <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token literal-property property">text</span><span class="token operator">:</span> <span class="token string">\'san\'</span><span class="token punctuation">}</span>\n<span class="token keyword">const</span> html <span class="token operator">=</span> <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">{</span><span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">\'San\'</span><span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>\n    <span class="token literal-property property">ComponentClass</span><span class="token operator">:</span> MyComponent\n<span class="token punctuation">}</span><span class="token punctuation">)</span></code></pre> </div></div> '},52:function(n,s,a){var t=a(1),p=a(41),o=a(17).default;n.exports=a(17),n.exports.default=t(o,p,[])}});