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

//go:embed localization/*
var localization embed.FS

//go:embed vcc-auto-translate.js
var script string

func main() {
	fmt.Print("VCC Auto Translate installer\n\n" +
		"This installer will add the VCC Auto Translate script to your VCC installation.\n" +
		"Source code: https://github.com/gizmo-ds/vcc-auto-translate\n\n")

	var vccInstallPath string
	_, err := os.Stat("./CreatorCompanion.exe")
	if err != nil {
		vccInstallPath, err = findVCCInstallPath()
		if err != nil {
			exit(1, "Error:", err)
		}
	}

	fmt.Println("VCC install path:", vccInstallPath)

	err = installer(vccInstallPath)
	if err != nil {
		exit(1, "Error:", err)
	}
	exit(0, "Installed successfully")
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
	fmt.Println("Press enter to exit...")
	_, _ = fmt.Scanln()
	os.Exit(code)
}
