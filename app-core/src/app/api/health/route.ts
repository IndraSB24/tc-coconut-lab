import { apiSuccess } from '@/lib/api-response';

export async function GET() {
  return apiSuccess({
    status: 'ONLINE',
    engine: 'Next.js 16 App Router',
    database: 'SQLite (Prisma ORM)',
    architecture: 'Clean Architecture / DDD',
    timestamp: new Date().toISOString(),
  });
}
