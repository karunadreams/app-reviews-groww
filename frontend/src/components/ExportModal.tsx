import { X, FileText, FileDown, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { generatePulseMarkdown } from '../utils/exportTemplate';

export default function ExportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [showToast, setShowToast] = useState('');
  const [loadingType, setLoadingType] = useState<string | null>(null);

  if (!isOpen) return null;

  const pulseContent = generatePulseMarkdown();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleSendEmail = async () => {
    if (!email) return;
    setLoadingType('email');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 seconds timeout for Railway
    try {
      const res = await fetch(`${API_URL}/api/export/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, content: pulseContent }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        setShowToast('Report sent successfully!');
        setTimeout(() => {
          setShowToast('');
          onClose();
        }, 2000);
      } else {
        alert('Failed to send email. Check server logs.');
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        alert('Request timed out. The Python server might be sleeping or taking too long, please try again.');
      } else {
        alert('Error connecting to backend API.');
      }
    } finally {
      setLoadingType(null);
    }
  };

  const handleDownloadPDF = async () => {
    setLoadingType('pdf');
    try {
      const { marked } = await import('marked');
      const htmlContent = await marked.parse(pulseContent);
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Groww App Review Insights</title>
              <style>
                body { 
                  font-family: 'Segoe UI', Arial, sans-serif; 
                  line-height: 1.6; 
                  color: #333; 
                  padding: 40px; 
                  max-width: 800px; 
                  margin: 0 auto; 
                }
                h1, h2, h3 { color: #111; margin-top: 1.5em; }
                h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
                blockquote { 
                  border-left: 4px solid #00D09C; 
                  padding-left: 15px; 
                  font-style: italic; 
                  color: #555; 
                  background: #f9f9f9;
                  padding: 10px 15px;
                  margin-left: 0;
                }
                ul { padding-left: 20px; }
                li { margin-bottom: 10px; }
              </style>
            </head>
            <body>
              ${htmlContent}
              <script>
                window.onload = () => {
                  window.print();
                  setTimeout(() => window.close(), 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      
      setShowToast('PDF Print Dialog Opened!');
      setTimeout(() => {
        setShowToast('');
        onClose();
      }, 2000);
    } catch (e) {
      alert('Failed to generate PDF document.');
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div id="export-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="groww-card w-full max-w-md relative bg-card">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-text">
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold mb-6">Export Report</h2>
        
        <div className="space-y-4">
          <button 
            onClick={handleDownloadPDF}
            disabled={loadingType !== null}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              {loadingType === 'pdf' ? <Loader2 className="animate-spin text-groww" size={24} /> : <FileDown className="text-groww" size={24} />}
              <div className="text-left">
                <div className="font-semibold">Download as PDF</div>
                <div className="text-xs text-muted">Saves the current dashboard view</div>
              </div>
            </div>
          </button>

          <div className="p-4 rounded-xl border border-white/10 bg-black/20">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="text-purple-400" size={24} />
              <div className="text-left">
                <div className="font-semibold">Send to Email</div>
                <div className="text-xs text-muted">Send directly to your inbox</div>
              </div>
            </div>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="your@email.com" 
                className="flex-1 bg-background border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-groww"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loadingType !== null}
              />
              <button 
                onClick={handleSendEmail}
                disabled={loadingType !== null}
                className="bg-groww hover:bg-groww-dark text-background font-semibold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                {loadingType === 'email' ? <Loader2 className="animate-spin" size={16} /> : null}
                Send Now
              </button>
            </div>
          </div>
        </div>

        {/* Inline Toast Notification */}
        {showToast && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold shadow-lg animate-bounce whitespace-nowrap">
            <CheckCircle size={16} /> {showToast}
          </div>
        )}
      </div>
    </div>
  );
}
