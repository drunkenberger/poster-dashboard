import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useDriveStore } from '../stores/driveStore.ts';
import { useCustomFoldersStore } from '../stores/customFoldersStore.ts';
import CategoryGrid from '../components/drive/CategoryGrid.tsx';
import VideoGrid from '../components/drive/VideoGrid.tsx';
import AddFolderInput from '../components/drive/AddFolderInput.tsx';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.tsx';
import ErrorMessage from '../components/ui/ErrorMessage.tsx';

export default function DriveVideoBrowser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    categories,
    videos,
    selectedCategory,
    loadingCategories,
    loadingVideos,
    error,
    fetchCategories,
    selectCategory,
    clearSelection,
  } = useDriveStore();

  const { folders: customFolders, removeFolder } = useCustomFoldersStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const allCategories = useMemo(() => {
    const apiIds = new Set(categories.map((c) => c.id));
    const extras = customFolders.filter((f) => !apiIds.has(f.id));
    return [...categories, ...extras];
  }, [categories, customFolders]);

  const customFolderIds = useMemo(
    () => new Set(customFolders.map((f) => f.id)),
    [customFolders],
  );

  const handleUploaded = (mediaId: string, captionEs: string, captionEn: string, title: string) => {
    const params = new URLSearchParams({ media: mediaId });
    if (captionEs) params.set('captionEs', captionEs);
    if (captionEn) params.set('captionEn', captionEn);
    if (title) params.set('title', title);
    navigate(`/create?${params.toString()}`);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        {selectedCategory && (
          <button
            id="drive-back-btn-023"
            onClick={clearSelection}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h2 className="text-2xl font-bold flex-1">
          {selectedCategory ? selectedCategory.name : t('drive.title')}
        </h2>
        {!selectedCategory && <AddFolderInput />}
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchCategories} />}

      {!error && !selectedCategory && (
        loadingCategories
          ? <LoadingSkeleton count={4} />
          : <CategoryGrid
              categories={allCategories}
              onSelect={selectCategory}
              customFolderIds={customFolderIds}
              onRemoveCustom={removeFolder}
            />
      )}

      {!error && selectedCategory && (
        loadingVideos ? <LoadingSkeleton count={3} /> : <VideoGrid videos={videos} onUploaded={handleUploaded} />
      )}
    </div>
  );
}
