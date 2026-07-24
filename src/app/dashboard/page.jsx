'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import {
  TrendingUp, Users, MapPin, Activity, IndianRupee,
  ArrowUpRight, Clock, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user } = useStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/dashboard/summary');
        if (res.ok) {
          const resData = await res.json();
          setData(resData.summary);
        } else {
          toast.error('Failed to load dashboard statistics');
        }
      } catch (e) {
        toast.error('Error fetching dashboard summary');
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-blue-100 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-blue-50 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-72 lg:col-span-2 bg-blue-50 rounded-2xl" />
          <div className="h-72 bg-blue-50 rounded-2xl" />
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    monthlyRevenue: 18500, totalLeads: 0, newLeads: 0,
    visitsToday: 0, activeTrials: 0, conversionRate: 0,
    pendingTasks: 0, performanceScore: 0,
  };

  const charts = data?.charts || { weeklyVisits: [], pipelineFunnel: [], leadSources: [] };

  const cards = [
    {
      title: 'Monthly Revenue', value: `₹${kpis.monthlyRevenue.toLocaleString('en-IN')}`,
      change: '+14% from last month', positive: true, icon: IndianRupee,
      bg: 'bg-blue-50', iconColor: 'text-[#0071e3]', badge: 'bg-[#0071e3]'
    },
    {
      title: "Today's Visits", value: kpis.visitsToday,
      change: '+2 completed visits', positive: true, icon: MapPin,
      bg: 'bg-emerald-50', iconColor: 'text-emerald-600', badge: 'bg-emerald-500'
    },
    {
      title: 'Active Trials', value: kpis.activeTrials,
      change: '2 trials expiring soon', positive: false, icon: Activity,
      bg: 'bg-violet-50', iconColor: 'text-violet-600', badge: 'bg-violet-500'
    },
    {
      title: 'Conversion Rate', value: `${kpis.conversionRate}%`,
      change: '+3.5% avg closing', positive: true, icon: TrendingUp,
      bg: 'bg-amber-50', iconColor: 'text-amber-600', badge: 'bg-amber-500'
    },
  ];

  const tooltipStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '11px',
    color: '#1e293b',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            👋 Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Here's your sales pipeline overview for today.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-[11px] font-semibold text-[#0071e3]">
          <Sparkles className="w-3.5 h-3.5" />
          Performance Score: {kpis.performanceScore}/100
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full text-white ${card.badge}`}>
                  LIVE
                </span>
              </div>
              <p className="text-[11px] font-medium text-gray-500 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{card.value}</h3>
              <div className="flex items-center gap-1 mt-2 text-[10px] font-medium">
                {card.positive ? (
                  <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Clock className="w-3 h-3 text-violet-500" />
                )}
                <span className={card.positive ? 'text-emerald-600' : 'text-gray-400'}>{card.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Visits Bar Chart */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900">Visits Performance</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Completed visits per day this week</p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.weeklyVisits} barSize={28}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(0,113,227,0.04)' }} />
                <Bar dataKey="visits" fill="#0071e3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Pie Chart */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900">Lead Sources</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Channel distribution</p>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.leadSources} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                  {charts.leadSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            {charts.leadSources.map((source, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: source.color }} />
                <span className="truncate">{source.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Funnel + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pipeline Area Chart */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900">Pipeline Funnel</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Active counts at each CRM stage</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.pipelineFunnel}>
                <defs>
                  <linearGradient id="colorFunnel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0071e3" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0071e3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="stage" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#0071e3" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFunnel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Latest CRM events</p>
          </div>
          <div className="space-y-3 overflow-auto max-h-52">
            {data?.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.map((act, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#0071e3] mt-1" />
                    {i < data.recentActivities.length - 1 && (
                      <div className="w-px bg-blue-100 flex-grow my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-1">
                    <p className="font-semibold text-gray-800 leading-snug">{act.action}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{act.actor} · {act.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 text-xs">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
