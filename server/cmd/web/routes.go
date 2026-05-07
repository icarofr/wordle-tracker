package main

import (
	"context"
	"net/http"

	"github.com/icarofr/wordle-tracker/api"
)

func (app *application) routes() http.Handler {
	mux := http.NewServeMux()

	strictHandler := api.NewStrictHandlerWithOptions(app,
		[]api.StrictMiddlewareFunc{app.authMiddleware},
		api.StrictHTTPServerOptions{
			RequestErrorHandlerFunc:  app.requestErrorHandler,
			ResponseErrorHandlerFunc: app.responseErrorHandler,
		})
	api.HandlerWithOptions(strictHandler, api.StdHTTPServerOptions{
		BaseURL:          "",
		BaseRouter:       mux,
		ErrorHandlerFunc: app.requestErrorHandler,
	})

	return app.cors(app.requestID(app.logAccess(app.recoverPanic(app.securityHeaders(app.fetchUser(mux))))))
}

var _publicOperations = map[string]bool{
	"GetHealth": true,
	"Login":     true,
	"Register":  true,
}

func (app *application) authMiddleware(f api.StrictHandlerFunc, operationID string) api.StrictHandlerFunc {
	if _publicOperations[operationID] {
		return f
	}
	return func(ctx context.Context, w http.ResponseWriter, r *http.Request, args interface{}) (interface{}, error) {
		if contextGetUser(ctx) == nil {
			return nil, unauthorized("You must be authenticated to access this resource")
		}
		return f(ctx, w, r, args)
	}
}

func (app *application) cors(next http.Handler) http.Handler {
	allowed := make(map[string]struct{}, len(app.config.corsOrigins))
	for _, o := range app.config.corsOrigins {
		allowed[o] = struct{}{}
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if _, ok := allowed[origin]; ok {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Max-Age", "86400")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
		}
		next.ServeHTTP(w, r)
	})
}
