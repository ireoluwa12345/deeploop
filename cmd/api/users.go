package main

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"database/sql"
	"errors"

	"github.com/lib/pq"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/ireoluwa12345/memory-keeper/internal/auth"
	"github.com/ireoluwa12345/memory-keeper/internal/database"
)

func (app *application) HandleRegister(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)

	var params struct {
		Email    string `json:"email" validate:"required,email"`
		Password string `json:"password" validate:"required"`
		Name     string `json:"name" validate:"required"`
	}

	err := decoder.Decode(&params)

	if err != nil {
		app.respondWithError(w, http.StatusBadRequest, "couldn't decode parameters", err)
		return
	}

	validate := validator.New()
	err = validate.Struct(params)
	if err != nil {
		app.respondWithError(w, http.StatusBadRequest, err.Error(), err)
		return
	}

	passwordValidationErr := auth.ValidatePasswordStrength(params.Password)
	if passwordValidationErr != nil {
		app.respondWithError(w, http.StatusBadRequest, passwordValidationErr.Error(), err)
		return
	}

	hash, err := auth.HashPassword(params.Password)
	if err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "couldn't hash password", err)
	}
	params.Password = hash

	id := uuid.New()

	user, err := app.db.CreateUser(context.Background(), database.CreateUserParams{
		ID:       id,
		Email:    params.Email,
		Password: params.Password,
		Name:     params.Name,
	})

	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			app.respondWithError(w, http.StatusConflict, "account exists", err)
			return
		}
		app.respondWithError(w, http.StatusInternalServerError, "couldn't create user", err)
		return
	}

	response := map[string]interface{}{
		"user": map[string]interface{}{
			"id":         user.ID,
			"email":      user.Email,
			"name":       user.Name,
			"created_at": user.CreatedAt,
			"updated_at": user.UpdatedAt,
		},
	}

	app.respondWithJSON(w, http.StatusCreated, response)
}

func (app *application) HandleLogin(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var params struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	err := decoder.Decode(&params)

	if err != nil {
		app.respondWithError(w, http.StatusBadRequest, "couldn't decode parameters", err)
	}

	user, err := app.db.GetUserByEmail(context.Background(), params.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			app.respondWithError(w, http.StatusUnauthorized, "user not found", err)
			return
		}
		app.respondWithError(w, http.StatusInternalServerError, "error getting user", err)
		return
	}

	verified, err := auth.VerifyPassword(params.Password, user.Password)
	if err != nil || !verified {
		app.respondWithError(w, http.StatusUnauthorized, "email or password is incorrect", err)
		return
	}

	accessTokenExpiry, err := time.ParseDuration(ACCESS_TOKEN_EXPIRY)
	if err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "couldn't parse access token expiry", err)
		return
	}

	accessToken, err := auth.MakeJWT(user.ID, os.Getenv("JWT_SECRET"), accessTokenExpiry)
	if err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "couldn't create jwt", err)
		return
	}

	refreshToken, err := auth.MakeRefreshToken()
	if err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "couldn't create refresh token", err)
		return
	}

	refreshTokenExpiry := time.Now().Add(time.Duration(REFRESH_TOKEN_EXPIRY) * time.Hour)

	storedRefreshToken, err := app.db.CreateRefreshToken(context.Background(), database.CreateRefreshTokenParams{
		Token:     refreshToken,
		UserID:    user.ID,
		ExpiresAt: refreshTokenExpiry,
	})

	if err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "couldn't create refresh token", err)
		return
	}

	refreshCookie := http.Cookie{
		Name:     "refresh_token",
		Value:    storedRefreshToken.Token,
		Path:     "/auth/refresh",
		MaxAge:   3600 * 24 * 7,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	}

	http.SetCookie(w, &refreshCookie)

	response := map[string]interface{}{
		"id":         user.ID,
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
		"email":      user.Email,
		"name":       user.Name,
		"token":      accessToken,
	}

	app.respondWithJSON(w, http.StatusOK, response)
}
