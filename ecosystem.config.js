/**
 * PM2 Ecosystem Configuration for LightDom
 * 
 * This configuration ensures the API server and RAG service run 24/7 with:
 * - Automatic restart on failure
 * - Clustering for performance
 * - Log rotation
 * - Memory limits
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 start ecosystem.config.js --only lightdom-api
 *   pm2 start ecosystem.config.js --only lightdom-rag
 * 
 * Monitoring:
 *   pm2 monit
 *   pm2 logs lightdom-api
 *   pm2 logs lightdom-rag
 */

module.exports = {
  apps: [
    {
      name: 'lightdom-api',
      script: 'api-server-express.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'dom_space_harvester',
        DB_USER: 'postgres',
        DB_PASSWORD: 'postgres',
        OLLAMA_ENDPOINT: 'http://localhost:11434',
        EMBEDDING_MODEL: 'nomic-embed-text',
        OLLAMA_MODEL: 'lightdom-deepseek',
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Restart policy
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      restart_delay: 3000,
      autorestart: true,
      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2/api-error.log',
      out_file: './logs/pm2/api-out.log',
      combine_logs: true,
      merge_logs: true,
    },
    {
      name: 'lightdom-rag',
      script: 'services/rag/rag-standalone-service.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '2G', // RAG needs more memory for embeddings
      env: {
        NODE_ENV: 'production',
        RAG_SERVICE_PORT: 3002,
        RAG_SERVICE_HOST: '0.0.0.0',
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'dom_space_harvester',
        DB_USER: 'postgres',
        DB_PASSWORD: 'postgres',
        OLLAMA_ENDPOINT: 'http://localhost:11434',
        EMBEDDING_MODEL: 'nomic-embed-text',
        OLLAMA_MODEL: 'lightdom-deepseek',
        RAG_CHUNK_SIZE: 1000,
        RAG_CHUNK_OVERLAP: 200,
        RAG_TOP_K: 5,
        RAG_MIN_SCORE: 0.6,
      },
      env_development: {
        NODE_ENV: 'development',
        RAG_SERVICE_PORT: 3002,
        DEBUG: 'true',
      },
      env_production: {
        NODE_ENV: 'production',
        RAG_SERVICE_PORT: 3002,
      },
      // Restart policy
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      restart_delay: 3000,
      autorestart: true,
      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2/rag-error.log',
      out_file: './logs/pm2/rag-out.log',
      combine_logs: true,
      merge_logs: true,
    },
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'production-server',
      ref: 'origin/main',
      repo: 'git@github.com:DashZeroAlionSystems/LightDom.git',
      path: '/var/www/lightdom',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};
