#!/bin/bash
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Cleaning fabricated seed data..."
npx prisma db execute --file prisma/cleanup.sql --schema prisma/schema.prisma || echo "WARNING: Cleanup had errors"

echo "Seeding database..."
npx prisma db seed || echo "WARNING: Seed had errors (data may already exist)"

echo "Starting API server..."
node dist/main
