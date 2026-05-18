import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mono, Rule, Tag, CountUp, ScoringCurve, RouteMap, TrendCell, TrendHeader } from '../components/ui.jsx';
import { useFlipAnimation } from '../lib/useFlipAnimation.js';
import { TopBar } from '../components/layout/TopBar.jsx';
import { BottomNav } from '../components/layout/BottomNav.jsx';
import { PageFooter } from '../components/layout/PageFooter.jsx';
import { SettingsDrawer } from '../components/SettingsDrawer.jsx';
import { BASE, getMe, getPeriods, getScoreboard, getActivities } from '../lib/api.js';

const CT = 'America/Chicago';

function fmtDateRange(start, end) {
  if (!start || !end) return '';
  const opts = { month: 'short', day: 'numeric', timeZone: CT };
  return `${new Date(start + 'T12:00:00Z').toLocaleDateString('en-US', opts)} – ${new Date(end + 'T12:00:00Z').toLocaleDateString('en-US', opts)}`;
}

function fmtFreeze(dtStr) {
  if (!dtStr) return '';
  return new Date(dtStr).toLocaleString('en-US', {
    weekday: 'short', hour: 'numeric', minute: '2-digit', timeZone: CT,
  });
}

function fmtActivityDate(isoStr) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: CT });
}


function periodN(period, idx) {
  return idx + 1;
}

function Countdown({ target }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [target]);
  const ms = Math.max(0, new Date(target) - Date.now());
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [sections, setSections] = useState([]);
  const [activities, setActivities] = useState([]);
  const [lbMode, setLbMode] = useState('week');
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lbAnimated, setLbAnimated] = useState(false);
  const [stravaModalDismissed, setStravaModalDismissed] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  // Capture the param value once at mount into stable state, then clear the URL.
  const [stravaWasCancelled] = useState(() => searchParams.get('strava_cancelled') === 'true');

  useEffect(() => {
    if (stravaWasCancelled) setSearchParams({}, { replace: true });
  }, []);

  useEffect(() => {
    Promise.all([getMe(), getPeriods(), getScoreboard(), getActivities()]).then(
      ([meData, periodsData, sectionsData, actData]) => {
        setMe(meData);
        setPeriods(periodsData);
        setSections(sectionsData);
        setActivities(actData.results ?? []);
        const live = periodsData.find((p) => p.state === 'live');
        if (live) setSelectedPeriodId(live.id);
      }
    );
  }, []);

  useEffect(() => {
    if (sections.length === 0) return;
    setLbAnimated(false);
    const id = setTimeout(() => setLbAnimated(true), 16);
    return () => clearTimeout(id);
  }, [lbMode, selectedPeriodId, sections.length]);

  const livePeriod = useMemo(() => periods.find((p) => p.state === 'live'), [periods]);
  const selectedPeriodIdx = useMemo(
    () => periods.findIndex((p) => p.id === selectedPeriodId),
    [periods, selectedPeriodId]
  );

  const valueFor = (s) => {
    if (selectedPeriodIdx < 0) return 0;
    if (lbMode === 'week') return s.periods[selectedPeriodIdx] ?? 0;
    return s.periods.slice(0, selectedPeriodIdx + 1).reduce((sum, v) => sum + (v ?? 0), 0);
  };

  const sectionsSorted = useMemo(
    () => [...sections].sort((a, b) => valueFor(b) - valueFor(a)),
    [sections, lbMode, selectedPeriodIdx]
  );

  const lbListRef = useFlipAnimation(sectionsSorted);

  const mySection = sections.find((s) => s.is_me);
  const myRank = sectionsSorted.findIndex((s) => s.is_me) + 1;
  const weekMinutes = me?.week_minutes ?? 0;

  const stravaConnected = me?.strava_connected ?? true;
  const showStravaModal = !stravaModalDismissed && (stravaWasCancelled || (me !== null && !stravaConnected));

  return (
    <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-7 pb-20 relative" data-page-root>
      <TopBar settingsOpen={settingsOpen} onAvatarClick={() => setSettingsOpen((o) => !o)} stravaConnected={stravaConnected} />
      <Rule weight={1.5} />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Strava not-connected modal */}
      {showStravaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="bg-panel border border-rule max-w-[440px] w-full mx-6 px-8 py-8">
            <Mono className="text-[11px] text-ink-soft tracking-[.18em] uppercase block mb-3">Strava not connected</Mono>
            <h2 className="font-tight font-extrabold text-[28px] tracking-[-0.025em] m-0 mb-3">Connect Strava to contribute.</h2>
            <p className="text-sm text-ink-soft leading-relaxed m-0 mb-7">
              Connecting Strava is required to log activity and earn points for your section. Activities sync automatically once connected.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => { window.location.href = `${BASE}/api/strava/init/`; }}
                className="px-6 py-3.5 bg-brand text-panel border-none font-tight font-bold text-[13px] tracking-[.06em] uppercase cursor-pointer"
                style={{ boxShadow: '0 4px 0 var(--ink)' }}
              >
                Connect Strava →
              </button>
              <button
                onClick={() => setStravaModalDismissed(true)}
                className="px-6 py-3.5 bg-transparent text-ink-soft border border-rule-soft font-tight font-bold text-[13px] tracking-[.06em] uppercase cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Strava reminder banner */}
      {!showStravaModal && me !== null && !stravaConnected && (
        <div className="sm:hidden flex items-center justify-between gap-3 mt-3 mb-1 px-4 py-3 border border-rule-soft bg-panel">
          <Mono className="text-[11px] text-ink-soft tracking-[.06em]">Strava not connected — points won't count until you do.</Mono>
          <button onClick={() => { window.location.href = `${BASE}/api/strava/init/`; }} className="text-[11px] font-mono font-bold text-brand bg-transparent border-none cursor-pointer whitespace-nowrap p-0">Connect →</button>
        </div>
      )}

      {/* Hero grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-end py-[26px]">
        <div>
          <Mono className="text-[11px] text-ink-soft tracking-[.18em] uppercase">
            {me ? `Hey ${me.name} —` : 'Loading…'}
          </Mono>
          <h1 className="font-tight font-extrabold text-[56px] leading-[1.02] tracking-[-0.035em] mt-2 m-0 [text-wrap:balance]">
            <Mono className="font-tight font-extrabold text-[inherit] tracking-[-0.035em] text-brand">
              {weekMinutes}
            </Mono>{' '}
            minutes banked this week.
          </h1>
          <div className="flex gap-2.5 mt-4 flex-wrap">
            {mySection && myRank > 0 && (
              <Tag t={`${mySection.name} · #${myRank} of ${sections.length}`} className="bg-chip text-chip-ink" />
            )}
            <Tag t={`Streak · ${me?.streak ?? 0} days`} className="text-ink border border-rule-soft" />
            <Tag t={`Summer total · ${me?.total_points?.toFixed(1) ?? 0} pts`} className="text-ink border border-rule-soft" />
          </div>
        </div>
        <div className="bg-panel px-5 py-[18px] border border-rule-soft">
          <div className="flex justify-between items-center mb-2.5">
            <Mono className="text-[11px] tracking-[.14em] uppercase text-ink-soft">
              {livePeriod?.name ?? '—'}
            </Mono>
            {livePeriod && <Tag t="LIVE" className="bg-brand text-panel" />}
          </div>
          <div className="font-tight font-bold text-[22px] tracking-[-0.02em]">
            {livePeriod ? fmtDateRange(livePeriod.start_date, livePeriod.end_date) : '—'}
          </div>
          {livePeriod && (
            <div className="mt-2.5 text-xs text-ink-soft">
              Snapshot freezes <strong className="text-ink">{fmtFreeze(livePeriod.freeze_datetime)}</strong>. Section averages lock in for the parent competition.
            </div>
          )}
        </div>
      </div>

      <Rule soft />

      {/* Stats 4-col */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-rule-soft">
        {[
          { k: 'MINUTES THIS WEEK', v: weekMinutes, sub: `${activities.length} recent activities`, accent: 'text-brand' },
          { k: 'POINTS THIS WEEK', v: me?.week_points ?? 0, sub: `${me?.total_points?.toFixed(1) ?? 0} pts this summer`, accent: 'text-accent-2' },
          { k: 'SECTION RANK', v: myRank > 0 ? `#${myRank}` : '—', sub: mySection ? `${mySection.name} · ${mySection.members} members` : '—', accent: 'text-ink' },
          { k: 'DAYS LEFT IN WEEK', freeze: livePeriod?.freeze_datetime ?? null, sub: livePeriod ? `until ${fmtFreeze(livePeriod.freeze_datetime)}` : '—', accent: 'text-accent' },
        ].map((s, i) => {
          const hoursLeft = s.freeze ? Math.max(0, (new Date(s.freeze) - Date.now()) / 3_600_000) : null;
          const showCountdown = hoursLeft != null && hoursLeft < 24;
          return (
            <div key={s.k} className={`px-[22px] pt-[22px] pb-[26px]${i ? ' border-l border-rule-soft' : ''}`}>
              <Mono className="text-[10px] tracking-[.16em] text-ink-soft">{showCountdown ? 'TIME LEFT IN WEEK' : s.k}</Mono>
              <div className={`font-tight font-extrabold text-[52px] leading-none tracking-[-0.04em] mt-2 ${s.accent}`}>
                {showCountdown
                  ? <Countdown target={s.freeze} />
                  : s.freeze
                    ? <CountUp to={Math.ceil(hoursLeft / 24)} />
                    : typeof s.v === 'number' ? <CountUp to={s.v} /> : s.v}
              </div>
              <div className="text-xs text-ink-soft mt-1.5">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Main 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-7 mt-7">
        <section>
          <div className="flex items-baseline justify-between mb-2.5">
            <h2 className="font-tight font-extrabold text-[22px] tracking-[-0.02em] m-0">Section leaderboard</h2>
            <div className="flex items-center gap-1.5 p-[3px] border border-rule-soft">
              {[{ v: 'week', label: 'Weekly' }, { v: 'season', label: 'Summer Total' }].map((o) =>
                <button key={o.v} onClick={() => setLbMode(o.v)}
                  className={`font-mono text-[10px] tracking-[.12em] uppercase px-2.5 py-[5px] border-none cursor-pointer${lbMode === o.v ? ' bg-ink text-panel font-bold' : ' bg-transparent text-ink-soft font-medium'}`}>
                  {o.label}
                </button>
              )}
            </div>
          </div>
          <Rule weight={1.5} />
          <div className="border-b border-rule-soft" style={{ display: 'grid', gridTemplateColumns: '28px 1.4fr 2.5fr 70px 28px', gap: 12, padding: '10px 0 8px' }}>
            <Mono className="text-[9px] text-ink-soft tracking-[.14em]">#</Mono>
            <Mono className="text-[9px] text-ink-soft tracking-[.14em]">SECTION</Mono>
            <Mono className="text-[9px] text-ink-soft tracking-[.14em]">
              {lbMode === 'week'
                ? `AVG PTS · ${selectedPeriodIdx >= 0 ? `WK ${String(selectedPeriodIdx + 1).padStart(2, '0')}` : '—'}${livePeriod && selectedPeriodId === livePeriod.id ? ' (LIVE)' : ''}`
                : `Σ WEEKLY AVGS · THRU WK ${selectedPeriodIdx >= 0 ? String(selectedPeriodIdx + 1).padStart(2, '0') : '—'}`}
            </Mono>
            <Mono className="text-[9px] text-ink-soft tracking-[.14em] text-right">{lbMode === 'week' ? 'PTS' : 'TOTAL'}</Mono>
            <TrendHeader />
          </div>
          <div ref={lbListRef}>
            {sectionsSorted.map((s, i) => {
              const value = valueFor(s);
              const max = valueFor(sectionsSorted[0]) || 1;
              const w = (value / max) * 100;
              const isTop = i === 0;
              const trend = s.trend ?? 0;
              return (
                <div key={s.name} data-section={s.name}
                  className={`border-b border-rule-soft items-center${s.is_me ? ' bg-black/[.025]' : ' bg-transparent'}`}
                  style={{ display: 'grid', gridTemplateColumns: '28px 1.4fr 2.5fr 70px 28px', alignItems: 'center', gap: 12, padding: '12px 0' }}>
                  <Mono className={`text-[13px]${isTop ? ' text-brand font-bold' : ' text-ink-soft font-medium'}`}>{String(i + 1).padStart(2, '0')}</Mono>
                  <div className="flex items-center gap-2">
                    <span className={`text-[15px] tracking-[-0.01em]${s.is_me ? ' font-bold' : ' font-semibold'}`}>{s.name}</span>
                    {s.is_me && <Tag t="YOU" className="bg-chip text-chip-ink" />}
                  </div>
                  <div className="relative h-[10px]">
                    <div className="absolute inset-0 bg-rule-soft" style={{ height: 1, top: '50%' }} />
                    <div className="absolute left-0 top-0 bottom-0"
                      style={{
                        width: lbAnimated ? `${w}%` : '0%',
                        background: isTop ? 'var(--brand)' : s.is_me ? 'var(--accent-2)' : 'var(--accent)',
                        opacity: isTop ? 1 : s.is_me ? 0.95 : 0.7,
                        transition: lbAnimated ? `width 0.55s cubic-bezier(0.2, 0.7, 0.3, 1) ${i * 35}ms` : 'none',
                      }} />
                  </div>
                  <Mono className="text-right text-[15px] font-bold text-ink">
                    <CountUp key={`${selectedPeriodId}-${lbMode}`} to={value} dur={700} format={(v) => v.toFixed(1)} />
                  </Mono>
                  <TrendCell trend={trend} />
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-6">

          {/* Timeline */}
          <div>
            <div className="flex justify-between items-baseline mb-4">
              <h3 className="font-tight font-extrabold text-lg m-0 tracking-[-0.01em]">Competition timeline</h3>
              <Mono className="text-[11px] text-ink-soft">Summer '26 · {periods.length} weeks</Mono>
            </div>

            {/* Slider track + thumb */}
            <div className="relative h-[18px] flex items-center">
              {/* Segmented track */}
              <div className="absolute inset-x-0 flex gap-px h-1.5">
                {periods.map((p) => (
                  <div
                    key={p.id}
                    className={`flex-1 ${p.state === 'live' ? 'bg-brand' : p.state === 'done' ? 'bg-ink-soft' : 'bg-rule-soft'}`}
                  />
                ))}
              </div>

              {/* Sliding thumb */}
              {selectedPeriodIdx >= 0 && (
                <div
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-panel border-2 border-brand shadow pointer-events-none z-10 transition-[left] duration-150"
                  style={{ left: `${((selectedPeriodIdx + 0.5) / periods.length) * 100}%` }}
                />
              )}

              {/* Click zones */}
              <div className="absolute inset-0 flex">
                {periods.map((p) => {
                  const isFuture = p.state === 'future';
                  return (
                    <button
                      key={p.id}
                      onClick={() => !isFuture && setSelectedPeriodId(p.id)}
                      disabled={isFuture}
                      className={`flex-1 outline-none ${isFuture ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Week labels */}
            <div className="flex mt-2">
              {periods.map((p, idx) => {
                const isSel = p.id === selectedPeriodId;
                const isFuture = p.state === 'future';
                return (
                  <button
                    key={p.id}
                    onClick={() => !isFuture && setSelectedPeriodId(p.id)}
                    disabled={isFuture}
                    className={`flex-1 flex justify-center outline-none py-0.5 ${isFuture ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <Mono className={`text-[9px] tracking-[.1em] transition-colors duration-100 ${isSel ? 'text-brand font-bold' : isFuture ? 'text-ink-soft opacity-30' : 'text-ink-soft'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </Mono>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between mt-2">
              <Mono className="text-[10px] text-ink-soft tracking-[.1em] uppercase">Click a week to filter the leaderboard</Mono>
              <Mono className="text-[10px] text-ink-soft tracking-[.1em] uppercase">
                Viewing · WK {selectedPeriodIdx >= 0 ? String(selectedPeriodIdx + 1).padStart(2, '0') : '—'}
              </Mono>
            </div>
          </div>

          {/* Scoring curve */}
          <div className="bg-panel px-5 pt-[18px] pb-[14px] border border-rule-soft">
            <div className="flex justify-between items-baseline mb-2">
              <div>
                <h3 className="font-tight font-extrabold text-lg m-0 tracking-[-0.01em]">How points are scored</h3>
                <div className="text-[11px] text-ink-soft mt-0.5">1 pt/min up to 210 min/wk · diminishing thereafter</div>
              </div>
              <Mono className="text-[11px] text-brand font-bold">YOU · {weekMinutes} MIN</Mono>
            </div>
            <ScoringCurve current={weekMinutes} />
          </div>
        </section>
      </div>

      {/* Strava Art callout */}
      {livePeriod && (
        <div className="mt-9">
          <div className="flex items-baseline justify-between mb-2.5">
            <h2 className="font-tight font-extrabold text-[22px] tracking-[-0.02em] m-0">Strava Art</h2>
            <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">
              {livePeriod.name} · theme TBD
            </Mono>
          </div>
          <Rule weight={1.5} />
          <div className="py-5 flex items-center gap-5">
            <p className="text-ink-soft text-sm m-0">Turn your workout route into art. Submit a route for this week's challenge.</p>
            <Link to="/art" className="ml-auto px-[22px] py-3 bg-ink text-panel border-none font-tight font-bold text-[13px] tracking-[.06em] uppercase cursor-pointer whitespace-nowrap no-underline">
              View art wall →
            </Link>
          </div>
        </div>
      )}

      {/* Activity feed */}
      <div className="mt-9">
        <div className="flex items-baseline justify-between mb-2.5">
          <h2 className="font-tight font-extrabold text-[22px] tracking-[-0.02em] m-0">Your activity</h2>
          <div className="flex items-center gap-3">
            <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">Synced via Strava</Mono>
            {stravaConnected ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-good font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-good" /> CONNECTED
              </span>
            ) : (
              <button onClick={() => { window.location.href = `${BASE}/api/strava/init/`; }} className="inline-flex items-center gap-1.5 text-[11px] text-brand font-mono bg-transparent border-none cursor-pointer p-0">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" /> NOT CONNECTED
              </button>
            )}
          </div>
        </div>
        <Rule weight={1.5} />
        {activities.length === 0 ? (
          <div className="py-10 text-center text-ink-soft text-sm">No activities yet. Log a workout on Strava and it will sync here.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {activities.slice(0, 4).map((a, i) =>
              <div key={a.activity_id} className={`px-[18px] pt-4 pb-[18px]${i < 3 ? ' border-r border-rule-soft' : ''}`}>
                <div className="aspect-[10/7] bg-panel-alt mb-3 border border-rule-soft overflow-hidden">
                  <RouteMap svgPath={a.svg_path} />
                </div>
                <div className="flex justify-between items-center mb-1">
                  <Mono className="text-[10px] text-ink-soft tracking-[.12em] uppercase">{fmtActivityDate(a.datetime)}</Mono>
                  <Tag t={a.sport_type} className="text-ink border border-rule-soft" />
                </div>
                <div className="font-bold text-[15px] tracking-[-0.01em] my-1 mb-2">{a.name}</div>
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
            )}
          </div>
        )}
      </div>

      <PageFooter />
      <BottomNav />
    </div>
  );
}
