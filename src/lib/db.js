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
      mongoose.connect(MONGODB_URI).catch(err => {
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

// Dynamic Unified Collection to switch between MongoDB and MockDB at runtime
class UnifiedCollection {
  constructor(mongoModel, mockCollection) {
    this.mongoModel = mongoModel;
    this.mockCollection = mockCollection;
  }

  isMongoActive() {
    return mongoose.connection.readyState === 1;
  }

  async find(query = {}) {
    if (this.isMongoActive()) {
      try {
        const queryCopy = { ...query };
        if (queryCopy.id) {
          queryCopy._id = queryCopy.id;
          delete queryCopy.id;
        }
        const docs = await this.mongoModel.find(queryCopy).lean();
        return docs.map(doc => ({ id: doc._id.toString(), ...doc }));
      } catch (err) {
        console.warn('MongoDB query failed, falling back to mockDb:', err.message);
        return this.mockCollection.find(query);
      }
    }
    return this.mockCollection.find(query);
  }

  async findOne(query = {}) {
    if (this.isMongoActive()) {
      try {
        const queryCopy = { ...query };
        if (queryCopy.id) {
          queryCopy._id = queryCopy.id;
          delete queryCopy.id;
        }
        const doc = await this.mongoModel.findOne(queryCopy).lean();
        if (doc) return { id: doc._id.toString(), ...doc };
        return null;
      } catch (err) {
        console.warn('MongoDB query failed, falling back to mockDb:', err.message);
        return this.mockCollection.findOne(query);
      }
    }
    return this.mockCollection.findOne(query);
  }

  async findById(id) {
    if (this.isMongoActive()) {
      try {
        const doc = await this.mongoModel.findById(id).lean();
        if (doc) return { id: doc._id.toString(), ...doc };
        return null;
      } catch (err) {
        console.warn('MongoDB query failed, falling back to mockDb:', err.message);
        return this.mockCollection.findById(id);
      }
    }
    return this.mockCollection.findById(id);
  }

  async create(data) {
    if (this.isMongoActive()) {
      try {
        const doc = await this.mongoModel.create(data);
        const obj = doc.toObject();
        return { id: obj._id.toString(), ...obj };
      } catch (err) {
        console.warn('MongoDB create failed, falling back to mockDb:', err.message);
        return this.mockCollection.create(data);
      }
    }
    return this.mockCollection.create(data);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    if (this.isMongoActive()) {
      try {
        const updatedFields = update.$set ? update.$set : update;
        const doc = await this.mongoModel.findByIdAndUpdate(id, { $set: updatedFields }, { new: true, ...options }).lean();
        if (doc) return { id: doc._id.toString(), ...doc };
        return null;
      } catch (err) {
        console.warn('MongoDB update failed, falling back to mockDb:', err.message);
        return this.mockCollection.findByIdAndUpdate(id, update, options);
      }
    }
    return this.mockCollection.findByIdAndUpdate(id, update, options);
  }

  async findOneAndUpdate(query, update, options = {}) {
    if (this.isMongoActive()) {
      try {
        const queryCopy = { ...query };
        if (queryCopy.id) {
          queryCopy._id = queryCopy.id;
          delete queryCopy.id;
        }
        const updatedFields = update.$set ? update.$set : update;
        const doc = await this.mongoModel.findOneAndUpdate(queryCopy, { $set: updatedFields }, { new: true, ...options }).lean();
        if (doc) return { id: doc._id.toString(), ...doc };
        return null;
      } catch (err) {
        console.warn('MongoDB update failed, falling back to mockDb:', err.message);
        return this.mockCollection.findOneAndUpdate(query, update, options);
      }
    }
    return this.mockCollection.findOneAndUpdate(query, update, options);
  }

  async deleteOne(query) {
    if (this.isMongoActive()) {
      try {
        const queryCopy = { ...query };
        if (queryCopy.id) {
          queryCopy._id = queryCopy.id;
          delete queryCopy.id;
        }
        const res = await this.mongoModel.deleteOne(queryCopy);
        return { deletedCount: res.deletedCount };
      } catch (err) {
        console.warn('MongoDB delete failed, falling back to mockDb:', err.message);
        return this.mockCollection.deleteOne(query);
      }
    }
    return this.mockCollection.deleteOne(query);
  }

  async countDocuments(query = {}) {
    if (this.isMongoActive()) {
      try {
        const queryCopy = { ...query };
        if (queryCopy.id) {
          queryCopy._id = queryCopy.id;
          delete queryCopy.id;
        }
        return await this.mongoModel.countDocuments(queryCopy);
      } catch (err) {
        console.warn('MongoDB count failed, falling back to mockDb:', err.message);
        return this.mockCollection.countDocuments(query);
      }
    }
    return this.mockCollection.countDocuments(query);
  }
}

export const db = {
  users: new UnifiedCollection(MongoUser, mockDb.users),
  shops: new UnifiedCollection(MongoShop, mockDb.shops),
  leads: new UnifiedCollection(MongoLead, mockDb.leads),
  visits: new UnifiedCollection(MongoVisit, mockDb.visits),
  tasks: new UnifiedCollection(MongoTask, mockDb.tasks),
  trials: new UnifiedCollection(MongoTrial, mockDb.trials),
  subscriptions: new UnifiedCollection(MongoSubscription, mockDb.subscriptions),
  competitors: new UnifiedCollection(MongoCompetitor, mockDb.competitors),
  activities: new UnifiedCollection(MongoActivity, mockDb.activities),
};
export default db;
