PB_BINARY ?= pocketbase
PORT ?= 8090

.PHONY: dev

dev:
	@echo "Starting PocketBase dev server on http://127.0.0.1:$(PORT)/_\/"
	$(PB_BINARY) serve --http=0.0.0.0:$(PORT)
