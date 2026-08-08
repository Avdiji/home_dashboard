// Command home-dashboard-backend opens the SQLite DB, seeds empty tables with
// the frontend's seed data, starts the websocket hub, and serves the REST + WS
// API on :8080 (override with HOME_DASHBOARD_ADDR). Run `go mod tidy` first to
// fetch gorilla/websocket + modernc.org/sqlite, then `go run .`.
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"homedashboard/internal/api"
	"homedashboard/internal/db"
	"homedashboard/internal/seed"
	"homedashboard/internal/store"
	"homedashboard/internal/ws"
)

func main() {
	addr := os.Getenv("HOME_DASHBOARD_ADDR")
	if addr == "" {
		addr = ":8080"
	}
	dbPath := os.Getenv("HOME_DASHBOARD_DB")
	if dbPath == "" {
		dbPath = "home_dashboard.db"
	}

	d, err := db.Open(dbPath)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer d.Close()

	s := store.New(d)
	if err := seed.Run(s); err != nil {
		log.Fatalf("seed: %v", err)
	}

	hub := ws.NewHub()
	go hub.Run()

	server := api.NewServer(s, hub)
	httpSrv := &http.Server{
		Addr:              addr,
		Handler:           server,
		ReadHeaderTimeout: 5 * time.Second,
	}

	// graceful shutdown on interrupt/term.
	go func() {
		log.Printf("home-dashboard-backend listening on %s (db %s)", addr, dbPath)
		if err := httpSrv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop
	log.Println("shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := httpSrv.Shutdown(ctx); err != nil {
		log.Printf("shutdown: %v", err)
	}
}