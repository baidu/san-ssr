/**
 * 文档配置
 * @author kidnes
 */
'use strict';

module.exports = {
    base: '/san-ssr/',
    title: 'San-SSR',
    head: [
        ['link', {rel: 'icon', href: '/san-ssr/favicon.ico'}]
    ],
    meta: {
        description: 'San-SSR 文档'
    },
    dest: '../docs',
    theme: '@sdoc/theme-default',
    themeConfig: {
        nav: [
            {text: 'GitHub', link: 'https://github.com/baidu/san-ssr'}
        ],
        sidebar: {
            '/': [
                {
                    title: 'Documentation',
                    children: [
                        {
                            path: '/',
                            title: '介绍',
                            filename: 'documentation/index.md'
                        },
                        '/documentation/quick-start/',
                        '/documentation/precompile/',
                        '/documentation/types-of-input/',
                        '/documentation/lifecycle/',
                        '/documentation/ways-to-write-components/'
                    ]
                },
                {
                    title: 'Guide',
                    children: [
                        '/guide/use-san-store/',
                        '/guide/custom-components-path/',
                        '/guide/use-outside-component/',
                        '/guide/mark-external-component/',
                    ]
                },
                {
                    title: 'Under the hood',
                    children: [
                        '/under-the-hood/how-san-ssr-use-component-class/'
                    ]
                }
            ]
        }
    }
};