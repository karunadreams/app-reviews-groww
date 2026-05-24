import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sparkles, 
  Download, 
  Calendar,
  ChevronDown,
  Layers,
  List,
  Mail
} from 'lucide-react';
import ExportModal from './ExportModal';

export default function Layout() {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedWeeks, setSelectedWeeks] = useState(12);

  const navItems = [
    { name: 'Overview', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Theme Clustering', path: '/clusters', icon: <Layers size={20} /> },
    { name: 'Review Feed', path: '/feed', icon: <List size={20} /> },
    { name: 'Weekly Pulse', path: '/pulse', icon: <Sparkles size={20} /> },
    { name: 'Subscribe', path: '/subscribe', icon: <Mail size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-background text-text overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-white/5 flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-2 text-groww font-bold text-2xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-groww flex items-center justify-center">
              <div className="w-3 h-3 bg-card rounded-full"></div>
            </div>
            Groww
          </div>
        </div>
        
        <div className="p-4 text-xs font-semibold text-muted uppercase tracking-wider mb-2 mt-4">
          Analytics
        </div>
        
        <nav className="flex-1 px-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                  isActive 
                    ? 'bg-groww/10 text-groww' 
                    : 'text-muted hover:bg-white/5 hover:text-text'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-6 border-t border-white/5 text-xs text-muted">
          App Review Insights Analyser v2.0
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-20 bg-background/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-10 shrink-0">
          <div>
            <h1 className="text-xl font-bold">App Review Insights Analyser</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Date Range Selector */}
            <div className="relative">
              <select 
                className="appearance-none flex items-center gap-2 bg-card hover:bg-white/5 border border-white/10 px-4 py-2 pr-10 rounded-lg text-sm font-medium transition-colors cursor-pointer outline-none focus:border-groww"
                value={selectedWeeks}
                onChange={(e) => setSelectedWeeks(Number(e.target.value))}
              >
                <option value={3}>Last 3 Weeks</option>
                <option value={6}>Last 6 Weeks</option>
                <option value={9}>Last 9 Weeks</option>
                <option value={12}>Last 12 Weeks</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                <ChevronDown size={16} />
              </div>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                <Calendar size={16} />
              </div>
              <style>{`
                select { padding-left: 2.25rem; }
              `}</style>
            </div>
            
            {/* Export Button */}
            <button 
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-2 bg-groww hover:bg-groww-dark text-background px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              <Download size={16} />
              Export Report
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <Outlet context={{ weeks: selectedWeeks }} />
        </main>

        <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      </div>
    </div>
  );
}
