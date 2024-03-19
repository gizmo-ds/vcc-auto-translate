all: build-installer compress sha256sum

build-injector:
	@pnpm esno scripts/build-injector.ts

build-script-loader:
	@pnpm esno scripts/build-script-loader.ts
	@rm -rf build/*.css

build-installer: build-script-loader
	@cp build/script-loader.js cmd/installer/script-loader.js
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
	build/vcc-auto-translate-installer.exe
