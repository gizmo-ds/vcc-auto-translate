//go:generate npx -y esbuild src/index.ts --bundle --format=iife --platform=browser --outfile=vcc-auto-translate.js
package main

import (
	"bytes"
	"embed"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

//go:embed localization/*.json
var localization embed.FS

//go:embed vcc-auto-translate.js
var script string

var userLocale = "en-US"
var locales = [][]string{
	{
		"VCC Auto Translate installer\n\n" +
			"This installer will add the VCC Auto Translate script to your VCC installation.\n" +
			"Source code: https://github.com/gizmo-ds/vcc-auto-translate\n\n", "VCC Auto Translate 安装程序\n\n" +
			"此安装程序将向您的 VCC 安装添加 VCC Auto Translate 脚本。\n" +
			"源代码：https://github.com/gizmo-ds/vcc-auto-translate\n\n",
	},
	{"Error:", "错误:"},
	{"VCC install path:", "VCC 安装路径:"},
	{"Installed successfully", "安装成功"},
	{"Press enter to exit...", "按回车键退出..."},
}

func init() {
	if locale, err := getUserDefaultLocale(); err == nil {
		userLocale = locale
	}
}

func main() {
	fmt.Print(t(0))

	var vccInstallPath string
	_, err := os.Stat("./CreatorCompanion.exe")
	if err != nil {
		vccInstallPath, err = findVCCInstallPath()
		if err != nil {
			exit(1, t(1), err)
		}
	}

	fmt.Println(t(2), vccInstallPath)

	err = installer(vccInstallPath)
	if err != nil {
		exit(1, t(1), err)
	}
	exit(0, t(3))
}

func installer(vccPath string) error {
	webappDist := filepath.Join(vccPath, "WebApp/Dist")

	indexFile := filepath.Join(webappDist, "index.html")
	htmlFile, err := os.ReadFile(indexFile)
	if err != nil {
		return err
	}

	if !strings.Contains(string(htmlFile), "vcc-auto-translate.js") {
		doc, err := goquery.NewDocumentFromReader(bytes.NewReader(htmlFile))
		if err != nil {
			return err
		}

		doc.Find("head").
			PrependHtml(`<script src="/vcc-auto-translate.js" />`)

		htmlString, err := doc.Html()
		if err != nil {
			return err
		}

		if err = os.WriteFile(indexFile, []byte(htmlString), 0644); err != nil {
			return err
		}
	}

	if err = os.WriteFile(filepath.Join(webappDist, "vcc-auto-translate.js"), []byte(script), 0644); err != nil {
		return err
	}
	_ = os.MkdirAll(filepath.Join(webappDist, "localization"), 0755)
	de, _ := localization.ReadDir("localization")
	for _, f := range de {
		if f.IsDir() {
			continue
		}
		data, err := localization.ReadFile("localization/" + f.Name())
		if err != nil {
			return err
		}
		if err = os.WriteFile(filepath.Join(webappDist, "localization", f.Name()), data, 0644); err != nil {
			return err
		}
	}
	return nil
}

func exit(code int, args ...any) {
	fmt.Println(args...)
	fmt.Println(t(4))
	_, _ = fmt.Scanln()
	os.Exit(code)
}

func t(i int) string {
	switch {
	case strings.HasPrefix(userLocale, "zh"):
		return locales[i][1]
	}
	return locales[i][0]
}
