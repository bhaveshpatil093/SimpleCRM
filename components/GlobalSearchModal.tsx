
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, UserPlus, Briefcase, ArrowRight, CornerDownLeft, Clock, Mic, Zap, Settings, BarChart3, Download, Moon } from 'lucide-react';
import { useCRMStore } from '../lib/store';
import { globalSearch, SearchResult } from '../lib/search';
import { cn } from '../lib/utils';
import VoiceInput from './VoiceInput';

interface GlobalSearchModalProps {
  onClose: () => void;
  onSelect: (type: string, id: string) => void;
  commands?: SearchResult[];
}

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onClose, onSelect, commands = [] }) => {
  const { leads, customers, deals } = useCRMStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ leads: SearchResult[], customers: SearchResult[], deals: SearchResult[], commands: SearchResult[] }>({ leads: [], customers: [], deals: [], commands: [] });
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('crm_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        setResults(globalSearch(query, leads, customers, deals, commands));
        setActiveIndex(0);
      } else {
        setResults({ leads: [], customers: [], deals: [], commands: [] });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [query, leads, customers, deals, commands]);

  const allFlatResults = [...results.commands, ...results.leads, ...results.customers, ...results.deals];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setActiveIndex(prev => Math.min(prev + 1, allFlatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && allFlatResults[activeIndex]) {
      const item = allFlatResults[activeIndex];
      handleItemClick(item);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleItemClick = (item: SearchResult) => {
    if (query) {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      localStorage.setItem('crm_recent_searches', JSON.stringify(updated));
    }
    if (item.type === 'Command' && item.handler) {
      item.handler();
    } else {
      onSelect(item.type.toLowerCase() + 's', item.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4 md:px-0">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200" onKeyDown={handleKeyDown}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="text-slate-400" size={20} />
          <input 
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-lg dark:text-white placeholder:text-slate-400"
            placeholder="Search leads, deals, or commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <VoiceInput onTranscription={(t) => setQuery(t)} className="scale-75" />
            <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100 dark:bg-slate-800 dark:border-slate-700">
              ESC
            </kbd>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto scrollbar-hide pb-2">
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Recent Searches</p>
              {recentSearches.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => setQuery(s)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <Clock size={14} className="text-slate-300" />
                  {s}
                </button>
              ))}
            </div>
          )}

          {allFlatResults.length > 0 ? (
            <>
              {results.commands.length > 0 && (
                <Section title="Actions" icon={<Zap size={14} />} items={results.commands} currentGlobalIndex={0} activeIndex={activeIndex} onSelect={(item) => handleItemClick(item)} />
              )}
              {results.leads.length > 0 && (
                <Section title="Leads" icon={<UserPlus size={14} />} items={results.leads} currentGlobalIndex={results.commands.length} activeIndex={activeIndex} onSelect={(item) => handleItemClick(item)} />
              )}
              {results.customers.length > 0 && (
                <Section title="Customers" icon={<Users size={14} />} items={results.customers} currentGlobalIndex={results.commands.length + results.leads.length} activeIndex={activeIndex} onSelect={(item) => handleItemClick(item)} />
              )}
              {results.deals.length > 0 && (
                <Section title="Deals" icon={<Briefcase size={14} />} items={results.deals} currentGlobalIndex={results.commands.length + results.leads.length + results.customers.length} activeIndex={activeIndex} onSelect={(item) => handleItemClick(item)} />
              )}
            </>
          ) : query.length >= 2 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Search size={32} strokeWidth={1} />
              </div>
              <p className="text-slate-500 font-medium">No matches found for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for a name, company, or command like "New Lead".</p>
            </div>
          ) : query.length === 0 && recentSearches.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-400 font-medium">Search for leads or try commands like "Export" or "Settings"</p>
            </div>
          )}
        </div>

        {allFlatResults.length > 0 && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><CornerDownLeft size={10} /> Select</span>
              <span className="flex items-center gap-1">↑↓ Navigate</span>
            </div>
            <span>{allFlatResults.length} Results</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; items: SearchResult[]; currentGlobalIndex: number; activeIndex: number; onSelect: (item: SearchResult) => void }> = ({ title, icon, items, currentGlobalIndex, activeIndex, onSelect }) => (
  <div className="mt-2">
    <div className="px-5 py-2 flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em] sticky top-0 bg-white dark:bg-slate-900 z-10">
      {icon} {title}
    </div>
    <div className="px-2">
      {items.map((item, idx) => {
        const isSelected = currentGlobalIndex + idx === activeIndex;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-left group mb-1",
              isSelected ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.01]" : "hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm", isSelected ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
                {item.type === 'Command' ? <Zap size={16} /> : item.title.charAt(0)}
              </div>
              <div>
                <p className={cn("text-sm font-bold leading-none", isSelected ? "text-white" : "text-slate-900 dark:text-white")}>{item.title}</p>
                <p className={cn("text-[11px] font-medium mt-1", isSelected ? "text-white/70" : "text-slate-400")}>{item.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {item.meta && (
                <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold uppercase", isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500")}>
                  {item.meta}
                </span>
              )}
              <ArrowRight size={14} className={cn("transition-transform", isSelected ? "translate-x-0" : "translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100")} />
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

export default GlobalSearchModal;
