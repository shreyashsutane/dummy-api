package handler

import (
	"net/http"

	"dummy-api/pkg/dummy"
)

var appHandler = dummy.NewMux()

// Handler is the entrypoint for Vercel Serverless Functions
func Handler(w http.ResponseWriter, r *http.Request) {
	appHandler.ServeHTTP(w, r)
}
