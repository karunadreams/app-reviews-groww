import { Info } from 'lucide-react';

export default function DataSourceBadge({ weeks = 12 }: { weeks?: number }) {
  return (
    <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted mt-12 py-6 border-t border-white/5">
      <Info size={14} />
      Based on 4,280 reviews · App Store + Play Store · Last {weeks} Weeks · Last updated: June 2025
    </div>
  );
}
