import { Link } from 'react-router-dom';
import { StaffLines, Mono } from '../components/ui.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

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

export default function NotFound() {
  const { user } = useAuth();

  let cta;
  if (user === undefined) {
    cta = (
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink text-panel border-none cursor-pointer font-tight font-bold text-[15px] tracking-[-0.005em]"
        style={{ boxShadow: '0 5px 0 var(--brand)' }}
      >
        ← Go back
      </button>
    );
  } else if (user !== null) {
    cta = (
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink text-panel font-tight font-bold text-[15px] tracking-[-0.005em] no-underline"
        style={{ boxShadow: '0 5px 0 var(--brand)' }}
      >
        Go to dashboard →
      </Link>
    );
  } else {
    cta = (
      <Link
        to="/signin"
        className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink text-panel font-tight font-bold text-[15px] tracking-[-0.005em] no-underline"
        style={{ boxShadow: '0 5px 0 var(--brand)' }}
      >
        Back to sign in →
      </Link>
    );
  }

  return (
    <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-8 pb-7 flex flex-col relative overflow-hidden" data-page-root>
      <FloatRoutes />

      <div className="opacity-[.35]">
        <StaffLines h={24} />
      </div>

      <div className="flex-1 relative z-[1] flex flex-col items-start justify-center max-w-[620px] px-6">
        <div className="font-tight font-extrabold text-[24px] tracking-[-0.02em] mb-10">
          <a href="/" className="no-underline text-ink hover:opacity-80">
            UMMB<span className="text-brand">·</span>SUMMER
            <Mono className="font-medium text-base ml-2 text-ink-soft">{"'26"}</Mono>
          </a>
        </div>

        <Mono className="text-[12px] text-ink-soft tracking-[.18em] uppercase">
          404 · Page not found
        </Mono>

        <h1 className="font-tight font-extrabold text-[72px] leading-[0.98] tracking-[-0.04em] mt-3 text-balance">
          Lost on<br />
          <span className="text-brand">the route.</span>
        </h1>

        <p className="text-base leading-relaxed text-ink-soft mt-[18px] max-w-[420px]">
          That page doesn't exist or may have moved.
        </p>

        <div className="mt-7">
          {cta}
        </div>
      </div>

      <div className="opacity-[.35]">
        <StaffLines h={24} />
      </div>
    </div>
  );
}
