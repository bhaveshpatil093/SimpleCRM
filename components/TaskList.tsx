
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Calendar, 
  MoreVertical, 
  Search, 
  Filter, 
  Clock, 
  AlertCircle,
  ChevronRight,
  ClipboardList,
  // Added missing Users import
  Users
} from 'lucide-react';
import { useCRMStore } from '../lib/store';
import { TaskPriority, CRMTask } from '../types';
import { cn, timeAgo, formatDate } from '../lib/utils';
import AddTaskModal from './AddTaskModal';

const TaskList: React.FC = () => {
  const { tasks, toggleTask, deleteTask, language } = useCRMStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Today' | 'Week' | 'Overdue'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextWeek = new Date(today.getTime() + 7 * 86400000);

    if (filter === 'Today') {
      result = result.filter(t => {
        const d = new Date(t.dueDate);
        return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
      });
    } else if (filter === 'Week') {
      result = result.filter(t => {
        const d = new Date(t.dueDate);
        return d >= today && d <= nextWeek;
      });
    } else if (filter === 'Overdue') {
      result = result.filter(t => !t.isCompleted && new Date(t.dueDate) < now);
    }

    return result.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks, filter, searchTerm]);

  const priorityColors: Record<TaskPriority, string> = {
    'High': 'text-red-500 bg-red-50 dark:bg-red-900/20',
    'Medium': 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
    'Low': 'text-green-500 bg-green-50 dark:bg-green-900/20'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">My Tasks</h1>
          <p className="text-slate-500 font-medium">Manage your daily priorities and to-dos.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="h-12 px-8 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Plus size={20} /> Add New Task
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
        {/* Filters & Sidebar */}
        <div className="w-full lg:w-64 space-y-6 shrink-0">
           <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
              {[
                { id: 'All', label: 'All Tasks', icon: ClipboardList },
                { id: 'Today', label: 'Due Today', icon: Clock },
                { id: 'Week', label: 'This Week', icon: Calendar },
                { id: 'Overdue', label: 'Overdue', icon: AlertCircle },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                    filter === f.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                   <div className="flex items-center gap-3">
                      <f.icon size={18} />
                      {f.label}
                   </div>
                   <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", filter === f.id ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800")}>
                      {f.id === 'All' ? tasks.length : tasks.filter(t => {
                        const now = new Date();
                        const d = new Date(t.dueDate);
                        if (f.id === 'Today') return d.toDateString() === now.toDateString();
                        if (f.id === 'Overdue') return !t.isCompleted && d < now;
                        return true;
                      }).length}
                   </span>
                </button>
              ))}
           </div>

           <div className="bg-gradient-to-br from-primary to-accent rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                 <h4 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Productivity</h4>
                 <p className="text-3xl font-heading font-extrabold">{Math.round((tasks.filter(t => t.isCompleted).length / (tasks.length || 1)) * 100)}%</p>
                 <p className="text-[10px] font-bold uppercase mt-2">Tasks Completed</p>
              </div>
              <div className="absolute -bottom-4 -right-4 opacity-10 rotate-12">
                 <CheckCircle2 size={120} />
              </div>
           </div>
        </div>

        {/* Task Grid */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
           <div className="relative group shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl py-4 pl-12 pr-4 text-sm outline-none shadow-sm focus:ring-4 focus:ring-primary/5 dark:text-white"
                placeholder="Find a specific task..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>

           <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
              {filteredTasks.map(task => (
                <div 
                  key={task.id}
                  className={cn(
                    "bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all",
                    task.isCompleted && "opacity-60"
                  )}
                >
                   <button 
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                      task.isCompleted ? "bg-success text-white" : "border-2 border-slate-200 dark:border-slate-700 text-transparent hover:border-primary"
                    )}
                   >
                      <CheckCircle2 size={20} />
                   </button>

                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                         <h3 className={cn("font-bold text-slate-900 dark:text-white truncate", task.isCompleted && "line-through")}>{task.title}</h3>
                         <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold uppercase", priorityColors[task.priority])}>
                            {task.priority}
                         </span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         <span className={cn("flex items-center gap-1", new Date(task.dueDate) < new Date() && !task.isCompleted && "text-red-500")}>
                            <Calendar size={12} /> {formatDate(task.dueDate)}
                         </span>
                         {task.relatedTo && <span className="flex items-center gap-1"><Users size={12} /> {task.relatedTo.name}</span>}
                      </div>
                   </div>

                   <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                   >
                      <Trash2 size={18} />
                   </button>
                </div>
              ))}

              {filteredTasks.length === 0 && (
                <div className="py-20 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                   <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                      <ClipboardList size={32} />
                   </div>
                   <p className="text-slate-500 font-bold">No tasks found in this view.</p>
                   <p className="text-xs text-slate-400 mt-1">Start by adding a new priority for your day.</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {isAddModalOpen && <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
};

export default TaskList;