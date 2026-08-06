module.exports = {
  apps: [
    {
      name: 'tmplanning',
      script: 'app.js',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
