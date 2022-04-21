(window.webpackJsonp=window.webpackJsonp||[]).push([[17,4],{12:function(n,s,a){"use strict";a.r(s),function(n){a.d(s,"default",(function(){return c}));var t,e,p,o=a(0);class c extends o.a{inited(){n.hub&&n.hub.fire&&n.hub.fire("changed",{level:0,children:[{level:2,title:"安装",hash:"%E5%AE%89%E8%A3%85"},{level:2,title:"渲染一个 San 组件",hash:"%E6%B8%B2%E6%9F%93%E4%B8%80%E4%B8%AA-san-%E7%BB%84%E4%BB%B6"}]})}}p={},(e="components")in(t=c)?Object.defineProperty(t,e,{value:p,enumerable:!0,configurable:!0,writable:!0}):t[e]=p}.call(this,a(2))},37:function(n,s){n.exports=' <div class="content markdown-content"><div class="markdown"><h1 id="%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B">快速开始</h1> <h2 id="%E5%AE%89%E8%A3%85">安装</h2> <pre class="language-bash"><code class="language-bash"><span class="token function">npm</span> i san@latest san-ssr@latest</code></pre> <p>san-ssr 需要 san 提供的模板字符串解析和 TypeScript 类型，因此对 san 的版本有依赖。你需要安装对应版本的 san 和 san-ssr。</p> <p>san-ssr 支持的 san 版本声明在 <code>peerDependencies</code> 里，因此只要能安装成功就能正确工作。一般的建议如下：</p> <ul> <li> <p>如果是新项目，建议使用 <code>npm i san@latest san-ssr@latest</code></p> </li> <li> <p>否则从 san-ssr 最新版本开始降主版本号找到能安装成功的版本。</p> </li> </ul> <blockquote> <p>更多讨论请参考：<a href="https://github.com/baidu/san/issues/441#issuecomment-550260372" target="_blank">baidu/san/issues/441</a></p> </blockquote> <h2 id="%E6%B8%B2%E6%9F%93%E4%B8%80%E4%B8%AA-san-%E7%BB%84%E4%BB%B6">渲染一个 San 组件</h2> <pre class="language-javascript"><code class="language-javascript"><span class="token keyword">const</span> <span class="token punctuation">{</span> SanProject <span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'san-ssr\'</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> san <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">\'san\'</span><span class="token punctuation">)</span>\n<span class="token keyword">const</span> MyComponent <span class="token operator">=</span> san<span class="token punctuation">.</span><span class="token function">defineComponent</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n    <span class="token literal-property property">template</span><span class="token operator">:</span> <span class="token template-string"><span class="token template-punctuation string">`</span><span class="token string">&lt;div>Hello &#123;&#123; name }}&lt;/div></span><span class="token template-punctuation string">`</span></span>\n<span class="token punctuation">}</span><span class="token punctuation">)</span>\n\n<span class="token comment">// SanProject 类提供了你会用到的所有接口</span>\n<span class="token keyword">const</span> project <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">SanProject</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n\n<span class="token comment">// 输入是组件对象</span>\n<span class="token comment">// 输出是一个 render 函数。该函数接受数据对象作为参数，返回 HTML 字符串。</span>\n<span class="token keyword">const</span> render <span class="token operator">=</span> project<span class="token punctuation">.</span><span class="token function">compileToRenderer</span><span class="token punctuation">(</span>MyComponent<span class="token punctuation">)</span>\n\n<span class="token keyword">const</span> html <span class="token operator">=</span> <span class="token function">render</span><span class="token punctuation">(</span><span class="token punctuation">{</span><span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">\'San\'</span><span class="token punctuation">}</span><span class="token punctuation">)</span></code></pre> <p>参考内容：</p> <ul> <li>API 文档：<a href="https://baidu.github.io/san-ssr/classes/_src_models_san_project_.sanproject.html" target="_blank">SanProject</a></li> <li>/demo 下的示例项目。</li> </ul> </div></div> '},49:function(n,s,a){var t=a(1),e=a(37),p=a(12).default;n.exports=a(12),n.exports.default=t(p,e,[])}}]);