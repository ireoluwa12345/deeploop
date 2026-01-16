package main

import (
	"encoding/json"
	"net/http"
)

func (app *application) respondWithError(w http.ResponseWriter, code int, msg string, err error) {
	if err != nil {
		app.errorLog.Println(err)
	}
	if code > 499 {
		app.errorLog.Printf("Responding with 5XX error: %s", msg)
	}
	type errorResponse struct {
		Error string `json:"error"`
	}
	app.respondWithJSON(w, code, errorResponse{
		Error: msg,
	})
}

func (app *application) respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	dat, err := json.Marshal(payload)
	if err != nil {
		app.errorLog.Printf("Error marshalling JSON: %s", err)
		w.WriteHeader(500)
		return
	}
	w.WriteHeader(code)
	w.Write(dat)
}
