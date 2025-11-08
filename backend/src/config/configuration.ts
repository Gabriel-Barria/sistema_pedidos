export default () => ({
  node_env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  api: {
    prefix: process.env.API_PREFIX || 'api',
    version: process.env.API_VERSION || 'v1',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    accessTokenExpiresIn: parseInt(
      process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '900',
      10,
    ), // 15 minutes
    refreshTokenExpiresIn: parseInt(
      process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '604800',
      10,
    ), // 7 days
  },
});
