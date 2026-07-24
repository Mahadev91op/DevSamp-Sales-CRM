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

    const leads = await db.leads.find(query);
    return Response.json({ success: true, leads });
  } catch (error) {
    console.error('Fetch leads error:', error);
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
    if (!body.name || !body.phone || !body.shopId) {
      return Response.json({ error: 'Name, Phone and Shop details are required' }, { status: 400 });
    }

    const leadData = {
      name: body.name,
      shopId: body.shopId,
      email: body.email || '',
      phone: body.phone,
      status: body.status || 'New',
      priority: body.priority || 'Medium',
      assignedTo: body.assignedTo || user.id,
      notes: body.notes || '',
      qrCode: `DEV-LEAD-${body.shopId}-${Math.floor(Math.random() * 1000)}`,
      businessCardPhoto: body.businessCardPhoto || '',
    };

    const newLead = await db.leads.create(leadData);

    // Create activity log
    await db.activities.create({
      userId: user.id,
      type: 'lead_create',
      description: `Created new lead for ${body.name}`,
    });

    return Response.json({ success: true, lead: newLead });
  } catch (error) {
    console.error('Create lead error:', error);
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
      return Response.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const currentLead = await db.leads.findById(body.id);
    if (!currentLead) {
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Update fields
    const updated = await db.leads.findByIdAndUpdate(body.id, body);

    // Create activity log if status changed
    if (body.status && body.status !== currentLead.status) {
      await db.activities.create({
        userId: user.id,
        type: 'lead_update',
        description: `Updated lead status of ${currentLead.name} to ${body.status}`,
      });
    }

    return Response.json({ success: true, lead: updated });
  } catch (error) {
    console.error('Update lead error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
