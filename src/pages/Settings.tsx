import { useState } from 'react';
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
  Save
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';

interface DataSource {
  name: string;
  description: string;
  status: 'online' | 'offline' | 'degraded';
  lastSync: string;
  icon: React.ReactNode;
}

const dataSources: DataSource[] = [
  {
    name: 'Sentinel-1 SAR',
    description: 'Flood extent mapping via radar imagery',
    status: 'online',
    lastSync: '2 min ago',
    icon: <Satellite className="h-5 w-5" />
  },
  {
    name: 'ODK Collect Server',
    description: 'Field data collection from enumerators',
    status: 'online',
    lastSync: '15 min ago',
    icon: <Database className="h-5 w-5" />
  },
  {
    name: 'OpenWeather API',
    description: 'Real-time precipitation forecasts',
    status: 'online',
    lastSync: '5 min ago',
    icon: <CloudRain className="h-5 w-5" />
  },
  {
    name: 'FEWS NET',
    description: 'Famine early warning indicators',
    status: 'online',
    lastSync: '1 hour ago',
    icon: <Gauge className="h-5 w-5" />
  }
];

export default function Settings() {
  const { toast } = useToast();
  
  // Alert thresholds
  const [floodSensitivity, setFloodSensitivity] = useState([70]);
  const [droughtIndex, setDroughtIndex] = useState([65]);
  const [conflictThreshold, setConflictThreshold] = useState([80]);
  
  // Notification channels
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleSaveSettings = () => {
    toast({
      title: "✓ Settings Saved",
      description: "Your configuration has been updated successfully.",
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
            </p>
          </div>
          <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
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
                  {floodSensitivity[0]}%
                </span>
              </div>
              <Slider
                value={floodSensitivity}
                onValueChange={setFloodSensitivity}
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
                  {droughtIndex[0]}%
                </span>
              </div>
              <Slider
                value={droughtIndex}
                onValueChange={setDroughtIndex}
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
                  {conflictThreshold[0]}%
                </span>
              </div>
              <Slider
                value={conflictThreshold}
                onValueChange={setConflictThreshold}
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
                checked={smsAlerts}
                onCheckedChange={setSmsAlerts}
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
                checked={whatsappAlerts}
                onCheckedChange={setWhatsappAlerts}
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
                checked={emailDigest}
                onCheckedChange={setEmailDigest}
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
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Source Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Data Source Status
            </CardTitle>
            <CardDescription>
              Real-time connectivity status of integrated data feeds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dataSources.map((source, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {source.icon}
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
