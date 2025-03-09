# VCC Auto Translate

[![Release](https://img.shields.io/github/v/release/gizmo-ds/vcc-auto-translate.svg?include_prereleases&style=flat-square)](https://github.com/gizmo-ds/vcc-auto-translate/releases/latest)
[![GitHub Downloads](https://img.shields.io/github/downloads/gizmo-ds/vcc-auto-translate/total?style=flat-square)](https://github.com/gizmo-ds/vcc-auto-translate/releases/latest)
[![License](https://img.shields.io/github/license/gizmo-ds/vcc-auto-translate?style=flat-square)](./LICENSE)
[![简体中文](https://img.shields.io/badge/dynamic/json?color=blue&label=%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87&style=flat-square&logo=crowdin&query=%24.progress%5B0%5D.data.translationProgress&url=https%3A%2F%2Fbadges.awesome-crowdin.com%2Fstats-15293064-658026.json)](https://zh.crowdin.com/project/vcc-auto-translate)
[![正體中文](https://img.shields.io/badge/dynamic/json?color=blue&label=%E6%AD%A3%E9%AB%94%E4%B8%AD%E6%96%87&style=flat-square&logo=crowdin&query=%24.progress%5B1%5D.data.translationProgress&url=https%3A%2F%2Fbadges.awesome-crowdin.com%2Fstats-15293064-658026.json)](https://zh.crowdin.com/project/vcc-auto-translate)

VCC(VRChat Creator Companion) 的翻译脚本, 用于自动翻译 VCC 的界面.

## 项目状态说明

本项目仍然处于正常维护状态，尽管最近没有新的提交，但这并不影响其可用性。

- **稳定性保证**：本项目使用 AST 技术实现翻译，只要 VCC 的 React 代码结构没有大规模变更，翻译功能就不会失效。
- **自动适配更新**：VCC 更新后，只需重新执行补丁安装程序，翻译即可自动应用，无需额外修改代码。
- **翻译进度**：目前 VCC 的大部分文本已完成翻译。由于缺少优秀的翻译人员，未来翻译内容的更新可能不会很频繁，但项目仍然可以正常使用。

如果您遇到任何问题，欢迎提交 Issue，我们会尽力提供支持。

## 效果图

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

- [Rust](https://www.rust-lang.org/)
- [Node.js + package manager](https://nodejs.org/) / [bun](https://bun.sh/)
- [make](https://duckduckgo.com/?q=make+install) (可选)
- [upx](https://github.com/upx/upx/releases/latest) (可选)

使用`make`工具可以更方便地进行编译, 你只需要执行`make`命令即可完成所有编译步骤. 你可以在`build`目录找到自动安装工具.

[Makefile](./Makefile) 仅在 Linux 下测试过, 如果你使用 Windows, 你可以使用 WSL 或这参考以下步骤进行手动编译.

以 PowerShell + [pnpm](https://pnpm.io/installation) 为例:

```shell
pnpm install
pnpm run build:patch-loader
Copy-Item build/patch-loader.js crates/installer/assets/patch-loader.js
cargo build --release --locked
```

编译完成后, 你可以在`target/release`目录找到编译好的自动安装工具.

## Related

- [VRChat-Creator-Companion-zh-CN](https://github.com/Sonic853/VRChat-Creator-Companion-zh-CN) - This project was
  inspired by this project.
- [CreatorCompanionPatcher](https://github.com/Misaka-L/CreatorCompanionPatcher) - A patcher that can be used in
  conjunction with this project to fix certain issues or behaviors in VRChat Creator Companion.

## Contributors

![Contributors](https://contributors.aika.dev/gizmo-ds/vcc-auto-translate/contributors.svg?align=left)

## Sponsors

[![Sponsors](https://afdian-connect.deno.dev/sponsor.svg)](https://afdian.com/a/gizmo)

## Thanks

Thanks to [JetBrains](https://jb.gg/OpenSourceSupport) for the open source license(s).

![JetBrains Logo (Main) logo](https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.svg)

## License

Code is distributed under [MIT](./LICENSE) license, feel free to use it in your proprietary projects as well.
