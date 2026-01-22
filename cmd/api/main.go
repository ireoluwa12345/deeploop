package main

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/ireoluwa12345/memory-keeper/internal/database"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type application struct {
	infoLog          *log.Logger
	errorLog         *log.Logger
	db               *database.Queries
	s3Bucket         string
	s3Region         string
	s3CfDistribution string
	s3Client         *s3.Client
}

func main() {
	infoLog := log.New(os.Stdout, "INFO ", log.Ldate|log.Ltime|log.Lshortfile)
	errorLog := log.New(os.Stderr, "ERROR ", log.Ldate|log.Ltime|log.Lshortfile)

	godotenv.Load()
	host := os.Getenv("HOST")
	if host == "" {
		log.Fatal("HOST environment variable is not set")
	}

	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		log.Fatal("DB_URL environment variable is not set")
	}

	s3Bucket := os.Getenv("S3_BUCKET")
	if s3Bucket == "" {
		log.Fatal("S3_BUCKET environment variable is not set")
	}

	s3Region := os.Getenv("S3_REGION")
	if s3Region == "" {
		log.Fatal("S3_REGION environment variable is not set")
	}
	infoLog.Println("S3_REGION:", s3Region)

	s3CfDistribution := os.Getenv("S3_CF_DISTRO")
	if s3CfDistribution == "" {
		log.Fatal("S3_CF_DISTRO environment variable is not set")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		errorLog.Fatal(err)
	}

	dbQueries := database.New(db)

	awsCfg, err := config.LoadDefaultConfig(context.Background(), config.WithRegion(s3Region))
	if err != nil {
		errorLog.Fatal(err)
	}
	client := s3.NewFromConfig(awsCfg)

	app := &application{
		infoLog:          infoLog,
		errorLog:         errorLog,
		db:               dbQueries,
		s3Bucket:         s3Bucket,
		s3Region:         s3Region,
		s3CfDistribution: s3CfDistribution,
		s3Client:         client,
	}

	mux := http.NewServeMux()
	apiMux := http.NewServeMux()

	apiMux.HandleFunc("GET /healthz", app.handleHealthz)
	apiMux.HandleFunc("POST /auth/login", app.HandleLogin)
	apiMux.HandleFunc("POST /auth/register", app.HandleRegister)
	apiMux.HandleFunc("POST /auth/refresh", app.HandleRefresh)
	apiMux.HandleFunc("POST /memory", app.middlewareRequireAuth(app.uploadMemory))
	apiMux.HandleFunc("GET /memory/{date}", app.middlewareRequireAuth(app.getMemoryWithDate))

	mux.Handle("/api/", http.StripPrefix("/api", apiMux))

	srv := &http.Server{
		Addr:    ":" + host,
		Handler: mux,
	}

	app.infoLog.Println("Server started on port 1219")

	err = srv.ListenAndServe()
	if err != nil {
		app.errorLog.Fatal(err)
	}
}
