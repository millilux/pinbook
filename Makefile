VERSION = $(shell node -p "require('./src/manifest.json').version")

build:
	mkdir -p dist
	cd src; zip ../dist/pinbook-${VERSION}.zip -r --exclude=*.DS_Store* .