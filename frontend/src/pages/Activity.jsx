import { useEffect, useState, useMemo, Fragment } from 'react';
import { Mono, Rule, Tag } from '../components/ui.jsx';
import { TopBar } from '../components/layout/TopBar.jsx';
import { BottomNav } from '../components/layout/BottomNav.jsx';
import { PageFooter } from '../components/layout/PageFooter.jsx';
import { SettingsDrawer } from '../components/SettingsDrawer.jsx';
import { getMe, getActivities } from '../lib/api.js';

function RouteThumb({ svgPath }) {
  return (
    <svg viewBox="0 0 100 90" width="100%" height="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
      {[14, 28, 42, 56, 70].map((y) => (
        <line key={y} x1="0" y1={y} x2="100" y2={y - 6} stroke="var(--ink)" strokeOpacity=".06" strokeWidth=".3" />
      ))}
      {[20, 50, 80].map((x) => (
        <line key={x} x1={x} y1="0" x2={x - 6} y2="90" stroke="var(--ink)" strokeOpacity=".06" strokeWidth=".3" />
      ))}
      <path d={svgPath || ''} fill="none" stroke="var(--brand)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function buildHeatmap(activities) {
  // Returns a map of "weekIdx-dayIdx" → total minutes
  // weekIdx: 0-7 (from Period 1 to Period 8), dayIdx: 0-6 (Mon-Sun)
  const map = {};
  for (const a of activities) {
    if (!a.period_n) continue;
    const weekIdx = parseInt(a.period_n.replace('Period ', ''), 10) - 1;
    if (weekIdx < 0 || weekIdx > 7) continue;
    const dow = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'America/Chicago' }).format(new Date(a.datetime));
    const dowMap = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
    const dayIdx = dowMap[dow] ?? 0;
    const key = `${weekIdx}-${dayIdx}`;
    map[key] = (map[key] || 0) + a.minutes;
  }
  return map;
}

function Heatmap({ activities }) {
  const heatData = useMemo(() => buildHeatmap(activities), [activities]);
  const max = 80;
  const color = (mins) => {
    if (!mins) return 'var(--panel-alt)';
    const v = Math.min(1, mins / max);
    return `color-mix(in oklab, var(--brand) ${Math.round(v * 100)}%, var(--panel-alt))`;
  };
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-tight font-extrabold text-[15px] m-0" style={{ letterSpacing: '-0.01em' }}>Minutes by day</h3>
        <div className="hidden sm:flex items-center gap-[5px]">
          <Mono className="text-[9px] text-ink-soft tracking-[.1em] uppercase">Less</Mono>
          {[0, 20, 40, 60, 80].map((m) => (
            <div key={m} className="w-[10px] h-[10px] border border-rule-soft" style={{ background: color(m) }} />
          ))}
          <Mono className="text-[9px] text-ink-soft tracking-[.1em] uppercase">More</Mono>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '22px repeat(8, 1fr)', gap: 4, alignItems: 'center' }}>
        <span />
        {Array.from({ length: 8 }).map((_, w) => (
          <Mono key={w} className="text-[8px] text-ink-soft tracking-[.08em] uppercase text-center">WK{String(w + 1).padStart(2, '0')}</Mono>
        ))}
        {days.map((dl, d) => (
          <Fragment key={d}>
            <Mono className="text-[8px] text-ink-soft tracking-[.08em] text-right">{dl}</Mono>
            {Array.from({ length: 8 }).map((_, w) => {
              const mins = heatData[`${w}-${d}`] || 0;
              return (
                <div
                  key={`${w}-${d}`}
                  className="relative"
                  style={{ aspectRatio: '2.4 / 1', background: color(mins), border: '1px solid var(--rule-soft)' }}
                  title={`Wk ${w + 1}, ${dl} · ${mins} min`}
                >
                  {mins >= 60 && (
                    <Mono className="absolute inset-0 grid place-items-center text-[9px] font-bold text-panel">{mins}</Mono>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function ActivityCard({ a }) {
  const fmtDate = (isoStr) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/Chicago' });
  };
  return (
    <div style={{ padding: '16px 18px 18px' }}>
      <div className="bg-panel-alt mb-3 border border-rule-soft overflow-hidden" style={{ aspectRatio: '10 / 7' }}>
        <RouteThumb svgPath={a.svg_path} />
      </div>
      <div className="flex justify-between items-center mb-1">
        <Mono className="text-[10px] text-ink-soft tracking-[.12em] uppercase">{fmtDate(a.datetime)}</Mono>
        <Tag t={a.sport_type} className="text-ink border border-rule-soft" />
      </div>
      <div className="font-bold text-sm mb-2 [text-wrap:balance]" style={{ fontSize: 14.5, letterSpacing: '-0.01em', margin: '4px 0 8px' }}>{a.name}</div>
      <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-ink-soft">
        <div><div className="text-ink font-semibold">{a.minutes} min</div>time</div>
        <div><div className="text-ink font-semibold">{a.distance > 0 ? `${a.distance.toFixed(1)} mi` : '—'}</div>dist</div>
        <div><div className="text-ink font-semibold">{a.elevation_gain > 0 ? `${Math.round(a.elevation_gain)} ft` : '—'}</div>elev</div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Mono className="text-[11px] text-ink-soft">POINTS</Mono>
        <Mono className="text-lg font-extrabold text-brand">+{a.points?.toFixed(1) ?? 0}</Mono>
      </div>
    </div>
  );
}

export default function Activity() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [activities, setActivities] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sport, setSport] = useState('All');
  const [sort, setSort] = useState('Recent');

  const sports = ['All', 'Run', 'Ride', 'Walk', 'Swim', 'WeightTraining'];
  const sorts = ['Recent', 'Points', 'Distance'];

  async function fetchActivities(sportFilter) {
    setLoading(true);
    try {
      const params = sportFilter && sportFilter !== 'All' ? { sport: sportFilter } : {};
      const data = await getActivities(params);
      setActivities(data.results ?? []);
      setTotalCount(data.count ?? 0);
      setNextUrl(data.next ?? null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([getMe(), getActivities()]).then(([meData, actData]) => {
      setMe(meData);
      setActivities(actData.results ?? []);
      setTotalCount(actData.count ?? 0);
      setNextUrl(actData.next ?? null);
    });
  }, []);

  async function handleLoadMore() {
    if (!nextUrl) return;
    setLoadingMore(true);
    try {
      // nextUrl is an absolute URL from the API; fetch it directly
      const res = await fetch(nextUrl, { credentials: 'include' });
      const data = await res.json();
      setActivities((prev) => [...prev, ...(data.results ?? [])]);
      setNextUrl(data.next ?? null);
    } finally {
      setLoadingMore(false);
    }
  }

  // When sport filter changes, re-fetch
  useEffect(() => {
    fetchActivities(sport);
  }, [sport]);

  const filtered = useMemo(() => {
    const sorted = [...activities];
    if (sort === 'Points') sorted.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
    else if (sort === 'Distance') sorted.sort((a, b) => (b.distance ?? 0) - (a.distance ?? 0));
    return sorted;
  }, [activities, sort]);

  return (
    <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-7 pb-20 relative" data-page-root>
      <TopBar settingsOpen={settingsOpen} onAvatarClick={() => setSettingsOpen((o) => !o)} />
      <Rule weight={1.5} />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <div className="py-[26px] pb-[22px]">
        <Mono className="text-[11px] text-ink-soft tracking-[.18em] uppercase">Your activity — season to date</Mono>
        <h1 className="font-tight font-extrabold text-[56px] leading-none mt-2 mb-0 [text-wrap:balance]" style={{ lineHeight: 1.02, letterSpacing: '-0.035em' }}>
          <Mono className="font-tight font-extrabold text-brand" style={{ fontSize: 'inherit', letterSpacing: '-0.035em' }}>{totalCount}</Mono> activities · <Mono className="font-tight font-extrabold" style={{ fontSize: 'inherit', letterSpacing: '-0.035em' }}>{(me?.total_minutes ?? 0).toLocaleString()}</Mono> minutes logged.
        </h1>
      </div>

      <Rule soft />

      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-rule-soft">
        {[
          { k: 'ACTIVITIES',  v: totalCount,             sub: 'this season',                                  accentClass: 'text-brand' },
          { k: 'MINUTES',     v: me?.total_minutes ?? 0, sub: 'logged via Strava',                            accentClass: 'text-accent-2' },
          { k: 'POINTS',      v: +(me?.total_points?.toFixed(1) ?? 0), sub: `this season`,                    accentClass: 'text-ink' },
          { k: 'DAY STREAK',  v: me?.streak ?? 0,        sub: 'current streak',                               accentClass: 'text-accent' },
        ].map((s, i) => (
          <div key={s.k} className={`p-[22px] pb-[26px]${i ? ' border-l border-rule-soft' : ''}`}>
            <Mono className="text-[10px] tracking-[.16em] text-ink-soft">{s.k}</Mono>
            <div className={`font-tight font-extrabold text-[52px] leading-none mt-2 ${s.accentClass}`} style={{ letterSpacing: '-0.04em' }}>
              {typeof s.v === 'number' ? s.v.toLocaleString() : s.v}
            </div>
            <div className="text-xs text-ink-soft mt-[6px]">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-7">
        <Heatmap activities={activities} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 pb-[10px] border-b" style={{ borderBottomWidth: '1.5px', borderBottomColor: 'var(--ink)' }}>
        <div className="flex items-center gap-3">
          <h2 className="font-tight font-extrabold text-[22px] m-0" style={{ letterSpacing: '-0.02em' }}>All activities</h2>
          <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">{filtered.length} of {totalCount}</Mono>
        </div>
        <div className="flex items-center gap-[18px]">
          <div className="flex items-center gap-[6px]">
            <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Sport</Mono>
            <div className="flex border border-rule-soft">
              {sports.map((s) => (
                <button
                  key={s}
                  onClick={() => setSport(s)}
                  className={`px-[10px] py-[5px] font-mono text-[10px] tracking-[.12em] uppercase cursor-pointer border-0${s !== sports[sports.length - 1] ? ' border-r border-rule-soft' : ''}${sport === s ? ' bg-ink text-panel font-bold' : ' bg-transparent text-ink-soft font-medium'}`}
                >
                  {s === 'WeightTraining' ? 'Lift' : s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-[6px]">
            <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Sort</Mono>
            <div className="flex border border-rule-soft">
              {sorts.map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`px-[10px] py-[5px] font-mono text-[10px] tracking-[.12em] uppercase cursor-pointer border-0${s !== sorts[sorts.length - 1] ? ' border-r border-rule-soft' : ''}${sort === s ? ' bg-ink text-panel font-bold' : ' bg-transparent text-ink-soft font-medium'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-ink-soft text-sm">Loading activities…</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-ink-soft text-sm">No activities yet for this filter.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((a, i) => (
              <div
                key={a.activity_id}
                className={[
                  i % 4 !== 3 ? 'border-r border-rule-soft' : '',
                  i < filtered.length - (filtered.length % 4 || 4) ? 'border-b border-rule-soft' : '',
                ].filter(Boolean).join(' ')}
              >
                <ActivityCard a={a} />
              </div>
            ))}
          </div>
          {nextUrl && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-3 border border-rule font-tight font-bold text-[13px] tracking-[.06em] uppercase cursor-pointer bg-transparent text-ink disabled:opacity-50"
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}

      <PageFooter />
      <BottomNav />
    </div>
  );
}
