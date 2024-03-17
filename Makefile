all: build-script build-installer build-script-loader compress sha256sum

build-script:
	@pnpm esbuild src/index.ts --bundle --minify --format=iife --platform=browser --outfile=cmd/installer/vcc-auto-translate.js

build-injector:
	@pnpm esbuild src/injector.ts --bundle --format=esm --platform=browser --target=es2017 --minify --outfile=docs/injector.min.js

build-script-loader:
	@pnpm esno scripts/build-script-loader.ts

build-installer: build-script
	@mkdir -p build
	@cp -r localization/*.json cmd/installer/localization
	@GOOS=windows CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o build/vcc-auto-translate-installer.exe cmd/installer/main.go

sha256sum:
	@rm -f build/*.sha256; for file in build/*; do sha256sum $$file > $$file.sha256; done

compress: build-installer
	@for file in build/*.exe; do upx $$file; done

clean:
	@rm -f cmd/installer/vcc-auto-translate.js
	@rm -f cmd/installer/localization/*.json
	@rm -rf build

dev: clean build-installer
	build/vcc-auto-translate-installer.exe
