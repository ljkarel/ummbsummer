import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mono, Rule, StaffLines } from '../components/ui.jsx';
import { BASE, getMe, patchMe, getPeriods } from '../lib/api.js';

function Stepper({ step, total }) {
  return (
    <div className="flex flex-col gap-2 max-w-[420px] flex-1">
      <div className="flex justify-between items-baseline">
        <Mono className="text-[11px] tracking-[.18em] text-ink-soft uppercase">Step {step} of {total}</Mono>
        <Mono className="text-[11px] tracking-[.18em] text-ink-soft uppercase">
          {step === 1 ? "Connect Strava" : step === 2 ? "Your profile" : "Welcome"}
        </Mono>
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="h-1 transition-colors duration-200"
            style={{ background: i < step ? "var(--brand)" : "var(--rule-soft)" }}
          />
        ))}
      </div>
    </div>
  );
}

function OnboardingShell({ children, step = 1, total = 2 }) {
  return (
    <div data-page-root className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-8 pb-7 relative overflow-hidden flex flex-col">
      <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
        <div className="font-tight font-extrabold text-[22px] tracking-[-0.02em]">
          UMMB<span className="text-brand">·</span>SUMMER
          <Mono className="font-medium text-sm ml-2 text-ink-soft">{"'26"}</Mono>
        </div>
        <Stepper step={step} total={total} />
      </div>

      <Rule soft />

      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>

      <div className="opacity-25">
        <StaffLines h={16} />
      </div>
    </div>
  );
}

export function OnboardingStrava() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scopeError = searchParams.get('strava_scope_error') === 'true';

  return (
    <OnboardingShell step={1} total={2}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-[1100px] w-full">
        <div>
          <Mono className="text-[11px] text-ink-soft tracking-[.18em] uppercase">Let's get you set up.</Mono>
          <h1 className="font-tight font-extrabold text-[64px] leading-[0.98] tracking-[-0.04em] mt-2.5 text-balance">
            Connect <span className="text-brand">Strava</span> to sync your workouts.
          </h1>
          <p className="text-base leading-[1.55] text-ink-soft mt-[18px] max-w-[480px]">
            We use Strava to count your minutes. New activities sync automatically.
          </p>

          {scopeError && (
            <div className="mt-5 px-4 py-3.5 border border-brand max-w-[480px]">
              <Mono className="text-[11px] text-brand tracking-[.12em] uppercase block mb-1">Permission required</Mono>
              <p className="text-sm text-ink-soft m-0 leading-relaxed">
                Activity access is required. Please reconnect and allow access to your Strava activities when prompted.
              </p>
            </div>
          )}

          <button
            onClick={() => { window.location.href = `${BASE}/api/strava/init/`; }}
            className="inline-flex items-center gap-3 mt-6 px-7 py-4 bg-brand text-panel border-none cursor-pointer font-tight font-bold text-base tracking-[-0.005em]"
            style={{ boxShadow: "0 6px 0 var(--ink)" }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" className="block">
              <path d="M3 10 L 8 4 L 12 13 L 15 9 L 17 12" fill="none" stroke="var(--panel)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Connect with Strava
            <span className="text-[18px] ml-0.5">→</span>
          </button>
          <Mono className="block mt-3.5 text-[11px] text-ink-soft tracking-[.06em] max-w-[480px] leading-relaxed">
            You'll be redirected to strava.com to authorize. You can disconnect any time from Settings.{' '}
            <span
              role="button"
              tabIndex={0}
              onClick={() => navigate('/')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
              className="text-ink-soft underline underline-offset-2 decoration-rule-soft cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
            >
              Not now.
            </span>
          </Mono>
        </div>

        <div className="bg-panel border border-rule-soft px-[26px] py-6">
          <Mono className="text-[11px] text-ink-soft tracking-[.18em] uppercase block mb-3.5">What we'll access</Mono>
          <ul className="m-0 p-0 list-none text-[14px] text-ink leading-[1.9]">
            {[
              { v: true,  s: "Your Strava activities — type, time, distance, route" },
              { v: true,  s: "Your name &amp; profile picture" },
              { v: false, s: "We won't post or modify any activities" },
              { v: false, s: "We won't change your Strava profile" },
            ].map((row) => (
              <li key={row.s} className="grid items-baseline gap-2.5" style={{ gridTemplateColumns: "20px 1fr" }}>
                <span className={`font-bold font-mono ${row.v ? "text-good" : "text-brand"}`}>{row.v ? "✓" : "✗"}</span>
                <span className={row.v ? "text-ink" : "text-ink-soft"} dangerouslySetInnerHTML={{ __html: row.s }} />
              </li>
            ))}
          </ul>
          <Mono className="block mt-[18px] text-[11px] text-ink-soft leading-relaxed">
            We use the standard Strava OAuth flow. You can revoke access any time from Settings.
          </Mono>
        </div>
      </div>
    </OnboardingShell>
  );
}

export function OnboardingProfile() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [nickname, setNickname] = useState('');
  const [preferredEmail, setPreferredEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    getMe().then((data) => {
      setMe(data);
      if (!initialized.current) {
        setNickname(data.nickname ?? data.name ?? '');
        setPreferredEmail(data.preferred_email ?? data.roster_email ?? '');
        initialized.current = true;
      }
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await patchMe({ nickname: nickname || null, preferredEmail: preferredEmail || null });
      navigate('/onboarding/done');
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingShell step={2} total={2}>
      <div className="max-w-[640px] w-full">
        <Mono className="text-[11px] text-ink-soft tracking-[.18em] uppercase block">
          Almost there ·
          <span className="text-good ml-1.5 tracking-[.18em]">● Strava connected</span>
        </Mono>
        <h1 className="font-tight font-extrabold text-[64px] leading-[0.98] tracking-[-0.04em] mt-2.5 text-balance">
          How should we<br />
          <span className="text-brand">address you?</span>
        </h1>
        <p className="text-base leading-[1.55] text-ink-soft mt-4 max-w-[500px]">
          Both are optional. We pulled defaults from the band roster — change either if you want.
        </p>

        <div className="mt-[26px] grid grid-cols-1 gap-[18px]">
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Preferred name</Mono>
              {me && <Mono className="text-[10px] text-ink-soft tracking-[.06em]">from roster · {me.name}</Mono>}
            </div>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={me?.name ?? ''}
              className="block w-full px-4 py-3.5 border border-rule bg-panel text-ink font-tight font-bold text-[22px] tracking-[-0.01em] outline-none box-border"
            />
            <Mono className="block mt-1 text-[10px] text-ink-soft">How others on the leaderboard will see you.</Mono>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Preferred contact email</Mono>
              {me && <Mono className="text-[10px] text-ink-soft tracking-[.06em]">from roster · {me.roster_email}</Mono>}
            </div>
            <input
              type="email"
              value={preferredEmail}
              onChange={(e) => setPreferredEmail(e.target.value)}
              placeholder={me?.roster_email ?? ''}
              className="block w-full px-4 py-3.5 border border-rule bg-panel text-ink font-sans text-[15px] tracking-[-0.005em] outline-none box-border"
            />
            <Mono className="block mt-1 text-[10px] text-ink-soft">For weekly recap emails &amp; section-leader pings. Leave as your @umn.edu if you prefer.</Mono>
          </div>
        </div>

        <div className="mt-7 flex gap-3 items-center flex-wrap">
          <button onClick={() => navigate('/onboarding')} className="px-6 py-3.5 bg-transparent text-ink-soft border border-rule-soft font-tight font-bold text-[13px] tracking-[.06em] uppercase cursor-pointer">← Back</button>
          <button onClick={() => navigate('/onboarding/done')} className="px-6 py-3.5 bg-transparent text-ink border border-rule font-tight font-bold text-[13px] tracking-[.06em] uppercase cursor-pointer">Skip for now</button>
          <div className="flex-1" />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-4 bg-ink text-panel border-none font-tight font-bold text-[14px] tracking-[.06em] uppercase cursor-pointer disabled:opacity-60"
            style={{ boxShadow: "0 5px 0 var(--brand)" }}
          >
            {saving ? 'Saving…' : 'Save & continue →'}
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}

export function OnboardingDone() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [periods, setPeriods] = useState([]);

  useEffect(() => {
    Promise.all([getMe(), getPeriods()]).then(([meData, periodsData]) => {
      setMe(meData);
      setPeriods(periodsData);
    });
  }, []);

  const livePeriod = periods.find((p) => p.state === 'live');
  const totalPeriods = periods.length;
  const livePeriodN = livePeriod ? livePeriod.name.replace('Period ', '') : '—';

  return (
    <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-8 pb-7 relative overflow-hidden flex flex-col items-center justify-center" data-page-root>
      <div className="absolute top-8 left-9 font-tight font-extrabold text-[22px] tracking-[-0.02em]">
        UMMB<span className="text-brand">·</span>SUMMER
        <Mono className="font-medium text-sm ml-2 text-ink-soft">{"'26"}</Mono>
      </div>

      <div className="text-center max-w-[700px]">
        <Mono className="text-[11px] text-ink-soft tracking-[.18em] uppercase">● All set</Mono>
        <h1 className="font-tight font-extrabold text-[96px] leading-[0.95] tracking-[-0.045em] mt-3 text-balance">
          You're <span className="text-brand">in.</span>
        </h1>
        <p className="text-[18px] leading-relaxed text-ink-soft mt-5 max-w-[560px] mx-auto">
          Welcome to Summer '26{me ? `, ${me.name}` : ''}.{' '}
          {me?.section
            ? <>We matched you to the <strong className="text-ink">{me.section}</strong> section. We'll back-sync any activities you've already done this summer on your first dashboard load.</>
            : <>You're set up as an independent participant. We'll back-sync any activities you've already done this summer on your first dashboard load.</>
          }
        </p>

        <div className="mt-7 inline-flex gap-0 border border-rule-soft">
          {[
            { k: "SECTION",  v: me?.section ?? '—',                           colored: true },
            { k: "WEEK",     v: totalPeriods ? `${livePeriodN} / ${totalPeriods} live` : '…', colored: false },
            { k: "FREEZES",  v: "Sun 11:59pm",                                colored: false },
          ].map((s, i) => (
            <div key={s.k} className={`px-[22px] py-3.5 bg-panel ${i ? "border-l border-rule-soft" : ""}`}>
              <Mono className="text-[10px] text-ink-soft tracking-[.14em] block">{s.k}</Mono>
              <div className={`font-tight font-extrabold text-[22px] tracking-[-0.02em] mt-0.5 ${s.colored ? "text-brand" : "text-ink"}`}>{s.v}</div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={() => navigate('/')}
            className="px-9 py-[18px] bg-ink text-panel border-none cursor-pointer font-tight font-bold text-base tracking-[-0.005em]"
            style={{ boxShadow: "0 6px 0 var(--brand)" }}
          >
            Go to dashboard →
          </button>
        </div>
      </div>

      <div className="absolute left-9 right-9 bottom-6 opacity-25">
        <StaffLines h={20} />
      </div>
    </div>
  );
}
