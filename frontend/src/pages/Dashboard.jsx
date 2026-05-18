import { useMemo, useState } from 'react';
import { Mono, Rule, Tag, CountUp, ScoringCurve, RouteMap } from '../components/ui.jsx';
import { TopBar } from '../components/layout/TopBar.jsx';
import { BottomNav } from '../components/layout/BottomNav.jsx';
import { SettingsDrawer } from '../components/SettingsDrawer.jsx';
import { SECTIONS, WEEKS, ME, WEEK_LABEL, WEEK_DATES, FREEZE, MY_ACTIVITIES, ROUTE_PATHS } from '../lib/mock.js';

export default function Dashboard() {
  const liveWeekN = useMemo(() => WEEKS.find((w) => w.state === "live")?.n || 1, []);
  const [lbMode, setLbMode] = useState("week");
  const [selectedWeek, setSelectedWeek] = useState(liveWeekN);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const valueFor = (s) => lbMode === "week"
    ? s.weeks[selectedWeek - 1]
    : s.weeks.slice(0, selectedWeek).reduce((a, b) => a + b, 0);
  const trendFor = (s) => selectedWeek > 1
    ? +(s.weeks[selectedWeek - 1] - s.weeks[selectedWeek - 2]).toFixed(1)
    : 0;
  const sectionsSorted = useMemo(
    () => [...SECTIONS].sort((a, b) => valueFor(b) - valueFor(a)),
    [lbMode, selectedWeek]
  );

  return (
    <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-7 pb-20 relative" data-page-root>
      <TopBar settingsOpen={settingsOpen} onAvatarClick={() => setSettingsOpen((o) => !o)} />
      <Rule weight={1.5} />

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Hero grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-end py-[26px]">
        <div>
          <Mono className="text-[11px] text-ink-soft tracking-[.18em] uppercase">Good morning, Jordan —</Mono>
          <h1 className="font-tight font-extrabold text-[56px] leading-[1.02] tracking-[-0.035em] mt-2 m-0 [text-wrap:balance]">
            <Mono className="font-tight font-extrabold text-[inherit] tracking-[-0.035em] text-brand">168</Mono> minutes banked this week, Jordan.
          </h1>
          <div className="flex gap-2.5 mt-4 flex-wrap">
            <Tag t={`${ME.section} · #${ME.sectionRank} of ${ME.sectionSize}`} className="bg-chip text-chip-ink" />
            <Tag t={`Streak · ${ME.streak} days`} className="text-ink border border-rule-soft" />
            <Tag t={`Season total · ${ME.totalPoints} pts`} className="text-ink border border-rule-soft" />
          </div>
        </div>
        <div className="bg-panel px-5 py-[18px] border border-rule-soft">
          <div className="flex justify-between items-center mb-2.5">
            <Mono className="text-[11px] tracking-[.14em] uppercase text-ink-soft">{WEEK_LABEL}</Mono>
            <Tag t="LIVE" className="bg-brand text-panel" />
          </div>
          <div className="font-tight font-bold text-[22px] tracking-[-0.02em]">{WEEK_DATES}</div>
          <div className="mt-2.5 text-xs text-ink-soft">
            Snapshot freezes <strong className="text-ink">{FREEZE}</strong>. Section averages lock in for the parent competition.
          </div>
        </div>
      </div>

      <Rule soft />

      {/* Stats 4-col */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-rule-soft">
        {[
          { k: "MINUTES THIS WEEK", v: ME.weekMinutes, sub: `across 4 activities`,                    accent: "text-brand"    },
          { k: "POINTS THIS WEEK",  v: ME.weekPoints,  sub: `+${ME.weekPoints - 142} vs. last week`,  accent: "text-accent-2" },
          { k: "SECTION RANK",      v: `#${ME.sectionRank}`, sub: `${ME.section} · ${ME.sectionSize} members`, accent: "text-ink" },
          { k: "DAYS LEFT IN WEEK", v: 4,              sub: `until ${FREEZE}`,                        accent: "text-accent"   },
        ].map((s, i) =>
          <div key={s.k} className={`px-[22px] pt-[22px] pb-[26px]${i ? " border-l border-rule-soft" : ""}`}>
            <Mono className="text-[10px] tracking-[.16em] text-ink-soft">{s.k}</Mono>
            <div className={`font-tight font-extrabold text-[52px] leading-none tracking-[-0.04em] mt-2 ${s.accent}`}>
              {typeof s.v === "number" ? <CountUp to={s.v} /> : s.v}
            </div>
            <div className="text-xs text-ink-soft mt-1.5">{s.sub}</div>
          </div>
        )}
      </div>

      {/* Main 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-7 mt-7">
        <section>
          <div className="flex items-baseline justify-between mb-2.5">
            <h2 className="font-tight font-extrabold text-[22px] tracking-[-0.02em] m-0">Section leaderboard</h2>
            <div className="flex items-center gap-1.5 p-[3px] border border-rule-soft">
              {[{ v: "week", label: "This Week" }, { v: "season", label: "Season Total" }].map((o) =>
                <button key={o.v} onClick={() => setLbMode(o.v)}
                  className={`font-mono text-[10px] tracking-[.12em] uppercase px-2.5 py-[5px] border-none cursor-pointer${lbMode === o.v ? " bg-ink text-panel font-bold" : " bg-transparent text-ink-soft font-medium"}`}>
                  {o.label}
                </button>
              )}
            </div>
          </div>
          <Rule weight={1.5} />
          {/* Leaderboard header */}
          <div className="border-b border-rule-soft" style={{ display: "grid", gridTemplateColumns: "28px 1.4fr 2.5fr 70px 28px", gap: 12, padding: "10px 0 8px" }}>
            <Mono className="text-[9px] text-ink-soft tracking-[.14em]">#</Mono>
            <Mono className="text-[9px] text-ink-soft tracking-[.14em]">SECTION</Mono>
            <Mono className="text-[9px] text-ink-soft tracking-[.14em]">{lbMode === "week" ? `AVG PTS / MEMBER · WK ${String(selectedWeek).padStart(2, "0")}${selectedWeek === liveWeekN ? " (LIVE)" : ""}` : `Σ WEEKLY AVGS · THRU WK ${String(selectedWeek).padStart(2, "0")}`}</Mono>
            <Mono className="text-[9px] text-ink-soft tracking-[.14em] text-right">{lbMode === "week" ? "PTS" : "TOTAL"}</Mono>
            <Mono className="text-[9px] text-ink-soft tracking-[.14em] text-right">Δ</Mono>
          </div>
          <div>
            {sectionsSorted.map((s, i) => {
              const value = valueFor(s);
              const max = valueFor(sectionsSorted[0]);
              const w = value / max * 100;
              const isTop = i === 0;
              const trend = trendFor(s);
              return (
                <div key={s.name} className={`border-b border-rule-soft items-center${s.isMe ? " bg-black/[.025]" : " bg-transparent"}`}
                  style={{ display: "grid", gridTemplateColumns: "28px 1.4fr 2.5fr 70px 28px", alignItems: "center", gap: 12, padding: "12px 0" }}>
                  <Mono className={`text-[13px]${isTop ? " text-brand font-bold" : " text-ink-soft font-medium"}`}>{String(i + 1).padStart(2, "0")}</Mono>
                  <div className="flex items-center gap-2">
                    <span className={`text-[15px] tracking-[-0.01em]${s.isMe ? " font-bold" : " font-semibold"}`}>{s.name}</span>
                    {s.isMe && <Tag t="YOU" className="bg-chip text-chip-ink" />}
                  </div>
                  <div className="relative h-[10px]">
                    <div className="absolute inset-0 bg-rule-soft" style={{ height: 1, top: "50%" }} />
                    <div className="absolute left-0 top-0 bottom-0"
                      style={{ width: `${w}%`, background: isTop ? "var(--brand)" : s.isMe ? "var(--accent-2)" : "var(--accent)", opacity: isTop ? 1 : s.isMe ? 0.95 : 0.7 }} />
                  </div>
                  <Mono className="text-right text-[15px] font-bold text-ink">{value.toFixed(1)}</Mono>
                  <Mono className={`text-right text-[11px]${trend > 0 ? " text-good" : trend < 0 ? " text-brand" : " text-ink-soft"}`}>
                    {trend > 0 ? `▲${Math.abs(trend).toFixed(1)}` : trend < 0 ? `▼${Math.abs(trend).toFixed(1)}` : "—"}
                  </Mono>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          {/* Scoring curve card */}
          <div className="bg-panel px-5 pt-[18px] pb-[14px] border border-rule-soft">
            <div className="flex justify-between items-baseline mb-2">
              <div>
                <h3 className="font-tight font-extrabold text-lg m-0 tracking-[-0.01em]">How points are scored</h3>
                <div className="text-[11px] text-ink-soft mt-0.5">1 pt/min up to 210 min/wk · diminishing thereafter</div>
              </div>
              <Mono className="text-[11px] text-brand font-bold">YOU · {ME.weekMinutes} MIN</Mono>
            </div>
            <ScoringCurve current={ME.weekMinutes} />
          </div>

          {/* Timeline */}
          <div>
            <div className="flex justify-between items-baseline mb-2.5">
              <h3 className="font-tight font-extrabold text-lg m-0 tracking-[-0.01em]">Competition timeline</h3>
              <Mono className="text-[11px] text-ink-soft">Summer '26 · 8 weeks</Mono>
            </div>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
              {WEEKS.map((w) => {
                const isLive = w.state === "live";
                const isDone = w.state === "done";
                const isSoon = w.state === "soon";
                const isSel = w.n === selectedWeek;
                const clickable = !isSoon;
                return (
                  <button key={w.n} onClick={() => clickable && setSelectedWeek(w.n)} disabled={!clickable}
                    className={`text-center flex flex-col justify-center items-center gap-1 font-sans outline-none transition-[border-color] duration-[.15s] min-h-[56px] py-3 pb-2.5${isLive ? " bg-brand text-panel" : isDone ? " bg-panel-alt text-ink" : " bg-transparent text-ink"}${isSel ? " border-2 border-brand" : isSoon ? " border border-rule-soft" : " border border-transparent"}${isSoon ? " opacity-50" : ""}${clickable ? " cursor-pointer" : " cursor-not-allowed"}`}>
                    <Mono className="text-[9px] opacity-70 tracking-[.14em]">WK {String(w.n).padStart(2, "0")}</Mono>
                    {w.you != null
                      ? <Mono className="text-sm font-bold tracking-[-0.01em]">{w.you}</Mono>
                      : <Mono className="text-sm font-medium opacity-50">—</Mono>}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              <Mono className="text-[10px] text-ink-soft tracking-[.1em] uppercase">Click a week to filter the leaderboard</Mono>
              <Mono className="text-[10px] text-ink-soft tracking-[.1em] uppercase">Viewing · WK {String(selectedWeek).padStart(2, "0")}</Mono>
            </div>
          </div>
        </section>
      </div>

      {/* Strava Art */}
      <div className="mt-9">
        <div className="flex items-baseline justify-between mb-2.5">
          <h2 className="font-tight font-extrabold text-[22px] tracking-[-0.02em] m-0">Strava Art</h2>
          <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">Week 3 · Make an M for Minnesota</Mono>
        </div>
        <Rule weight={1.5} />
        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr_auto] gap-6 items-center py-5 pb-6">
          <div className="aspect-square bg-panel-alt border border-rule-soft overflow-hidden">
            <svg viewBox="0 0 100 90" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
              <path d="M10 78 L 26 18 L 44 60 L 62 18 L 80 78" fill="none" stroke="var(--brand)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div>
            <Mono className="text-[10px] text-ink-soft tracking-[.18em] uppercase">Your submission · Public</Mono>
            <div className="font-tight font-extrabold text-[32px] tracking-[-0.025em] mt-1">Stadium M</div>
            <div className="flex gap-[18px] mt-2.5 items-center flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-brand">
                <svg width="14" height="14" viewBox="0 0 16 16" className="block"><path d="M8 14s-5-3.2-5-7.2A2.8 2.8 0 0 1 8 4a2.8 2.8 0 0 1 5 2.8C13 10.8 8 14 8 14z" fill="var(--brand)" stroke="var(--brand)" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                <Mono className="text-sm font-bold">14 likes</Mono>
              </span>
              <Mono className="text-[11px] text-ink-soft tracking-[.08em] uppercase">6 entries on the wall so far</Mono>
            </div>
            <Mono className="block mt-2 text-[11px] text-ink-soft">Submitted Tue · Jul 7 · 8:42pm. You can revise until Sun 11:59pm.</Mono>
          </div>
          <div className="flex flex-col gap-2">
            <button className="px-[22px] py-3 bg-ink text-panel border-none font-tight font-bold text-[13px] tracking-[.06em] uppercase cursor-pointer whitespace-nowrap">View on wall →</button>
            <button className="px-[22px] py-2.5 bg-transparent text-ink border border-rule font-tight font-bold text-xs tracking-[.06em] uppercase cursor-pointer whitespace-nowrap">Update artwork</button>
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="mt-9">
        <div className="flex items-baseline justify-between mb-2.5">
          <h2 className="font-tight font-extrabold text-[22px] tracking-[-0.02em] m-0">Your activity</h2>
          <div className="flex items-center gap-3">
            <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">Synced via Strava</Mono>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-good font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-good" /> CONNECTED
            </span>
          </div>
        </div>
        <Rule weight={1.5} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {MY_ACTIVITIES.slice(0, 4).map((a, i) =>
            <div key={i} className={`px-[18px] pt-4 pb-[18px]${i < 3 ? " border-r border-rule-soft" : ""}`}>
              <div className="aspect-[10/7] bg-panel-alt mb-3 border border-rule-soft overflow-hidden">
                <RouteMap kind={a.route} />
              </div>
              <div className="flex justify-between items-center mb-1">
                <Mono className="text-[10px] text-ink-soft tracking-[.12em] uppercase">{a.day}</Mono>
                <Tag t={a.sport} className="text-ink border border-rule-soft" />
              </div>
              <div className="font-bold text-[15px] tracking-[-0.01em] my-1 mb-2">{a.title}</div>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-ink-soft">
                <div><div className="text-ink font-semibold">{a.dur}</div>time</div>
                <div><div className="text-ink font-semibold">{a.dist}</div>dist</div>
                <div><div className="text-ink font-semibold">{a.elev}</div>elev</div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Mono className="text-[11px] text-ink-soft">POINTS</Mono>
                <Mono className="text-lg font-extrabold text-brand">+{a.pts}</Mono>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
