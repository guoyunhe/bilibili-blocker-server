module.exports = {
  apps: [
    {
      name: 'bilibili-blocker-server',
      cwd: __dirname,
      script: './build/bin/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      max_memory_restart: '1G',
      env: {
        ENV_PATH: __dirname,
        HOST: '127.0.0.1',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'bilibili-blocker-worker',
      cwd: __dirname,
      script: 'node',
      args: 'ace queue:work',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        ENV_PATH: __dirname,
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
}
