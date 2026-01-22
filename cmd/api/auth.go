package main

import (
	"context"
	"database/sql"
	"net/http"
	"os"
	"time"

	"github.com/ireoluwa12345/memory-keeper/internal/auth"
)

func (app *application) HandleRefresh(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		if err == http.ErrNoCookie {
			http.Error(w, "No refresh token found", http.StatusUnauthorized)
			return
		}
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	refreshTokenString := cookie.Value

	refreshToken, err := app.db.GetRefreshTokenByToken(context.Background(), refreshTokenString)

	if err != nil {
		if err == sql.ErrNoRows {
			app.respondWithError(w, http.StatusUnauthorized, "refresh token not found", err)
			return
		}
		app.respondWithError(w, http.StatusInternalServerError, "could not get refresh token", err)
		return
	}

	if time.Now().After(refreshToken.ExpiresAt) {
		app.respondWithError(w, http.StatusUnauthorized, "refresh token expired", err)
		return
	}

	accessTokenExpiry, err := time.ParseDuration(ACCESS_TOKEN_EXPIRY)
	if err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "couldn't parse access token expiry", err)
		return
	}

	accessToken, err := auth.MakeJWT(refreshToken.UserID, os.Getenv("JWT_SECRET"), accessTokenExpiry)

	response := map[string]string{
		"token": accessToken,
	}

	app.respondWithJSON(w, http.StatusOK, response)
}
