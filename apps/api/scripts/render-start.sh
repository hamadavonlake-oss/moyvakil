#!/bin/bash

echo "Starting DB schema sync in background..."
(
  npx prisma db push --force-reset --accept-data-loss 2>&1 || echo "DB push error"
  echo "Running seed..."
  npx prisma db seed 2>&1 || echo "Seed error or already done"
  echo "DB setup complete."
) &

echo "Starting API server..."
exec node dist/main
