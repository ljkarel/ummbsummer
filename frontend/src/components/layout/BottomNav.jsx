import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, FireIcon, PaintBrushIcon, UserGroupIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, FireIcon as FireIconSolid, PaintBrushIcon as PaintBrushIconSolid, UserGroupIcon as UserGroupIconSolid, Cog6ToothIcon as Cog6ToothIconSolid } from '@heroicons/react/24/solid';
import { useSettings } from '../../contexts/SettingsContext.jsx';

const NAV_ITEMS = [
  { label: 'Home',     to: '/',         Icon: HomeIcon,       IconActive: HomeIconSolid       },
  { label: 'Activity', to: '/activity', Icon: FireIcon,       IconActive: FireIconSolid       },
  { label: 'Art',      to: '/art',      Icon: PaintBrushIcon, IconActive: PaintBrushIconSolid },
  { label: 'Roster',   to: '/roster',   Icon: UserGroupIcon,  IconActive: UserGroupIconSolid  },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const { open: settingsOpen, setOpen: setSettingsOpen } = useSettings();
  const isActive = (to) => to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <div className="flex sm:hidden fixed bottom-0 left-0 right-0 justify-around bg-panel border-t border-rule-soft px-1 pt-1.5 pb-2 z-50">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.to);
        const Icon = active ? item.IconActive : item.Icon;
        return (
          <Link key={item.to} to={item.to} className="no-underline flex-1">
            <div className="flex flex-col items-center gap-0.5 px-2 py-1">
              <span className={`w-1 h-1 rounded-full ${active ? 'bg-brand' : 'bg-transparent'}`} />
              <Icon className={`size-6 ${active ? 'text-brand' : 'text-ink-soft'}`} />
            </div>
          </Link>
        );
      })}
      <button
        onClick={() => setSettingsOpen((o) => !o)}
        aria-label="Open settings"
        className="flex-1 bg-transparent border-0 cursor-pointer p-0"
      >
        <div className="flex flex-col items-center gap-0.5 px-2 py-1">
          <span className={`w-1 h-1 rounded-full ${settingsOpen ? 'bg-brand' : 'bg-transparent'}`} />
          {settingsOpen
            ? <Cog6ToothIconSolid className="size-6 text-brand" />
            : <Cog6ToothIcon className="size-6 text-ink-soft" />}
        </div>
      </button>
    </div>
  );
}
