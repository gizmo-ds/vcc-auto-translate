package main

import (
	"bytes"
	_ "embed"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"vcc-auto-translate-installer/cmd/installer/utils"

	"github.com/PuerkitoBio/goquery"
	"github.com/pkg/errors"
)

var (
	//go:embed vcc-auto-translate.js
	script string

	t = utils.T
)

const (
	jsPrefix = "/* vcc-auto-translate begin */\n"
	jsSuffix = "/* vcc-auto-translate end */\n"
)

type stackTracer interface {
	StackTrace() errors.StackTrace
}

func main() {
	fmt.Println(t("banner"))

	var vccInstallPath string
	_, err := os.Stat("CreatorCompanion.exe")
	if err != nil {
		vccInstallPath, err = utils.FindVCCInstallPath()
		if err != nil {
			fmt.Println(t("error", err.Error()))
			pause()
			os.Exit(2)
		}
	}

	fmt.Println(t("vcc-path", vccInstallPath))

	if err = installer(vccInstallPath); err != nil {
		if e, ok := err.(stackTracer); ok {
			fmt.Printf("%v: %s\n", e.StackTrace()[0], t("error", err.Error()))
		} else {
			fmt.Println(t("error", err.Error()))
		}
		pause()
		os.Exit(2)
	}
	fmt.Println(t("install-success"))
	pause()
}

func installer(vccPath string) error {
	webappDist := filepath.Join(vccPath, "WebApp/Dist")
	if _, err := os.Stat(webappDist); err != nil {
		err = errors.New(t("webapp-notfound"))
		return errors.WithStack(err)
	}

	indexFile := filepath.Join(webappDist, "index.html")
	htmlFile, err := os.ReadFile(indexFile)
	if err != nil {
		return errors.WithStack(err)
	}

	doc, err := goquery.NewDocumentFromReader(bytes.NewReader(htmlFile))
	if err != nil {
		return errors.WithStack(err)
	}

	jsSelection := doc.Find("head>script[type='module']")
	if jsSelection.Length() == 0 {
		return errors.New(t("script-notfound"))
	}
	jsSelection = jsSelection.First()
	jsFilename, ok := jsSelection.Attr("src")
	if !ok {
		return errors.New(t("script-notfound"))
	}
	if strings.HasPrefix(jsFilename, "/") {
		jsFilename = jsFilename[1:]
	}
	jsFilename = filepath.Join(filepath.Dir(indexFile), jsFilename)

	jsData, err := os.ReadFile(jsFilename)
	if err != nil {
		return errors.WithStack(err)
	}
	js := string(jsData)
	if strings.Contains(js, jsPrefix) && strings.Contains(js, jsSuffix) {
		js = js[strings.Index(js, jsSuffix)+len(jsSuffix):]
	}

	// TODO: 搜索字符串的方式在VCC的代码结构出现改动时可能会失效, 以后可以尝试修改为通过AST处理
	var jsxFunctionName string
	for _, expr := range []string{`[0-9A-Za-z]+\.jsx=([0-9A-Za-z_]+)`, `[0-9A-Za-z]+\.jsxs=([0-9A-Za-z_]+)`} {
		r, err := regexp.Compile(expr)
		if err != nil {
			continue
		}
		arr := r.FindAllStringSubmatch(js, -1)
		if len(arr) > 0 && len(arr[0]) >= 2 {
			jsxFunctionName = arr[0][1]
			break
		}
	}
	if jsxFunctionName == "" {
		return errors.New(t("jsx-function-notfound"))
	}
	jsxFnStr := fmt.Sprintf(`function %s\(([a-z|A-Z|,]{5})\){`, jsxFunctionName)
	r, err := regexp.Compile(jsxFnStr)
	if err != nil {
		return errors.WithStack(err)
	}
	arr := r.FindStringSubmatchIndex(js)
	if len(arr) != 4 {
		return errors.New(t("jsx-function-notfound"))
	}
	jsxFnArgs := strings.Split(js[arr[2]:arr[3]], ",")
	if len(jsxFnArgs) != 3 {
		return errors.New(t("jsx-function-notfound"))
	}

	injection := fmt.Sprintf(`%s=vcc_auto_translate(%s,%s);`, jsxFnArgs[1], jsxFnArgs[0], jsxFnArgs[1])
	js = js[:arr[1]] + injection + js[arr[1]:]

	backupFile := jsFilename + ".backup"
	if _, err := os.Stat(backupFile); os.IsNotExist(err) {
		_, err = utils.CopyFile(jsFilename, backupFile)
		if err != nil {
			return errors.WithStack(err)
		}
	}

	js = jsPrefix + script + jsSuffix + js
	if err = os.WriteFile(jsFilename, []byte(js), 0600); err != nil {
		return errors.WithStack(err)
	}
	return nil
}

func pause() {
	fmt.Println(t("pause"))
	_, _ = fmt.Scanln()
}
