# ReformaOS

Full-stack application for managing home renovations, mortgages, and property rentals.

## Project Structure

- `api/`: Go backend (Echo framework)
- `web/`: Angular frontend
- `docker-compose.yml`: Infrastructure and services
- `imagenes/`: Project assets and photos
- `stitch_assets/`: Design system and UI assets

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Go](https://golang.org/) (optional, for local development)
- [Node.js](https://nodejs.org/) (optional, for local development)

### Launching with Docker (Recommended)

You can launch the entire stack (DB, Minio, API, and Web) with a single command:

```bash
docker-compose up --build
```

- **Frontend**: http://localhost (Port 80)
- **Backend API**: http://localhost:8080
- **Minio Console**: http://localhost:9001

### Local Development Script

If you prefer to run the API and Frontend locally (with hot-reloading) while keeping the infrastructure in Docker:

```bash
./dev.sh
```

This script starts Postgres and Minio in Docker, then runs `go run` and `npm start` on your host machine.

## Documentation

- [Authentication & Roles](README_AUTH.md)
- [Frontend Documentation](web/README.md)
