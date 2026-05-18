import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { StaffLines, Mono, INPUT_CLS, INPUT_ERR_STYLE, SelectWrapper } from '../components/ui.jsx';
import { getSections, submitRosterRequest } from '../lib/api.js';

const YEAR_OPTIONS = [
  { value: 1, label: 'Rookie' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
  { value: 5, label: '5th Year+' },
];


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

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


export default function RosterRequest() {
  const [sections, setSections] = useState(null);
  const [sectionsError, setSectionsError] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', section: '', year: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitState, setSubmitState] = useState('idle'); // idle | submitting | success | error
  const [serverError, setServerError] = useState('');
  const triedRef = useRef(false);

  useEffect(() => {
    getSections()
      .then((data) => setSections(data))
      .catch(() => setSectionsError(true));
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (triedRef.current) validate({ ...form, [field]: value });
  }

  function validate(data = form) {
    const errs = {};
    if (!data.firstName.trim()) errs.firstName = 'Required';
    if (!data.lastName.trim()) errs.lastName = 'Required';
    if (!EMAIL_RE.test(data.email.trim())) errs.email = 'Must be a valid email address';
    if (!data.section) errs.section = 'Required';
    if (!data.year) errs.year = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    triedRef.current = true;
    if (!validate()) return;

    setSubmitState('submitting');
    try {
      await submitRosterRequest({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        section: form.section,
        year: Number(form.year),
        notes: form.notes.trim(),
      });
      setSubmitState('success');
    } catch (err) {
      setServerError(err.message || 'Could not connect — please try again.');
      setSubmitState('error');
    }
  }

  if (submitState === 'success') {
    return (
      <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-8 pb-7 flex flex-col relative overflow-hidden" data-page-root>
        <FloatRoutes />
        <div className="opacity-[.35]"><StaffLines h={24} /></div>

        <div className="flex-1 relative z-[1] flex flex-col items-start justify-center max-w-[580px] px-6">
          <div className="font-tight font-extrabold text-[24px] tracking-[-0.02em] mb-10">
            <a href="/signin" className="no-underline text-ink hover:opacity-80">
              UMMB<span className="text-brand">·</span>SUMMER
              <Mono className="font-medium text-base ml-2 text-ink-soft">{"'26"}</Mono>
            </a>
          </div>

          <Mono className="text-[12px] text-good tracking-[.18em] uppercase">● Request submitted</Mono>
          <h1 className="font-tight font-extrabold text-[64px] leading-[0.98] tracking-[-0.04em] mt-3">
            Request<br /><span className="text-brand">sent.</span>
          </h1>
          <p className="text-base leading-relaxed text-ink-soft mt-[18px] max-w-[420px]">
            We'll review your info and add you to the roster. Check back and try signing in again soon.
          </p>
          <Link
            to="/signin"
            className="inline-flex items-center gap-2 mt-7 px-6 py-3.5 bg-ink text-panel font-tight font-bold text-[15px] tracking-[-0.005em] no-underline"
            style={{ boxShadow: '0 5px 0 var(--brand)' }}
          >
            Back to sign in →
          </Link>
        </div>

        <div className="opacity-[.35]"><StaffLines h={24} /></div>
      </div>
    );
  }

  if (sections === null && !sectionsError) {
    return (
      <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-8 pb-7 flex flex-col relative overflow-hidden" data-page-root>
        <FloatRoutes />
        <div className="opacity-[.35]"><StaffLines h={24} /></div>
        <div className="flex-1 flex items-center justify-center">
          <Mono className="text-[12px] text-ink-soft tracking-[.14em] uppercase">Loading…</Mono>
        </div>
        <div className="opacity-[.35]"><StaffLines h={24} /></div>
      </div>
    );
  }

  if (sectionsError) {
    return (
      <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-8 pb-7 flex flex-col relative overflow-hidden" data-page-root>
        <FloatRoutes />
        <div className="opacity-[.35]"><StaffLines h={24} /></div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Mono className="text-[12px] text-brand tracking-[.14em] uppercase">Could not load sections</Mono>
          <p className="text-sm text-ink-soft">Please refresh and try again.</p>
        </div>
        <div className="opacity-[.35]"><StaffLines h={24} /></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-8 pb-7 flex flex-col relative overflow-hidden" data-page-root>
      <FloatRoutes />
      <div className="opacity-[.35]"><StaffLines h={24} /></div>

      <div className="flex-1 relative z-[1] flex flex-col items-start justify-center w-full px-6 py-8">
        <div className="font-tight font-extrabold text-[24px] tracking-[-0.02em] mb-10">
          <a href="/signin" className="no-underline text-ink hover:opacity-80">
            UMMB<span className="text-brand">·</span>SUMMER
            <Mono className="font-medium text-base ml-2 text-ink-soft">{"'26"}</Mono>
          </a>
        </div>

        <div className="max-w-[540px] w-full">
          <Mono className="text-[12px] text-ink-soft tracking-[.18em] uppercase">Missing from the roster?</Mono>
          <h1 className="font-tight font-extrabold text-[52px] leading-[1.0] tracking-[-0.04em] mt-3">
            Request to<br /><span className="text-brand">be added.</span>
          </h1>
          <p className="text-base leading-relaxed text-ink-soft mt-4 mb-7 max-w-[460px]">
            Submit your info and an admin will review it and add you to the roster.
          </p>

          <form onSubmit={handleSubmit} noValidate className="grid gap-[18px]">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Mono className="block text-[10px] text-ink-soft tracking-[.14em] uppercase mb-1.5">First name</Mono>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                  className={INPUT_CLS}
                  style={errors.firstName ? INPUT_ERR_STYLE : {}}
                  placeholder="Goldy"
                  autoComplete="given-name"
                />
                {errors.firstName && <Mono className="block mt-1 text-[10px] text-brand">{errors.firstName}</Mono>}
              </div>
              <div>
                <Mono className="block text-[10px] text-ink-soft tracking-[.14em] uppercase mb-1.5">Last name</Mono>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => set('lastName', e.target.value)}
                  className={INPUT_CLS}
                  style={errors.lastName ? INPUT_ERR_STYLE : {}}
                  placeholder="Gopher"
                  autoComplete="family-name"
                />
                {errors.lastName && <Mono className="block mt-1 text-[10px] text-brand">{errors.lastName}</Mono>}
              </div>
            </div>

            {/* Email */}
            <div>
              <Mono className="block text-[10px] text-ink-soft tracking-[.14em] uppercase mb-1.5">UMN email</Mono>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className={INPUT_CLS}
                style={errors.email ? INPUT_ERR_STYLE : {}}
                placeholder="goph0001@umn.edu"
                autoComplete="email"
              />
              {errors.email
                ? <Mono className="block mt-1 text-[10px] text-brand">{errors.email}</Mono>
                : <Mono className="block mt-1 text-[10px] text-ink-soft">Must be a valid email address</Mono>
              }
            </div>

            {/* Section */}
            <div>
              <Mono className="block text-[10px] text-ink-soft tracking-[.14em] uppercase mb-1.5">Section</Mono>
              <SelectWrapper>
                <select
                  value={form.section}
                  onChange={(e) => set('section', e.target.value)}
                  className={`${INPUT_CLS} appearance-none cursor-pointer`}
                  style={errors.section ? INPUT_ERR_STYLE : {}}
                >
                  <option value="">Select your section…</option>
                  {sections.map((s) => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                  <option value="Other">Other / Not listed</option>
                </select>
              </SelectWrapper>
              {errors.section && <Mono className="block mt-1 text-[10px] text-brand">{errors.section}</Mono>}
            </div>

            {/* Year */}
            <div>
              <Mono className="block text-[10px] text-ink-soft tracking-[.14em] uppercase mb-1.5">Year in band</Mono>
              <SelectWrapper>
                <select
                  value={form.year}
                  onChange={(e) => set('year', e.target.value)}
                  className={`${INPUT_CLS} appearance-none cursor-pointer`}
                  style={errors.year ? INPUT_ERR_STYLE : {}}
                >
                  <option value="">Select your year…</option>
                  {YEAR_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </SelectWrapper>
              {errors.year && <Mono className="block mt-1 text-[10px] text-brand">{errors.year}</Mono>}
            </div>

            {/* Notes */}
            <div>
              <Mono className="block text-[10px] text-ink-soft tracking-[.14em] uppercase mb-1.5">
                Anything else to add? <span className="normal-case">(optional)</span>
              </Mono>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                className={`${INPUT_CLS} resize-none`}
                rows={3}
                placeholder="e.g. I transferred from another school and may be listed differently…"
              />
            </div>

            {/* Server error */}
            {submitState === 'error' && (
              <div className="px-4 py-3 border border-brand/40 bg-brand/10 text-brand text-[14px] font-sans">
                {serverError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 flex-wrap items-center pt-1">
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 px-5 py-3.5 border border-rule-soft text-ink-soft font-tight font-bold text-[14px] tracking-[-0.005em] no-underline hover:opacity-80"
              >
                ← Back to sign in
              </Link>
              <button
                type="submit"
                disabled={submitState === 'submitting'}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink text-panel border-none cursor-pointer font-tight font-bold text-[15px] tracking-[-0.005em] disabled:opacity-50"
                style={{ boxShadow: '0 5px 0 var(--brand)' }}
              >
                {submitState === 'submitting' ? 'Submitting…' : 'Submit request →'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="opacity-[.35]"><StaffLines h={24} /></div>
    </div>
  );
}
