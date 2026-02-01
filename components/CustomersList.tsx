
import React, { useState, useMemo } from 'react';
import { useCRMStore } from '../lib/store';
import { LoyaltyStatus } from '../types';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone, 
  ExternalLink, 
  IndianRupee, 
  Briefcase, 
  Clock, 
  Download,
  Filter,
  Eye,
  Star,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Users
} from 'lucide-react';
import { formatCurrency, formatDate, timeAgo, cn } from '../lib/utils';
import { useTranslation } from '../lib/i18n';
import CustomerDetail from './CustomerDetail';

const CustomersList: React.FC = () => {
  const { customers, deals, language } = useCRMStore();
  const { t } = useTranslation(language);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loyaltyFilter, setLoyaltyFilter] = useState<LoyaltyStatus | 'All'>('All');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm);
      
      const matchesLoyalty = loyaltyFilter === 'All' || c.loyaltyStatus === loyaltyFilter;
      
      return matchesSearch && matchesLoyalty;
    });
  }, [customers, searchTerm, loyaltyFilter]);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Company,Email,Phone,Revenue,Since\n"
      + customers.map(c => `${c.name},${c.company},${c.email},${c.phone},${c.totalRevenue},${c.customerSince}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "SimpleCRM_Customers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (selectedCustomerId) {
    return <CustomerDetail customerId={selectedCustomerId} onBack={() => setSelectedCustomerId(null)} />;
  }

  const getLoyaltyStyles = (status: LoyaltyStatus) => {
    switch(status) {
      case 'VIP': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Inactive': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'New': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('customers')}</h1>
          <p className="text-slate-500 text-sm font-medium">Manage your successfully converted business partners.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleExport}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('totalCustomers'), value: customers.length, icon: CheckCircle2, color: 'text-success' },
          { label: 'VIP Partners', value: customers.filter(c => c.loyaltyStatus === 'VIP').length, icon: Star, color: 'text-amber-500' },
          { label: 'Active This Month', value: customers.filter(c => c.loyaltyStatus === 'Active').length, icon: Clock, color: 'text-blue-500' },
          { label: 'Retention Value', value: formatCurrency(customers.reduce((acc, c) => acc + c.totalRevenue, 0)), icon: IndianRupee, color: 'text-success' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl bg-slate-50", stat.color)}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Customer List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div 
            key={customer.id} 
            onClick={() => setSelectedCustomerId(customer.id)}
            className="bg-white border border-slate-100 rounded-[32px] p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <img src={customer.avatar} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" alt={customer.name} />
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight group-hover:text-success transition-colors">{customer.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{customer.company}</p>
                </div>
              </div>
              <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-bold border uppercase tracking-wider", getLoyaltyStyles(customer.loyaltyStatus))}>
                {customer.loyaltyStatus}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-50">
              <div className="text-left">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('value')}</p>
                <p className="font-heading font-bold text-success text-lg">{formatCurrency(customer.totalRevenue)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomersList;
