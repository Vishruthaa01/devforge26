import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Cpu, Network, Shield, ScrollText, AlertTriangle } from 'lucide-react';

export default function EnterpriseLayout() {
  const location = useLocation();

  const socNavItems = [
    { name: 'Gateway Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'AI Bots (Simulator)', path: '/agents', icon: Cpu },
    { name: 'API Perimeter', path: '/apis', icon: Network },
    { name: 'Security Policies', path: '/policies', icon: Shield },
    { name: 'Audit Logs', path: '/audit-logs', icon: ScrollText },
    { name: 'Alert Center', path: '/security-alerts', icon: AlertTriangle },
  ];

  const businessNavItems = [
    { name: 'Customers (CRM)', path: '/enterprise/customers', icon: LayoutDashboard },
    { name: 'Analytics & Sales', path: '/enterprise/analytics', icon: ScrollText }
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <ShieldCheck className="text-blue-500" size={28} />
          <h1 className="font-bold text-white text-sm leading-tight tracking-wide">
            AI AGENT<br/>SECURITY GATEWAY
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">Gateway Control</div>
          <nav className="px-3 space-y-1 mb-6">
            {socNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                    isActive ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">Nexora Business Apps</div>
          <nav className="px-3 space-y-1">
            {businessNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                    isActive ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
          SOC Enterprise v1.0.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center px-6 justify-between shadow-sm z-10">
          <h2 className="text-lg font-bold text-slate-800">
            {[...socNavItems, ...businessNavItems].find(i => i.path === location.pathname)?.name || 'Platform'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              SYSTEM ONLINE
            </span>
            <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
