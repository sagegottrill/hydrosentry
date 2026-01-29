import { Switch } from '@/components/ui/switch';
import { Droplets, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Season } from '@/types/hydrosentry';

interface SeasonToggleProps {
  season: Season;
  onSeasonChange: (season: Season) => void;
}

export function SeasonToggle({ season, onSeasonChange }: SeasonToggleProps) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-full px-4 py-2 shadow-lg">
      {/* Wet Season Label */}
      <div className={cn(
        "flex items-center gap-1.5 transition-colors",
        season === 'wet' ? "text-primary" : "text-muted-foreground"
      )}>
        <Droplets className="h-4 w-4" />
        <span className="text-sm font-medium">Wet Season</span>
      </div>

      {/* Toggle Switch */}
      <Switch
        checked={season === 'dry'}
        onCheckedChange={(checked) => onSeasonChange(checked ? 'dry' : 'wet')}
        className="data-[state=checked]:bg-warning data-[state=unchecked]:bg-primary"
      />

      {/* Dry Season Label */}
      <div className={cn(
        "flex items-center gap-1.5 transition-colors",
        season === 'dry' ? "text-warning" : "text-muted-foreground"
      )}>
        <Sun className="h-4 w-4" />
        <span className="text-sm font-medium">Dry Season</span>
      </div>
    </div>
  );
}
