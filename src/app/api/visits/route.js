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
      query.executiveId = user.id;
    }

    const visits = await db.visits.find(query);
    return Response.json({ success: true, visits });
  } catch (error) {
    console.error('Fetch visits error:', error);
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
    if (!body.shopId || !body.purpose) {
      return Response.json({ error: 'Shop ID and Purpose are required' }, { status: 400 });
    }

    const visitData = {
      shopId: body.shopId,
      leadId: body.leadId || '',
      date: body.date || new Date().toISOString().split('T')[0],
      time: body.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      executiveId: user.id,
      purpose: body.purpose,
      outcome: body.outcome || 'Pending',
      notes: body.notes || '',
      photos: body.photos || [],
      signature: body.signature || '',
      checkInTime: body.checkInTime || new Date().toISOString(),
      checkOutTime: body.checkOutTime || new Date().toISOString(),
      duration: body.duration || '0 mins',
      location: body.location || '19.0760, 72.8777'
    };

    const newVisit = await db.visits.create(visitData);

    // Update lead status if outcome is provided
    if (body.leadId && body.outcome) {
      let leadStatus = '';
      if (body.outcome === 'Interested') leadStatus = 'Interested';
      else if (body.outcome === 'Demo Completed') leadStatus = 'Demo Done';
      else if (body.outcome === 'Trial Started') leadStatus = 'Trial Started';
      else if (body.outcome === 'Deal Won') leadStatus = 'Won';
      else if (body.outcome === 'Deal Lost') leadStatus = 'Lost';

      if (leadStatus) {
        await db.leads.findByIdAndUpdate(body.leadId, { status: leadStatus });
        
        // Log status change
        await db.activities.create({
          userId: user.id,
          type: 'lead_update',
          description: `Logged visit result; status updated to ${leadStatus}`
        });
      }
    }

    // Create activity log
    await db.activities.create({
      userId: user.id,
      type: 'visit_create',
      description: `Logged visit at shop ID: ${body.shopId}`,
    });

    return Response.json({ success: true, visit: newVisit });
  } catch (error) {
    console.error('Create visit error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
