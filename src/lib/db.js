import mongoose from 'mongoose';
import { db as mockDb } from './db/mockDb.js';

const MONGODB_URI = process.env.MONGODB_URI;

// Check if we should use MongoDB or MockDB
let useMongo = false;

if (MONGODB_URI) {
  try {
    // Synchronously mark as true, then connect asynchronously
    useMongo = true;
    if (mongoose.connection.readyState === 0) {
      mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }).catch(err => {
        console.warn('MongoDB connection failed, falling back to JSON mock database:', err.message);
        useMongo = false;
      });
    }
  } catch (e) {
    console.warn('MongoDB connection failed, falling back to JSON mock database:', e.message);
    useMongo = false;
  }
}

// Define Schemas
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Super Admin', 'Sales Manager', 'Sales Executive'], required: true },
  avatar: { type: String, default: '' },
}, { timestamps: true });

const ShopSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  ownerName: { type: String, required: true },
  mobile: { type: String, required: true },
  whatsapp: { type: String },
  email: { type: String },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pin: { type: String, required: true },
  gst: { type: String },
  drugLicense: { type: String },
  currentSoftware: { type: String },
  employees: { type: String },
  businessSize: { type: String },
  monthlyRevenue: { type: String },
  shopPhoto: { type: String },
  gpsLocation: { type: String }
}, { timestamps: true });

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shopId: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  status: { type: String, required: true },
  priority: { type: String, default: 'Medium' },
  assignedTo: { type: String },
  notes: { type: String },
  qrCode: { type: String },
  businessCardPhoto: { type: String }
}, { timestamps: true });

const VisitSchema = new mongoose.Schema({
  shopId: { type: String, required: true },
  leadId: { type: String },
  date: { type: String, required: true },
  time: { type: String },
  executiveId: { type: String, required: true },
  purpose: { type: String },
  outcome: { type: String },
  notes: { type: String },
  photos: [{ type: String }],
  signature: { type: String },
  checkInTime: { type: String },
  checkOutTime: { type: String },
  duration: { type: String },
  location: { type: String }
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, default: 'Medium' },
  deadline: { type: String },
  assignedTo: { type: String },
  completed: { type: Boolean, default: false },
  isRecurring: { type: Boolean, default: false }
}, { timestamps: true });

const TrialSchema = new mongoose.Schema({
  leadId: { type: String, required: true },
  shopId: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  daysRemaining: { type: Number },
  status: { type: String, default: 'Active' },
  feedbackVideo: { type: String }
}, { timestamps: true });

const SubscriptionSchema = new mongoose.Schema({
  shopId: { type: String, required: true },
  status: { type: String, required: true },
  plan: { type: String },
  amount: { type: String },
  renewalDate: { type: String },
  invoices: [{
    id: String,
    date: String,
    amount: String,
    status: String
  }]
}, { timestamps: true });

const CompetitorSchema = new mongoose.Schema({
  shopId: { type: String, required: true },
  softwareName: { type: String, required: true },
  monthlyCost: { type: String },
  renewalDate: { type: String },
  likeFactors: { type: String },
  weaknesses: { type: String }
}, { timestamps: true });

const ActivitySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toISOString() }
});

// Compile Models
const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);
const MongoShop = mongoose.models.Shop || mongoose.model('Shop', ShopSchema);
const MongoLead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
const MongoVisit = mongoose.models.Visit || mongoose.model('Visit', VisitSchema);
const MongoTask = mongoose.models.Task || mongoose.model('Task', TaskSchema);
const MongoTrial = mongoose.models.Trial || mongoose.model('Trial', TrialSchema);
const MongoSubscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
const MongoCompetitor = mongoose.models.Competitor || mongoose.model('Competitor', CompetitorSchema);
const MongoActivity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);

// Mongoose Adapter to unify APIs
class MongooseAdapter {
  constructor(model) {
    this.model = model;
  }

  async find(query = {}) {
    // Convert id query if needed
    const queryCopy = { ...query };
    if (queryCopy.id) {
      queryCopy._id = queryCopy.id;
      delete queryCopy.id;
    }
    const docs = await this.model.find(queryCopy).lean();
    return docs.map(doc => ({ id: doc._id.toString(), ...doc }));
  }

  async findOne(query = {}) {
    const queryCopy = { ...query };
    if (queryCopy.id) {
      queryCopy._id = queryCopy.id;
      delete queryCopy.id;
    }
    const doc = await this.model.findOne(queryCopy).lean();
    if (!doc) return null;
    return { id: doc._id.toString(), ...doc };
  }

  async findById(id) {
    const doc = await this.model.findById(id).lean();
    if (!doc) return null;
    return { id: doc._id.toString(), ...doc };
  }

  async create(data) {
    const doc = await this.model.create(data);
    const obj = doc.toObject();
    return { id: obj._id.toString(), ...obj };
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const updatedFields = update.$set ? update.$set : update;
    const doc = await this.model.findByIdAndUpdate(id, { $set: updatedFields }, { new: true, ...options }).lean();
    if (!doc) return null;
    return { id: doc._id.toString(), ...doc };
  }

  async findOneAndUpdate(query, update, options = {}) {
    const queryCopy = { ...query };
    if (queryCopy.id) {
      queryCopy._id = queryCopy.id;
      delete queryCopy.id;
    }
    const updatedFields = update.$set ? update.$set : update;
    const doc = await this.model.findOneAndUpdate(queryCopy, { $set: updatedFields }, { new: true, ...options }).lean();
    if (!doc) return null;
    return { id: doc._id.toString(), ...doc };
  }

  async deleteOne(query) {
    const queryCopy = { ...query };
    if (queryCopy.id) {
      queryCopy._id = queryCopy.id;
      delete queryCopy.id;
    }
    const res = await this.model.deleteOne(queryCopy);
    return { deletedCount: res.deletedCount };
  }

  async countDocuments(query = {}) {
    const queryCopy = { ...query };
    if (queryCopy.id) {
      queryCopy._id = queryCopy.id;
      delete queryCopy.id;
    }
    return this.model.countDocuments(queryCopy);
  }
}

export const db = {
  users: useMongo ? new MongooseAdapter(MongoUser) : mockDb.users,
  shops: useMongo ? new MongooseAdapter(MongoShop) : mockDb.shops,
  leads: useMongo ? new MongooseAdapter(MongoLead) : mockDb.leads,
  visits: useMongo ? new MongooseAdapter(MongoVisit) : mockDb.visits,
  tasks: useMongo ? new MongooseAdapter(MongoTask) : mockDb.tasks,
  trials: useMongo ? new MongooseAdapter(MongoTrial) : mockDb.trials,
  subscriptions: useMongo ? new MongooseAdapter(MongoSubscription) : mockDb.subscriptions,
  competitors: useMongo ? new MongooseAdapter(MongoCompetitor) : mockDb.competitors,
  activities: useMongo ? new MongooseAdapter(MongoActivity) : mockDb.activities,
};
export default db;
