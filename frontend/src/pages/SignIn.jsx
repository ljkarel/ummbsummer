import { useEffect, useState } from 'react';
import { Mono, Tag, StaffLines } from '../components/ui.jsx';
import { BASE, getPublicStats } from '../lib/api.js';

const CT = 'America/Chicago';
function fmtDate(dateStr) {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: CT });
}

function GMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" className="block">
      <circle cx="11" cy="11" r="11" fill="var(--ink)" />
      <text x="11" y="15.5" textAnchor="middle" fontFamily='"Inter Tight", sans-serif' fontWeight="800" fontSize="13" fill="var(--panel)">G</text>
    </svg>
  );
}

function FloatRoutes() {
  const paths = [
    "M-10 70 C 80 30, 140 110, 240 60 C 340 10, 420 80, 520 50",
    "M40 220 C 130 180, 200 260, 300 210 C 400 170, 480 240, 580 200",
    "M-20 360 C 90 300, 180 400, 280 340 C 380 280, 460 380, 560 320",
  ];
  return (
    <svg width="100%" height="100%" viewBox="0 0 600 420" preserveAspectRatio="none" className="absolute inset-0 pointer-events-none">
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="var(--brand)" strokeOpacity={i === 0 ? 0.10 : 0.06} strokeWidth={2.5} strokeLinecap="round" />
      ))}
    </svg>
  );
}

export default function SignIn() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getPublicStats().then(setStats).catch(() => {});
  }, []);

  const totalMinutes = stats?.total_minutes ?? 12438;
  const totalHours = Math.round(totalMinutes / 60);
  const totalDays = (totalMinutes / (60 * 24)).toFixed(1);
  const memberCount = stats?.member_count ?? 244;
  const sectionCount = stats?.section_count ?? 10;
  const liveN = stats?.live_period_n ?? null;
  const totalPeriods = stats?.total_periods ?? 8;
  const dateRange = stats ? `${fmtDate(stats.start_date)} — ${fmtDate(stats.end_date)}` : 'Jun 22 — Aug 16';

  return (
    <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-8 pb-7 flex flex-col relative overflow-hidden" data-page-root>
      <FloatRoutes />

      <div className="opacity-[.35]">
        <StaffLines h={24} />
      </div>

      <div className="flex-1 relative z-[1] grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-16 items-center px-6">
        <div className="max-w-[620px]">
          <div className="font-tight font-extrabold text-[24px] tracking-[-0.02em] mb-8">
            UMMB<span className="text-brand">·</span>SUMMER
            <Mono className="font-medium text-base ml-2 text-ink-soft">{"'26"}</Mono>
          </div>

          <Mono className="text-[12px] text-ink-soft tracking-[.18em] uppercase">
            Summer workout program · {dateRange}
          </Mono>
          <h1 className="font-tight font-extrabold text-[76px] leading-[0.98] tracking-[-0.04em] mt-3 text-balance">
            We move,<br />
            <span className="text-brand">together.</span>
          </h1>

          <p className="text-base leading-relaxed text-ink-soft mt-[18px] max-w-[520px]">
            Track your summer workouts, compete by section, and make art with your routes. Sign in to get started.
          </p>

          <button
            onClick={() => { window.location.href = `${BASE}/api/auth/init/`; }}
            className="inline-flex items-center gap-3 mt-7 px-7 py-4 bg-ink text-panel border-none cursor-pointer font-tight font-bold text-base tracking-[-0.005em]"
            style={{ boxShadow: "0 6px 0 var(--brand)" }}
          >
            <GMark />
            Continue with Google
            <span className="text-[18px] ml-0.5">→</span>
          </button>

          <Mono className="block mt-3.5 text-[11px] text-ink-soft tracking-[.06em] max-w-[520px] leading-relaxed">
            Use your <strong className="text-ink">@umn.edu</strong> account. Only members on the UMMB roster can enter.
          </Mono>

          <div className="mt-9 flex gap-7 items-center flex-wrap">
            <Tag t={`${memberCount} members`} className="text-ink border border-rule-soft" />
            <Tag t={`${sectionCount} sections`} className="text-ink border border-rule-soft" />
            {liveN && <Tag t={`Week ${liveN} of ${totalPeriods} live`} className="bg-chip text-chip-ink" />}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="bg-panel border border-rule-soft p-6 relative overflow-hidden">
            <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Summer '26 · so far</Mono>
            <div className="font-tight font-extrabold text-[48px] tracking-[-0.035em] leading-none mt-1.5">
              <span className="text-brand">{totalMinutes.toLocaleString()}</span><br />
              <span className="text-[22px] text-ink-soft font-semibold tracking-[-0.01em]">minutes logged</span>
            </div>
            <div className="mt-5 pt-5 border-t border-rule-soft">
              <div className="font-tight font-extrabold text-[38px] tracking-[-0.035em] leading-none">
                <span className="text-accent-2">{totalHours.toLocaleString()}</span>
              </div>
              <span className="text-[18px] font-tight font-semibold text-ink-soft tracking-[-0.01em]">hours</span>
            </div>
            <div className="mt-5 pt-5 border-t border-rule-soft">
              <div className="font-tight font-extrabold text-[38px] tracking-[-0.035em] leading-none">
                <span className="text-accent">{totalDays}</span>
              </div>
              <span className="text-[18px] font-tight font-semibold text-ink-soft tracking-[-0.01em]">days of effort</span>
            </div>
          </div>
        </div>
      </div>

      <div className="opacity-[.35]">
        <StaffLines h={24} />
      </div>

      <div className="flex justify-between mt-2.5 relative z-[1]">
        <Mono className="text-[10px] text-ink-soft tracking-[.16em] uppercase">Built by Lukas Karel · RTBSUMGG</Mono>
        <Mono className="text-[10px] text-ink-soft tracking-[.16em] uppercase">March on</Mono>
      </div>
    </div>
  );
}
