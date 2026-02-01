import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './lib/auth.tsx';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import LeadList from './components/LeadList.tsx';
import CustomersList from './components/CustomersList.tsx';
import DealsKanban from './components/DealsKanban.tsx';
import Login from './components/Login.tsx';
import LandingPage from './components/LandingPage.tsx';
import ExportModal from './components/ExportModal.tsx';
import ImportModal from './components/ImportModal.tsx';
import { ListSkeleton, CardSkeleton, Skeleton } from './components/Skeleton.tsx';
import {
  User,
  Building,
  Settings2,
  Target,
  Briefcase,
  Database,
  Info,
  Camera,
  Plus,
  Download,
  Upload,
  Mail,
  ChevronDown,
  ChevronUp,
  Moon,
  Sun,
  Globe,
  CheckCircle2,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Clock,
  X
} from 'lucide-react';
import { cn, formatDate } from './lib/utils.ts';
import { useCRMStore } from './lib/store.ts';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarView = lazy(() => import('./components/CalendarView.tsx'));
const TaskList = lazy(() => import('./components/TaskList.tsx'));
const Reports = lazy(() => import('./components/Reports.tsx'));
const TeamManagement = lazy(() => import('./components/TeamManagement.tsx'));

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [authView, setAuthView] = useState<'landing' | 'login'>('landing');

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <Zap size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary fill-current" />
        </div>
        <p className="mt-6 text-slate-500 font-heading font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Initializing Prototype...</p>
      </div>
    );
  }

  if (!user) {
    if (authView === 'login') {
      return <Login onBack={() => setAuthView('landing')} />;
    }
    return <LandingPage onLogin={() => setAuthView('login')} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'calendar':
        return (
          <Suspense fallback={<div className="p-8"><CardSkeleton /><div className="grid grid-cols-7 gap-4 mt-8">{[...Array(28)].map((_, i) => <Skeleton key={i} className="aspect-square" />)}</div></div>}>
            <CalendarView />
          </Suspense>
        );
      case 'tasks':
        return (
          <Suspense fallback={<div className="p-8"><ListSkeleton /></div>}>
            <TaskList />
          </Suspense>
        );
      case 'leads': return <LeadList />;
      case 'customers': return <CustomersList />;
      case 'deals': return <DealsKanban />;
      case 'reports':
        return (
          <Suspense fallback={<div className="p-8 space-y-8"><Skeleton className="h-20 w-full" /><div className="grid grid-cols-2 gap-8"><Skeleton className="h-[400px]" /><Skeleton className="h-[400px]" /></div></div>}>
            <Reports />
          </Suspense>
        );
      case 'team':
        return (
          <Suspense fallback={<div className="p-8"><ListSkeleton /></div>}>
            <TeamManagement />
          </Suspense>
        );
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    language, setLanguage,
    notificationSettings, updateNotificationSettings,
    leads, customers, auditLogs, deleteAccount,
    userProfile, updateUserProfile,
    businessInfo, updateBusinessInfo,
    leadSources, setLeadSources,
    dealStages, setDealStages
  } = useCRMStore();

  const [isDarkMode, setIsDarkMode] = useState(
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  const [isExportAllOpen, setIsExportAllOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importType, setImportType] = useState<'Leads' | 'Customers' | 'Deals'>('Leads');

  const [profileForm, setProfileForm] = useState(userProfile);
  const [businessForm, setBusinessForm] = useState(businessInfo);
  const [newSource, setNewSource] = useState('');
  const [newStage, setNewStage] = useState('');

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    profile: true, business: false, prefs: false, security: false, sources: false, stages: false, data: false, about: false
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveProfile = () => {
    updateUserProfile(profileForm);
    alert("Profile settings updated!");
  };

  const handleSaveBusiness = () => {
    updateBusinessInfo(businessForm);
    alert("Business information updated!");
  };

  const handleAddSource = () => {
    if (newSource.trim() && !leadSources.includes(newSource.trim())) {
      setLeadSources([...leadSources, newSource.trim()]);
      setNewSource('');
    }
  };

  const handleRemoveSource = (s: string) => {
    setLeadSources(leadSources.filter(item => item !== s));
  };

  const handleAddStage = () => {
    if (newStage.trim() && !dealStages.includes(newStage.trim())) {
      setDealStages([...dealStages, newStage.trim()]);
      setNewStage('');
    }
  };

  const handleRemoveStage = (s: string) => {
    setDealStages(dealStages.filter(item => item !== s));
  };

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const Section = ({ id, title, icon: Icon, children }: any) => {
    const isOpen = openSections[id];
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-6 lg:p-8 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Icon size={20} />
            </div>
            <h3 className="text-xl font-bold dark:text-white">{title}</h3>
          </div>
          {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 lg:p-8 pt-0 border-t border-slate-50 dark:border-slate-800">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-10 px-2">
        <h1 className="text-4xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full text-xs font-bold uppercase tracking-widest">
          <ShieldCheck size={14} /> Secure Session Active
        </div>
      </div>

      <Section id="profile" title="My Profile" icon={User}>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative group cursor-pointer shrink-0">
              <img src={user?.avatar} className="w-32 h-32 rounded-[40px] border-4 border-slate-100 dark:border-slate-800 shadow-md group-hover:opacity-80 transition-all" alt="Profile" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <div className="bg-black/50 text-white p-2 rounded-full">
                  <Camera size={20} />
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 dark:text-white border-2 border-transparent focus:border-primary transition-all"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-slate-300">Email (Read-only)</label>
                  <input
                    className="w-full p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl outline-none text-slate-400 cursor-not-allowed border-2 border-transparent"
                    value={user?.email}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={handleSaveProfile} className="px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              Save Profile
            </button>
          </div>
        </div>
      </Section>

      <Section id="prefs" title="App Preferences" icon={Settings2}>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Language</p>
              <p className="text-xs text-slate-400">Current: {language === 'en' ? 'English' : 'हिंदी'}</p>
            </div>
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-primary flex items-center gap-2"
            >
              <Globe size={14} /> {language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-6">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Theme Mode</p>
              <p className="text-xs text-slate-400">Current: {isDarkMode ? 'Dark' : 'Light'}</p>
            </div>
            <button onClick={toggleTheme} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </Section>

      <Section id="data" title="Data Management" icon={Database}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setIsExportAllOpen(true)}
              className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 text-left group hover:border-primary transition-all"
            >
              <Download size={24} className="text-slate-400 group-hover:text-primary mb-3" />
              <p className="text-sm font-bold dark:text-white">Export Demo Data</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase">Local Backup (CSV/XLS)</p>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-red-600 flex items-center gap-2"><AlertTriangle size={16} /> Danger Zone</h4>
                <p className="text-xs text-red-400 font-medium">Reset prototype data to default state.</p>
              </div>
              <button
                onClick={() => { if (confirm("Reset entire session?")) deleteAccount(); }}
                className="px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-bold shadow-lg"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      </Section>

      <Section id="about" title="Prototype Info" icon={Info}>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold">P</div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">SimpleCRM v1.2 Prototype</h4>
              </div>
              <p className="text-xs font-medium text-slate-500">Stable Build • October 2024</p>
            </div>
          </div>
          <p className="text-center text-[10px] font-medium text-slate-400">© 2024 SimpleCRM. Built for demonstration purposes only.</p>
        </div>
      </Section>

      <AnimatePresence>
        {isExportAllOpen && (
          <ExportModal
            onClose={() => setIsExportAllOpen(false)}
            title="Full CRM Export"
            filename="SimpleCRM_Demo_Export"
            data={leads.map(l => ({ ...l, RecordType: 'Lead' })).concat(customers.map(c => ({ ...c, RecordType: 'Customer' })) as any)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;