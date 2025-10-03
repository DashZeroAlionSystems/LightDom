# SEO Pipeline Dockerfile
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    build-base \
    curl \
    postgresql-client

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create directories for models and logs
RUN mkdir -p models logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S seo-pipeline -u 1001

# Change ownership of app directory
RUN chown -R seo-pipeline:nodejs /app
USER seo-pipeline

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/api/seo/health || exit 1

# Start the application
CMD ["npm", "start"]