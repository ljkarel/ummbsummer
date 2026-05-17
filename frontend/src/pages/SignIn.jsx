import { useNavigate } from 'react-router-dom';
import { Mono, Tag, StaffLines } from '../components/ui.jsx';

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
  const navigate = useNavigate();
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
            Summer workout program · Jun 22 — Aug 16
          </Mono>
          <h1 className="font-tight font-extrabold text-[76px] leading-[0.98] tracking-[-0.04em] mt-3 text-balance">
            Welcome back,<br />
            <span className="text-brand">band.</span>
          </h1>

          <p className="text-base leading-relaxed text-ink-soft mt-[18px] max-w-[520px]">
            Track your summer workouts, compete by section, and make art with your routes. Sign in to keep your streak going.
          </p>

          <button
            onClick={() => navigate('/onboarding')}
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
            <Tag t="244 members" className="text-ink border border-rule-soft" />
            <Tag t="10 sections" className="text-ink border border-rule-soft" />
            <Tag t="Week 3 of 8 live" className="bg-chip text-chip-ink" />
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="aspect-[1/1.05] bg-panel border border-rule-soft p-6 relative overflow-hidden">
            <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Summer '26 · so far</Mono>
            <div className="font-tight font-extrabold text-[48px] tracking-[-0.035em] leading-none mt-1.5">
              <span className="text-brand">12,438</span><br />
              <span className="text-[22px] text-ink-soft font-semibold tracking-[-0.01em]">minutes logged</span>
            </div>
            <div className="mt-[22px] grid grid-cols-4 gap-2">
              {[
                "M10 78 L 26 18 L 44 60 L 62 18 L 80 78",
                "M14 60 C 18 22, 60 14, 78 28 C 96 42, 88 78, 60 80 C 32 82, 10 78, 14 60 Z",
                "M8 78 C 30 70, 36 40, 56 38 C 74 36, 82 52, 92 22",
                "M22 60 C 30 40, 56 38, 64 56 C 70 70, 46 76, 30 70 Z",
                "M50 14 C 30 18, 26 42, 50 46 C 74 50, 74 76, 50 78 C 26 76, 26 50, 50 46",
                "M18 14 L 18 60 C 18 80, 82 80, 82 60 L 82 14",
                "M10 22 L 32 22 L 32 60 L 56 60 L 56 22 L 80 22",
                "M16 60 C 22 18, 78 18, 84 60 C 78 82, 22 82, 16 60 Z",
              ].map((d, i) => (
                <div key={i} className="aspect-square bg-panel-alt border border-rule-soft">
                  <svg viewBox="0 0 100 90" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
                    <path
                      d={d}
                      fill="none"
                      stroke={i % 3 === 0 ? "var(--brand)" : i % 3 === 1 ? "var(--accent-2)" : "var(--accent)"}
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
              ))}
            </div>
            <Mono className="absolute bottom-4 left-6 right-6 text-[10px] text-ink-soft tracking-[.14em] uppercase">
              ↑ A few of the band's routes
            </Mono>
          </div>
        </div>
      </div>

      <div className="opacity-[.35]">
        <StaffLines h={24} />
      </div>

      <div className="flex justify-between mt-2.5 relative z-[1]">
        <Mono className="text-[10px] text-ink-soft tracking-[.16em] uppercase">Built by &amp; for the band · v0.3</Mono>
        <Mono className="text-[10px] text-ink-soft tracking-[.16em] uppercase">Strava · Google · MapBox</Mono>
      </div>
    </div>
  );
}
