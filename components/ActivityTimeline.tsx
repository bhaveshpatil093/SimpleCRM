
import React, { useState, useMemo } from 'react';
import { 
  Phone, Mail, MessageSquare, Users, FileText, CheckCircle2, 
  RefreshCw, UserPlus, Briefcase, Zap, Search, Filter, 
  MoreVertical, ChevronDown, Trash2, Edit3, Sparkles,
  Clock, MapPin,
  History as HistoryIcon
} from 'lucide-react';
import { useCRMStore } from '../lib/store';
import { CRMActivity, ActivityType } from '../types';
import { timeAgo, formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityTimelineProps {
  entityId: string;
  entityType: 'Lead' | 'Customer' | 'Deal';
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ entityId, entityType }) => {
  const { activities, deleteActivity } = useCRMStore();
  const [filter, setFilter] = useState<ActivityType | 'All'>('All');
  const [search, setSearch] = useState('');

  const filteredActivities = useMemo(() => {
    return activities
      .filter(a => a.entityId === entityId && a.entityType === entityType)
      .filter(a => filter === 'All' || a.type === filter)
      .filter(a => !search || a.content.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activities, entityId, entityType, filter, search]);

  const groupedActivities = useMemo(() => {
    const groups: Record<string, CRMActivity[]> = {};
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

    filteredActivities.forEach(a => {
      const date = new Date(a.timestamp).toLocaleDateString();
      let label = formatDate(a.timestamp);
      if (date === today) label = 'Today';
      else if (date === yesterday) label = 'Yesterday';
      
      if (!groups[label]) groups[label] = [];
      groups[label].push(a);
    });
    return groups;
  }, [filteredActivities]);

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case 'Call': return <Phone size={16} />;
      case 'Email': return <Mail size={16} />;
      case 'WhatsApp': return <MessageSquare size={16} />;
      case 'Meeting': return <Users size={16} />;
      case 'Task': return <CheckCircle2 size={16} />;
      case 'StatusChange': return <RefreshCw size={16} />;
      case 'Created': return <UserPlus size={16} />;
      case 'DealEvent': return <Briefcase size={16} />;
      case 'Note': return <FileText size={16} />;
      default: return <Zap size={16} />;
    }
  };

  const getColor = (type: ActivityType) => {
    switch (type) {
      case 'Call': return 'bg-blue-500';
      case 'WhatsApp': return 'bg-[#25D366]';
      case 'Meeting': return 'bg-orange-500';
      case 'Task': return 'bg-success';
      case 'StatusChange': return 'bg-indigo-500';
      case 'Email': return 'bg-purple-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-10">
      {/* Filtering */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
         <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{filteredActivities.length} logs found</span>
         </div>
         
         <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56 group">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
               <input 
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary dark:text-white transition-all"
                  placeholder="Keyword search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
               />
            </div>
            <select 
              className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-black uppercase tracking-widest dark:text-white outline-none cursor-pointer hover:bg-slate-50"
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
            >
               <option value="All">All Types</option>
               <option value="Call">Calls</option>
               <option value="Meeting">Meetings</option>
               <option value="WhatsApp">WhatsApp</option>
               <option value="Note">Notes</option>
            </select>
         </div>
      </div>

      {/* Timeline Grid */}
      <div className="relative px-2">
        <div className="absolute top-4 bottom-0 left-8 md:left-10 w-1 bg-slate-100 dark:bg-slate-800/50 rounded-full z-0" />

        <div className="space-y-12">
          {Object.entries(groupedActivities).map(([dateLabel, items]) => (
            <div key={dateLabel} className="space-y-10 relative">
              <div className="relative z-10 flex items-center">
                 <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.25em] shadow-lg ml-3 md:ml-5 border-2 border-white dark:border-slate-950">
                    {dateLabel}
                 </div>
              </div>

              <div className="space-y-8">
                {/* Fixed: Cast items from Object.entries to CRMActivity array to resolve unknown type error. */}
                {(items as CRMActivity[]).map((activity, idx) => (
                  <motion.div 
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative group"
                  >
                    <div className={cn(
                      "absolute top-5 left-6 md:left-8 w-8 h-8 rounded-xl border-4 border-white dark:border-slate-950 flex items-center justify-center z-10 text-white shadow-md",
                      getColor(activity.type)
                    )}>
                       {getIcon(activity.type)}
                    </div>

                    <div className="ml-16 md:ml-20 bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                         <div className="flex flex-col gap-0.5">
                            <h5 className="text-sm font-heading font-black text-slate-900 dark:text-white leading-none">
                               {activity.type} logged by {activity.user}
                            </h5>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                               {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                         </div>
                         
                         <div className="flex items-center gap-2">
                            {activity.aiAnalysis && (
                               <div className={cn(
                                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                  activity.aiAnalysis.sentiment === 'Positive' ? "bg-success/10 text-success border-success/20" : 
                                  activity.aiAnalysis.sentiment === 'Negative' ? "bg-red-50 text-red-500 border-red-100" : "bg-slate-50 text-slate-400 border-slate-100"
                               )}>
                                  <Sparkles size={10} className="fill-current" /> {activity.aiAnalysis.sentiment}
                               </div>
                            )}
                            <button onClick={() => deleteActivity(activity.id)} className="p-2 text-slate-200 hover:text-red-500 transition-all">
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </div>

                      <div className="space-y-4">
                        <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-transparent group-hover:border-slate-100 transition-all">
                           {activity.content}
                        </div>
                        
                        {(activity.duration || activity.location || activity.taskStatus) && (
                          <div className="flex flex-wrap gap-2 pt-1">
                             {activity.duration && <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700"><Clock size={10} /> {activity.duration}</span>}
                             {activity.location && <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700"><MapPin size={10} /> {activity.location}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredActivities.length === 0 && (
        <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[32px] border-4 border-dashed border-slate-100 dark:border-slate-800">
           <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <HistoryIcon size={40} strokeWidth={1} />
           </div>
           <h4 className="text-slate-900 dark:text-white font-black text-xl uppercase tracking-widest">No activities</h4>
           <p className="text-slate-400 text-xs mt-3 max-w-xs mx-auto font-medium">Log your first meeting, call, or note using the input bar below.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
