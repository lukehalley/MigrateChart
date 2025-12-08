import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';

/**
 * GET /api/admin/auth/check
 * Check if user is authenticated
 */
export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({ authenticated: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
