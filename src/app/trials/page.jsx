'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { 
  Layers, 
  Play, 
  Check, 
  Calendar, 
  Download, 
  Plus, 
  FileText,
  AlertCircle,
  X,
  CreditCard,
  Video
} from 'lucide-react';
import { toast } from 'sonner';

export default function TrialsAndSubscriptions() {
  const { shops } = useStore();
  const [loading, setLoading] = useState(true);
  const [trials, setTrials] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Conversion / Invoice forms state
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertTrial, setConvertTrial] = useState(null);
  const [subPlan, setSubPlan] = useState('Monthly Professional');
  const [subAmount, setSubAmount] = useState('1200');

  const fetchData = async () => {
    try {
      const [tRes, sRes] = await Promise.all([
        fetch('/api/dashboard/summary'), // Summary fetches standard pre-seeded items
        fetch('/api/shops') // Needs shops correlation
      ]);
      
      // Let's query from mock endpoints or populate standard items locally if empty
      // We will set up mock state items directly to avoid empty grids
      setTrials([
        {
          id: 'tr1',
          storeName: 'Care Plus Pharmacy',
          startDate: '2026-07-20',
          endDate: '2026-08-03',
          daysRemaining: 10,
          status: 'Active',
          videoFeedback: 'Received'
        },
        {
          id: 'tr2',
          storeName: 'Apex Health Center',
          startDate: '2026-07-10',
          endDate: '2026-07-24',
          daysRemaining: 0,
          status: 'Expired',
          videoFeedback: 'Pending'
        }
      ]);

      setSubscriptions([
        {
          id: 'sub1',
          storeName: 'Wellness Chemists',
          plan: 'Yearly Professional',
          amount: '12000',
          renewalDate: '2027-03-24',
          status: 'Active',
          invoices: [
            { id: 'INV-2026-001', date: '2026-03-24', amount: '12000', gst: '2160', total: '14160', status: 'Paid' }
          ]
        }
      ]);
    } catch (e) {
      toast.error('Error fetching billing information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExtendTrial = (trialId) => {
    setTrials(prev => prev.map(t => {
      if (t.id === trialId) {
        toast.success(`Extended trial license for ${t.storeName} by +7 days`);
        return {
          ...t,
          endDate: new Date(new Date(t.endDate).setDate(new Date(t.endDate).getDate() + 7)).toISOString().split('T')[0],
          daysRemaining: t.daysRemaining + 7,
          status: 'Active'
        };
      }
      return t;
    }));
  };

  const handleConvertTrial = (e) => {
    e.preventDefault();
    if (!convertTrial) return;

    // Add to paid subscriptions list
    const newSub = {
      id: `sub-${Math.random().toString(36).substring(2, 9)}`,
      storeName: convertTrial.storeName,
      plan: subPlan,
      amount: subAmount,
      renewalDate: subPlan.includes('Yearly') 
        ? new Date(Date.now() + 365*86400000).toISOString().split('T')[0]
        : new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
      status: 'Active',
      invoices: [
        { 
          id: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`, 
          date: new Date().toISOString().split('T')[0], 
          amount: subAmount,
          gst: (parseFloat(subAmount) * 0.18).toFixed(0),
          total: (parseFloat(subAmount) * 1.18).toFixed(0),
          status: 'Paid' 
        }
      ]
    };

    setSubscriptions([...subscriptions, newSub]);
    
    // Remove from active trials list
    setTrials(prev => prev.filter(t => t.id !== convertTrial.id));
    setShowConvertModal(false);
    toast.success(`${convertTrial.storeName} converted to paid plan!`);
  };

  const handleDownloadInvoice = (inv) => {
    // Open a print tab or show notification
    toast.success(`Initiated PDF download for ${inv.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Trials & Subscriptions</h1>
        <p className="text-xs text-gray-400 mt-1">Review active software evaluations and subscription renewals</p>
      </div>

      {/* Grid: Trials & Subscriptions list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Trials section */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Software Trial License Evaluations
          </h3>

          <div className="space-y-4">
            {trials.map(trial => (
              <div 
                key={trial.id}
                className="p-4 rounded-xl border border-gray-200 bg-white space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-xs text-gray-900">{trial.storeName}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Ends: {trial.endDate}</p>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    trial.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {trial.status}
                  </span>
                </div>

                {/* Days remaining slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-medium text-gray-500">
                    <span>Evaluations Timeline</span>
                    <span>{trial.daysRemaining} days left</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${trial.daysRemaining > 3 ? 'bg-blue-600' : 'bg-red-500'}`} 
                      style={{ width: `${Math.min((trial.daysRemaining / 14) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Video feedback indicator */}
                <div className="flex items-center gap-1.5 text-[9px] font-semibold text-gray-500">
                  <Video className="w-3.5 h-3.5" />
                  <span>Video Feedback status:</span>
                  <span className={trial.videoFeedback === 'Received' ? 'text-emerald-500' : 'text-amber-500'}>
                    {trial.videoFeedback}
                  </span>
                </div>

                {/* Trial Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => handleExtendTrial(trial.id)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-[10px] font-semibold cursor-pointer"
                  >
                    Extend +7 Days
                  </button>
                  <button 
                    onClick={() => { setConvertTrial(trial); setShowConvertModal(true); }}
                    className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-semibold cursor-pointer"
                  >
                    Convert to Paid
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscriptions Renewals and Invoices section */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Paid SaaS Subscription Renewals
          </h3>

          <div className="space-y-4">
            {subscriptions.map(sub => (
              <div 
                key={sub.id}
                className="p-4 rounded-xl border border-gray-200 bg-white space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-xs text-gray-900">{sub.storeName}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{sub.plan} — ₹{parseInt(sub.amount).toLocaleString('en-IN')}</p>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wider">
                    {sub.status}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] font-semibold text-gray-500 pt-2 border-t">
                  <span>Next Renewal: {sub.renewalDate}</span>
                </div>

                {/* Invoices list */}
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Billing History</p>
                  {sub.invoices.map(inv => (
                    <div 
                      key={inv.id}
                      className="flex items-center justify-between p-2 bg-white border rounded-lg text-[10px]"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        <div>
                          <span className="font-semibold text-gray-800">{inv.id}</span>
                          <p className="text-[8px] text-gray-400">{inv.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-800">₹{inv.amount}</span>
                        <button 
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1 rounded hover:bg-gray-100 text-blue-600"
                          title="Generate printable invoice details"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Convert Trial to Subscription Modal */}
      {showConvertModal && convertTrial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowConvertModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-sm font-bold text-gray-900 mb-4">Upgrade to Paid Subscription</h2>
            <p className="text-[10px] text-gray-400 leading-normal mb-4">
              Select a licensing plan to initialize standard billing and download GST invoice history for <strong>{convertTrial.storeName}</strong>.
            </p>

            <form onSubmit={handleConvertTrial} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Subscription Plan</label>
                <select 
                  value={subPlan} 
                  onChange={(e) => {
                    setSubPlan(e.target.value);
                    setSubAmount(e.target.value.includes('Yearly') ? '12000' : '1200');
                  }}
                  className="w-full p-2.5 rounded-xl border text-xs"
                >
                  <option value="Monthly Professional">Monthly Professional — ₹1,200/mo</option>
                  <option value="Yearly Professional">Yearly Professional — ₹12,000/yr (Save 17%)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Total License Fee (₹)</label>
                <input 
                  disabled value={`₹${parseInt(subAmount).toLocaleString('en-IN')} + 18% GST`}
                  className="w-full p-2.5 rounded-xl border text-xs bg-gray-50 text-gray-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Confirm Payment & Activate License
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Details Drawer Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 relative space-y-4">
            <button 
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Printable Invoice Header */}
            <div className="text-center pb-4 border-b border-dashed">
              <h3 className="font-bold text-xs text-gray-900">TAX INVOICE</h3>
              <p className="text-[9px] text-gray-400">DevSamp CRM Suite Inc.</p>
              <p className="text-[9px] text-gray-400">GSTIN: 27DEVSAMP999A1Z1</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Invoice ID:</span>
                <span className="font-bold">{selectedInvoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date:</span>
                <span>{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method:</span>
                <span>UPI / Netbanking</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-emerald-600 font-bold uppercase tracking-wider">{selectedInvoice.status}</span>
              </div>
            </div>

            <div className="border-t border-b py-2 my-2 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>Base Software Charge</span>
                <span>₹{parseFloat(selectedInvoice.amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>CGST (9%)</span>
                <span>₹{(parseFloat(selectedInvoice.gst)/2).toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>SGST (9%)</span>
                <span>₹{(parseFloat(selectedInvoice.gst)/2).toFixed(0)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-bold pt-2">
              <span>Total Paid Amount</span>
              <span className="text-blue-600">
                ₹{parseFloat(selectedInvoice.total || selectedInvoice.amount * 1.18).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex gap-2 pt-4">
              <button 
                onClick={() => handleDownloadInvoice(selectedInvoice)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
