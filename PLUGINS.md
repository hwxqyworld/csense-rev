# 如何编写Csense插件
插件应为一个ES模块，应当导出一个init函数，init函数的第一个参数为一个对象，包含了Csense收集到的引用
示例代码

```javascript
export function init(a) {
    // 以下是传入的主要模块
    a.HomeScene; //包含Csense的主界面
    a.globalState; //包含Csense收集到的各种引用
    a.patch, a.createScrollable, a.withResolvers; //Csense的工具函数
    a.manager; //可以在Csense的界面里添加条目
}
```