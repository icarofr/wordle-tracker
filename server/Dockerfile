FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /app/web ./cmd/web/

FROM gcr.io/distroless/static-debian13

COPY --from=builder /app/web /web

EXPOSE 9999

ENTRYPOINT ["/web"]
