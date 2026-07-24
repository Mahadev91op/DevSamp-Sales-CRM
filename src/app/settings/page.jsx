'use client';

import { useState } from 'react';
import { 
  Building, 
  Database, 
  Settings as SettingsIcon, 
  MessageSquare, 
  Download, 
  Key,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [companyName, setCompanyName] = useState('DevSamp Solutions');
  const [contactEmail, setContactEmail] = useState('support@devsamp.com');
  const [taxId, setTaxId] = useState('27DEVSAMP999A1Z1');
  const [waApiUrl, setWaApiUrl] = useState('https://api.whatsapp.com/send');

  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Configuration saved successfully!');
    }, 1000);
  };

  // Simulate Cloud DB Backup & JSON download
  const handleExportJSON = () => {
    setBackingUp(true);
    setTimeout(async () => {
      setBackingUp(false);
      try {
        // Fetch leads, shops, tasks to compile backup JSON
        const [leadsRes, shopsRes, tasksRes] = await Promise.all([
          fetch('/api/leads').then(res => res.json()),
          fetch('/api/shops').then(res => res.json()),
          fetch('/api/tasks').then(res => res.json())
        ]);

        const backupData = {
          exportDate: new Date().toISOString(),
          system: 'DevSamp Sales CRM Backup',
          leads: leadsRes.leads || [],
          shops: shopsRes.shops || [],
          tasks: tasksRes.tasks || []
        };

        // Trigger file download in browser
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(backupData, null, 2)
        )}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute('download', `devsamp_crm_db_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        toast.success('Database backup JSON generated and downloaded!');
      } catch (err) {
        toast.error('Failed to compile database export files');
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">System Settings</h1>
        <p className="text-xs text-gray-400 mt-1">Configure company profiles, integrations, and database backup</p>
      </div>

      {/* Main Grid: Forms & Action Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings form column */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-6">
          <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            Company & Brand Settings
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Company Name</label>
                <input 
                  required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company Name" className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Contact Email</label>
                <input 
                  required type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="billing@company.com" className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">GST Tax Identification (GSTIN)</label>
                <input 
                  value={taxId} onChange={(e) => setTaxId(e.target.value)}
                  placeholder="27DEVSAMP999A1Z1" className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">WhatsApp Broadcast API Gateway</label>
                <input 
                  value={waApiUrl} onChange={(e) => setWaApiUrl(e.target.value)}
                  placeholder="https://api.whatsapp.com/send" className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={saving}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50 transition-all"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        </div>

        {/* Database & Cloud Backup tools */}
        <div className="space-y-6">
          
          {/* Export / Backup Capsule */}
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Cloud Database Backup
            </h3>

            <p className="text-[10px] text-gray-400 leading-relaxed">
              Compile, packaging, and download the active medical stores, leads pipeline logs, and activity datasets as a single structured JSON file.
            </p>

            <button
              onClick={handleExportJSON}
              disabled={backingUp}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-xl text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50 transition-all"
            >
              {backingUp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {backingUp ? 'Compiling Backup...' : 'Export Database JSON'}
            </button>
          </div>

          {/* Simulated API Key Integrations */}
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              API Key Integrations
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Google Maps Embed API</span>
                <input 
                  type="password" disabled value="GOOGLE_MAPS_KEY_MOCK_XYZ123"
                  className="w-full p-2 rounded-lg border text-[10px] bg-gray-50 text-gray-400 font-mono"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Cloudinary Asset Upload API</span>
                <input 
                  type="password" disabled value="CLOUDINARY_UPLOAD_KEY_MOCK_ABC456"
                  className="w-full p-2 rounded-lg border text-[10px] bg-gray-50 text-gray-400 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
