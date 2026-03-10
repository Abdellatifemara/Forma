module.exports = {
  apps: [
    {
      name: 'forma-api',
      script: 'dist/src/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      // Graceful restart
      kill_timeout: 5000,
      listen_timeout: 10000,
      // Auto-restart on memory leak
      max_memory_restart: '512M',
      // Logging
      error_file: '/var/log/pm2/forma-api-error.log',
      out_file: '/var/log/pm2/forma-api-out.log',
      merge_logs: true,
      // Watch disabled in production
      watch: false,
    },
  ],
};
