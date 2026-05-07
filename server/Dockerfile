FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download

COPY . .
RUN --mount=type=cache,target=/root/.cache/go-build CGO_ENABLED=0 go build -ldflags="-s -w" -o /app/web ./cmd/web/

FROM gcr.io/distroless/static-debian13

COPY --from=builder /app/web /web

EXPOSE 9999

ENTRYPOINT ["/web"]
