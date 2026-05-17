import { useState, useEffect, useRef } from 'react';
import { scoreFor } from '../lib/scoring.js';

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

export function ScoringCurve({ current = 168 }) {
  const W = 540, H = 150, PAD_L = 36, PAD_R = 12, PAD_T = 12, PAD_B = 28;
  const maxMin = 360;
  const maxPts = scoreFor(maxMin);
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
      <line x1={x(210)} y1={PAD_T} x2={x(210)} y2={H - PAD_B} stroke="var(--brand)" strokeOpacity=".45" strokeDasharray="3 3" strokeWidth="1" />
      <text x={x(210) + 4} y={PAD_T + 10} fill="var(--brand)" fontSize="9" fontFamily='"JetBrains Mono", monospace'>CAP · 210 MIN</text>
      <path d={areaPath} fill="var(--accent)" fillOpacity=".22" />
      <path d={linePath} fill="none" stroke="var(--accent-2)" strokeWidth="2" />
      <line x1={cx} y1={cy} x2={cx} y2={H - PAD_B} stroke="var(--ink)" strokeWidth="1" strokeDasharray="2 3" opacity=".5" />
      <circle cx={cx} cy={cy} r="4.5" fill="var(--brand)" stroke="var(--panel)" strokeWidth="1.5" />
      {[0, 60, 120, 180, 240, 300, 360].map((m) => (
        <text key={m} x={x(m)} y={H - 10} textAnchor="middle" fontSize="9" fill="var(--ink-soft)" fontFamily='"JetBrains Mono", monospace'>{m}</text>
      ))}
      <text x={PAD_L - 6} y={y(0) + 3} textAnchor="end" fontSize="9" fill="var(--ink-soft)" fontFamily='"JetBrains Mono", monospace'>0</text>
      <text x={PAD_L - 6} y={y(maxPts) + 3} textAnchor="end" fontSize="9" fill="var(--ink-soft)" fontFamily='"JetBrains Mono", monospace'>{Math.round(maxPts)}</text>
      <text x={W - PAD_R} y={H - 10} textAnchor="end" fontSize="9" fill="var(--ink-soft)" fontFamily='"JetBrains Mono", monospace'>MINUTES / WK</text>
    </svg>
  );
}

export function RouteMap({ kind }) {
  const paths = {
    loop:   'M14 60 C 18 22, 60 14, 78 28 C 96 42, 88 78, 60 80 C 32 82, 10 78, 14 60 Z',
    linear: 'M8 78 C 30 70, 36 40, 56 38 C 74 36, 82 52, 92 22',
    small:  'M22 60 C 30 40, 56 38, 64 56 C 70 70, 46 76, 30 70 Z',
    wander: 'M8 70 C 22 56, 18 36, 36 30 C 54 24, 56 48, 72 44 C 86 40, 86 18, 94 12',
  };
  return (
    <svg viewBox="0 0 100 90" width="100%" height="100%" preserveAspectRatio="none" className="block">
      {[14, 28, 42, 56, 70].map((y) => (
        <line key={y} x1="0" y1={y} x2="100" y2={y - 6} stroke="var(--ink)" strokeOpacity=".06" strokeWidth=".3" />
      ))}
      {[20, 50, 80].map((x) => (
        <line key={x} x1={x} y1="0" x2={x - 6} y2="90" stroke="var(--ink)" strokeOpacity=".06" strokeWidth=".3" />
      ))}
      <path d={paths[kind]} fill="none" stroke="var(--brand)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={kind === 'linear' ? 8 : 14} cy={kind === 'linear' ? 78 : 60} r="2" fill="var(--brand)" />
      <circle
        cx={kind === 'linear' ? 92 : kind === 'wander' ? 94 : 60}
        cy={kind === 'linear' ? 22 : kind === 'wander' ? 12 : 80}
        r="2.4" fill="var(--ink)" stroke="var(--panel-alt)" strokeWidth="1" />
    </svg>
  );
}
