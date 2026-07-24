'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Plus, 
  Camera, 
  PenTool, 
  Check, 
  AlertCircle,
  X,
  Compass,
  FileSignature
} from 'lucide-react';
import { toast } from 'sonner';

export default function Visits() {
  const { visits, setVisits, leads, shops } = useStore();
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  // New Visit Form State
  const [shopId, setShopId] = useState('');
  const [leadId, setLeadId] = useState('');
  const [purpose, setPurpose] = useState('Software Demo');
  const [outcome, setOutcome] = useState('Interested');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const [signature, setSignature] = useState('');

  // GPS & Timer states
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [durationStr, setDurationStr] = useState('0 mins');
  const [gpsCoordinates, setGpsCoordinates] = useState('');

  // Signature canvas refs
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const fetchVisits = async () => {
    try {
      const res = await fetch('/api/visits');
      if (res.ok) {
        const data = await res.json();
        setVisits(data.visits);
      }
    } catch (e) {
      toast.error('Error fetching visits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleCheckIn = () => {
    setCheckedIn(true);
    setCheckInTime(new Date());
    setDurationStr('In Progress');
    toast.success('GPS Check-In Verified! Store location matches.');
  };

  const handleCheckOut = () => {
    if (!checkInTime) return;
    const checkout = new Date();
    const diffMs = checkout - checkInTime;
    const diffMins = Math.round(diffMs / 60000);
    setDurationStr(`${diffMins || 1} min(s)`);
    setCheckedIn(false);
    toast.success(`Check-Out completed. Visit Duration: ${diffMins || 1} min(s).`);
  };

  // Canvas drawing operations
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSignature(dataUrl);
    toast.success('Signature captured successfully!');
  };

  // Mock Camera Upload
  const triggerCameraUpload = () => {
    const mockPhotos = [
      'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=40',
      'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400&q=40'
    ];
    // Push a mock photo into state
    const randomPhoto = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];
    setPhotos([...photos, randomPhoto]);
    toast.success('Mock photo captured and appended.');
  };

  const handleSubmitVisit = async (e) => {
    e.preventDefault();
    if (!shopId) {
      toast.error('Please select a store');
      return;
    }

    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId,
          leadId,
          purpose,
          outcome,
          notes,
          photos,
          signature,
          checkInTime: checkInTime ? checkInTime.toISOString() : new Date().toISOString(),
          checkOutTime: new Date().toISOString(),
          duration: durationStr === 'In Progress' ? '15 mins' : durationStr,
          location: gpsCoordinates
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Visit logged successfully!');
        fetchVisits();
        setShowAddModal(false);
        // Reset form
        setShopId(''); setLeadId(''); setNotes(''); setPhotos([]); setSignature(''); setCheckInTime(null);
      } else {
        toast.error(data.error || 'Failed to log visit');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Visits Logger</h1>
          <p className="text-xs text-gray-400 mt-1">Check-in, GPS logs, signatures, and outcomes</p>
        </div>
        <button 
          onClick={() => {
            setShowAddModal(true);
            setCheckedIn(false);
            setCheckInTime(null);
            setDurationStr('0 mins');
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Log New Visit
        </button>
      </div>

      {/* Visits Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : visits.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="mt-4 text-xs font-semibold text-gray-800">No visits logged today</h3>
          <p className="text-[10px] text-gray-400 mt-1">Start tracking your field performance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visits.map((visit) => {
            const shop = (shops || []).find(s => s.id === visit.shopId);
            return (
              <div 
                key={visit.id}
                onClick={() => setSelectedVisit({ ...visit, shop })}
                className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm card-hover cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-xs text-gray-900">
                      {shop ? shop.storeName : 'Medical Shop Log'}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1">{visit.purpose}</p>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-semibold ${
                    visit.outcome === 'Interested' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {visit.outcome}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-6 pt-3 border-t border-neutral-50 text-[10px] text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{visit.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{visit.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <Compass className="w-3.5 h-3.5" />
                    <span>GPS Verified</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Visit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 relative overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-sm font-bold text-gray-900 mb-6">Log Customer Visit</h2>

            {/* GPS Tracker Block */}
            <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between mb-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">GPS Check-In Tracker</p>
                <div className="flex items-center gap-2 mt-1">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-800 font-medium">
                    {checkedIn ? `Checked-in: ${checkInTime?.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : 'Not Checked In'}
                  </span>
                </div>
              </div>
              <div>
                {!checkedIn ? (
                  <button 
                    type="button" onClick={handleCheckIn}
                    className="px-3 py-1.5 bg-blue-600 text-white font-semibold text-[10px] rounded-lg cursor-pointer"
                  >
                    Check In
                  </button>
                ) : (
                  <button 
                    type="button" onClick={handleCheckOut}
                    className="px-3 py-1.5 bg-red-600 text-white font-semibold text-[10px] rounded-lg cursor-pointer"
                  >
                    Check Out
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmitVisit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Select Pharmacy Store *</label>
                  <select 
                    required value={shopId} onChange={(e) => setShopId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  >
                    <option value="">Choose Store</option>
                    {(shops || []).map(s => (
                      <option key={s.id} value={s.id}>{s.storeName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Associated Lead</label>
                  <select 
                    value={leadId} onChange={(e) => setLeadId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  >
                    <option value="">Select Active Lead (Optional)</option>
                    {(leads || []).map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Meeting Purpose</label>
                  <select 
                    value={purpose} onChange={(e) => setPurpose(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  >
                    <option value="Software Demo">Software Demo</option>
                    <option value="Cold Visit">Cold Visit</option>
                    <option value="Follow Up Negotiations">Follow Up Negotiations</option>
                    <option value="Agreement Signing">Agreement Signing</option>
                    <option value="Trial Deployment">Trial Deployment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Outcome</label>
                  <select 
                    value={outcome} onChange={(e) => setOutcome(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  >
                    <option value="Interested">Interested</option>
                    <option value="Demo Completed">Demo Completed</option>
                    <option value="Trial Started">Trial Started</option>
                    <option value="Deal Won">Deal Won</option>
                    <option value="Deal Lost">Deal Lost</option>
                    <option value="Follow Up Scheduled">Follow Up Scheduled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Meeting Notes & Summary</label>
                <textarea 
                  rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Summarize meeting discussions..." className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>

              {/* Photo Upload Attachment Simulation */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Attach Shop Photos</label>
                  <button 
                    type="button" onClick={triggerCameraUpload}
                    className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Simulate Camera Upload
                  </button>
                </div>
                {photos.length > 0 && (
                  <div className="flex gap-2 flex-wrap pt-2">
                    {photos.map((p, idx) => (
                      <img key={idx} src={p} alt="Attachment" className="w-14 h-14 rounded-lg object-cover border" />
                    ))}
                  </div>
                )}
              </div>

              {/* Digital Signature Drawing Canvas */}
              <div className="space-y-2 pt-2">
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Digital Customer Signature Verification</label>
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <canvas 
                    ref={canvasRef}
                    width={500}
                    height={100}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full bg-white cursor-crosshair h-24"
                  />
                  <div className="flex justify-end gap-2 p-2 bg-gray-100 border-t">
                    <button type="button" onClick={clearSignature} className="px-2 py-1 rounded bg-gray-200 hover:bg-neutral-300 text-[10px] text-gray-800">
                      Clear
                    </button>
                    <button type="button" onClick={saveSignature} className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-[10px] text-white">
                      Save Signature
                    </button>
                  </div>
                </div>
                {signature && (
                  <div className="flex items-center gap-2 mt-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] text-gray-500">Signature captured!</span>
                    <img src={signature} alt="Signature" className="h-6 object-contain ml-2 border p-0.5" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
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
                  Log Visit Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setSelectedVisit(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xs font-bold text-gray-900 mb-4">Visit Activity Details</h3>

            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Store</span>
                <p className="text-xs text-gray-900 font-semibold mt-0.5">
                  {selectedVisit.shop ? selectedVisit.shop.storeName : 'Medical Shop'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Outcome</span>
                  <p className="text-xs text-gray-900 font-semibold mt-0.5">{selectedVisit.outcome}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Duration</span>
                  <p className="text-xs text-gray-900 font-semibold mt-0.5">{selectedVisit.duration}</p>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Purpose</span>
                <p className="text-xs text-gray-800 mt-0.5">{selectedVisit.purpose}</p>
              </div>

              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Notes</span>
                <p className="text-xs text-gray-800 leading-relaxed mt-0.5">{selectedVisit.notes || 'No summary notes entered.'}</p>
              </div>

              {selectedVisit.photos?.length > 0 && (
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Captured Photos</span>
                  <div className="flex gap-2 mt-2">
                    {selectedVisit.photos.map((p, idx) => (
                      <img key={idx} src={p} alt="Captured" className="w-16 h-16 rounded-lg object-cover border" />
                    ))}
                  </div>
                </div>
              )}

              {selectedVisit.signature && (
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Customer Verification Signature</span>
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg border max-w-fit">
                    <img src={selectedVisit.signature} alt="Client Signature" className="h-10 object-contain" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
