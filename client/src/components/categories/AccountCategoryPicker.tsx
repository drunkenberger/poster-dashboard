import { useTranslation } from 'react-i18next';
import { useCategoriesStore } from '../../stores/categoriesStore.ts';

interface AccountCategoryPickerProps {
  accountId: number;
}

export default function AccountCategoryPicker({ accountId }: AccountCategoryPickerProps) {
  const { t } = useTranslation();
  const { categories, toggleAccount } = useCategoriesStore();

  if (categories.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">{t('categories.noCategoriesYet')}</p>
    );
  }

  return (
    <div id="categories-picker-025" className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const assigned = cat.accountIds.includes(accountId);
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => toggleAccount(cat.id, accountId)}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
              assigned ? 'text-white' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              backgroundColor: assigned ? cat.color : undefined,
              border: !assigned ? `1.5px solid ${cat.color}` : undefined,
              color: assigned ? 'white' : cat.color,
            }}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
