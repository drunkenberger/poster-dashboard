import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, HardDrive, Loader2, ArrowLeft } from 'lucide-react';
import { useDriveStore } from '../../stores/driveStore.ts';
import { useCustomFoldersStore } from '../../stores/customFoldersStore.ts';
import CategoryGrid from '../drive/CategoryGrid.tsx';
import type { VideoAnalysis, DriveVideo } from '../../../../shared/types/index.ts';

type Tab = 'upload' | 'drive';

interface VideoUploaderProps {
  onAnalysis: (analysis: VideoAnalysis) => void;
  uploading: boolean;
  onUploadLocal: (file: File) => void;
  onSelectDrive: (video: DriveVideo) => void;
}

export default function VideoUploader({ onAnalysis: _, uploading, onUploadLocal, onSelectDrive }: VideoUploaderProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('upload');
  const fileRef = useRef<HTMLInputElement>(null);
  const { categories, videos, selectedCategory, loadingCategories, loadingVideos, fetchCategories, selectCategory, clearSelection } = useDriveStore();
  const { folders: customFolders } = useCustomFoldersStore();

  useEffect(() => {
    if (tab === 'drive' && categories.length === 0) fetchCategories();
  }, [tab, categories.length, fetchCategories]);

  const allCategories = useMemo(() => {
    const apiIds = new Set(categories.map((c) => c.id));
    const extras = customFolders.filter((f) => !apiIds.has(f.id));
    return [...categories, ...extras];
  }, [categories, customFolders]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) return;
    onUploadLocal(file);
  };

  const tabs: { key: Tab; icon: typeof Upload; label: string }[] = [
    { key: 'upload', icon: Upload, label: t('shorts.tabUpload') },
    { key: 'drive', icon: HardDrive, label: t('shorts.tabDrive') },
  ];

  return (
    <div className="space-y-4">
      <div id="shorts-upload-tab-037" className="flex gap-2 border-b border-border">
        {tabs.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {uploading && (
        <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
          <Loader2 size={24} className="animate-spin" />
          <span>{t('shorts.analyzing')}</span>
        </div>
      )}

      {!uploading && tab === 'upload' && (
        <div
          id="shorts-upload-local-038"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className="flex flex-col items-center gap-3 p-12 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors"
        >
          <Upload size={32} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t('shorts.dragOrClick')}</p>
          <p className="text-xs text-muted-foreground">MP4, MOV - Max 500MB</p>
          <input ref={fileRef} type="file" accept="video/mp4,video/quicktime" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      )}

      {!uploading && tab === 'drive' && (
        <div id="shorts-upload-drive-039">
          {selectedCategory ? (
            <div className="space-y-3">
              <button onClick={clearSelection} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft size={16} /> {selectedCategory.name}
              </button>
              {loadingVideos ? (
                <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {videos.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => onSelectDrive(v)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted text-left transition-colors"
                    >
                      {v.thumbnailLink && <img src={v.thumbnailLink} alt="" className="w-16 h-10 rounded object-cover" />}
                      <span className="text-sm truncate flex-1">{v.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : loadingCategories ? (
            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
          ) : (
            <CategoryGrid categories={allCategories} onSelect={selectCategory} />
          )}
        </div>
      )}
    </div>
  );
}
