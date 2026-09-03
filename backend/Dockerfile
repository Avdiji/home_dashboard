# Dev image: fetches deps at build time, runs `go run .` at container start so
# edits to bind-mounted source are picked up without a rebuild.
FROM golang:1.25.3-alpine3.21

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

EXPOSE 8080

CMD ["go", "run", "."]
