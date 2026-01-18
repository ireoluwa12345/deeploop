package main

import (
	"context"
	"net/http"
	"os"

	"github.com/ireoluwa12345/memory-keeper/internal/auth"
)

// middlewareRequireAuth validates JWT and sets user ID in context
func (app *application) middlewareRequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenString, err := auth.GetBearerToken(r.Header)
		if err != nil {
			app.respondWithError(w, http.StatusUnauthorized, "missing or invalid token", err)
			return
		}

		userID, err := auth.ValidateJWT(tokenString, os.Getenv("JWT_SECRET"))
		if err != nil {
			app.respondWithError(w, http.StatusUnauthorized, "invalid token", err)
			return
		}

		ctx := context.WithValue(r.Context(), userIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}
