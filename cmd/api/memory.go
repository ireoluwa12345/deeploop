package main

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/ireoluwa12345/memory-keeper/internal/database"
)

func (app *application) uploadMemory(w http.ResponseWriter, r *http.Request) {
	userID, ok := getUserIDFromContext(r.Context())
	if !ok {
		app.respondWithError(w, http.StatusUnauthorized, "user not authenticated", nil)
		return
	}
	const uploadLimit = 10 << 20
	r.Body = http.MaxBytesReader(w, r.Body, uploadLimit)

	if !strings.HasPrefix(r.Header.Get("Content-Type"), "multipart/form-data") {
		app.respondWithError(w, http.StatusBadRequest, "invalid content type", nil)
		return
	}

	var params struct {
		ContentType string `validate:"required,oneof=audio image text"`
		Content     string
	}

	params.ContentType = r.FormValue("content_type")
	params.Content = r.FormValue("content")

	validate := validator.New()

	err := validate.Struct(params)
	if err != nil {
		app.respondWithError(w, http.StatusBadRequest, "invalid params", err)
		return
	}

	file, handler, err := r.FormFile("file")

	if err != nil {
		app.respondWithError(w, http.StatusBadRequest, "invalid file", nil)
		return
	}

	defer file.Close()

	mediaType, _, err := mime.ParseMediaType(handler.Header.Get("Content-Type"))
	ext := filepath.Ext(handler.Filename)

	fmt.Println(ext)

	if err != nil {
		app.respondWithError(w, http.StatusBadRequest, "invalid file", nil)
		return
	}

	if params.ContentType == "audio" && !strings.HasPrefix(mediaType, "audio/") {
		app.respondWithError(w, http.StatusBadRequest, "uploaded non audio file", nil)
		return
	}

	if params.ContentType == "image" && !strings.HasPrefix(mediaType, "image/") {
		app.respondWithError(w, http.StatusBadRequest, "uploaded non image file", nil)
		return
	}

	tempFileName := fmt.Sprintf("%s%s", params.ContentType, ext)
	tempFile, err := os.CreateTemp("", tempFileName)
	if err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "failed to create temp file", err)
		return
	}
	defer os.Remove(tempFile.Name())
	defer tempFile.Close()

	if _, err := io.Copy(tempFile, file); err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "couldn't write file to disk", err)
		return
	}

	randBytes := make([]byte, 32)
	if _, err := rand.Read(randBytes); err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "couldn't generate random key", err)
		return
	}

	key := fmt.Sprintf("%s%s", hex.EncodeToString(randBytes), ext)

	_, err = app.s3Client.PutObject(r.Context(), &s3.PutObjectInput{
		Bucket:      aws.String(app.s3Bucket),
		Key:         aws.String(key),
		Body:        tempFile,
		ContentType: aws.String(mediaType),
	})

	if err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "couldn't upload file to s3", err)
		return
	}

	// return time.Time
	currentDate := time.Now()

	memory, err := app.db.GetMemoryByUserIDAndDate(context.Background(), database.GetMemoryByUserIDAndDateParams{
		UserID: userID,
		Date:   currentDate,
	})

	if err != nil {
		if err == sql.ErrNoRows {
			id := uuid.New()
			memory, err = app.db.CreateMemory(r.Context(), database.CreateMemoryParams{
				ID:     id,
				UserID: userID,
				Date:   currentDate,
			})

			if err != nil {
				app.respondWithError(w, http.StatusInternalServerError, "couldn't create memory", err)
				return
			}
		} else {
			app.respondWithError(w, http.StatusInternalServerError, "couldn't get memory", err)
			return
		}
	}

	metadata := map[string]string{}

	metadataJSON, err := json.Marshal(metadata)
	if err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "couldn't marshal metadata", err)
		return
	}

	content, err := app.db.CreateContent(context.Background(), database.CreateContentParams{
		ID:       uuid.New(),
		MemoryID: memory.ID,
		ContentUrl: sql.NullString{
			String: fmt.Sprintf("%s/%s", app.s3Bucket, key),
			Valid:  true,
		},
		Content:     params.Content,
		ContentType: database.ContentType(params.ContentType),
		Metadata:    json.RawMessage(metadataJSON),
	})

	if err != nil {
		app.respondWithError(w, http.StatusInternalServerError, "couldn't create content", err)
		return
	}

	content, err = app.getPresignerUrlFromDBUrl(content)

	response := map[string]interface{}{
		"entry_date": memory.Date,
		"content": map[string]interface{}{
			"id":         content.ID,
			"content":    content.Content,
			"metadata":   content.Metadata,
			"url":        content.ContentUrl.String,
			"type":       content.ContentType,
			"created_at": content.CreatedAt,
			"updated_at": content.UpdatedAt,
		},
	}

	app.respondWithJSON(w, http.StatusCreated, response)
}

func (app *application) getPresignerUrlFromDBUrl(content database.Content) (database.Content, error) {
	urlData := strings.Split(content.ContentUrl.String, ",")
	bucket := urlData[0]
	key := urlData[1]
	expiresIn, err := time.ParseDuration("600s")
	if err != nil {
		return content, err
	}
	url, err := generatePresigneURL(app.s3Client, bucket, key, expiresIn)
	if err != nil {
		return content, err
	}

	content.ContentUrl = sql.NullString{
		String: url,
		Valid:  true,
	}

	return content, nil
}
