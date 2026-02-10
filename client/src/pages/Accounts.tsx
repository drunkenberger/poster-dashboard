import { useTranslation } from 'react-i18next';

export default function Accounts() {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('accounts.title')}</h2>
      <p className="text-muted-foreground">Accounts list coming soon...</p>
    </div>
  );
}
