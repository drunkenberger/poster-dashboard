import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('dashboard.title')}</h2>
      <p className="text-muted-foreground">Dashboard coming soon...</p>
    </div>
  );
}
