import { useTranslation } from 'react-i18next';
import { FolderOpen, X } from 'lucide-react';
import type { DriveCategory } from '../../../../shared/types/index.ts';

interface CategoryGridProps {
  categories: DriveCategory[];
  onSelect: (category: DriveCategory) => void;
  customFolderIds?: Set<string>;
  onRemoveCustom?: (id: string) => void;
}

export default function CategoryGrid({ categories, onSelect, customFolderIds, onRemoveCustom }: CategoryGridProps) {
  const { t } = useTranslation();

  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">{t('drive.noCategories')}</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((cat) => {
        const isCustom = customFolderIds?.has(cat.id);
        return (
          <button
            key={cat.id}
            id={`drive-category-${cat.id}`}
            onClick={() => onSelect(cat)}
            className="relative flex flex-col items-center gap-3 p-6 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-center group"
          >
            {isCustom && onRemoveCustom && (
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); onRemoveCustom(cat.id); }}
                className="absolute top-2 right-2 p-0.5 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </span>
            )}
            <FolderOpen size={32} className="text-primary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-foreground truncate w-full">{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
