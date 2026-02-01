
import React from 'react';
import { useCRMStore } from '../lib/store';
import { 
  Phone, Mail, MessageSquare, Users, FileText, CheckCircle2, 
  Zap, Briefcase, UserPlus, Clock, ArrowRight
} from 'lucide-react';
import { timeAgo, cn } from '../lib/utils';
import { ActivityType } from '../types';

interface ActivityFeedProps {
  limit?: number;
  onViewAll?: () => void;
  onSelectEntity?: (type: string, id: string) => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ limit = 10, onViewAll, onSelectEntity }) => {
  const { activities, leads, customers, deals } = useCRMStore();

  const sortedActivities = [...activities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  const getEntityName = (id: string, type: string) => {
    if (type === 'Lead') return leads.find(l => l.id === id)?.name || 'Unknown Lead';
    if (type === 'Customer') return customers.find(c => c.id === id)?.name || 'Unknown Customer';
    if (type === 'Deal') return deals.find(d => d.id === id)?.title || 'Unknown Deal';
    return 'Unknown Entity';
  };

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case 'Call': return <Phone size={14} className="text-blue-500" />;
      case 'Email': return <Mail size={14} className="text-purple-500" />;
      case 'WhatsApp': return <MessageSquare size={14} className="text-[#25D366]" />;
      case 'Meeting': return <Users size={14} className="text-orange-500" />;
      case 'Task': return <CheckCircle2 size={14} className="text-success" />;
      case 'StatusChange': return <Zap size={14} className="text-indigo-500" />;
      case 'Created': return <UserPlus size={14} className="text-blue-600" />;
      default: return <FileText size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {sortedActivities.map((act) => (
        <div 
          key={act.id}
          onClick={() => onSelectEntity?.(act.entityType.toLowerCase() + 's', act.entityId)}
          className="group flex gap-4 p-4 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-primary/10"
        >
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
             {getIcon(act.type)}
          </div>
          <div className="flex-1 min-w-0">
             <div className="flex justify-between items-start gap-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                   {getEntityName(act.entityId, act.entityType)}
                </p>
                <span className="text-[9px] font-bold text-slate-300 uppercase shrink-0">{timeAgo(act.timestamp)}</span>
             </div>
             <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                <span className="font-bold text-slate-400 uppercase text-[9px] mr-1">{act.type}:</span> {act.content}
             </p>
          </div>
          <ArrowRight size={14} className="text-slate-200 group-hover:text-primary transition-colors self-center opacity-0 group-hover:opacity-100" />
        </div>
      ))}

      {onViewAll && sortedActivities.length > 0 && (
        <button 
          onClick={onViewAll}
          className="w-full py-4 text-[10px] font-bold text-primary hover:bg-primary/5 rounded-2xl uppercase tracking-widest transition-all"
        >
          View Full Activity Feed
        </button>
      )}

      {sortedActivities.length === 0 && (
        <div className="p-10 text-center">
           <p className="text-xs text-slate-400 font-medium">No recent activity found.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
