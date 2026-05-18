import { Link, useLocation } from 'react-router-dom';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Mono } from '../ui.jsx';
import { BASE } from '../../lib/api.js';
import { useSettings } from '../../contexts/SettingsContext.jsx';
const TODAY = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

const NAV_ITEMS = [
  { label: 'Home',   to: '/'         },
  { label: 'My Activity',    to: '/activity' },
  { label: 'Strava Art',  to: '/art'      },
  { label: 'Roster',      to: '/roster'   },
];

export function TopBar({ stravaConnected = true }) {
  const { pathname } = useLocation();
  const { open: settingsOpen, setOpen: setSettingsOpen } = useSettings();
  const isActive = (to) => to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <div className="flex items-center justify-between pb-3.5 gap-4">
      <div className="font-tight font-extrabold text-[22px] tracking-[-0.02em]">
        UMMB<span className="text-brand">·</span>SUMMER
        <Mono className="font-medium text-sm ml-2 text-ink-soft">{'\'26'}</Mono>
      </div>

      <div className="flex items-center gap-3.5">
        <Mono className="hidden sm:block text-[11px] text-ink-soft tracking-[.1em] uppercase">
          {TODAY}
        </Mono>

        <nav className="hidden sm:flex gap-[18px] text-[13px]">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`no-underline pb-0.5 border-b-2 ${
                  active
                    ? 'font-semibold text-ink border-brand'
                    : 'font-normal text-ink-soft border-transparent'
                }`}
              >{item.label}</Link>
            );
          })}
          {!stravaConnected && (
            <button
              onClick={() => { window.location.href = `${BASE}/api/strava/init/`; }}
              className="pb-0.5 border-b-2 border-brand font-semibold text-brand text-[13px] bg-transparent border-l-0 border-r-0 border-t-0 cursor-pointer p-0"
            >Connect Strava</button>
          )}
        </nav>

        <button
          onClick={() => setSettingsOpen((o) => !o)}
          aria-label="Open settings"
          className="hidden sm:flex w-5 h-5 bg-transparent cursor-pointer items-center justify-center"
          style={{ color: settingsOpen ? 'var(--brand)' : 'var(--ink)', transition: 'color .1s' }}
        >
          <Cog6ToothIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
