import { useEffect, useMemo, useState } from 'react';
import { Mono, Rule, Tag } from '../components/ui.jsx';
import { TopBar } from '../components/layout/TopBar.jsx';
import { BottomNav } from '../components/layout/BottomNav.jsx';
import { PageFooter } from '../components/layout/PageFooter.jsx';
import { SettingsDrawer } from '../components/SettingsDrawer.jsx';
import {
  getPeriods, getMe,
  getArtWall, getMyArtSub, getActivities,
  createArtSub, patchArtSub, deleteArtSub, toggleArtLike,
} from '../lib/api.js';

const CT = 'America/Chicago';

function fmtPeriodDates(start, end) {
  const opts = { month: 'short', day: 'numeric', timeZone: CT };
  return `${new Date(start + 'T12:00:00Z').toLocaleDateString('en-US', opts)}–${new Date(end + 'T12:00:00Z').toLocaleDateString('en-US', opts)}`;
}

function fmtDate(isoStr) {
  return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: CT });
}

function themeHeading(theme) {
  if (theme === 'Letter M') return <>Make an <span className="text-brand">M</span> for Minnesota.</>;
  if (theme === 'Letter U') return <>Trace a <span className="text-brand">U</span> on the map.</>;
  if (theme === 'Loop') return <>Run a <span className="text-brand">loop</span>, any loop.</>;
  return <><span className="text-brand">{theme}</span> — draw the shape.</>;
}

function tinyMap({ svgPath, accent }) {
  return (
    <svg viewBox="0 0 100 90" preserveAspectRatio="none" width="100%" height="100%" style={{ display: 'block' }}>
      {[14, 28, 42, 56, 70].map((y) => (
        <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y - 4} stroke="var(--ink)" strokeOpacity=".06" strokeWidth=".3" />
      ))}
      {[20, 50, 80].map((x) => (
        <line key={`v${x}`} x1={x} y1="0" x2={x - 4} y2="90" stroke="var(--ink)" strokeOpacity=".06" strokeWidth=".3" />
      ))}
      <path d={svgPath || ''} fill="none" stroke={accent} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function HeartIcon({ filled, c }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" style={{ display: 'block' }}>
      <path d="M8 14s-5-3.2-5-7.2A2.8 2.8 0 0 1 8 4a2.8 2.8 0 0 1 5 2.8C13 10.8 8 14 8 14z"
            fill={filled ? c : 'none'} stroke={c} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function WeekNav({ periods, livePeriodId, selectedPeriodId, onSelect }) {
  return (
    <div className="flex items-center gap-2">
      <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase mr-1">Browse week</Mono>
      <div className="flex border border-rule-soft">
        {periods.map((p, idx) => {
          const isSel = p.id === selectedPeriodId;
          const isLive = p.id === livePeriodId;
          const label = `WK ${String(idx + 1).padStart(2, '0')}`;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={[
                'font-mono text-[10px] tracking-[.12em] uppercase py-[7px] px-3 border-none cursor-pointer flex items-center gap-1.5',
                idx < periods.length - 1 ? 'border-r border-rule-soft' : '',
                isSel ? 'bg-ink text-panel font-bold' : 'bg-transparent text-ink-soft font-medium',
              ].join(' ')}
            >
              {label}
              {isLive && (
                <span className="w-[5px] h-[5px] rounded-full" style={{ background: isSel ? 'var(--accent)' : 'var(--brand)' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VisibilityRadio({ value, onChange }) {
  const opts = [
    { v: 'private',   label: 'Private',   sub: 'Only you' },
    { v: 'anonymous', label: 'Anonymous', sub: 'Art shown, name hidden' },
    { v: 'public',    label: 'Public',    sub: 'Name + art visible' },
  ];
  return (
    <div>
      <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Visibility</Mono>
      <div className="grid mt-1.5 border border-rule" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {opts.map((o, i) => {
          const isSel = value === o.v;
          return (
            <button
              key={o.v}
              onClick={() => onChange(o.v)}
              className={[
                'text-left py-[10px] px-3 border-none cursor-pointer font-sans',
                i < 2 ? 'border-r border-rule-soft' : '',
                isSel ? 'bg-ink text-panel' : 'bg-panel text-ink',
              ].join(' ')}
            >
              <div className="font-tight font-bold text-[13px] tracking-[-0.01em]">{o.label}</div>
              <Mono className={['text-[10px] tracking-[.06em] uppercase mt-[3px] block', isSel ? 'text-accent' : 'text-ink-soft'].join(' ')}>
                {o.sub}
              </Mono>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CompositionCanvas({ path, rotation, title, visibility, memberName, memberSection }) {
  const showWork = visibility !== 'private';
  const attribution = visibility === 'public'
    ? `${memberName || '…'} · ${memberSection || '…'}`
    : visibility === 'anonymous'
    ? `anon · ${memberSection || '…'}`
    : 'you only';
  return (
    <div className="bg-panel-alt border border-rule-soft relative overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
      <svg viewBox="0 0 100 75" width="100%" height="100%" preserveAspectRatio="none" className="absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 6.25} x2="100" y2={i * 6.25} stroke="var(--ink)" strokeOpacity=".05" strokeWidth=".2" />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 6.25} y1="0" x2={i * 6.25} y2="75" stroke="var(--ink)" strokeOpacity=".05" strokeWidth=".2" />
        ))}
      </svg>
      {showWork ? (
        <svg viewBox="0 0 100 90" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
             className="absolute inset-0" style={{ transition: 'transform .35s cubic-bezier(.2,.7,.3,1)' }}>
          <g transform={`rotate(${rotation} 50 45)`} style={{ transition: 'transform .35s cubic-bezier(.2,.7,.3,1)' }}>
            <path d={path || ''} fill="none" stroke="var(--brand)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
          <Mono className="text-xs text-ink-soft tracking-[.18em] uppercase">🔒 Private</Mono>
          <Mono className="text-[10px] text-ink-soft">visible only to you on the wall</Mono>
        </div>
      )}
      <div className="absolute top-[10px] left-3 font-mono text-[9px] tracking-[.14em] text-ink-soft uppercase">
        Rotation · {rotation}°
      </div>
      <div className="absolute top-[10px] right-3 font-mono text-[9px] tracking-[.14em] text-ink-soft uppercase">
        {visibility === 'public' ? 'PUBLIC' : visibility === 'anonymous' ? 'ANONYMOUS' : 'PRIVATE'}
      </div>
      <div className="absolute bottom-[10px] left-3 right-3 flex justify-between items-end">
        <div>
          <div className="font-tight font-bold text-base tracking-[-0.01em]">{title || 'Untitled'}</div>
          <Mono className="text-[10px] text-ink-soft mt-0.5">{attribution}</Mono>
        </div>
      </div>
    </div>
  );
}

function RotateButton({ dir, onClick }) {
  return (
    <button
      onClick={onClick}
      className="py-2 px-[14px] bg-panel border border-rule cursor-pointer font-mono text-[11px] tracking-[.1em] uppercase text-ink inline-flex items-center gap-2"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" style={{ display: 'block' }}>
        {dir === 'ccw' ? (
          <path d="M3 8 A 5 5 0 1 0 8 3 L 8 6 M 8 3 L 11 3" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M13 8 A 5 5 0 1 1 8 3 L 8 6 M 8 3 L 5 3" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      {dir === 'ccw' ? '−45°' : '+45°'}
    </button>
  );
}

function SubmissionTile({ s, onLike }) {
  return (
    <div className="p-4 pb-[18px]">
      <div className="bg-panel-alt mb-3 border border-rule-soft overflow-hidden relative" style={{ aspectRatio: '5 / 4' }}>
        <svg viewBox="0 0 100 80" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <g transform={`rotate(${s.rotation ?? 0} 50 40)`}>
            <path d={s.svg_path || ''} fill="none" stroke="var(--brand)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
        {s.rank != null && s.rank < 3 && (
          <div className="absolute top-2 left-2 bg-ink text-panel font-mono text-[9px] tracking-[.14em] px-1.5 py-[3px]">
            #{String(s.rank + 1).padStart(2, '0')}
          </div>
        )}
      </div>
      <div className="font-bold text-sm tracking-[-0.01em] mb-1.5">{s.title}</div>
      <div className="flex justify-between items-center">
        <Mono className="text-[11px] text-ink-soft">
          {s.who === null ? 'anon' : s.who}{s.section ? ` · ${s.section}` : ''}
        </Mono>
        <button
          onClick={() => onLike && onLike(s)}
          className={[
            'bg-transparent border-none py-0.5 inline-flex items-center gap-[5px]',
            onLike ? 'cursor-pointer' : 'cursor-default',
            s.liked_by_me ? 'text-brand' : 'text-ink-soft',
          ].join(' ')}
        >
          <HeartIcon filled={s.liked_by_me} c={s.liked_by_me ? 'var(--brand)' : 'var(--ink-soft)'} />
          <Mono className="text-[11px] font-bold" style={{ color: 'inherit' }}>{s.likes}</Mono>
        </button>
      </div>
    </div>
  );
}

export default function StravaArt() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [livePeriodId, setLivePeriodId] = useState(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [wallData, setWallData] = useState(null);
  const [mySub, setMySub] = useState(undefined);
  const [periodActivities, setPeriodActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submission form state
  const [activityId, setActivityId] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getPeriods(), getMe()]).then(([periodsData, meData]) => {
      setMe(meData);
      const artPeriods = periodsData.filter((p) => p.state === 'done' || p.state === 'live');
      setPeriods(artPeriods);
      const live = artPeriods.find((p) => p.state === 'live');
      const initial = live ?? artPeriods[artPeriods.length - 1];
      if (live) setLivePeriodId(live.id);
      if (initial) setSelectedPeriodId(initial.id);
    });
  }, []);

  useEffect(() => {
    if (!selectedPeriodId || periods.length === 0) return;
    const period = periods.find((p) => p.id === selectedPeriodId);
    if (!period) return;

    setLoading(true);
    const isLive = period.state === 'live';
    Promise.all([
      getArtWall(selectedPeriodId),
      getMyArtSub(selectedPeriodId),
      isLive ? getActivities({ period_id: selectedPeriodId }) : Promise.resolve({ results: [] }),
    ]).then(([wall, sub, acts]) => {
      setWallData(wall);
      setMySub(sub);
      setPeriodActivities(acts.results ?? []);

      const activeSub = sub && !sub.is_withdrawn ? sub : null;
      if (activeSub) {
        const matchedAct = (acts.results ?? []).find((a) => String(a.activity_id) === String(activeSub.activity_id));
        setActivityId(matchedAct?.id ?? null);
        setRotation(activeSub.rotation);
        setTitle(activeSub.title);
        setVisibility(activeSub.visibility);
      } else {
        setActivityId(null);
        setRotation(0);
        setTitle('');
        setVisibility('public');
      }
      setLoading(false);
    });
  }, [selectedPeriodId, periods]);

  const wall = useMemo(() => {
    if (!wallData) return [];
    return [...wallData.submissions]
      .sort((a, b) => b.likes - a.likes)
      .map((s, i) => ({ ...s, rank: i }));
  }, [wallData]);

  async function handleToggleLike(s) {
    setWallData((prev) => ({
      ...prev,
      submissions: prev.submissions.map((x) =>
        x.id === s.id ? { ...x, liked_by_me: !x.liked_by_me, likes: x.likes + (x.liked_by_me ? -1 : 1) } : x
      ),
    }));
    try {
      const result = await toggleArtLike(s.id);
      setWallData((prev) => ({
        ...prev,
        submissions: prev.submissions.map((x) =>
          x.id === s.id ? { ...x, liked_by_me: result.liked, likes: result.likesCount } : x
        ),
      }));
    } catch {
      setWallData((prev) => ({
        ...prev,
        submissions: prev.submissions.map((x) => (x.id === s.id ? s : x)),
      }));
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const activeSub = mySub && !mySub.is_withdrawn ? mySub : null;
      const stravaId = periodActivities.find((a) => a.id === activityId)?.activity_id ?? null;
      const body = { period: selectedPeriodId, title, activityId: stravaId, rotation, visibility };
      const updated = activeSub
        ? await patchArtSub(activeSub.id, { title, activityId: stravaId, rotation, visibility })
        : await createArtSub(body);
      setMySub(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleWithdraw() {
    const activeSub = mySub && !mySub.is_withdrawn ? mySub : null;
    if (!activeSub) return;
    try {
      await deleteArtSub(activeSub.id);
      setMySub({ ...mySub, is_withdrawn: true });
      setActivityId(null);
      setRotation(0);
      setTitle('');
      setVisibility('public');
    } catch (e) {
      console.error(e);
    }
  }

  const selectedPeriodObj = periods.find((p) => p.id === selectedPeriodId);
  const isSelectedLive = selectedPeriodId === livePeriodId;
  const activeSub = mySub && !mySub.is_withdrawn ? mySub : null;

  const selectedActivity = periodActivities.find((a) => a.id === activityId);
  const currentPath = selectedActivity?.svg_path ?? activeSub?.svg_path ?? '';

  const selectedPeriodIdx = periods.findIndex((p) => p.id === selectedPeriodId);
  const selectedPeriodLabel = selectedPeriodIdx >= 0 ? `WK ${String(selectedPeriodIdx + 1).padStart(2, '0')}` : '';

  const rotL = () => setRotation((r) => (r - 45 + 360) % 360);
  const rotR = () => setRotation((r) => (r + 45) % 360);

  const theme = wallData?.theme ?? null;
  const dates = selectedPeriodObj
    ? fmtPeriodDates(selectedPeriodObj.start_date, selectedPeriodObj.end_date)
    : '';

  return (
    <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-7 pb-20 relative" data-page-root>
      <TopBar settingsOpen={settingsOpen} onAvatarClick={() => setSettingsOpen((o) => !o)} />
      <Rule />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Hero grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end py-[26px] pb-[22px]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <Mono className="text-[11px] text-ink-soft tracking-[.18em] uppercase">
              {selectedPeriodLabel} · Artwork brief{dates ? ` · ${dates}` : ''}
            </Mono>
            {selectedPeriodObj && (
              <Tag t={isSelectedLive ? 'OPEN' : 'CLOSED'} className={isSelectedLive ? 'bg-brand text-panel' : 'bg-ink-soft text-panel'} />
            )}
          </div>
          <h1 className="font-tight font-extrabold text-[56px] leading-[1.02] tracking-[-0.035em] mt-1 mb-0" style={{ textWrap: 'balance' }}>
            {theme ? themeHeading(theme) : <span className="text-ink-soft">Loading…</span>}
          </h1>
          <div className="mt-3.5 text-sm leading-[1.45] text-ink-soft max-w-[580px]">
            {isSelectedLive ? (
              <>Pick one of your activities from this week whose route traces the shape. Rotate it to taste — the theme is the only constraint. Submissions close <strong className="text-ink">Sun 11:59pm</strong>.</>
            ) : (
              <>This week's window is closed. Browse what the band submitted below.</>
            )}
          </div>
          <div className="mt-3.5 py-[10px] px-3 bg-panel border border-rule-soft flex items-start gap-2.5 max-w-[580px]" style={{ borderLeft: '3px solid var(--brand)' }}>
            <Mono className="text-[10px] text-brand tracking-[.18em] uppercase whitespace-nowrap pt-0.5">Be cool ·</Mono>
            <div className="text-xs leading-[1.45] text-ink-soft">
              Submissions must be <strong className="text-ink">appropriate and on-theme</strong>. Anything off-theme, offensive, or otherwise inappropriate is subject to removal by program leaders.
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 items-start">
          <WeekNav periods={periods} livePeriodId={livePeriodId} selectedPeriodId={selectedPeriodId} onSelect={setSelectedPeriodId} />
          <div className="bg-panel border border-rule-soft w-full p-[14px] px-[18px]" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div>
              <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Theme</Mono>
              <div className="font-tight font-extrabold text-[22px] text-brand tracking-[-0.02em] mt-0.5">{theme ?? '—'}</div>
            </div>
            <div>
              <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">{isSelectedLive ? 'Submitted so far' : 'Final entries'}</Mono>
              <div className="font-tight font-extrabold text-[22px] tracking-[-0.02em] mt-0.5">{wall.length}</div>
            </div>
          </div>
        </div>
      </div>

      <Rule soft />

      {isSelectedLive && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          <section>
            <div className="flex justify-between items-baseline mb-[10px]">
              <h2 className="font-tight font-extrabold text-[22px] tracking-[-0.02em] m-0">Pick one activity</h2>
              <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">{periodActivities.length} from {dates}</Mono>
            </div>
            <Rule />
            {periodActivities.length === 0 ? (
              <div className="py-10 text-center text-ink-soft text-sm">No activities recorded this week yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {periodActivities.map((a, i) => {
                  const isSel = activityId === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => { setActivityId(a.id); setRotation(0); }}
                      className={[
                        'text-left border-none bg-transparent p-4 pb-[18px] cursor-pointer font-sans text-ink flex gap-3 items-start',
                        i % 2 === 0 ? 'border-r border-rule-soft' : '',
                        i < periodActivities.length - 2 ? 'border-b border-rule-soft' : '',
                      ].join(' ')}
                    >
                      <div
                        className="w-20 h-[58px] shrink-0 bg-panel-alt border overflow-hidden"
                        style={{
                          borderColor: isSel ? 'var(--brand)' : 'var(--rule-soft)',
                          boxShadow: isSel ? 'inset 0 0 0 2px var(--brand)' : 'none',
                        }}
                      >
                        {tinyMap({ svgPath: a.svg_path, accent: isSel ? 'var(--brand)' : 'var(--ink-soft)' })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Mono className="text-[10px] text-ink-soft tracking-[.12em] uppercase">
                          {new Date(a.datetime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: CT })} · {a.sport_type}
                        </Mono>
                        <div className={['font-bold text-sm tracking-[-0.01em] mt-[3px] whitespace-nowrap overflow-hidden text-ellipsis', isSel ? 'text-brand' : 'text-ink'].join(' ')}>
                          {a.name}
                        </div>
                        <Mono className="text-[11px] text-ink-soft mt-[3px]">
                          {a.distance > 0 ? `${a.distance.toFixed(1)} mi` : '—'} · {a.minutes} min
                        </Mono>
                      </div>
                      <div
                        className="w-[18px] h-[18px] shrink-0 rounded-full border grid place-items-center"
                        style={{
                          borderWidth: '1.5px',
                          borderColor: isSel ? 'var(--brand)' : 'var(--rule-soft)',
                          background: isSel ? 'var(--brand)' : 'transparent',
                        }}
                      >
                        {isSel && <span className="w-2 h-2 rounded-full bg-panel" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <div className="flex justify-between items-baseline mb-[10px]">
              <h2 className="font-tight font-extrabold text-[22px] tracking-[-0.02em] m-0">Your submission</h2>
              {activeSub && (
                <div className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-good" />
                  <Mono className="text-[10px] text-ink-soft tracking-[.12em] uppercase">
                    Submitted · {fmtDate(activeSub.submitted_at)}
                  </Mono>
                </div>
              )}
            </div>
            <Rule />
            <div className="mt-[10px]">
              <CompositionCanvas
                path={currentPath}
                rotation={rotation}
                title={title}
                visibility={visibility}
                memberName={me?.name}
                memberSection={me?.section}
              />
            </div>
            <div className="mt-3 flex justify-between items-center py-[10px] px-3 bg-panel border border-rule-soft">
              <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Orient your route</Mono>
              <div className="flex gap-2">
                <RotateButton dir="ccw" onClick={rotL} />
                <RotateButton dir="cw" onClick={rotR} />
              </div>
            </div>
            <div className="mt-3.5">
              <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Title your piece</Mono>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 py-[10px] px-3 w-full border border-rule bg-panel text-ink font-tight font-bold text-lg tracking-[-0.01em] outline-none box-border"
              />
            </div>
            <div className="mt-3.5">
              <VisibilityRadio value={visibility} onChange={setVisibility} />
            </div>
            <div className="flex gap-2.5 mt-4">
              <button
                onClick={handleSave}
                disabled={saving || !activityId}
                className="flex-1 py-[14px] px-5 bg-ink text-panel border-none font-tight font-bold text-sm tracking-[.06em] uppercase cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving…' : activeSub ? 'Update artwork' : 'Submit artwork'}
              </button>
              {activeSub && (
                <button
                  onClick={handleWithdraw}
                  className="py-[14px] px-[18px] bg-transparent text-brand border border-brand font-tight font-bold text-sm tracking-[.06em] uppercase cursor-pointer"
                >
                  Withdraw
                </button>
              )}
            </div>
            <Mono className="block mt-[10px] text-[11px] text-ink-soft">
              One submission per person, per week. You can revise until Sun 11:59pm.
            </Mono>
          </section>
        </div>
      )}

      <div className="mt-9">
        <div className="flex items-baseline justify-between mb-[10px]">
          <h2 className="font-tight font-extrabold text-[22px] tracking-[-0.02em] m-0">
            {isSelectedLive ? "This week's wall" : `${selectedPeriodLabel} wall · ${theme ?? ''}`}
          </h2>
          <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">Sorted by likes · {wall.length} entries</Mono>
        </div>
        <Rule />
        {loading ? (
          <div className="py-16 text-center text-ink-soft text-sm">Loading…</div>
        ) : wall.length === 0 ? (
          <div className="py-16 text-center text-ink-soft text-sm">No public submissions yet.</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {wall.map((s, i) => (
              <div
                key={s.id}
                className={[
                  i % 4 !== 3 ? 'border-r border-rule-soft' : '',
                  i < wall.length - (wall.length % 4 || 4) ? 'border-b border-rule-soft' : '',
                ].join(' ')}
              >
                <SubmissionTile s={s} onLike={handleToggleLike} />
              </div>
            ))}
          </div>
        )}
      </div>

      <PageFooter />
      <BottomNav />
    </div>
  );
}
