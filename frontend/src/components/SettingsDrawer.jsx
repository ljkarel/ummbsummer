import { useNavigate } from 'react-router-dom';
import { Mono } from './ui.jsx';

function SectionHeader({ children }) {
  return (
    <div className="font-tight font-extrabold text-[13px] tracking-[.06em] uppercase mb-3 text-ink">
      {children}
    </div>
  );
}

function FormRow({ label, defaultValue, type = 'text', placeholder }) {
  return (
    <div className="mb-3">
      <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">{label}</Mono>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="block mt-1 w-full px-[11px] py-[9px] border border-rule bg-bg text-ink font-sans text-[13px] tracking-[-0.005em] outline-none box-border"
      />
    </div>
  );
}

export function SettingsDrawer({ open, onClose }) {
  const navigate = useNavigate();
  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn   { from { opacity: 0 } to { opacity: 1 } }
        @keyframes drawerIn { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      <div
        onClick={onClose}
        className="absolute inset-0 z-[90]"
        style={{ background: 'rgba(15,10,5,.28)', animation: 'fadeIn .15s ease-out' }}
      />

      <div
        className="absolute top-[70px] right-9 w-96 bg-panel text-ink border border-rule z-[100] font-sans"
        style={{ boxShadow: '0 16px 60px rgba(0,0,0,.18)', animation: 'drawerIn .18s cubic-bezier(.2,.7,.3,1)' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 pt-4 pb-3.5 border-b border-rule-soft">
          <div>
            <div className="font-tight font-extrabold text-[20px] tracking-[-0.02em]">Settings</div>
            <Mono className="block mt-0.5 text-[11px] text-ink-soft">jordan.mehta@umn.edu</Mono>
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
          <FormRow label="Preferred name" defaultValue="Jordan" />
          <FormRow label="Nickname (shown in chips)" defaultValue="JM" />
          <FormRow label="Preferred contact email" type="email" defaultValue="jordan@gmail.com" placeholder="you@example.com" />
        </div>

        <div className="h-px bg-rule-soft mx-5" />

        {/* Strava */}
        <div className="px-5 py-4">
          <SectionHeader>Strava connection</SectionHeader>
          <div className="px-3.5 py-3 bg-panel-alt border border-rule-soft">
            <div className="flex justify-between items-center mb-2">
              <span className="inline-flex items-center gap-2">
                <span className="w-[7px] h-[7px] rounded-full bg-good" />
                <span className="font-bold text-[13px]">
                  Connected as <Mono className="text-xs">@jordan.m</Mono>
                </span>
              </span>
            </div>
            <Mono className="block text-[10px] text-ink-soft tracking-[.14em] uppercase mt-1.5 mb-1.5">Scopes</Mono>
            <ul className="m-0 p-0 list-none text-[12.5px] text-ink leading-[1.7]">
              <li><span className="text-good font-bold mr-2 font-mono">✓</span>activity:read_all</li>
              <li><span className="text-good font-bold mr-2 font-mono">✓</span>profile:read_all</li>
              <li className="text-ink-soft"><span className="text-brand font-bold mr-2 font-mono">✗</span>activity:write</li>
              <li className="text-ink-soft"><span className="text-brand font-bold mr-2 font-mono">✗</span>profile:write</li>
            </ul>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 py-2.5 px-3.5 bg-ink text-panel border-none font-tight font-bold text-xs tracking-[.06em] uppercase cursor-pointer">Reconnect</button>
            <button className="flex-1 py-2.5 px-3.5 bg-transparent text-brand border border-brand font-tight font-bold text-xs tracking-[.06em] uppercase cursor-pointer">Revoke access</button>
          </div>
          <Mono className="block mt-2 text-[10.5px] text-ink-soft leading-[1.4]">
            Revoking will stop activity syncs. You can reconnect any time before the season ends.
          </Mono>
        </div>

        <div className="h-px bg-rule-soft mx-5" />

        {/* Footer */}
        <div className="px-5 py-3 flex justify-between items-center">
          <Mono className="text-[11px] text-ink-soft inline-flex items-center gap-1.5">
            <span className="w-[5px] h-[5px] rounded-full bg-good" />
            Auto-saved
          </Mono>
          <button
            onClick={() => { onClose(); navigate('/signin'); }}
            className="bg-transparent border-none text-ink-soft font-tight font-bold text-xs tracking-[.06em] uppercase cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}
