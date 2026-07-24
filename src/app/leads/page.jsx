'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { 
  Users, 
  Search, 
  Plus, 
  QrCode, 
  MessageSquare, 
  Mail, 
  FileText, 
  Camera,
  X,
  Sparkles,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function Leads() {
  const { leads, setLeads, shops } = useStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Business Card OCR Simulator State
  const [scanning, setScanning] = useState(false);

  // Form fields for new lead
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [shopId, setShopId] = useState('');
  const [status, setStatus] = useState('New');
  const [priority, setPriority] = useState('Medium');
  const [notes, setNotes] = useState('');

  // WhatsApp template fields
  const [waTemplate, setWaTemplate] = useState('Brochure');
  const [waCustomMessage, setWaCustomMessage] = useState('');

  // Email template fields
  const [emailTemplate, setEmailTemplate] = useState('Follow Up');

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
      }
    } catch (e) {
      toast.error('Error fetching leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!name || !phone || !shopId) {
      toast.error('Required fields are missing');
      return;
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, shopId, status, priority, notes })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Lead for ${name} created!`);
        fetchLeads();
        setShowAddModal(false);
        // Reset form
        setName(''); setPhone(''); setEmail(''); setShopId(''); setNotes('');
      } else {
        toast.error(data.error || 'Failed to create lead');
      }
    } catch (e) {
      toast.error('Error submitting lead');
    }
  };

  // Simulate Business Card Scanner (OCR)
  const handleOcrSimulate = () => {
    setScanning(true);
    setTimeout(() => {
      // Pick a random shop from available shops
      const randomShop = shops && shops.length > 0 ? shops[0].id : 's1';
      setName('MedLife Chemists');
      setPhone('9811223344');
      setEmail('info@medlifechem.com');
      setShopId(randomShop);
      setNotes('Scanned details from business card via OCR tool.');
      setScanning(false);
      toast.success('OCR Scan Complete! Form pre-filled.');
    }, 2000);
  };

  // Trigger WhatsApp Template Dispatch
  const sendWhatsApp = () => {
    if (!selectedLead) return;
    let message = '';
    if (waTemplate === 'Brochure') {
      message = `Hello ${selectedLead.name}, thank you for your interest! Here is our product brochure: https://example.com/brochure.pdf. Let us know if you have any questions.`;
    } else if (waTemplate === 'Pricing') {
      message = `Hello ${selectedLead.name}, here is our software pricing plan. Basic: ₹500/mo, Premium: ₹1000/mo. Let's schedule a call to finalize the license.`;
    } else if (waTemplate === 'Demo') {
      message = `Hi ${selectedLead.name}, we are excited to showcase our billing app. Click this link to confirm your slot for tomorrow's live demo: https://calendly.com/devsamp.`;
    } else if (waTemplate === 'Offer') {
      message = `Special Offer! Get 20% off on our yearly professional subscription. Valid till Sunday only. Click here to purchase: https://example.com/pay`;
    } else {
      message = waCustomMessage;
    }

    const waUrl = `https://wa.me/91${selectedLead.phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    setShowWhatsAppModal(false);
    toast.success('Redirecting to WhatsApp web...');
  };

  // Trigger Email Dispatch
  const sendEmail = () => {
    if (!selectedLead) return;
    let subject = '';
    let body = '';
    
    if (emailTemplate === 'Follow Up') {
      subject = 'Follow-up regarding DevSamp Sales CRM Demo';
      body = `Hi ${selectedLead.name},\n\nHope you are doing well. It was great discussing your pharmacy requirements. Let us know if you want to initialize the 14-day free trial.\n\nBest regards,\nSales Team`;
    } else if (emailTemplate === 'Offer') {
      subject = 'Exclusive Discount Offer on CRM Suite';
      body = `Hi ${selectedLead.name},\n\nWe are offering a limited time 20% discount on our CRM subscription modules. Let us know if you want to lock this deal.\n\nBest regards,\nSales Team`;
    } else if (emailTemplate === 'Trial Expiry') {
      subject = 'Your Trial License is Expiring Soon';
      body = `Hi ${selectedLead.name},\n\nThis is a gentle reminder that your 14-day trial for DevSamp CRM is expiring in 3 days. Upgrade today to avoid service disruption.\n\nBest regards,\nSales Team`;
    }

    const mailtoUrl = `mailto:${selectedLead.email || 'pharmacy@crm.com'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setShowEmailModal(false);
    toast.success('Launching mail application...');
  };

  // Status badge classes
  const getStatusBadge = (status) => {
    const map = {
      'New': 'bg-blue-50 text-blue-600',
      'Contacted': 'bg-purple-50 text-purple-600',
      'Demo Scheduled': 'bg-amber-50 text-amber-600',
      'Trial Started': 'bg-teal-50 text-teal-600',
      'Interested': 'bg-indigo-50 text-indigo-600',
      'Won': 'bg-emerald-50 text-emerald-600',
      'Lost': 'bg-red-50 text-red-600',
    };
    return map[status] || 'bg-gray-50 text-gray-700';
  };

  // Filtering leads
  const filteredLeads = (leads || []).filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(search.toLowerCase()) || 
                          lead.phone?.includes(search);
    const matchesStatus = filterStatus === 'All' || lead.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || lead.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Leads Pipeline</h1>
          <p className="text-xs text-gray-400 mt-1">Nurture and close medical shop leads</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Lead
        </button>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-xs"
          />
        </div>
        <div className="flex gap-3">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Demo Scheduled">Demo Scheduled</option>
            <option value="Trial Started">Trial Started</option>
            <option value="Interested">Interested</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
          <select 
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-44 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl">
          <Users className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="mt-4 text-xs font-semibold text-gray-800">No leads found</h3>
          <p className="text-[10px] text-gray-400 mt-1">Get started by creating a new lead.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase bg-white">
                <th className="p-4">Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Status</th>
                <th className="p-4">Priority</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/60">
                  <td className="p-4 font-semibold text-gray-900">{lead.name}</td>
                  <td className="p-4 text-gray-500">{lead.phone}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusBadge(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-medium ${
                      lead.priority === 'High' ? 'text-red-500 font-bold' : lead.priority === 'Medium' ? 'text-amber-500' : 'text-blue-500'
                    }`}>
                      {lead.priority}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => { setSelectedLead(lead); setShowQrModal(true); }}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500"
                      title="Generate Lead QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => { setSelectedLead(lead); setShowWhatsAppModal(true); }}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-emerald-600"
                      title="Send WhatsApp Template"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => { setSelectedLead(lead); setShowEmailModal(true); }}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-blue-600"
                      title="Email Templates"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Lead & OCR Business Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 relative overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-sm font-bold text-gray-900">Create Sales Lead</h2>
              <button 
                type="button"
                onClick={handleOcrSimulate}
                disabled={scanning}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-semibold border border-indigo-100 cursor-pointer disabled:opacity-50"
              >
                {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                {scanning ? 'Scanning Card...' : 'Scan Business Card (OCR)'}
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Lead Name *</label>
                  <input 
                    required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Medical Center Owner" className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Phone Number *</label>
                  <input 
                    required value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210" className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
                  <input 
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@pharmacy.com" className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Associated Medical Shop *</label>
                  <select 
                    required value={shopId} onChange={(e) => setShopId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  >
                    <option value="">Select Medical Shop</option>
                    {(shops || []).map(shop => (
                      <option key={shop.id} value={shop.id}>{shop.storeName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Pipeline Stage</label>
                  <select 
                    value={status} onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Demo Scheduled">Demo Scheduled</option>
                    <option value="Trial Started">Trial Started</option>
                    <option value="Interested">Interested</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Lead Priority</label>
                  <select 
                    value={priority} onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Notes & Requirements</label>
                <textarea 
                  rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Owner wants custom GST layout, uses Marg ERP currently..." className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Dialog */}
      {showQrModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 relative text-center space-y-4">
            <button 
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xs font-bold text-gray-900">Lead Digital Identifier QR</h3>
            
            {/* Mock QR Code graphic */}
            <div className="mx-auto w-40 h-40 bg-white border border-gray-200 p-2.5 rounded-2xl flex items-center justify-center shadow-sm">
              <svg className="w-full h-full text-neutral-900" viewBox="0 0 100 100">
                <rect x="10" y="10" width="20" height="20" fill="currentColor" />
                <rect x="15" y="15" width="10" height="10" fill="white" />
                <rect x="70" y="10" width="20" height="20" fill="currentColor" />
                <rect x="75" y="15" width="10" height="10" fill="white" />
                <rect x="10" y="70" width="20" height="20" fill="currentColor" />
                <rect x="15" y="75" width="10" height="10" fill="white" />
                
                {/* Random blocks */}
                <rect x="40" y="20" width="10" height="10" fill="currentColor" />
                <rect x="50" y="40" width="20" height="10" fill="currentColor" />
                <rect x="40" y="60" width="10" height="20" fill="currentColor" />
                <rect x="80" y="50" width="10" height="10" fill="currentColor" />
                <rect x="60" y="80" width="20" height="10" fill="currentColor" />
              </svg>
            </div>
            
            <div>
              <p className="text-xs font-semibold text-gray-900">{selectedLead.name}</p>
              <span className="text-[10px] text-gray-400">ID: {selectedLead.qrCode}</span>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 relative space-y-4">
            <button 
              onClick={() => setShowWhatsAppModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xs font-bold text-gray-900">One-Click WhatsApp Dispatch</h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Select Template</label>
                <select 
                  value={waTemplate} onChange={(e) => setWaTemplate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs"
                >
                  <option value="Brochure">Send Product Brochure</option>
                  <option value="Pricing">Send Software Pricing Sheet</option>
                  <option value="Demo">Send Demo Booking Calendar</option>
                  <option value="Offer">Send 20% Discount Offer</option>
                  <option value="Custom">Custom Message</option>
                </select>
              </div>

              {waTemplate === 'Custom' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Message Text</label>
                  <textarea 
                    rows={3} value={waCustomMessage} onChange={(e) => setWaCustomMessage(e.target.value)}
                    placeholder="Enter custom message text..." className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>
              )}

              <button 
                onClick={sendWhatsApp}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Launch WhatsApp Chat
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 relative space-y-4">
            <button 
              onClick={() => setShowEmailModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xs font-bold text-gray-900">Email Communication Center</h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Templates</label>
                <select 
                  value={emailTemplate} onChange={(e) => setEmailTemplate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs"
                >
                  <option value="Follow Up">Software Demo Follow Up</option>
                  <option value="Offer">Limited Time Promotional Offer</option>
                  <option value="Trial Expiry">Trial Plan Expiration Reminder</option>
                </select>
              </div>

              <button 
                onClick={sendEmail}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Send Email
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
