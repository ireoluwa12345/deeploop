package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"database/sql"
	"errors"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
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
		Password: sql.NullString{String: params.Password, Valid: true},
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

	verified, err := auth.VerifyPassword(params.Password, user.Password.String)
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

	profileImage, err := app.getPresignerUrlForProfile(user.ProfileImage)
	if err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "couldn't get profile image url", err)
		return
	}

	response := map[string]interface{}{
		"id":            user.ID,
		"created_at":    user.CreatedAt,
		"updated_at":    user.UpdatedAt,
		"email":         user.Email,
		"name":          user.Name,
		"profile_image": profileImage,
		"token":         accessToken,
		"refresh_token": storedRefreshToken.Token,
	}

	app.respondWithJSON(w, http.StatusOK, response)
}

func (app *application) HandleGoogleLogin(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var params struct {
		IDToken string `json:"id_token"`
	}

	err := decoder.Decode(&params)
	if err != nil || params.IDToken == "" {
		app.respondWithError(w, http.StatusBadRequest, "id_token is required", err)
		return
	}

	// Verify ID token with Google
	resp, err := http.Get("https://oauth2.googleapis.com/tokeninfo?id_token=" + params.IDToken)
	if err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "failed to verify google token", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		app.respondWithError(w, http.StatusUnauthorized, "invalid google token", nil)
		return
	}

	var googleInfo struct {
		Email         string `json:"email"`
		EmailVerified string `json:"email_verified"`
		Name          string `json:"name"`
		Aud           string `json:"aud"`
		Sub           string `json:"sub"`
	}

	err = json.NewDecoder(resp.Body).Decode(&googleInfo)
	if err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "failed to parse google response", err)
		return
	}

	// Validate audience matches our client ID
	googleClientID := os.Getenv("GOOGLE_CLIENT_ID")
	if googleInfo.Aud != googleClientID {
		app.respondWithError(w, http.StatusUnauthorized, "token audience mismatch", nil)
		return
	}

	if googleInfo.EmailVerified != "true" {
		app.respondWithError(w, http.StatusUnauthorized, "email not verified", nil)
		return
	}

	// Find or create user
	user, err := app.db.GetUserByEmail(context.Background(), googleInfo.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			// Create new user with no password
			id := uuid.New()
			user, err = app.db.CreateUser(context.Background(), database.CreateUserParams{
				ID:       id,
				Email:    googleInfo.Email,
				Password: sql.NullString{String: "", Valid: false},
				Name:     googleInfo.Name,
			})
			if err != nil {
				app.respondWithError(w, http.StatusInternalServerError, "couldn't create user", err)
				return
			}
		} else {
			app.respondWithError(w, http.StatusInternalServerError, "error getting user", err)
			return
		}
	}

	// Issue tokens (same as HandleLogin)
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

	profileImage, err := app.getPresignerUrlForProfile(user.ProfileImage)
	if err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "couldn't get profile image url", err)
		return
	}

	response := map[string]interface{}{
		"id":            user.ID,
		"created_at":    user.CreatedAt,
		"updated_at":    user.UpdatedAt,
		"email":         user.Email,
		"name":          user.Name,
		"profile_image": profileImage,
		"token":         accessToken,
		"refresh_token": storedRefreshToken.Token,
	}

	app.respondWithJSON(w, http.StatusOK, response)
}

func (app *application) HandleUpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserIDFromContext(r.Context())
	if !ok {
		app.respondWithError(w, http.StatusUnauthorized, "user not authenticated", nil)
		return
	}

	const uploadLimit = 5 << 20 // 5MB
	r.Body = http.MaxBytesReader(w, r.Body, uploadLimit)

	// Get current user
	currentUser, err := app.db.GetUserByID(r.Context(), userID)
	if err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "user not found", err)
		return
	}

	// Parse multipart form
	if err := r.ParseMultipartForm(uploadLimit); err != nil {
		app.respondWithError(w, http.StatusBadRequest, "invalid form data", err)
		return
	}

	name := r.FormValue("name")
	if name == "" {
		name = currentUser.Name
	}

	profileImageURL := currentUser.ProfileImage

	// Handle optional image upload
	file, handler, err := r.FormFile("profile_image")
	if err == nil {
		defer file.Close()

		mediaType, _, err := mime.ParseMediaType(handler.Header.Get("Content-Type"))
		if err != nil || !strings.HasPrefix(mediaType, "image/") {
			app.respondWithError(w, http.StatusBadRequest, "uploaded file is not an image", nil)
			return
		}

		ext := filepath.Ext(handler.Filename)
		randBytes := make([]byte, 32)
		if _, err := rand.Read(randBytes); err != nil {
			app.respondWithError(w, http.StatusInternalServerError, "couldn't generate random key", err)
			return
		}
		key := fmt.Sprintf("profiles/%s%s", hex.EncodeToString(randBytes), ext)

		_, err = app.s3Client.PutObject(r.Context(), &s3.PutObjectInput{
			Bucket:      aws.String(app.s3Bucket),
			Key:         aws.String(key),
			Body:        file,
			ContentType: aws.String(mediaType),
		})
		if err != nil {
			app.respondWithError(w, http.StatusInternalServerError, "failed to upload image", err)
			return
		}

		profileImageURL = sql.NullString{String: fmt.Sprintf("%s,%s", app.s3Bucket, key), Valid: true}
	}

	// Update user in DB
	updatedUser, err := app.db.UpdateUserProfile(r.Context(), database.UpdateUserProfileParams{
		ID:           userID,
		Name:         name,
		ProfileImage: profileImageURL,
	})
	if err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "couldn't update profile", err)
		return
	}

	profileImage, err := app.getPresignerUrlForProfile(updatedUser.ProfileImage)
	if err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "couldn't get profile image url", err)
		return
	}

	response := map[string]interface{}{
		"id":            updatedUser.ID,
		"email":         updatedUser.Email,
		"name":          updatedUser.Name,
		"profile_image": profileImage,
		"created_at":    updatedUser.CreatedAt,
		"updated_at":    updatedUser.UpdatedAt,
	}

	app.respondWithJSON(w, http.StatusOK, response)
}

func (app *application) getPresignerUrlForProfile(profileImage sql.NullString) (string, error) {
	if !profileImage.Valid || profileImage.String == "" {
		return "", nil
	}

	urlData := strings.Split(profileImage.String, ",")
	if len(urlData) != 2 {
		return "", errors.New("invalid profile image url")
	}
	bucket := urlData[0]
	key := urlData[1]
	expiresIn, err := time.ParseDuration("600s")
	if err != nil {
		return "", err
	}
	url, err := generatePresigneURL(app.s3Client, bucket, key, expiresIn)
	if err != nil {
		return "", err
	}

	return url, nil
}
