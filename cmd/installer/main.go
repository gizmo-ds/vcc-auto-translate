package main

import (
	"bytes"
	"embed"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"vcc-auto-translate-installer/cmd/installer/utils"

	"github.com/PuerkitoBio/goquery"
	"github.com/pkg/errors"
)

var (
	//go:embed localization/*.json
	localization embed.FS
	//go:embed vcc-auto-translate.js
	script string

	t = utils.T
)

type stackTracer interface {
	StackTrace() errors.StackTrace
}

func init() {
	log.SetFlags(log.Lshortfile)
}

func main() {
	fmt.Println(t("banner"))

	var vccInstallPath string
	_, err := os.Stat("CreatorCompanion.exe")
	if err != nil {
		vccInstallPath, err = utils.FindVCCInstallPath()
		if err != nil {
			log.Println(t("error", err.Error()))
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

	if !strings.Contains(string(htmlFile), "vcc-auto-translate.js") {
		doc, err := goquery.NewDocumentFromReader(bytes.NewReader(htmlFile))
		if err != nil {
			return errors.WithStack(err)
		}

		doc.Find("head").
			PrependHtml(`<script src="/vcc-auto-translate.js" />`)

		htmlString, err := doc.Html()
		if err != nil {
			return errors.WithStack(err)
		}

		if err = os.WriteFile(indexFile, []byte(htmlString), 0644); err != nil {
			return errors.WithStack(err)
		}
	}

	if err = os.WriteFile(filepath.Join(webappDist, "vcc-auto-translate.js"), []byte(script), 0644); err != nil {
		return errors.WithStack(err)
	}
	_ = os.MkdirAll(filepath.Join(webappDist, "localization"), 0755)
	de, _ := localization.ReadDir("localization")
	for _, f := range de {
		if f.IsDir() {
			continue
		}
		data, err := localization.ReadFile("localization/" + f.Name())
		if err != nil {
			return errors.WithStack(err)
		}
		if err = os.WriteFile(filepath.Join(webappDist, "localization", f.Name()), data, 0644); err != nil {
			return errors.WithStack(err)
		}
	}
	return nil
}

func pause() {
	fmt.Println(t("pause"))
	_, _ = fmt.Scanln()
}
