all: build-script build-installer compress sha256sum

build-script:
	esbuild src/index.ts --bundle --format=iife --platform=browser --outfile=vcc-auto-translate.js

build-installer: build-script
	mkdir -p build
	GOOS=windows CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o build/ ./...
	cp vcc-auto-translate.js build/

sha256sum:
	cd build; for file in *; do sha256sum $$file > $$file.sha256; done

compress: build-installer
	cd build; for file in *.exe; do upx $$file; done

clean:
	rm -f vcc-auto-translate.js
	rm -rf build
