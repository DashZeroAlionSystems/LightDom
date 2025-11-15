# AI Research Pipeline - Troubleshooting Guide

## Quick Diagnostics

Run this command first to check system health:

```bash
npm run research:validate
```

If all 24 tests pass ✅, your system is properly configured.

## Common Issues & Solutions

### 1. Module Not Found Errors

**Error**: `Cannot find package 'pg'` or similar

**Solution**:
```bash
# Install dependencies
npm install

# Or with legacy peer deps if needed
npm install --legacy-peer-deps
```

### 2. Database Connection Errors

**Error**: `Database connection failed` or `ECONNREFUSED`

**Diagnosis**:
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT NOW();"

# Check if database exists
psql -U postgres -l | grep lightdom
```

**Solutions**:

a) Start PostgreSQL:
```bash
# On Linux
sudo service postgresql start

# On macOS
brew services start postgresql

# On Windows
net start postgresql
```

b) Create database:
```bash
psql -U postgres -c "CREATE DATABASE lightdom;"
```

c) Initialize schema:
```bash
psql -U postgres -d lightdom -f database/ai-research-pipeline-schema.sql
```

d) Check environment variables:
```bash
# View current settings
echo $DB_HOST
echo $DB_NAME
echo $DB_USER

# Set if needed
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=lightdom
export DB_USER=postgres
export DB_PASSWORD=postgres
```

### 3. API Server Not Running

**Error**: `Connection refused` when calling API endpoints

**Diagnosis**:
```bash
# Check if server is running
curl http://localhost:3001/api/health

# Check port 3001
lsof -i :3001
```

**Solutions**:

a) Start the API server:
```bash
npm run api
# or
npm run start:dev
```

b) Check if port is in use:
```bash
# Find process using port 3001
lsof -i :3001

# Kill if needed
kill -9 <PID>
```

c) Use different port:
```bash
PORT=3002 npm run api
```

### 4. Rate Limiting Issues

**Error**: `429 Too Many Requests` or rate limit warnings

**Solutions**:

a) Wait for rate limit window to reset (usually 1 hour)

b) Adjust rate limits in config:
```json
// research-pipeline-config.json
{
  "scraping": {
    "rate_limit_per_hour": 100  // Increase from 50
  }
}
```

c) Spread scraping over longer intervals:
```bash
# Run every 6 hours instead of every 3
node start-research-pipeline.js --interval 360
```

### 5. Puppeteer/Browser Issues

**Error**: `Failed to launch browser` or `Chrome not found`

**Solutions**:

a) Install Chromium (Linux):
```bash
sudo apt-get update
sudo apt-get install -y chromium-browser
```

b) Install required dependencies (Linux):
```bash
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

c) Use system Chrome:
```bash
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

d) Run in non-headless mode for debugging:
```bash
node start-research-pipeline.js --no-headless
```

### 6. Schema/Table Not Found

**Error**: `relation "research_articles" does not exist`

**Solution**:
```bash
# Re-initialize schema
psql -U postgres -d lightdom -f database/ai-research-pipeline-schema.sql

# Verify tables exist
psql -U postgres -d lightdom -c "\dt research_*"
```

### 7. Permission Denied

**Error**: `Permission denied` when accessing database

**Solution**:
```bash
# Grant permissions
psql -U postgres -d lightdom -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;"
psql -U postgres -d lightdom -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;"
```

### 8. Out of Memory

**Error**: `JavaScript heap out of memory`

**Solutions**:

a) Increase Node memory:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run research:start
```

b) Reduce concurrent operations:
```javascript
// In research-pipeline-config.json
{
  "scraping": {
    "max_concurrent_requests": 3  // Reduce from 5
  }
}
```

c) Lower articles per run:
```bash
node start-research-pipeline.js --articles 50  # Instead of 100
```

### 9. No Articles Found

**Error**: Articles scraped but none stored or `articlesFound: 0`

**Diagnosis**:
```bash
# Check if scraping works
npm run research:demo:mock  # Should work without network

# Check network access
curl -I https://dev.to

# Check rate limits
# Wait a few minutes if recently scraped
```

**Solutions**:

a) Verify topics are correct:
```bash
# Use valid dev.to topics
node start-research-pipeline.js --topics ai,ml,llm,python,javascript
```

b) Check relevance threshold:
```javascript
// In research-pipeline-config.json
{
  "campaigns": {
    "min_relevance_score": 0.4  // Lower from 0.6
  }
}
```

### 10. Validation Failures

**Error**: Some tests failing in `npm run research:validate`

**Solutions**:

a) Check which tests failed:
```bash
npm run research:validate 2>&1 | grep "✗"
```

b) Common fixes:
- Missing files: Re-clone or check file paths
- Syntax errors: Run `node -c <filename>` to check
- Schema issues: Re-run database initialization

## Performance Issues

### Slow Scraping

**Solutions**:
1. Increase concurrent requests (if server can handle it)
2. Use faster network connection
3. Reduce articles per run
4. Enable caching in config

### High Memory Usage

**Solutions**:
1. Reduce max_concurrent_requests
2. Lower articles_per_run
3. Enable garbage collection interval
4. Restart service periodically

### Database Slow

**Solutions**:
```sql
-- Add more indexes
CREATE INDEX idx_articles_scraped_recent ON research_articles(scraped_at DESC) WHERE scraped_at > NOW() - INTERVAL '30 days';

-- Vacuum and analyze
VACUUM ANALYZE research_articles;
VACUUM ANALYZE feature_recommendations;

-- Check slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

## Testing Without Full Setup

If you want to test without database or network:

```bash
# Run mock demo (no dependencies required)
npm run research:demo:mock

# Run validation (checks files and syntax only)
npm run research:validate
```

## Getting Help

### Check Logs

```bash
# Service logs (if enabled)
tail -f logs/research-pipeline.log

# API server logs
npm run api 2>&1 | tee api.log

# System logs
journalctl -u postgresql -n 50
```

### Debug Mode

Run with verbose output:
```bash
DEBUG=* node start-research-pipeline.js
```

### Health Checks

```bash
# Database
psql -U postgres -d lightdom -c "SELECT COUNT(*) FROM research_articles;"

# API
curl http://localhost:3001/api/research/status

# Service status
ps aux | grep research-pipeline
```

## Still Having Issues?

1. **Run validation**: `npm run research:validate`
2. **Check documentation**: Review README files
3. **Verify environment**: Check all environment variables
4. **Test components individually**: Use mock demo first
5. **Review logs**: Check for specific error messages
6. **Clean install**: Remove `node_modules` and reinstall

## Quick Reset

If everything is broken, try a clean restart:

```bash
# Stop all services
pkill -f research-pipeline
pkill -f api-server

# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Reset database
psql -U postgres -d lightdom -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -U postgres -d lightdom -f database/ai-research-pipeline-schema.sql

# Validate
npm run research:validate

# Start fresh
npm run research:start
```

## Prevention Tips

1. **Always validate first**: Run `npm run research:validate` before starting
2. **Use mock demo**: Test workflow with `npm run research:demo:mock`
3. **Check environment**: Verify all env vars are set correctly
4. **Monitor resources**: Watch memory and CPU usage
5. **Backup data**: Export important findings regularly
6. **Update regularly**: Keep dependencies up to date
7. **Read logs**: Check logs for early warning signs

## Contact

If you've tried everything and still have issues:
1. Check the GitHub issues for similar problems
2. Review all documentation files
3. Verify your environment matches requirements
4. Try the mock demo to isolate the issue
