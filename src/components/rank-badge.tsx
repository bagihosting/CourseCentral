import { cn } from "@/lib/utils";
import type { Rank } from "@/lib/ranks";

interface RankBadgeProps {
  rank: Rank;
}

export function RankBadge({ rank }: RankBadgeProps) {
  const Icon = rank.icon;
  return (
    <div className="group relative flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
      <div className="absolute -inset-0.5 animate-pulse-slow rounded-full bg-primary/20 opacity-75 blur-sm group-hover:animate-none"></div>
      <Icon className={cn("h-4 w-4", rank.color)} />
      <span className={cn("relative", rank.color)}>{rank.title}</span>
    </div>
  );
}
