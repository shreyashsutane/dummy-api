# Stage 1: Build binary
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code and build statically linked binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server main.go

# Stage 2: Minimal runtime image
FROM alpine:3.21

RUN apk --no-cache add ca-certificates

WORKDIR /root/
COPY --from=builder /app/server .

# Cloud Run defaults to 8080
ENV PORT=8080
EXPOSE 8080

CMD ["./server"]
