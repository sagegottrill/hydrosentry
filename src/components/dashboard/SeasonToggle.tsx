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
    <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-full px-5 py-2.5 shadow-sm">
      {/* Wet Season Label */}
      <div className={cn(
        "flex items-center gap-2 transition-colors",
        season === 'wet' ? "text-[#005587]" : "text-slate-400"
      )}>
        <Droplets className="h-4.5 w-4.5" />
        <span className="text-xs font-bold uppercase tracking-wider">Wet Season</span>
      </div>

      {/* Toggle Switch */}
      <Switch
        checked={season === 'dry'}
        onCheckedChange={(checked) => onSeasonChange(checked ? 'dry' : 'wet')}
        className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-[#005587]"
      />

      {/* Dry Season Label */}
      <div className={cn(
        "flex items-center gap-2 transition-colors",
        season === 'dry' ? "text-amber-600" : "text-slate-400"
      )}>
        <Sun className="h-4.5 w-4.5" />
        <span className="text-xs font-bold uppercase tracking-wider">Dry Season</span>
      </div>
    </div>
  );
}
