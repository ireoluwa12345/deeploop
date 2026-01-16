BIN := deeploop
API_DIR := ./cmd/api

run/api:
	go run ${API_DIR}

watch/api:
	air

build/api:
	go build -o bin/${BIN} ${API_DIR}
