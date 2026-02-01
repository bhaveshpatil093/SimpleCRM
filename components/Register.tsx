
import React, { useState } from 'react';
import { Zap, Mail, Lock, User, Building, ChevronRight, Loader2, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface RegisterProps {
  onBack: () => void;
  onGoToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onBack, onGoToLogin }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert("Registration logic is simulated for this Bharat Edition Demo. Please use the 'Quick Demo' logins on the login page.");
      onGoToLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Sidebar: Branding */}
      <div className="w-full lg:w-[450px] bg-slate-900 p-8 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="relative z-10">
            <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-12 group">
               <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
               <span className="font-bold text-sm">Back to Home</span>
            </button>
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-primary p-2 rounded-xl">
                <Zap size={24} fill="currentColor" />
              </div>
              <span className="font-heading font-black text-2xl tracking-tight">SimpleCRM</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-heading font-black leading-[1.1] mb-8">Empower your <br />Sales Force.</h1>
            <div className="space-y-6">
               <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/10 rounded-lg text-success shrink-0"><CheckCircle2 size={18} /></div>
                  <p className="text-sm font-medium text-white/70 leading-relaxed">No setup fees. No hidden costs. Designed for rapid growth.</p>
               </div>
               <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/10 rounded-lg text-success shrink-0"><CheckCircle2 size={18} /></div>
                  <p className="text-sm font-medium text-white/70 leading-relaxed">Instant lead import from Excel or CSV.</p>
               </div>
            </div>
         </div>
         <div className="relative z-10 pt-10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enterprise Trust</p>
            <div className="flex gap-4 mt-3 opacity-50 grayscale hover:grayscale-0 transition-all">
               <div className="w-8 h-8 rounded bg-white/20"></div>
               <div className="w-8 h-8 rounded bg-white/20"></div>
               <div className="w-8 h-8 rounded bg-white/20"></div>
            </div>
         </div>
      </div>

      {/* Main Form */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center p-8 lg:p-24 relative">
         <div className="w-full max-w-md">
            <div className="mb-10">
               <h2 className="text-3xl font-heading font-black text-slate-900 mb-2">Create Account</h2>
               <p className="text-slate-500 font-medium">Join Bharat's growing business ecosystem.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                     <div className="relative group">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold" placeholder="Rahul" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                     <input className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold" placeholder="Sharma" />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                  <div className="relative group">
                     <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                     <input className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold" placeholder="My Enterprise Pvt Ltd" />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                  <div className="relative group">
                     <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                     <input type="email" className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold" placeholder="rahul@business.in" />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative group">
                     <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                     <input type="password" className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold" placeholder="••••••••" />
                  </div>
               </div>

               <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-5 bg-primary text-white rounded-[24px] font-black text-lg shadow-2xl shadow-primary/25 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <>Complete Registration <ChevronRight size={20} /></>}
                  </button>
               </div>
            </form>

            <div className="mt-10 text-center">
               <p className="text-sm text-slate-500 font-medium">Already have an account?</p>
               <button onClick={onGoToLogin} className="mt-2 text-primary font-black hover:underline">Sign In Instead</button>
            </div>
         </div>

         <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            <ShieldCheck size={14} /> SECURE ENCRYPTED REGISTRATION
         </div>
      </div>
    </div>
  );
};

export default Register;
