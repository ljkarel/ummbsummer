import { useEffect, useState, useMemo } from 'react';
import { Mono, Rule, Tag } from '../components/ui.jsx';
import { TopBar } from '../components/layout/TopBar.jsx';
import { BottomNav } from '../components/layout/BottomNav.jsx';
import { PageFooter } from '../components/layout/PageFooter.jsx';
import { SettingsDrawer } from '../components/SettingsDrawer.jsx';
import { getRoster } from '../lib/api.js';

const SECTION_SLUGS = [
  { name: 'All', slug: '' },
  { name: 'Baritones', slug: 'baritones' },
  { name: 'Clarinets', slug: 'clarinets' },
  { name: 'Color Guard', slug: 'color-guard' },
  { name: 'Drumline', slug: 'drumline' },
  { name: 'Flutes', slug: 'flutes' },
  { name: 'Mellophones', slug: 'mellophones' },
  { name: 'Pit', slug: 'pit' },
  { name: 'Trombones', slug: 'trombones' },
  { name: 'Trumpets', slug: 'trumpets' },
  { name: 'Tubas', slug: 'tubas' },
];

function StatusDot({ status }) {
  const dotClass = status === 'connected' ? 'bg-good' : status === 'pending' ? 'bg-accent' : 'bg-ink-soft';
  const labels = { connected: 'Connected', pending: 'Pending Strava connect', unregistered: 'Not signed in' };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      <Mono className="text-[10px] text-ink-soft tracking-[.08em]">{labels[status]}</Mono>
    </span>
  );
}

function MemberCard({ m }) {
  return (
    <div className="p-3" style={m.is_me ? { background: 'rgba(0,0,0,.025)' } : undefined}>
      <div className={`${m.is_me ? 'font-extrabold text-brand' : 'font-bold text-ink'} text-[13.5px] tracking-[-0.01em] flex items-baseline gap-1.5 min-w-0`}>
        <span className="overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{m.name}</span>
        {m.is_leader && <Mono className="text-[9px] text-ink-soft tracking-[.14em] shrink-0">LEAD</Mono>}
        {m.is_me && <Mono className="text-[9px] text-ink-soft tracking-[.14em] shrink-0">YOU</Mono>}
      </div>
      <Mono className="text-[10px] text-ink-soft mt-0.5 block whitespace-nowrap overflow-hidden text-ellipsis">
        {m.section} · {m.year}
      </Mono>
      <div className="mt-1.5">
        <StatusDot status={m.status} />
      </div>
    </div>
  );
}

export default function Roster() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (sectionFilter) params.section = sectionFilter;
    if (statusFilter !== 'All') params.status = statusFilter;
    getRoster(params)
      .then(setMembers)
      .finally(() => setLoading(false));
  }, [sectionFilter, statusFilter]);

  const stats = useMemo(() => {
    const connected = members.filter((m) => m.status === 'connected').length;
    const pending = members.filter((m) => m.status === 'pending').length;
    const unregistered = members.filter((m) => m.status === 'unregistered').length;
    return { total: members.length, connected, pending, unregistered };
  }, [members]);

  // When filters are cleared, stats represent the full filtered list
  // Use unfiltered totals from an unfiltered fetch for the funnel
  const [allStats, setAllStats] = useState({ total: 0, connected: 0, pending: 0, unregistered: 0 });
  useEffect(() => {
    getRoster().then((all) => {
      const connected = all.filter((m) => m.status === 'connected').length;
      const pending = all.filter((m) => m.status === 'pending').length;
      const unregistered = all.filter((m) => m.status === 'unregistered').length;
      setAllStats({ total: all.length, connected, pending, unregistered });
    });
  }, []);

  return (
    <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-7 pb-20 relative" data-page-root>
      <TopBar settingsOpen={settingsOpen} onAvatarClick={() => setSettingsOpen((o) => !o)} />
      <Rule />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-end py-[26px]">
        <div>
          <Mono className="text-[11px] text-ink-soft tracking-[.18em] uppercase">Roster · Summer '26</Mono>
          <h1 className="font-tight font-extrabold text-[56px] leading-none tracking-[-0.035em] mt-2 text-balance">
            <Mono className="font-tight font-extrabold text-[56px] tracking-[-0.035em] text-brand">{allStats.total}</Mono> members across<br />
            {SECTION_SLUGS.length - 1} sections.
          </h1>
          <div className="flex gap-2.5 mt-4 flex-wrap">
            <Tag t={`${allStats.connected} connected to Strava`} className="bg-chip text-chip-ink" />
            <Tag t={`${allStats.pending} pending Strava`} className="text-ink border border-rule-soft" />
            <Tag t={`${allStats.unregistered} not signed in yet`} className="text-ink border border-rule-soft" />
          </div>
        </div>
        <div className="bg-panel px-5 py-[18px] border border-rule-soft">
          <Mono className="text-[11px] text-ink-soft tracking-[.14em] uppercase block mb-2.5">Sign-in funnel</Mono>
          <div
            className="grid h-6 gap-0.5"
            style={{
              gridTemplateColumns: allStats.total > 0
                ? `${allStats.connected}fr ${allStats.pending}fr ${allStats.unregistered}fr`
                : '1fr 1fr 1fr',
            }}
          >
            <div className="bg-good" title={`${allStats.connected} connected`} />
            <div className="bg-accent" title={`${allStats.pending} pending`} />
            <div className="bg-ink-soft opacity-40" title={`${allStats.unregistered} unregistered`} />
          </div>
          <div className="flex justify-between mt-2">
            <Mono className="text-[10px] text-ink-soft tracking-[.1em] uppercase">Strava connected</Mono>
            <Mono className="text-[10px] text-ink-soft tracking-[.1em] uppercase">Not signed in</Mono>
          </div>
          <div className="flex gap-[18px] mt-3">
            <div>
              <Mono className="text-[10px] text-ink-soft tracking-[.12em]">CONNECTED</Mono>
              <Mono className="block text-[22px] font-extrabold text-good mt-0.5">{allStats.connected}</Mono>
            </div>
            <div>
              <Mono className="text-[10px] text-ink-soft tracking-[.12em]">PENDING</Mono>
              <Mono className="block text-[22px] font-extrabold text-accent mt-0.5">{allStats.pending}</Mono>
            </div>
            <div>
              <Mono className="text-[10px] text-ink-soft tracking-[.12em]">UNREGISTERED</Mono>
              <Mono className="block text-[22px] font-extrabold text-ink-soft mt-0.5">{allStats.unregistered}</Mono>
            </div>
          </div>
        </div>
      </div>

      <Rule soft />

      {/* Filters */}
      <div className="mt-[18px] mb-3.5 flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Section</Mono>
          {SECTION_SLUGS.map(({ name, slug }) => (
            <button
              key={name}
              onClick={() => setSectionFilter(slug)}
              className={`px-[11px] py-[6px] font-tight text-[12px] tracking-[-0.01em] cursor-pointer leading-none border ${
                sectionFilter === slug
                  ? 'bg-ink text-panel border-ink font-bold'
                  : 'bg-transparent text-ink border-rule-soft font-medium'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Status</Mono>
          {['All', 'connected', 'pending', 'unregistered'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-[11px] py-[6px] font-mono text-[10.5px] tracking-[.06em] uppercase cursor-pointer leading-none border ${
                statusFilter === s
                  ? 'bg-ink text-panel border-ink font-bold'
                  : 'bg-transparent text-ink border-rule-soft font-medium'
              }`}
            >
              {s}
            </button>
          ))}
          <div className="flex-1" />
          <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">
            Showing {members.length}{allStats.total !== members.length ? ` of ${allStats.total}` : ''} members
          </Mono>
        </div>
      </div>

      <Rule />

      {/* Member grid */}
      {loading ? (
        <div className="py-16 text-center text-ink-soft text-sm">Loading roster…</div>
      ) : members.length === 0 ? (
        <div className="py-[60px] text-center font-tight text-lg text-ink-soft">Nobody matches this filter.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5">
          {members.map((m, i) => {
            const cols = 5;
            const lastRowStart = members.length - (members.length % cols || cols);
            const isLastCol = i % cols === cols - 1;
            const isLastRow = i >= lastRowStart;
            return (
              <div
                key={`${m.name}-${i}`}
                className={[
                  !isLastCol ? 'border-r border-rule-soft' : '',
                  !isLastRow ? 'border-b border-rule-soft' : '',
                ].join(' ')}
              >
                <MemberCard m={m} />
              </div>
            );
          })}
        </div>
      )}

      <PageFooter />
      <BottomNav />
    </div>
  );
}
