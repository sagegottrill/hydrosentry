import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { ReactLenis } from '@studio-freight/react-lenis';
import { Search, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ReactLenis root>
      <div className="flex min-h-screen bg-[#F8F9FA] font-sans text-slate-900 selection:bg-sky-100">
        <div className="sticky top-0 h-screen shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <DashboardSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          {/* Global Top Header (Oya Mall Architecture) */}
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl shadow-sm">
            <div className="flex h-16 items-center gap-4 px-8">
              {/* Global Functional Search */}
              <div className="flex flex-1 items-center gap-3">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    placeholder="Search operations, sensors, or alerts..."
                    className="h-10 w-full rounded-full bg-slate-100/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-500 border border-transparent focus:bg-white focus:border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Profile & Notifications */}
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative h-10 w-10 text-slate-500 hover:bg-slate-100 rounded-full">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                </Button>

                <div className="h-8 w-px bg-slate-200 mx-1" />

                <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-slate-900 leading-tight group-hover:text-[#005587] transition-colors">Command Admin</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Orivon Edge</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-[#005587]/10 flex items-center justify-center flex-shrink-0 border border-[#005587]/20 group-hover:bg-[#005587]/20 transition-colors">
                    <User className="h-5 w-5 text-[#005587]" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 pb-12">
            {children}
          </main>
        </div>
      </div>
    </ReactLenis>
  );
}
