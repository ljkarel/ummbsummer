import { Link, useLocation } from 'react-router-dom';
import { Mono } from '../ui.jsx';
import { TODAY } from '../../lib/mock.js';

const NAV_ITEMS = [
  { label: 'Dashboard',   to: '/'            },
  { label: 'Activity',    to: '/activity'    },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Strava Art',  to: '/art'         },
  { label: 'Roster',      to: '/roster'      },
];

export function TopBar({ settingsOpen, onAvatarClick }) {
  const { pathname } = useLocation();
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
        </nav>

        <button
          aria-label="Menu"
          className="flex sm:hidden w-8 h-8 bg-transparent text-ink border border-rule-soft cursor-pointer items-center justify-center"
        >
          <svg width="14" height="14" viewBox="0 0 16 16">
            <g stroke="var(--ink)" strokeWidth="1.5">
              <line x1="2" y1="4" x2="14" y2="4" />
              <line x1="2" y1="8" x2="14" y2="8" />
              <line x1="2" y1="12" x2="14" y2="12" />
            </g>
          </svg>
        </button>

        <button
          onClick={onAvatarClick}
          aria-label="Open settings"
          className="w-8 h-8 bg-transparent border border-rule-soft grid place-items-center cursor-pointer"
          style={{ outline: settingsOpen ? '2px solid var(--brand)' : 'none', outlineOffset: '1px', transition: 'outline .1s' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5.5" r="2.5" stroke="var(--ink)" strokeWidth="1.4" />
            <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="var(--ink)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
