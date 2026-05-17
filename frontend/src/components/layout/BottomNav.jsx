import { Link, useLocation } from 'react-router-dom';
import { Mono } from '../ui.jsx';

const NAV_ITEMS = [
  { label: 'Home',     to: '/'            },
  { label: 'Activity', to: '/activity'    },
  { label: 'Board',    to: '/leaderboard' },
  { label: 'Art',      to: '/art'         },
  { label: 'Roster',   to: '/roster'      },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const isActive = (to) => to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <div className="flex sm:hidden fixed bottom-0 left-0 right-0 justify-around bg-panel border-t border-rule-soft px-1 pt-1.5 pb-2 z-50">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.to);
        return (
          <Link key={item.to} to={item.to} className="no-underline flex-1">
            <div className="flex flex-col items-center gap-0.5 px-2 py-1">
              <span className={`w-1 h-1 rounded-full ${active ? 'bg-brand' : 'bg-transparent'}`} />
              <Mono className={`text-[10px] tracking-[.08em] uppercase ${active ? 'font-bold text-brand' : 'font-medium text-ink-soft'}`}>
                {item.label}
              </Mono>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
