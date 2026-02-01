
import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsHelpModalProps {
  onClose: () => void;
}

const ShortcutsHelpModal: React.FC<ShortcutsHelpModalProps> = ({ onClose }) => {
  const shortcutGroups = [
    {
      title: 'Global',
      items: [
        { keys: ['⌘', 'K'], desc: 'Global Search / Command Palette' },
        { keys: ['⌘', 'N'], desc: 'New Lead' },
        { keys: ['⌘', 'D'], desc: 'New Deal' },
        { keys: ['⌘', ','], desc: 'Settings' },
        { keys: ['⌘', '/'], desc: 'Shortcuts Help' },
        { keys: ['Esc'], desc: 'Close Modal' },
      ]
    },
    {
      title: 'Navigation',
      items: [
        { keys: ['G', 'H'], desc: 'Go to Home' },
        { keys: ['G', 'L'], desc: 'Go to Leads' },
        { keys: ['G', 'C'], desc: 'Go to Customers' },
        { keys: ['G', 'D'], desc: 'Go to Deals' },
        { keys: ['G', 'R'], desc: 'Go to Reports' },
      ]
    },
    {
      title: 'List Actions',
      items: [
        { keys: ['J'], desc: 'Next Item' },
        { keys: ['K'], desc: 'Previous Item' },
        { keys: ['Enter'], desc: 'Open Selected' },
        { keys: ['E'], desc: 'Edit Selected' },
        { keys: ['Del'], desc: 'Delete Selected' },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-950 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                <Keyboard size={22} />
             </div>
             <h3 className="text-2xl font-bold dark:text-white">Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full"><X size={24} /></button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto max-h-[60vh] scrollbar-hide">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="space-y-4">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-2">{group.title}</h4>
               <div className="space-y-3">
                  {group.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4">
                       <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{item.desc}</span>
                       <div className="flex gap-1">
                          {item.keys.map((k) => (
                            <kbd key={k} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold font-mono text-slate-500 shadow-sm">{k}</kbd>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-50 dark:border-slate-800 text-center">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Bharat's Shortcuts for 3x Faster Workflows</p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsHelpModal;
