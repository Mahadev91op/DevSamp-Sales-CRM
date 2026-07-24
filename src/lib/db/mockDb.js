import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'src/lib/db/mockdb.json');

// Ensure database file and parent directories exist
function ensureDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData = getSeededData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Simple query matcher for filtering data
function matchesQuery(item, query) {
  if (!query) return true;
  return Object.entries(query).every(([key, val]) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      // Handle simple operators like $in or $or
      return Object.entries(val).every(([op, opVal]) => {
        if (op === '$in') {
          return Array.isArray(opVal) && opVal.includes(item[key]);
        }
        if (op === '$nin') {
          return Array.isArray(opVal) && !opVal.includes(item[key]);
        }
        if (op === '$regex') {
          const regex = new RegExp(opVal, 'i');
          return regex.test(item[key]);
        }
        return false;
      });
    }
    // Direct match
    return item[key] === val;
  });
}

class MockCollection {
  constructor(name) {
    this.name = name;
  }

  read() {
    ensureDb();
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      return data[this.name] || [];
    } catch (e) {
      console.error(`Error reading collection ${this.name}`, e);
      return [];
    }
  }

  write(items) {
    ensureDb();
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      data[this.name] = items;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
      return true;
    } catch (e) {
      console.error(`Error writing collection ${this.name}`, e);
      return false;
    }
  }

  async find(query = {}) {
    const items = this.read();
    return items.filter(item => matchesQuery(item, query));
  }

  async findOne(query = {}) {
    const items = this.read();
    return items.find(item => matchesQuery(item, query)) || null;
  }

  async findById(id) {
    return this.findOne({ id });
  }

  async create(data) {
    const items = this.read();
    const newItem = {
      id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    items.push(newItem);
    this.write(items);
    return newItem;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const items = this.read();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;

    const current = items[index];
    const updatedFields = update.$set ? { ...update.$set } : update;
    const updated = {
      ...current,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    };
    items[index] = updated;
    this.write(items);
    return updated;
  }

  async findOneAndUpdate(query, update, options = {}) {
    const items = this.read();
    const index = items.findIndex(item => matchesQuery(item, query));
    if (index === -1) return null;

    const current = items[index];
    const updatedFields = update.$set ? { ...update.$set } : update;
    const updated = {
      ...current,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    };
    items[index] = updated;
    this.write(items);
    return updated;
  }

  async deleteOne(query) {
    const items = this.read();
    const index = items.findIndex(item => matchesQuery(item, query));
    if (index === -1) return { deletedCount: 0 };
    items.splice(index, 1);
    this.write(items);
    return { deletedCount: 1 };
  }

  async countDocuments(query = {}) {
    const items = this.read();
    return items.filter(item => matchesQuery(item, query)).length;
  }
}

export const db = {
  users: new MockCollection('users'),
  shops: new MockCollection('shops'),
  leads: new MockCollection('leads'),
  visits: new MockCollection('visits'),
  tasks: new MockCollection('tasks'),
  trials: new MockCollection('trials'),
  subscriptions: new MockCollection('subscriptions'),
  competitors: new MockCollection('competitors'),
  activities: new MockCollection('activities'),
};

function getSeededData() {
  return {
    users: [
      {
        id: 'u1',
        name: 'Super Admin',
        email: 'admin@crm.com',
        password: '$2a$10$wK1G0fD78kXpQvS/rW9hAed6PZJmXW3yvJbFk6.8R2qQo0eP2uWjS',
        role: 'Super Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      },
      {
        id: 'u2',
        name: 'Sales Manager',
        email: 'manager@crm.com',
        password: '$2a$10$q0iRk5N/0V/W521vJ671keoM8S29T1dI2yK85eD/K5yv3cZ0H2q92',
        role: 'Sales Manager',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      },
      {
        id: 'u3',
        name: 'Sales Executive',
        email: 'executive@crm.com',
        password: '$2a$10$d1gXU0mF99H.aK81ke5ZYeK.Y8U489e.Z3hH0yY10rS.u3y/T2z3m',
        role: 'Sales Executive',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      }
    ],
    shops: [
      {
        id: 's1',
        storeName: 'Care Plus Pharmacy',
        ownerName: 'Dr. Ramesh Sharma',
        mobile: '9876543210',
        whatsapp: '9876543210',
        email: 'ramesh@careplus.com',
        address: 'Shop No. 12, Metro Plaza, MG Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pin: '400001',
        gst: '27AAAAA1111A1Z1',
        drugLicense: 'DL-12345-MUM',
        currentSoftware: 'Marg ERP',
        employees: '3',
        businessSize: 'Medium',
        monthlyRevenue: '450000',
        shopPhoto: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&auto=format&fit=crop&q=60',
        gpsLocation: '19.0760, 72.8777'
      },
      {
        id: 's2',
        storeName: 'Apex Health Center',
        ownerName: 'Amit Verma',
        mobile: '9876543211',
        whatsapp: '9876543211',
        email: 'amit@apexhealth.com',
        address: '15/A, Green Avenue, Sector 15',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pin: '201301',
        gst: '09BBBBB2222B2Z2',
        drugLicense: 'DL-67890-UP',
        currentSoftware: 'Vyapar',
        employees: '2',
        businessSize: 'Small',
        monthlyRevenue: '220000',
        shopPhoto: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&auto=format&fit=crop&q=60',
        gpsLocation: '28.5700, 77.3200'
      },
      {
        id: 's3',
        storeName: 'Wellness Chemists',
        ownerName: 'Mrs. Neha Gupta',
        mobile: '9876543212',
        whatsapp: '9876543212',
        email: 'neha@wellnesschem.com',
        address: 'Ground Floor, Galleria Mall, DLF Phase 4',
        city: 'Gurugram',
        state: 'Haryana',
        pin: '122002',
        gst: '06CCCCC3333C3Z3',
        drugLicense: 'DL-11223-HR',
        currentSoftware: 'GoFrugal',
        employees: '5',
        businessSize: 'Large',
        monthlyRevenue: '850000',
        shopPhoto: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=60',
        gpsLocation: '28.4595, 77.0266'
      }
    ],
    leads: [
      {
        id: 'l1',
        name: 'Care Plus Pharmacy',
        shopId: 's1',
        email: 'ramesh@careplus.com',
        phone: '9876543210',
        status: 'Trial Started',
        priority: 'High',
        assignedTo: 'u3',
        notes: 'Interested in switching from Marg ERP due to pricing and lack of mobile app.',
        qrCode: 'DEV-LEAD-s1',
        businessCardPhoto: ''
      },
      {
        id: 'l2',
        name: 'Apex Health Center',
        shopId: 's2',
        email: 'amit@apexhealth.com',
        phone: '9876543211',
        status: 'Contacted',
        priority: 'Medium',
        assignedTo: 'u3',
        notes: 'Wants a simple software for billing. Booked a demo.',
        qrCode: 'DEV-LEAD-s2',
        businessCardPhoto: ''
      },
      {
        id: 'l3',
        name: 'Wellness Chemists',
        shopId: 's3',
        email: 'neha@wellnesschem.com',
        phone: '9876543212',
        status: 'Negotiation',
        priority: 'High',
        assignedTo: 'u3',
        notes: 'Bigger store. Demanding a discount on yearly plan.',
        qrCode: 'DEV-LEAD-s3',
        businessCardPhoto: ''
      }
    ],
    visits: [
      {
        id: 'v1',
        shopId: 's1',
        leadId: 'l1',
        date: new Date().toISOString().split('T')[0],
        time: '11:00 AM',
        executiveId: 'u3',
        purpose: 'Software Demo',
        outcome: 'Interested',
        notes: 'Gave a complete demo of the billing and inventory modules. The client liked the UI and mobile dashboard.',
        photos: ['https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=40'],
        signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><path d="M 10 30 Q 30 10 50 30 T 90 30" fill="none" stroke="black" stroke-width="2"/></svg>',
        checkInTime: new Date(new Date().setHours(11, 0, 0)).toISOString(),
        checkOutTime: new Date(new Date().setHours(11, 45, 0)).toISOString(),
        duration: '45 mins',
        location: '19.0760, 72.8777'
      },
      {
        id: 'v2',
        shopId: 's2',
        leadId: 'l2',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        time: '03:30 PM',
        executiveId: 'u3',
        purpose: 'Cold Visit',
        outcome: 'Scheduled Demo',
        notes: 'Store owner was busy. Scheduled a follow-up demo for tomorrow.',
        photos: [],
        signature: '',
        checkInTime: new Date(Date.now() - 86400000).toISOString(),
        checkOutTime: new Date(Date.now() - 86400000 + 1200000).toISOString(),
        duration: '20 mins',
        location: '28.5700, 77.3200'
      }
    ],
    tasks: [
      {
        id: 't1',
        title: 'Call Mrs. Neha for Renewal',
        description: 'Discuss discount option and final quote.',
        priority: 'High',
        deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        assignedTo: 'u3',
        completed: false,
        isRecurring: false
      },
      {
        id: 't2',
        title: 'Submit Daily Visit Report',
        description: 'Update CRM logs and upload check-out photos.',
        priority: 'Medium',
        deadline: new Date().toISOString().split('T')[0],
        assignedTo: 'u3',
        completed: false,
        isRecurring: true
      }
    ],
    trials: [
      {
        id: 'tr1',
        leadId: 'l1',
        shopId: 's1',
        startDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0],
        daysRemaining: 9,
        status: 'Active',
        feedbackVideo: ''
      }
    ],
    subscriptions: [
      {
        id: 'sub1',
        shopId: 's3',
        status: 'Active',
        plan: 'Yearly Professional',
        amount: '12000',
        renewalDate: new Date(Date.now() + 250 * 86400000).toISOString().split('T')[0],
        invoices: [
          {
            id: 'inv-1001',
            date: new Date(Date.now() - 115 * 86400000).toISOString().split('T')[0],
            amount: '12000',
            status: 'Paid'
          }
        ]
      }
    ],
    competitors: [
      {
        id: 'c1',
        shopId: 's1',
        softwareName: 'Marg ERP',
        monthlyCost: '800',
        renewalDate: '2026-10-15',
        likeFactors: 'Rich inventory features, works offline, very popular among distributors.',
        weaknesses: 'Difficult user interface, no cloud sync, expensive mobile reporting add-on.'
      }
    ],
    activities: [
      {
        id: 'act1',
        userId: 'u3',
        type: 'lead_update',
        description: 'Updated Care Plus Pharmacy status to Trial Started.',
        timestamp: new Date().toISOString()
      },
      {
        id: 'act2',
        userId: 'u3',
        type: 'visit_create',
        description: 'Logged visit to Care Plus Pharmacy.',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  };
}
