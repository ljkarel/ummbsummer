import { useState, useEffect, useRef } from 'react';
import { scoreFor } from '../lib/scoring.js';

export const INPUT_CLS = 'block w-full px-4 py-3.5 border border-rule-soft bg-panel text-ink font-sans text-[15px] tracking-[-0.005em] outline-none box-border';
export const INPUT_ERR_STYLE = { outline: '2px solid var(--brand)', outlineOffset: '-1px' };

export function SelectWrapper({ children }) {
  return (
    <div className="relative">
      {children}
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft text-sm">▾</span>
    </div>
  );
}

// weight accepts 1 or 1.5; soft uses the faint rule color
export function Rule({ soft = false, weight = 1 }) {
  return <div className={`w-full ${soft ? 'bg-rule-soft' : 'bg-rule'}`} style={{ height: weight }} />;
}

// Base monospace span — callers pass Tailwind classes via className
export function Mono({ children, className = '', style }) {
  return (
    <span className={`font-mono [font-feature-settings:'tnum'] ${className}`} style={style}>
      {children}
    </span>
  );
}

// Pill chip — callers pass color classes via className
// e.g. className="bg-chip text-chip-ink"  or  className="bg-brand text-panel"
export function Tag({ t: text, className = '' }) {
  return (
    <span className={`font-mono text-[10px] tracking-[.14em] uppercase px-2 py-1 rounded-full inline-flex items-center gap-1.5 leading-none ${className}`}>
      {text}
    </span>
  );
}

export function StaffLines({ h = 36, lines = 5 }) {
  return (
    <svg width="100%" height={h} viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" className="block">
      {Array.from({ length: lines }).map((_, i) => (
        <line key={i}
          x1="0" y1={(i + 1) * (h / (lines + 1))}
          x2="100" y2={(i + 1) * (h / (lines + 1))}
          stroke="var(--ink)" strokeWidth=".3" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

export function CountUp({ to, dur = 900, format = (v) => Math.round(v) }) {
  const [v, setV] = useState(0);
  const ref = useRef();
  useEffect(() => {
    let raf, start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, dur]);
  return <span ref={ref}>{format(v)}</span>;
}

export function ScoringCurve({ current = 0 }) {
  // H increased by 12, PAD_B increased by 12 — plot area (H-PAD_B) is unchanged at 122px
  // PAD_L widened to 50 to give room between the rotated POINTS label and the numeric y-axis labels
  const W = 540, H = 162, PAD_L = 50, PAD_R = 12, PAD_T = 12, PAD_B = 40;
  const maxMin = current > 360 ? Math.ceil(current / 60) * 60 : 360;
  // Thin out ticks so labels never get closer than ~35px
  const plotW = W - PAD_L - PAD_R;
  const pixelsPerHour = plotW / (maxMin / 60);
  const tickEvery = Math.ceil(35 / pixelsPerHour) * 60;
  const ticks = Array.from({ length: Math.floor(maxMin / tickEvery) + 1 }, (_, i) => i * tickEvery);
  // Ensure the y ceiling is always at least 25% above current points so the two labels never crowd each other
  const maxPts = Math.max(scoreFor(maxMin), scoreFor(current) * 1.25);
  const x = (m) => PAD_L + (m / maxMin) * (W - PAD_L - PAD_R);
  const y = (p) => H - PAD_B - (p / maxPts) * (H - PAD_T - PAD_B);
  const pts = [];
  for (let m = 0; m <= maxMin; m += 6) pts.push([x(m), y(scoreFor(m))]);
  const linePath = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${x(maxMin)} ${H - PAD_B} L ${PAD_L} ${H - PAD_B} Z`;
  const cx = x(current);
  const cy = y(scoreFor(current));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block">
      <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="var(--rule-soft)" strokeWidth="1" />
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="var(--rule-soft)" strokeWidth="1" />
      <line x1={x(210)} y1={y(scoreFor(210))} x2={x(210)} y2={H - PAD_B} stroke="var(--brand)" strokeOpacity=".45" strokeDasharray="3 3" strokeWidth="1" />
      <path d={areaPath} fill="var(--accent)" fillOpacity=".22" />
      <path d={linePath} fill="none" stroke="var(--accent-2)" strokeWidth="2" />
      <line x1={cx} y1={cy} x2={cx} y2={H - PAD_B} stroke="var(--ink)" strokeWidth="1" strokeDasharray="2 3" opacity=".5" />
      <line x1={PAD_L} y1={cy} x2={cx} y2={cy} stroke="var(--ink)" strokeWidth="1" strokeDasharray="2 3" opacity=".5" />
      <circle cx={cx} cy={cy} r="4.5" fill="var(--brand)" stroke="var(--panel)" strokeWidth="1.5" />
      <text x={PAD_L - 6} y={cy + 3} textAnchor="end" fontSize="9" fill="var(--brand)" fontWeight="bold" fontFamily='"JetBrains Mono", monospace'>{scoreFor(current).toFixed(1)}</text>
      {ticks.map((m) => (
        <text key={m} x={x(m)} y={H - PAD_B + 12} textAnchor="middle" fontSize="9" fill="var(--ink-soft)" fontFamily='"JetBrains Mono", monospace'>{m}</text>
      ))}
      <text x={-(PAD_T + H - PAD_B) / 2} y={10} transform="rotate(-90)" textAnchor="middle" fontSize="9" fill="var(--ink-soft)" fontFamily='"JetBrains Mono", monospace'>POINTS</text>
      {scoreFor(current) >= 20 && <text x={PAD_L - 6} y={y(0) + 3} textAnchor="end" fontSize="9" fill="var(--ink-soft)" fontFamily='"JetBrains Mono", monospace'>0</text>}
      <text x={PAD_L - 6} y={y(maxPts) + 3} textAnchor="end" fontSize="9" fill="var(--ink-soft)" fontFamily='"JetBrains Mono", monospace'>{Math.round(maxPts)}</text>
      <text x={(PAD_L + W - PAD_R) / 2} y={H - 10} textAnchor="middle" fontSize="9" fill="var(--ink-soft)" fontFamily='"JetBrains Mono", monospace'>MINUTES / WK</text>
    </svg>
  );
}

export function TrendCell({ trend }) {
  return (
    <Mono
      className="text-right text-[11px]"
      style={{ color: trend > 0 ? 'var(--good)' : trend < 0 ? 'var(--brand)' : 'var(--ink-soft)' }}
    >
      {trend > 0 ? `▲ ${Math.abs(trend)}` : trend < 0 ? `▼ ${Math.abs(trend)}` : '—'}
    </Mono>
  );
}

export function TrendHeader() {
  return (
    <div className="flex flex-col items-end" style={{ lineHeight: 1, gap: 1 }}>
      <Mono className="text-[7px] text-ink-soft">▲</Mono>
      <Mono className="text-[7px] text-ink-soft">▼</Mono>
    </div>
  );
}

export function RouteMap({ svgPath }) {
  return (
    <svg viewBox="0 0 100 90" width="100%" height="100%" preserveAspectRatio="none" className="block">
      {[14, 28, 42, 56, 70].map((y) => (
        <line key={y} x1="0" y1={y} x2="100" y2={y - 6} stroke="var(--ink)" strokeOpacity=".06" strokeWidth=".3" />
      ))}
      {[20, 50, 80].map((x) => (
        <line key={x} x1={x} y1="0" x2={x - 6} y2="90" stroke="var(--ink)" strokeOpacity=".06" strokeWidth=".3" />
      ))}
      <path d={svgPath || ''} fill="none" stroke="var(--brand)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx="14" cy="60" r="2" fill="var(--brand)" />
      <circle cx="60" cy="80" r="2.4" fill="var(--ink)" stroke="var(--panel-alt)" strokeWidth="1" />
    </svg>
  );
}
