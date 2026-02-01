
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  Trash2, 
  MoreVertical, 
  Mail, 
  Building, 
  MapPin, 
  Zap, 
  Clock, 
  History, 
  FileText, 
  Sparkles, 
  Calendar, 
  ArrowRight,
  Send,
  Mic,
  CheckCircle2,
  User,
  Plus,
  Loader2,
  TrendingUp,
  MessageCircle,
  ChevronDown,
  PhoneCall,
  Video,
  BellRing,
  Award,
  ClipboardList,
  X,
  Info,
  ExternalLink,
  ShieldCheck,
  Target,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react';
import { useCRMStore } from '../lib/store';
import { useAuth } from '../lib/auth';
import { LeadStatus, LeadActivity, DealStage } from '../types';
import { formatCurrency, timeAgo, formatDate, cn } from '../lib/utils';
import { getStrategicInsights, summarizeLead, calculateLeadScore, analyzeNoteContent, summarizeActivities } from '../lib/ai';
import { useTranslation } from '../lib/i18n';
import WhatsAppTemplateModal from './WhatsAppTemplateModal';
import VoiceInput from './VoiceInput';
import ReminderModal from './ReminderModal';
import LogActivityDrawer from './LogActivityDrawer';
import ActivityTimeline from './ActivityTimeline';
import EmailComposeDrawer from './EmailComposeDrawer';
import { motion, AnimatePresence } from 'framer-motion';

interface LeadDetailProps {
  leadId: string;
  onBack: () => void;
}

const SNIPPETS = {
  '/followup': 'Followed up with the client regarding the pending proposal. They requested a few more days to review with their finance team.',
  '/meeting': 'Had a productive meeting today. Key takeaway: client is looking for a scalable solution with local support. Next steps: send technical documentation.',
  '/call': 'Called the client. They were unavailable, left a voicemail to call back at their earliest convenience.',
};

type ActiveTab = 'timeline' | 'insights' | 'details';

const LeadDetail: React.FC<LeadDetailProps> = ({ leadId, onBack }) => {
  const { leads, activities, addLeadActivity, deleteLead, updateLeadStatus, convertLeadToCustomer, updateLeadAiMetadata, logWhatsAppSent, language } = useCRMStore();
  const { user } = useAuth();
  const { t } = useTranslation(language);
  const lead = leads.find(l => l.id === leadId);

  const [activeTab, setActiveTab] = useState<ActiveTab>('timeline');
  const [quickNote, setQuickNote] = useState('');
  const [aiInsights, setAiInsights] = useState<string>('');
  const [activitySummary, setActivitySummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  useEffect(() => {
    if (lead) {
      loadInsights();
      if (!lead.aiMetadata?.score) {
        refreshScore();
      }
    }
  }, [leadId]);

  const loadInsights = async () => {
    if (!lead) return;
    setIsAiLoading(true);
    const insights = await getStrategicInsights(lead);
    setAiInsights(insights || 'Generating strategic insights...');
    setIsAiLoading(false);
  };

  const refreshScore = async () => {
    if (!lead) return;
    const result = await calculateLeadScore(lead);
    if (result) {
      updateLeadAiMetadata(lead.id, { score: result.score, scoreLabel: result.label });
    }
  };

  if (!lead) return null;

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
    addLeadActivity(lead.id, {
      type: 'Note',
      content: noteContent,
      user: user?.name || 'System',
      isVoice
    }, analysis || undefined);
  };

  const handleConvert = () => {
    if (confirm(`Convert ${lead.name} to a Customer?`)) {
      convertLeadToCustomer(lead.id);
      onBack();
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.NEW: return 'bg-blue-500';
      case LeadStatus.QUALIFIED: return 'bg-success';
      case LeadStatus.CONVERTED: return 'bg-accent';
      case LeadStatus.LOST: return 'bg-red-500';
      default: return 'bg-slate-400';
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
          <div>
             <div className="flex items-center gap-2">
               <h2 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white leading-none">{lead.name}</h2>
               <div className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-sm", getStatusColor(lead.status))}>
                 {lead.status}
               </div>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                <Building size={12} className="text-slate-300" /> {lead.company} • {lead.city}
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-slate-100 dark:border-slate-800">
             <button onClick={() => setShowWhatsAppModal(true)} className="p-2.5 bg-[#25D366]/10 text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-white transition-all" title="WhatsApp"><MessageCircle size={18} /></button>
             <button onClick={() => setIsEmailOpen(true)} className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all" title="Email"><Mail size={18} /></button>
             <button onClick={() => setShowReminderModal(true)} className="p-2.5 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all" title="Reminder"><BellRing size={18} /></button>
             <a href={`tel:${lead.phone}`} className="p-2.5 bg-success/10 text-success rounded-xl hover:bg-success hover:text-white transition-all" title="Call"><PhoneCall size={18} /></a>
          </div>
          <button className="p-2.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"><MoreHorizontal size={20} /></button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-6xl mx-auto p-6 lg:p-12 space-y-10 pb-40">
          
          {/* 2. IDENTITY CARD & SCORE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[32px] p-8 lg:p-10 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               
               <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center gap-8 text-center md:text-left">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-heading font-black text-white shadow-xl">
                      {lead.name.charAt(0)}
                    </div>
                    {lead.status === LeadStatus.QUALIFIED && (
                      <div className="absolute -bottom-2 -right-2 bg-success text-white p-1.5 rounded-xl border-4 border-white dark:border-slate-900 shadow-lg">
                        <Award size={16} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">{lead.name}</h3>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Value</span>
                          <span className="text-lg font-bold text-success leading-none">{formatCurrency(lead.value)}</span>
                       </div>
                       <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 hidden md:block"></div>
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Source</span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-none">{lead.source}</span>
                       </div>
                       <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 hidden md:block"></div>
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Created</span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-none">{timeAgo(lead.createdAt)}</span>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* AI SCORE WIDGET */}
            <div className="lg:col-span-4">
               <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
                  <div>
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                       <Zap size={12} className="fill-current" /> AI Momentum
                    </h4>
                    <div className="flex items-end gap-2 mb-6">
                       <span className="text-5xl font-heading font-black leading-none">{lead.aiMetadata?.score || '--'}</span>
                       <span className="text-[10px] font-bold text-slate-400 mb-1.5">/ 100</span>
                    </div>
                  </div>
                  <button onClick={() => setIsLogDrawerOpen(true)} className="w-full py-3.5 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 active:scale-95 transition-all">
                     <Plus size={18} /> Log Interaction
                  </button>
               </div>
            </div>
          </div>

          {/* 3. SEGMENTED NAVIGATION TABS - REMOVED STICKY TO PREVENT FLOATING */}
          <div className="flex items-center p-1.5 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm z-10">
            {[
              { id: 'timeline', label: 'History Feed', icon: History },
              { id: 'insights', label: 'AI Strategy', icon: Sparkles },
              { id: 'details', label: 'Full Profile', icon: Info },
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
              {activeTab === 'timeline' && (
                <motion.div 
                  key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-xl font-heading font-black dark:text-white">Interaction Log</h4>
                    <button 
                      onClick={async () => {
                        const relevantActivities = activities.filter(a => a.entityId === leadId && a.entityType === 'Lead');
                        if (relevantActivities.length > 0) {
                          setIsSummarizing(true);
                          const summary = await summarizeActivities(relevantActivities);
                          setActivitySummary(summary);
                          setIsSummarizing(false);
                        }
                      }}
                      className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50"
                    >
                      {isSummarizing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} className="text-amber-500 fill-amber-500" />}
                      Summarize Feed
                    </button>
                  </div>

                  {activitySummary && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 p-8 rounded-[32px] relative">
                       <button onClick={() => setActivitySummary(null)} className="absolute top-4 right-4 p-2 text-amber-300 hover:text-amber-500"><X size={16} /></button>
                       <h5 className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles size={12} /> AI Summary</h5>
                       <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed font-medium">{activitySummary}</p>
                    </div>
                  )}

                  <ActivityTimeline entityId={leadId} entityType="Lead" />
                </motion.div>
              )}

              {activeTab === 'insights' && (
                <motion.div 
                  key="insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-10 shadow-sm relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                       <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center"><Target size={24} /></div>
                       <div>
                          <h4 className="text-2xl font-heading font-black dark:text-white">Strategic Roadmap</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Powered by Gemini AI</p>
                       </div>
                    </div>
                    {isAiLoading ? (
                      <div className="space-y-6 animate-pulse"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div><div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl w-full"></div></div>
                    ) : (
                      <div className="space-y-10">
                         <p className="text-xl text-slate-700 dark:text-slate-300 font-medium italic border-l-4 border-primary pl-6">"{aiInsights}"</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                               <p className="text-[9px] font-black text-blue-600 uppercase mb-3">Key Value Proposition</p>
                               <p className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed">Lead is highly price-sensitive but values speed of execution. Highlight local support network in {lead.city}.</p>
                            </div>
                            <div className="p-6 bg-success/10 rounded-2xl border border-success/10">
                               <p className="text-[9px] font-black text-success uppercase mb-3">Next Best Action</p>
                               <p className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed">Send the Diwali special case study. They mentioned specific interest in how similar firms in Mumbai use our platform.</p>
                            </div>
                         </div>
                         <button onClick={loadInsights} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest flex items-center gap-2"><RefreshCw size={12} /> Regenerate Plan</button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'details' && (
                <motion.div 
                  key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <ProfileCard title="Contact Detail" icon={User}>
                    <div className="space-y-6">
                       <ProfileField label="Full Name" value={lead.name} />
                       <ProfileField label="Work Phone" value={lead.phone} isCopyable />
                       <ProfileField label="Email Address" value={lead.email || 'Not Provided'} isCopyable />
                       <ProfileField label="Location" value={lead.city} />
                    </div>
                  </ProfileCard>

                  <ProfileCard title="Pipeline Status" icon={Zap}>
                    <div className="space-y-6">
                       <ProfileField label="Lead Source" value={lead.source} />
                       <ProfileField label="Priority Level" value={lead.priority} />
                       <ProfileField label="Assigned Manager" value={lead.assignedTo || 'Unassigned'} />
                       <ProfileField label="System ID" value={lead.id} />
                    </div>
                  </ProfileCard>

                  <div className="md:col-span-2">
                    <ProfileCard title="Requirement History" icon={FileText}>
                      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          {lead.notes || 'No notes were recorded at the time of lead capture.'}
                        </p>
                      </div>
                    </ProfileCard>
                  </div>
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
              placeholder="Record a quick update... (try /followup)"
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
        <LogActivityDrawer isOpen={isLogDrawerOpen} onClose={() => setIsLogDrawerOpen(false)} entityId={leadId} entityType="Lead" contextName={lead.name} />
      )}
      {isEmailOpen && (
        <EmailComposeDrawer isOpen={isEmailOpen} onClose={() => setIsEmailOpen(false)} entity={{ id: leadId, name: lead.name, email: lead.email, company: lead.company, type: 'Lead' }} />
      )}
      {showWhatsAppModal && (
        <WhatsAppTemplateModal recipient={{ name: lead.name, company: lead.company, phone: lead.phone, value: formatCurrency(lead.value) }} onClose={() => setShowWhatsAppModal(false)} onSent={(content) => logWhatsAppSent(lead.id, true, `WhatsApp Sent: ${content.substring(0, 40)}...`)} />
      )}
      {showReminderModal && (
        <ReminderModal contextName={lead.name} leadId={lead.id} onClose={() => setShowReminderModal(false)} />
      )}
    </div>
  );
};

const ProfileCard: React.FC<{ title: string; icon: any; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
     <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl"><Icon size={20} /></div>
        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{title}</h4>
     </div>
     {children}
  </div>
);

const ProfileField: React.FC<{ label: string; value: string; isCopyable?: boolean }> = ({ label, value, isCopyable }) => {
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

export default LeadDetail;
