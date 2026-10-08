import { defineConfig, devices } from '@playwright/test';

const CMS_PORT = 1337;
const WEB_PORT = 3000;
const REVALIDATE_SECRET = 'e2e-revalidate-secret';
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;

/**
 * End-to-end tests run against the real stack: Strapi with a fresh SQLite
 * database seeded on boot, and the production build of the Next.js app. The
 * secrets below are throwaway values for this local test run only.
 */
const cmsEnv = {
  NODE_ENV: 'production',
  HOST: '127.0.0.1',
  PORT: String(CMS_PORT),
  DATABASE_CLIENT: 'sqlite',
  DATABASE_FILENAME: '.tmp/e2e.db',
  APP_KEYS: 'e2eKeyOne,e2eKeyTwo',
  API_TOKEN_SALT: 'e2e-api-token-salt',
  ADMIN_JWT_SECRET: 'e2e-admin-jwt-secret',
  JWT_SECRET: 'e2e-jwt-secret',
  TRANSFER_TOKEN_SALT: 'e2e-transfer-token-salt',
  ENCRYPTION_KEY: 'e2e-encryption-key-32-characters',
  FRONTEND_REVALIDATE_URL: `http://127.0.0.1:${WEB_PORT}/api/revalidate`,
  FRONTEND_REVALIDATE_SECRET: REVALIDATE_SECRET,
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${WEB_PORT}`,
    trace: 'retain-on-failure',
    ...(chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {}),
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      // Delete the previous run's database so every run starts from the seed.
      command: `node -e "require('fs').rmSync('.tmp/e2e.db',{force:true})" && npm run start`,
      cwd: '../cms',
      url: `http://127.0.0.1:${CMS_PORT}/_health`,
      env: cmsEnv,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      // The CMS database is reset every run, so the frontend's cached CMS data
      // must be too, or it serves content from the previous run.
      command: `npm run build && node -e "require('fs').rmSync('.next/cache/fetch-cache',{recursive:true,force:true})" && npm run start`,
      url: `http://127.0.0.1:${WEB_PORT}`,
      env: {
        STRAPI_URL: `http://127.0.0.1:${CMS_PORT}`,
        REVALIDATE_SECRET,
        CMS_REVALIDATE_SECONDS: '300',
      },
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
