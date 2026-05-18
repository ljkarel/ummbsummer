import { Mono, StaffLines } from '../ui.jsx';

export function PageFooter() {
  return (
    <div className="absolute left-0 right-0 bottom-0 px-9 pb-3">
      <div className="flex justify-between items-center pb-1.5">
        <Mono className="text-[10px] tracking-[.16em] text-ink-soft uppercase">Built by Lukas Karel · RTBSUMGG</Mono>
        <Mono className="text-[10px] tracking-[.16em] text-ink-soft uppercase">March on</Mono>
      </div>
      <div className="opacity-35">
        <StaffLines h={20} />
      </div>
    </div>
  );
}
