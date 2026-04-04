import { useState, useEffect, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { HeaderNotifications } from '@/components/dashboard/HeaderNotifications';
import { Search, User, Settings, LogOut, ClipboardList } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchDraft, setSearchDraft] = useState('');

  const sensorsQ = location.pathname === '/sensors' ? (searchParams.get('q') ?? '') : '';

  useEffect(() => {
    setSearchDraft(sensorsQ);
  }, [sensorsQ]);

  const runSearch = useCallback(
    (raw: string) => {
      const q = raw.trim();
      if (!q) {
        toast.message('Search', { description: 'Type a sensor name, code, or location, then press Enter.' });
        return;
      }
      navigate(`/sensors?q=${encodeURIComponent(q)}`);
      toast.success('Search applied', { description: `Filtering sensors for “${q}”.` });
    },
    [navigate],
  );

  const onSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    runSearch(searchDraft);
  };

  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runSearch(searchDraft);
    }
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background font-sans text-foreground selection:bg-primary/15">
      <div className="z-20 h-full shrink-0 border-r border-border bg-sidebar">
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="z-10 shrink-0 border-b border-border/40 bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80">
          <div className="flex h-[3.25rem] items-center gap-4 px-4 sm:px-5">
            <form className="flex min-w-0 flex-1 items-center gap-3" onSubmit={onSearchSubmit}>
              <div className="relative w-full max-w-md min-w-0">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  name="q"
                  placeholder="Search sensors, alerts, routes…"
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  className="h-9 w-full rounded-md border border-border bg-muted/30 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/25 focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary/20"
                  autoComplete="off"
                />
              </div>
            </form>

            <div className="flex shrink-0 items-center gap-1.5">
              <HeaderNotifications />

              <div className="mx-0.5 hidden h-5 w-px bg-border sm:block" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-md py-1 pl-1 pr-1.5 text-left transition-colors hover:bg-muted/60 sm:pr-2"
                  >
                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-medium leading-tight text-foreground">Operations</p>
                      <p className="text-2xs text-muted-foreground">Orivon Edge</p>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-primary">
                      <User className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">Operations console</p>
                    <p className="text-xs text-muted-foreground">Signed in (demo)</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      System configuration
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dispatcher" className="cursor-pointer">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Work orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => {
                      toast.message('Session ended', { description: 'Returning to sign-in (demo).' });
                      navigate('/login');
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
