# Stage 1: Build Nuxt SPA
FROM node:lts-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run generate

# Stage 2: Build PocketBase binary
FROM golang:alpine AS backend
WORKDIR /app
COPY db/go.mod db/go.sum ./
RUN go mod download
COPY db/ .
RUN CGO_ENABLED=0 GOOS=linux go build -o dreibein .

# Stage 3: Final image
FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /pb

COPY --from=backend /app/dreibein .
COPY --from=frontend /app/db/pb_public ./pb_public
COPY db/pb_hooks ./pb_hooks
COPY db/pb_migrations ./pb_migrations

EXPOSE 8080
VOLUME ["/pb/pb_data"]

CMD ["./dreibein", "serve", "--http=0.0.0.0:8080", "--migrationsDir=/pb/pb_migrations"]
