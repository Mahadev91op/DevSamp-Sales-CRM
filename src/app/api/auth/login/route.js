import { cookies } from 'next/headers';
import db from '@/lib/db';
import { comparePasswords, signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    // Find user in database
    let user = await db.users.findOne({ email: cleanEmail });

    // Built-in fallback users for reliable demo access
    if (!user) {
      const defaultUsersMap = {
        'admin@crm.com': {
          id: 'u1',
          name: 'Super Admin',
          email: 'admin@crm.com',
          password: 'admin123',
          role: 'Super Admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        },
        'manager@crm.com': {
          id: 'u2',
          name: 'Sales Manager',
          email: 'manager@crm.com',
          password: 'manager123',
          role: 'Sales Manager',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        },
        'executive@crm.com': {
          id: 'u3',
          name: 'Sales Executive',
          email: 'executive@crm.com',
          password: 'executive123',
          role: 'Sales Executive',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        }
      };
      if (defaultUsersMap[cleanEmail]) {
        user = defaultUsersMap[cleanEmail];
      }
    }

    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Compare passwords
    const isMatch = comparePasswords(cleanPassword, user.password);
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
