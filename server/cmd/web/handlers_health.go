package main

import (
	"context"

	"github.com/icarofr/wordle-tracker/api"
)

func (app *application) GetHealth(ctx context.Context, request api.GetHealthRequestObject) (api.GetHealthResponseObject, error) {
	if err := app.health.PingContext(ctx); err != nil {
		return nil, err
	}
	return api.GetHealth200JSONResponse{Status: "ok"}, nil
}
