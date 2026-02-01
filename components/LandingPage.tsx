import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  MessageCircle,
  Target,
  ArrowRight,
  Sparkles,
  BarChart3,
  Rocket,
  Shield,
  Check
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="text-xl font-heading font-bold tracking-tight">SimpleCRM</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'AI Insights', 'Security'].map((item) => (
              <a key={item} href="#" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onLogin} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-all">
              Sign In to Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Modern Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-slate-50 to-white dark:from-primary/10 dark:via-slate-950 dark:to-slate-950 -z-10" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 text-primary text-xs font-bold uppercase tracking-wider mb-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <Sparkles size={14} /> Prototype Edition • Beta Access
              </div>

              <h1 className="text-4xl lg:text-5xl font-heading font-bold text-slate-900 dark:text-white leading-tight mb-6 tracking-tight">
                The high-performance <br />
                <span className="text-primary relative whitespace-nowrap">
                  sales engine
                  <svg className="absolute -bottom-1 left-0 w-full h-2 text-primary/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span> for Bharat.
              </h1>

              <p className="text-base lg:text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-lg">
                Experience how SimpleCRM combines Google Gemini AI with high-velocity workflows. Explore the interactive prototype and see the future of Indian sales.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={onLogin}
                  className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-600 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  Launch Demo Dashboard <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => { }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:shadow-sm"
                >
                  Documentation
                </button>
              </div>

              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-950 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold shadow-sm">U{i}</div>)}
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  Reviewing the <span className="text-slate-900 dark:text-white font-bold">v1.2 Prototype</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-[8px] border-white dark:border-slate-900 shadow-primary/20">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
                  alt="Analytics Dashboard"
                  className="w-full object-cover scale-105 hover:scale-100 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-6">Designed for elite performance.</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Every feature in this prototype is meticulously crafted to showcase rapid sales acceleration.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Target}
              title="Intelligent Scoring"
              description="Gemini AI analyzes engagement patterns to automatically prioritize your most valuable opportunities."
            />
            <FeatureCard
              icon={MessageCircle}
              title="WhatsApp Native"
              description="Built-in templates and automation for India's favorite communication channel. Engage where your customers live."
            />
            <FeatureCard
              icon={BarChart3}
              title="Predictive Analytics"
              description="Advanced forecasting helps you understand tomorrow's revenue today, giving you the edge in planning."
            />
            <FeatureCard
              icon={Shield}
              title="Secure & Compliant"
              description="Enterprise-grade data encryption and role-based access to keep your sensitive pipeline data private."
            />
            <FeatureCard
              icon={Rocket}
              title="High Velocity"
              description="Zero-lag interface optimized for rapid data entry. Capture leads from any source in seconds."
            />
            <FeatureCard
              icon={Check}
              title="Automated Follow-ups"
              description="Never let a lead go cold. Intelligent reminders and task management keep you moving forward."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto bg-primary rounded-3xl p-10 lg:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold mb-6 tracking-tight">Ready to explore the pipeline?</h2>
            <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto">Access the full demo account and explore the capabilities of Bharat's most advanced CRM prototype.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={onLogin} className="px-8 py-3 bg-white text-primary rounded-lg font-bold text-base hover:bg-slate-50 transition-all shadow-lg hover:-translate-y-0.5">Launch Demo Dashboard</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-primary" />
            <span className="text-lg font-bold">SimpleCRM</span>
          </div>
          <p className="text-sm text-slate-500 font-medium">© 2024 SimpleCRM Solutions • Prototype v1.2</p>
          <div className="flex gap-8">
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-primary">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: any, title: string, description: string }> = ({ icon: Icon, title, description }) => (
  <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-glow hover:border-primary/30 transition-all duration-300 group">
    <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 mb-4 group-hover:scale-105">
      <Icon size={20} />
    </div>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;