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

    const shops = await db.shops.find({});
    return Response.json({ success: true, shops });
  } catch (error) {
    console.error('Fetch shops error:', error);
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
    if (!body.storeName || !body.ownerName || !body.mobile || !body.address || !body.city || !body.state || !body.pin) {
      return Response.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    const shopData = {
      storeName: body.storeName,
      ownerName: body.ownerName,
      mobile: body.mobile,
      whatsapp: body.whatsapp || body.mobile,
      email: body.email || '',
      address: body.address,
      city: body.city,
      state: body.state,
      pin: body.pin,
      gst: body.gst || '',
      drugLicense: body.drugLicense || '',
      currentSoftware: body.currentSoftware || 'Marg ERP',
      employees: body.employees || '0',
      businessSize: body.businessSize || 'Small',
      monthlyRevenue: body.monthlyRevenue || '0',
      shopPhoto: body.shopPhoto || 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&auto=format&fit=crop&q=60',
      gpsLocation: body.gpsLocation || '19.0760, 72.8777'
    };

    const newShop = await db.shops.create(shopData);

    // Also auto-create a lead for this shop if requested
    if (body.createLead) {
      await db.leads.create({
        name: body.storeName,
        shopId: newShop.id,
        email: body.email || '',
        phone: body.mobile,
        status: 'New',
        priority: 'Medium',
        assignedTo: user.id,
        notes: `Automatically created lead for new shop: ${body.storeName}. Current software: ${body.currentSoftware}.`,
        qrCode: `DEV-LEAD-${newShop.id}`,
        businessCardPhoto: ''
      });
    }

    // Create activity log
    await db.activities.create({
      userId: user.id,
      type: 'shop_create',
      description: `Registered medical shop ${body.storeName}`,
    });

    return Response.json({ success: true, shop: newShop });
  } catch (error) {
    console.error('Create shop error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
