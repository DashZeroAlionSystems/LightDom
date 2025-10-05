# Multi-stage Dockerfile for LightDom Space-Bridge Platform
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY package*.json ./
COPY vite.config.ts ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Build frontend
RUN npm run build

# Stage 2: Build backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy backend source
COPY api-server-express.js ./
COPY src/ ./src/
COPY crawler/ ./crawler/
COPY contracts/ ./contracts/
COPY database/ ./database/
COPY electron/ ./electron/
COPY start-*.js ./
COPY dom-space-harvester.tsx ./

# Install Puppeteer dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Stage 3: Production image
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    postgresql-client \
    curl \
    bash

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S lightdom -u 1001

# Set working directory
WORKDIR /app

# Copy built frontend from frontend-builder
COPY --from=frontend-builder /app/frontend/dist ./dist
COPY --from=frontend-builder /app/frontend/public ./public

# Copy backend from backend-builder
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/api-server-express.js ./
COPY --from=backend-builder /app/backend/src ./src
COPY --from=backend-builder /app/backend/crawler ./crawler
COPY --from=backend-builder /app/backend/contracts ./contracts
COPY --from=backend-builder /app/backend/database ./database
COPY --from=backend-builder /app/backend/electron ./electron
COPY --from=backend-builder /app/backend/start-*.js ./
COPY --from=backend-builder /app/backend/dom-space-harvester.tsx ./

# Copy package.json for runtime
COPY package*.json ./

# Set Puppeteer environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create necessary directories
RUN mkdir -p /app/logs /app/artifacts /app/temp && \
    chown -R lightdom:nodejs /app

# Switch to non-root user
USER lightdom

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Default command
CMD ["node", "api-server-express.js"]