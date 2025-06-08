FROM golang:1.24 AS builder

ARG TARGETPLATFORM
ARG BUILDPLATFORM
ARG TARGETOS
ARG TARGETARCH

# Set destination for COPY
WORKDIR /app

# Download Go modules
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -ldflags="-w -s" -o main main.go


# ============================================================
FROM oven/bun:1 AS frontend-builder

# Set destination for COPY
WORKDIR /app

COPY ui/package.json ui/bun.lock ./
RUN bun install --frozen-lockfile

COPY ui/ ./
RUN bun run build


# ============================================================
FROM alpine:3.22

WORKDIR /app/
COPY --from=builder /app/main /app/main
COPY --from=frontend-builder /app/dist ui/dist
COPY posts/ posts/

EXPOSE 3000

ENTRYPOINT [ "/app/main" ]
