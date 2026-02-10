import { useTranslation } from 'react-i18next';

export default function MediaGallery() {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('media.title')}</h2>
      <p className="text-muted-foreground">Media gallery coming soon...</p>
    </div>
  );
}
