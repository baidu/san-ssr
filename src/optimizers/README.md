# Renderer AST 的优化器

## 运行阶段

优化器的工作阶段如下：

```
源文件->ComponentInfo->renderer AST->优化器->renderer 代码
                                     ↑↑↑↑↑↑
```

## 任务列表

由于优化在目标代码生成之前，这里的优化适用于所有目标代码生成器。可以做的包括：

- 【可读性】把 foo['bar']['coo'] 改成 foo.bar.coo。已完成
- 【性能】合并连续的 html += 字面量字符串。已完成
- 【移除未使用的代码】
    - 通用：做了一个变量，后续没有用到。比如 for 的 index。
    - SSR 业务相关：比如 template 里没有插值，可以移除 initData() 等初始化代码。
