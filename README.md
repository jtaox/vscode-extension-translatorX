# vscode-translatorx

[![version](https://vsmarketplacebadge.apphb.com/version/jiangtao.vscode-translatorx.svg)](https://marketplace.visualstudio.com/items?itemName=jiangtao.vscode-translatorx)


- [x] 支持百度翻译
- [x] 支持有道翻译(需要注册[有道智云](https://ai.youdao.com/)，申请appkey和secret)
- [x] 支持翻译结果快速替换


## 使用

`ctrl + shift + p`调用出命令面板，键入`translatorX`选择开启或关闭插件.

![example](https://github.com/jtaox/vscode-extension-translatorX/blob/master/assets/example.gif?raw=true)

![example](https://github.com/jtaox/vscode-extension-translatorX/blob/master/assets/example_1.gif?raw=true)


在`设置->扩展->TranslatorX`可单独开启或关闭有道翻译、百度翻译。如果开启有道翻译，需在设置中配置有道api所需的 appKey 和 secret，获取方式查看[https://ai.youdao.com/](https://ai.youdao.com/)

当开启有道翻译时，可通过快捷键shift + cmd + R 快速替换翻译结果，替换规则:`result[i++ % result.length]`