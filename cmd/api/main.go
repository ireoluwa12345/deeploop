package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/ireoluwa12345/memory-keeper/internal/database"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type application struct {
	infoLog  *log.Logger
	errorLog *log.Logger
	db       *database.Queries
}

func main() {
	infoLog := log.New(os.Stdout, "INFO ", log.Ldate|log.Ltime|log.Lshortfile)
	errorLog := log.New(os.Stderr, "ERROR ", log.Ldate|log.Ltime|log.Lshortfile)

	godotenv.Load()
	dbURL := os.Getenv("DB_URL")
	host := os.Getenv("HOST")

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		errorLog.Fatal(err)
	}

	dbQueries := database.New(db)

	app := &application{
		infoLog:  infoLog,
		errorLog: errorLog,
		db:       dbQueries,
	}

	mux := http.NewServeMux()
	apiMux := http.NewServeMux()

	apiMux.HandleFunc("GET /healthz", app.handleHealthz)
	apiMux.HandleFunc("POST /auth/login", app.HandleLogin)
	apiMux.HandleFunc("POST /auth/register", app.HandleRegister)
	// apiMux.HandleFunc("POST /auth/refresh", app.HandleRefresh)
	// apiMux.HandleFunc("POST /auth/logout", app.HandleLogout)

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
