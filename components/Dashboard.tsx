import React, { useMemo } from 'react';
import { useCRMStore } from '../lib/store';
import { useAuth } from '../lib/auth';
import { 
  TrendingUp, 
  Users, 
  Target, 
  IndianRupee, 
  Plus, 
  ChevronRight,
  Activity,
  ArrowUpRight,
  Clock,
  Calendar
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { useTranslation } from '../lib/i18n';
import { DealStage } from '../types';
import ActivityFeed from './ActivityFeed';

const Dashboard: React.FC = () => {
  const { leads, deals, customers, events, language } = useCRMStore();
  const { user } = useAuth();
  const { t } = useTranslation(language);

  const firstName = user?.name.split(' ')[0] || 'there';

  // Metrics
  const activeDeals = deals.filter(d => d.stage !== DealStage.WON && d.stage !== DealStage.LOST);
  const totalActiveValue = activeDeals.reduce((acc, d) => acc + d.value, 0);
  const wonValue = deals.filter(d => d.stage === DealStage.WON).reduce((acc, d) => acc + d.value, 0);

  const metrics = [
    { label: 'Total Leads', value: leads.length, icon: Target, trend: '+12% from last month' },
    { label: 'Pipeline Value', value: formatCurrency(totalActiveValue), icon: TrendingUp, trend: '4 active opportunities' },
    { label: 'Total Customers', value: customers.length, icon: Users, trend: '2 converted this week' },
    { label: 'Revenue (Won)', value: formatCurrency(wonValue), icon: IndianRupee, trend: 'YTD performance' },
  ];

  // Placeholder chart data
  const chartData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 5000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {firstName}.
          </h1>
          <p className="text-slate-500 font-medium mt-1">Here is what's happening with your sales pipeline today.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
          <Calendar size={14} className="mr-1" /> {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                <m.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded flex items-center gap-1">
                <ArrowUpRight size={10} /> 8%
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{m.label}</p>
              <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">{m.value}</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-3">{m.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Performance Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-heading font-bold">Revenue Performance</h3>
            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-xs font-bold outline-none cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              <h3 className="text-xl font-heading font-bold">Recent Feed</h3>
            </div>
            <button className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest underline decoration-slate-200 underline-offset-4">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <ActivityFeed limit={5} />
          </div>
        </div>

        {/* Today's Events Widget */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-heading font-bold">Today's Priorities</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{events.length} Upcoming</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.slice(0, 3).map((e, idx) => (
              <div key={idx} className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-slate-200 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-sm border border-slate-100 dark:border-slate-700">
                  <Clock size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{e.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">
                    {new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {e.type}
                  </p>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
              </div>
            ))}
            {events.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                <p className="text-slate-400 text-sm font-medium">Your schedule is clear for today.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;