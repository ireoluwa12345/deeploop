package main

import (
	"context"
	"net/http"

	"github.com/google/uuid"
)

const (
	ACCESS_TOKEN_EXPIRY  = "86000s"
	REFRESH_TOKEN_EXPIRY = 60 * 24
)

type contextKey string

const userIDKey contextKey = "userID"

func getUserIDFromContext(ctx context.Context) (uuid.UUID, bool) {
	userID, ok := ctx.Value(userIDKey).(uuid.UUID)
	return userID, ok
}

func (app *application) handleHealthz(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json;")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"health": "great"}`))
}
