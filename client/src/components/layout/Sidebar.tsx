import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  PenSquare,
  FileText,
  Users,
  Image,
  FolderOpen,
  Layers,
  Scissors,
  CalendarClock,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { path: '/create', icon: PenSquare, labelKey: 'nav.createPost' },
  { path: '/bulk', icon: Layers, labelKey: 'nav.bulkCreate' },
  { path: '/shorts', icon: Scissors, labelKey: 'nav.shorts' },
  { path: '/auto-schedule', icon: CalendarClock, labelKey: 'nav.autoSchedule' },
  { path: '/posts', icon: FileText, labelKey: 'nav.posts' },
  { path: '/accounts', icon: Users, labelKey: 'nav.accounts' },
  { path: '/media', icon: Image, labelKey: 'nav.media' },
  { path: '/drive', icon: FolderOpen, labelKey: 'nav.drive' },
  { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {mobileOpen && (
        <div
          id="sidebar-overlay-017"
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="layout-sidebar-001"
        className={`
          flex flex-col border-r border-border bg-card h-screen transition-all duration-200
          fixed z-50 sm:sticky sm:top-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          sm:translate-x-0
          ${collapsed ? 'w-60 sm:w-16' : 'w-60'}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          {(!collapsed || mobileOpen) && (
            <h1 className="text-lg font-bold text-primary">{t('common.appName')}</h1>
          )}
          <button
            id="sidebar-close-mobile-018"
            onClick={onCloseMobile}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground sm:hidden"
          >
            <X size={18} />
          </button>
          <button
            id="sidebar-toggle-002"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground hidden sm:block"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ path, icon: Icon, labelKey }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Icon size={18} />
              {(!collapsed || mobileOpen) && <span>{t(labelKey)}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
