import { useTranslation } from 'react-i18next';

export default function CreatePost() {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('posts.newPost')}</h2>
      <p className="text-muted-foreground">Post editor coming soon...</p>
    </div>
  );
}
