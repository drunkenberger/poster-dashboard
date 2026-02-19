import { useTranslation } from 'react-i18next';
import { Globe, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export default function Header({ onToggleMobileSidebar }: HeaderProps) {
  const { i18n } = useTranslation();
  const { theme, toggle: toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const next = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(next);
    localStorage.setItem('language', next);
  };

  return (
    <header
      id="layout-header-003"
      className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-border bg-card"
    >
      <button
        id="header-mobile-menu-015"
        onClick={onToggleMobileSidebar}
        className="p-2 rounded-md hover:bg-muted text-muted-foreground sm:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <button
          id="header-theme-toggle-016"
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-muted text-muted-foreground"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          id="header-lang-toggle-004"
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-muted text-muted-foreground"
        >
          <Globe size={16} />
          {i18n.language.toUpperCase()}
        </button>
      </div>
    </header>
  );
}
