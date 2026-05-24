import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function Subscribe() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [includeQuotes, setIncludeQuotes] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
    }, 4000);
  };

  return (
    <div className="flex flex-col gap-6 pb-8 max-w-6xl mx-auto h-full min-h-[80vh]">
      <div className="mb-2">
        <h1 className="text-2xl font-bold mb-2">Subscribe to Weekly Pulse</h1>
        <p className="text-muted">Get AI-generated executive summaries delivered straight to your inbox.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start h-full">
        {/* Left Form Form */}
        <div className="lg:col-span-2 groww-card">
          <div className="w-12 h-12 rounded-full bg-groww/10 flex items-center justify-center text-groww mb-6">
            <Mail size={24} />
          </div>
          
          <h2 className="text-xl font-bold mb-2">Automated Delivery</h2>
          <p className="text-sm text-muted mb-8 leading-relaxed">
            Every Friday at 5:00 PM, the system ingests the latest week's reviews, runs them through the LLM pipeline, and sends a concise executive summary to your team.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@groww.in" 
                className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-groww transition-colors"
              />
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <input 
                type="checkbox" 
                id="quotes"
                checked={includeQuotes}
                onChange={(e) => setIncludeQuotes(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 text-groww focus:ring-groww bg-background accent-groww cursor-pointer"
              />
              <label htmlFor="quotes" className="text-sm text-text cursor-pointer">
                Include verbatim user quotes
              </label>
            </div>

            <button 
              type="submit"
              className="w-full bg-groww hover:bg-groww-dark text-background font-bold py-3 rounded-lg transition-colors mt-4 relative overflow-hidden"
            >
              Subscribe Now
              
              {/* Submission Animation Overlay */}
              {submitted && (
                <div className="absolute inset-0 bg-groww flex items-center justify-center gap-2 animate-pulse">
                  <CheckCircle size={20} />
                  <span>Subscribed!</span>
                </div>
              )}
            </button>
          </form>
          
          {submitted && (
            <div className="mt-4 p-3 rounded-lg bg-groww/10 border border-groww/20 text-groww text-sm font-medium flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle size={16} />
              You'll receive your first Weekly Pulse this Friday!
            </div>
          )}
        </div>

        {/* Right side Email Preview */}
        <div className="hidden lg:block relative lg:col-span-3 h-full">
          <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 ml-2">Email Preview</h2>
          
          <div className="groww-card bg-[#0A0A0F] p-0 overflow-hidden shadow-2xl border border-white/10 relative z-10 h-full">
            {/* Mock Email Header */}
            <div className="bg-[#111827] px-6 py-4 flex flex-col gap-1 border-b border-white/10">
              <div className="text-sm font-bold text-text">Subject: 📊 Groww Weekly Pulse — W23 Insights</div>
              <div className="text-xs text-muted">From: Groww Intelligence &lt;pulse@analytics.groww.in&gt;</div>
            </div>
            
            {/* Mock Email Body */}
            <div className="p-8 font-sans text-text">
              <h2 className="text-2xl font-bold text-text mb-4">Hello Team,</h2>
              <p className="mb-6 leading-relaxed text-muted">
                Here is your weekly summary of App Store and Play Store reviews. Sentiment is up by 2% this week! Here are the top drivers:
              </p>
              
              <div className="bg-[#111827] p-5 rounded-lg border border-white/10 mb-6 border-l-4 border-l-groww">
                <h3 className="font-bold mb-2">1. Portfolio UI Reception</h3>
                {includeQuotes && (
                  <p className="italic text-sm text-muted border-l-2 border-white/20 pl-3 mb-2">
                    "Absolutely love the new dark mode portfolio tracking UI. It's so clean!"
                  </p>
                )}
                <div className="flex items-start gap-2 mt-3 text-sm text-muted">
                  <ArrowRight size={16} className="text-groww mt-0.5 shrink-0" />
                  <strong className="text-text">Action:</strong> Apply similar aesthetic principles to Options Trading screen.
                </div>
              </div>

              <div className="bg-[#111827] p-5 rounded-lg border border-white/10 border-l-4 border-l-red-500">
                <h3 className="font-bold mb-2">2. Market Open App Crashes</h3>
                {includeQuotes && (
                  <p className="italic text-sm text-muted border-l-2 border-white/20 pl-3 mb-2">
                    "App hangs immediately at 9:15 AM every single day."
                  </p>
                )}
                <div className="flex items-start gap-2 mt-3 text-sm text-muted">
                  <ArrowRight size={16} className="text-groww mt-0.5 shrink-0" />
                  <strong className="text-text">Action:</strong> Investigate server scaling for 9:15 AM - 9:30 AM load spike.
                </div>
              </div>

              <div className="text-xs text-muted pt-6 border-t border-white/10 mt-8">
                Generated securely by Groww Internal Tooling.
              </div>
            </div>
          </div>
          
          {/* Decorative background blob */}
          <div className="absolute -inset-4 bg-gradient-to-r from-groww/20 to-purple-500/20 blur-2xl -z-10 rounded-full opacity-50"></div>
        </div>
      </div>
    </div>
  );
}
