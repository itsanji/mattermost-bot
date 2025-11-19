module.exports = {
  apps: [
    {
      name: 'mattermost-scheduler-bot',
      script: './dist/bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Restart strategy
      exp_backoff_restart_delay: 100,
      // Cron restart (optional - restart every day at 3 AM)
      cron_restart: '0 3 * * *',
      // Time to wait before considering the app as online
      min_uptime: '10s',
      // Number of times a script is restarted when it exits in less than min_uptime
      max_restarts: 10,
      // Stop the app if it exceeds max_restarts
      autorestart: true,
    },
  ],
};

