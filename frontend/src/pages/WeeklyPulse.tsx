import { Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { generatePulseMarkdown } from '../utils/exportTemplate';

export default function WeeklyPulse() {
  const [copied, setCopied] = useState(false);

  const pulseContent = generatePulseMarkdown();

  const handleCopy = () => {
    navigator.clipboard.writeText(pulseContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 pb-8 max-w-4xl mx-auto">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Weekly Pulse summary</h1>
          <p className="text-muted">AI-generated executive summary for W23.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 bg-card border border-white/10 hover:bg-white/5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {copied ? <CheckCircle size={16} className="text-groww" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
        </div>
      </div>

      {/* Document Preview */}
      <div className="groww-card bg-[#0A0A0F] text-text p-10 relative overflow-hidden border border-white/10 font-sans">
        <div className="absolute top-0 left-0 w-full h-2 bg-groww"></div>
        
        <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Weekly Pulse</h2>
            <div className="text-muted">Groww App Review Insights Analyser</div>
          </div>
          <div className="text-right">
            <div className="font-medium">W23 / 2026</div>
            <div className="text-muted text-sm">Strictly Confidential</div>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-bold border-b border-white/10 pb-2 mb-4">Executive Summary</h3>
            <p className="leading-relaxed text-muted">
              This week, user sentiment remained largely stable with a slight positive shift (+2%) driven by the recent Portfolio UI update. However, critical friction remains in the onboarding flow due to prolonged KYC verification times. App stability during market open continues to be the highest severity issue.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold border-b border-white/10 pb-2 mb-4">Top Themes & Verbatim Insights</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-lg flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-groww/20 text-groww flex items-center justify-center text-sm">1</span>
                  Onboarding & KYC (28% Volume)
                </h4>
                <div className="ml-8 mt-2 space-y-3">
                  <p className="text-sm font-medium text-muted">Sentiment: Mixed</p>
                  <blockquote className="border-l-4 border-groww/50 pl-4 py-1 italic text-muted">
                    "KYC verification took 4 days. Unacceptable in 2026."
                  </blockquote>
                  <blockquote className="border-l-4 border-groww/50 pl-4 py-1 italic text-muted">
                    "Smooth account creation, but Aadhaar linking failed twice."
                  </blockquote>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-sm">2</span>
                  Authentication Issues (15% Volume)
                </h4>
                <div className="ml-8 mt-2 space-y-3">
                  <p className="text-sm font-medium text-muted">Sentiment: Mostly Negative</p>
                  <blockquote className="border-l-4 border-red-500/50 pl-4 py-1 italic text-muted">
                    "Biometric login randomly gets disabled after every update."
                  </blockquote>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold border-b border-white/10 pb-2 mb-4">Actionable Next Steps</h3>
            <ul className="list-decimal pl-5 space-y-3 text-muted">
              <li><strong className="text-text">Engineering:</strong> Investigate server scaling or caching mechanisms specifically for the 9:15 AM - 9:30 AM load spike to prevent session timeouts.</li>
              <li><strong className="text-text">Product & Ops:</strong> Audit the current KYC pipeline; identify the bottleneck causing the 4-day delay and implement an automatic fallback for Aadhaar failures.</li>
              <li><strong className="text-text">Design:</strong> Capitalize on the positive reception of the dark mode UI by applying similar aesthetic principles to the Options Trading screen.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
