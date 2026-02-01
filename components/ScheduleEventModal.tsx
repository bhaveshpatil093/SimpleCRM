
import React, { useState, useEffect } from 'react';
/* Added missing ChevronDown import from lucide-react */
import { X, Calendar, Clock, MapPin, Users, Send, Sparkles, Loader2, Trash2, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { useCRMStore } from '../lib/store';
import { useAuth } from '../lib/auth';
import { CalendarEventType, CRMEvent } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ScheduleEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: Date;
  eventToEdit?: CRMEvent | null;
}

const ScheduleEventModal: React.FC<ScheduleEventModalProps> = ({ isOpen, onClose, initialDate, eventToEdit }) => {
  const { addEvent, updateEvent, deleteEvent, leads, customers, addAuditLog } = useCRMStore();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEventType>('Meeting');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [relatedId, setRelatedId] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setType(eventToEdit.type);
      const dt = new Date(eventToEdit.startTime);
      setDate(dt.toISOString().split('T')[0]);
      setTime(dt.toTimeString().split(' ')[0].slice(0, 5));
      setLocation(eventToEdit.location || '');
      setDescription(eventToEdit.description || '');
      setRelatedId(eventToEdit.relatedTo?.id || '');
    } else {
      setTitle('');
      setType('Meeting');
      // Set date to YYYY-MM-DD local format
      const offset = initialDate.getTimezoneOffset();
      const localDate = new Date(initialDate.getTime() - (offset * 60 * 1000));
      setDate(localDate.toISOString().split('T')[0]);
      setTime('10:00');
      setLocation('');
      setDescription('');
      setRelatedId('');
    }
  }, [eventToEdit, initialDate, isOpen]);

  const handleSave = () => {
    if (!title || !date || !time) return;
    
    const startTime = `${date}T${time}:00`;
    // Default duration: 1 hour
    const endTime = new Date(new Date(startTime).getTime() + 3600000).toISOString();

    const related = leads.find(l => l.id === relatedId) || customers.find(c => c.id === relatedId);

    const eventData = {
      title,
      type,
      startTime,
      endTime,
      location,
      description,
      relatedTo: related ? { 
        id: related.id, 
        type: 'name' in related && 'status' in related ? 'Lead' as const : 'Customer' as const, 
        name: (related as any).name 
      } : undefined
    };

    if (eventToEdit) {
      updateEvent(eventToEdit.id, eventData);
      addAuditLog({ action: 'UPDATE_EVENT', details: `Updated event: ${title}` });
    } else {
      addEvent(eventData);
      addAuditLog({ action: 'CREATE_EVENT', details: `Created event: ${title}` });
    }
    onClose();
  };

  const handleDelete = () => {
    if (eventToEdit) {
      deleteEvent(eventToEdit.id);
      addAuditLog({ action: 'DELETE_EVENT', details: `Deleted event: ${eventToEdit.title}` });
      onClose();
    }
  };

  const getAiSuggestions = async () => {
    setIsAiLoading(true);
    // Simulation of AI checking team availability
    await new Promise(r => setTimeout(r, 1200));
    const suggestions = ['11:30', '14:00', '16:30'];
    setTime(suggestions[Math.floor(Math.random() * suggestions.length)]);
    setIsAiLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-0">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-slate-950 w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                 <Clock size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-heading font-bold dark:text-white leading-none">
                  {eventToEdit ? 'Edit Event' : 'Schedule Event'}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Personal Assistant Mode</p>
              </div>
           </div>
           <button onClick={onClose} className="p-3 bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
           {/* Event Title */}
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">What's happening?*</label>
              <input 
                className="w-full p-5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-[24px] outline-none dark:text-white font-bold transition-all text-lg placeholder:text-slate-300" 
                placeholder="e.g. Sales Discovery Call"
                value={title} onChange={e => setTitle(e.target.value)}
              />
           </div>

           {/* Type and Date */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Event Type</label>
                 <div className="relative">
                    <select 
                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl outline-none dark:text-white font-bold appearance-none cursor-pointer" 
                        value={type} onChange={e => setType(e.target.value as any)}
                      >
                        <option>Meeting</option>
                        <option>Follow-up</option>
                        <option>Reminder</option>
                        <option>Task</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Event Date</label>
                 <input type="date" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl outline-none dark:text-white font-bold" value={date} onChange={e => setDate(e.target.value)} />
              </div>
           </div>

           {/* Time and AI Helper */}
           <div className="space-y-2">
              <div className="flex justify-between items-center mb-1 px-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kickoff Time</label>
                 <button onClick={getAiSuggestions} disabled={isAiLoading} className="text-[10px] font-black text-primary flex items-center gap-1.5 hover:underline active:scale-95 transition-all bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                    {isAiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Gemini Suggest
                 </button>
              </div>
              <input type="time" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl outline-none dark:text-white font-bold text-xl" value={time} onChange={e => setTime(e.target.value)} />
           </div>

           {/* Location and Link */}
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Location / Video Link</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                <input className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl outline-none dark:text-white text-sm" placeholder="Office Address or Google Meet Link" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
           </div>

           {/* Related Entity */}
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Link to Profile</label>
              <div className="relative group">
                 <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                 <select 
                    className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-2xl outline-none dark:text-white text-sm appearance-none cursor-pointer" 
                    value={relatedId} onChange={e => setRelatedId(e.target.value)}
                  >
                   <option value="">Search Contacts...</option>
                   <optgroup label="Leads Pipeline">
                     {leads.map(l => <option key={l.id} value={l.id}>{l.name} ({l.company})</option>)}
                   </optgroup>
                   <optgroup label="Valued Customers">
                     {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
                   </optgroup>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
           </div>

           {/* Description */}
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Agenda / Private Notes</label>
              <textarea 
                className="w-full p-5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-[24px] outline-none dark:text-white text-sm resize-none h-32 leading-relaxed" 
                placeholder="List down meeting outcomes or prep notes..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex gap-4 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
           {eventToEdit && (
             <div className="relative">
                <button 
                  onClick={() => setShowConfirmDelete(!showConfirmDelete)}
                  className={cn(
                    "p-4 rounded-2xl transition-all active:scale-95 border",
                    showConfirmDelete ? "bg-red-500 text-white border-red-500" : "bg-red-50 dark:bg-red-900/20 text-red-500 border-transparent hover:bg-red-100"
                  )}
                  title="Delete Event"
                >
                   <Trash2 size={22} />
                </button>
                <AnimatePresence>
                   {showConfirmDelete && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full left-0 mb-4 w-48 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50"
                     >
                        <p className="text-[10px] font-bold text-slate-900 dark:text-white text-center mb-3">Delete this event?</p>
                        <button onClick={handleDelete} className="w-full py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors">Yes, Delete</button>
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>
           )}
           <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">Discard</button>
           <button 
             onClick={handleSave} 
             disabled={!title || !date || !time}
             className="flex-[2] py-4 bg-primary text-white rounded-[20px] font-black uppercase tracking-[0.15em] shadow-xl shadow-primary/25 hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
           >
              {eventToEdit ? 'Save Changes' : 'Confirm Event'}
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ScheduleEventModal;
