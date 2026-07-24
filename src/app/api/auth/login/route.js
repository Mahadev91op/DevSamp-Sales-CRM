import { cookies } from 'next/headers';
import db from '@/lib/db';
import { comparePasswords, signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user in database
    const user = await db.users.findOne({ email });
    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Compare passwords
    const isMatch = comparePasswords(password, user.password);
    if (!isMatch) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Sign JWT token
    const token = signToken(user);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Remove password hash from response
    const { password: _, ...userWithoutPassword } = user;

    return Response.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
