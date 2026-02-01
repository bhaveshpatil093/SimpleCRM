
import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { exportToExcel } from '../lib/data';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportModalProps {
  onClose: () => void;
  data: any[];
  title: string;
  filename: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ onClose, data, title, filename }) => {
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [selectedFields, setSelectedFields] = useState<string[]>(
    data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'id' && k !== 'activities') : []
  );

  const handleToggleField = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleExport = () => {
    const exportedData = data.map(item => {
      const filtered: any = {};
      selectedFields.forEach(f => filtered[f] = item[f]);
      return filtered;
    });

    exportToExcel([{ name: title, data: exportedData }], filename, format);
    onClose();
  };

  const allFields = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'id' && k !== 'activities') : [];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Export {title}</h2>
            <p className="text-sm text-slate-500 font-medium">Download records to your device</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">File Format</label>
             <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setFormat('xlsx')}
                  className={cn(
                    "flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all",
                    format === 'xlsx' ? "border-primary bg-primary/5" : "border-slate-100 dark:border-slate-800 grayscale opacity-60"
                  )}
                >
                   <FileSpreadsheet size={32} className="text-primary" />
                   <span className="font-bold text-sm dark:text-white">Excel (.xlsx)</span>
                </button>
                <button 
                  onClick={() => setFormat('csv')}
                  className={cn(
                    "flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all",
                    format === 'csv' ? "border-primary bg-primary/5" : "border-slate-100 dark:border-slate-800 grayscale opacity-60"
                  )}
                >
                   <FileText size={32} className="text-slate-600" />
                   <span className="font-bold text-sm dark:text-white">CSV (.csv)</span>
                </button>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Fields</label>
                <button 
                  onClick={() => setSelectedFields(selectedFields.length === allFields.length ? [] : [...allFields])}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  {selectedFields.length === allFields.length ? 'Deselect All' : 'Select All'}
                </button>
             </div>
             <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-2 scrollbar-hide">
                {allFields.map(field => (
                  <button
                    key={field}
                    onClick={() => handleToggleField(field)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                      selectedFields.includes(field) 
                        ? "bg-slate-900 text-white border-slate-900" 
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                    )}
                  >
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex gap-4 bg-slate-50 dark:bg-slate-900/50">
           <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-500">Cancel</button>
           <button 
             onClick={handleExport}
             disabled={selectedFields.length === 0}
             className="flex-[2] py-4 bg-primary text-white rounded-2xl font-extrabold shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
           >
              <Download size={20} /> Download File
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ExportModal;
