
import React, { useState, useMemo } from 'react';
import { useCRMStore } from '../lib/store';
import { DealStage, Deal } from '../types';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { useTranslation } from '../lib/i18n';
import { 
  Plus, 
  GripVertical, 
  Star, 
  Target, 
  TrendingUp, 
  IndianRupee, 
  X,
  FileText,
  Clock,
  Search,
  CheckCircle2,
  Settings2,
  Calendar,
  ChevronRight,
  Briefcase,
  AlertCircle,
  MessageCircle,
  Trash2,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WhatsAppTemplateModal from './WhatsAppTemplateModal';

const DealsKanban: React.FC = () => {
  const { deals, updateDealStage, addDeal, updateDeal, deleteDeal, customers, dealStages } = useCRMStore();
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isAddingDeal, setIsAddingDeal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [whatsAppRecipient, setWhatsAppRecipient] = useState<{name: string, company: string, phone: string, value: number, id: string} | null>(null);

  const STAGE_COLORS = ['bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-purple-500', 'bg-green-500', 'bg-emerald-500', 'bg-indigo-500'];

  const stages = useMemo(() => {
    return dealStages.map((label, idx) => ({
      id: label,
      label,
      color: STAGE_COLORS[idx % STAGE_COLORS.length]
    }));
  }, [dealStages]);

  const filteredDeals = useMemo(() => {
    if (!searchTerm) return deals;
    return deals.filter(d => 
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [deals, searchTerm]);

  const totalValue = useMemo(() => deals.reduce((sum, d) => sum + d.value, 0), [deals]);

  const handleWhatsApp = (e: React.MouseEvent, deal: Deal) => {
    e.stopPropagation();
    const customer = customers.find(c => c.id === deal.customerId);
    if (customer) {
      setWhatsAppRecipient({
        id: deal.id,
        name: customer.name,
        company: customer.company,
        phone: customer.phone,
        value: deal.value
      });
    }
  };

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-700">
      <div className="lg:hidden flex flex-col gap-1">
         <h1 className="text-2xl font-bold dark:text-white">Sales Pipeline</h1>
         <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{formatCurrency(totalValue)} Pipeline</span>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="hidden lg:block">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pipeline Management</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Visualize deal velocity across all sales stages.</p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search deals..." 
               className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 lg:py-3 pl-12 pr-4 text-sm outline-none dark:text-white"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <button 
            onClick={() => setIsAddingDeal(true)}
            className="w-14 lg:w-auto h-14 lg:h-12 bg-primary text-white lg:px-6 rounded-2xl lg:rounded-full font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-90 transition-transform"
          >
            <Plus size={24} /> <span className="hidden lg:inline">Add Deal</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4 lg:gap-8 overflow-x-auto pb-10 -mx-4 px-4 scrollbar-hide lg:mx-0 lg:px-0">
        {stages.map((stage) => {
          const stageDeals = filteredDeals.filter(d => d.stage === stage.id);
          const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div key={stage.id} className="flex-shrink-0 w-80 lg:w-[320px] flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", stage.color)}></div>
                    <h3 className="font-bold text-sm dark:text-white">{stage.label}</h3>
                    <span className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full">{stageDeals.length}</span>
                 </div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatCurrency(stageTotal)}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-[32px] border border-transparent dark:border-slate-800 min-h-[500px] flex flex-col gap-4">
                 {stageDeals.map((deal) => (
                    <motion.div 
                      key={deal.id}
                      layoutId={deal.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDealId(deal.id)}
                      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm group active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                         <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight flex-1 mr-3">{deal.title}</h4>
                         <GripVertical size={14} className="text-slate-200 dark:text-slate-700 hidden lg:block" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{deal.customerName}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                         <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Deal Value</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(deal.value)}</p>
                         </div>
                         <button 
                            onClick={e => handleWhatsApp(e, deal)}
                            className="p-2 bg-[#25D366]/10 text-[#25D366] rounded-xl active:bg-[#25D366]/20 transition-all"
                         >
                            <MessageCircle size={18} />
                         </button>
                      </div>
                    </motion.div>
                 ))}
                 <button 
                   onClick={() => setIsAddingDeal(true)}
                   className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] font-bold rounded-2xl hover:bg-white dark:hover:bg-slate-900 transition-all uppercase tracking-widest"
                 >
                   + Add in {stage.label}
                 </button>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {(selectedDealId || isAddingDeal) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
              onClick={() => { setSelectedDealId(null); setIsAddingDeal(false); }}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 lg:left-auto lg:top-0 lg:bottom-0 lg:w-[500px] bg-white dark:bg-slate-950 shadow-2xl z-[101] rounded-t-[40px] lg:rounded-none overflow-hidden"
            >
               <DealPanelContent 
                  dealId={selectedDealId} 
                  onClose={() => { setSelectedDealId(null); setIsAddingDeal(false); }} 
               />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {whatsAppRecipient && (
        <WhatsAppTemplateModal 
          recipient={whatsAppRecipient}
          onClose={() => setWhatsAppRecipient(null)}
          onSent={() => {}}
        />
      )}
    </div>
  );
};

const DealPanelContent: React.FC<{ dealId: string | null; onClose: () => void }> = ({ dealId, onClose }) => {
  const { deals, updateDeal, addDeal, customers, language, dealStages } = useCRMStore();
  const { t } = useTranslation(language);
  const existingDeal = deals.find(d => d.id === dealId);
  const isNew = !dealId;

  const [formData, setFormData] = useState<Partial<Deal>>(existingDeal || {
    title: '',
    customerId: '',
    customerName: '',
    value: 0,
    stage: dealStages[0] || 'Discovery',
    priority: 'Medium',
    probability: 20,
    expectedClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedTo: 'Rajesh Iyer',
    products: []
  });

  const handleSave = () => {
    if (isNew) addDeal(formData as any);
    else updateDeal(dealId!, formData);
    onClose();
  };

  return (
    <div className="flex flex-col h-[85vh] lg:h-full">
      <div className="p-6 lg:p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <h2 className="text-xl lg:text-3xl font-heading font-bold dark:text-white">{isNew ? 'New Deal' : 'Deal Detail'}</h2>
        <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
           <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 scrollbar-hide">
         <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
            <input 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-primary transition-all outline-none dark:text-white font-bold" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Q4 Server Migration"
            />
         </div>
         <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Customer</label>
            <div className="relative">
              <select 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-primary outline-none dark:text-white appearance-none cursor-pointer"
                value={formData.customerId}
                onChange={e => {
                  const c = customers.find(cu => cu.id === e.target.value);
                  setFormData({...formData, customerId: e.target.value, customerName: c?.name || ''});
                }}
              >
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
         </div>
         <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Stage</label>
            <div className="relative">
              <select 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-primary outline-none dark:text-white appearance-none cursor-pointer font-bold"
                value={formData.stage}
                onChange={e => setFormData({...formData, stage: e.target.value})}
              >
                {dealStages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
         </div>
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Value (₹)</label>
               <input type="number" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border-2 border-transparent focus:border-primary dark:text-white font-bold" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Exp Close</label>
               <input type="date" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none border-2 border-transparent focus:border-primary dark:text-white font-bold" value={formData.expectedClose?.split('T')[0]} onChange={e => setFormData({...formData, expectedClose: e.target.value})} />
            </div>
         </div>
      </div>

      <div className="p-6 lg:p-10 border-t border-slate-100 dark:border-slate-800 flex gap-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:pb-10 bg-white dark:bg-slate-950">
         <button onClick={onClose} className="flex-1 py-4 text-sm font-bold text-slate-500">Cancel</button>
         <button onClick={handleSave} className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
            {t('save')}
         </button>
      </div>
    </div>
  );
};

export default DealsKanban;
