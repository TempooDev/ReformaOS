#!/bin/bash

# ReformaOS Development Startup Script

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "Stopping all services..."
    # Kill background jobs
    kill $(jobs -p) 2>/dev/null
    # Stop docker containers
    docker-compose stop
    echo "Services stopped."
    exit
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

echo "🚀 Starting ReformaOS Development Environment..."

# 1. Start Infrastructure
echo "📦 Starting infrastructure (Postgres, Minio)..."
docker-compose up -d postgres minio

# 2. Wait for Postgres
echo -n "⏳ Waiting for Postgres to be ready"
until docker exec reformaos_postgres pg_isready -U admin -d reformaos > /dev/null 2>&1; do
  echo -n "."
  sleep 1
done
echo " ✅ Postgres is ready!"

# 3. Start Go Backend
echo "⚙️ Starting Go backend..."
cd api
go run cmd/api/main.go &
BACKEND_PID=$!
cd ..

# 4. Start Angular Frontend
echo "🌐 Starting Angular frontend..."
cd web
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✨ All services are starting up!"
echo "--------------------------------------------------"
echo "💻 Frontend:      http://localhost:4200"
echo "🔌 Backend API:   http://localhost:8080"
echo "🗄️  Minio API:     http://localhost:9000"
echo "🖥️  Minio Console: http://localhost:9001"
echo "--------------------------------------------------"
echo "📝 Logs will be shown below. Press Ctrl+C to stop everything."
echo ""

# Wait for background processes
wait
