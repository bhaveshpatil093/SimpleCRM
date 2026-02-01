
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Users, 
  Zap,
  Calendar as CalendarIcon,
  Search,
  Filter,
  MoreVertical,
  ChevronUp,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCRMStore } from '../lib/store';
import { CRMEvent, CalendarEventType } from '../types';
import { cn, formatDate } from '../lib/utils';
import { getIndianHolidays } from '../lib/holidays';
import ScheduleEventModal from './ScheduleEventModal';

const CalendarView: React.FC = () => {
  const { events, language } = useCRMStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<CRMEvent | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Total slots calculation to determine grid structure
  const totalSlots = firstDayOfMonth + daysInMonth;
  const rowsNeeded = Math.ceil(totalSlots / 7);

  const holidays = useMemo(() => getIndianHolidays(year), [year]);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dailyEvents = events.filter(e => e.startTime.startsWith(dateStr));
    const dayHolidays = holidays.filter(h => h.date === dateStr);
    
    return [
      ...dayHolidays.map(h => ({ id: `h-${h.name}`, title: h.name, type: 'Holiday' as CalendarEventType, isHoliday: true, startTime: `${h.date}T00:00:00` })),
      ...dailyEvents.map(e => ({ ...e, isHoliday: false }))
    ];
  };

  const eventColors: Record<CalendarEventType, string> = {
    'Meeting': 'bg-primary text-white',
    'Follow-up': 'bg-orange-500 text-white',
    'Task': 'bg-success text-white',
    'Reminder': 'bg-purple-500 text-white',
    'Holiday': 'bg-pink-500 text-white'
  };

  const handleDayClick = (day: number) => {
    const d = new Date(year, month, day);
    setEditingEvent(null);
    setSelectedDate(d);
    setIsModalOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: any) => {
    e.stopPropagation();
    if (event.isHoliday) return;
    setEditingEvent(event as CRMEvent);
    setSelectedDate(new Date(event.startTime));
    setIsModalOpen(true);
  };

  return (
    /* 
       The main container uses responsive height calculation. 
       - On desktop: 100vh - 72px (header) - 64px (Layout p-8) - padding inside the component.
       - On mobile: 100vh - 60px (header) - 68px (footer) - 32px (Layout p-4).
    */
    <div className="flex flex-col h-[calc(100vh-160px)] lg:h-[calc(100vh-180px)] space-y-3 lg:space-y-4 animate-in fade-in duration-700">
      {/* Calendar Header - Compact on mobile */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-[20px] lg:rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
        <div className="flex items-center gap-3 lg:gap-4">
           <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <CalendarIcon size={20} className="lg:size-24" />
           </div>
           <div>
              <h1 className="text-lg lg:text-xl font-heading font-bold text-slate-900 dark:text-white leading-tight">{monthName} {year}</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pipeline Schedule</p>
           </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button onClick={goToToday} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-100 dark:border-slate-700">Today</button>
          
          <div className="flex bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-0.5 shadow-inner">
            <button onClick={prevMonth} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400"><ChevronLeft size={16} /></button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400"><ChevronRight size={16} /></button>
          </div>

          <button 
            onClick={() => { setEditingEvent(null); setSelectedDate(new Date()); setIsModalOpen(true); }}
            className="flex-1 md:flex-none h-9 lg:h-10 px-4 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-xs"
          >
            <Plus size={16} /> <span>Schedule</span>
          </button>
        </div>
      </div>

      {/* Main Grid Container - Responsive height calculation to fill available space */}
      <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-[24px] lg:rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
        {/* Days of Week - Fixed height */}
        <div className="grid grid-cols-7 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 shrink-0">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} className="py-2 text-center text-[8px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{day}</div>
          ))}
        </div>
        
        {/* Date Grid - Uses strictly defined grid-template-rows to fit space */}
        <div 
          className={cn(
            "flex-1 grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800 border-l border-t border-slate-100 dark:border-slate-800",
            rowsNeeded === 4 ? "grid-rows-4" : rowsNeeded === 5 ? "grid-rows-5" : "grid-rows-6"
          )}
          style={{ gridAutoRows: '1fr' }}
        >
          {/* Padding for month start */}
          {Array(firstDayOfMonth).fill(null).map((_, i) => (
            <div key={`empty-start-${i}`} className="bg-slate-50/20 dark:bg-slate-950/20"></div>
          ))}

          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const now = new Date();
            const isToday = now.getDate() === day && now.getMonth() === month && now.getFullYear() === year;
            const dailyItems = getEventsForDate(day);

            return (
              <div 
                key={day} 
                onClick={() => handleDayClick(day)}
                className={cn(
                  "p-1 flex flex-col group relative hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer min-h-0",
                  isToday && "bg-primary/[0.03] dark:bg-primary/[0.05]"
                )}
              >
                {/* Date Number - Absolute positioned to not take space from events */}
                <div className="flex justify-between items-start shrink-0 mb-0.5">
                   <span className={cn(
                     "w-5 h-5 lg:w-6 lg:h-6 rounded-lg flex items-center justify-center text-[9px] lg:text-[11px] font-black",
                     isToday 
                      ? "bg-primary text-white shadow-sm" 
                      : "text-slate-600 dark:text-slate-400 group-hover:text-primary"
                   )}>
                     {day}
                   </span>
                   {dailyItems.length > 3 && (
                     <span className="text-[8px] font-black text-slate-300 mt-1 mr-1">+{dailyItems.length - 3}</span>
                   )}
                </div>
                
                {/* Events container - Scrollable if too many items */}
                <div className="flex-1 space-y-0.5 overflow-y-auto scrollbar-hide pb-0.5 pr-0.5">
                   {dailyItems.map((e: any, idx) => (
                     <motion.div 
                        key={e.id || idx} 
                        onClick={(ev) => handleEventClick(ev, e)}
                        className={cn(
                          "px-1 py-0.5 rounded-md text-[8px] font-bold truncate border border-black/5",
                          eventColors[e.type as CalendarEventType] || 'bg-slate-400'
                        )}
                        title={`${e.title}`}
                     >
                       <span className="truncate">{e.isHoliday ? '🇮🇳 ' : ''}{e.title}</span>
                     </motion.div>
                   ))}
                </div>
              </div>
            );
          })}

          {/* Padding for month end */}
          {Array((7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7).fill(null).map((_, i) => (
            <div key={`empty-end-${i}`} className="bg-slate-50/20 dark:bg-slate-950/20"></div>
          ))}
        </div>
      </div>

      {/* Legend - Minimized footer */}
      <div className="flex flex-wrap items-center justify-center gap-4 py-2 px-6 bg-white dark:bg-slate-900 rounded-[18px] lg:rounded-[28px] border border-slate-100 dark:border-slate-800 shrink-0 shadow-sm">
          {Object.entries(eventColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
               <div className={cn("w-2 h-2 rounded-full", color.split(' ')[0])}></div>
               <span className="text-[8px] lg:text-[9px] font-bold text-slate-500 uppercase tracking-widest">{type}</span>
            </div>
          ))}
      </div>

      {isModalOpen && (
        <ScheduleEventModal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setEditingEvent(null); }} 
          initialDate={selectedDate || new Date()}
          eventToEdit={editingEvent}
        />
      )}
    </div>
  );
};

export default CalendarView;
