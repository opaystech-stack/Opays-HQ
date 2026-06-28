# ==========================================
# Dockerfile — Opays HQ (multi-stage)
# ==========================================

# ---- Stage 1: Build frontend (Vite SPA) ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app
RUN apk add --no-cache python3 g++ make
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage 2: Production ----
FROM node:20-alpine
WORKDIR /app

# Install build tools for native modules (better-sqlite3), install production
# deps plus the tsx runtime, then remove the build tools so they are not
# shipped in the final image. tsx is baked in so startup needs no network fetch.
RUN apk add --no-cache python3 g++ make
COPY package*.json ./
RUN npm ci --omit=dev && \
    npm install --no-save tsx@^4.22.4 && \
    apk del python3 g++ make && \
    rm -rf /root/.npm /root/.cache

# Copy built frontend
COPY --from=frontend-builder /app/dist ./dist

# Copy server source (executed directly by tsx)
COPY server/ ./server/

# Create data directory for SQLite (durable volume mount target)
RUN mkdir -p /app/data

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001
# Emplacement de la base SQLite (cible du volume Docker persistant).
ENV DATA_DIR=/app/data

# Launch the single Express process
CMD ["npx", "tsx", "server/index.ts"]
