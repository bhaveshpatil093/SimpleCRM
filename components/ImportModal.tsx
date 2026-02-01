
import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, ChevronRight, CheckCircle2, AlertTriangle, Loader2, Download, Info } from 'lucide-react';
import { parseImportFile, downloadTemplate } from '../lib/data';
import { useCRMStore } from '../lib/store';
import { LeadStatus, LeadSource, LeadPriority } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ImportModalProps {
  onClose: () => void;
  type: 'Leads' | 'Customers' | 'Deals';
}

const ImportModal: React.FC<ImportModalProps> = ({ onClose, type }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [duplicateMode, setDuplicateMode] = useState<'skip' | 'update' | 'create'>('skip');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ success: number, errors: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addLead, addCustomer, addDeal, leads, customers } = useCRMStore();

  const targetFields = type === 'Leads' 
    ? ['name', 'company', 'email', 'phone', 'city', 'value', 'status', 'source', 'priority', 'notes']
    : type === 'Customers' 
    ? ['name', 'company', 'email', 'phone', 'city', 'totalRevenue', 'loyaltyStatus', 'preferredLanguage']
    : ['title', 'customerName', 'value', 'stage', 'priority', 'expectedClose'];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      try {
        const data = await parseImportFile(selected);
        setRawData(data);
        
        // Auto-mapping logic
        const headers = Object.keys(data[0] || {});
        const autoMapping: Record<string, string> = {};
        headers.forEach(h => {
          const match = targetFields.find(f => 
            h.toLowerCase() === f.toLowerCase() || 
            h.toLowerCase().replace(/\s/g, '') === f.toLowerCase()
          );
          if (match) autoMapping[h] = match;
        });
        setMapping(autoMapping);
        setStep(2);
      } catch (err) {
        alert('Failed to parse file. Please use the valid template.');
      }
    }
  };

  const handleImport = async () => {
    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    // Simulated delay for progress visual
    await new Promise(r => setTimeout(r, 1500));

    rawData.forEach(row => {
      // Cast item and row to Record type to resolve unknown index error.
      const item: Record<string, any> = {};
      const rowData = row as Record<string, any>;
      
      // Fix: Explicitly cast Object.entries to [string, string][] to ensure targetField and fileCol are inferred as strings
      (Object.entries(mapping) as [string, string][]).forEach(([fileCol, targetField]) => {
        item[targetField] = rowData[fileCol];
      });

      // Simple Validation & Transformation
      if (type === 'Leads') {
        if (!item.name || !item.company) { errorCount++; return; }
        
        // Handle phone (+91 logic)
        if (item.phone && !item.phone.toString().startsWith('+91')) {
          item.phone = `+91 ${item.phone.toString().replace(/\D/g, '')}`;
        }

        // Duplicate Check
        const isDup = leads.some(l => l.email === item.email || l.phone === item.phone);
        if (isDup && duplicateMode === 'skip') { errorCount++; return; }
        
        addLead({
          name: item.name,
          company: item.company,
          email: item.email || '',
          phone: item.phone || '+91 ',
          city: item.city || 'Unknown',
          value: Number(item.value) || 0,
          status: (item.status as LeadStatus) || LeadStatus.NEW,
          source: (item.source as LeadSource) || LeadSource.OTHER,
          priority: (item.priority as LeadPriority) || 'Medium',
          notes: item.notes || '',
          assignedToId: 'owner@business.com'
        });
        successCount++;
      } else if (type === 'Customers') {
         addCustomer({
            name: item.name,
            company: item.company,
            email: item.email || '',
            phone: item.phone || '',
            city: item.city || '',
            customerSince: new Date().toISOString(),
            loyaltyStatus: item.loyaltyStatus || 'New',
            totalRevenue: Number(item.totalRevenue) || 0,
            activeDealsCount: 0,
            preferredLanguage: (item.preferredLanguage as 'English' | 'Hindi') || 'English',
            preferredContactTime: '10 AM - 6 PM',
            tags: ['Imported'],
            assignedToId: 'owner@business.com'
         });
         successCount++;
      } else {
         addDeal({
            title: item.title || 'Untitled Deal',
            customerId: 'manual', // In a real app we'd map this to a customer ID
            customerName: item.customerName || 'Walk-in',
            value: Number(item.value) || 0,
            stage: item.stage || 'Discovery',
            priority: item.priority || 'Medium',
            probability: 50,
            expectedClose: item.expectedClose || new Date().toISOString(),
            assignedTo: 'Rajesh Iyer',
            assignedToId: 'owner@business.com',
            products: []
         });
         successCount++;
      }
    });

    setResult({ success: successCount, errors: errorCount });
    setIsProcessing(false);
    setStep(4);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-950 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-bold dark:text-white">Import {type}</h2>
            <div className="flex gap-2 mt-2">
               {[1, 2, 3, 4].map(s => (
                 <div key={s} className={cn("h-1 rounded-full flex-1 w-12 transition-all", s <= step ? "bg-primary" : "bg-slate-100 dark:bg-slate-800")} />
               ))}
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400"><X size={20} /></button>
        </div>

        <div className="p-8 min-h-[400px]">
          {step === 1 && (
            <div className="space-y-8 text-center py-4">
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] p-12 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
               >
                  <Upload size={48} className="mx-auto text-slate-300 group-hover:text-primary transition-colors mb-4" />
                  <p className="font-bold text-slate-900 dark:text-white">Drop your Excel or CSV file here</p>
                  <p className="text-sm text-slate-400 mt-2">Maximum file size: 5MB</p>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.csv" onChange={handleFileChange} />
               </div>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                     <FileSpreadsheet size={16} /> Standard format required
                  </div>
                  <button 
                    onClick={() => downloadTemplate(type)}
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                  >
                     <Download size={16} /> Download Sample Template
                  </button>
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
               <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex gap-3 text-blue-700 dark:text-blue-300">
                  <Info size={20} className="shrink-0" />
                  <p className="text-xs font-medium">We've auto-mapped some columns. Please review and match the remaining fields.</p>
               </div>
               <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                  {targetFields.map(field => (
                    <div key={field} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                       <span className="flex-1 text-sm font-bold dark:text-white capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                       <ChevronRight size={14} className="text-slate-300" />
                       <select 
                         className="flex-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none dark:text-white"
                         value={Object.keys(mapping).find(k => mapping[k] === field) || ''}
                         onChange={(e) => {
                            const newMapping = { ...mapping };
                            Object.keys(newMapping).forEach(k => { if(newMapping[k] === field) delete newMapping[k]; });
                            if (e.target.value) newMapping[e.target.value] = field;
                            setMapping(newMapping);
                         }}
                       >
                         <option value="">Don't Import</option>
                         {Object.keys(rawData[0] || {}).map(h => <option key={h} value={h}>{h}</option>)}
                       </select>
                    </div>
                  ))}
               </div>
               <button onClick={() => setStep(3)} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold mt-4 shadow-xl">Continue to Preview</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
                     <p className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">{rawData.length}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Records to Process</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
                     <p className="text-3xl font-heading font-extrabold text-primary">{Object.keys(mapping).length}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mapped Columns</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Duplicate Handling</label>
                  <div className="grid grid-cols-3 gap-3">
                     {[
                       { id: 'skip', label: 'Skip Existing', desc: 'No changes' },
                       { id: 'update', label: 'Update Data', desc: 'Merge new' },
                       { id: 'create', label: 'Create New', desc: 'Allow dups' }
                     ].map(opt => (
                       <button
                         key={opt.id}
                         onClick={() => setDuplicateMode(opt.id as any)}
                         className={cn(
                           "p-4 rounded-2xl border-2 text-left transition-all",
                           duplicateMode === opt.id ? "border-primary bg-primary/5" : "border-slate-100 dark:border-slate-800 opacity-60"
                         )}
                       >
                          <p className="text-xs font-bold dark:text-white">{opt.label}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">{opt.desc}</p>
                       </button>
                     ))}
                  </div>
               </div>

               <button 
                 onClick={handleImport}
                 disabled={isProcessing}
                 className="w-full py-5 bg-primary text-white rounded-[24px] font-extrabold shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
               >
                  {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirm & Start Import'}
               </button>
            </div>
          )}

          {step === 4 && result && (
            <div className="py-10 text-center space-y-8 animate-in zoom-in-95 duration-500">
               <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto text-success border-2 border-success/20">
                  <CheckCircle2 size={48} />
               </div>
               <div>
                  <h3 className="text-2xl font-heading font-bold dark:text-white">Import Complete!</h3>
                  <p className="text-slate-500 font-medium mt-2">Process successfully finished with the following results:</p>
               </div>
               <div className="flex items-center justify-center gap-10">
                  <div>
                     <p className="text-4xl font-heading font-extrabold text-success">{result.success}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Successful</p>
                  </div>
                  <div className="w-px h-12 bg-slate-100 dark:bg-slate-800" />
                  <div>
                     <p className="text-4xl font-heading font-extrabold text-red-400">{result.errors}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Failed/Skipped</p>
                  </div>
               </div>
               <div className="pt-6">
                  <button onClick={onClose} className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl active:scale-95 transition-all">Back to List</button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
