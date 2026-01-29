import { Shield, Droplets } from 'lucide-react';

export function HydroSentryLogo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizes = {
    small: { icon: 20, text: 'text-lg' },
    default: { icon: 32, text: 'text-2xl' },
    large: { icon: 48, text: 'text-4xl' }
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Shield 
          size={icon} 
          className="text-primary fill-primary/10" 
          strokeWidth={2}
        />
        <Droplets 
          size={icon * 0.45} 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" 
          strokeWidth={2.5}
        />
      </div>
      <span className={`font-semibold text-foreground ${text}`}>
        Hydro<span className="text-primary">Sentry</span>
      </span>
    </div>
  );
}
