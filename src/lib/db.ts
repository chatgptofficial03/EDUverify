import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  // Check if running in a serverless environment (Vercel, AWS Lambda, Netlify, Linux production)
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY ||
    (process.platform === 'linux' && process.env.NODE_ENV === 'production')
  );

  if (isServerless) {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      const possibleSources = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
        path.join(__dirname, '..', '..', '..', 'prisma', 'dev.db'),
      ];

      for (const src of possibleSources) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, tmpDbPath);
            break;
          } catch (e) {
            console.error('Failed to copy SQLite database to /tmp:', e);
          }
        }
      }
    }
    const targetUrl = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = targetUrl;
    return targetUrl;
  }

  // Ensure any environment DATABASE_URL begins with file: for SQLite
  if (process.env.DATABASE_URL) {
    let url = process.env.DATABASE_URL.trim();
    if (!url.startsWith('file:')) {
      url = `file:${url}`;
    }
    process.env.DATABASE_URL = url;
    return url;
  }

  // Default SQLite file URL
  const defaultUrl = 'file:./dev.db';
  process.env.DATABASE_URL = defaultUrl;
  return defaultUrl;
}

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
