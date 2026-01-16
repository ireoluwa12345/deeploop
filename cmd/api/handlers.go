package main

import (
	"net/http"
)

const (
	ACCESS_TOKEN_EXPIRY  = "86000s"
	REFRESH_TOKEN_EXPIRY = 60 * 24
)

func (app *application) handleHealthz(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json;")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"health": "great"}`))
}
