package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestWriteProblem(t *testing.T) {
	app, _ := newTestApp(t)

	p := ProblemDetail{
		Type:   "about:blank",
		Title:  "Teapot",
		Status: http.StatusTeapot,
		Detail: "short and stout",
	}

	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodGet, "/", nil)

	app.writeProblem(w, r, p)

	res := w.Result()

	if res.StatusCode != http.StatusTeapot {
		t.Errorf("status: got %d, want %d", res.StatusCode, http.StatusTeapot)
	}

	if ct := res.Header.Get("Content-Type"); ct != "application/problem+json" {
		t.Errorf("Content-Type: got %q, want %q", ct, "application/problem+json")
	}

	var got ProblemDetail
	if err := json.NewDecoder(res.Body).Decode(&got); err != nil {
		t.Fatalf("decode body: %v", err)
	}

	if got.Title != p.Title {
		t.Errorf("title: got %q, want %q", got.Title, p.Title)
	}
	if got.Status != p.Status {
		t.Errorf("status field: got %d, want %d", got.Status, p.Status)
	}
	if got.Detail != p.Detail {
		t.Errorf("detail: got %q, want %q", got.Detail, p.Detail)
	}
}

func TestServerError(t *testing.T) {
	app, _ := newTestApp(t)

	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodGet, "/some-path", nil)

	app.serverError(w, r, errors.New("database exploded"))

	res := w.Result()

	if res.StatusCode != http.StatusInternalServerError {
		t.Errorf("status: got %d, want %d", res.StatusCode, http.StatusInternalServerError)
	}

	if ct := res.Header.Get("Content-Type"); ct != "application/problem+json" {
		t.Errorf("Content-Type: got %q, want %q", ct, "application/problem+json")
	}

	var got ProblemDetail
	if err := json.NewDecoder(res.Body).Decode(&got); err != nil {
		t.Fatalf("decode body: %v", err)
	}

	if got.Status != http.StatusInternalServerError {
		t.Errorf("status field: got %d, want %d", got.Status, http.StatusInternalServerError)
	}
	if got.Title != "Internal Server Error" {
		t.Errorf("title: got %q, want %q", got.Title, "Internal Server Error")
	}
	if got.Instance != "/some-path" {
		t.Errorf("instance: got %q, want %q", got.Instance, "/some-path")
	}
}

func TestWriteBadRequest(t *testing.T) {
	app, _ := newTestApp(t)

	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodPost, "/test-path", nil)

	cause := errors.New("invalid field value")
	app.writeBadRequest(w, r, cause)

	res := w.Result()

	if res.StatusCode != http.StatusBadRequest {
		t.Errorf("status: got %d, want %d", res.StatusCode, http.StatusBadRequest)
	}

	if ct := res.Header.Get("Content-Type"); ct != "application/problem+json" {
		t.Errorf("Content-Type: got %q, want %q", ct, "application/problem+json")
	}

	var got ProblemDetail
	if err := json.NewDecoder(res.Body).Decode(&got); err != nil {
		t.Fatalf("decode body: %v", err)
	}

	if got.Status != http.StatusBadRequest {
		t.Errorf("status field: got %d, want %d", got.Status, http.StatusBadRequest)
	}
	if got.Title != "Bad Request" {
		t.Errorf("title: got %q, want %q", got.Title, "Bad Request")
	}
	if got.Detail != cause.Error() {
		t.Errorf("detail: got %q, want %q", got.Detail, cause.Error())
	}
	if got.Instance != "/test-path" {
		t.Errorf("instance: got %q, want %q", got.Instance, "/test-path")
	}
}
