import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Briefcase,
  Zap,
  Settings,
  Menu,
  X,
  LogOut,
  Search,
  Plus,
  Bell,
  BarChart3,
  ChevronRight,
  WifiOff,
  Moon,
  Sun,
  Keyboard,
  Download,
  Mail,
  Calendar,
  ClipboardList,
  ChevronDown,
  Shield
} from 'lucide-react';
import { useAuth } from '../lib/auth.tsx';
import { useCRMStore } from '../lib/store.ts';
import { useTranslation } from '../lib/i18n.ts';
import { cn } from '../lib/utils.ts';
import GlobalSearchModal from './GlobalSearchModal.tsx';
import { NotificationBell } from './NotificationSystem.tsx';
import ShortcutsHelpModal from './ShortcutsHelpModal.tsx';
import LeadForm from './LeadForm.tsx';
import EmailComposeDrawer from './EmailComposeDrawer.tsx';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { user, logout } = useAuth();
  const { language, notifications, leads } = useCRMStore();
  const { t } = useTranslation(language);

  const menuItems = useMemo(() => [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList },
    { id: 'leads', label: t('leads'), icon: UserPlus },
    { id: 'customers', label: t('customers'), icon: Users },
    { id: 'deals', label: t('deals'), icon: Briefcase },
    { id: 'reports', label: t('reports'), icon: BarChart3 },
    ...(user?.role === 'Owner' ? [{ id: 'team', label: 'Team', icon: Shield }] : []),
  ], [t, user]);

  const toggleDarkMode = () => {
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

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    if (localStorage.getItem('theme') === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Professional Slim Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-30 shadow-sm",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-1.5 rounded-lg shrink-0 shadow-md">
              <Zap size={18} fill="currentColor" />
            </div>
            {isSidebarOpen && <span className="font-heading font-bold text-lg tracking-tight truncate">SimpleCRM</span>}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                activeTab === item.id
                  ? "bg-slate-100 dark:bg-slate-800 text-primary font-semibold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
            >
              <item.icon size={20} className={cn(activeTab === item.id ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
              {isSidebarOpen && <span className="text-sm">{String(item.label)}</span>}
              {activeTab === item.id && isSidebarOpen && <div className="ml-auto w-1 h-4 bg-primary rounded-full"></div>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className={cn("flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50", !isSidebarOpen && "justify-center")}>
            <img src={user?.avatar} className="w-8 h-8 rounded-lg object-cover shrink-0" alt="" />
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className={cn("w-full flex items-center gap-3 px-3 py-2.5 mt-2 text-slate-500 hover:text-red-600 rounded-xl transition-all", !isSidebarOpen && "justify-center")}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="text-sm font-medium">Log out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        {!isOnline && (
          <div className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest py-1.5 text-center flex items-center justify-center gap-2">
            <WifiOff size={12} /> Connectivity Interrupted
          </div>
        )}

        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden lg:block text-slate-400 hover:text-slate-900 transition-colors">
              <Menu size={20} />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <Zap size={20} className="text-primary" fill="currentColor" />
              <span className="font-heading font-bold text-lg">SimpleCRM</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="uppercase tracking-widest">Dashboard</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 dark:text-white uppercase tracking-widest">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsSearchOpen(true)} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-xs text-slate-400 hover:bg-white dark:hover:bg-slate-900 transition-all w-48 md:w-64 group">
              <Search size={16} />
              <span className="flex-1 text-left">Search anything...</span>
              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded border bg-white dark:bg-slate-950 font-mono text-[10px]">⌘K</kbd>
            </button>

            <div className="flex items-center gap-2 border-l border-slate-100 dark:border-slate-800 pl-4">
              <button onClick={() => setIsHelpOpen(true)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Keyboard size={20} />
              </button>
              <button onClick={toggleDarkMode} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <NotificationBell />
            </div>

            <button
              onClick={() => setIsLeadFormOpen(true)}
              className="hidden md:flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
            >
              <Plus size={18} /> New Lead
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Navigation */}
        <nav className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-around pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl">
          {[
            { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
            { id: 'leads', label: 'Leads', icon: UserPlus },
            { id: 'deals', label: 'Deals', icon: Briefcase },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                activeTab === item.id ? "text-primary" : "text-slate-400"
              )}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {isSearchOpen && <GlobalSearchModal onClose={() => setIsSearchOpen(false)} onSelect={(type, id) => setActiveTab(type)} />}
      {isHelpOpen && <ShortcutsHelpModal onClose={() => setIsHelpOpen(false)} />}
      {isLeadFormOpen && <LeadForm onClose={() => setIsLeadFormOpen(false)} />}
    </div>
  );
};

export default Layout;