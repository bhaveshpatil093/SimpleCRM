
import React, { useState } from 'react';
import { X, Send, Copy, Search, MessageSquare, ChevronRight, Check } from 'lucide-react';
import { WHATSAPP_TEMPLATES, substituteTemplate, getWhatsAppUrl, WhatsAppTemplate } from '../lib/whatsapp';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';

interface WhatsAppTemplateModalProps {
  onClose: () => void;
  onSent: (content: string) => void;
  recipient: {
    name: string;
    company: string;
    phone: string;
    value?: string | number;
  };
}

const WhatsAppTemplateModal: React.FC<WhatsAppTemplateModalProps> = ({ onClose, onSent, recipient }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  const categories = ['All', ...new Set(WHATSAPP_TEMPLATES.map(t => t.category))];

  const filteredTemplates = WHATSAPP_TEMPLATES.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getPreview = (template: WhatsAppTemplate) => {
    return substituteTemplate(template.content, {
      name: recipient.name,
      company: recipient.company,
      your_name: user?.name.split(' ')[0] || 'Member',
      value: recipient.value
    });
  };

  const handleSend = () => {
    if (!selectedTemplate) return;
    const message = getPreview(selectedTemplate);
    const url = getWhatsAppUrl(recipient.phone, message);
    window.open(url, '_blank');
    onSent(message);
    onClose();
  };

  const handleCopy = () => {
    if (!selectedTemplate) return;
    navigator.clipboard.writeText(getPreview(selectedTemplate));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">WhatsApp Templates</h2>
            <p className="text-sm text-slate-500 font-medium">Quickly engage with {recipient.name} on WhatsApp.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Sidebar: Templates List */}
          <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
            <div className="p-4 border-b border-slate-100 bg-white">
               <div className="relative">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search templates..." 
                   className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
               <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
                 {categories.map(cat => (
                   <button 
                     key={cat}
                     onClick={() => setActiveCategory(cat)}
                     className={cn(
                       "px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all",
                       activeCategory === cat ? "bg-primary text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                     )}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl transition-all group border border-transparent",
                    selectedTemplate?.id === t.id ? "bg-white border-primary shadow-sm" : "hover:bg-white/60"
                  )}
                >
                  <p className={cn("text-xs font-bold transition-colors", selectedTemplate?.id === t.id ? "text-primary" : "text-slate-700")}>{t.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-1">{t.content}</p>
                </button>
              ))}
              {filteredTemplates.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs italic">No templates found.</div>
              )}
            </div>
          </div>

          {/* Right Content: Preview & Send */}
          <div className="flex-1 bg-white p-8 overflow-y-auto">
            {selectedTemplate ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                   <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded uppercase tracking-wider">{selectedTemplate.category}</span>
                   <h3 className="text-xl font-bold text-slate-900 mt-2">{selectedTemplate.title}</h3>
                </div>

                <div className="relative group">
                  <div className="absolute -top-3 left-4 px-2 bg-white text-[9px] font-bold text-slate-400 uppercase tracking-widest z-10">Message Preview</div>
                  <div className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm text-slate-700 leading-relaxed font-medium min-h-[150px] whitespace-pre-wrap">
                    {getPreview(selectedTemplate)}
                  </div>
                  <div className="absolute bottom-3 right-3 flex gap-2">
                     <button 
                       onClick={handleCopy}
                       className="p-2 bg-white rounded-xl shadow-sm text-slate-400 hover:text-primary transition-all border border-slate-100"
                     >
                        {copied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
                     </button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                         <MessageSquare size={18} />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Sending To</p>
                         <p className="text-sm font-bold text-slate-900">{recipient.name} ({recipient.phone})</p>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                   <p className="text-[10px] text-slate-400 italic">This will open WhatsApp Web/App on your device.</p>
                   <button 
                     onClick={handleSend}
                     className="bg-[#25D366] text-white px-10 py-3.5 rounded-full font-bold shadow-lg shadow-[#25D366]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                   >
                      <Send size={18} /> Open WhatsApp
                   </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <MessageSquare size={40} />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-slate-900">Select a template</h3>
                   <p className="text-xs text-slate-400 max-w-[200px] mx-auto">Choose a pre-written message from the left to preview and send.</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppTemplateModal;
