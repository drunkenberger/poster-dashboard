import { X } from 'lucide-react';

interface CategoryBadgeProps {
  name: string;
  color: string;
  onRemove?: () => void;
}

export default function CategoryBadge({ name, color, onRemove }: CategoryBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-70"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
