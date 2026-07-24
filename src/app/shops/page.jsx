'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { 
  Store, 
  User, 
  Phone, 
  MapPin, 
  Plus, 
  Search, 
  Layers, 
  FileText, 
  Activity,
  X,
  Compass,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

export default function MedicalShops() {
  const { shops, setShops } = useStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('All');
  const [filterSize, setFilterSize] = useState('All');
  const [filterSoftware, setFilterSoftware] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);

  // New Shop Form State
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pin, setPin] = useState('');
  const [gst, setGst] = useState('');
  const [drugLicense, setDrugLicense] = useState('');
  const [currentSoftware, setCurrentSoftware] = useState('Marg ERP');
  const [employees, setEmployees] = useState('2');
  const [businessSize, setBusinessSize] = useState('Small');
  const [monthlyRevenue, setMonthlyRevenue] = useState('250000');
  const [createLead, setCreateLead] = useState(true);

  const fetchShops = async () => {
    try {
      const res = await fetch('/api/shops');
      if (res.ok) {
        const data = await res.json();
        setShops(data.shops);
      }
    } catch (e) {
      toast.error('Error fetching shops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleAddShop = async (e) => {
    e.preventDefault();
    if (!storeName || !ownerName || !mobile || !address || !city || !state || !pin) {
      toast.error('Please fill out all required fields');
      return;
    }

    try {
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName, ownerName, mobile, whatsapp, email, address, city, state, pin,
          gst, drugLicense, currentSoftware, employees, businessSize, monthlyRevenue,
          createLead, gpsLocation: '19.0760, 72.8777' // Default mock coordinates
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`${storeName} registered successfully!`);
        fetchShops();
        setShowAddModal(false);
        // Reset form
        setStoreName(''); setOwnerName(''); setMobile(''); setAddress(''); setCity('');
        setState(''); setPin(''); setGst(''); setDrugLicense('');
      } else {
        toast.error(data.error || 'Failed to register shop');
      }
    } catch (e) {
      toast.error('An error occurred during submission');
    }
  };

  // Filter Logic
  const filteredShops = (shops || []).filter(shop => {
    const matchesSearch = shop.storeName?.toLowerCase().includes(search.toLowerCase()) || 
                          shop.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
                          shop.city?.toLowerCase().includes(search.toLowerCase());
    const matchesCity = filterCity === 'All' || shop.city === filterCity;
    const matchesSize = filterSize === 'All' || shop.businessSize === filterSize;
    const matchesSoftware = filterSoftware === 'All' || shop.currentSoftware === filterSoftware;
    return matchesSearch && matchesCity && matchesSize && matchesSoftware;
  });

  const cities = ['All', ...new Set((shops || []).map(s => s.city))];
  const softs = ['All', 'Marg ERP', 'RetailGraph', 'GoFrugal', 'Vyapar', 'Busy', 'Tally', 'Others'];

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Registered Medical Shops</h1>
          <p className="text-xs text-gray-400 mt-1">Manage physical pharmacy profiles and ERP records</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm cursor-pointer select-none transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Medical Shop
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by store name, owner, city..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-xs"
          />
        </div>
        <div className="grid grid-cols-3 gap-3 min-w-[320px]">
          <select 
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
          >
            <option value="All">All Cities</option>
            {cities.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select 
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
          >
            <option value="All">All Sizes</option>
            <option value="Small">Small (1-2 employees)</option>
            <option value="Medium">Medium (3-5 employees)</option>
            <option value="Large">Large (5+ employees)</option>
          </select>
          <select 
            value={filterSoftware}
            onChange={(e) => setFilterSoftware(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
          >
            {softs.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Software' : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl">
          <Store className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="mt-4 text-xs font-semibold text-gray-800">No medical shops found</h3>
          <p className="text-[10px] text-gray-400 mt-1">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <div 
              key={shop.id}
              onClick={() => setSelectedShop(shop)}
              className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm card-hover cursor-pointer"
            >
              <div className="flex gap-4">
                <img 
                  src={shop.shopPhoto || 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=100'} 
                  alt="Shop" 
                  className="w-14 h-14 rounded-xl object-cover border border-gray-200"
                />
                <div className="overflow-hidden">
                  <h3 className="font-semibold text-xs text-gray-900 truncate">{shop.storeName}</h3>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate">{shop.ownerName}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{shop.mobile}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-50">
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600">
                  <Compass className="w-3 h-3" />
                  {shop.city}
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-600">
                  <Database className="w-3 h-3" />
                  {shop.currentSoftware}
                </span>
                <span className="ml-auto text-[10px] font-semibold text-gray-900">
                  ₹{(parseInt(shop.monthlyRevenue) / 1000).toFixed(0)}k/mo
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details View Modal */}
      {selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 relative overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setSelectedShop(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-4 items-start">
              <img 
                src={selectedShop.shopPhoto} 
                alt="Shop" 
                className="w-16 h-16 rounded-2xl object-cover border"
              />
              <div>
                <h2 className="text-sm font-bold text-gray-900">{selectedShop.storeName}</h2>
                <p className="text-[10px] text-gray-400 mt-1">GSTIN: {selectedShop.gst || 'N/A'}</p>
                <p className="text-[10px] text-gray-400">Drug License: {selectedShop.drugLicense || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Owner Name</span>
                <p className="text-xs text-gray-800 font-medium">{selectedShop.ownerName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Contact Number</span>
                <p className="text-xs text-gray-800 font-medium">{selectedShop.mobile}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Current ERP System</span>
                <p className="text-xs text-gray-800 font-medium">{selectedShop.currentSoftware}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Monthly Revenue</span>
                <p className="text-xs text-gray-800 font-medium">₹{parseInt(selectedShop.monthlyRevenue).toLocaleString('en-IN')}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Address</span>
                <p className="text-xs text-gray-800 font-medium">{selectedShop.address}, {selectedShop.city}, {selectedShop.state} - {selectedShop.pin}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">GPS Location Check</span>
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 bg-white">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-800 font-medium">{selectedShop.gpsLocation}</span>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedShop.gpsLocation}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-[10px] text-blue-600 font-semibold hover:underline"
                  >
                    View Map
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Shop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 relative overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-sm font-bold text-gray-900 mb-6">Register Medical Shop</h2>

            <form onSubmit={handleAddShop} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Store Name *</label>
                  <input 
                    required
                    value={storeName} onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Care Pharmacy" className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Owner Name *</label>
                  <input 
                    required
                    value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Ramesh Kumar" className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Mobile Number *</label>
                  <input 
                    required
                    value={mobile} onChange={(e) => setMobile(e.target.value)}
                    placeholder="9876543210" className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">GST Number</label>
                  <input 
                    value={gst} onChange={(e) => setGst(e.target.value)}
                    placeholder="27AAAAA1111A1Z1" className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Drug License Code</label>
                  <input 
                    value={drugLicense} onChange={(e) => setDrugLicense(e.target.value)}
                    placeholder="DL-12345-MUM" className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Current ERP Software</label>
                  <select 
                    value={currentSoftware} onChange={(e) => setCurrentSoftware(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  >
                    <option value="Marg ERP">Marg ERP</option>
                    <option value="RetailGraph">RetailGraph</option>
                    <option value="GoFrugal">GoFrugal</option>
                    <option value="Vyapar">Vyapar</option>
                    <option value="Busy">Busy</option>
                    <option value="Tally">Tally</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Monthly Revenue (₹)</label>
                  <input 
                    value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(e.target.value)}
                    placeholder="250000" className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Business Size</label>
                  <select 
                    value={businessSize} onChange={(e) => setBusinessSize(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  >
                    <option value="Small">Small (1-2 Employees)</option>
                    <option value="Medium">Medium (3-5 Employees)</option>
                    <option value="Large">Large (5+ Employees)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Address Details *</label>
                <textarea 
                  required rows={2}
                  value={address} onChange={(e) => setAddress(e.target.value)}
                  placeholder="Store Address, Near Central Bank" className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">City *</label>
                  <input 
                    required
                    value={city} onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai" className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">State *</label>
                  <input 
                    required
                    value={state} onChange={(e) => setState(e.target.value)}
                    placeholder="Maharashtra" className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">PIN Code *</label>
                  <input 
                    required
                    value={pin} onChange={(e) => setPin(e.target.value)}
                    placeholder="400001" className="w-full p-2.5 rounded-xl border text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  id="createLead" type="checkbox" 
                  checked={createLead} onChange={(e) => setCreateLead(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-gray-50 border-neutral-300"
                />
                <label htmlFor="createLead" className="text-[10px] text-gray-500 font-semibold">
                  Auto-create Sales Lead in Pipeline for this shop
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all"
                >
                  Register Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
