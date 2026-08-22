#!/bin/bash

# Run DB setup in background so the server can start and pass health checks
(
  echo "Starting DB setup in background..."
  npx prisma db push --accept-data-loss 2>&1 || echo "ERROR: prisma db push failed"
  echo "DB push done. Running cleanup..."
  npx prisma db execute --file prisma/cleanup.sql --schema prisma/schema.prisma 2>&1 || echo "WARNING: Cleanup had errors"
  echo "Running seed..."
  npx prisma db seed 2>&1 || echo "WARNING: Seed failed or already seeded"
  echo "DB setup complete."
) &

echo "Starting API server..."
exec node dist/main
