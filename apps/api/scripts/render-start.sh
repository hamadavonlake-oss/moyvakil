#!/bin/bash

echo "Pushing DB schema in background..."
(
  npx prisma db push --force-reset --accept-data-loss 2>&1 || echo "DB push error"
  npx prisma db seed 2>&1 || echo "Seed error"
  echo "Background DB setup complete."
) &
DB_PID=$!

echo "Starting API server..."
node dist/main &
SERVER_PID=$!

echo "Waiting for DB setup..."
wait $DB_PID
echo "DB setup finished."

wait $SERVER_PID
