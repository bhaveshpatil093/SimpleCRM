import React, { useState, useMemo } from 'react';
import { useCRMStore } from '../lib/store';
import { useAuth } from '../lib/auth';
import { LeadStatus } from '../types';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  ChevronDown,
  ArrowUpDown,
  SlidersHorizontal,
  Target,
  List,
  Grid,
  Download,
  Upload,
  PhoneCall,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { useTranslation } from '../lib/i18n';
import LeadForm from './LeadForm';
import LeadDetail from './LeadDetail';
import { motion, AnimatePresence } from 'framer-motion';

const LeadList: React.FC = () => {
  const { leads, language } = useCRMStore();
  const { user } = useAuth();
  const { t } = useTranslation(language);
  
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>(window.innerWidth < 1024 ? 'cards' : 'list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'value'>('recent');

  const visibleLeads = useMemo(() => {
    if (!user) return [];
    const filtered = user.role === 'Owner' || user.role === 'Manager' 
      ? leads 
      : leads.filter(l => l.assignedToId === user.email);

    return filtered.filter(l => 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.company.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'value') return b.value - a.value;
      return new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime();
    });
  }, [leads, user, searchTerm, sortBy]);

  if (selectedLeadId) {
    return <LeadDetail leadId={selectedLeadId} onBack={() => setSelectedLeadId(null)} />;
  }

  const getStatusStyles = (status: string) => {
    switch(status) {
      case LeadStatus.NEW: return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case LeadStatus.QUALIFIED: return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      case LeadStatus.CONVERTED: return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">Leads Pipeline</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage and track your potential business opportunities.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 hidden md:flex mr-2">
            <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded transition-all", viewMode === 'list' ? "bg-slate-100 dark:bg-slate-800 text-primary shadow-inner" : "text-slate-400")}><List size={16} /></button>
            <button onClick={() => setViewMode('cards')} className={cn("p-1.5 rounded transition-all", viewMode === 'cards' ? "bg-slate-100 dark:bg-slate-800 text-primary shadow-inner" : "text-slate-400")}><Grid size={16} /></button>
          </div>
          <button className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-primary transition-all"><Download size={18} /></button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-primary-600 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Add New Lead
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search leads by name, company..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
            <SlidersHorizontal size={16} /> Filters
          </button>
          <div className="relative">
            <select 
              className="pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold appearance-none outline-none cursor-pointer"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
            >
              <option value="recent">Last Contact</option>
              <option value="name">Name A-Z</option>
              <option value="value">Highest Value</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Main View */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Company / Contact</th>
                  <th className="p-4 font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                  <th className="p-4 font-semibold text-slate-500 uppercase tracking-widest text-[10px]">Assigned To</th>
                  <th className="p-4 font-semibold text-slate-500 uppercase tracking-widest text-[10px] text-right">Potential Value</th>
                  <th className="p-4 font-semibold text-slate-500 uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleLeads.map(lead => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all cursor-pointer group"
                    onClick={() => setSelectedLeadId(lead.id)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs uppercase group-hover:bg-primary group-hover:text-white transition-all">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{lead.name}</p>
                          <p className="text-[11px] text-slate-500">{lead.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", getStatusStyles(lead.status))}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                      {lead.assignedTo || 'Unassigned'}
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(lead.value)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-1.5 text-slate-400 hover:text-primary transition-colors"><PhoneCall size={16} /></button>
                        <button className="p-1.5 text-slate-400 hover:text-success transition-colors"><MessageCircle size={16} /></button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><MoreVertical size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {visibleLeads.map(lead => (
              <div 
                key={lead.id} 
                onClick={() => setSelectedLeadId(lead.id)}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer relative group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 uppercase">{lead.name.charAt(0)}</div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{lead.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{lead.company}</p>
                    </div>
                  </div>
                  <button className="text-slate-300 hover:text-slate-600 transition-colors"><MoreVertical size={16} /></button>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800">
                  <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest", getStatusStyles(lead.status))}>{lead.status}</span>
                  <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(lead.value)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {visibleLeads.length === 0 && (
          <div className="py-20 text-center">
            <Target size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">No leads matching your search.</p>
            <button onClick={() => setIsFormOpen(true)} className="mt-4 text-primary font-bold text-sm hover:underline">Add Your First Lead</button>
          </div>
        )}
      </div>

      {isFormOpen && <LeadForm onClose={() => setIsFormOpen(false)} />}
    </div>
  );
};

export default LeadList;