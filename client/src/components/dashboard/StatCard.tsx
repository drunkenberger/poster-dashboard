import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export default function StatCard({ label, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card">
      <div
        className="flex items-center justify-center w-12 h-12 rounded-lg"
        style={{ backgroundColor: bgColor }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
