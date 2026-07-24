'use client';

import { useState } from 'react';
import { 
  FileText, 
  Folder, 
  Upload, 
  Plus, 
  File, 
  Download,
  Trash,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentCenter() {
  const [documents, setDocuments] = useState([
    { id: 'doc1', name: 'CRM_SaaS_Pricing_Guide.pdf', size: '1.2 MB', category: 'Brochures', date: '2026-07-20' },
    { id: 'doc2', name: 'Standard_Client_Agreement_V2.pdf', size: '850 KB', category: 'Agreements', date: '2026-07-15' },
    { id: 'doc3', name: 'MedLife_Quotation_Draft.pdf', size: '320 KB', category: 'Quotations', date: '2026-07-22' },
    { id: 'doc4', name: 'Invoice_CarePlus_INV102.pdf', size: '240 KB', category: 'Invoices', date: '2026-07-24' }
  ]);

  const [activeCategory, setActiveCategory] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Brochures');

  const categories = ['All', 'Brochures', 'Agreements', 'Quotations', 'Invoices'];

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadName) {
      toast.error('Please enter a document name');
      return;
    }

    const newDoc = {
      id: `doc-${Math.random().toString(36).substring(2, 9)}`,
      name: uploadName.endsWith('.pdf') ? uploadName : `${uploadName}.pdf`,
      size: '450 KB',
      category: uploadCategory,
      date: new Date().toISOString().split('T')[0]
    };

    setDocuments([newDoc, ...documents]);
    setShowUploadModal(false);
    setUploadName('');
    toast.success('Document uploaded to cloud store!');
  };

  const handleDeleteDoc = (id, name) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    toast.success(`Deleted ${name}`);
  };

  const filteredDocs = activeCategory === 'All' 
    ? documents 
    : documents.filter(d => d.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-800 tracking-tight">Document Center</h1>
          <p className="text-xs text-neutral-400 mt-1">Access brochures, contracts, invoices, and templates</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-neutral-100">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeCategory === cat 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid: Document details list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white border rounded-3xl">
            <Folder className="w-12 h-12 text-neutral-300 mx-auto" />
            <h3 className="mt-4 text-xs font-semibold text-neutral-700">No documents found</h3>
            <p className="text-[10px] text-neutral-400 mt-1">Upload files to get started.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div 
              key={doc.id}
              className="bg-white border border-neutral-100 p-5 rounded-2xl shadow-xs card-hover flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-semibold text-xs text-neutral-800 truncate" title={doc.name}>
                    {doc.name}
                  </h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{doc.category} • {doc.size}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-3 border-t border-neutral-50 text-[10px] text-neutral-400">
                <span>Date: {doc.date}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => toast.success(`Initiated download for ${doc.name}`)}
                    className="p-1 rounded hover:bg-neutral-50 text-blue-600"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteDoc(doc.id, doc.name)}
                    className="p-1 rounded hover:bg-neutral-50 text-red-500"
                    title="Delete"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-neutral-100 rounded-3xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-sm font-bold text-neutral-800 mb-6">Upload Document</h2>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wide">Document Name *</label>
                <input 
                  required value={uploadName} onChange={(e) => setUploadName(e.target.value)}
                  placeholder="CRM Sales Presentation" className="w-full p-2.5 rounded-xl border text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wide">Category Folder *</label>
                <select 
                  value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border text-xs"
                >
                  <option value="Brochures">Brochures</option>
                  <option value="Agreements">Agreements</option>
                  <option value="Quotations">Quotations</option>
                  <option value="Invoices">Invoices</option>
                </select>
              </div>

              {/* Upload Drag Area simulation */}
              <div className="border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center cursor-pointer hover:bg-neutral-50/50">
                <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                <span className="text-[10px] text-neutral-500 block">Drag & Drop PDF or Click to Select File</span>
                <span className="text-[8px] text-neutral-400 block mt-1">(Max File size: 20MB)</span>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button" onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all"
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
