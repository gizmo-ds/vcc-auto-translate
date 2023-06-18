package utils

import (
	"fmt"
	"strings"
)

type M map[string]any

var locales = M{
	"banner": M{
		"en": "VCC Auto Translate installer\n\n" +
			"This installer will add the VCC Auto Translate script to your VCC installation.\n" +
			"Source code: https://github.com/gizmo-ds/vcc-auto-translate\n\n",
		"zh": "VCC Auto Translate 安装程序\n\n" +
			"此安装程序将向您的 VCC 安装添加 VCC Auto Translate 脚本。\n" +
			"源代码：https://github.com/gizmo-ds/vcc-auto-translate\n\n",
	},
	"error": M{
		"zh": "错误: %s",
		"en": "Error: %s",
	},
	"vcc-path": M{
		"zh": "VCC 安装路径: %s",
		"en": "VCC install path: %s",
	},
	"install-success": M{
		"en": "Installed successfully",
		"zh": "安装成功",
	},
	"pause": M{
		"zh": "按回车键退出...",
		"en": "Press enter to exit...",
	},
	"webapp-notfound": M{
		"zh": "WebApp目录未找到",
		"en": "WebApp not found",
	},
}

var userLocale = "en"

func init() {
	if locale, err := GetUserDefaultLocale(); err == nil {
		userLocale = strings.Split(locale, "-")[0]
	}
}

func T(k string, v ...any) string {
	l, ok := locales[k].(M)
	if !ok {
		return fmt.Sprint(k, v)
	}
	lt, ok := l[userLocale].(string)
	if !ok {
		return fmt.Sprint(k, v)
	}
	return fmt.Sprintf(lt, v...)
}
