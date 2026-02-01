import React, { useState } from 'react';
import { useAuth } from '../lib/auth.tsx';
import { Zap, Mail, Lock, Loader2, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onBack }) => {
  const { login, isLocked } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Invalid credentials.');
      setIsSubmitting(false);
    }
  };

  const setDemo = (e: string) => {
    setEmail(e);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left side: Form */}
      <div className="w-full lg:w-[500px] bg-white dark:bg-slate-900 p-8 md:p-16 flex flex-col justify-center shadow-2xl z-10 animate-in slide-in-from-left duration-700">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-12 group self-start">
           <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
           <span className="font-bold text-sm">Back to Home</span>
        </button>

        <div className="mb-12 flex items-center gap-3">
          <div className="bg-primary text-white p-2.5 rounded-xl shadow-lg shadow-primary/30">
            <Zap size={28} fill="currentColor" />
          </div>
          <div>
            <span className="font-heading font-bold text-2xl text-slate-900 dark:text-white tracking-tight block leading-none">SimpleCRM</span>
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1 block">Prototype Instance</span>
          </div>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-heading font-bold text-slate-900 dark:text-white mb-3">Demo Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Use the quick access buttons below to explore the prototype roles.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-2xl text-sm font-medium border border-red-100 dark:border-red-900/30 flex items-start gap-3">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Account Email</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <Mail size={20} />
              </div>
              <input 
                type="email" 
                required
                disabled={isLocked}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 dark:text-white"
                placeholder="demo@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <Lock size={20} />
              </div>
              <input 
                type="password" 
                required
                disabled={isLocked}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 dark:text-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || isLocked}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/25 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                Enter Dashboard
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Select Prototype Role</span>
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {[
              { role: 'Owner', email: 'owner@business.com', icon: '👑' },
              { role: 'Manager', email: 'manager@business.com', icon: '💼' },
              { role: 'Sales', email: 'sales@business.com', icon: '🚀' }
            ].map((item) => (
              <button 
                key={item.role}
                type="button"
                disabled={isLocked}
                onClick={() => setDemo(item.email)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all group disabled:opacity-50"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary uppercase">{item.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: Visual Hero */}
      <div className="hidden lg:block flex-1 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=2070&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            alt="Secure Business District"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-slate-950/90"></div>
        </div>

        <div className="relative h-full z-10 flex flex-col justify-center p-20 text-white max-w-3xl">
           <h2 className="text-6xl font-heading font-bold mb-8 leading-tight">
             Experience <br />Modern <span className="text-primary italic">Sales.</span>
           </h2>
           <p className="text-xl text-white/80 leading-relaxed font-medium">
             This prototype showcases the full functional suite of SimpleCRM. Navigate through lead management, deal pipelines, and AI-powered insights using the pre-configured demo accounts.
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;