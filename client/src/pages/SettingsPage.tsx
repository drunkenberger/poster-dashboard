import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('nav.settings')}</h2>
      <p className="text-muted-foreground">Settings coming soon...</p>
    </div>
  );
}
