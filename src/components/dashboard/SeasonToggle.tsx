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
    <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2">
      <div
        className={cn(
          'flex items-center gap-2 transition-colors',
          season === 'wet' ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        <Droplets className="h-4 w-4" strokeWidth={1.75} />
        <span className="text-xs font-medium">Wet</span>
      </div>

      <Switch
        checked={season === 'dry'}
        onCheckedChange={(checked) => onSeasonChange(checked ? 'dry' : 'wet')}
        className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-primary"
      />

      <div
        className={cn(
          'flex items-center gap-2 transition-colors',
          season === 'dry' ? 'text-amber-600' : 'text-muted-foreground',
        )}
      >
        <Sun className="h-4 w-4" strokeWidth={1.75} />
        <span className="text-xs font-medium">Dry</span>
      </div>
    </div>
  );
}
