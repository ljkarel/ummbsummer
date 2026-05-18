import { useState, Fragment } from 'react';
import { Mono, Rule, Tag } from '../components/ui.jsx';
import { TopBar } from '../components/layout/TopBar.jsx';
import { BottomNav } from '../components/layout/BottomNav.jsx';
import { PageFooter } from '../components/layout/PageFooter.jsx';
import { SettingsDrawer } from '../components/SettingsDrawer.jsx';
import { MY_ACTIVITIES, ROUTE_PATHS } from '../lib/mock.js';

function RouteThumb({ kind }) {
  const d = ROUTE_PATHS[kind] || ROUTE_PATHS.loop;
  return (
    <svg viewBox="0 0 100 90" width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
      {[14, 28, 42, 56, 70].map((y) => <line key={y} x1="0" y1={y} x2="100" y2={y - 6} stroke="var(--ink)" strokeOpacity=".06" strokeWidth=".3" />)}
      {[20, 50, 80].map((x) => <line key={x} x1={x} y1="0" x2={x - 6} y2="90" stroke="var(--ink)" strokeOpacity=".06" strokeWidth=".3" />)}
      <path d={d} fill="none" stroke="var(--brand)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function buildHeatmap() {
  const grid = [];
  const seed = (i) => Math.abs(Math.sin(i * 7.3)) * 60;
  for (let w = 0; w < 8; w++) {
    for (let d = 0; d < 7; d++) {
      let mins = 0;
      if (w < 3) {
        const base = seed(w * 7 + d);
        mins = base < 10 ? 0 : Math.round(base);
        if (w === 2 && d === 2) mins = 168;
        if (w === 2 && d >= 3) mins = 0;
      }
      grid.push({ w, d, mins });
    }
  }
  return grid;
}

function Heatmap() {
  const cells = buildHeatmap();
  const max = 80;
  const color = (mins) => {
    if (!mins) return "var(--panel-alt)";
    const v = Math.min(1, mins / max);
    return `color-mix(in oklab, var(--brand) ${Math.round(v * 100)}%, var(--panel-alt))`;
  };
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-tight font-extrabold text-[15px] m-0" style={{ letterSpacing: "-0.01em" }}>Minutes by day</h3>
        <div className="hidden sm:flex items-center gap-[5px]">
          <Mono className="text-[9px] text-ink-soft tracking-[.1em] uppercase">Less</Mono>
          {[0, 20, 40, 60, 80].map((m) => (
            <div key={m} className="w-[10px] h-[10px] border border-rule-soft" style={{ background: color(m) }} />
          ))}
          <Mono className="text-[9px] text-ink-soft tracking-[.1em] uppercase">More</Mono>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "22px repeat(8, 1fr)", gap: 4, alignItems: "center" }}>
        <span />
        {Array.from({ length: 8 }).map((_, w) => (
          <Mono key={w} className="text-[8px] text-ink-soft tracking-[.08em] uppercase text-center">WK{String(w + 1).padStart(2, "0")}</Mono>
        ))}
        {days.map((dl, d) => (
          <Fragment key={d}>
            <Mono className="text-[8px] text-ink-soft tracking-[.08em] text-right">{dl}</Mono>
            {Array.from({ length: 8 }).map((_, w) => {
              const cell = cells.find((c) => c.w === w && c.d === d);
              const isToday = w === 2 && d === 2;
              return (
                <div
                  key={`${w}-${d}`}
                  className="relative"
                  style={{
                    aspectRatio: "2.4 / 1",
                    background: color(cell?.mins || 0),
                    border: isToday ? "2px solid var(--brand)" : "1px solid var(--rule-soft)",
                  }}
                  title={`Wk ${w + 1}, ${dl} · ${cell?.mins || 0} min`}
                >
                  {(cell?.mins || 0) >= 60 && (
                    <Mono className="absolute inset-0 grid place-items-center text-[9px] font-bold text-panel">{cell.mins}</Mono>
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
  return (
    <div className="p-4" style={{ padding: "16px 18px 18px" }}>
      <div className="bg-panel-alt mb-3 border border-rule-soft overflow-hidden" style={{ aspectRatio: "10 / 7" }}>
        <RouteThumb kind={a.route} />
      </div>
      <div className="flex justify-between items-center mb-1">
        <Mono className="text-[10px] text-ink-soft tracking-[.12em] uppercase">{a.day}</Mono>
        <Tag t={a.sport} className="text-ink border border-rule-soft" />
      </div>
      <div className="font-bold text-sm mb-2 [text-wrap:balance]" style={{ fontSize: 14.5, letterSpacing: "-0.01em", margin: "4px 0 8px" }}>{a.title}</div>
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
  );
}

export default function Activity() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sport, setSport] = useState("All");
  const [sort, setSort] = useState("Recent");

  const sports = ["All", "Run", "Bike", "Swim", "Lift"];
  const sorts = ["Recent", "Points", "Distance"];

  const filtered = MY_ACTIVITIES
    .filter((a) => sport === "All" || a.sport === sport)
    .slice()
    .sort((a, b) => {
      if (sort === "Points") return b.pts - a.pts;
      if (sort === "Distance") { const p = (x) => parseFloat(x.dist) || 0; return p(b) - p(a); }
      return 0;
    });

  const totalMin = MY_ACTIVITIES.reduce((s, a) => s + a.mins, 0);
  const totalPts = MY_ACTIVITIES.reduce((s, a) => s + a.pts, 0);
  const totalActs = MY_ACTIVITIES.length;

  return (
    <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-7 pb-20 relative" data-page-root>
      <TopBar settingsOpen={settingsOpen} onAvatarClick={() => setSettingsOpen((o) => !o)} />
      <Rule weight={1.5} />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <div className="py-[26px] pb-[22px]">
        <Mono className="text-[11px] text-ink-soft tracking-[.18em] uppercase">Your activity — season to date</Mono>
        <h1 className="font-tight font-extrabold text-[56px] leading-none mt-2 mb-0 [text-wrap:balance]" style={{ lineHeight: 1.02, letterSpacing: "-0.035em" }}>
          <Mono className="font-tight font-extrabold text-brand" style={{ fontSize: "inherit", letterSpacing: "-0.035em" }}>{totalActs}</Mono> activities · <Mono className="font-tight font-extrabold" style={{ fontSize: "inherit", letterSpacing: "-0.035em" }}>{totalMin.toLocaleString()}</Mono> minutes logged.
        </h1>
      </div>

      <Rule soft />

      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-rule-soft">
        {[
          { k: "ACTIVITIES", v: totalActs, sub: "since Jun 22",                           accentClass: "text-brand"    },
          { k: "MINUTES",    v: totalMin,  sub: "across 3 weeks",                         accentClass: "text-accent-2" },
          { k: "POINTS",     v: totalPts,  sub: `${Math.round(totalPts / 3)} pts/wk avg`, accentClass: "text-ink"      },
          { k: "DAY STREAK", v: 5,         sub: "longest this season",                    accentClass: "text-accent"   },
        ].map((s, i) => (
          <div key={s.k} className={`p-[22px] pb-[26px]${i ? " border-l border-rule-soft" : ""}`}>
            <Mono className="text-[10px] tracking-[.16em] text-ink-soft">{s.k}</Mono>
            <div className={`font-tight font-extrabold text-[52px] leading-none mt-2 ${s.accentClass}`} style={{ letterSpacing: "-0.04em" }}>{typeof s.v === "number" ? s.v.toLocaleString() : s.v}</div>
            <div className="text-xs text-ink-soft mt-[6px]">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-7"><Heatmap /></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 pb-[10px] border-b" style={{ borderBottomWidth: "1.5px", borderBottomColor: "var(--ink)" }}>
        <div className="flex items-center gap-3">
          <h2 className="font-tight font-extrabold text-[22px] m-0" style={{ letterSpacing: "-0.02em" }}>All activities</h2>
          <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">{filtered.length} shown</Mono>
        </div>
        <div className="flex items-center gap-[18px]">
          <div className="flex items-center gap-[6px]">
            <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Sport</Mono>
            <div className="flex border border-rule-soft">
              {sports.map((s) => (
                <button
                  key={s}
                  onClick={() => setSport(s)}
                  className={`px-[10px] py-[5px] font-mono text-[10px] tracking-[.12em] uppercase cursor-pointer border-0${s !== sports[sports.length - 1] ? " border-r border-rule-soft" : ""}${sport === s ? " bg-ink text-panel font-bold" : " bg-transparent text-ink-soft font-medium"}`}
                >
                  {s}
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
                  className={`px-[10px] py-[5px] font-mono text-[10px] tracking-[.12em] uppercase cursor-pointer border-0${s !== sorts[sorts.length - 1] ? " border-r border-rule-soft" : ""}${sort === s ? " bg-ink text-panel font-bold" : " bg-transparent text-ink-soft font-medium"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((a, i) => (
          <div
            key={`${a.day}-${a.title}`}
            className={[
              i % 4 !== 3 ? "border-r border-rule-soft" : "",
              i < filtered.length - (filtered.length % 4 || 4) ? "border-b border-rule-soft" : "",
            ].filter(Boolean).join(" ")}
          >
            <ActivityCard a={a} />
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
