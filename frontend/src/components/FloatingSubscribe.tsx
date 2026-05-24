import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FloatingSubscribe() {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate('/subscribe')}
      className="fixed bottom-8 right-8 bg-groww hover:bg-groww-dark text-background font-bold px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 transition-transform hover:scale-105 z-40"
    >
      <Mail size={20} />
      Get Weekly Report
    </button>
  );
}
