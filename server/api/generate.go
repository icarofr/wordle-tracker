package api

//go:generate sh -c "go run merge-openapi.go openapi.whatsapp.yaml > openapi.merged.yaml"
//go:generate go tool oapi-codegen --config cfg.yaml openapi.merged.yaml
//go:generate rm -f openapi.merged.yaml
