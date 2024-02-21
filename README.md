# VCC Auto Translate

![GitHub go.mod Go version](https://img.shields.io/github/go-mod/go-version/gizmo-ds/vcc-auto-translate?style=flat-square)
[![Release](https://img.shields.io/github/v/release/gizmo-ds/vcc-auto-translate.svg?include_prereleases&style=flat-square)](https://github.com/gizmo-ds/vcc-auto-translate/releases/latest)
[![License](https://img.shields.io/github/license/gizmo-ds/vcc-auto-translate?style=flat-square)](./LICENSE)

VCC(VRChat Creator Companion) 的翻译脚本, 用于自动翻译 VCC 的界面.

当前支持的语言:

- [简体中文](./localization/zh-hans.json)
- [繁体中文](./localization/zh-hant.json)

> **Todo**  
> [v1.3.0](https://github.com/gizmo-ds/vcc-auto-translate/releases/tag/v1.3.0-beta) 以后的版本不再对 VCC v2.2.2
> 以前的版本进行适配, 如有需要使用旧版本, 请下载`v1.3.0`之前的版本.  
> 因爲進行了較大的更新, 繁体中文的翻譯還需要一點時間.

## Screenshots

![Screenshot 1](images/screenshot_1.png)

![Screenshot 2](images/screenshot_2.png)

## 自动安装

你可以通过 [Release](https://github.com/gizmo-ds/vcc-auto-translate/releases/latest) 下载预编译的安装工具并运行,
该工具会自动安装翻译脚本.

> 如果出现错误, 请尝试将安装工具移动到 VCC 安装目录下运行. (与`CreatorCompanion.exe`同目录)

## 如何移除翻译脚本?

1. 删除 `[VCC安装目录]/WebApp/Dist/assets` 目录下的 `index-[hash].js` 文件
2. 将 `[VCC安装目录]/WebApp/Dist/assets` 目录下的 `index-[hash].js.backup` 重命名为 `index-[hash].js`

> **Note**  
> 文件名中的`[hash]`为长度8的字母和数字, 每个VCC版本都不固定

## 手动编译并安装

环境要求:

- [Go 1.20+](https://go.dev/doc/install)
- [git](https://git-scm.com/)
- [esbuild](https://esbuild.github.io/getting-started/#install-esbuild)
- [make](https://duckduckgo.com/?q=make+install) (可选)
- [upx](https://github.com/upx/upx/releases/latest) (可选)

如果你有安装`make`和`upx`, 你只需要执行`make`即可完成编译, 你可以在`build`目录找到自动安装工具.

如果你有安装`make`, 但没安装`upx`, 你可以执行`make build-script build-installer`进行编译.

如果你不使用`make`, 你可以依次执行下面的命令进行编译.

```shell
$ esbuild vcc-auto-translate.ts --bundle --minify --format=iife --platform=browser --outfile=cmd/installer/vcc-auto-translate.js
$ cp -r localization/*.json cmd/installer/localization
$ go build -trimpath -ldflags "-s -w" -o build/vcc-auto-translate-installer.exe cmd/installer/main.go
```

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
