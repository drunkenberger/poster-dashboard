import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  PenSquare,
  FileText,
  Users,
  Image,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { path: '/create', icon: PenSquare, labelKey: 'nav.createPost' },
  { path: '/posts', icon: FileText, labelKey: 'nav.posts' },
  { path: '/accounts', icon: Users, labelKey: 'nav.accounts' },
  { path: '/media', icon: Image, labelKey: 'nav.media' },
  { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

export default function Sidebar() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      id="layout-sidebar-001"
      className={`flex flex-col border-r border-border bg-card h-screen sticky top-0 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <h1 className="text-lg font-bold text-primary">{t('common.appName')}</h1>
        )}
        <button
          id="sidebar-toggle-002"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-muted text-muted-foreground"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(({ path, icon: Icon, labelKey }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <Icon size={18} />
            {!collapsed && <span>{t(labelKey)}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
