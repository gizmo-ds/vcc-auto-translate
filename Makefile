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
	@cp build/patch-loader.js installer-src/assets/patch-loader.js
	@cd installer-src && cargo build --release --locked --target x86_64-pc-windows-gnu
	@cp installer-src/target/x86_64-pc-windows-gnu/release/vcc-auto-translate-installer.exe build/vcc-auto-translate-installer.exe

sha256sum:
	@rm -f build/*.sha256; for file in build/*; do sha256sum $$file > $$file.sha256; done

compress: build-installer
	@if [ -n "$(shell command -v upx 2> /dev/null)" ]; then for file in build/*.exe; do upx $$file; done; fi

clean:
	@rm -f cmd/installer/vcc-auto-translate.js
	@rm -f cmd/installer/localization/*.json
	@rm -rf build

dev: clean build-patch-loader
	@rm -f installer-src/assets/patch-loader.js
	@cp build/patch-loader.js installer-src/assets/patch-loader.js
	@cd installer-src && cargo build --locked --target x86_64-pc-windows-gnu
	installer-src/target/x86_64-pc-windows-gnu/debug/vcc-auto-translate-installer.exe --no-pause
