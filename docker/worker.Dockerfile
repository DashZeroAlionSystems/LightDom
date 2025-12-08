FROM node:18-alpine
WORKDIR /usr/src/app

# Install simple tooling
RUN apk add --no-cache git ca-certificates python3 make g++

# Copy package files if present to leverage layer caching. If project doesn't
# use package.json at repo root, this is a best-effort file for users to customize.
COPY package*.json ./
RUN if [ -f package.json ]; then npm ci --production; else echo "no package.json"; fi

# Copy the workspace files (the worker and extractor)
COPY . .

ENV NODE_ENV=production

CMD [ "node", "workers/headless-worker.js" ]
