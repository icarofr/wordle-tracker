package main

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
)

func TestHandleHealth_OK(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	res := mustSendNoAuth(t, handler, "GET", "/health", nil)

	assertStatus(t, res.StatusCode, 200)
	assertContentType(t, res.Header, "application/json")

	var body struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body.Status != "ok" {
		t.Errorf("status: got %q, want %q", body.Status, "ok")
	}
}

func TestHandleHealth_DBDown(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.health.(*pingerMock).PingContextFunc = func(context.Context) error {
		return errors.New("connection refused")
	}

	res := mustSendNoAuth(t, handler, "GET", "/health", nil)

	assertProblem(t, res, 500, "Internal Server Error")
}
