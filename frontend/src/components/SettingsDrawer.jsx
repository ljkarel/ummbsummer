import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mono } from './ui.jsx';
import { getMe, patchMe, logout } from '../lib/api.js';

function SectionHeader({ children }) {
  return (
    <div className="font-tight font-extrabold text-[13px] tracking-[.06em] uppercase mb-3 text-ink">
      {children}
    </div>
  );
}

export function SettingsDrawer({ open, onClose }) {
  const [me, setMe] = useState(null);
  const [nickname, setNickname] = useState('');
  const [preferredEmail, setPreferredEmail] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved
  const saveTimer = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!open) return;
    initialized.current = false;
    getMe().then((data) => {
      setMe(data);
      if (!initialized.current) {
        setNickname(data.nickname ?? '');
        setPreferredEmail(data.preferred_email ?? '');
        initialized.current = true;
      }
    });
  }, [open]);

  async function save(nick, email) {
    setSaveStatus('saving');
    try {
      await patchMe({ nickname: nick || null, preferredEmail: email || null });
      setSaveStatus('saved');
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('idle');
    }
  }

  function handleBlur() {
    save(nickname, preferredEmail);
  }

  async function handleSignOut() {
    try { await logout(); } catch { /* ignore */ }
    window.location.href = '/signin';
  }

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn   { from { opacity: 0 } to { opacity: 1 } }
        @keyframes drawerIn { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      <div
        onClick={onClose}
        className="fixed inset-0 z-[90]"
        style={{ background: 'rgba(15,10,5,.28)', animation: 'fadeIn .15s ease-out' }}
      />

      <div
        className="fixed inset-0 w-full overflow-y-auto sm:inset-auto sm:top-[70px] sm:right-9 sm:w-96 sm:overflow-visible bg-panel text-ink border border-rule z-[100] font-sans"
        style={{ boxShadow: '0 16px 60px rgba(0,0,0,.18)', animation: 'drawerIn .18s cubic-bezier(.2,.7,.3,1)' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 pt-4 pb-3.5 border-b border-rule-soft">
          <div>
            <div className="font-tight font-extrabold text-[20px] tracking-[-0.02em]">Settings</div>
            <Mono className="block mt-0.5 text-[11px] text-ink-soft">{me?.roster_email ?? '…'}</Mono>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 bg-transparent border-none cursor-pointer grid place-items-center text-ink-soft text-lg leading-none"
            aria-label="Close settings"
          >✕</button>
        </div>

        {/* Profile */}
        <div className="px-5 pt-4 pb-2">
          <SectionHeader>Profile</SectionHeader>

          <div className="mb-3">
            <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Preferred name</Mono>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onBlur={handleBlur}
              placeholder={me?.name ?? ''}
              className="block mt-1 w-full px-[11px] py-[9px] border border-rule bg-bg text-ink font-sans text-[13px] tracking-[-0.005em] outline-none box-border"
            />
          </div>

          <div className="mb-3">
            <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Preferred contact email</Mono>
            <input
              type="email"
              value={preferredEmail}
              onChange={(e) => setPreferredEmail(e.target.value)}
              onBlur={handleBlur}
              placeholder={me?.roster_email ?? ''}
              className="block mt-1 w-full px-[11px] py-[9px] border border-rule bg-bg text-ink font-sans text-[13px] tracking-[-0.005em] outline-none box-border"
            />
          </div>
        </div>

        <div className="h-px bg-rule-soft mx-5" />

        {/* Strava */}
        <div className="px-5 py-4">
          <SectionHeader>Strava connection</SectionHeader>
          {me?.strava_connected ? (
            <div className="px-3.5 py-3 bg-panel-alt border border-rule-soft">
              <div className="flex justify-between items-center mb-2">
                <span className="inline-flex items-center gap-2">
                  <span className="w-[7px] h-[7px] rounded-full bg-good" />
                  <span className="font-bold text-[13px]">Connected</span>
                </span>
              </div>
              {me?.strava_scope?.includes('activity:read_all') ? (
                <p className="m-0 text-[12.5px] text-ink leading-[1.6]">
                  <span className="text-good font-bold font-mono mr-2">✓</span>
                  Can sync all activities, including private ones
                </p>
              ) : (
                <>
                  <p className="m-0 text-[12.5px] text-ink leading-[1.6]">
                    <span className="text-good font-bold font-mono mr-2">✓</span>
                    Can sync public activities only
                  </p>
                  <p className="m-0 mt-1 text-[12px] text-ink-soft leading-[1.5]">
                    Private activities won't be counted. Reconnect to grant full access.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="px-3.5 py-3 bg-panel-alt border border-rule-soft text-[13px] text-ink-soft">
              Not connected.
            </div>
          )}
          <Mono className="block mt-2 text-[10.5px] text-ink-soft leading-[1.4]">
            Revoking will stop activity syncs. You can reconnect any time before the program ends.
          </Mono>
        </div>

        <div className="h-px bg-rule-soft mx-5" />

        {/* Support */}
        <div className="px-5 py-3">
          <SectionHeader>Support</SectionHeader>
          <Link
            to="/feedback"
            onClick={onClose}
            className="text-[13px] text-ink-soft hover:text-ink no-underline"
          >
            Submit feedback →
          </Link>
        </div>

        <div className="h-px bg-rule-soft mx-5" />

        {/* Footer */}
        <div className="px-5 py-3 flex justify-between items-center">
          <Mono className="text-[11px] text-ink-soft inline-flex items-center gap-1.5">
            {saveStatus === 'saving' && <><span className="w-[5px] h-[5px] rounded-full bg-ink-soft" /> Saving…</>}
            {saveStatus === 'saved'  && <><span className="w-[5px] h-[5px] rounded-full bg-good" /> Saved</>}
            {saveStatus === 'idle'   && <><span className="w-[5px] h-[5px] rounded-full bg-good" /> Auto-saved</>}
          </Mono>
          <button
            onClick={handleSignOut}
            className="bg-transparent border-none text-ink-soft font-tight font-bold text-xs tracking-[.06em] uppercase cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}
