
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Pencil, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Star, 
  Briefcase, 
  IndianRupee, 
  Clock, 
  Calendar, 
  Gift, 
  FileText, 
  MessageSquare, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  Languages,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Zap,
  Plus,
  Send,
  X,
  History,
  Info,
  Award,
  ShieldCheck,
  RefreshCw,
  MoreHorizontal,
  // Added missing Settings2 and User imports from lucide-react
  Settings2,
  User
} from 'lucide-react';
import { useCRMStore } from '../lib/store';
import { useAuth } from '../lib/auth';
import { formatCurrency, formatDate, timeAgo, cn } from '../lib/utils';
import { LoyaltyStatus, ActivityType } from '../types';
import { analyzeNoteContent } from '../lib/ai';
import WhatsAppTemplateModal from './WhatsAppTemplateModal';
import ActivityTimeline from './ActivityTimeline';
import LogActivityDrawer from './LogActivityDrawer';
import EmailComposeDrawer from './EmailComposeDrawer';
import VoiceInput from './VoiceInput';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomerDetailProps {
  customerId: string;
  onBack: () => void;
}

const SNIPPETS = {
  '/visit': 'Visited the client office today. They are satisfied with the current implementation and considering an upgrade next quarter.',
  '/support': 'Resolved a technical query regarding the billing dashboard. Client is happy with the turnaround time.',
  '/renewal': 'Discussed the upcoming subscription renewal. Client confirmed they will renew for another 12 months.',
};

type ActiveTab = 'overview' | 'history' | 'preferences';

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customerId, onBack }) => {
  const { customers, deals, updateCustomer, logWhatsAppSent, addActivity, language } = useCRMStore();
  const { user } = useAuth();
  const customer = customers.find(c => c.id === customerId);
  const purchaseHistory = deals.filter(d => d.customerId === customerId && d.stage === 'Won');
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [quickNote, setQuickNote] = useState('');
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-20">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <p className="text-slate-900 dark:text-white font-bold text-xl">Customer Data Missing</p>
        <button onClick={onBack} className="text-primary hover:underline mt-4">Return to Directory</button>
      </div>
    );
  }

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    for (const [key, text] of Object.entries(SNIPPETS)) {
      if (val.includes(key)) {
        setQuickNote(val.replace(key, text));
        return;
      }
    }
    setQuickNote(val);
  };

  const handleAddNote = async (content?: string, isVoice: boolean = false) => {
    const noteContent = content || quickNote;
    if (!noteContent.trim()) return;
    setQuickNote(''); 
    const analysis = await analyzeNoteContent(noteContent);
    addActivity({
      entityId: customer.id,
      entityType: 'Customer',
      type: 'Note',
      content: noteContent,
      aiAnalysis: analysis || undefined
    });
  };

  const getLoyaltyStyles = (status: LoyaltyStatus) => {
    switch(status) {
      case 'VIP': return 'bg-amber-500 text-white shadow-lg shadow-amber-200';
      case 'Active': return 'bg-success text-white shadow-lg shadow-success/20';
      default: return 'bg-slate-400 text-white';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] dark:bg-slate-950 -m-4 lg:-m-8 relative animate-in fade-in duration-500 overflow-hidden">
      {/* 1. STICKY ACTION HEADER */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 lg:px-10 py-4 flex items-center justify-between sticky top-0 z-[60]">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-primary rounded-xl transition-all active:scale-95 border border-slate-100 dark:border-slate-700">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
             <img src={customer.avatar} className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700" alt="" />
             <div>
               <div className="flex items-center gap-2">
                 <h2 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white leading-none">{customer.name}</h2>
                 <CheckCircle2 size={16} className="text-success" />
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                  <Building size={12} className="text-slate-300" /> {customer.company} • {customer.city}
               </p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-slate-100 dark:border-slate-800">
             <button onClick={() => setShowWhatsAppModal(true)} className="p-2.5 bg-[#25D366]/10 text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-white transition-all shadow-sm" title="WhatsApp"><MessageSquare size={18} /></button>
             <button onClick={() => setIsEmailOpen(true)} className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm" title="Email"><Mail size={18} /></button>
             <a href={`tel:${customer.phone}`} className="p-2.5 bg-success/10 text-success rounded-xl hover:bg-success hover:text-white transition-all shadow-sm" title="Call"><Phone size={18} /></a>
          </div>
          <button className="p-2.5 bg-success text-white rounded-xl shadow-lg shadow-success/20 hover:scale-105 transition-all flex items-center gap-2 px-5 font-bold text-[10px] uppercase tracking-widest">
             <Plus size={14} /> New Deal
          </button>
          <button className="p-2.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"><MoreHorizontal size={20} /></button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-6xl mx-auto p-6 lg:p-12 space-y-10 pb-40">
          
          {/* 2. IDENTITY CARD & METRICS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[32px] p-8 lg:p-10 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                  <div className="relative shrink-0">
                    <img src={customer.avatar} className="w-24 h-24 rounded-[32px] object-cover border-4 border-white dark:border-slate-800 shadow-xl" alt="" />
                    <div className={cn("absolute -bottom-2 -right-2 p-1.5 rounded-xl border-4 border-white dark:border-slate-900 shadow-lg", getLoyaltyStyles(customer.loyaltyStatus))}>
                      <Star size={16} fill="currentColor" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">{customer.name}</h3>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
                       <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Lifetime Value</span>
                          <span className="text-lg font-bold text-success leading-none">{formatCurrency(customer.totalRevenue)}</span>
                       </div>
                       <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Loyalty</span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-none">{customer.loyaltyStatus}</span>
                       </div>
                       <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Partner Since</span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-none">{formatDate(customer.customerSince)}</span>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* STATUS WIDGET */}
            <div className="lg:col-span-4">
               <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
                  <div>
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                       <CreditCard size={12} className="fill-current" /> Payment Health
                    </h4>
                    <div className="flex items-end gap-2 mb-6">
                       <span className="text-4xl font-heading font-black leading-none text-success">{customer.paymentStatus || 'Excellent'}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                       Last payment received {timeAgo(customer.lastPurchaseDate || new Date().toISOString())}. No outstanding invoices.
                    </p>
                  </div>
                  <button onClick={() => setIsLogDrawerOpen(true)} className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 active:scale-95 transition-all">
                     <Plus size={18} /> Log Interaction
                  </button>
               </div>
            </div>
          </div>

          {/* 3. NAVIGATION TABS */}
          <div className="flex items-center p-1.5 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm z-10">
            {[
              { id: 'overview', label: 'History Feed', icon: History },
              { id: 'history', label: 'Deal History', icon: Briefcase },
              { id: 'preferences', label: 'Preferences', icon: Settings2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab.id 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* 4. TAB CONTENT AREA */}
          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <ActivityTimeline entityId={customer.id} entityType="Customer" />
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div 
                  key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CustomerProfileCard title="Contact Detail" icon={User}>
                        <div className="space-y-6">
                           <CustomerInfoField label="Full Name" value={customer.name} />
                           <CustomerInfoField label="Work Phone" value={customer.phone} isCopyable />
                           <CustomerInfoField label="Email Address" value={customer.email} isCopyable />
                           <CustomerInfoField label="Primary City" value={customer.city} />
                        </div>
                      </CustomerProfileCard>

                      <CustomerProfileCard title="Business Info" icon={Building}>
                        <div className="space-y-6">
                           <CustomerInfoField label="Company" value={customer.company} />
                           <CustomerInfoField label="Active Deals" value={customer.activeDealsCount.toString()} />
                           <CustomerInfoField label="Loyalty Tier" value={customer.loyaltyStatus} />
                           <CustomerInfoField label="Renewal Date" value={formatDate(customer.subscriptionRenewal || '2024-09-20')} />
                        </div>
                      </CustomerProfileCard>
                   </div>

                   <CustomerProfileCard title="Purchase History" icon={Briefcase}>
                      <div className="space-y-4">
                         {purchaseHistory.length === 0 ? (
                           <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-700">
                              <p className="text-sm text-slate-400 font-medium">No closed-won deals recorded yet.</p>
                           </div>
                         ) : (
                           purchaseHistory.map(deal => (
                             <div key={deal.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 text-success flex items-center justify-center shadow-sm">
                                      <CheckCircle2 size={18} />
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold text-slate-900 dark:text-white">{deal.title}</p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{formatDate(deal.actualClose || deal.createdAt)}</p>
                                   </div>
                                </div>
                                <p className="text-base font-heading font-black text-slate-900 dark:text-white">{formatCurrency(deal.value)}</p>
                             </div>
                           ))
                         )}
                      </div>
                   </CustomerProfileCard>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div 
                  key="preferences" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <CustomerProfileCard title="Communication" icon={Languages}>
                     <div className="space-y-6">
                        <CustomerInfoField label="Preferred Language" value={customer.preferredLanguage} />
                        <CustomerInfoField label="Best Contact Time" value={customer.preferredContactTime} />
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                           <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">Support Preference</p>
                           <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Customer prefers WhatsApp for quick queries and Email for formal documentation.</p>
                        </div>
                     </div>
                  </CustomerProfileCard>

                  <CustomerProfileCard title="Labels & Segments" icon={Zap}>
                     <div className="flex flex-wrap gap-2">
                        {customer.tags.map(tag => (
                           <span key={tag} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                              {tag}
                           </span>
                        ))}
                        <button className="px-4 py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-400 hover:text-primary transition-all">+ ADD TAG</button>
                     </div>
                  </CustomerProfileCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 5. FLOATING INPUT BAR */}
      <div className="fixed bottom-24 lg:bottom-12 left-6 right-6 lg:left-1/2 lg:-translate-x-1/2 lg:max-w-3xl z-[70]">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 p-2.5 flex items-center gap-3 animate-in slide-in-from-bottom-8">
          <VoiceInput onTranscription={(text) => handleAddNote(text, true)} className="ml-1" />
          <div className="flex-1 relative">
            <input 
              className="w-full bg-transparent border-none outline-none text-sm dark:text-white py-3 px-3 font-bold placeholder:text-slate-400"
              placeholder="Record a client update... (try /visit)"
              value={quickNote}
              onChange={handleNoteChange}
              onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
            />
            <AnimatePresence>
              {quickNote.startsWith('/') && (
                <motion.div 
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                   className="absolute bottom-full left-0 mb-4 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-2 overflow-hidden z-20"
                >
                   {Object.entries(SNIPPETS).map(([key, text]) => (
                     <button 
                        key={key} 
                        onClick={() => setQuickNote(text)}
                        className="w-full text-left px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3"
                     >
                        <span className="w-12 font-black text-primary text-[10px] uppercase">{key.slice(1)}</span> 
                        <span className="text-[10px] text-slate-400 font-bold truncate">Template</span>
                     </button>
                   ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={() => handleAddNote()} 
            disabled={!quickNote.trim()}
            className="w-12 h-12 rounded-[22px] bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Modals & Drawers */}
      {isLogDrawerOpen && (
        <LogActivityDrawer isOpen={isLogDrawerOpen} onClose={() => setIsLogDrawerOpen(false)} entityId={customer.id} entityType="Customer" contextName={customer.name} />
      )}
      {isEmailOpen && (
        <EmailComposeDrawer isOpen={isEmailOpen} onClose={() => setIsEmailOpen(false)} entity={{ id: customer.id, name: customer.name, email: customer.email, company: customer.company, type: 'Customer' }} />
      )}
      {showWhatsAppModal && (
        <WhatsAppTemplateModal recipient={{ name: customer.name, company: customer.company, phone: customer.phone, value: formatCurrency(customer.totalRevenue) }} onClose={() => setShowWhatsAppModal(false)} onSent={(content) => logWhatsAppSent(customer.id, false, `WhatsApp Sent: ${content.substring(0, 40)}...`)} />
      )}
    </div>
  );
};

const CustomerProfileCard: React.FC<{ title: string; icon: any; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
     <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl"><Icon size={20} /></div>
        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{title}</h4>
     </div>
     {children}
  </div>
);

const CustomerInfoField: React.FC<{ label: string; value: string; isCopyable?: boolean }> = ({ label, value, isCopyable }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="group relative">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 ml-0.5">{label}</p>
      <div className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-xl border border-transparent group-hover:border-slate-100 dark:group-hover:border-slate-700 transition-all">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate pr-4">{value}</p>
        {isCopyable && (
          <button onClick={handleCopy} className="p-1.5 text-slate-300 hover:text-primary transition-all active:scale-90">
            {copied ? <CheckCircle2 size={16} className="text-success" /> : <Plus size={16} className="rotate-45" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
