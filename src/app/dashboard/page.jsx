'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Activity, 
  CheckSquare, 
  Award, 
  IndianRupee, 
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
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
      <div className="space-y-6">
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 lg:col-span-2 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
          <div className="h-80 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    monthlyRevenue: 18500,
    totalLeads: 0,
    newLeads: 0,
    interestedLeads: 0,
    visitsToday: 0,
    activeTrials: 0,
    conversionRate: 0,
    pendingTasks: 0,
    performanceScore: 0,
  };

  const charts = data?.charts || {
    weeklyVisits: [],
    pipelineFunnel: [],
    leadSources: []
  };

  const cards = [
    {
      title: 'Monthly Revenue',
      value: `₹${kpis.monthlyRevenue.toLocaleString('en-IN')}`,
      change: '+14% from last month',
      isPositive: true,
      icon: IndianRupee,
      color: 'text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: "Today's Visits",
      value: kpis.visitsToday,
      change: '+2 completed visits',
      isPositive: true,
      icon: MapPin,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      title: 'Active Trials',
      value: kpis.activeTrials,
      change: '2 trials expiring soon',
      isPositive: false,
      icon: Activity,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Conversion Rate',
      value: `${kpis.conversionRate}%`,
      change: '+3.5% avg closing speed',
      isPositive: true,
      icon: TrendingUp,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Here's what is happening with your medical sales pipeline today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 text-[11px] font-medium text-blue-600 dark:text-sky-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Daily Performance Score: {kpis.performanceScore}/100</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i} 
              className="bg-white dark:bg-[#131b26] border border-neutral-100 dark:border-neutral-800 p-6 rounded-2xl shadow-xs card-hover flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500">{card.title}</p>
                  <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mt-2 tracking-tight">
                    {card.value}
                  </h3>
                </div>
                <div className={`p-2.5 rounded-xl ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-[10px] font-medium">
                {card.isPositive ? (
                  <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Clock className="w-3 h-3 text-purple-500" />
                )}
                <span className={card.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500 dark:text-neutral-400'}>
                  {card.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Visits Log */}
        <div className="bg-white dark:bg-[#131b26] border border-neutral-100 dark:border-neutral-800 p-6 rounded-2xl shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">Visits Performance</h3>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">Visits completed during the current week</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.weeklyVisits}>
                <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--card)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: 'var(--foreground)'
                  }} 
                />
                <Bar dataKey="visits" fill="#0071e3" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Distribution */}
        <div className="bg-white dark:bg-[#131b26] border border-neutral-100 dark:border-neutral-800 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">Lead Sources</h3>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">Marketing channels performance</p>
            </div>
          </div>
          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.leadSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {charts.leadSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--card)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '8px',
                    fontSize: '11px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {charts.leadSources.map((source, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-600 dark:text-neutral-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: source.color }} />
                <span className="truncate">{source.name} ({source.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Logs & Pipeline Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Stages Funnel (Visualized as AreaChart) */}
        <div className="bg-white dark:bg-[#131b26] border border-neutral-100 dark:border-neutral-800 p-6 rounded-2xl shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">Pipeline Funnel</h3>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">Active counts at each CRM milestone</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.pipelineFunnel}>
                <XAxis dataKey="stage" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--card)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '8px',
                    fontSize: '11px'
                  }} 
                />
                <defs>
                  <linearGradient id="colorFunnel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0071e3" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0071e3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="count" stroke="#0071e3" strokeWidth={2} fillOpacity={1} fill="url(#colorFunnel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-[#131b26] border border-neutral-100 dark:border-neutral-800 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">Recent Activities</h3>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">System-wide logs and events</p>
            </div>
          </div>
          <div className="space-y-4">
            {data?.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.map((act, i) => (
                <div key={i} className="flex gap-3 text-xs leading-normal">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-[#131b26] z-10" />
                    {i < data.recentActivities.length - 1 && (
                      <div className="w-[1px] bg-neutral-100 dark:bg-neutral-800 flex-grow my-1" />
                    )}
                  </div>
                  <div className="flex-1 -mt-0.5">
                    <p className="font-medium text-neutral-700 dark:text-neutral-300">
                      {act.action}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-neutral-400">
                      <span>{act.actor}</span>
                      <span>•</span>
                      <span>{act.date}, {act.time}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-neutral-400 text-xs">
                No recent activity logged
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
