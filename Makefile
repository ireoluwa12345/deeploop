BIN := deeploop
API_DIR := ./cmd/api

run/api:
	go run ${API_DIR}

migrate/api:
	@read -p "Enter the postgres sql url: " DB_URL; \
	cd sql/schema/ && goose postgres $$DB_URL up

watch/api:
	air

build/api:
	go build -o bin/${BIN} ${API_DIR}
