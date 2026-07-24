import { cookies } from 'next/headers';
import db from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = (email || '').toLowerCase().trim();

    // Try finding user in database first
    let user = await db.users.findOne({ email: cleanEmail });

    // Single unified fallback user — all logins get full Sales Executive access
    if (!user) {
      user = {
        id: 'u1',
        name: 'Rahul Sharma',
        email: cleanEmail,
        role: 'Sales Executive',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      };
    }

    // Always normalize role to a single unified role
    user.role = 'Sales Executive';

    // Sign JWT token
    const token = signToken(user);

    // Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    const { password: _, ...userWithoutPassword } = user;

    return Response.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
