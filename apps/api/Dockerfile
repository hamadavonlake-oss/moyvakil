FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY apps/api/tsconfig.json apps/api/tsconfig.build.json apps/api/nest-cli.json apps/api/
COPY apps/api/src apps/api/src
COPY apps/api/prisma apps/api/prisma
COPY apps/api/scripts apps/api/scripts

RUN npm install

RUN cd apps/api && npx prisma generate && npx tsc -p tsconfig.build.json --listEmittedFiles && ls -la dist/

FROM node:20-alpine

RUN apk add --no-cache bash

WORKDIR /app

COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/apps/api/prisma apps/api/prisma
COPY --from=builder /app/apps/api/scripts apps/api/scripts

RUN chmod +x apps/api/scripts/render-start.sh

WORKDIR /app/apps/api

CMD ["bash", "scripts/render-start.sh"]
