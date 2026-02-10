import { useTranslation } from 'react-i18next';

export default function Posts() {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('posts.title')}</h2>
      <p className="text-muted-foreground">Posts list coming soon...</p>
    </div>
  );
}
