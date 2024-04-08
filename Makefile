pm = $(if $(shell command -v bun 2> /dev/null), bun, pnpm)

all: build-installer compress sha256sum

build-injector:
	@${pm} esbuild src/injector.ts --bundle --format=esm --platform=browser --target=es2017 --minify --outfile=docs/injector.min.js

build-script-loader:
	make build-patch-loader

build-patch-loader:
	@${pm} esno scripts/build-patch-loader.ts
	@rm -rf build/*.css

build-installer: build-patch-loader
	@cp build/patch-loader.js cmd/installer/patch-loader.js
	@GOOS=windows CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o build/vcc-auto-translate-installer.exe cmd/installer/main.go

sha256sum:
	@rm -f build/*.sha256; for file in build/*; do sha256sum $$file > $$file.sha256; done

compress: build-installer
	@if [ -n "$(shell command -v upx 2> /dev/null)" ]; then for file in build/*.exe; do upx $$file; done; fi

clean:
	@rm -f cmd/installer/vcc-auto-translate.js
	@rm -f cmd/installer/localization/*.json
	@rm -rf build

dev: clean build-installer
	build/vcc-auto-translate-installer.exe --dont-pause
