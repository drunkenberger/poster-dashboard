import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderOpen, Loader2 } from 'lucide-react';
import { driveService } from '../../services/drive.ts';
import { useCustomFoldersStore } from '../../stores/customFoldersStore.ts';
import type { DriveCategory } from '../../../../shared/types/index.ts';

const STORAGE_KEY = 'carousel-drive-folder';

interface DriveFolderPickerProps {
  selectedId: string;
  onChange: (id: string) => void;
}

export default function DriveFolderPicker({ selectedId, onChange }: DriveFolderPickerProps) {
  const { t } = useTranslation();
  const { folders: customFolders } = useCustomFoldersStore();
  const [folders, setFolders] = useState<DriveCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    driveService
      .getCategories()
      .then(setFolders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && !selectedId) onChange(saved);
  }, []);

  const handleChange = (id: string) => {
    onChange(id);
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  };

  const allFolders = [
    ...folders,
    ...customFolders.filter((cf) => !folders.some((f) => f.id === cf.id)),
  ];

  return (
    <div id="carousel-drive-picker-075" className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <FolderOpen size={16} />
        {t('carousel.saveToDrive')}
      </label>
      {loading ? (
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
          <Loader2 size={14} className="animate-spin" /> {t('common.loading')}
        </div>
      ) : (
        <select
          value={selectedId}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">{t('carousel.driveFolderNone')}</option>
          {allFolders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      )}
      <p className="text-xs text-muted-foreground">{t('carousel.driveFolderHint')}</p>
    </div>
  );
}
