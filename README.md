# VCC Auto Translate

![GitHub go.mod Go version](https://img.shields.io/github/go-mod/go-version/gizmo-ds/vcc-auto-translate?style=flat-square)
[![Release](https://img.shields.io/github/v/release/gizmo-ds/vcc-auto-translate.svg?include_prereleases&style=flat-square)](https://github.com/gizmo-ds/vcc-auto-translate/releases/latest)
[![License](https://img.shields.io/github/license/gizmo-ds/vcc-auto-translate?style=flat-square)](./LICENSE)
![简体中文](<https://img.shields.io/badge/dynamic/json?color=blue&label=%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87&style=flat-square&logo=crowdin&query=%24.progress[?(@.data.languageId==%27zh-CN%27)].data.translationProgress&url=https%3A%2F%2Fbadges.awesome-crowdin.com%2Fstats-15293064-658026.json>)
![正體中文](<https://img.shields.io/badge/dynamic/json?color=blue&label=%E6%AD%A3%E9%AB%94%E4%B8%AD%E6%96%87&style=flat-square&logo=crowdin&query=%24.progress[?(@.data.languageId==%27zh-TW%27)].data.translationProgress&url=https%3A%2F%2Fbadges.awesome-crowdin.com%2Fstats-15293064-658026.json>)

VCC(VRChat Creator Companion) 的翻译脚本, 用于自动翻译 VCC 的界面.

> [!NOTE]  
> [v1.3.0](https://github.com/gizmo-ds/vcc-auto-translate/releases/tag/v1.3.0-beta) 以后的版本不再对 VCC v2.2.2
> 以前的版本进行适配, 如有需要使用旧版本, 请下载`v1.3.0`之前的版本.

## Screenshots

![Screenshot 1](images/screenshot_1.png)

![Screenshot 2](images/screenshot_2.png)

## 自动安装

你可以通过 [Release](https://github.com/gizmo-ds/vcc-auto-translate/releases/latest) 下载预编译的安装工具并运行,
该工具会自动安装翻译脚本.  
如果出现错误, 请尝试将安装工具移动到 VCC 安装目录下运行. (与`CreatorCompanion.exe`同目录)

> [!IMPORTANT]  
> VCC Beta 版本必须将安装工具移动到 VCC Beta 目录下运行. (与`CreatorCompanionBeta.exe`同目录)

## 如何移除翻译脚本?

1. 删除 `[VCC安装目录]/WebApp/Dist` 目录下的 `index.html` 文件
2. 将 `[VCC安装目录]/WebApp/Dist` 目录下的 `index.html.backup` 重命名为 `index.html`

## 手动编译并安装

环境要求:

- [Go 1.20+](https://go.dev/doc/install)
- [node + package manager](https://nodejs.org/) / [bun](https://bun.sh/)
- [make](https://duckduckgo.com/?q=make+install) (可选)
- [upx](https://github.com/upx/upx/releases/latest) (可选)

如果你有安装`make`工具, 你只需要执行`make`命令即可完成编译, 你可以在`build`目录找到自动安装工具.  
如果你不使用`make`工具的话可以参考[Makefile](./Makefile)文件进行手动编译.

## 类似的项目

- [VRChat-Creator-Companion-zh-CN](https://github.com/Sonic853/VRChat-Creator-Companion-zh-CN)

## 贡献者

![Contributors](https://contributors.aika.dev/gizmo-ds/vcc-auto-translate/contributors.svg?align=left)

## Sponsors

[![Sponsors](https://afdian-connect.deno.dev/sponsor.svg)](https://afdian.net/a/gizmo)

## Thanks

Thanks to [JetBrains](https://jb.gg/OpenSourceSupport) for the open source license(s).

![JetBrains Logo (Main) logo](https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.svg)

## License

Code is distributed under [MIT](./LICENSE) license, feel free to use it in your proprietary projects as well.
