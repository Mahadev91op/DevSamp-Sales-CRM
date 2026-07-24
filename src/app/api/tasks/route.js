import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import db from '@/lib/db';

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = {};
    if (user.role === 'Sales Executive') {
      query.assignedTo = user.id;
    }

    const tasks = await db.tasks.find(query);
    return Response.json({ success: true, tasks });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.title || !body.deadline) {
      return Response.json({ error: 'Title and deadline are required' }, { status: 400 });
    }

    const taskData = {
      title: body.title,
      description: body.description || '',
      priority: body.priority || 'Medium',
      deadline: body.deadline,
      assignedTo: body.assignedTo || user.id,
      completed: false,
      isRecurring: body.isRecurring || false,
    };

    const newTask = await db.tasks.create(taskData);
    return Response.json({ success: true, task: newTask });
  } catch (error) {
    console.error('Create task error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.id) {
      return Response.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const updated = await db.tasks.findByIdAndUpdate(body.id, body);
    return Response.json({ success: true, task: updated });
  } catch (error) {
    console.error('Update task error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
