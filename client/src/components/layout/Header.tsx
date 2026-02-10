import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function Header() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const next = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(next);
    localStorage.setItem('language', next);
  };

  return (
    <header
      id="layout-header-003"
      className="flex items-center justify-end h-14 px-6 border-b border-border bg-card"
    >
      <button
        id="header-lang-toggle-004"
        onClick={toggleLanguage}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-muted text-muted-foreground"
      >
        <Globe size={16} />
        {i18n.language.toUpperCase()}
      </button>
    </header>
  );
}
