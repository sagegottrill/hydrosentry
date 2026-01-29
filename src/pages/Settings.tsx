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
  'sentinel-1': <Satellite className="h-5 w-5" />,
  'odk-server': <Database className="h-5 w-5" />,
  'openweather': <CloudRain className="h-5 w-5" />,
  'fews-net': <Gauge className="h-5 w-5" />,
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
        className: "bg-success text-success-foreground border-success",
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
      className: "bg-success text-success-foreground border-success",
    });
  };

  const handleRefreshAll = () => {
    refreshAllSources();
    toast({
      title: "✓ All Sources Refreshed",
      description: "All data feeds have been synced.",
      className: "bg-success text-success-foreground border-success",
    });
  };

  const getStatusColor = (status: DataSource['status']) => {
    switch (status) {
      case 'online': return 'text-success';
      case 'offline': return 'text-destructive';
      case 'degraded': return 'text-warning';
    }
  };

  const getStatusIcon = (status: DataSource['status']) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'offline': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'degraded': return <AlertCircle className="h-4 w-4 text-warning" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-secondary/30 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <SettingsIcon className="h-7 w-7 text-primary" />
                System Configuration
              </h1>
              <p className="text-muted-foreground mt-1">
                Configure alert thresholds, notifications, and data sources
                {hasUnsavedChanges && (
                  <span className="ml-2 text-warning text-sm">• Unsaved changes</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={handleSaveSettings} 
                className="bg-primary hover:bg-primary/90"
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                Alert Thresholds
              </CardTitle>
              <CardDescription>
                Configure sensitivity levels for automated alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Flood Risk Sensitivity */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-sm font-medium">Flood Risk Sensitivity</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Trigger alerts when flood probability exceeds threshold
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-destructive">
                    {settings.thresholds.floodSensitivity}%
                  </span>
                </div>
                <Slider
                  value={[settings.thresholds.floodSensitivity]}
                  onValueChange={([v]) => updateThreshold('floodSensitivity', v)}
                  max={100}
                  min={0}
                  step={5}
                  className="[&_[role=slider]]:bg-destructive"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low (More Alerts)</span>
                  <span>High (Fewer Alerts)</span>
                </div>
              </div>

              <Separator />

              {/* Drought Index (AED) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-sm font-medium">Atmospheric Evaporative Demand (AED)</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Drought severity threshold for borehole priority alerts
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-warning">
                    {settings.thresholds.droughtIndex}%
                  </span>
                </div>
                <Slider
                  value={[settings.thresholds.droughtIndex]}
                  onValueChange={([v]) => updateThreshold('droughtIndex', v)}
                  max={100}
                  min={0}
                  step={5}
                  className="[&_[role=slider]]:bg-warning"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conservative</span>
                  <span>Aggressive</span>
                </div>
              </div>

              <Separator />

              {/* Conflict Risk Threshold */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-sm font-medium">Conflict Risk Prediction (CRPD)</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Alert when herder-farmer conflict probability exceeds level
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-primary">
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
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Early Warning</span>
                  <span>Critical Only</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Channels
              </CardTitle>
              <CardDescription>
                Configure how alerts are delivered to stakeholders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">SMS Alerts to BOSEPA</Label>
                    <p className="text-xs text-muted-foreground">
                      Emergency alerts via bulk SMS gateway
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.smsAlerts}
                  onCheckedChange={(v) => updateNotification('smsAlerts', v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">WhatsApp to Community Leaders</Label>
                    <p className="text-xs text-muted-foreground">
                      Real-time updates to ward focal points
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.whatsappAlerts}
                  onCheckedChange={(v) => updateNotification('whatsappAlerts', v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Daily Email Digest</Label>
                    <p className="text-xs text-muted-foreground">
                      Summary report to ministry officials
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.emailDigest}
                  onCheckedChange={(v) => updateNotification('emailDigest', v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      In-app alerts for critical events
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(v) => updateNotification('pushNotifications', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Source Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Data Source Status
                  </CardTitle>
                  <CardDescription>
                    Real-time connectivity status of integrated data feeds
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefreshAll}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataSources.map((source, index) => (
                  <div key={source.id}>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          {dataSourceIcons[source.id] || <Database className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{source.name}</p>
                          <p className="text-xs text-muted-foreground">{source.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          Synced {source.lastSync}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(source.status)}
                          <span className={cn(
                            "text-sm font-medium capitalize",
                            getStatusColor(source.status)
                          )}>
                            {source.status}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRefreshSource(source.id, source.name)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {index < dataSources.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <div className="text-center text-xs text-muted-foreground py-4">
            <p>HydroSentry Command Center v2.1.0</p>
            <p>© 2026 Borno State Emergency Management Agency (BOSEPA)</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
