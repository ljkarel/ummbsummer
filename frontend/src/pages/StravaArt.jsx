import { useState, useMemo } from 'react';
import { Mono, Rule, Tag, StaffLines } from '../components/ui.jsx';
import { TopBar } from '../components/layout/TopBar.jsx';
import { BottomNav } from '../components/layout/BottomNav.jsx';
import { PageFooter } from '../components/layout/PageFooter.jsx';
import { SettingsDrawer } from '../components/SettingsDrawer.jsx';
import { MY_ACTIVITIES, ROUTE_PATHS, WEEKS, ART_WEEKS, MY_ART_SUBMISSION } from '../lib/mock.js';

function tinyMap({ d, accent }) {
  return (
    <svg viewBox="0 0 100 90" preserveAspectRatio="none" width="100%" height="100%" style={{ display: "block" }}>
      {[14, 28, 42, 56, 70].map((y) => (
        <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y - 4} stroke="var(--ink)" strokeOpacity=".06" strokeWidth=".3" />
      ))}
      {[20, 50, 80].map((x) => (
        <line key={`v${x}`} x1={x} y1="0" x2={x - 4} y2="90" stroke="var(--ink)" strokeOpacity=".06" strokeWidth=".3" />
      ))}
      <path d={d} fill="none" stroke={accent} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
            vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function HeartIcon({ filled, c }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" style={{ display: "block" }}>
      <path d="M8 14s-5-3.2-5-7.2A2.8 2.8 0 0 1 8 4a2.8 2.8 0 0 1 5 2.8C13 10.8 8 14 8 14z"
            fill={filled ? c : "none"} stroke={c} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function WeekNav({ current, selected, onSelect }) {
  return (
    <div className="flex items-center gap-2">
      <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase mr-1">
        Browse week
      </Mono>
      <div className="flex border border-rule-soft">
        {ART_WEEKS.map((w) => {
          const isSel = w.n === selected;
          const isLive = w.n === current;
          return (
            <button
              key={w.n}
              onClick={() => onSelect(w.n)}
              className={[
                "font-mono text-[10px] tracking-[.12em] uppercase py-[7px] px-3 border-none cursor-pointer flex items-center gap-1.5",
                w.n < ART_WEEKS.length ? "border-r border-rule-soft" : "",
                isSel ? "bg-ink text-panel font-bold" : "bg-transparent text-ink-soft font-medium",
              ].join(" ")}
            >
              {w.label}
              {isLive && (
                <span
                  className="w-[5px] h-[5px] rounded-full"
                  style={{ background: isSel ? "var(--accent)" : "var(--brand)" }}
                />
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
    { v: "private",   label: "Private",   sub: "Only you" },
    { v: "anonymous", label: "Anonymous", sub: "Art shown, name hidden" },
    { v: "public",    label: "Public",    sub: "Name + art visible" },
  ];
  return (
    <div>
      <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">
        Visibility
      </Mono>
      <div className="grid mt-1.5 border border-rule" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {opts.map((o, i) => {
          const isSel = value === o.v;
          return (
            <button
              key={o.v}
              onClick={() => onChange(o.v)}
              className={[
                "text-left py-[10px] px-3 border-none cursor-pointer font-sans",
                i < 2 ? "border-r border-rule-soft" : "",
                isSel ? "bg-ink text-panel" : "bg-panel text-ink",
              ].join(" ")}
            >
              <div className="font-tight font-bold text-[13px] tracking-[-0.01em]">{o.label}</div>
              <Mono
                className={[
                  "text-[10px] tracking-[.06em] uppercase mt-[3px] block",
                  isSel ? "text-accent" : "text-ink-soft",
                ].join(" ")}
              >
                {o.sub}
              </Mono>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CompositionCanvas({ path, rotation, title, visibility }) {
  const showWork = visibility !== "private";
  return (
    <div className="bg-panel-alt border border-rule-soft relative overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
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
             className="absolute inset-0" style={{ transition: "transform .35s cubic-bezier(.2,.7,.3,1)" }}>
          <g transform={`rotate(${rotation} 50 45)`} style={{ transition: "transform .35s cubic-bezier(.2,.7,.3,1)" }}>
            <path d={path} fill="none" stroke="var(--brand)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
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
        {visibility === "public" ? "PUBLIC" : visibility === "anonymous" ? "ANONYMOUS" : "PRIVATE"}
      </div>
      <div className="absolute bottom-[10px] left-3 right-3 flex justify-between items-end">
        <div>
          <div className="font-tight font-bold text-base tracking-[-0.01em]">{title || "Untitled"}</div>
          <Mono className="text-[10px] text-ink-soft mt-0.5">
            {visibility === "public" ? "@jordan.m · Trumpets" : visibility === "anonymous" ? "anon · Trumpets" : "you only"}
          </Mono>
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
      <svg width="14" height="14" viewBox="0 0 16 16" style={{ display: "block" }}>
        {dir === "ccw" ? (
          <path d="M3 8 A 5 5 0 1 0 8 3 L 8 6 M 8 3 L 11 3" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M13 8 A 5 5 0 1 1 8 3 L 8 6 M 8 3 L 5 3" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      {dir === "ccw" ? "−45°" : "+45°"}
    </button>
  );
}

function SubmissionTile({ s, onLike }) {
  return (
    <div className="p-4 pb-[18px]">
      <div className="bg-panel-alt mb-3 border border-rule-soft overflow-hidden relative" style={{ aspectRatio: "5 / 4" }}>
        <svg viewBox="0 0 100 80" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <path d={s.path} fill="none" stroke="var(--brand)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {s.rank != null && s.rank < 3 && (
          <div className="absolute top-2 left-2 bg-ink text-panel font-mono text-[9px] tracking-[.14em] px-1.5 py-[3px]">
            #{String(s.rank + 1).padStart(2, "0")}
          </div>
        )}
      </div>
      <div className="font-bold text-sm tracking-[-0.01em] mb-1.5">{s.title}</div>
      <div className="flex justify-between items-center">
        <Mono className="text-[11px] text-ink-soft">{s.anonymous ? "anon" : s.who} · {s.section}</Mono>
        <button
          onClick={() => onLike && onLike(s)}
          className={[
            "bg-transparent border-none py-0.5 inline-flex items-center gap-[5px]",
            onLike ? "cursor-pointer" : "cursor-default",
            s.liked ? "text-brand" : "text-ink-soft",
          ].join(" ")}
        >
          <HeartIcon filled={s.liked} c={s.liked ? "var(--brand)" : "var(--ink-soft)"} />
          <Mono className="text-[11px] font-bold" style={{ color: "inherit" }}>{s.likes}</Mono>
        </button>
      </div>
    </div>
  );
}

export default function StravaArt() {
  const currentWeekN = WEEKS.find((w) => w.state === "live")?.n || 1;
  const weekActivities = MY_ACTIVITIES.filter((a) => a.week === currentWeekN);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(currentWeekN);
  const week = ART_WEEKS.find((w) => w.n === selectedWeek);
  const isLive = week.state === "live";

  const [activityId, setActivityId] = useState(MY_ART_SUBMISSION.activityId);
  const [rotation, setRotation] = useState(MY_ART_SUBMISSION.rotation);
  const [title, setTitle] = useState(MY_ART_SUBMISSION.title);
  const [visibility, setVisibility] = useState(MY_ART_SUBMISSION.visibility);

  const [wallByWeek, setWallByWeek] = useState(() => {
    const o = {};
    for (const w of ART_WEEKS) o[w.n] = w.submissions.map((s) => ({ ...s }));
    return o;
  });
  const wall = useMemo(() => {
    const arr = [...(wallByWeek[selectedWeek] || [])].sort((a, b) => b.likes - a.likes);
    return arr.map((s, i) => ({ ...s, rank: i }));
  }, [wallByWeek, selectedWeek]);

  const toggleLike = (s) => {
    setWallByWeek((prev) => {
      const arr = (prev[selectedWeek] || []).map((x) =>
        x.who === s.who ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) } : x
      );
      return { ...prev, [selectedWeek]: arr };
    });
  };

  const activity = weekActivities.find((a) => a.id === activityId) || weekActivities[0];
  const rotL = () => setRotation((r) => (r - 45 + 360) % 360);
  const rotR = () => setRotation((r) => (r + 45) % 360);

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
              {week.label} · Artwork brief · {week.dates}
            </Mono>
            <Tag t={isLive ? "OPEN" : "CLOSED"} className={isLive ? "bg-brand text-panel" : "bg-ink-soft text-panel"} />
          </div>
          <h1 className="font-tight font-extrabold text-[56px] leading-[1.02] tracking-[-0.035em] mt-1 mb-0" style={{ textWrap: "balance" }}>
            {week.theme === "Letter M" && <>Make an <span className="text-brand">M</span> for Minnesota.</>}
            {week.theme === "Letter U" && <>Trace a <span className="text-brand">U</span> on the map.</>}
            {week.theme === "Loop" && <>Run a <span className="text-brand">loop</span>, any loop.</>}
          </h1>
          <div className="mt-3.5 text-sm leading-[1.45] text-ink-soft max-w-[580px]">
            {isLive ? (
              <>Pick one of your activities from this week whose route traces the shape. Rotate it to taste — the theme is the only constraint. Submissions close <strong className="text-ink">Sun 11:59pm</strong>.</>
            ) : (
              <>This week's window is closed. Browse what the band submitted below.</>
            )}
          </div>
          <div className="mt-3.5 py-[10px] px-3 bg-panel border border-rule-soft flex items-start gap-2.5 max-w-[580px]" style={{ borderLeft: "3px solid var(--brand)" }}>
            <Mono className="text-[10px] text-brand tracking-[.18em] uppercase whitespace-nowrap pt-0.5">Be cool ·</Mono>
            <div className="text-xs leading-[1.45] text-ink-soft">
              Submissions must be <strong className="text-ink">appropriate and on-theme</strong>. Anything off-theme, offensive, or otherwise inappropriate is subject to removal by section leaders.
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 items-start">
          <WeekNav current={currentWeekN} selected={selectedWeek} onSelect={setSelectedWeek} />
          <div className="bg-panel border border-rule-soft w-full p-[14px] px-[18px]" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)" }}>
            <div>
              <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Theme</Mono>
              <div className="font-tight font-extrabold text-[22px] text-brand tracking-[-0.02em] mt-0.5">{week.theme}</div>
            </div>
            <div>
              <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">{isLive ? "Submitted so far" : "Final entries"}</Mono>
              <div className="font-tight font-extrabold text-[22px] tracking-[-0.02em] mt-0.5">{wall.length}</div>
            </div>
          </div>
        </div>
      </div>

      <Rule soft />

      {isLive && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          <section>
            <div className="flex justify-between items-baseline mb-[10px]">
              <h2 className="font-tight font-extrabold text-[22px] tracking-[-0.02em] m-0">Pick one activity</h2>
              <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">{weekActivities.length} from {week.dates}</Mono>
            </div>
            <Rule />
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {weekActivities.map((a, i) => {
                const isSel = activityId === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => { setActivityId(a.id); setRotation(0); }}
                    className={[
                      "text-left border-none bg-transparent p-4 pb-[18px] cursor-pointer font-sans text-ink flex gap-3 items-start",
                      i % 2 === 0 ? "border-r border-rule-soft" : "",
                      i < weekActivities.length - 2 ? "border-b border-rule-soft" : "",
                    ].join(" ")}
                  >
                    <div
                      className="w-20 h-[58px] shrink-0 bg-panel-alt border overflow-hidden"
                      style={{
                        borderColor: isSel ? "var(--brand)" : "var(--rule-soft)",
                        boxShadow: isSel ? `inset 0 0 0 2px var(--brand)` : "none",
                      }}
                    >
                      {tinyMap({ d: ROUTE_PATHS[a.route], accent: isSel ? "var(--brand)" : "var(--ink-soft)" })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Mono className="text-[10px] text-ink-soft tracking-[.12em] uppercase">{a.day} · {a.sport}</Mono>
                      <div className={[
                        "font-bold text-sm tracking-[-0.01em] mt-[3px] whitespace-nowrap overflow-hidden text-ellipsis",
                        isSel ? "text-brand" : "text-ink",
                      ].join(" ")}>{a.title}</div>
                      <Mono className="text-[11px] text-ink-soft mt-[3px]">{a.dist} · {a.dur}</Mono>
                    </div>
                    <div
                      className="w-[18px] h-[18px] shrink-0 rounded-full border grid place-items-center"
                      style={{
                        borderWidth: "1.5px",
                        borderColor: isSel ? "var(--brand)" : "var(--rule-soft)",
                        background: isSel ? "var(--brand)" : "transparent",
                      }}
                    >
                      {isSel && <span className="w-2 h-2 rounded-full bg-panel" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-baseline mb-[10px]">
              <h2 className="font-tight font-extrabold text-[22px] tracking-[-0.02em] m-0">Your submission</h2>
              <div className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-good" />
                <Mono className="text-[10px] text-ink-soft tracking-[.12em] uppercase">Submitted · {MY_ART_SUBMISSION.submittedAt}</Mono>
              </div>
            </div>
            <Rule />
            <div className="mt-[10px]">
              <CompositionCanvas path={ROUTE_PATHS[activity.route]} rotation={rotation} title={title} visibility={visibility} />
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
              <button className="flex-1 py-[14px] px-5 bg-ink text-panel border-none font-tight font-bold text-sm tracking-[.06em] uppercase cursor-pointer">Update artwork</button>
              <button className="py-[14px] px-[18px] bg-transparent text-brand border border-brand font-tight font-bold text-sm tracking-[.06em] uppercase cursor-pointer">Withdraw</button>
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
            {isLive ? "This week's wall" : `${week.label} wall · ${week.theme}`}
          </h2>
          <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">Sorted by likes · {wall.length} entries</Mono>
        </div>
        <Rule />
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {wall.map((s, i) => (
            <div
              key={s.who}
              className={[
                i % 4 !== 3 ? "border-r border-rule-soft" : "",
                i < wall.length - (wall.length % 4 || 4) ? "border-b border-rule-soft" : "",
              ].join(" ")}
            >
              <SubmissionTile s={s} onLike={toggleLike} />
            </div>
          ))}
        </div>
      </div>

      <PageFooter />
      <BottomNav />
    </div>
  );
}
