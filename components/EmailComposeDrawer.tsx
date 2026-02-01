
import React, { useState, useEffect } from 'react';
import { 
  X, Send, Sparkles, Languages, Type, CheckCircle2, 
  ChevronDown, Copy, Loader2, Mail, User, BookOpen, 
  AlertCircle, History, MessageSquare, Mic, Paperclip,
  Maximize2, Minimize2, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCRMStore } from '../lib/store';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';
import { generateEmailContent, improveEmailWriting, translateEmailText, checkEmailGrammar } from '../lib/ai';
import VoiceInput from './VoiceInput';

interface EmailComposeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entity: { id: string; name: string; email: string; company: string; type: 'Lead' | 'Customer' };
}

const TEMPLATES = [
  { id: 'intro', title: 'Introduction', subject: 'Connecting regarding {company}', body: "Namaste {name},\n\nHope you're doing well. I'm reaching out from SimpleCRM to introduce our solutions that could help {company} scale more efficiently.\n\nWould love to have a brief 10-minute call this week. Best regards," },
  { id: 'fup', title: 'Follow-up after Call', subject: 'Recap: Our conversation today', body: "Hi {name},\n\nGreat speaking with you today! As discussed, I've attached our latest brochure. Looking forward to your thoughts.\n\nBest," },
  { id: 'quote', title: 'Quote/Proposal', subject: 'Customized Proposal for {company}', body: "Dear {name},\n\nPlease find attached the customized proposal we prepared for {company}. We have tailored this to your specific requirements discussed.\n\nLet me know if we can schedule a walkthrough." },
  { id: 'thanks', title: 'Thank You', subject: 'Thank you for your time!', body: "Hi {name},\n\nJust wanted to send a quick thank you for the meeting today. It was great learning more about {company}'s roadmap.\n\nBest regards," },
];

const EmailComposeDrawer: React.FC<EmailComposeDrawerProps> = ({ isOpen, onClose, entity }) => {
  const { user } = useAuth();
  const { addActivity } = useCRMStore();
  
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [cc, setCc] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiGen, setShowAiGen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // AI Gen State
  const [aiIntent, setAiIntent] = useState('Follow-up');
  const [aiTone, setAiTone] = useState('Professional');
  const [aiPoints, setAiPoints] = useState('');

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    const sub = tpl.subject.replace('{company}', entity.company);
    const bdy = tpl.body.replace('{name}', entity.name).replace('{company}', entity.company);
    setSubject(sub);
    setBody(bdy);
  };

  const handleAiGenerate = async () => {
    setIsAiLoading(true);
    const result = await generateEmailContent(aiIntent, aiTone, aiPoints, {
      name: entity.name,
      company: entity.company,
      userName: user?.name.split(' ')[0] || 'Member'
    });
    if (result) {
      setSubject(result.subject);
      setBody(result.body);
      setShowAiGen(false);
    }
    setIsAiLoading(false);
  };

  const handleImprove = async () => {
    setIsAiLoading(true);
    const result = await improveEmailWriting(body);
    if (result) setBody(result);
    setIsAiLoading(false);
  };

  const handleTranslate = async () => {
    setIsAiLoading(true);
    const result = await translateEmailText(body, 'Hindi');
    if (result) setBody(result);
    setIsAiLoading(false);
  };

  const handleSend = () => {
    const mailto = `mailto:${entity.email}?subject=${encodeURIComponent(subject)}&cc=${encodeURIComponent(cc)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
    
    // Log in CRM
    addActivity({
      entityId: entity.id,
      entityType: entity.type,
      type: 'Email',
      content: `Sent email: ${subject}`,
      subject,
      to: entity.email
    });
    
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: isMinimized ? 'calc(100% - 300px)' : 0, y: isMinimized ? 'calc(100% - 60px)' : 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed right-0 bg-white dark:bg-slate-950 shadow-2xl z-[151] flex flex-col transition-all duration-300 overflow-hidden",
              isMinimized ? "w-[300px] h-[60px] rounded-tl-2xl bottom-0" : "w-full md:w-[600px] top-0 bottom-0"
            )}
          >
            {/* Header */}
            <div className="p-4 lg:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl">
                    <Mail size={18} />
                  </div>
                  <h2 className="font-heading font-bold dark:text-white truncate">New Email to {entity.name}</h2>
               </div>
               <div className="flex items-center gap-1">
                  <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 text-slate-400 hover:text-slate-600">
                    {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                  </button>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500">
                    <X size={20} />
                  </button>
               </div>
            </div>

            {!isMinimized && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* To / Cc / Subject */}
                <div className="p-4 lg:p-6 space-y-4 border-b border-slate-50 dark:border-slate-800 shrink-0">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase w-12 tracking-widest">To</span>
                      <div className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold dark:text-white">{entity.email}</div>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase w-12 tracking-widest">Cc</span>
                      <input 
                        className="flex-1 bg-transparent border-none outline-none text-xs dark:text-white"
                        placeholder="Add recipients..."
                        value={cc} onChange={e => setCc(e.target.value)}
                      />
                   </div>
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase w-12 tracking-widest">Subject</span>
                      <input 
                        className="flex-1 bg-transparent border-none outline-none text-sm font-bold dark:text-white"
                        placeholder="Enter email subject..."
                        value={subject} onChange={e => setSubject(e.target.value)}
                      />
                   </div>
                </div>

                {/* Toolbar */}
                <div className="px-4 lg:px-6 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                   <div className="flex items-center gap-2">
                      <div className="relative group">
                         <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 transition-all border border-transparent hover:border-slate-200">
                            <BookOpen size={14} /> Templates <ChevronDown size={12} />
                         </button>
                         <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-20">
                            {TEMPLATES.map(t => (
                              <button key={t.id} onClick={() => handleApplyTemplate(t)} className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-medium dark:text-slate-300">
                                 {t.title}
                              </button>
                            ))}
                         </div>
                      </div>
                      <button onClick={handleImprove} disabled={isAiLoading || !body} className="p-2 text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all" title="Improve Writing">
                        <Type size={16} />
                      </button>
                      <button onClick={handleTranslate} disabled={isAiLoading || !body} className="p-2 text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all" title="Translate to Hindi">
                        <Languages size={16} />
                      </button>
                   </div>
                   <button 
                     onClick={() => setShowAiGen(!showAiGen)}
                     className={cn("flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold transition-all", showAiGen ? "bg-accent text-white" : "bg-accent/10 text-accent hover:bg-accent hover:text-white")}
                   >
                      <Sparkles size={14} /> ✨ AI Assistant
                   </button>
                </div>

                {/* Main Editor */}
                <div className="flex-1 relative flex flex-col">
                  <AnimatePresence>
                    {showAiGen && (
                      <motion.div 
                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="bg-accent/5 dark:bg-accent/10 border-b border-accent/10 overflow-hidden"
                      >
                         <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Intent</label>
                                  <select value={aiIntent} onChange={e => setAiIntent(e.target.value)} className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold outline-none border border-slate-100 dark:border-slate-700">
                                     <option>Follow-up</option>
                                     <option>Meeting Request</option>
                                     <option>Price Quote</option>
                                     <option>Thank You</option>
                                     <option>Introductory</option>
                                  </select>
                               </div>
                               <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tone</label>
                                  <select value={aiTone} onChange={e => setAiTone(e.target.value)} className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold outline-none border border-slate-100 dark:border-slate-700">
                                     <option>Professional</option>
                                     <option>Friendly</option>
                                     <option>Persuasive</option>
                                     <option>Formal</option>
                                  </select>
                               </div>
                            </div>
                            <div className="space-y-1">
                               <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Key Points</label>
                               <textarea 
                                 placeholder="e.g. Ask about the budget, mention last week's demo..."
                                 className="w-full h-20 p-4 bg-white dark:bg-slate-800 rounded-2xl text-xs outline-none border border-slate-100 dark:border-slate-700 resize-none"
                                 value={aiPoints} onChange={e => setAiPoints(e.target.value)}
                               />
                            </div>
                            <div className="flex gap-2">
                               <button 
                                 onClick={handleAiGenerate}
                                 disabled={isAiLoading}
                                 className="flex-1 py-3 bg-accent text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent/20 active:scale-95 transition-all"
                               >
                                  {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                  Generate Draft
                               </button>
                               <button onClick={() => setShowAiGen(false)} className="px-5 py-3 text-xs font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <textarea 
                    className="flex-1 w-full p-6 lg:p-10 outline-none resize-none bg-transparent text-sm leading-relaxed dark:text-slate-200"
                    placeholder="Write your email here... use AI for a faster draft."
                    value={body} onChange={e => setBody(e.target.value)}
                  />
                  
                  {isAiLoading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                       <div className="flex flex-col items-center gap-4 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800">
                          <Loader2 size={32} className="animate-spin text-primary" />
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gemini is thinking...</p>
                       </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 lg:p-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-950">
                   <div className="flex items-center gap-3">
                      <button className="p-3 text-slate-400 hover:text-primary transition-all">
                        <Paperclip size={20} />
                      </button>
                      <VoiceInput onTranscription={text => setBody(prev => prev + '\n' + text)} />
                   </div>
                   <div className="flex items-center gap-4">
                      <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600">Discard</button>
                      <button 
                        onClick={handleSend}
                        className="bg-primary text-white px-10 py-4 rounded-2xl font-extrabold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                      >
                         Send Email <Send size={18} />
                      </button>
                   </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmailComposeDrawer;
