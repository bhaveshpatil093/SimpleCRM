
import React, { useState } from 'react';
import { 
  X, Phone, Mail, MessageSquare, Users, FileText, CheckCircle2, 
  RefreshCw, UserPlus, Briefcase, Zap, Send, Mic, Clock, MapPin,
  Calendar, Check, AlertCircle, Loader2
} from 'lucide-react';
import { useCRMStore } from '../lib/store';
import { ActivityType, NoteAnalysis } from '../types';
import { analyzeNoteContent } from '../lib/ai';
import VoiceInput from './VoiceInput';
import ReminderModal from './ReminderModal';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LogActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: 'Lead' | 'Customer' | 'Deal';
  contextName: string;
}

const LogActivityDrawer: React.FC<LogActivityDrawerProps> = ({ isOpen, onClose, entityId, entityType, contextName }) => {
  const { addActivity, logWhatsAppSent } = useCRMStore();
  const [activeType, setActiveType] = useState<ActivityType>('Call');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Specific fields
  const [duration, setDuration] = useState('15 min');
  const [outcome, setOutcome] = useState('Connected');
  const [location, setLocation] = useState('Online');
  const [taskStatus, setTaskStatus] = useState<'Completed' | 'In Progress' | 'Cancelled'>('Completed');
  const [showFollowUp, setShowFollowUp] = useState(false);

  const types = [
    { id: 'Call', icon: Phone, color: 'bg-blue-500' },
    { id: 'Email', icon: Mail, color: 'bg-purple-500' },
    { id: 'WhatsApp', icon: MessageSquare, color: 'bg-[#25D366]' },
    { id: 'Meeting', icon: Users, color: 'bg-orange-500' },
    { id: 'Note', icon: FileText, color: 'bg-slate-500' },
    { id: 'Task', icon: CheckCircle2, color: 'bg-success' },
  ];

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    
    let analysis: NoteAnalysis | null = null;
    if (activeType === 'Note' || activeType === 'Call') {
      analysis = await analyzeNoteContent(content);
    }

    addActivity({
      entityId,
      entityType,
      type: activeType,
      content,
      duration: (activeType === 'Call' || activeType === 'Meeting') ? duration : undefined,
      outcome: activeType === 'Call' ? outcome : undefined,
      location: activeType === 'Meeting' ? location : undefined,
      taskStatus: activeType === 'Task' ? taskStatus : undefined,
      aiAnalysis: analysis || undefined
    });

    setIsSubmitting(false);
    onClose();
    // Reset state
    setContent('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[500px] bg-white dark:bg-slate-950 shadow-2xl z-[151] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 lg:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
               <div>
                  <h2 className="text-2xl font-heading font-bold dark:text-white">Log Activity</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">FOR {contextName}</p>
               </div>
               <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X size={20} />
               </button>
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-10 scrollbar-hide">
               {/* Type Selector */}
               <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Activity Type</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                     {types.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setActiveType(t.id as ActivityType)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all active:scale-95",
                            activeType === t.id 
                              ? "border-primary bg-primary/5 shadow-sm" 
                              : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                          )}
                        >
                           <div className={cn("p-2 rounded-xl text-white", activeType === t.id ? t.color : "bg-slate-200 dark:bg-slate-800 text-slate-400")}>
                              <t.icon size={20} />
                           </div>
                           <span className={cn("text-[10px] font-bold", activeType === t.id ? "text-primary" : "text-slate-400")}>{t.id}</span>
                        </button>
                     ))}
                  </div>
               </div>

               {/* Type Specific Fields */}
               <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  {activeType === 'Call' && (
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Duration</label>
                           <select 
                             className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-white"
                             value={duration}
                             onChange={e => setDuration(e.target.value)}
                           >
                              <option>1 min</option>
                              <option>5 min</option>
                              <option>15 min</option>
                              <option>30 min</option>
                              <option>1 hour</option>
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Outcome</label>
                           <select 
                             className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-white"
                             value={outcome}
                             onChange={e => setOutcome(e.target.value)}
                           >
                              <option>Connected</option>
                              <option>Busy</option>
                              <option>No Answer</option>
                              <option>Left Voicemail</option>
                           </select>
                        </div>
                     </div>
                  )}

                  {activeType === 'Meeting' && (
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Location</label>
                           <input 
                              className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-white"
                              placeholder="Online / Office"
                              value={location}
                              onChange={e => setLocation(e.target.value)}
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Duration</label>
                           <select className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-white">
                              <option>30 min</option>
                              <option>1 hour</option>
                              <option>2 hours</option>
                           </select>
                        </div>
                     </div>
                  )}

                  {activeType === 'Task' && (
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Task Status</label>
                        <select 
                           className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold dark:text-white"
                           value={taskStatus}
                           onChange={e => setTaskStatus(e.target.value as any)}
                        >
                           <option>Completed</option>
                           <option>In Progress</option>
                           <option>Cancelled</option>
                        </select>
                     </div>
                  )}
               </div>

               {/* Common Content Field */}
               <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notes & Details</label>
                     <VoiceInput onTranscription={t => setContent(prev => prev + ' ' + t)} />
                  </div>
                  <textarea 
                     className="w-full h-40 p-5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary rounded-[32px] outline-none dark:text-white resize-none text-sm leading-relaxed"
                     placeholder={`What happened during the ${activeType.toLowerCase()}?`}
                     value={content}
                     onChange={e => setContent(e.target.value)}
                  />
               </div>

               {/* Follow-up toggle */}
               <button 
                  onClick={() => setShowFollowUp(!showFollowUp)}
                  className={cn(
                     "w-full p-4 rounded-2xl border flex items-center justify-between transition-all",
                     showFollowUp ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10 text-purple-600" : "border-slate-100 dark:border-slate-800 text-slate-500"
                  )}
               >
                  <div className="flex items-center gap-3">
                     <Calendar size={18} />
                     <span className="text-xs font-bold uppercase">Set follow-up reminder</span>
                  </div>
                  {showFollowUp ? <Check size={18} /> : <Zap size={16} className="text-slate-300" />}
               </button>
            </div>

            {/* Actions */}
            <div className="p-6 lg:p-8 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-white dark:bg-slate-950 shrink-0 pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:pb-8">
               <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-500">Discard</button>
               <button 
                  onClick={handleSave}
                  disabled={isSubmitting || !content.trim()}
                  className="flex-[2] py-4 bg-primary text-white rounded-2xl font-extrabold shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
               >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                  Save Activity
               </button>
            </div>

            {showFollowUp && (
               <ReminderModal 
                  contextName={contextName} 
                  leadId={entityType === 'Lead' ? entityId : undefined}
                  dealId={entityType === 'Deal' ? entityId : undefined}
                  onClose={() => setShowFollowUp(false)} 
               />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LogActivityDrawer;
