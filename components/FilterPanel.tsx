
import React, { useState } from 'react';
import { X, SlidersHorizontal, MapPin, IndianRupee, Zap, Calendar, User, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { LeadStatus, LeadSource } from '../types';

interface FilterPanelProps {
  onClose: () => void;
  onApply: (filters: any) => void;
  currentFilters: any;
}

const INDIAN_CITIES = ['Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Pune', 'Kolkata'];

const FilterPanel: React.FC<FilterPanelProps> = ({ onClose, onApply, currentFilters }) => {
  const [filters, setFilters] = useState(currentFilters);

  const toggleStatus = (status: string) => {
    const next = filters.status.includes(status) 
      ? filters.status.filter((s: string) => s !== status) 
      : [...filters.status, status];
    setFilters({ ...filters, status: next });
  };

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-950 w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={20} className="text-primary" />
            <h2 className="text-xl font-heading font-bold dark:text-white">Advanced Filters</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-hide">
          {/* Status Section */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} /> Pipeline Status
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.values(LeadStatus).map(s => (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                    filters.status.includes(s) 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                      : "bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Value Range */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <IndianRupee size={14} /> Value Range (₹)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 ml-1">MIN</p>
                <input 
                  type="number" 
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:border-primary dark:text-white"
                  value={filters.minValue}
                  onChange={e => setFilters({...filters, minValue: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 ml-1">MAX</p>
                <input 
                  type="number" 
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:border-primary dark:text-white"
                  value={filters.maxValue}
                  onChange={e => setFilters({...filters, maxValue: e.target.value})}
                  placeholder="Any"
                />
              </div>
            </div>
          </section>

          {/* City Selection */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={14} /> City / Region
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {INDIAN_CITIES.map(city => (
                <button
                  key={city}
                  onClick={() => setFilters({...filters, city: filters.city === city ? '' : city})}
                  className={cn(
                    "px-3 py-2 rounded-xl text-[11px] font-bold border transition-all text-left",
                    filters.city === city 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900" 
                      : "bg-white dark:bg-slate-900 dark:border-slate-800 text-slate-500"
                  )}
                >
                  {city}
                </button>
              ))}
            </div>
          </section>

          {/* Source Section */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Search size={14} /> Acquisition Source
            </h3>
            <div className="space-y-2">
               {Object.values(LeadSource).map(source => (
                 <label key={source} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-lg accent-primary" 
                      checked={filters.source.includes(source)}
                      onChange={() => {
                        const next = filters.source.includes(source) 
                          ? filters.source.filter((s: string) => s !== source) 
                          : [...filters.source, source];
                        setFilters({...filters, source: next});
                      }}
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{source}</span>
                 </label>
               ))}
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-4">
          <button 
            onClick={() => setFilters({ status: [], minValue: '', maxValue: '', city: '', source: [] })}
            className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-slate-700"
          >
            Clear All
          </button>
          <button 
            onClick={() => onApply(filters)}
            className="flex-[2] py-4 bg-primary text-white rounded-2xl font-extrabold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
