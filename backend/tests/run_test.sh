#!/bin/bash

set -e

CONTAINER_NAME="ecommerce-test-db"
COMPOSE_FILE="docker-postgres.test.yml"

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
  echo "🟡 Container '$CONTAINER_NAME' not running. Starting it..."
  docker-compose -f "$COMPOSE_FILE" up -d
  echo "⏳ Waiting for database to be ready..."
  sleep 5
else
  echo "✅ Container '$CONTAINER_NAME' is already running."
fi

echo "🚀 Running tests..."
if pnpm test; then
  echo -e "\n✅ ALL TESTS PASSED"
else
  echo -e "\n❌ SOME TESTS FAILED"
  exit 1
fi