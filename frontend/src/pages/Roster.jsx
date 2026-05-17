import { useState, useMemo } from 'react';
import { Mono, Rule, Tag } from '../components/ui.jsx';
import { TopBar } from '../components/layout/TopBar.jsx';
import { BottomNav } from '../components/layout/BottomNav.jsx';
import { PageFooter } from '../components/layout/PageFooter.jsx';
import { SettingsDrawer } from '../components/SettingsDrawer.jsx';
import { SECTIONS } from '../lib/mock.js';

const ROSTER = [
  { name: "Anika Bose",    handle: "@anika.b",    section: "Trumpets",    role: "leader", year: "Senior",    weekPts: 198, season: 612, status: "connected" },
  { name: "Jordan Mehta",  handle: "@jordan.m",   section: "Trumpets",    role: "member", year: "Junior",    weekPts: 168, season: 492, status: "connected", isMe: true },
  { name: "Owen Kim",      handle: "@owen.k",     section: "Trumpets",    role: "member", year: "Sophomore", weekPts: 172, season: 452, status: "connected" },
  { name: "Maria Tovar",   handle: "@maria.t",    section: "Trumpets",    role: "member", year: "Senior",    weekPts: 186, season: 528, status: "connected" },
  { name: "Sami Khan",     handle: "@sami.k",     section: "Trumpets",    role: "member", year: "Freshman",  weekPts: 84,  season: 84,  status: "pending" },
  { name: "Rita Lopez",    handle: "—",           section: "Trumpets",    role: "member", year: "Rookie",    weekPts: 0,   season: 0,   status: "unregistered" },

  { name: "Ben Friedman",  handle: "@ben.f",      section: "Mellophones", role: "leader", year: "Senior",    weekPts: 212, season: 588, status: "connected" },
  { name: "Anika R.",      handle: "@anika.r",    section: "Mellophones", role: "member", year: "Junior",    weekPts: 245, season: 687, status: "connected" },
  { name: "Cole Vu",       handle: "@cole.v",     section: "Mellophones", role: "member", year: "Sophomore", weekPts: 158, season: 388, status: "connected" },
  { name: "Dev Chen",      handle: "@dev.c",      section: "Mellophones", role: "member", year: "Junior",    weekPts: 132, season: 332, status: "connected" },

  { name: "Sun-Jae Park",  handle: "@sun.p",      section: "Drumline",    role: "leader", year: "Senior",    weekPts: 230, season: 644, status: "connected" },
  { name: "Quinn O'Hara",  handle: "@quinn.o",    section: "Drumline",    role: "member", year: "Junior",    weekPts: 240, season: 652, status: "connected" },
  { name: "Marcus Lee",    handle: "@marcus.l",   section: "Drumline",    role: "member", year: "Sophomore", weekPts: 162, season: 412, status: "connected" },
  { name: "Tess Inouye",   handle: "—",           section: "Drumline",    role: "member", year: "Rookie",    weekPts: 0,   season: 0,   status: "unregistered" },

  { name: "Reza Mahdavi",  handle: "@reza.m",     section: "Trombones",   role: "leader", year: "Senior",    weekPts: 236, season: 668, status: "connected" },
  { name: "Aliya Reyes",   handle: "@aliya.r",    section: "Trombones",   role: "member", year: "Junior",    weekPts: 218, season: 601, status: "connected" },
  { name: "Hugo Sato",     handle: "@hugo.s",     section: "Trombones",   role: "member", year: "Sophomore", weekPts: 96,  season: 196, status: "pending" },

  { name: "Lila Park",     handle: "@lila.p",     section: "Saxes",       role: "leader", year: "Senior",    weekPts: 184, season: 504, status: "connected" },
  { name: "Theo Lin",      handle: "@theo.l",     section: "Saxes",       role: "member", year: "Junior",    weekPts: 220, season: 612, status: "connected" },
  { name: "Mei Wong",      handle: "@mei.w",      section: "Saxes",       role: "member", year: "Sophomore", weekPts: 184, season: 524, status: "connected" },

  { name: "Gus Romero",    handle: "@gus.r",      section: "Sousas",      role: "leader", year: "Senior",    weekPts: 196, season: 518, status: "connected" },
  { name: "Lex Halvorson", handle: "—",           section: "Sousas",      role: "member", year: "Rookie",    weekPts: 0,   season: 0,   status: "unregistered" },

  { name: "Priya Nair",    handle: "@priya.n",    section: "Clarinets",   role: "leader", year: "Senior",    weekPts: 168, season: 410, status: "connected" },
  { name: "Eli Bauer",     handle: "@eli.b",      section: "Clarinets",   role: "member", year: "Junior",    weekPts: 124, season: 326, status: "connected" },
  { name: "Sofia Marin",   handle: "@sofia.m",    section: "Clarinets",   role: "member", year: "Sophomore", weekPts: 142, season: 360, status: "connected" },

  { name: "KJ Mensah",     handle: "@kj.m",       section: "Flutes",      role: "leader", year: "Senior",    weekPts: 188, season: 508, status: "connected" },
  { name: "Iris Tan",      handle: "@iris.t",     section: "Flutes",      role: "member", year: "Junior",    weekPts: 96,  season: 248, status: "connected" },
  { name: "Noah Schmidt",  handle: "—",           section: "Flutes",      role: "member", year: "Rookie",    weekPts: 0,   season: 0,   status: "unregistered" },

  { name: "Theo Liu",      handle: "@theo.l2",    section: "Color Guard", role: "leader", year: "Senior",    weekPts: 158, season: 412, status: "connected" },
  { name: "Cam Brooks",    handle: "@cam.b",      section: "Color Guard", role: "member", year: "Junior",    weekPts: 132, season: 348, status: "pending" },

  { name: "Renée Okafor",  handle: "@renee.o",    section: "Pit",         role: "leader", year: "Senior",    weekPts: 168, season: 408, status: "connected" },
  { name: "Joaquin Vega",  handle: "@joaquin.v",  section: "Pit",         role: "member", year: "Junior",    weekPts: 88,  season: 232, status: "connected" },
];

function initialsOf(name) {
  const parts = name.split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}

function StatusDot({ status }) {
  const dotClass = status === "connected" ? "bg-good" : status === "pending" ? "bg-accent" : "bg-ink-soft";
  const labels = { connected: "Connected", pending: "Pending Strava connect", unregistered: "Not signed in" };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      <Mono className="text-[10px] text-ink-soft tracking-[.08em]">{labels[status]}</Mono>
    </span>
  );
}

function MemberCard({ m }) {
  const avatarBg = m.status === "unregistered" ? "bg-panel-alt" : "bg-brand";
  const avatarText = m.status === "unregistered" ? "text-ink-soft" : "text-panel";
  const avatarOpacity = m.status === "unregistered" ? "opacity-60" : "";
  return (
    <div className="p-3 flex gap-3 items-center" style={m.isMe ? { background: "rgba(0,0,0,.025)" } : undefined}>
      <div className="relative shrink-0">
        <div className={`w-9 h-9 rounded-full ${avatarBg} ${avatarText} ${avatarOpacity} grid place-items-center font-tight font-extrabold text-[13px] tracking-[-0.02em]`}>
          {initialsOf(m.name)}
        </div>
        {m.role === "leader" && (
          <div className="absolute -bottom-[3px] -right-[3px] bg-ink text-panel font-mono text-[7px] tracking-[.12em] leading-none px-[3px] py-[2px]">LEAD</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`${m.isMe ? "font-extrabold text-brand" : "font-bold text-ink"} text-[13.5px] tracking-[-0.01em] flex items-baseline gap-1.5 min-w-0`}>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{m.name}</span>
          {m.isMe && <span className="text-[9px] text-ink-soft font-mono tracking-[.14em] shrink-0">YOU</span>}
        </div>
        <Mono className="text-[10px] text-ink-soft mt-0.5 block whitespace-nowrap overflow-hidden text-ellipsis">
          {m.section} · {m.year}
        </Mono>
        <div className="mt-1.5">
          <StatusDot status={m.status} />
        </div>
      </div>
    </div>
  );
}

export default function Roster() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const sectionsOnly = SECTIONS.map((s) => s.name);
  const filtered = useMemo(() =>
    ROSTER.filter((m) => (filter === "All" || m.section === filter) && (statusFilter === "All" || m.status === statusFilter)),
    [filter, statusFilter]
  );

  const stats = useMemo(() => {
    const totalRosterSize = SECTIONS.reduce((s, x) => s + x.members, 0);
    const connected    = ROSTER.filter((m) => m.status === "connected").length;
    const pending      = ROSTER.filter((m) => m.status === "pending").length;
    const unregistered = ROSTER.filter((m) => m.status === "unregistered").length;
    return { totalRosterSize, sections: SECTIONS.length, connected, pending, unregistered, sample: ROSTER.length };
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
            <Mono className="font-tight font-extrabold text-[56px] tracking-[-0.035em] text-brand">{stats.totalRosterSize}</Mono> members across<br />
            {stats.sections} sections.
          </h1>
          <div className="flex gap-2.5 mt-4 flex-wrap">
            <Tag t={`${stats.connected} connected to Strava`} className="bg-chip text-chip-ink" />
            <Tag t={`${stats.pending} pending Strava`} className="text-ink border border-rule-soft" />
            <Tag t={`${stats.unregistered} not signed in yet`} className="text-ink border border-rule-soft" />
          </div>
        </div>
        <div className="bg-panel px-5 py-[18px] border border-rule-soft">
          <Mono className="text-[11px] text-ink-soft tracking-[.14em] uppercase block mb-2.5">Sign-in funnel</Mono>
          <div
            className="grid h-6 gap-0.5"
            style={{ gridTemplateColumns: `${stats.connected}fr ${stats.pending}fr ${stats.unregistered}fr` }}
          >
            <div className="bg-good" title={`${stats.connected} connected`} />
            <div className="bg-accent" title={`${stats.pending} pending`} />
            <div className="bg-ink-soft opacity-40" title={`${stats.unregistered} unregistered`} />
          </div>
          <div className="flex justify-between mt-2">
            <Mono className="text-[10px] text-ink-soft tracking-[.1em] uppercase">Strava connected</Mono>
            <Mono className="text-[10px] text-ink-soft tracking-[.1em] uppercase">Not signed in</Mono>
          </div>
          <div className="flex gap-[18px] mt-3">
            <div>
              <Mono className="text-[10px] text-ink-soft tracking-[.12em]">CONNECTED</Mono>
              <Mono className="block text-[22px] font-extrabold text-good mt-0.5">{stats.connected}</Mono>
            </div>
            <div>
              <Mono className="text-[10px] text-ink-soft tracking-[.12em]">PENDING</Mono>
              <Mono className="block text-[22px] font-extrabold text-accent mt-0.5">{stats.pending}</Mono>
            </div>
            <div>
              <Mono className="text-[10px] text-ink-soft tracking-[.12em]">UNREGISTERED</Mono>
              <Mono className="block text-[22px] font-extrabold text-ink-soft mt-0.5">{stats.unregistered}</Mono>
            </div>
          </div>
        </div>
      </div>

      <Rule soft />

      {/* Filters */}
      <div className="mt-[18px] mb-3.5 flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Section</Mono>
          {["All", ...sectionsOnly].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-[11px] py-[6px] font-tight text-[12px] tracking-[-0.01em] cursor-pointer leading-none border ${
                filter === s
                  ? "bg-ink text-panel border-ink font-bold"
                  : "bg-transparent text-ink border-rule-soft font-medium"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Status</Mono>
          {["All", "connected", "pending", "unregistered"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-[11px] py-[6px] font-mono text-[10.5px] tracking-[.06em] uppercase cursor-pointer leading-none border ${
                statusFilter === s
                  ? "bg-ink text-panel border-ink font-bold"
                  : "bg-transparent text-ink border-rule-soft font-medium"
              }`}
            >
              {s}
            </button>
          ))}
          <div className="flex-1" />
          <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">
            Showing {filtered.length} of {ROSTER.length} (sample · full roster {stats.totalRosterSize})
          </Mono>
        </div>
      </div>

      <Rule />

      {/* Member grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5">
        {filtered.map((m, i) => {
          const cols = 5;
          const lastRowStart = filtered.length - (filtered.length % cols || cols);
          const isLastCol = i % cols === cols - 1;
          const isLastRow = i >= lastRowStart;
          return (
            <div
              key={`${m.name}-${i}`}
              className={[
                !isLastCol ? "border-r border-rule-soft" : "",
                !isLastRow ? "border-b border-rule-soft" : "",
              ].join(" ")}
            >
              <MemberCard m={m} />
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-[60px] text-center font-tight text-lg text-ink-soft">
          Nobody matches this filter.
        </div>
      )}

      <PageFooter />
      <BottomNav />
    </div>
  );
}
