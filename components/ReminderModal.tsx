
import React, { useState } from 'react';
import { X, Clock, Calendar, Check, AlertCircle } from 'lucide-react';
import { useCRMStore } from '../lib/store';
import { useTranslation } from '../lib/i18n';
import { cn } from '../lib/utils';

interface ReminderModalProps {
  onClose: () => void;
  leadId?: string;
  dealId?: string;
  contextName: string;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ onClose, leadId, dealId, contextName }) => {
  const { addReminder, language } = useCRMStore();
  const { t } = useTranslation(language);
  const [title, setTitle] = useState(`Follow up with ${contextName}`);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!title || !date) return;
    
    addReminder({
      title,
      dueDate: `${date}T${time}:00`,
      notes,
      leadId,
      dealId
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-950 w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center">
                <Clock size={20} />
             </div>
             <h3 className="text-xl font-bold dark:text-white">Set Reminder</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
              <input 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none dark:text-white font-medium"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date</label>
                <div className="relative">
                   <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                   <input 
                    type="date"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none dark:text-white text-xs font-bold"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Time</label>
                <input 
                  type="time"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none dark:text-white text-xs font-bold"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
              <textarea 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none dark:text-white text-sm resize-none h-24"
                placeholder="Details about this follow-up..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
           </div>
        </div>

        <div className="p-6 border-t border-slate-50 dark:border-slate-800 flex gap-4 bg-slate-50/30 dark:bg-slate-800/20">
           <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-500">Cancel</button>
           <button 
             onClick={handleSave}
             disabled={!date || !title}
             className="flex-[2] py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 dark:shadow-none active:scale-95 transition-all disabled:opacity-50"
           >
              Create Reminder
           </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
