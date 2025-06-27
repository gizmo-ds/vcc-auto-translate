pm = $(if $(shell command -v bun 2> /dev/null), bun, pnpm)

all: build-installer compress

build-script-loader:
	make build-patch-loader

build-patch-loader:
	@${pm} esno scripts/build-patch-loader.ts
	@rm -rf build/*.css

build-installer: build-patch-loader
	@cp build/patch-loader.js crates/installer/assets/patch-loader.js
	@cargo build --release --locked --target x86_64-pc-windows-gnu
	@cp target/x86_64-pc-windows-gnu/release/vcc-auto-translate-installer.exe build/

sha256sum:
	@rm -f build/*.sha256; for file in build/*; do sha256sum $$file > $$file.sha256; done

compress:
	@if [ -n "$(shell command -v upx 2> /dev/null)" ]; then for file in build/*.exe; do upx $$file; done; fi

clean:
	@rm -f cmd/installer/vcc-auto-translate.js
	@rm -f cmd/installer/localization/*.json
	@rm -rf build
	@cargo clean

dev: clean build-patch-loader
	@rm -f crates/installer/assets/patch-loader.js
	@cp build/patch-loader.js crates/installer/assets/patch-loader.js
	@cargo build -p installer --locked --target x86_64-pc-windows-gnu
	target/x86_64-pc-windows-gnu/debug/vcc-auto-translate-installer.exe --no-pause
