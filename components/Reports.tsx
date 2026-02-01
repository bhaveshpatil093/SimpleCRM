
import React, { useState, useMemo, useEffect } from 'react';
import { useCRMStore } from '../lib/store';
import { DealStage, LeadSource, LeadStatus, ActivityType } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area, FunnelChart, Funnel, LabelList
} from 'recharts';
import { 
  Download, Calendar, TrendingUp, Users, Target, IndianRupee, 
  BarChart3, PieChart as PieChartIcon, MapPin, CheckCircle2, 
  Clock, ArrowUpRight, ArrowDownRight, Sparkles, Mail, Phone, 
  FileText, Briefcase, Filter, ChevronDown, Share2, Printer,
  Activity as ActivityIcon,
  ChevronRight,
  TrendingDown,
  RefreshCw,
  Zap,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { getReportInsights } from '../lib/ai';
import { exportToExcel } from '../lib/data';

const COLORS = ['#0066FF', '#FF6B35', '#00B894', '#6C5CE7', '#FDCB6E', '#E84393'];

const Reports: React.FC = () => {
  const { leads, deals, customers, activities } = useCRMStore();
  const [activeTab, setActiveTab] = useState<'sales' | 'leads' | 'customers' | 'activity'>('sales');
  const [dateRange, setDateRange] = useState<'Week' | 'Month' | 'Quarter' | 'Fiscal'>('Month');
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 1. Dynamic Data Filtering Logic
  const filteredData = useMemo(() => {
    const now = new Date();
    let cutoff = new Date();
    if (dateRange === 'Week') cutoff.setDate(now.getDate() - 7);
    else if (dateRange === 'Month') cutoff.setMonth(now.getMonth() - 1);
    else if (dateRange === 'Quarter') cutoff.setMonth(now.getMonth() - 3);
    else if (dateRange === 'Fiscal') cutoff.setFullYear(now.getFullYear() - 1);

    return {
      leads: leads.filter(l => new Date(l.createdAt) >= cutoff),
      deals: deals.filter(d => new Date(d.createdAt) >= cutoff || (d.actualClose && new Date(d.actualClose) >= cutoff)),
      customers: customers.filter(c => new Date(c.customerSince) >= cutoff),
      activities: activities.filter(a => new Date(a.timestamp) >= cutoff)
    };
  }, [leads, deals, customers, activities, dateRange]);

  useEffect(() => {
    fetchAiInsights();
  }, [dateRange]);

  const fetchAiInsights = async () => {
    setIsAiLoading(true);
    const wonValue = deals.filter(d => d.stage === DealStage.WON).reduce((sum, d) => sum + d.value, 0);
    const lostValue = deals.filter(d => d.stage === DealStage.LOST).reduce((sum, d) => sum + d.value, 0);
    const sources = Array.from(new Set(leads.map(l => l.source))).slice(0, 3);
    
    const insights = await getReportInsights({
      leadsCount: filteredData.leads.length,
      customersCount: filteredData.customers.length,
      wonDealsValue: wonValue,
      lostDealsValue: lostValue,
      topSources: sources as string[]
    }) as string[];
    
    setAiInsights(insights);
    setIsAiLoading(false);
  };

  // 2. Report Calculations
  const revenueData = useMemo(() => {
    // Group won deals by month for the line chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const data = months.map((m, i) => {
      const value = deals
        .filter(d => d.stage === DealStage.WON && d.actualClose && new Date(d.actualClose).getMonth() === i && new Date(d.actualClose).getFullYear() === currentYear)
        .reduce((sum, d) => sum + d.value, 0);
      return { name: m, revenue: value };
    });
    // Ensure we have some data to show even if demo deals are sparse
    return data.some(d => d.revenue > 0) ? data : [
      { name: 'Jan', revenue: 400000 }, { name: 'Feb', revenue: 700000 }, { name: 'Mar', revenue: 550000 },
      { name: 'Apr', revenue: 900000 }, { name: 'May', revenue: 1200000 }, { name: 'Jun', revenue: 800000 }
    ];
  }, [deals]);

  const leadSourceData = useMemo(() => {
    const sourceCounts: Record<string, number> = {};
    filteredData.leads.forEach(l => {
      sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
    });
    const data = Object.entries(sourceCounts).map(([name, value]) => ({ name, value }));
    return data.length > 0 ? data : [{ name: 'Website', value: 10 }, { name: 'Referral', value: 5 }];
  }, [filteredData.leads]);

  const funnelData = useMemo(() => [
    { value: leads.length, name: 'Total Leads', fill: '#0066FF' },
    { value: leads.filter(l => l.status !== LeadStatus.NEW).length, name: 'Engaged', fill: '#6C5CE7' },
    { value: leads.filter(l => l.status === LeadStatus.QUALIFIED).length, name: 'Qualified', fill: '#FF6B35' },
    { value: customers.length, name: 'Customers', fill: '#00B894' },
  ], [leads, customers]);

  const winRate = useMemo(() => {
    const closed = deals.filter(d => d.stage === DealStage.WON || d.stage === DealStage.LOST).length;
    if (closed === 0) return 0;
    return Math.round((deals.filter(d => d.stage === DealStage.WON).length / closed) * 100);
  }, [deals]);

  const activityByType = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.activities.forEach(a => {
      counts[a.type] = (counts[a.type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData.activities]);

  const teamPerformance = useMemo(() => {
    const team: Record<string, { count: number, value: number }> = {};
    deals.forEach(d => {
      if (!team[d.assignedTo]) team[d.assignedTo] = { count: 0, value: 0 };
      if (d.stage === DealStage.WON) {
        team[d.assignedTo].count += 1;
        team[d.assignedTo].value += d.value;
      }
    });
    return Object.entries(team).map(([name, stats]) => ({ name, ...stats }));
  }, [deals]);

  const handleExportAll = () => {
    exportToExcel([
      { name: 'Leads', data: leads },
      { name: 'Customers', data: customers },
      { name: 'Deals', data: deals },
      { name: 'Activity', data: activities }
    ], `SimpleCRM_Full_Report_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-24">
      {/* 1. Header & Date Control */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight">Business Intelligence</h1>
          <p className="text-slate-500 font-medium mt-1">Growth tracking and predictive analytics powered by Bharat CRM.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-1.5 flex items-center shadow-sm">
            {(['Week', 'Month', 'Quarter', 'Fiscal'] as const).map(range => (
              <button 
                key={range}
                onClick={() => setDateRange(range)}
                className={cn(
                  "px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                  dateRange === range 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button 
            onClick={handleExportAll}
            className="bg-primary text-white px-8 py-3.5 rounded-3xl font-black text-xs uppercase tracking-[0.15em] flex items-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            <Download size={18} /> Export Master Log
          </button>
        </div>
      </div>

      {/* 2. AI Executive Summary Banner */}
      <div className="bg-slate-900 dark:bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl group border border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-all duration-1000"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 flex-shrink-0 shadow-inner">
               <Sparkles size={40} className="text-amber-400 animate-pulse" />
            </div>
            <div className="flex-1 space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-heading font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                    <Zap size={18} fill="currentColor" /> Strategic Insights
                  </h3>
                  <button onClick={fetchAiInsights} className="p-2 hover:bg-white/10 rounded-full transition-all active:rotate-180 duration-500">
                    <RefreshCw size={16} className={cn(isAiLoading && "animate-spin")} />
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {isAiLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="space-y-4 animate-pulse">
                        <div className="h-2 w-full bg-white/10 rounded-full"></div>
                        <div className="h-2 w-4/5 bg-white/10 rounded-full"></div>
                        <div className="h-2 w-2/3 bg-white/10 rounded-full"></div>
                      </div>
                    ))
                  ) : (
                    aiInsights.length > 0 ? aiInsights.map((insight, i) => (
                      <div key={i} className="bg-white/5 p-6 rounded-[32px] border border-white/5 hover:bg-white/[0.08] transition-all">
                         <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center mb-4 text-[10px] font-black">{i+1}</div>
                         <p className="text-sm font-bold text-slate-300 leading-relaxed">{insight.replace(/^[•\-\d\.]+\s*/, '')}</p>
                      </div>
                    )) : <p className="text-slate-400 text-sm">No insights available for this period.</p>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Reporting Navigation - REMOVED STICKY top-4 */}
      <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[32px] w-full max-w-4xl mx-auto border border-slate-100 dark:border-slate-800 shadow-xl relative mb-4">
        {[
          { id: 'sales', label: 'Sales velocity', icon: TrendingUp },
          { id: 'leads', label: 'Lead health', icon: Target },
          { id: 'customers', label: 'Partner loyalty', icon: Users },
          { id: 'activity', label: 'Team effort', icon: ActivityIcon },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all",
              activeTab === tab.id 
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-[1.02]" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            <tab.icon size={18} />
            <span className="hidden lg:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 4. Dashboard Content Grid */}
      <div className="min-h-[800px]">
        {activeTab === 'sales' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-8 duration-700">
            {/* Revenue Area Chart */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
               <div className="flex justify-between items-center mb-12">
                  <div>
                    <h3 className="text-2xl font-heading font-black text-slate-900 dark:text-white">Revenue Lifecycle</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Won deals performance - Current Year</p>
                  </div>
                  <div className="px-6 py-4 bg-success/5 rounded-[24px] border border-success/10 text-right">
                       <p className="text-[9px] font-black text-success uppercase tracking-widest">Year-to-date</p>
                       <p className="text-2xl font-heading font-black text-slate-900 dark:text-white">
                         {formatCurrency(revenueData.reduce((s,d)=>s+d.revenue, 0))}
                       </p>
                  </div>
               </div>
               <div className="h-[400px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={revenueData}>
                     <defs>
                       <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#0066FF" stopOpacity={0.15}/>
                         <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} tickFormatter={(v) => `₹${v/100000}L`} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                        itemStyle={{ fontWeight: '900', fontSize: '12px' }}
                        formatter={(v: number) => [formatCurrency(v), 'Monthly Revenue']}
                     />
                     <Area type="monotone" dataKey="revenue" stroke="#0066FF" strokeWidth={5} fillOpacity={1} fill="url(#colorSales)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xl font-heading font-black text-slate-900 dark:text-white mb-2">Deal Pipeline Health</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10">Won vs Lost ratio analysis</p>
                  
                  <div className="space-y-10">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center shadow-inner"><ArrowUpRight size={24} /></div>
                           <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Success Rate</p><p className="text-3xl font-heading font-black text-success">{winRate}%</p></div>
                        </div>
                     </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shadow-inner"><ArrowDownRight size={24} /></div>
                           <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leakage</p><p className="text-3xl font-heading font-black text-red-500">{100 - winRate}%</p></div>
                        </div>
                     </div>
                     <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pipeline Distribution</p>
                        <div className="flex gap-2 h-4 rounded-full overflow-hidden bg-slate-50 dark:bg-slate-800">
                           <div className="h-full bg-success" style={{ width: `${winRate}%` }}></div>
                           <div className="h-full bg-red-400" style={{ width: `${100 - winRate}%` }}></div>
                        </div>
                     </div>
                  </div>
                </div>
                <button className="w-full mt-10 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all">Audit Closed Deals</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-8 duration-700">
            {/* Lead Funnel */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
               <h3 className="text-2xl font-heading font-black text-slate-900 dark:text-white mb-12">Conversion Funnel</h3>
               <div className="h-[450px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <FunnelChart>
                      <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Funnel
                        dataKey="value"
                        data={funnelData}
                        isAnimationActive
                      >
                        <LabelList position="right" fill="#94a3b8" stroke="none" dataKey="name" />
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Lead Sources */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
               <h3 className="text-xl font-heading font-black text-slate-900 dark:text-white mb-10">Acquisition Channels</h3>
               <div className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={leadSourceData}
                       cx="50%"
                       cy="50%"
                       innerRadius={80}
                       outerRadius={120}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {leadSourceData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                       ))}
                     </Pie>
                     <Tooltip contentStyle={{ borderRadius: '24px', border: 'none' }} />
                     <Legend verticalAlign="bottom" height={36}/>
                   </PieChart>
                 </ResponsiveContainer>
               </div>
               <div className="mt-10 space-y-4">
                  {leadSourceData.map((source, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                       <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{source.name}</span>
                       </div>
                       <span className="text-sm font-black text-slate-900 dark:text-white">{source.value} Leads</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Customer Retention', value: '94%', sub: 'Target: 90%', icon: ShieldCheck, color: 'text-success' },
                  { label: 'Avg Lifetime Value', value: formatCurrency(customers.reduce((s,c)=>s+c.totalRevenue, 0) / (customers.length || 1)), sub: 'Across 12 mo', icon: IndianRupee, color: 'text-primary' },
                  { label: 'New Partners', value: filteredData.customers.length, sub: 'This month', icon: UserPlus, color: 'text-accent' },
                  { label: 'Churn Rate', value: '2.1%', sub: 'Down 0.5%', icon: TrendingDown, color: 'text-red-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                     <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", stat.color, "bg-current opacity-10")}>
                        <stat.icon size={24} className="opacity-100" />
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                     <p className="text-3xl font-heading font-black text-slate-900 dark:text-white">{stat.value}</p>
                     <p className="text-[10px] font-bold text-slate-400 mt-2">{stat.sub}</p>
                  </div>
                ))}
             </div>

             <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-2xl font-heading font-black text-slate-900 dark:text-white mb-10">Top Revenue Partners</h3>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="border-b border-slate-50 dark:border-slate-800">
                            <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                            <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Since</th>
                            <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Revenue</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                         {customers.sort((a,b)=>b.totalRevenue - a.totalRevenue).slice(0, 5).map(c => (
                           <tr key={c.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all cursor-pointer">
                              <td className="py-6">
                                 <div className="flex items-center gap-4">
                                    <img src={c.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-slate-100" alt="" />
                                    <div><p className="font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{c.name}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{c.company}</p></div>
                                 </div>
                              </td>
                              <td className="py-6 text-center text-sm font-bold text-slate-500">{formatDate(c.customerSince)}</td>
                              <td className="py-6 text-center"><span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase border border-amber-100">{c.loyaltyStatus}</span></td>
                              <td className="py-6 text-right font-heading font-black text-slate-900 dark:text-white">{formatCurrency(c.totalRevenue)}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-8 duration-700">
             <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-2xl font-heading font-black text-slate-900 dark:text-white mb-12">Engagement Mix</h3>
                <div className="h-[450px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityByType}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: '900', fontSize: '12px' }}
                      />
                      <Bar dataKey="value" fill="#6C5CE7" radius={[12, 12, 0, 0]} barSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-xl font-heading font-black text-slate-900 dark:text-white mb-2">Team Scoreboard</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-12">Conversion per member</p>
                <div className="space-y-10">
                   {teamPerformance.map((member, idx) => (
                      <div key={idx} className="space-y-4">
                         <div className="flex justify-between items-end">
                            <div>
                               <p className="text-sm font-black text-slate-900 dark:text-white">{member.name}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{member.count} Deals Won</p>
                            </div>
                            <p className="text-sm font-black text-primary">{formatCurrency(member.value)}</p>
                         </div>
                         <div className="h-2 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                               className="h-full bg-primary shadow-[0_0_12px_rgba(0,102,255,0.4)]" 
                               style={{ width: `${(member.value / Math.max(...teamPerformance.map(m=>m.value))) * 100}%` }} 
                            />
                         </div>
                      </div>
                   ))}
                   {teamPerformance.length === 0 && <p className="text-slate-400 text-sm italic py-10 text-center">No closed deals logged for this period.</p>}
                </div>
             </div>

             {/* Activity Heatmap Grid */}
             <div className="lg:col-span-12 bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-12">
                   <div>
                     <h3 className="text-2xl font-heading font-black text-slate-900 dark:text-white">Customer Engagement Heatmap</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Activity concentration over the last 28 days</p>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary/5"></div><span className="text-[10px] font-bold text-slate-400 uppercase">Idle</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary"></div><span className="text-[10px] font-bold text-slate-400 uppercase">Intense</span></div>
                   </div>
                </div>
                <div className="grid grid-cols-7 gap-4">
                   {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                     <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">{d}</div>
                   ))}
                   {Array(28).fill(0).map((_, i) => {
                     // Fake logic to show weekend/weekday density
                     const isWeekend = i % 7 === 0 || i % 7 === 6;
                     const baseIntensity = isWeekend ? 0.05 : 0.2;
                     const randomModifier = Math.random() * 0.8;
                     const engagement = Math.min(1, baseIntensity + randomModifier);
                     
                     return (
                       <div 
                         key={i} 
                         className="aspect-square rounded-[20px] transition-all hover:scale-110 cursor-pointer shadow-sm border border-black/5" 
                         style={{ backgroundColor: `rgba(0, 102, 255, ${engagement})` }} 
                         title={`Day ${i+1}: ${Math.round(engagement * 10)} interactions`}
                       />
                     );
                   })}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
