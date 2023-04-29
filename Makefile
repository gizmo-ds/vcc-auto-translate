all: build-script build-installer compress sha256sum

build-script:
	esbuild src/index.ts --bundle --format=iife --platform=browser --outfile=vcc-auto-translate.js

build-installer: build-script
	mkdir -p build
	GOOS=windows CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o build/ ./...
	cp vcc-auto-translate.js build/

sha256sum:
	rm build/*.sha256; for file in build/*; do sha256sum $$file > $$file.sha256; done

compress: build-installer
	for file in build/*.exe; do upx $$file; done

clean:
	rm -f vcc-auto-translate.js
	rm -rf build
