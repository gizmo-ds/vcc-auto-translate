all: build-script build-installer build-script-loader compress sha256sum

build-script:
	@esbuild src/index.ts --bundle --minify --format=iife --platform=browser --outfile=cmd/installer/vcc-auto-translate.js

build-injector:
	@esbuild .\src\injector.ts --bundle --format=esm --platform=browser --target=es2017 --minify --outfile=docs/injector.min.js

build-script-loader:
	@esbuild .\src\script-loader.ts --bundle --format=esm --platform=browser --target=es2017 --minify --outfile=build/script-loader.js

build-installer: build-script
	@mkdir -p build
	@cp -r localization/*.json cmd/installer/localization
	@GOOS=windows CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o build/vcc-auto-translate-installer.exe cmd/installer/main.go
	@cp cmd/installer/vcc-auto-translate.js build/

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
