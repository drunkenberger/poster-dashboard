import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Pencil, Trash2 } from 'lucide-react';
import { useCategoriesStore, CATEGORY_COLORS } from '../../stores/categoriesStore.ts';

interface CategoryManagerProps {
  open: boolean;
  onClose: () => void;
}

export default function CategoryManager({ open, onClose }: CategoryManagerProps) {
  const { t } = useTranslation();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategoriesStore();

  const [name, setName] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (editingId) {
      updateCategory(editingId, trimmed, color);
      setEditingId(null);
    } else {
      createCategory(trimmed, color);
    }
    setName('');
    setColor(CATEGORY_COLORS[0]);
  };

  const startEdit = (id: string, catName: string, catColor: string) => {
    setEditingId(id);
    setName(catName);
    setColor(catColor);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setColor(CATEGORY_COLORS[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        id="categories-manager-026"
        className="bg-card border border-border rounded-xl w-full max-w-md mx-4 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t('categories.manage')}</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4">
          <input
            id="categories-name-input-027"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('categories.namePlaceholder')}
            className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground"
            maxLength={30}
          />

          <div className="flex items-center gap-2">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'ring-2 ring-offset-2 ring-offset-card scale-110' : ''
                }`}
                style={{ backgroundColor: c, ringColor: c }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {editingId ? t('common.save') : t('common.create')}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted"
              >
                {t('common.cancel')}
              </button>
            )}
          </div>
        </form>

        {categories.length > 0 && (
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm font-medium">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({cat.accountIds.length})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(cat.id, cat.name, cat.color)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('categories.empty')}
          </p>
        )}
      </div>
    </div>
  );
}
