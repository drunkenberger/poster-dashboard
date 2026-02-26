import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useDriveStore } from '../../stores/driveStore.ts';
import { useCustomFoldersStore } from '../../stores/customFoldersStore.ts';
import { driveService } from '../../services/drive.ts';
import CategoryGrid from '../drive/CategoryGrid.tsx';
import type { BulkPostItem } from '../../../../shared/types/index.ts';
import type { CarouselFolder } from '../../utils/carouselScheduleRunner.ts';

interface Props {
  items: BulkPostItem[];
  onItemsChange: (items: BulkPostItem[]) => void;
}

const UPLOAD_DELAY = 1000;

export default function BulkCarouselSelect({ items, onItemsChange }: Props) {
  const { t } = useTranslation();
  const { categories, selectedCategory, loadingCategories, fetchCategories, selectCategory, clearSelection } = useDriveStore();
  const { folders: customFolders } = useCustomFoldersStore();

  const [carouselFolders, setCarouselFolders] = useState<CarouselFolder[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });

  useEffect(() => { if (categories.length === 0) fetchCategories(); }, [categories.length, fetchCategories]);

  const allCategories = useMemo(() => {
    const apiIds = new Set(categories.map((c) => c.id));
    return [...categories, ...customFolders.filter((f) => !apiIds.has(f.id))];
  }, [categories, customFolders]);

  const handleSelectFolder = useCallback(async (folder: { id: string; name: string }) => {
    selectCategory(folder as Parameters<typeof selectCategory>[0]);
    setLoading(true);
    try {
      const found = await driveService.findCarouselFolders(folder.id);
      setCarouselFolders(found);
      setSelectedIds(new Set(found.map((f) => f.id)));
    } catch {
      setCarouselFolders([]);
      setSelectedIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [selectCategory]);

  const handleBack = () => {
    clearSelection();
    setCarouselFolders([]);
    setSelectedIds(new Set());
  };

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(selectedIds.size === carouselFolders.length ? new Set() : new Set(carouselFolders.map((f) => f.id)));
  };

  const handleUpload = async () => {
    const selected = carouselFolders.filter((f) => selectedIds.has(f.id));
    setUploading(true);
    setUploadProgress({ done: 0, total: selected.length });
    const newItems: BulkPostItem[] = [];

    for (const folder of selected) {
      try {
        const [images, caption] = await Promise.all([
          driveService.listImages(folder.id),
          driveService.getCaption(folder.id),
        ]);
        if (images.length === 0) { setUploadProgress((p) => ({ ...p, done: p.done + 1 })); continue; }

        const mediaIds: string[] = [];
        for (const img of images) {
          const { media_id } = await driveService.uploadFromDrive(img.id);
          mediaIds.push(media_id);
          await new Promise((r) => setTimeout(r, UPLOAD_DELAY));
        }

        newItems.push({
          id: crypto.randomUUID(),
          mediaId: mediaIds[0],
          mediaIds,
          name: folder.path || folder.name,
          caption: caption || folder.name,
        });
      } catch { /* skip failed */ }
      setUploadProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    onItemsChange([...items, ...newItems]);
    setSelectedIds(new Set());
    setUploading(false);
  };

  if (!selectedCategory) {
    return loadingCategories
      ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
      : <CategoryGrid categories={allCategories} onSelect={handleSelectFolder} />;
  }

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>;

  const allSelected = carouselFolders.length > 0 && selectedIds.size === carouselFolders.length;

  return (
    <div className="space-y-3">
      <button onClick={handleBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> {selectedCategory.name}
      </button>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded" />
            {t('autoSchedule.carouselsFound', { count: carouselFolders.length })}
          </label>
          <span className="text-xs text-muted-foreground">{selectedIds.size} {t('autoSchedule.selected')}</span>
        </div>
        <ul className="max-h-52 overflow-y-auto divide-y divide-border">
          {carouselFolders.map((f) => (
            <li key={f.id}>
              <label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors">
                <input type="checkbox" checked={selectedIds.has(f.id)} onChange={() => toggle(f.id)} className="rounded flex-shrink-0" />
                <span className="text-sm truncate">{f.path}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {selectedIds.size > 0 && (
        <button
          id="bulk-upload-carousels-088"
          onClick={handleUpload}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 size={16} className="animate-spin" /> {uploadProgress.done}/{uploadProgress.total}</>
          ) : (
            t('bulk.uploadSelected', { count: selectedIds.size })
          )}
        </button>
      )}
    </div>
  );
}
