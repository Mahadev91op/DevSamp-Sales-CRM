'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { 
  Users, 
  MapPin, 
  Database,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

export default function Pipeline() {
  const { leads, setLeads } = useStore();
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
      }
    } catch (e) {
      toast.error('Error loading pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const columns = [
    { id: 'New', title: 'New Leads', color: 'border-t-blue-500' },
    { id: 'Contacted', title: 'Contacted', color: 'border-t-purple-500' },
    { id: 'Demo Scheduled', title: 'Demo Booked', color: 'border-t-amber-500' },
    { id: 'Trial Started', title: 'Trial Started', color: 'border-t-teal-500' },
    { id: 'Negotiation', title: 'Negotiation', color: 'border-t-indigo-500' },
    { id: 'Won', title: 'Won (Closed)', color: 'border-t-emerald-500' },
  ];

  // Drag and Drop implementation
  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (!leadId) return;

    // Optimistically update UI
    const currentLeads = [...leads];
    const targetLeadIndex = leads.findIndex(l => l.id === leadId);
    if (targetLeadIndex === -1) return;

    const oldStatus = leads[targetLeadIndex].status;
    if (oldStatus === columnId) return;

    // Perform state update
    const updatedLeads = leads.map(l => l.id === leadId ? { ...l, status: columnId } : l);
    setLeads(updatedLeads);

    try {
      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: columnId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback on error
        setLeads(currentLeads);
        toast.error('Failed to update lead status');
      } else {
        toast.success(`Moved lead to ${columnId}`);
      }
    } catch (err) {
      setLeads(currentLeads);
      toast.error('Network error during pipeline update');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Sales Pipeline</h1>
        <p className="text-xs text-gray-400 mt-1">Drag and drop leads to advance stages</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {columns.map((col) => {
            const colLeads = (leads || []).filter(l => l.status === col.id);
            return (
              <div 
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="flex-shrink-0 w-72 bg-white rounded-2xl border border-gray-200 p-4 min-h-[500px]"
              >
                {/* Header */}
                <div className={`border-t-2 ${col.color} pt-2 pb-4 flex justify-between items-center`}>
                  <h3 className="text-xs font-bold text-gray-800">{col.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    {colLeads.length}
                  </span>
                </div>

                {/* Leads list */}
                <div className="space-y-3">
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing card-hover select-none space-y-3"
                    >
                      <h4 className="font-semibold text-xs text-gray-900">{lead.name}</h4>
                      <p className="text-[10px] text-gray-400 truncate">{lead.notes || 'No description notes.'}</p>
                      
                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-neutral-50">
                        <span className={`font-semibold ${
                          lead.priority === 'High' ? 'text-red-500' : lead.priority === 'Medium' ? 'text-amber-500' : 'text-blue-500'
                        }`}>
                          {lead.priority}
                        </span>
                        <span>{lead.phone}</span>
                      </div>
                    </div>
                  ))}
                  {colLeads.length === 0 && (
                    <div className="py-12 text-center text-[10px] text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                      Drag leads here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
