package main

import (
	"bytes"
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/ireoluwa12345/memory-keeper/internal/database"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
)

var accessLog *os.File

func init() {
	var err error
	accessLog, err = os.OpenFile("access.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal("Failed to open access.log:", err)
	}
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rw := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}
		next.ServeHTTP(rw, r)
		logEntry := fmt.Sprintf("[%s] %s %s %d %v | response: %s\n", r.Method, r.URL.Path, r.RemoteAddr, rw.statusCode, time.Since(start), rw.body.String())
		accessLog.WriteString(logEntry)
		fmt.Print(logEntry)
	})
}

type responseWriter struct {
	http.ResponseWriter
	statusCode int
	body       bytes.Buffer
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func (rw *responseWriter) Write(b []byte) (int, error) {
	rw.body.Write(b)
	return rw.ResponseWriter.Write(b)
}

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
	apiMux.HandleFunc("POST /auth/google", app.HandleGoogleLogin)
	apiMux.HandleFunc("PUT /auth/profile", app.middlewareRequireAuth(app.HandleUpdateProfile))
	apiMux.HandleFunc("POST /memory", app.middlewareRequireAuth(app.uploadMemory))
	apiMux.HandleFunc("GET /memory/stats", app.middlewareRequireAuth(app.getUserStats))
	apiMux.HandleFunc("GET /memory/calendar/{year}/{month}", app.middlewareRequireAuth(app.getCalendarDates))
	apiMux.HandleFunc("GET /memory/{date}", app.middlewareRequireAuth(app.getMemoryWithDate))

	mux.Handle("/api/", http.StripPrefix("/api", apiMux))

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	srv := &http.Server{
		Addr:    ":" + host,
		Handler: c.Handler(loggingMiddleware(mux)),
	}

	app.infoLog.Println("Server started on port 1219")

	err = srv.ListenAndServe()
	if err != nil {
		app.errorLog.Fatal(err)
	}
}
