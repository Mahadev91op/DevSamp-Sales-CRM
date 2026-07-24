'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  UserCheck, 
  TrendingDown, 
  Layers, 
  Download,
  AlertTriangle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar,
  Cell
} from 'recharts';
import { toast } from 'sonner';

export default function Reports() {
  const [loading, setLoading] = useState(true);

  // Analytical Datasets
  const competitorData = [
    { name: 'Marg ERP', count: 12, color: '#3b82f6' },
    { name: 'Vyapar', count: 8, color: '#10b981' },
    { name: 'GoFrugal', count: 5, color: '#f59e0b' },
    { name: 'Tally', count: 4, color: '#8b5cf6' },
    { name: 'Busy', count: 2, color: '#ec4899' },
  ];

  const lossReasonsData = [
    { reason: 'Pricing Concern', count: 8 },
    { reason: 'Complex Interface', count: 5 },
    { reason: 'Missing Feature', count: 4 },
    { reason: 'Prefers Offline local app', count: 3 },
  ];

  const executiveLeaderboard = [
    { name: 'Ravi Kumar', deals: 14, score: 95 },
    { name: 'Sneha Patel', deals: 11, score: 88 },
    { name: 'Executive user (You)', deals: 8, score: 82 },
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleExportCSV = (reportName) => {
    toast.success(`Exported ${reportName} to CSV successfully!`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-neutral-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-neutral-200 rounded-2xl animate-pulse" />
          <div className="h-80 bg-neutral-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-800 tracking-tight">Intelligence & Reports</h1>
          <p className="text-xs text-neutral-400 mt-1">Review team performance, loss reasons, and competitor analytics</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleExportCSV('Sales Pipeline Summary')}
            className="flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer select-none transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-neutral-100 p-5 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Top Performing City</p>
          <div className="flex items-center gap-3 mt-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs font-bold text-neutral-800">Mumbai</p>
              <span className="text-[9px] text-neutral-400">14 active client shops</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-100 p-5 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Avg Closing Speed</p>
          <div className="flex items-center gap-3 mt-3">
            <Clock className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs font-bold text-neutral-800">8.5 Days</p>
              <span className="text-[9px] text-neutral-400">Demo booking to signature</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-100 p-5 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Top Executive Performer</p>
          <div className="flex items-center gap-3 mt-3">
            <UserCheck className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs font-bold text-neutral-800">Ravi Kumar</p>
              <span className="text-[9px] text-neutral-400">14 deals closed this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Competitor Distribution & Loss Reasons Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Competitor distribution graph */}
        <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-neutral-800">Market Intelligence (ERP Share)</h3>
            <p className="text-[10px] text-neutral-400 mt-0.5">Competitor packages currently running at visited shops</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={competitorData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--card)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '8px',
                    fontSize: '11px'
                  }} 
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32}>
                  {competitorData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loss reasons graph */}
        <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-neutral-800">Deal Loss Reasons Analysis</h3>
            <p className="text-[10px] text-neutral-400 mt-0.5">Identified deal blockers reported by sales team</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lossReasonsData} layout="vertical">
                <XAxis type="number" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="reason" type="category" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} width={130} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--card)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '8px',
                    fontSize: '11px'
                  }} 
                />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performers leaderboard table */}
      <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-neutral-800">Team Leaderboard Performance</h3>
          <p className="text-[10px] text-neutral-400 mt-0.5">Sales representative targets and score status</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-100 text-[10px] font-bold text-neutral-400 uppercase bg-neutral-50/50">
                <th className="p-3">Representative</th>
                <th className="p-3">Deals Closed</th>
                <th className="p-3">Performance Score</th>
                <th className="p-3 text-right">Commission Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {executiveLeaderboard.map((exec, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/30">
                  <td className="p-3 font-semibold text-neutral-800">{exec.name}</td>
                  <td className="p-3 text-neutral-500">{exec.deals}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-800">{exec.score}/100</span>
                      <div className="w-20 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${exec.score}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right text-emerald-600 font-bold">
                    {exec.deals >= 12 ? 'Gold (10%)' : exec.deals >= 10 ? 'Silver (7.5%)' : 'Bronze (5%)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
