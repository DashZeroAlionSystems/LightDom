# Workflow Automator Dockerfile
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl \
    bash \
    postgresql-client \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY workflow-automator.js ./
COPY knowledge-graph-mcp-server.js ./

# Create directories
RUN mkdir -p /app/automations /app/logs

# Set environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3005/health || exit 1

# Expose port
EXPOSE 3005

# Default command
CMD ["node", "workflow-automator.js"]
