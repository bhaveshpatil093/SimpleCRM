
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  X, 
  Loader2, 
  Sparkles, 
  User, 
  Phone as PhoneIcon, 
  Mail, 
  Building, 
  MapPin, 
  Zap, 
  Check,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';
import { LeadStatus, Lead } from '../types';
import { useCRMStore } from '../lib/store';
import { useTranslation } from '../lib/i18n';
import { extractLeadData, analyzeNoteContent } from '../lib/ai';
import { cn } from '../lib/utils';
import VoiceInput from './VoiceInput';

const leadSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().regex(/^\+91\s\d{10}$/, 'Format: +91 XXXXXXXXXX'),
  company: z.string().min(2, 'Company is required'),
  value: z.coerce.number().min(0, 'Positive value required'),
  status: z.nativeEnum(LeadStatus),
  source: z.string().min(1, 'Source is required'),
  priority: z.enum(['High', 'Medium', 'Low']),
  city: z.string().min(2, 'City required'),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadFormProps {
  onClose: () => void;
  initialData?: Partial<LeadFormValues>;
}

const LeadForm: React.FC<LeadFormProps> = ({ onClose, initialData }) => {
  const { addLead, leadSources, language } = useCRMStore();
  const { t } = useTranslation(language);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiText, setAiText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      status: LeadStatus.NEW,
      source: leadSources[0] || 'Website',
      priority: 'Medium',
      phone: '+91 ',
      value: 0,
      city: '',
      notes: '',
      assignedTo: 'Rajesh Iyer',
      ...initialData
    }
  });

  const handleAiExtract = async () => {
    if (!aiText.trim()) return;
    setIsAiLoading(true);
    try {
      const data = await extractLeadData(aiText);
      if (data) {
        if (data.name) setValue('name', data.name);
        if (data.email) setValue('email', data.email);
        if (data.phone) setValue('phone', data.phone);
        if (data.company) setValue('company', data.company);
        if (data.value) setValue('value', Number(data.value));
        if (data.status) setValue('status', data.status as LeadStatus);
        if (data.source) setValue('source', data.source);
        if (data.priority) setValue('priority', data.priority as any);
        if (data.city) setValue('city', data.city);
        if (data.notes) setValue('notes', data.notes);
        setAiText('');
        setShowAiInput(false);
      }
    } catch (error) {
      console.error("AI Extraction failed", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const onSubmitHandler = async (data: LeadFormValues) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    addLead({ ...data, lastContact: new Date().toISOString() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-950 w-full max-w-4xl h-[95vh] lg:h-auto lg:max-h-[90vh] rounded-t-[40px] lg:rounded-[48px] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom lg:zoom-in-95 duration-500">
        
        <div className="flex items-center justify-between p-6 lg:p-10 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
             <button onClick={onClose} className="lg:hidden p-2 -ml-2 text-slate-400">
                <ChevronLeft size={24} />
             </button>
             <div>
                <h2 className="text-xl lg:text-3xl font-heading font-bold dark:text-white">{t('addLead')}</h2>
                <p className="text-[10px] lg:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">New Sales Opportunity</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
                type="button"
                onClick={() => setShowAiInput(!showAiInput)}
                className={cn("p-2.5 rounded-xl transition-all", showAiInput ? "bg-accent text-white" : "bg-accent/10 text-accent")}
             >
                <Sparkles size={20} />
             </button>
             <button onClick={onClose} className="hidden lg:block p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400">
                <X size={24} />
             </button>
          </div>
        </div>

        {showAiInput && (
          <div className="bg-slate-50 dark:bg-slate-900 p-6 border-b border-slate-200 dark:border-slate-800">
             <div className="relative">
                <textarea 
                  className="w-full h-24 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl text-sm focus:ring-4 focus:ring-accent/10 outline-none resize-none dark:text-white"
                  placeholder="Paste details or use voice below..."
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                />
                <VoiceInput onTranscription={t => setAiText(prev => prev + ' ' + t)} className="absolute bottom-3 right-3" />
             </div>
             <button 
                type="button"
                onClick={handleAiExtract}
                disabled={isAiLoading || !aiText.trim()}
                className="w-full mt-4 py-4 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
             >
                {isAiLoading ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                Extract Details with Gemini
             </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmitHandler)} className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-10 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Person Name*</label>
               <div className="relative group">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                 <input {...register('name')} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary rounded-2xl outline-none dark:text-white" placeholder="e.g. Rahul Sharma" />
               </div>
               {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp / Phone*</label>
               <div className="relative group">
                 <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                 <input {...register('phone')} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary rounded-2xl outline-none dark:text-white" placeholder="+91 98765 43210" />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Business Name*</label>
               <div className="relative group">
                 <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                 <input {...register('company')} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary rounded-2xl outline-none dark:text-white" placeholder="Company Pvt Ltd" />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Project Value (₹)</label>
               <div className="relative group">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-300">₹</span>
                 <input type="number" {...register('value')} className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary rounded-2xl outline-none dark:text-white font-bold" />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Acquisition Source*</label>
               <div className="relative">
                  <select {...register('source')} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary rounded-2xl outline-none dark:text-white appearance-none cursor-pointer font-bold">
                    {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lead Priority</label>
               <div className="relative">
                  <select {...register('priority')} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary rounded-2xl outline-none dark:text-white appearance-none cursor-pointer font-bold">
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">City*</label>
               <input {...register('city')} className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary rounded-2xl outline-none dark:text-white" placeholder="e.g. Mumbai" />
            </div>
          </div>

          <div className="space-y-2">
             <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Additional Requirement Notes</label>
                <VoiceInput onTranscription={t => setValue('notes', (watch('notes') || '') + ' ' + t)} />
             </div>
             <textarea {...register('notes')} className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary rounded-[28px] outline-none dark:text-white resize-none" placeholder="Any specific business needs..." />
          </div>
        </form>

        <div className="p-6 lg:p-10 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 shrink-0 pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:pb-10">
           <button onClick={onClose} className="px-8 py-4 text-sm font-bold text-slate-500 hover:text-slate-800">Discard</button>
           <button 
             onClick={handleSubmit(onSubmitHandler)}
             disabled={isSubmitting}
             className="px-12 py-4 bg-primary text-white rounded-2xl font-extrabold shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95 transition-all"
           >
             {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={20} />}
             Create Lead
           </button>
        </div>
      </div>
    </div>
  );
};

export default LeadForm;
