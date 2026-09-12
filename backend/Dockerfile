# Stage 1: Build
FROM node:20-bookworm-slim AS builder

RUN apt-get update && apt-get install -y openssl ca-certificates

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --legacy-peer-deps
RUN npx prisma generate

COPY . .

RUN npm run build

# Stage 2: Production
FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y openssl ca-certificates

WORKDIR /usr/src/app

COPY package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["npm", "run", "start"]