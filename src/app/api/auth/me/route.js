import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import db from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return Response.json({ user: null });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return Response.json({ user: null });
    }

    // Fetch the latest data from db or fallback to token payload
    const user = await db.users.findOne({ email: payload.email });
    if (!user) {
      return Response.json({ user: payload });
    }

    const { password: _, ...userWithoutPassword } = user;
    return Response.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Check session error:', error);
    return Response.json({ user: null });
  }
}
