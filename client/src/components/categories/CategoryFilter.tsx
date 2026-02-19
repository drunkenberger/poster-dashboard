import { useTranslation } from 'react-i18next';
import { useCategoriesStore } from '../../stores/categoriesStore.ts';

interface CategoryFilterProps {
  selected: string | null;
  onChange: (categoryId: string | null) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const { t } = useTranslation();
  const { categories } = useCategoriesStore();

  if (categories.length === 0) return null;

  return (
    <div id="categories-filter-024" className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
          !selected
            ? 'bg-foreground text-background'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
      >
        {t('common.all')}
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(selected === cat.id ? null : cat.id)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            selected === cat.id ? 'text-white' : 'opacity-60 hover:opacity-100'
          }`}
          style={{
            backgroundColor: selected === cat.id ? cat.color : undefined,
            borderColor: cat.color,
            border: selected !== cat.id ? `1.5px solid ${cat.color}` : undefined,
            color: selected === cat.id ? 'white' : cat.color,
          }}
        >
          {cat.name} ({cat.accountIds.length})
        </button>
      ))}
    </div>
  );
}
