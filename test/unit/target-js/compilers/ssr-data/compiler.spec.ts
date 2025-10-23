import san from 'san'
import { DYNAMIC_THIS_FLAG } from '../../../../../src/compilers/reserved-names'
import { transformDataProxy } from '../../../../../src/target-js/compilers/ssr-data/compiler'

function trimCode (code: string): string {
    return code.replace(/\s+/g, ' ').trim()
}

describe('target-js/compilers/ssr-data/compiler.ts', () => {
    describe('#transformDataProxy: data', () => {
        it('return original code if no Component Name', () => {
            const code1 = `class MyClass {
                static template = '<div></div>';
                inited() {}
                created() {}
                attached() {}
                detached() {}
                disposed() {}
                updated() {}
                notHook() {}
            }`
            expect(trimCode(transformDataProxy(code1, { sourceType: 'class', componentInfos: {} }).code))
                .toBe(trimCode(code1))
        })

        it('remove template, hooks', () => {
            const code1 = `class MyClass extends san.Component {
                static template = '<div></div>';
                inited() {
                    this.notHook();
                }
                created() {}
                attached() {}
                detached() {}
                disposed() {}
                updated() {}
                notHook() {}
            }`
            expect(trimCode(transformDataProxy(code1, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(`class MyClass extends san.Component {
                    inited() {
                        this.notHook();
                    }
                    notHook() {}
                }`))

            const code10 = `class MyClass extends san.Component {
                static template = \`<div></div>\`;
                inited() {
                    this.notHook();
                }
                notCalled() {}
                notHook() {}
            }`
            expect(trimCode(transformDataProxy(code10, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(`class MyClass extends san.Component {
                    inited() {
                        this.notHook();
                    }
                    notHook() {}
                }`))

            const code11 = `class MyClass extends san.Component {
                inited() {
                    this.notHook();
                }
                created() {}
                attached() {}
                detached() {}
                disposed() {}
                updated() {}
                notHook() {}
            }
            MyClass.template = '<div></div>';
            `
            expect(trimCode(transformDataProxy(code11, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(`class MyClass extends san.Component {
                    inited() {
                        this.notHook();
                    }
                    notHook() {}
                }`))

            const code2 = `defineComponent({
                template: '<div></div>',
                inited() {
                    this.notHook();
                },
                created() {},
                attached() {},
                detached() {},
                disposed() {},
                updated() {},
                notHook() {}
            })`
            expect(trimCode(transformDataProxy(code2, { sourceType: 'defineComponent', componentInfo: {} }).code))
                .toBe(trimCode(`defineComponent({
                inited() {
                    this.notHook();
                },
                notHook() {}
            })`))

            const code3 = `defineComponent({
                template: \`<div></div>\`,
                inited() {
                    this.notHook();
                },
                notCalled() {},
                notHook() {}
            })`
            expect(trimCode(transformDataProxy(code3, { sourceType: 'defineComponent', componentInfo: {} }).code))
                .toBe(trimCode(`defineComponent({
                inited() {
                    this.notHook();
                },
                notHook() {}
            })`))
        })

        it('remove defineComponent in mixed sourceType', () => {
            const code = `
            class MyComponent extends san.Component {
                prop1 = 'value1';
                static prop2 = 'value2';
                initData() { return {}; }
                inited() {}
                static template = '<div></div>';
            }
            module.exports = defineComponent({
                components: {MyComponent},
                template: '<div></div>'
            })`
            expect(trimCode(transformDataProxy(code, { sourceType: 'mixed', componentInfos: {} }).code))
                .toBe(trimCode(`
            class MyComponent extends san.Component {
                prop1 = 'value1';
                static prop2 = 'value2';
                initData() { return {}; }
                inited() {}
                static template = '<div></div>';
            }
            module.exports = {}`))
        })

        it('defineComponent throw error in SpreadElement', () => {
            const code = `module.exports = defineComponent({
                ...abc
            })`
            expect(() => transformDataProxy(code, { sourceType: 'mixed', componentInfos: {} }))
                .toThrowError('Spread element in defineComponent is not supported.')
        })

        it('defineComponent throw error in SpreadElement', () => {
            const code = `module.exports = defineComponent({
                ...abc
            })`
            expect(() => transformDataProxy(code, { sourceType: 'defineComponent', componentInfo: {} }))
                .toThrowError('Spread element in defineComponent is not supported.')
        })

        it('computed throw error in SpreadElement', () => {
            const code = `class A extends san.Component {
                static computed = {
                    ...abc
                }
            }`
            expect(() => transformDataProxy(code, { sourceType: 'class', componentInfos: { A: {} } }))
                .toThrowError('Spread element in computed is not supported.')
            const code1 = `module.exports = defineComponent({
                computed: {
                    ...abc
                }
            })`
            expect(() => transformDataProxy(code1, { sourceType: 'defineComponent', componentInfo: {} }))
                .toThrowError('Spread element in computed is not supported.')
        })

        it('return original code if no component name', () => {
            const code1 = `class MyClass extends san.Component {
                inited() {
                    this.d.message = 'Hello World';
                }
                computed = {
                    newMessage() {
                        return this.d.message + 'New';
                    }
                }
                filters = {
                    newMessage() {
                        return 1;
                    }
                }
            }`
            expect(transformDataProxy(code1, { sourceType: 'class', componentInfos: {} }).code).toBe(code1)
        })

        it('transform no data get/set', () => {
            const code = `class MyClass extends san.Component {
                abc() {}
            }`
            const output = 'class MyClass extends san.Component {}'
            expect(trimCode(transformDataProxy(code, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output))

            const code1 = `module.exports = san.defineComponent({
                abc() {}
            })`
            const output1 = 'module.exports = san.defineComponent({})'
            expect(trimCode(transformDataProxy(code1, { sourceType: 'defineComponent', componentInfo: {} }).code))
                .toBe(trimCode(output1))
        })

        it('transform class data proxy', () => {
            const code = `class MyClass extends san.Component {
                inited() {
                    this.d.ssr.count = 1;
                    this.d.ssr.message = this.d.ssr.count + 'Hello World';
                    this.d.ssr.list.push('test');
                    this.d.ssr.list.unshift('test');
                    this.d.ssr.list.pop();
                    this.d.ssr.list.shift();
                    this.d.ssr.list.splice(0, 1);
                    Object.assign(this.d, { a: 1 });
                    Object.assign(this.d.obj1, { a: 1 }, { b: 1 });
                    const newMessage = this.d.newMessage + this.d[xxx].abc + 'New';
                    callback(this.d[xxx]);
                    callback(this.d[xxx].abc);
                    this.d[xxx] = 1;
                }
                static computed = {
                    newMessage() {
                        this.d.ssr = 1;
                        return this.d.ssr.message + 'New';
                    }
                }
                static filters = {
                    fitler1(val) {
                        this.d.ssr = 1;
                        return val + this.d.ssr.list.length + this.d.newMessage;
                    }
                }
            }`
            const output = `class MyClass extends san.Component {
                inited() {
                    this.data.raw.ssr.count = 1;
                    this.data.raw.ssr.message = this.data.raw.ssr.count + 'Hello World';
                    this.data.raw.ssr.list.push('test');
                    this.data.raw.ssr.list.unshift('test');
                    this.data.raw.ssr.list.pop();
                    this.data.raw.ssr.list.shift();
                    this.data.raw.ssr.list.splice(0, 1);
                    Object.assign(this.data.raw, { a: 1 });
                    Object.assign(this.data.raw.obj1, { a: 1 }, { b: 1 });
                    const newMessage = this.data.get("newMessage") + this.data.get(\`\${xxx}\`).abc + 'New';
                    callback(this.data.get(\`\${xxx}\`));
                    callback(this.data.get(\`\${xxx}\`).abc);
                    this.data.raw[xxx] = 1;
                }
                static computed = {
                    newMessage() {
                        this.d.ssr = 1;
                        return this.data.raw.ssr.message + 'New';
                    }
                };
                static filters = {
                    fitler1(val) {
                        this.d.ssr = 1;
                        return val + this.data.raw.ssr.list.length + this.data.get("newMessage");
                    }
                };
            }`
            expect(trimCode(transformDataProxy(code, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output))
        })

        it('transform defineComponent data proxy', () => {
            const code = `const A = san.defineComponent({
                inited() {
                    this.d.ssr.count = 1;
                    this.d.ssr.message = this.d.ssr.count + 'Hello World';
                    this.d.ssr.list.push('test');
                    this.d.ssr.list.unshift('test');
                    this.d.ssr.list.pop();
                    this.d.ssr.list.shift();
                    this.d.ssr.list.splice(0, 1);
                    Object.assign(this.d, { a: 1 });
                    Object.assign(this.d.obj1, { a: 1 }, { b: 1 });
                    const newMessage = this.d.newMessage + this.d[xxx].abc + 'New';
                },
                computed: {
                    newMessage() {
                        return this.d.ssr.message + 'New';
                    }
                },
                filters: {
                    fitler1(val) {
                        return val + this.d.ssr.list.length + this.d.newMessage;
                    }
                }
            })`
            const output = `const A = san.defineComponent({
                inited() {
                    this.data.raw.ssr.count = 1;
                    this.data.raw.ssr.message = this.data.raw.ssr.count + 'Hello World';
                    this.data.raw.ssr.list.push('test');
                    this.data.raw.ssr.list.unshift('test');
                    this.data.raw.ssr.list.pop();
                    this.data.raw.ssr.list.shift();
                    this.data.raw.ssr.list.splice(0, 1);
                    Object.assign(this.data.raw, { a: 1 });
                    Object.assign(this.data.raw.obj1, { a: 1 }, { b: 1 });
                    const newMessage = this.data.get("newMessage") + this.data.get(\`\${xxx}\`).abc + 'New';
                },
                computed: {
                    newMessage() {
                        return this.data.raw.ssr.message + 'New';
                    }
                },
                filters: {
                    fitler1(val) {
                        return val + this.data.raw.ssr.list.length + this.data.get("newMessage");
                    }
                }
            })`
            expect(trimCode(transformDataProxy(code, { sourceType: 'defineComponent', componentInfo: { } }).code))
                .toBe(trimCode(output))
        })

        it('transform class data get/set', () => {
            const code = `class MyClass extends san.Component {
                inited() {
                    this.data.set('ssr', 1);
                    this.data.set('ssr.count', 1);
                    const a = this.data.get('ssr.list.length')
                    this.data.get(ssr);
                    this.method.call([this]);
                    this.data.push('ssr.list', 1);
                    this.data.pop('ssr.list');
                    this.data.splice('ssr.list', 0, 1);

                }
                static computed = {
                    newMessage() {
                        return this.data.get('ssr.message') + this.d.ssr.list + 'New';
                    }
                };
                static filters = {
                    fitler1(val) {
                        return val + this.data.get('ssr.list').length + this.data.get('newMessage') + this.d.newMessage;
                    }
                };
            }`
            const output = `class MyClass extends san.Component {
                inited() {
                    this.data.raw.ssr = 1;
                    this.data.set('ssr.count', 1);
                    const a = this.data.raw.ssr?.list?.length;
                    this.data.get(ssr);
                    this.method.call([this]);
                    this.data.push('ssr.list', 1);
                    this.data.pop('ssr.list');
                    this.data.splice('ssr.list', 0, 1);
                }
                static computed = {
                    newMessage() {
                        return this.data.raw.ssr?.message + this.data.raw.ssr.list + 'New';
                    }
                };
                static filters = {
                    fitler1(val) {
                        return val + this.data.raw.ssr?.list.length + this.data.get('newMessage') + this.data.get("newMessage");
                    }
                };
            }`
            expect(trimCode(transformDataProxy(code, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output))
        })

        it('transform defineComponent data get/set', () => {
            const code = `A = san.defineComponent({
                inited() {
                    this.data.set('ssr', 1);
                    this.data.set('ssr.count', 1);
                    const a = this.data.get('ssr.list.length')
                    this.data.get(ssr);
                    this.method.call([this]);
                },
                computed: {
                    newMessage() {
                        return this.data.get('ssr.message') + 'New';
                    }
                },
                filters: {
                    fitler1(val) {
                        return val + this.data.get('ssr.list').length + this.data.get('newMessage');
                    }
                }
            })`
            const output = `A = san.defineComponent({
                inited() {
                    this.data.raw.ssr = 1;
                    this.data.set('ssr.count', 1);
                    const a = this.data.raw.ssr?.list?.length;
                    this.data.get(ssr);
                    this.method.call([this]);
                },
                computed: {
                    newMessage() {
                        return this.data.raw.ssr?.message + 'New';
                    }
                },
                filters: {
                    fitler1(val) {
                        return val + this.data.raw.ssr?.list.length + this.data.get('newMessage');
                    }
                }
            })`
            expect(trimCode(transformDataProxy(code, { sourceType: 'defineComponent', componentInfo: { } }).code))
                .toBe(trimCode(output))
        })

        it('should not transform inside function expression', () => {
            const code = `class MyClass extends san.Component {
                inited() {
                    request().then(() => {
                        this.data.set('ssr', this.data.get('ssr.count'));
                    });
                    // no transform inside function expression
                    request().then(function () {
                        this.data.set('ssr', this.data.get('ssr.count'));
                    });
                }
            }`
            const output = `class MyClass extends san.Component {
                inited() {
                    request().then(() => {
                        this.data.raw.ssr = this.data.raw.ssr?.count;
                    });
                    request().then(function () {
                        this.data.set('ssr', this.data.get('ssr.count'));
                    });
                }
                ${DYNAMIC_THIS_FLAG} = true;
            }`
            expect(trimCode(transformDataProxy(code, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output))
            const code1 = `defineComponent({
                inited() {
                    request().then(() => {
                        this.data.set('ssr', this.data.get('ssr.count'));
                    });
                    // no transform inside function expression
                    request().then(function () {
                        this.data.set('ssr', this.data.get('ssr.count'));
                    });
                }
            })`
            const output1 = `defineComponent({
                inited() {
                    request().then(() => {
                        this.data.raw.ssr = this.data.raw.ssr?.count;
                    });
                    request().then(function () {
                        this.data.set('ssr', this.data.get('ssr.count'));
                    });
                },
                ${DYNAMIC_THIS_FLAG}: true
            })`
            expect(trimCode(transformDataProxy(code1, { sourceType: 'defineComponent', componentInfo: { } }).code))
                .toBe(trimCode(output1))
        })
    })

    describe('#transformDataProxy: dynamic this', () => {
        it('should add dynamic this flag when computed and filters is not object', () => {
            const code = `class MyClass extends san.Component {
                inited() {}
            }
            MyClass.computed = abc;
            `
            const output = `class MyClass extends san.Component {
                inited() {}
                ${DYNAMIC_THIS_FLAG} = true;
            }
            MyClass.computed = abc`
            expect(trimCode(transformDataProxy(code, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output))

            const code1 = `class MyClass extends san.Component {
                inited() {}
            }
            MyClass.filters = abc;
            `
            const output1 = `class MyClass extends san.Component {
                inited() {}
                ${DYNAMIC_THIS_FLAG} = true;
            }
            MyClass.filters = abc`
            expect(trimCode(transformDataProxy(code1, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output1))

            const code2 = `class MyClass extends san.Component {
                inited() {}
            }
            MyClass.prototype.computed = abc;
            `
            const output2 = `class MyClass extends san.Component {
                inited() {}
                ${DYNAMIC_THIS_FLAG} = true;
            }
            MyClass.prototype.computed = abc`
            expect(trimCode(transformDataProxy(code2, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output2))

            const code21 = `class MyClass extends san.Component {
                static template = \`<div></div>\`;
            }
            `
            const output21 = 'class MyClass extends san.Component {}'
            expect(trimCode(transformDataProxy(code21, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output21))

            const code22 = `class MyClass extends san.Component {
                static template = \`\${abc}\`;
            }
            `
            const output22 = `class MyClass extends san.Component {
                static template = \`\${abc}\`;
                ${DYNAMIC_THIS_FLAG} = true;
            }`
            expect(trimCode(transformDataProxy(code22, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output22))

            const code23 = `class MyClass extends san.Component {
            }
            MyClass.template = abc;
            `
            const output23 = `class MyClass extends san.Component {
                ${DYNAMIC_THIS_FLAG} = true;
            }
            MyClass.template = abc`
            expect(trimCode(transformDataProxy(code23, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output23))

            const code3 = `class MyClass extends san.Component {
                inited() {}
            }
            MyClass.prototype.filters = abc;
            `
            const output3 = `class MyClass extends san.Component {
                inited() {}
                ${DYNAMIC_THIS_FLAG} = true;
            }
            MyClass.prototype.filters = abc`
            expect(trimCode(transformDataProxy(code3, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output3))

            const code31 = `class MyClass extends san.Component {
                inited() {}
            }
            MyClass.prototype.filters = { ...abc };
            `
            const output31 = `class MyClass extends san.Component {
                inited() {}
                ${DYNAMIC_THIS_FLAG} = true;
            }
            MyClass.prototype.filters = { ...abc }`
            expect(trimCode(transformDataProxy(code31, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output31))

            const code4 = `class MyClass extends san.Component {
                inited(){}
            }
            MyClass[abc] = {}
            `
            const output4 = `class MyClass extends san.Component {
                inited() {}
                ${DYNAMIC_THIS_FLAG} = true;
            }
            MyClass[abc] = {}`
            expect(trimCode(transformDataProxy(code4, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output4))

            const code5 = `class MyClass extends san.Component {
                inited(){}
            }
            MyClass.prototype[abc] = {}
            `
            const output5 = `class MyClass extends san.Component {
                inited() {}
                ${DYNAMIC_THIS_FLAG} = true;
            }
            MyClass.prototype[abc] = {}`
            expect(trimCode(transformDataProxy(code5, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output5))

            const code10 = `san.defineComponent({
                computed: abc
            })`
            const output10 = `san.defineComponent({
                computed: abc,
                ${DYNAMIC_THIS_FLAG}: true
            })`
            expect(trimCode(transformDataProxy(code10, { sourceType: 'defineComponent', componentInfo: { } }).code))
                .toBe(trimCode(output10))

            const code11 = `san.defineComponent({
                filters: abc
            })`
            const output11 = `san.defineComponent({
                filters: abc,
                ${DYNAMIC_THIS_FLAG}: true
            })`
            expect(trimCode(transformDataProxy(code11, { sourceType: 'defineComponent', componentInfo: { } }).code))
                .toBe(trimCode(output11))

            const code111 = `san.defineComponent({
                filters: { ...abc }
            })`
            const output111 = `san.defineComponent({
                filters: { ...abc },
                ${DYNAMIC_THIS_FLAG}: true
            })`
            expect(trimCode(transformDataProxy(code111, { sourceType: 'defineComponent', componentInfo: { } }).code))
                .toBe(trimCode(output111))

            const code12 = `san.defineComponent({
                [abc]: {}
            })`
            const output12 = `san.defineComponent({
                [abc]: {},
                ${DYNAMIC_THIS_FLAG}: true
            })`
            expect(trimCode(transformDataProxy(code12, { sourceType: 'defineComponent', componentInfo: { } }).code))
                .toBe(trimCode(output12))
        })

        it('should add dynamic this flag when there is this assignment', () => {
            const code = `class MyClass extends san.Component {
                inited() {
                    const a = this;
                }
            }`
            const output = `class MyClass extends san.Component {
                inited() {
                    const a = this;
                }
                ${DYNAMIC_THIS_FLAG} = true;
            }`
            expect(trimCode(transformDataProxy(code, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output))
            const code1 = `class MyClass extends san.Component {
                inited() {
                    let a;
                    a = this;
                }
            }`
            const output1 = `class MyClass extends san.Component {
                inited() {
                    let a;
                    a = this;
                }
                ${DYNAMIC_THIS_FLAG} = true;
            }`
            expect(trimCode(transformDataProxy(code1, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output1))
        })

        it('should add dynamic this flag when there is function expression', () => {
            const code = `class MyClass extends san.Component {
                inited() {
                    const a = function () {
                        const b = () => {
                            this.method();
                        };
                    };
                }
            }`
            const output = `class MyClass extends san.Component {
                inited() {
                    const a = function () {
                        const b = () => {
                            this.method();
                        };
                    };
                }
                ${DYNAMIC_THIS_FLAG} = true;
            }`
            expect(trimCode(transformDataProxy(code, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output))
        })

        it('should add dynamic this flag when there is this as params', () => {
            const code = `class MyClass extends san.Component {
                inited() {
                    this.method1();
                }
            }
            MyClass.prototype.method1 = function () {
                callback([this]);
            }
            `
            const output = `class MyClass extends san.Component {
                inited() {
                    this.method1();
                }
                ${DYNAMIC_THIS_FLAG} = true;
            }
            MyClass.prototype.method1 = function () {
                callback([this]);
            }`
            expect(trimCode(transformDataProxy(code, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output))
        })

        it('should add dynamic this flag when there is this as params in computed', () => {
            const code = `class MyClass extends san.Component {

            }
            MyClass.computed = {
                computed1() {
                    return this.d.ssr + callback.apply(null, [this]);
                }
            }
            `
            const output = `class MyClass extends san.Component {
                ${DYNAMIC_THIS_FLAG} = true;
            }
            MyClass.computed = {
                computed1() {
                    return this.data.raw.ssr + callback.apply(null, [this]);
                }
            }`
            expect(trimCode(transformDataProxy(code, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output))
        })

        it('should add dynamic this flag when there is this as params in filters', () => {
            const code = `class MyClass extends san.Component {
                static filters = {
                    filter1(val) {
                        return val + this.data.get('ssr') + callback([this]);
                    }
                };
            }
            `
            const output = `class MyClass extends san.Component {
                static filters = {
                    filter1(val) {
                        return val + this.data.raw.ssr + callback([this]);
                    }
                };
                ${DYNAMIC_THIS_FLAG} = true;
            }`
            expect(trimCode(transformDataProxy(code, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output))
        })

        it('should add dynamic this flag when there is dynamic this call', () => {
            const code = `class MyClass extends san.Component {

            }
            MyClass.filters = {
                filter1(val) {
                    return this['call']();
                }
            }
            `
            const output = `class MyClass extends san.Component {
                ${DYNAMIC_THIS_FLAG} = true;
            }
            MyClass.filters = {
                filter1(val) {
                    return this['call']();
                }
            }`
            expect(trimCode(transformDataProxy(code, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output))

            const code1 = `class MyClass extends san.Component {
                inited() {
                    this[method].call();
                }
            }
            `
            const output1 = `class MyClass extends san.Component {
                inited() {
                    this[method].call();
                }
                ${DYNAMIC_THIS_FLAG} = true;
            }`
            expect(trimCode(transformDataProxy(code1, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output1))
        })

        it('not add dynamic this flag when there is no function expression', () => {
            // not dynamicSSR
            const code1 = `class MyClass extends san.Component {
                inited() {
                    request(() => {
                        this.method1([this])
                    });
                    this.method1.call(this);
                    this.method1.bind({t: this});
                    const fn = function () {
                        const b = 1;
                    };
                }
            }
            `
            const output1 = `class MyClass extends san.Component {
                inited() {
                    request(() => {
                        this.method1([this])
                    });
                    this.method1.call(this);
                    this.method1.bind({t: this});
                    const fn = function () {
                        const b = 1;
                    };
                }
            }`
            expect(trimCode(transformDataProxy(code1, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output1))
        })
    })

    describe('#transformDataProxy: minify methods', () => {
        it('should remove not called methods', () => {
            const code = `class MyClass extends san.Component {
                constructor() {
                    this.constructorCall();
                }
                inited() {
                    this.initedCall(this.method1());
                }
                initData() {
                    this.initDataCall();
                    return {};
                }
                constructorCall(){}
                initedCall(){}
                initDataCall(){}

                method1() {
                    this.method2.call(this);
                }
                method2() {
                    this.method3.apply(this);
                }
                method3() {
                    this.method4.bind(this);
                }
                method4() {
                    this.method4.bind(this);
                }
                method5() {
                }
            }`
            const output = `class MyClass extends san.Component {
                constructor() {
                    this.constructorCall();
                }
                inited() {
                    this.initedCall(this.method1());
                }
                initData() {
                    this.initDataCall();
                    return {};
                }
                constructorCall() {}
                initedCall() {}
                initDataCall() {}

                method1() {
                    this.method2.call(this);
                }
                method2() {
                    this.method3.apply(this);
                }
                method3() {
                    this.method4.bind(this);
                }
                method4() {
                    this.method4.bind(this);
                }
            }
            `
            expect(trimCode(transformDataProxy(code, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output))

            const code1 = `san.defineComponent({
                inited() {
                    this.initedCall(this.method1());
                },
                initData() {
                    this.initDataCall();
                    return {};
                },
                initedCall() {},
                initDataCall() {},

                method1() {
                    this.method2.call(this);
                },
                method2() {
                    this.method3.apply(this);
                },
                method3() {
                    this.method4.bind(this);
                },
                method4() {
                    this.method4.bind(this);
                },
                method5() {
                }
            })`
            const output1 = `san.defineComponent({
                inited() {
                    this.initedCall(this.method1());
                },
                initData() {
                    this.initDataCall();
                    return {};
                },
                initedCall() {},
                initDataCall() {},

                method1() {
                    this.method2.call(this);
                },
                method2() {
                    this.method3.apply(this);
                },
                method3() {
                    this.method4.bind(this);
                },
                method4() {
                    this.method4.bind(this);
                }
            })`
            expect(trimCode(transformDataProxy(code1, { sourceType: 'defineComponent', componentInfo: { } }).code))
                .toBe(trimCode(output1))
        })

        it('should called methods in template', () => {
            const template = `<div s-if="tplCall1()">
                {{aaa || tplCall2(data.bbb)}}
                <div s-for="item in list[tplCall3()]"></div>
            </div>`
            const code = `class MyClass extends san.Component {
                inited() {
                    this.initedCall();
                }
                initedCall() {}
                tplCall1() {
                    this.tplCall2();
                }
                tplCall2() {}
                tplCall3() {
                    this.tplCall3Call.apply(this);
                }
                tplCall3Call() {}
                notCalled() {}
                static template=${JSON.stringify(template)};
            }`
            const output = `class MyClass extends san.Component {
                inited() {
                    this.initedCall();
                }
                initedCall() {}
                tplCall1() {
                    this.tplCall2();
                }
                tplCall2() {}
                tplCall3() {
                    this.tplCall3Call.apply(this);
                }
                tplCall3Call() {}
            }
            `
            expect(trimCode(transformDataProxy(code, {
                sourceType: 'class',
                componentInfos: {
                    MyClass: {
                        templateAst: san.parseTemplate(template)
                    }
                }
            }).code))
                .toBe(trimCode(output))
        })

        it('should not remove not called methods when minifyMethods=false', () => {
            const code = `class MyClass extends san.Component {
                inited() {
                    this.method1();
                }
                method1() {
                    this.method2.call(this);
                }
                method2() {
                    this.method3.apply(this);
                }
                method3() {
                    this.method4.bind(this);
                }
                method4() {
                    this.method4.bind(this);
                }
                method5() {
                }
            }`
            const output = `class MyClass extends san.Component {
                inited() {
                    this.method1();
                }
                method1() {
                    this.method2.call(this);
                }
                method2() {
                    this.method3.apply(this);
                }
                method3() {
                    this.method4.bind(this);
                }
                method4() {
                    this.method4.bind(this);
                }
                method5() {
                }
            }
            `
            expect(trimCode(transformDataProxy(code, {
                sourceType: 'class',
                minifyMethods: false,
                componentInfos: { MyClass: {} }
            }).code))
                .toBe(trimCode(output))

            const code1 = `san.defineComponent({
                inited() {
                    this.method1();
                },
                method1() {
                    this.method2.call(this);
                },
                method2() {
                    this.method3.apply(this);
                },
                method3() {
                    this.method4.bind(this);
                },
                method4() {
                    this.method4.bind(this);
                },
                method5() {
                }
            })`
            const output1 = `san.defineComponent({
                inited() {
                    this.method1();
                },
                method1() {
                    this.method2.call(this);
                },
                method2() {
                    this.method3.apply(this);
                },
                method3() {
                    this.method4.bind(this);
                },
                method4() {
                    this.method4.bind(this);
                },
                method5() {
                }
            })`
            expect(trimCode(transformDataProxy(code1, {
                sourceType: 'defineComponent',
                minifyMethods: false,
                componentInfo: { }
            }).code))
                .toBe(trimCode(output1))
        })

        it('should remove not called methods in computed, filters', () => {
            const code = `{
                class MyClass extends san.Component {
                    inited() {
                        this.method1();
                    }
                    method1() {}
                    method2() {}
                    method3() {
                        this.method4();
                    }
                }
                MyClass.prototype.method4 = function () {
                };
                MyClass.prototype.method5 = function () {
                };
                MyClass.prototype.computed = {
                    comp1() {
                        this.method2();
                    }
                };
                MyClass.prototype.filters = {
                    filter1() {
                        this.method3();
                    }
                };
            }`
            const output = `{
                class MyClass extends san.Component {
                    inited() {
                        this.method1();
                    }
                    method1() {}
                    method2() {}
                    method3() {
                        this.method4();
                    }
                }
                MyClass.prototype.method4 = function () {};
                MyClass.prototype.computed = {
                    comp1() {
                        this.method2();
                    }
                };
                MyClass.prototype.filters = {
                    filter1() {
                        this.method3();
                    }
                };
            }`
            expect(trimCode(transformDataProxy(code, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output))

            const code11 = `{
                class MyClass extends san.Component {
                    inited() {
                        this.method1();
                    }
                    method1() {}
                    method2() {}
                    method3() {
                        this.method4();
                    }
                }
                MyClass.prototype.method4 = function () {
                };
                MyClass.prototype.method5 = function () {
                };
                MyClass.prototype.computed = {
                    comp1() {
                        this.method2();
                    }
                };
                MyClass.prototype.filters = {
                    filter1() {
                        this.method3();
                    }
                };
            }`
            const output11 = `{
                class MyClass extends san.Component {
                    inited() {
                        this.method1();
                    }
                    method1() {}
                    method2() {}
                    method3() {
                        this.method4();
                    }
                }
                MyClass.prototype.method4 = function () {};
                MyClass.prototype.computed = {
                    comp1() {
                        this.method2();
                    }
                };
                MyClass.prototype.filters = {
                    filter1() {
                        this.method3();
                    }
                };
            }`
            expect(trimCode(transformDataProxy(code11, { sourceType: 'class', componentInfos: { MyClass: {} } }).code))
                .toBe(trimCode(output11))

            const code1 = `san.defineComponent({
                inited() {
                    this.method1();
                },
                method1() {},
                method2() {},
                method3() {
                    this.method4();
                },
                method4() {},
                method5() {},
                computed: {
                    comp1() {
                        this.method2();
                    }
                },
                filters: {
                    filter1() {
                        this.method3();
                    }
                }
            })
            `
            const output1 = `san.defineComponent({
                inited() {
                    this.method1();
                },
                method1() {},
                method2() {},
                method3() {
                    this.method4();
                },
                method4() {},
                computed: {
                    comp1() {
                        this.method2();
                    }
                },
                filters: {
                    filter1() {
                        this.method3();
                    }
                }
            })
            `
            expect(trimCode(transformDataProxy(code1, { sourceType: 'defineComponent', componentInfo: { } }).code))
                .toBe(trimCode(output1))
        })
    })
})
