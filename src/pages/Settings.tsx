import {
  Settings as SettingsIcon,
  Bell,
  Database,
  Gauge,
  Satellite,
  CloudRain,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Save,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast as sonnerToast } from 'sonner';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { useSettings, type DataSource } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';

const dataSourceIcons: Record<string, React.ReactNode> = {
  'sentinel-1': <Satellite className="h-4 w-4" />,
  'odk-server': <Database className="h-4 w-4" />,
  'openweather': <CloudRain className="h-4 w-4" />,
  'fews-net': <Gauge className="h-4 w-4" />,
};

export default function Settings() {
  const { toast } = useToast();
  const {
    settings,
    dataSources,
    isSaving,
    hasUnsavedChanges,
    updateThreshold,
    updateNotification,
    saveSettings,
    resetToDefaults,
    refreshDataSource,
    refreshAllSources,
  } = useSettings();

  const handleSaveSettings = async () => {
    const result = await saveSettings();

    if (result.success) {
      sonnerToast.success('System Action Logged', {
        description: 'Settings saved — configuration updated.',
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    resetToDefaults();
    toast({
      title: "Settings Reset",
      description: "All settings have been restored to defaults.",
    });
  };

  const handleRefreshSource = (sourceId: string, sourceName: string) => {
    refreshDataSource(sourceId);
    toast({
      title: "✓ Data Source Refreshed",
      description: `${sourceName} has been synced.`,
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    });
  };

  const handleRefreshAll = () => {
    refreshAllSources();
    toast({
      title: "✓ All Sources Refreshed",
      description: "All data feeds have been synced.",
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    });
  };

  const getStatusColor = (status: DataSource['status']) => {
    switch (status) {
      case 'online': return 'text-emerald-700';
      case 'offline': return 'text-rose-700';
      case 'degraded': return 'text-amber-700';
    }
  };

  const getStatusIcon = (status: DataSource['status']) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-3 w-3 text-emerald-600" />;
      case 'offline': return <AlertCircle className="h-3 w-3 text-rose-600" />;
      case 'degraded': return <AlertCircle className="h-3 w-3 text-amber-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="dashboard-shell">
        <PageHeader
          variant="compact"
          icon={SettingsIcon}
          title={hasUnsavedChanges ? 'System configuration · Unsaved' : 'System configuration'}
          actions={
            <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleReset} className="border-border">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSaving || !hasUnsavedChanges}
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            </div>
          }
        />

        {/* Alert Thresholds — two columns on large screens to reduce scroll */}
        <div className="dashboard-card overflow-hidden">
          <div className="border-b border-border bg-muted/20 px-4 py-3 sm:px-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground sm:text-base">
              <Gauge className="h-4 w-4 shrink-0 text-primary sm:h-[1.125rem] sm:w-[1.125rem]" />
              Alert thresholds
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Sensitivity for automated alerts
            </p>
          </div>
          <div className="grid gap-5 p-4 sm:gap-6 sm:p-5 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-5">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Label className="text-sm font-semibold text-foreground">Flood risk</Label>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                    Flood probability threshold
                  </p>
                </div>
                <span className="shrink-0 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-lg font-semibold tabular-nums text-rose-600 sm:text-xl">
                  {settings.thresholds.floodSensitivity}%
                </span>
              </div>
              <Slider
                value={[settings.thresholds.floodSensitivity]}
                onValueChange={([v]) => updateThreshold('floodSensitivity', v)}
                max={100}
                min={0}
                step={5}
                className="[&_[role=slider]]:bg-rose-600"
              />
              <div className="flex justify-between text-[0.6875rem] text-muted-foreground">
                <span>More alerts</span>
                <span>Fewer alerts</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Label className="text-sm font-semibold text-foreground">AED (drought)</Label>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                    Borehole / drought alert level
                  </p>
                </div>
                <span className="shrink-0 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-lg font-semibold tabular-nums text-amber-600 sm:text-xl">
                  {settings.thresholds.droughtIndex}%
                </span>
              </div>
              <Slider
                value={[settings.thresholds.droughtIndex]}
                onValueChange={([v]) => updateThreshold('droughtIndex', v)}
                max={100}
                min={0}
                step={5}
                className="[&_[role=slider]]:bg-amber-500"
              />
              <div className="flex justify-between text-[0.6875rem] text-muted-foreground">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>

            <div className="space-y-3 lg:col-span-2 lg:border-t lg:border-border lg:pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Label className="text-sm font-semibold text-foreground">CRPD (conflict risk)</Label>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                    Herder–farmer conflict probability threshold
                  </p>
                </div>
                <span className="shrink-0 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-lg font-semibold tabular-nums text-primary sm:text-xl">
                  {settings.thresholds.conflictThreshold}%
                </span>
              </div>
              <Slider
                value={[settings.thresholds.conflictThreshold]}
                onValueChange={([v]) => updateThreshold('conflictThreshold', v)}
                max={100}
                min={0}
                step={5}
                className="[&_[role=slider]]:bg-primary"
              />
              <div className="flex justify-between text-[0.6875rem] text-muted-foreground">
                <span>Early warning</span>
                <span>Critical only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Channels */}
        <div className="dashboard-card overflow-hidden">
          <div className="border-b border-border bg-muted/20 px-4 py-3 sm:px-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground sm:text-base">
              <Bell className="h-4 w-4 shrink-0 text-primary sm:h-[1.125rem] sm:w-[1.125rem]" />
              Notification channels
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              How alerts reach stakeholders
            </p>
          </div>
          <div className="divide-y divide-border">
            <div className="flex flex-col gap-3 p-3.5 transition-colors hover:bg-muted/15 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary/15 bg-primary/5">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <Label className="text-sm font-semibold text-foreground">SMS to command center</Label>
                  <p className="text-xs text-muted-foreground">Bulk SMS gateway</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.smsAlerts}
                onCheckedChange={(v) => updateNotification('smsAlerts', v)}
              />
            </div>

            <div className="flex flex-col gap-3 p-3.5 transition-colors hover:bg-muted/15 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <Label className="text-sm font-semibold text-foreground">WhatsApp — community leaders</Label>
                  <p className="text-xs text-muted-foreground">Ward focal points</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.whatsappAlerts}
                onCheckedChange={(v) => updateNotification('whatsappAlerts', v)}
              />
            </div>

            <div className="flex flex-col gap-3 p-3.5 transition-colors hover:bg-muted/15 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
                  <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <Label className="text-sm font-semibold text-foreground">Daily email digest</Label>
                  <p className="text-xs text-muted-foreground">Ministry summary</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.emailDigest}
                onCheckedChange={(v) => updateNotification('emailDigest', v)}
              />
            </div>

            <div className="flex flex-col gap-3 p-3.5 transition-colors hover:bg-muted/15 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-amber-200 bg-amber-50">
                  <Bell className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <Label className="text-sm font-semibold text-foreground">Push notifications</Label>
                  <p className="text-xs text-muted-foreground">In-app critical alerts</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.pushNotifications}
                onCheckedChange={(v) => updateNotification('pushNotifications', v)}
              />
            </div>
          </div>
        </div>

        {/* Data Source Status */}
        <div className="dashboard-card overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground sm:text-base">
                <Database className="h-4 w-4 shrink-0 text-primary sm:h-[1.125rem] sm:w-[1.125rem]" />
                Data sources | Cloud Enrichment Feeds (Command Center)
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                Supplementary cloud APIs for command center visualization. Edge node anomaly detection remains 100% offline via LoRaWAN.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefreshAll} className="h-8 shrink-0 border-border text-xs sm:h-9 sm:text-sm">
              <RefreshCw className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Refresh all
            </Button>
          </div>
          <div className="divide-y divide-border">
            {dataSources.map((source) => (
              <div
                key={source.id}
                className="flex flex-col gap-2.5 p-3.5 transition-colors hover:bg-muted/15 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/30 text-primary">
                    {dataSourceIcons[source.id] || <Database className="h-3.5 w-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{source.name}</p>
                    <p className="text-xs text-muted-foreground">{source.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
                  <span className="text-[0.6875rem] text-muted-foreground sm:text-xs">Synced {source.lastSync}</span>
                  <div
                    className={cn(
                      'flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-medium capitalize',
                      source.status === 'online' && 'border-emerald-200 bg-emerald-50 text-emerald-800',
                      source.status === 'offline' && 'border-rose-200 bg-rose-50 text-rose-800',
                      source.status === 'degraded' && 'border-amber-200 bg-amber-50 text-amber-800',
                    )}
                  >
                    {getStatusIcon(source.status)}
                    {source.status}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    onClick={() => handleRefreshSource(source.id, source.name)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="py-4 text-center text-[0.6875rem] leading-relaxed text-muted-foreground">
          <p>HydroSentry v1.2.4-MVP</p>
          <p className="mx-auto mt-0.5 max-w-xl">
            © 2026 Orivon Edge. Released under MIT Open-Source License.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
