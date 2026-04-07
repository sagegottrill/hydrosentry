import { HeartPulse } from 'lucide-react';

export function OpenMedLiteLogo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizes = {
    small: { icon: 20, text: 'text-lg' },
    default: { icon: 32, text: 'text-2xl' },
    large: { icon: 48, text: 'text-4xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <HeartPulse size={icon} className="text-primary fill-primary/10" strokeWidth={2} />
      </div>
      <span className={`font-medium tracking-tight text-foreground ${text}`}>
        OpenMed <span className="text-primary">Lite</span>
      </span>
    </div>
  );
}

