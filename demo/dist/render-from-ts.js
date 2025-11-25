const sanSSRHelpers = (function (exports) {
    "use strict";
    /**
     * 该文件可能会以字符串形式直接输出到产物中
     * 因此不能引用外部模块，会因找不到外部模块报错
     */
    Object.defineProperty(exports, "__esModule", { value: true });
    exports._ = void 0;
    const BASE_PROPS = {
        class: 1,
        style: 1,
        id: 1
    };
    const HTML_ENTITY = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '\u00a0': '&nbsp;',
        '\u2003': '&emsp;',
        '\u2002': '&ensp;',
        '\u2009': '&thinsp;',
        '\xa9': '&copy;',
        '\xae': '&reg;',
        '\u200c': '&zwnj;',
        '\u200d': '&zwj;',
        '&': '&amp;'
    };
    const rENTITY = new RegExp(`[${Object.keys(HTML_ENTITY).join('')}]`, 'g');
    function escapeHTML(source) {
        if (typeof source === 'string') {
            return source.replace(rENTITY, (c) => HTML_ENTITY[c]);
        }
        return source;
    }
    function isObject(source) {
        return typeof source === 'object' && source !== null;
    }
    function isArray(source) {
        return source && source instanceof Array;
    }
    function output(value, needEscape) {
        if (value == null || value === '') {
            return '';
        }
        value = '' + value;
        return needEscape ? escapeHTML(value) : value;
    }
    function classFilter(source) {
        if (!isArray(source)) {
            source = [source];
        }
        let res = '';
        for (let i = 0; i < source.length; i++) {
            const s = source[i];
            if (s != null) {
                if (i !== 0) {
                    res += ' ';
                }
                res += s;
            }
        }
        return res;
    }
    function styleFilter(source) {
        if (isObject(source)) {
            const keys = Object.keys(source);
            let res = '';
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                res += (key + ':' + source[key] + ';');
            }
            return res;
        }
        return source;
    }
    function xclassFilter(inherits, own) {
        const inheritStr = classFilter(inherits);
        if (inheritStr) {
            if (own)
                return own + ' ' + inheritStr;
            return inheritStr;
        }
        return own;
    }
    function xstyleFilter(inherits, own) {
        inherits = inherits && styleFilter(inherits);
        if (inherits) {
            if (own)
                return own + ';' + inherits;
            return inherits;
        }
        return own;
    }
    function attrFilter(name, value, needEscape) {
        // style/class/id 值为 falsy 时不输出属性
        if (value == null || (!value && BASE_PROPS[name])) {
            return '';
        }
        value = '' + value;
        return ` ${name}="${needEscape ? escapeHTML(value) : value}"`;
    }
    function boolAttrFilter(name, value) {
        return value ? ' ' + name : '';
    }
    function callFilter(ctx, name, ...args) {
        let value;
        try {
            value = ctx.instance.filters[name].call(ctx.instance, ...args);
        }
        catch (e) {
            /* istanbul ignore next */
            handleError(e, ctx.instance, 'filter:' + name);
        }
        return value;
    }
    function callComputed(ctx, name) {
        let value;
        try {
            value = ctx.instance.computed[name].apply(ctx.instance);
        }
        catch (e) {
            /* istanbul ignore next */
            handleError(e, ctx.instance, 'computed:' + name);
        }
        return value;
    }
    function iterate(val) {
        return isArray(val) ? val.entries() : Object.entries(val);
    }
    function createFromPrototype(proto) {
        function Creator() { }
        Creator.prototype = proto;
        return new Creator();
    }
    function createInstanceFromClass(Clazz) {
        // method
        // compiled inited initData
        const inited = Clazz.prototype.inited;
        delete Clazz.prototype.inited;
        const initData = Clazz.prototype.initData;
        delete Clazz.prototype.initData;
        // property
        // template filters components computed trimWhitespace delimiters
        const template = Clazz.template || Clazz.prototype.template;
        const components = Clazz.components || Clazz.prototype.components;
        delete Clazz.components;
        delete Clazz.prototype.components;
        const computed = Clazz.computed || Clazz.prototype.computed;
        delete Clazz.computed;
        delete Clazz.prototype.computed;
        Clazz.prototype.template = '<div></div>';
        const instance = new Clazz();
        if (inited)
            Clazz.prototype.inited = inited;
        if (initData)
            Clazz.prototype.initData = initData;
        if (components)
            Clazz.prototype.components = components;
        Clazz.prototype.template = template;
        if (computed)
            instance['computed'] = Clazz.prototype.computed = Clazz.computed = computed;
        return instance;
    }
    function getRootCtx(ctx) {
        let last = ctx;
        while (ctx.parentCtx) {
            last = ctx;
            ctx = ctx.parentCtx;
        }
        // 如果跟组件 render 调用的时候传递了 parentCtx，会找到这个对象
        // 通过 ctx 是否有 data 来判断是不是真正的 rootCtx
        // @ts-ignore
        return ctx.data ? ctx : last;
    }
    function handleError(e, instance, info) {
        let current = instance;
        while (current) {
            if (typeof current.error === 'function') {
                current.error(e, instance, info);
                return;
            }
            current = current.parentComponent;
        }
        throw e;
    }
    function mergeChildSlots(childSlots) {
        const sourceSlots = {
            named: {},
            noname: false
        };
        const keys = Object.keys(childSlots);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (key === '') {
                sourceSlots.noname = true;
                continue;
            }
            sourceSlots.named[key] = true;
        }
        return sourceSlots;
    }
    function recursiveDeepClone(obj, cache = new WeakMap()) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (obj instanceof RegExp) {
            return new RegExp(obj);
        }
        if (cache.has(obj)) {
            return cache.get(obj);
        }
        const newObj = Array.isArray(obj) ? [] : Object.create(Object.getPrototypeOf(obj));
        cache.set(obj, newObj);
        // Recursively clone properties
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = recursiveDeepClone(obj[key], cache);
            }
        }
        return newObj;
    }
    function cloneDeep(data) {
        // eslint-disable-next-line no-undef
        return typeof structuredClone === 'function' ? structuredClone(data) : recursiveDeepClone(data);
    }
    exports._ = {
        output,
        createInstanceFromClass,
        escapeHTML,
        boolAttrFilter,
        attrFilter,
        classFilter,
        styleFilter,
        xstyleFilter,
        xclassFilter,
        createFromPrototype,
        getRootCtx,
        iterate,
        callFilter,
        callComputed,
        handleError,
        mergeChildSlots,
        cloneDeep
    };
    //# sourceMappingURL=underscore.js.map
    
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SanSSRData = void 0;
    /**
     * 字符串源码读取类，用于模板字符串解析过程
     *
     * @param {string} source 要读取的字符串
     */
    class Walker {
        constructor(source) {
            this.source = source;
            this.len = this.source.length;
            this.index = 0;
        }
        /**
         * 向前读取符合规则的字符片段，并返回规则匹配结果
         *
         * @param reg 字符片段的正则表达式
         * @param isMatchStart 是否必须匹配当前位置
         * @return
         */
        match(reg, isMatchStart) {
            reg.lastIndex = this.index;
            const match = reg.exec(this.source);
            if (match && (!isMatchStart || this.index === match.index)) {
                this.index = reg.lastIndex;
                return match;
            }
        }
        ;
    }
    /**
     * 读取ident
     * 这里的 ident 指标识符(identifier)，也就是通常意义上的变量名
     * 这里默认的变量名规则为：由美元符号($)、数字、字母或者下划线(_)构成的字符串
     *
     * @inner
     * @param walker 源码读取对象
     * @return {string}
     */
    function readIdent(walker) {
        const match = walker.match(/\s*([$0-9a-z_]+)/ig, true);
        if (!match) {
            throw new Error('[SAN_SSR FATAL] expect an identifier: ' + walker.source.slice(walker.index));
        }
        return match[1];
    }
    /**
     * 读取字符串
     *
     * @param walker 源码读取对象
     */
    function readString(walker) {
        const startChar = walker.source.charAt(walker.index);
        const index = walker.source.indexOf(startChar, walker.index + 1);
        if (index === -1) {
            throw new Error('[SAN_SSR FATAL] expect a string: ' + walker.source.slice(walker.index));
        }
        const value = walker.source.slice(walker.index + 1, index);
        walker.index = index + 1;
        return value;
    }
    /**
     * 读取访问表达式
     *
     * @param walker 源码读取对象
     * @return {Object}
     */
    function readAccessor(walker) {
        const firstSeg = readIdent(walker);
        const result = [
            firstSeg
        ];
        while (walker.index < walker.len) {
            switch (walker.source.charCodeAt(walker.index)) {
                case 46: // .
                    walker.index++;
                    // ident as string
                    result.push(readIdent(walker));
                    break;
                case 91: { // [
                    walker.index++;
                    let currentCode = walker.source.charCodeAt(walker.index);
                    if (currentCode >= 48 && currentCode <= 57) { // 0-9
                        result.push(+(walker.match(/[0-9]+(\.[0-9]+)?/g, true)[0]));
                    }
                    else if (currentCode === 34 || currentCode === 39) {
                        result.push(readString(walker));
                    }
                    else {
                        throw new Error('[SAN_SSR FATAL] identifier is not support: ' + walker.source.slice(walker.index));
                    }
                    currentCode = walker.source.charCodeAt(walker.index);
                    if (currentCode !== 93) {
                        throw new Error('[SAN_SSR FATAL] expect ]: ' + walker.source.slice(walker.index));
                    }
                    walker.index++;
                    break;
                }
                default:
                    throw new Error('[SAN_SSR FATAL] expect . or [: ' + walker.source.slice(walker.index));
            }
        }
        return result;
    }
    /**
     * SSR 期间的 Data 实现，替代 import('san').SanSSRData
     *
     * * 不涉及视图更新
     * * 便于编译期优化
     */
    class SanSSRData {
        constructor(data, instance) {
            this.raw = data;
            this.instance = instance;
        }
        get(path) {
            var _a;
            if (arguments.length === 0)
                return this.raw;
            if ((_a = this.instance.computed) === null || _a === void 0 ? void 0 : _a[path]) {
                return this.instance.computed[path].call(this.instance);
            }
            let res = this.raw;
            const paths = this.parseExpr(path);
            for (let i = 0; i < paths.length; i++) {
                const p = paths[i];
                if (res == null) {
                    break;
                }
                res = res[p];
            }
            return res;
        }
        set(path, value) {
            const seq = this.parseExpr(path);
            let parent = this.raw;
            for (let i = 0; i < seq.length - 1; i++) {
                const name = seq[i];
                if (parent[name]) {
                    parent = parent[name];
                }
                else {
                    return null;
                }
            }
            parent[seq.pop()] = value;
            return value;
        }
        removeAt(path, index) {
            const value = this.get(path);
            if (value && value.splice)
                value.splice(index, 1);
        }
        parseExpr(expr) {
            return readAccessor(new Walker(expr));
        }
    }
    exports.SanSSRData = SanSSRData;
    /**
     * 创建 Data 代理对象，拦截处理 computed 字段，用于 proxy api
     * @param instance
     * @returns
     */
    SanSSRData.createDataProxy = function (instance) {
        const computedFields = new Set((Object.keys(instance.computed || {})));
        return new Proxy(instance.data.raw, {
            get(target, prop) {
                if (computedFields.has(prop)) {
                    return instance.computed[prop].call(instance);
                }
                return target[prop];
            },
            set(target, prop, value) {
                if (!computedFields.has(prop)) {
                    target[prop] = value;
                }
                return true;
            }
        });
    };
    //# sourceMappingURL=san-ssr-data.js.map
    
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createResolver = void 0;
    function createResolver(exports, require) {
        const renderCache = {};
        return {
            getRenderer: function ({ id, specifier = '.' }, tagName, context) {
                const customSSRFilePath = context && context.customSSRFilePath;
                const cacheKey = id + '  ' + specifier;
                // 没有自定义时，尝试缓存
                if (!customSSRFilePath && renderCache[cacheKey]) {
                    return renderCache[cacheKey];
                }
                let mod;
                if (specifier === '.') {
                    mod = exports;
                }
                else {
                    let path;
                    if (customSSRFilePath) {
                        path = customSSRFilePath({ id, specifier, tagName });
                    }
                    mod = require(path || specifier);
                }
                if (!customSSRFilePath) {
                    renderCache[cacheKey] = mod.sanSSRRenders[id];
                }
                return mod.sanSSRRenders[id];
            },
            getChildComponentClass: function ({ id, specifier = '.' }, instance, tagName, context) {
                var _a, _b;
                const customComponentFilePath = context && context.customComponentFilePath;
                const pro = Object.getPrototypeOf(instance);
                if (!pro.__componentClassCache) {
                    pro.__componentClassCache = {};
                }
                const componentClassCache = pro.__componentClassCache;
                const cacheKey = tagName;
                // 没有自定义时，尝试缓存
                if (!customComponentFilePath && componentClassCache[cacheKey]) {
                    return componentClassCache[cacheKey];
                }
                if (customComponentFilePath && specifier !== '.') {
                    const path = customComponentFilePath({ id, specifier, tagName });
                    if (typeof path === 'string')
                        return id === 'default' ? require(path) : require(path)[id];
                    // 可以直接返回一个组件类
                    else if (typeof path === 'function')
                        return path;
                }
                const components = instance.components ||
                    (instance.prototype && instance.prototype.components);
                const ChildComponentClassOrInstance = components && components[tagName];
                if (!ChildComponentClassOrInstance) {
                    throw Error(`child component is not fount: ${tagName}${((_a = instance.prototype) === null || _a === void 0 ? void 0 : _a.id) || ''}`);
                }
                if (typeof ChildComponentClassOrInstance === 'string' && ChildComponentClassOrInstance === 'self') {
                    componentClassCache[cacheKey] = instance;
                    return instance;
                }
                // component loader
                if (Object.prototype.hasOwnProperty.call(ChildComponentClassOrInstance, 'load') &&
                    Object.prototype.hasOwnProperty.call(ChildComponentClassOrInstance, 'placeholder')) {
                    componentClassCache[cacheKey] = ChildComponentClassOrInstance.placeholder;
                    return ChildComponentClassOrInstance.placeholder;
                }
                if (typeof ChildComponentClassOrInstance !== 'function' &&
                    typeof ChildComponentClassOrInstance !== 'object') {
                    throw Error(`external component is not provided: ${tagName}${((_b = instance.prototype) === null || _b === void 0 ? void 0 : _b.id) || ''}`);
                }
                componentClassCache[cacheKey] = ChildComponentClassOrInstance;
                return ChildComponentClassOrInstance;
            },
            setRenderer: function (id, fn) {
                exports.sanSSRRenders = exports.sanSSRRenders || {};
                exports.sanSSRRenders[id] = fn;
            },
            getPrototype: function (id) {
                return this['prototypes'][id];
            },
            setPrototype: function (id, proto) {
                this['prototypes'][id] = proto;
            },
            prototypes: {}
        };
    }
    exports.createResolver = createResolver;
    //# sourceMappingURL=resolver.js.map
    
    return exports;
})({});
const sanSSRResolver = sanSSRHelpers.createResolver(exports, require);
"use strict";
Object.defineProperty(exports, "__esModule", {
  value: true
});
const san_1 = require("san");
class MyComponent extends san_1.Component {
  initData() {
    return {
      lastName: 'Doe',
      ssr: {
        count: 1
      }
    };
  }
  inited() {
    this.data.raw.ssr.initedProxy = 'inited-proxy';
    this.data.set('ssr.initedSet', 'inited-set');
    this.data.raw.list.push(1);
    const field = 'count';
    this.data.raw['ssr'][field] += 1;
    const a = function () {
      this.d.ssr.notTransformed = this.d.computedValue + this.d.list.length;
    };
    a.call(this);
  }
  _ssrHasDynamicThis = true;
}
exports.default = MyComponent;
MyComponent.computed = {
  name() {
    const f = this.data.raw.firstName;
    const l = this.data.raw.lastName;
    return `${f} ${l}`;
  },
  computedValue() {
    return 1;
  }
}
sanSSRResolver.setPrototype("default", sanSSRHelpers._.createInstanceFromClass(MyComponent));
sanSSRResolver.setRenderer("default", function  (data, ...info) {
    if (info.length === 1) {
        info = info[0] || {};
    }
    else {
        info = {noDataOutput: info[1], parentCtx: info[2], tagName: info[3], slots: info[4]};
    }
    let noDataOutput = info.noDataOutput == null ? false : info.noDataOutput
    let parentCtx = info.parentCtx == null ? null : info.parentCtx
    let tagName = info.tagName == null ? "div" : info.tagName
    let slots = info.slots == null ? {} : info.slots
    let attrs = info.attrs == null ? [] : info.attrs
    let inheritAttrs = true
    let autoFillStyleAndId = true
    if (inheritAttrs === false) {
        attrs.length = 0;
    }
    if (autoFillStyleAndId === false) {
        data.id = "";
        data.style = "";
        data.class = "";
    }
    let renderOnly = !!info.renderOnly
    if (renderOnly && !info.isChild) {
        attrs.push("data-sanssr=\"render-only\"");
    }
    const _ = sanSSRHelpers._;
    let _attrFilter = _.attrFilter
    let _escapeHTML = _.escapeHTML
    let _classFilter = _.classFilter
    let _styleFilter = _.styleFilter
    let _iterate = _.iterate
    let _output = _.output
    const SanSSRData = sanSSRHelpers.SanSSRData;
    let instance = _.createFromPrototype(sanSSRResolver.getPrototype("default"));
    instance.data = new SanSSRData(data, instance);
    instance.sourceSlots = _.mergeChildSlots(slots);
    instance.lifeCycle = {compiled: true, inited: false};
    if (parentCtx) {
        instance.parentComponent = parentCtx.instance;
    }
    let refs = {}
    let ctx = {instance, slots, data, parentCtx, refs, context: parentCtx && parentCtx.context}
    let initData
    try {
        initData = instance.initData();
    }
    catch (e) {
        _.handleError(e, instance, "initData");
    }
    if (null == initData) {
        initData = {};
    }
    for (let [key, value] of _.iterate(initData)) {
        ctx.data[key] = ctx.data[key] !== undefined ? ctx.data[key] : value;
    }
    if (instance._ssrHasDynamicThis === true) {
        instance.d = SanSSRData.createDataProxy(instance);
    }
    ctx.dataBeforeInit = _.cloneDeep(ctx.data);
    try {
        instance.inited();
    }
    catch (e) {
        _.handleError(e, instance, "hook:inited");
    }
    data.name = _.callComputed(ctx, "name");
    data.computedValue = _.callComputed(ctx, "computedValue");
    instance.lifeCycle.inited = true;
    let html = ""
    parentCtx = ctx;
    html += "<div";
    html += _attrFilter("class", _escapeHTML(_classFilter(_.xclassFilter(ctx.data.class))), false);
    html += _attrFilter("style", _escapeHTML(_styleFilter(_.xstyleFilter(ctx.data.style))), false);
    html += _attrFilter("id", _escapeHTML(ctx.data.id), false);
    if (attrs && attrs.length) {
        html += " ";
        html += attrs.join(" ");
    }
    html += ">";
    if (!noDataOutput && !renderOnly) {
        let sData = info.renderOnly ? ctx.dataBeforeInit : info.rootOutputData || _.getRootCtx(ctx).dataBeforeInit
        if (info.outputData) {
            sData = typeof (info.outputData) === "function" ? info.outputData(sData) : info.outputData;
        }
        html += "<!--s-data:";
        html += JSON.stringify(sData).replace(/(?<=-)-/g, "\\-");
        html += "-->";
    }
    html += "<h1>";
    html += _output(ctx.data.name, true) + (" - ") + (_output(ctx.data.ssr.initedProxy, true)) + (" - ") + (_output(ctx.data.ssr.initedSet, true)) + (" - ") + (_output(ctx.data.ssr.count, true)) + (" - ") + (_output(ctx.data.ssr.notTransformed, true));
    html += "</h1></div>";
    return html;
});
module.exports = Object.assign(sanSSRResolver.getRenderer({id:"default"}), exports)
