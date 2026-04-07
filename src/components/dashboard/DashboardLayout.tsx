import { useState, useEffect, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { HeaderNotifications } from '@/components/dashboard/HeaderNotifications';
import { MobileDashboardDock } from '@/components/dashboard/MobileDashboardDock';
import { Search, User, Settings, LogOut, ClipboardList, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { HydroSentryLogo } from '@/components/HydroSentryLogo';
import type { DashboardNavItem } from '@/lib/dashboardNav';
import { hydroSentryNavItems, isDashboardNavItemActive } from '@/lib/dashboardNav';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  /** Sidebar items for this module. */
  navItems?: DashboardNavItem[];
  /** Active matcher for sidebar items. */
  isItemActive?: (pathname: string, search: string, item: DashboardNavItem) => boolean;
  /** Sidebar brand (defaults to HydroSentry). */
  brand?: React.ReactNode;
  /** Small subtitle under brand in mobile sheet. */
  brandSubtitle?: string;
  /** Show the global search bar in the header. */
  showSearch?: boolean;
  /** Placeholder for search input. */
  searchPlaceholder?: string;
  /** Show mobile dock (HydroSentry only). */
  showMobileDock?: boolean;
}

export function DashboardLayout({
  children,
  navItems = hydroSentryNavItems,
  isItemActive = isDashboardNavItemActive,
  brand,
  brandSubtitle = 'HydroSentry command',
  showSearch = true,
  searchPlaceholder = 'Search sensors, alerts…',
  showMobileDock = true,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
      if (!showSearch) return;
      const q = raw.trim();
      if (!q) {
        toast.message('Search', { description: 'Type a sensor name, code, or location, then press Enter.' });
        return;
      }
      navigate(`/sensors?q=${encodeURIComponent(q)}`);
      toast.success('Search applied', { description: `Filtering sensors for “${q}”.` });
    },
    [navigate, showSearch],
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

  const goNav = (path: string) => {
    navigate(path);
    setMobileNavOpen(false);
  };

  return (
    <div className="flex h-[100dvh] w-full max-w-[100vw] overflow-x-hidden bg-background font-sans text-foreground selection:bg-primary/15">
      <div className="z-20 hidden h-full shrink-0 border-r border-border bg-sidebar md:block">
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          items={navItems}
          isItemActive={isItemActive}
          brand={brand}
        />
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="flex w-[min(100vw-1rem,20rem)] flex-col gap-0 p-0 sm:max-w-sm">
          <SheetHeader className="border-b border-border px-4 py-4 text-left">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            {brand ?? <HydroSentryLogo size="small" />}
            <p className="text-xs font-medium text-muted-foreground">{brandSubtitle}</p>
          </SheetHeader>
          <nav className="flex-1 overflow-y-auto p-3" aria-label="Main navigation">
            <p className="mb-2 px-2 text-2xs font-normal uppercase tracking-wide text-muted-foreground/80">
              Navigation
            </p>
            <div className="space-y-1">
              {navItems.map((item) => {
                const active = isItemActive(location.pathname, location.search, item);
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goNav(item.path)}
                    className={cn(
                      'flex min-h-12 w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-normal transition-colors',
                      active
                        ? 'bg-primary/[0.08] font-medium text-primary shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-[1.125rem] w-[1.125rem] shrink-0',
                        active ? 'text-primary' : 'text-muted-foreground',
                      )}
                      strokeWidth={1.75}
                    />
                    <span className="leading-snug">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="z-10 shrink-0 border-b border-border/40 bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80">
          <div className="flex h-12 min-h-12 items-center gap-2 px-3 sm:h-[3.25rem] sm:gap-4 sm:px-5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0 md:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </Button>

            {showSearch ? (
              <form className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3" onSubmit={onSearchSubmit}>
                <div className="relative w-full max-w-md min-w-0">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    name="q"
                    placeholder={searchPlaceholder}
                    value={searchDraft}
                    onChange={(e) => setSearchDraft(e.target.value)}
                    onKeyDown={onSearchKeyDown}
                    className="h-11 min-h-11 w-full rounded-md border border-border bg-muted/30 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/25 focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary/20 sm:h-9 sm:min-h-0"
                    autoComplete="off"
                  />
                </div>
              </form>
            ) : (
              <div className="min-w-0 flex-1" />
            )}

            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
              <HeaderNotifications />

              <div className="mx-0.5 hidden h-5 w-px bg-border sm:block" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-md py-1 pl-1 pr-1 text-left transition-colors hover:bg-muted/60 sm:min-h-0 sm:min-w-0 sm:gap-2 sm:pr-2"
                  >
                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-medium leading-tight text-foreground">Operations</p>
                      <p className="text-2xs text-muted-foreground">Orivon Edge</p>
                    </div>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-primary sm:h-8 sm:w-8">
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

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
          {children}
        </main>

        {showMobileDock ? <MobileDashboardDock onOpenMenu={() => setMobileNavOpen(true)} /> : null}
      </div>
    </div>
  );
}
