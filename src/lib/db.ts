import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  // If user provided a remote database (e.g. PostgreSQL, MySQL in production), respect it
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
    return process.env.DATABASE_URL;
  }

  // Check if running in a serverless environment (Vercel, AWS Lambda, Netlify)
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

  // Local / standard server environment
  const defaultLocalDb = path.resolve(process.cwd(), 'prisma', 'dev.db');
  let finalUrl = `file:${defaultLocalDb}`;

  if (process.env.DATABASE_URL) {
    const cleanPath = process.env.DATABASE_URL.replace(/^file:/, '');
    if (path.isAbsolute(cleanPath) && fs.existsSync(cleanPath)) {
      finalUrl = process.env.DATABASE_URL;
    } else if (fs.existsSync(defaultLocalDb)) {
      finalUrl = `file:${defaultLocalDb}`;
    } else {
      finalUrl = process.env.DATABASE_URL;
    }
  }

  process.env.DATABASE_URL = finalUrl;
  return finalUrl;
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
