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
	refreshTokenString, err := auth.GetBearerToken(r.Header)

	if err != nil {
		app.respondWithError(w, http.StatusUnauthorized, "missing or invalid token", err)
		return
	}

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
