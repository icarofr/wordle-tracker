package response_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/icarofr/wordle-tracker/internal/response"
)

func TestProblemJSON(t *testing.T) {
	type problem struct {
		Type   string `json:"type"`
		Title  string `json:"title"`
		Status int    `json:"status"`
	}

	data := problem{
		Type:   "about:blank",
		Title:  "Not Found",
		Status: http.StatusNotFound,
	}

	t.Run("sets Content-Type to application/problem+json", func(t *testing.T) {
		w := httptest.NewRecorder()
		err := response.ProblemJSON(w, http.StatusNotFound, data)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		got := w.Header().Get("Content-Type")
		want := "application/problem+json"
		if got != want {
			t.Errorf("Content-Type = %q, want %q", got, want)
		}
	})

	t.Run("sets status code correctly", func(t *testing.T) {
		w := httptest.NewRecorder()
		err := response.ProblemJSON(w, http.StatusNotFound, data)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if w.Code != http.StatusNotFound {
			t.Errorf("status code = %d, want %d", w.Code, http.StatusNotFound)
		}
	})

	t.Run("writes correct JSON body", func(t *testing.T) {
		w := httptest.NewRecorder()
		err := response.ProblemJSON(w, http.StatusNotFound, data)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		var got problem
		if err := json.NewDecoder(w.Body).Decode(&got); err != nil {
			t.Fatalf("failed to decode response body: %v", err)
		}
		if got.Type != data.Type {
			t.Errorf("Type = %q, want %q", got.Type, data.Type)
		}
		if got.Title != data.Title {
			t.Errorf("Title = %q, want %q", got.Title, data.Title)
		}
		if got.Status != data.Status {
			t.Errorf("Status = %d, want %d", got.Status, data.Status)
		}
	})
}
