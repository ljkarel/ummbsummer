import { Link } from 'react-router-dom';
import { StaffLines, Mono } from '../components/ui.jsx';

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

export default function NotOnRoster() {
  return (
    <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-8 pb-7 flex flex-col relative overflow-hidden" data-page-root>
      <FloatRoutes />

      <div className="opacity-[.35]">
        <StaffLines h={24} />
      </div>

      <div className="flex-1 relative z-[1] flex flex-col items-start justify-center max-w-[620px] px-6">
        <div className="font-tight font-extrabold text-[24px] tracking-[-0.02em] mb-10">
          <a href="/signin" className="no-underline text-ink hover:opacity-80">
            UMMB<span className="text-brand">·</span>SUMMER
            <Mono className="font-medium text-base ml-2 text-ink-soft">{"'26"}</Mono>
          </a>
        </div>

        <Mono className="text-[12px] text-ink-soft tracking-[.18em] uppercase">
          Access denied · Not on roster
        </Mono>

        <h1 className="font-tight font-extrabold text-[56px] leading-[1.0] tracking-[-0.04em] mt-3 text-balance">
          We couldn't find you<br />
          <span className="text-brand">on the roster.</span>
        </h1>

        <div className="mt-6 bg-panel border border-rule-soft p-5 max-w-[520px]">
          <Mono className="block text-[10px] text-ink-soft tracking-[.14em] uppercase mb-2">Important</Mono>
          <p className="text-[15px] leading-relaxed text-ink font-medium mb-1.5">
            Make sure you're signing in with your <strong>@umn.edu</strong> Google account.
          </p>
          <p className="text-[14px] leading-relaxed text-ink-soft">
            Only members on the 2026 UMMB roster can access this app.
          </p>
        </div>

        <div className="flex gap-3 mt-7 flex-wrap">
          <Link
            to="/signin"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink text-panel font-tight font-bold text-[15px] tracking-[-0.005em] no-underline"
            style={{ boxShadow: '0 5px 0 var(--brand)' }}
          >
            ← Back to sign in
          </Link>
          <Link
            to="/roster-request"
            className="inline-flex items-center gap-2 px-6 py-3.5 border border-rule-soft text-ink font-tight font-bold text-[15px] tracking-[-0.005em] no-underline hover:opacity-80"
          >
            Submit a roster request →
          </Link>
        </div>

        <Mono className="block mt-5 text-[11px] text-ink-soft tracking-[.06em] max-w-[480px] leading-relaxed">
          If you believe this is an error, make sure you're using your <strong className="text-ink">@umn.edu</strong> account or submit a request and an admin will review it.
        </Mono>
      </div>

      <div className="opacity-[.35]">
        <StaffLines h={24} />
      </div>
    </div>
  );
}
