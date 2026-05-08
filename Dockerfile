# ── Stage 1: Build frontend ───────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_ vars must be provided at build time so Vite bakes them in
ARG VITE_SALESSQL_WEBHOOK
ARG VITE_APIFY_WEBHOOK
ARG VITE_PROSPEO_WEBHOOK
ARG VITE_EMAIL_EXTRACTOR_URL
ARG VITE_DATA_SCRAPER_URL

ENV VITE_SALESSQL_WEBHOOK=$VITE_SALESSQL_WEBHOOK
ENV VITE_APIFY_WEBHOOK=$VITE_APIFY_WEBHOOK
ENV VITE_PROSPEO_WEBHOOK=$VITE_PROSPEO_WEBHOOK
ENV VITE_EMAIL_EXTRACTOR_URL=$VITE_EMAIL_EXTRACTOR_URL
ENV VITE_DATA_SCRAPER_URL=$VITE_DATA_SCRAPER_URL

RUN npm run build

# ── Stage 2: Production server ────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server/ ./server/
COPY --from=builder /app/dist ./dist

EXPOSE 4005

CMD ["node", "server/index.js"]
