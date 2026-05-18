import { useEffect, useMemo, useState } from 'react';
import { Mono, Rule, Tag, TrendCell, TrendHeader } from '../components/ui.jsx';
import { TopBar } from '../components/layout/TopBar.jsx';
import { BottomNav } from '../components/layout/BottomNav.jsx';
import { PageFooter } from '../components/layout/PageFooter.jsx';
import { SettingsDrawer } from '../components/SettingsDrawer.jsx';
import { getPeriods, getScoreboard } from '../lib/api.js';
import { useFlipAnimation } from '../lib/useFlipAnimation.js';

function Podium({ rows, valueFor, label }) {
  const order = [1, 0, 2];
  const heights = { 0: 130, 1: 100, 2: 80 };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'end', padding: '8px 0 0' }}>
      {order.map((i) => {
        const r = rows[i];
        if (!r) return <div key={i} />;
        const value = valueFor(r);
        const isFirst = i === 0;
        return (
          <div key={i} className="text-center">
            <Mono className="font-tight font-extrabold text-sm tracking-[.06em] text-ink-soft">
              {i === 0 ? '1ST' : i === 1 ? '2ND' : '3RD'}
            </Mono>
            <div
              className={`font-tight font-extrabold tracking-[-0.02em] text-ink mt-1.5 text-wrap-balance ${isFirst ? 'text-[22px]' : 'text-lg'}`}
              style={{ minHeight: isFirst ? 56 : 44 }}
            >
              {r.name}
            </div>
            <Mono className="text-[11px] text-ink-soft block mb-2">{r.members} members</Mono>
            <div
              className={`flex items-center justify-center font-tight font-extrabold text-[28px] tracking-[-0.02em] text-panel border border-rule ${isFirst ? 'bg-brand' : i === 1 ? 'bg-accent-2' : 'bg-accent'} ${isFirst ? '' : 'opacity-85'}`}
              style={{ height: heights[i] }}
            >
              {typeof value === 'number' ? value.toFixed(value < 100 ? 1 : 0) : value}
            </div>
            <Mono className="block mt-1.5 text-[10px] text-ink-soft tracking-[.14em] uppercase">{label}</Mono>
          </div>
        );
      })}
    </div>
  );
}

function LeaderRow({ rank, isTop, isMe, primary, secondary, value, trend, sectionName }) {
  return (
    <div
      data-section={sectionName}
      style={{
        display: 'grid',
        gridTemplateColumns: '32px 1.6fr 2fr 80px 40px',
        alignItems: 'center',
        gap: 12,
        padding: '12px 0',
        borderBottom: '1px solid var(--rule-soft)',
        background: isMe ? 'rgba(0,0,0,.025)' : 'transparent',
      }}
    >
      <Mono className={`text-[13px] ${isTop ? 'text-brand font-bold' : 'text-ink-soft font-medium'}`}>
        {String(rank).padStart(2, '0')}
      </Mono>
      <div className="flex items-center gap-2">
        <span className={`text-[15px] tracking-[-0.01em] ${isMe ? 'font-bold' : 'font-semibold'}`}>{primary}</span>
        {isMe && <Tag t="YOU" className="bg-chip text-chip-ink" />}
      </div>
      <Mono className="hidden sm:block text-[11px] text-ink-soft">{secondary}</Mono>
      <Mono className="text-right text-[15px] font-bold text-ink">
        {typeof value === 'number' ? value.toFixed(value < 100 ? 1 : 0) : value}
      </Mono>
      <TrendCell trend={trend} />
    </div>
  );
}

export default function Leaderboard() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [periods, setPeriods] = useState([]);
  const [sections, setSections] = useState([]);
  const [mode, setMode] = useState('week');
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);

  useEffect(() => {
    Promise.all([getPeriods(), getScoreboard()]).then(([periodsData, sectionsData]) => {
      setPeriods(periodsData);
      setSections(sectionsData);
      const live = periodsData.find((p) => p.state === 'live');
      if (live) setSelectedPeriodId(live.id);
    });
  }, []);

  const selectedPeriodIdx = useMemo(
    () => periods.findIndex((p) => p.id === selectedPeriodId),
    [periods, selectedPeriodId]
  );

  const livePeriod = periods.find((p) => p.state === 'live');

  const valueFor = (s) => {
    if (selectedPeriodIdx < 0) return 0;
    if (mode === 'week') return s.periods[selectedPeriodIdx] ?? 0;
    return s.periods.slice(0, selectedPeriodIdx + 1).reduce((sum, v) => sum + (v ?? 0), 0);
  };

  const sectionsSorted = useMemo(
    () => [...sections].sort((a, b) => valueFor(b) - valueFor(a)),
    [sections, mode, selectedPeriodIdx]
  );

  const listRef = useFlipAnimation(sectionsSorted);

  const top3 = sectionsSorted.slice(0, 3);
  const mySection = sectionsSorted.find((s) => s.is_me);
  const mySectionRank = sectionsSorted.findIndex((s) => s.is_me) + 1;

  const wkLabel = selectedPeriodIdx >= 0 ? String(selectedPeriodIdx + 1).padStart(2, '0') : '—';
  const podiumLabel = mode === 'week' ? `AVG PTS · WK ${wkLabel}` : `Σ AVGS · THRU WK ${wkLabel}`;
  const listSubtitle = mode === 'week' ? `Avg pts / member · WK ${wkLabel}` : `Σ weekly avgs · thru WK ${wkLabel}`;

  return (
    <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-7 pb-20 relative" data-page-root>
      <TopBar settingsOpen={settingsOpen} onAvatarClick={() => setSettingsOpen((o) => !o)} />
      <Rule weight={1.5} />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-end py-[26px]">
        <div>
          <Mono className="text-[11px] text-ink-soft tracking-[.18em] uppercase">Section standings</Mono>
          <h1 className="font-tight font-extrabold text-[56px] leading-[1.02] tracking-[-0.035em] mt-2 text-wrap-balance">
            {sectionsSorted[0] ? (
              <><span className="text-brand">{sectionsSorted[0].name}</span> lead.<br />{mySection ? `${mySection.name} sit #${mySectionRank}.` : ''}</>
            ) : 'Loading…'}
          </h1>
          <div className="flex gap-2.5 mt-4 flex-wrap">
            <Tag
              t={`Week ${selectedPeriodIdx >= 0 ? selectedPeriodIdx + 1 : '—'} ${selectedPeriodId === livePeriod?.id ? 'live' : 'closed'}`}
              className="bg-chip text-chip-ink"
            />
            <Tag t={`${sections.length} sections · ${sections.reduce((s, x) => s + x.members, 0)} members`} className="text-ink border border-rule-soft" />
          </div>
        </div>
        <div className="flex justify-end sm:justify-start">
          <div className="flex items-center gap-1.5 p-[3px] border border-rule-soft">
            {[{ v: 'week', label: 'Weekly' }, { v: 'season', label: 'Season Total' }].map((o) => (
              <button
                key={o.v}
                onClick={() => setMode(o.v)}
                className={`font-mono text-[10px] tracking-[.12em] uppercase px-3 py-1.5 border-none cursor-pointer ${mode === o.v ? 'bg-ink text-panel font-bold' : 'bg-transparent text-ink-soft font-medium'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-1.5 mb-3" style={{ gridTemplateColumns: `repeat(${periods.length || 8}, 1fr)` }}>
        {periods.map((p, idx) => {
          const isLive = p.state === 'live';
          const isDone = p.state === 'done';
          const isFuture = p.state === 'future';
          const isSel = p.id === selectedPeriodId;
          const clickable = !isFuture;
          return (
            <button
              key={p.id}
              onClick={() => clickable && setSelectedPeriodId(p.id)}
              disabled={!clickable}
              className={`text-center py-2.5 font-sans outline-none border-none ${isLive ? 'bg-brand text-panel' : isDone ? 'bg-panel-alt text-ink' : 'bg-transparent text-ink'} ${isFuture ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{
                border: isSel ? '2px solid var(--brand)' : isFuture ? '1px solid var(--rule-soft)' : '1px solid transparent',
              }}
            >
              <Mono className="text-[10px] opacity-70 tracking-[.14em]">WK {String(idx + 1).padStart(2, '0')}</Mono>
              {p.you != null && <Mono className="block text-sm font-bold mt-[3px]">{p.you.toFixed(1)}</Mono>}
            </button>
          );
        })}
      </div>

      <div className="bg-panel border border-rule-soft px-6 pt-5 pb-6 mb-7">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="font-tight font-extrabold text-lg m-0 tracking-[-0.01em]">Top three sections</h3>
          <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">
            {mode === 'week' ? `WK ${wkLabel}` : `Through WK ${wkLabel}`}
          </Mono>
        </div>
        <Podium rows={top3} valueFor={valueFor} label={podiumLabel} />
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-2.5">
          <h2 className="font-tight font-extrabold text-[22px] tracking-[-0.02em] m-0">All sections</h2>
          <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">{listSubtitle}</Mono>
        </div>
        <Rule weight={1.5} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '32px 1.6fr 2fr 80px 40px',
            gap: 12,
            padding: '10px 0 8px',
            borderBottom: '1px solid var(--rule-soft)',
          }}
        >
          <Mono className="text-[9px] text-ink-soft tracking-[.14em]">#</Mono>
          <Mono className="text-[9px] text-ink-soft tracking-[.14em]">SECTION</Mono>
          <Mono className="hidden sm:block text-[9px] text-ink-soft tracking-[.14em]">SIZE</Mono>
          <Mono className="text-[9px] text-ink-soft tracking-[.14em] text-right">{mode === 'week' ? 'PTS' : 'TOTAL'}</Mono>
          <TrendHeader />
        </div>
        <div ref={listRef}>
          {sectionsSorted.map((s, i) => (
            <LeaderRow
              key={s.name}
              sectionName={s.name}
              rank={i + 1}
              isTop={i === 0}
              isMe={!!s.is_me}
              primary={s.name}
              secondary={`${s.members} members`}
              value={valueFor(s)}
              trend={s.trend ?? 0}
            />
          ))}
        </div>
        <Mono className="block mt-3.5 text-[11px] text-ink-soft tracking-[.1em] uppercase">
          Individual minutes &amp; points are private to each member.
        </Mono>
      </div>

      <PageFooter />
      <BottomNav />
    </div>
  );
}
