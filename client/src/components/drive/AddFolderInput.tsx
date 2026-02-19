import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Loader2 } from 'lucide-react';
import { useCustomFoldersStore } from '../../stores/customFoldersStore.ts';

export default function AddFolderInput() {
  const { t } = useTranslation();
  const { addFolder, adding } = useCustomFoldersStore();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim() || adding) return;
    setError('');
    try {
      await addFolder(input);
      setInput('');
      setOpen(false);
    } catch {
      setError(t('drive.addFolderError'));
    }
  };

  if (!open) {
    return (
      <button
        id="drive-add-folder-050"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-dashed border-border hover:bg-muted transition-colors text-muted-foreground"
      >
        <Plus size={16} /> {t('drive.addFolder')}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder={t('drive.folderIdPlaceholder')}
        className="flex-1 px-3 py-1.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        onClick={handleSubmit}
        disabled={adding || !input.trim()}
        className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
      </button>
      <button
        onClick={() => { setOpen(false); setInput(''); setError(''); }}
        className="px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        {t('common.cancel')}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
