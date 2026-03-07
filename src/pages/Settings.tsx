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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
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
      toast({
        title: "✓ Settings Saved",
        description: "Your configuration has been updated successfully.",
        className: "bg-emerald-50 text-emerald-800 border-emerald-200",
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
      <div className="max-w-7xl mx-auto py-8 px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
              <SettingsIcon className="h-6 w-6 text-[#005587]" />
              System Configuration
            </h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1.5 flex items-center">
              Configure alert thresholds, notifications, and data sources
              {hasUnsavedChanges && (
                <span className="ml-3 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  • Unsaved changes
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="border-slate-300 text-slate-700">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="bg-[#005587] hover:bg-[#00446b] text-white"
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
        </div>

        {/* Alert Thresholds */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-100 rounded-xl overflow-hidden shadow-soft">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Gauge className="h-5 w-5 text-[#005587]" />
              Alert Thresholds
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Configure sensitivity levels for automated alerts
            </p>
          </div>
          <div className="p-6 space-y-8">
            {/* Flood Risk Sensitivity */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <Label className="text-sm font-bold text-slate-900">Flood Risk Sensitivity</Label>
                  <p className="text-xs font-medium text-slate-500 mt-0.5 max-w-sm">
                    Trigger alerts when flood probability exceeds threshold
                  </p>
                </div>
                <span className="text-3xl font-extrabold text-rose-600 bg-rose-50 px-4 py-1 rounded-lg border border-rose-100">
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
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Low (More Alerts)</span>
                <span>High (Fewer Alerts)</span>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Drought Index (AED) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <Label className="text-sm font-bold text-slate-900">Atmospheric Evaporative Demand (AED)</Label>
                  <p className="text-xs font-medium text-slate-500 mt-0.5 max-w-sm">
                    Drought severity threshold for borehole priority alerts
                  </p>
                </div>
                <span className="text-3xl font-extrabold text-amber-600 bg-amber-50 px-4 py-1 rounded-lg border border-amber-100">
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
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Conflict Risk Threshold */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <Label className="text-sm font-bold text-slate-900">Conflict Risk Prediction (CRPD)</Label>
                  <p className="text-xs font-medium text-slate-500 mt-0.5 max-w-sm">
                    Alert when herder-farmer conflict probability exceeds level
                  </p>
                </div>
                <span className="text-3xl font-extrabold text-[#005587] bg-sky-50 px-4 py-1 rounded-lg border border-sky-100">
                  {settings.thresholds.conflictThreshold}%
                </span>
              </div>
              <Slider
                value={[settings.thresholds.conflictThreshold]}
                onValueChange={([v]) => updateThreshold('conflictThreshold', v)}
                max={100}
                min={0}
                step={5}
                className="[&_[role=slider]]:bg-[#005587]"
              />
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Early Warning</span>
                <span>Critical Only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Channels */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#005587]" />
              Notification Channels
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Configure how alerts are delivered to stakeholders
            </p>
          </div>
          <div className="p-0">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-sky-50 flex items-center justify-center border border-sky-100">
                  <MessageSquare className="h-4 w-4 text-[#005587]" />
                </div>
                <div>
                  <Label className="text-sm font-bold text-slate-900">SMS Alerts to BOSEPA</Label>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Emergency alerts via bulk SMS gateway
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.smsAlerts}
                onCheckedChange={(v) => updateNotification('smsAlerts', v)}
              />
            </div>

            <div className="flex items-center justify-between p-5 border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <Label className="text-sm font-bold text-slate-900">WhatsApp to Community Leaders</Label>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Real-time updates to ward focal points
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.whatsappAlerts}
                onCheckedChange={(v) => updateNotification('whatsappAlerts', v)}
              />
            </div>

            <div className="flex items-center justify-between p-5 border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                  <Bell className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <Label className="text-sm font-bold text-slate-900">Daily Email Digest</Label>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Summary report to ministry officials
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.emailDigest}
                onCheckedChange={(v) => updateNotification('emailDigest', v)}
              />
            </div>

            <div className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
                  <Bell className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <Label className="text-sm font-bold text-slate-900">Push Notifications</Label>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    In-app alerts for critical events
                  </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 bg-slate-100 rounded-xl overflow-hidden shadow-soft gap-px">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Database className="h-5 w-5 text-[#005587]" />
                Data Source Status
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Real-time connectivity status of integrated data feeds
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefreshAll} className="bg-white border-slate-300">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All
            </Button>
          </div>
          <div className="p-0">
            <div className="flex flex-col">
              {dataSources.map((source, index) => (
                <div key={source.id} className={cn("flex items-center justify-between p-5 hover:bg-slate-50 transition-colors", index < dataSources.length - 1 && "border-b border-slate-100")}>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-[#005587] border border-slate-200">
                      {dataSourceIcons[source.id] || <Database className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{source.name}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{source.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Synced {source.lastSync}
                    </span>
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border",
                      source.status === 'online' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                      source.status === 'offline' && "bg-rose-50 text-rose-700 border-rose-200",
                      source.status === 'degraded' && "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                      {getStatusIcon(source.status)}
                      {source.status}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-[#005587] hover:bg-sky-50"
                      onClick={() => handleRefreshSource(source.id, source.name)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 opacity-70">
          <p>HydroSentry Command Center v2.1.0</p>
          <p className="mt-1">© 2026 Borno State Emergency Management Agency (BOSEPA)</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
