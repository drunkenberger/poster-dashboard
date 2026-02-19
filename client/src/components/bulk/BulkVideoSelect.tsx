import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FolderOpen, ArrowLeft, Loader2, CheckSquare, Square } from 'lucide-react';
import { useDriveStore } from '../../stores/driveStore.ts';
import { useCustomFoldersStore } from '../../stores/customFoldersStore.ts';
import { driveService } from '../../services/drive.ts';
import { useMediaUpload } from '../../hooks/useMediaUpload.ts';
import CategoryGrid from '../drive/CategoryGrid.tsx';
import MediaUploader from '../media/MediaUploader.tsx';
import type { BulkPostItem, DriveVideo } from '../../../../shared/types/index.ts';

type Tab = 'drive' | 'upload';

interface BulkVideoSelectProps {
  items: BulkPostItem[];
  onItemsChange: (items: BulkPostItem[]) => void;
}

export default function BulkVideoSelect({ items, onItemsChange }: BulkVideoSelectProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('drive');

  return (
    <div id="bulk-video-select-030" className="space-y-4">
      <div className="flex gap-2 border-b border-border">
        <TabBtn active={tab === 'drive'} onClick={() => setTab('drive')} icon={<FolderOpen size={16} />} label={t('bulk.tabDrive')} />
        <TabBtn active={tab === 'upload'} onClick={() => setTab('upload')} icon={<Upload size={16} />} label={t('bulk.tabUpload')} />
      </div>
      {tab === 'drive' ? (
        <DriveTab items={items} onItemsChange={onItemsChange} />
      ) : (
        <UploadTab items={items} onItemsChange={onItemsChange} />
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function DriveTab({ items, onItemsChange }: BulkVideoSelectProps) {
  const { t } = useTranslation();
  const { categories, videos, selectedCategory, loadingCategories, loadingVideos, fetchCategories, selectCategory, clearSelection } = useDriveStore();
  const { folders: customFolders } = useCustomFoldersStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });

  useEffect(() => { if (categories.length === 0) fetchCategories(); }, [categories.length, fetchCategories]);

  const allCategories = useMemo(() => {
    const apiIds = new Set(categories.map((c) => c.id));
    const extras = customFolders.filter((f) => !apiIds.has(f.id));
    return [...categories, ...extras];
  }, [categories, customFolders]);

  const toggleVideo = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleUpload = async () => {
    const toUpload = videos.filter((v) => selected.has(v.id));
    setUploading(true);
    setUploadProgress({ done: 0, total: toUpload.length });

    const newItems: BulkPostItem[] = [];
    const concurrent = 3;
    for (let i = 0; i < toUpload.length; i += concurrent) {
      const batch = toUpload.slice(i, i + concurrent);
      const results = await Promise.allSettled(batch.map((v) => driveService.uploadFromDrive(v.id)));
      results.forEach((r, idx) => {
        if (r.status === 'fulfilled') {
          const video = batch[idx];
          newItems.push(buildItemFromDrive(video, r.value.media_id));
        }
      });
      setUploadProgress((p) => ({ ...p, done: p.done + batch.length }));
    }

    onItemsChange([...items, ...newItems]);
    setSelected(new Set());
    setUploading(false);
  };

  if (!selectedCategory) {
    return loadingCategories
      ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
      : <CategoryGrid categories={allCategories} onSelect={selectCategory} />;
  }

  return (
    <div className="space-y-3">
      <button onClick={clearSelection} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> {selectedCategory.name}
      </button>

      {loadingVideos ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} checked={selected.has(v.id)} onToggle={() => toggleVideo(v.id)} />
            ))}
          </div>
          {selected.size > 0 && (
            <button
              id="bulk-upload-drive-031"
              onClick={handleUpload}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {uploading ? (
                <><Loader2 size={16} className="animate-spin" /> {uploadProgress.done}/{uploadProgress.total}</>
              ) : (
                t('bulk.uploadSelected', { count: selected.size })
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function VideoCard({ video, checked, onToggle }: { video: DriveVideo; checked: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-colors ${
        checked ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted'
      }`}
    >
      <div className="absolute top-2 right-2">
        {checked ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-muted-foreground" />}
      </div>
      {video.thumbnailLink ? (
        <img src={video.thumbnailLink} alt={video.name} className="w-full h-20 object-cover rounded" />
      ) : (
        <div className="w-full h-20 bg-muted rounded flex items-center justify-center"><Upload size={20} className="text-muted-foreground" /></div>
      )}
      <span className="text-xs truncate w-full">{video.name}</span>
    </button>
  );
}

function UploadTab({ items, onItemsChange }: BulkVideoSelectProps) {
  const { files, upload, remove, mediaIds } = useMediaUpload();
  const prevCount = items.length;

  useEffect(() => {
    const doneFiles = files.filter((f) => f.status === 'done');
    if (doneFiles.length > 0 && mediaIds.length > prevCount) {
      const newItems: BulkPostItem[] = doneFiles
        .filter((f) => !items.some((item) => item.mediaId === f.id))
        .map((f) => ({ id: crypto.randomUUID(), mediaId: f.id, name: f.file.name, caption: '' }));
      if (newItems.length > 0) onItemsChange([...items, ...newItems]);
    }
  }, [mediaIds.length, files, items, onItemsChange, prevCount]);

  return <MediaUploader files={files} onUpload={upload} onRemove={remove} />;
}

function buildItemFromDrive(video: DriveVideo, mediaId: string): BulkPostItem {
  const caption = [video.captionEs, video.captionEn].filter(Boolean).join('\n\n---\n\n');
  return {
    id: crypto.randomUUID(),
    mediaId,
    name: video.name,
    thumbnail: video.thumbnailLink,
    caption,
    captionEs: video.captionEs,
    captionEn: video.captionEn,
    title: video.title,
  };
}
