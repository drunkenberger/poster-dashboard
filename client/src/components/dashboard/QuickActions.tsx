import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PenSquare, Users, FileText } from 'lucide-react';

const actions = [
  { to: '/create', icon: PenSquare, labelKey: 'nav.createPost', color: '#6366f1', bg: '#e0e7ff' },
  { to: '/accounts', icon: Users, labelKey: 'nav.accounts', color: '#e1306c', bg: '#fde8ef' },
  { to: '/posts', icon: FileText, labelKey: 'nav.posts', color: '#22c55e', bg: '#dcfce7' },
];

export default function QuickActions() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">{t('dashboard.quickActions')}</h3>
      </div>
      <div className="p-5 grid gap-3">
        {actions.map(({ to, icon: Icon, labelKey, color, bg }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ backgroundColor: bg }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <span className="text-sm font-medium text-foreground">{t(labelKey)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
