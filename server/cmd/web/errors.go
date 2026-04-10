package main

import (
	"errors"
	"log/slog"
	"net/http"
	"runtime/debug"

	"github.com/icarofr/wordle-tracker/internal/response"
	"github.com/icarofr/wordle-tracker/internal/validator"
)

type ProblemDetail struct {
	Type     string       `json:"type"`
	Title    string       `json:"title"`
	Status   int          `json:"status"`
	Detail   string       `json:"detail,omitempty"`
	Instance string       `json:"instance,omitempty"`
	Errors   []FieldError `json:"errors,omitempty"`
}

type FieldError struct {
	Field  string `json:"field"`
	Detail string `json:"detail"`
}

// httpError wraps a ProblemDetail so it can be returned as an error from
// strict server handlers and converted back into a proper JSON problem
// response by responseErrorHandler.
type httpError struct {
	problem ProblemDetail
}

func (e *httpError) Error() string {
	if e.problem.Detail != "" {
		return e.problem.Detail
	}
	return e.problem.Title
}

// --- Error constructor helpers ---

func notFound(detail string) *httpError {
	return &httpError{problem: ProblemDetail{
		Type:   "about:blank",
		Title:  "Not Found",
		Status: http.StatusNotFound,
		Detail: detail,
	}}
}

func badRequest(typ, detail string) *httpError {
	return &httpError{problem: ProblemDetail{
		Type:   "/problems/" + typ,
		Title:  "Bad Request",
		Status: http.StatusBadRequest,
		Detail: detail,
	}}
}

func conflict(typ, detail string) *httpError {
	return &httpError{problem: ProblemDetail{
		Type:   "/problems/" + typ,
		Title:  "Conflict",
		Status: http.StatusConflict,
		Detail: detail,
	}}
}

func unauthorized(detail string) *httpError {
	return &httpError{problem: ProblemDetail{
		Type:   "about:blank",
		Title:  "Unauthorized",
		Status: http.StatusUnauthorized,
		Detail: detail,
	}}
}

func validationError(v *validator.Validator) *httpError {
	fieldErrors := make([]FieldError, 0, len(v.Errors))
	for field, msgs := range v.Errors {
		for _, msg := range msgs {
			fieldErrors = append(fieldErrors, FieldError{Field: field, Detail: msg})
		}
	}
	return &httpError{problem: ProblemDetail{
		Type:   "/problems/validation-error",
		Title:  "Bad Request",
		Status: http.StatusBadRequest,
		Errors: fieldErrors,
	}}
}

// --- Request/response error handlers ---

// requestErrorHandler handles request-decoding errors from oapi-codegen.
func (app *application) requestErrorHandler(w http.ResponseWriter, r *http.Request, err error) {
	app.writeBadRequest(w, r, err)
}

// responseErrorHandler handles errors returned by strict server handlers.
// If the error is an *httpError it writes the wrapped ProblemDetail;
// otherwise it falls back to a generic 500.
func (app *application) responseErrorHandler(w http.ResponseWriter, r *http.Request, err error) {
	var he *httpError
	if errors.As(err, &he) {
		he.problem.Instance = r.URL.RequestURI()
		app.writeProblem(w, r, he.problem)
		return
	}
	app.serverError(w, r, err)
}

func (app *application) reportServerError(r *http.Request, err error) {
	var (
		message = err.Error()
		method  = r.Method
		url     = r.URL.String()
		trace   = string(debug.Stack())
	)

	requestAttrs := slog.Group("request", "method", method, "url", url)
	app.logger.Error(message, requestAttrs, "trace", trace)
}

func (app *application) writeProblem(w http.ResponseWriter, r *http.Request, p ProblemDetail) {
	if err := response.ProblemJSON(w, p.Status, p); err != nil {
		app.reportServerError(r, err)
	}
}

func (app *application) serverError(w http.ResponseWriter, r *http.Request, err error) {
	app.reportServerError(r, err)
	app.writeProblem(w, r, ProblemDetail{
		Type:     "about:blank",
		Title:    "Internal Server Error",
		Status:   http.StatusInternalServerError,
		Instance: r.URL.RequestURI(),
	})
}

func (app *application) writeBadRequest(w http.ResponseWriter, r *http.Request, err error) {
	app.writeProblem(w, r, ProblemDetail{
		Type:     "about:blank",
		Title:    "Bad Request",
		Status:   http.StatusBadRequest,
		Detail:   err.Error(),
		Instance: r.URL.RequestURI(),
	})
}
