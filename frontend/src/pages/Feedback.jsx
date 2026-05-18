import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mono, Rule, INPUT_CLS, INPUT_ERR_STYLE, SelectWrapper } from '../components/ui.jsx';
import { TopBar } from '../components/layout/TopBar.jsx';
import { BottomNav } from '../components/layout/BottomNav.jsx';
import { PageFooter } from '../components/layout/PageFooter.jsx';
import { SettingsDrawer } from '../components/SettingsDrawer.jsx';
import { getMe, submitFeedback } from '../lib/api.js';

const CATEGORIES = ['Bug', 'Feature Request', 'Question', 'Other'];

export default function Feedback() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({ category: '', description: '', email: '' });
  const [errors, setErrors] = useState({});
  const [submitState, setSubmitState] = useState('idle'); // idle | submitting | success | error
  const [serverError, setServerError] = useState('');
  const triedRef = useRef(false);

  useEffect(() => {
    getMe().then((data) => {
      setMe(data);
      setForm((f) => ({ ...f, email: data.preferred_email ?? data.roster_email ?? '' }));
    });
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (triedRef.current) validate({ ...form, [field]: value });
  }

  function validate(data = form) {
    const errs = {};
    if (!data.category) errs.category = 'Required';
    if (!data.description.trim()) errs.description = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    triedRef.current = true;
    if (!validate()) return;

    setSubmitState('submitting');
    try {
      await submitFeedback({
        category: form.category,
        description: form.description.trim(),
        reporterEmail: form.email.trim(),
      });
      setSubmitState('success');
    } catch (err) {
      setServerError(err.message || 'Could not send — please try again.');
      setSubmitState('error');
    }
  }

  if (submitState === 'success') {
    return (
      <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-7 pb-20 relative" data-page-root>
        <TopBar settingsOpen={settingsOpen} onAvatarClick={() => setSettingsOpen((o) => !o)} stravaConnected={me?.strava_connected} />
        <Rule weight={1.5} />
        <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />

        <div className="py-[26px] max-w-[540px]">
          <Mono className="text-[12px] text-good tracking-[.18em] uppercase">● Sent</Mono>
          <h1 className="font-tight font-extrabold text-[56px] leading-none mt-2" style={{ lineHeight: 1.02, letterSpacing: '-0.035em' }}>
            Feedback <span className="text-brand">received.</span>
          </h1>
          <p className="text-base leading-relaxed text-ink-soft mt-4 max-w-[420px]">
            Thanks for reaching out. An admin will follow up if needed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-7 px-6 py-3.5 bg-ink text-panel font-tight font-bold text-[15px] tracking-[-0.005em] no-underline"
            style={{ boxShadow: '0 5px 0 var(--brand)' }}
          >
            Back to dashboard →
          </Link>
        </div>

        <PageFooter />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-7 pb-20 relative" data-page-root>
      <TopBar settingsOpen={settingsOpen} onAvatarClick={() => setSettingsOpen((o) => !o)} stravaConnected={me?.strava_connected} />
      <Rule weight={1.5} />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <div className="py-[26px] pb-[22px]">
        <Mono className="text-[11px] text-ink-soft tracking-[.18em] uppercase">Got something to share?</Mono>
        <h1 className="font-tight font-extrabold text-[56px] leading-none mt-2" style={{ lineHeight: 1.02, letterSpacing: '-0.035em' }}>
          Submit <span className="text-brand">feedback.</span>
        </h1>
      </div>

      <Rule soft />

      <div className="py-7 max-w-[540px]">
        <p className="text-base leading-relaxed text-ink-soft mb-7 max-w-[460px]">
          Questions, bug reports, suggestions — all welcome. An admin will receive your message by email.
        </p>

        <form onSubmit={handleSubmit} noValidate className="grid gap-[18px]">
          {/* Category */}
          <div>
            <Mono className="block text-[10px] text-ink-soft tracking-[.14em] uppercase mb-1.5">Category</Mono>
            <SelectWrapper>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className={`${INPUT_CLS} appearance-none cursor-pointer`}
                style={errors.category ? INPUT_ERR_STYLE : {}}
              >
                <option value="">Select a category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </SelectWrapper>
            {errors.category && <Mono className="block mt-1 text-[10px] text-brand">{errors.category}</Mono>}
          </div>

          {/* Description */}
          <div>
            <Mono className="block text-[10px] text-ink-soft tracking-[.14em] uppercase mb-1.5">Description</Mono>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className={`${INPUT_CLS} resize-none`}
              style={errors.description ? INPUT_ERR_STYLE : {}}
              rows={5}
              placeholder="Describe your question, bug, or suggestion…"
            />
            {errors.description && <Mono className="block mt-1 text-[10px] text-brand">{errors.description}</Mono>}
          </div>

          {/* Reporter email */}
          <div>
            <Mono className="block text-[10px] text-ink-soft tracking-[.14em] uppercase mb-1.5">Your email</Mono>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className={INPUT_CLS}
              placeholder="your@email.com"
              autoComplete="email"
            />
            <Mono className="block mt-1 text-[10px] text-ink-soft">So admins can follow up with you.</Mono>
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
              to="/"
              className="inline-flex items-center gap-2 px-5 py-3.5 border border-rule-soft text-ink-soft font-tight font-bold text-[14px] tracking-[-0.005em] no-underline hover:opacity-80"
            >
              ← Cancel
            </Link>
            <button
              type="submit"
              disabled={submitState === 'submitting'}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink text-panel border-none cursor-pointer font-tight font-bold text-[15px] tracking-[-0.005em] disabled:opacity-50"
              style={{ boxShadow: '0 5px 0 var(--brand)' }}
            >
              {submitState === 'submitting' ? 'Sending…' : 'Send feedback →'}
            </button>
          </div>
        </form>
      </div>

      <PageFooter />
      <BottomNav />
    </div>
  );
}
