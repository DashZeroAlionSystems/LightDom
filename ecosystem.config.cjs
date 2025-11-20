/**
 * PM2 Ecosystem Configuration for LightDom Services
 * 
 * This configuration file defines how PM2 should manage the RAG service
 * and potentially other services in the LightDom platform.
 * 
 * Usage:
 *   pm2 start ecosystem.config.cjs                    # Start all services
 *   pm2 start ecosystem.config.cjs --only rag-service # Start only RAG service
 *   pm2 restart rag-service                           # Restart RAG service
 *   pm2 stop rag-service                              # Stop RAG service
 *   pm2 logs rag-service                              # View logs
 *   pm2 monit                                         # Monitor all services
 */

module.exports = {
  apps: [
    {
      // RAG Service Configuration
      name: 'rag-service',
      script: './services/rag/rag-standalone-service.js',
      interpreter: 'node',
      interpreter_args: '--experimental-specifier-resolution=node',
      
      // Instance configuration
      instances: 1, // Single instance for database consistency
      exec_mode: 'fork',
      
      // Auto-restart configuration
      autorestart: true,
      watch: false, // Set to true for development
      max_memory_restart: '1G',
      
      // Restart policy
      min_uptime: '10s', // Minimum uptime before considered stable
      max_restarts: 10, // Maximum restarts within restart_delay
      restart_delay: 4000, // Delay between restarts (ms)
      
      // Exponential backoff restart delay
      exp_backoff_restart_delay: 100,
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        RAG_SERVICE_PORT: 3002,
        RAG_SERVICE_HOST: '0.0.0.0',
        RAG_LOG_DIR: './logs',
        DEBUG: 'false'
      },
      
      env_development: {
        NODE_ENV: 'development',
        RAG_SERVICE_PORT: 3002,
        RAG_SERVICE_HOST: 'localhost',
        RAG_LOG_DIR: './logs',
        DEBUG: 'true',
        watch: true
      },
      
      env_production: {
        NODE_ENV: 'production',
        RAG_SERVICE_PORT: 3002,
        RAG_SERVICE_HOST: '0.0.0.0',
        RAG_LOG_DIR: './logs',
        DEBUG: 'false'
      },
      
      // Logging configuration
      error_file: './logs/pm2-rag-error.log',
      out_file: './logs/pm2-rag-out.log',
      log_file: './logs/pm2-rag-combined.log',
      time: true, // Prefix logs with time
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Process management
      kill_timeout: 5000, // Time to wait for graceful shutdown
      wait_ready: true, // Wait for process.send('ready')
      listen_timeout: 10000, // Time to wait for listen event
      
      // Source map support
      source_map_support: true,
      
      // Additional options
      ignore_watch: ['node_modules', 'logs', '.git'],
      
      // Cron restart (optional - restart daily at 3 AM)
      // cron_restart: '0 3 * * *',
      
      // Health check (PM2 Plus)
      // Requires PM2 Plus subscription
      // pmx: true,
      
      // Error handling
      crash_delay: 1000, // Delay before restart after crash
    },
    
    // Additional services can be added here
    // Example: Main API Server
    /*
    {
      name: 'api-server',
      script: './api-server-express.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
    */
  ],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'node',
      host: 'your-production-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:DashZeroAlionSystems/LightDom.git',
      path: '/var/www/lightdom',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.cjs --env production'
    },
    
    staging: {
      user: 'node',
      host: 'your-staging-server.com',
      ref: 'origin/develop',
      repo: 'git@github.com:DashZeroAlionSystems/LightDom.git',
      path: '/var/www/lightdom-staging',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.cjs --env development'
    }
  }
};
