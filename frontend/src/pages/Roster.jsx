import { useState, useMemo } from 'react';
import { Mono, Rule, Tag } from '../components/ui.jsx';
import { TopBar } from '../components/layout/TopBar.jsx';
import { BottomNav } from '../components/layout/BottomNav.jsx';
import { PageFooter } from '../components/layout/PageFooter.jsx';
import { SettingsDrawer } from '../components/SettingsDrawer.jsx';
import { SECTIONS, ROSTER } from '../lib/mock.js';

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
  return (
    <div className="p-3" style={m.isMe ? { background: "rgba(0,0,0,.025)" } : undefined}>
      <div className={`${m.isMe ? "font-extrabold text-brand" : "font-bold text-ink"} text-[13.5px] tracking-[-0.01em] flex items-baseline gap-1.5 min-w-0`}>
        <span className="overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{m.name}</span>
        {m.role === "leader" && <Mono className="text-[9px] text-ink-soft tracking-[.14em] shrink-0">LEAD</Mono>}
        {m.isMe && <Mono className="text-[9px] text-ink-soft tracking-[.14em] shrink-0">YOU</Mono>}
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
