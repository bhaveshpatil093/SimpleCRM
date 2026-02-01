
import React, { useState } from 'react';
import { X, ClipboardList, Calendar, Users, Zap } from 'lucide-react';
import { useCRMStore } from '../lib/store';
import { TaskPriority } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask, leads, customers } = useCRMStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [relatedId, setRelatedId] = useState('');

  const handleSave = () => {
    if (!title || !dueDate) return;

    const related = leads.find(l => l.id === relatedId) || customers.find(c => c.id === relatedId);

    addTask({
      title,
      description,
      dueDate: `${dueDate}T17:00:00Z`,
      priority,
      assignedTo: 'Rajesh Iyer',
      relatedTo: related ? { id: related.id, type: 'Lead' in related ? 'Lead' : 'Customer', name: related.name } : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white dark:bg-slate-950 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
           <h3 className="text-2xl font-bold dark:text-white">New Task</h3>
           <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"><X size={20} /></button>
        </div>

        <div className="p-8 space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
              <input className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none dark:text-white font-bold" placeholder="e.g. Call client for feedback" value={title} onChange={e => setTitle(e.target.value)} />
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Priority</label>
              <div className="grid grid-cols-3 gap-3">
                 {(['High', 'Medium', 'Low'] as TaskPriority[]).map(p => (
                   <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "p-3 rounded-xl text-xs font-bold border transition-all",
                      priority === p ? "bg-primary text-white border-primary" : "bg-slate-50 dark:bg-slate-800 border-slate-100 text-slate-500"
                    )}
                   >
                     {p}
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
              <input type="date" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none dark:text-white font-bold" value={dueDate} onChange={e => setDueDate(e.target.value)} />
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Related To</label>
              <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none dark:text-white text-sm" value={relatedId} onChange={e => setRelatedId(e.target.value)}>
                 <option value="">None</option>
                 <optgroup label="Leads">
                   {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                 </optgroup>
                 <optgroup label="Customers">
                   {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </optgroup>
              </select>
           </div>
        </div>

        <div className="p-8 border-t border-slate-50 dark:border-slate-800 flex gap-4 bg-slate-50/50 dark:bg-slate-900/50">
           <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-500">Cancel</button>
           <button onClick={handleSave} className="flex-[2] py-4 bg-primary text-white rounded-2xl font-extrabold shadow-xl shadow-primary/20 active:scale-95 transition-all">Create Task</button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddTaskModal;
