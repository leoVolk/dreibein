module.exports = {
  apps: [
    {
      name: 'pocketbase',
      script: 'go run db/main.go serve --dir ~/db',
      instances: 1,
      autorestart: false,
      "log_date_format": "YYYY-MM-DD HH:mm:ss PocketBase: "
    },
    {
      name: 'nuxt dev',
      script: 'yarn dev:nuxt',
      instances: 1,
      autorestart: false,
      "log_date_format": "YYYY-MM-DD HH:mm:ss Nuxt: "
    }
  ]
};
