import {NextResponse} from 'next/server';
import {db} from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const checkedAt = new Date().toISOString();
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {status: 'ok', checks: {database: 'up'}, checkedAt},
      {headers: {'Cache-Control': 'no-store'}},
    );
  } catch {
    // Do not expose connection strings, SQL, or provider error details publicly.
    return NextResponse.json(
      {status: 'degraded', checks: {database: 'down'}, checkedAt},
      {status: 503, headers: {'Cache-Control': 'no-store'}},
    );
  }
}
