
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  Trash2, 
  UserPlus, 
  Briefcase, 
  Zap, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import { useCRMStore } from '../lib/store';
import { timeAgo, cn } from '../lib/utils';
import { CRMNotification, NotificationType } from '../types';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAllNotificationsAsRead, language } = useCRMStore();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2.5 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl relative transition-all active:scale-95",
          isOpen && "bg-slate-200 dark:bg-slate-700 text-primary"
        )}
      >
        <Bell size={20} className={cn(unreadCount > 0 && "animate-pulse")} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[360px] max-w-[90vw] bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[100] animate-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
             <div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{unreadCount} unread messages</p>
             </div>
             {unreadCount > 0 && (
               <button 
                 onClick={markAllNotificationsAsRead}
                 className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
               >
                 <CheckCheck size={14} /> Mark all read
               </button>
             )}
          </div>

          <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                 <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200 dark:text-slate-700">
                    <Bell size={32} />
                 </div>
                 <p className="text-sm font-bold text-slate-400">All caught up!</p>
                 <p className="text-[10px] text-slate-300 mt-1">Check back later for updates.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {notifications.map((n) => (
                  <NotificationItem key={n.id} notification={n} />
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <button className="w-full p-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest text-center bg-slate-50/30 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-800">
              See past activities
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const NotificationItem: React.FC<{ notification: CRMNotification }> = ({ notification }) => {
  const { markNotificationAsRead, deleteNotification } = useCRMStore();

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'Lead': return <UserPlus size={16} className="text-blue-500" />;
      case 'Deal': return <Briefcase size={16} className="text-orange-500" />;
      case 'Reminder': return <Clock size={16} className="text-purple-500" />;
      case 'Activity': return <Zap size={16} className="text-yellow-500" />;
      case 'Milestone': return <CheckCircle2 size={16} className="text-success" />;
      default: return <Bell size={16} className="text-slate-400" />;
    }
  };

  const handleRead = () => {
    if (!notification.isRead) markNotificationAsRead(notification.id);
  };

  return (
    <div 
      className={cn(
        "p-5 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative group",
        !notification.isRead && "bg-primary/[0.02] dark:bg-primary/[0.05]"
      )}
      onClick={handleRead}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2",
        !notification.isRead ? "border-primary/20 bg-white dark:bg-slate-900" : "border-transparent bg-slate-50 dark:bg-slate-800"
      )}>
        {getIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className={cn("text-xs leading-snug truncate", notification.isRead ? "text-slate-600 dark:text-slate-400 font-medium" : "text-slate-900 dark:text-white font-bold")}>
            {notification.title}
          </h4>
          <span className="text-[9px] font-bold text-slate-300 uppercase shrink-0 whitespace-nowrap">{timeAgo(notification.timestamp)}</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-medium line-clamp-2">
          {notification.description}
        </p>
      </div>

      {!notification.isRead && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,102,255,0.5)]" />
      )}

      <button 
        onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
        className="absolute right-2 top-2 p-1.5 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
};
