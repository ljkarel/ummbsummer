import { useEffect, useMemo, useRef, useState } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Mono, Rule, Tag, PreCompetitionOverlay } from '../components/ui.jsx';
import { colSep, rowSep } from '../utils/gridSep.js';
import { TopBar } from '../components/layout/TopBar.jsx';
import { BottomNav } from '../components/layout/BottomNav.jsx';
import { PageFooter } from '../components/layout/PageFooter.jsx';

import {
  getPeriods, getMe,
  getArtWall, getMyArtSub, getActivities,
  createArtSub, patchArtSub, deleteArtSub, toggleArtLike,
  getOpenWall, getMyOpenSubs, createOpenSub,
} from '../lib/api.js';

const CT = 'America/Chicago';

function fmtPeriodDates(start, end) {
  const opts = { month: 'short', day: 'numeric', timeZone: CT };
  return `${new Date(start + 'T12:00:00Z').toLocaleDateString('en-US', opts)}–${new Date(end + 'T12:00:00Z').toLocaleDateString('en-US', opts)}`;
}

function fmtDate(isoStr) {
  return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: CT });
}

function themeHeading(theme) {
  if (theme === 'Letter M') return <>Make an <span className="text-brand">M</span> for Minnesota.</>;
  if (theme === 'Letter U') return <>Trace a <span className="text-brand">U</span> on the map.</>;
  if (theme === 'Loop') return <>Run a <span className="text-brand">loop</span>, any loop.</>;
  if (theme === 'Flower') return <>Draw a <span className="text-brand">flower</span> with your route.</>;
  if (theme === 'Planes, Trains, Automobiles') return <>Draw a mode of <span className="text-brand">transportation!</span></>;
  if (theme === 'Food') return <>Draw your favorite <span className="text-brand">food!</span></>;
  return <><span className="text-brand">{theme}</span> — draw the shape.</>;
}

function tinyMap({ svgPath, svgViewBox = '0 0 100 100', accent }) {
  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none" className="absolute inset-0">
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="var(--ink)" strokeOpacity=".05" strokeWidth=".5" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="var(--ink)" strokeOpacity=".05" strokeWidth=".5" />
        ))}
      </svg>
      <svg viewBox={svgViewBox} preserveAspectRatio="xMidYMid meet" width="100%" height="100%" className="absolute inset-0" style={{ display: 'block' }}>
        <path d={svgPath || ''} fill="none" stroke={accent} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}


function WeekNav({ periods, livePeriodId, selectedPeriodId, onSelect }) {
  return (
    <div className="flex items-center gap-2">
      <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase mr-1">Browse week</Mono>
      <div className="flex border border-rule-soft">
        {periods.map((p, idx) => {
          const isSel = p.id === selectedPeriodId;
          const isLive = p.id === livePeriodId;
          const label = `WK ${String(idx + 1).padStart(2, '0')}`;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={[
                'font-mono text-[10px] tracking-[.12em] uppercase py-[7px] px-3 border-none cursor-pointer flex items-center gap-1.5',
                idx < periods.length - 1 ? 'border-r border-rule-soft' : '',
                isSel ? 'bg-ink text-panel font-bold' : 'bg-transparent text-ink-soft font-medium',
              ].join(' ')}
            >
              {label}
              {isLive && (
                <span className="w-[5px] h-[5px] rounded-full" style={{ background: isSel ? 'var(--accent)' : 'var(--brand)' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TabSwitcher({ tab, onChange }) {
  return (
    <div className="flex border border-rule-soft w-fit">
      {['weekly', 'open'].map((t, i) => {
        const isSel = tab === t;
        const label = t === 'weekly' ? 'Weekly' : 'Open';
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={[
              'font-mono text-[10px] tracking-[.12em] uppercase py-[7px] px-4 border-none cursor-pointer',
              i === 0 ? 'border-r border-rule-soft' : '',
              isSel ? 'bg-ink text-panel font-bold' : 'bg-transparent text-ink-soft font-medium',
            ].join(' ')}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function VisibilityRadio({ value, onChange }) {
  const opts = [
    { v: 'private',   label: 'Private',   sub: 'Only you' },
    { v: 'anonymous', label: 'Anonymous', sub: 'Art shown, name hidden' },
    { v: 'public',    label: 'Public',    sub: 'Name + art visible' },
  ];
  return (
    <div>
      <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Visibility</Mono>
      <div className="grid mt-1.5 border border-rule" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {opts.map((o, i) => {
          const isSel = value === o.v;
          return (
            <button
              key={o.v}
              onClick={() => onChange(o.v)}
              className={[
                'text-left py-[10px] px-3 border-none cursor-pointer font-sans',
                i < 2 ? 'border-r border-rule-soft' : '',
                isSel ? 'bg-ink text-panel' : 'bg-panel text-ink',
              ].join(' ')}
            >
              <div className="font-tight font-bold text-[13px] tracking-[-0.01em]">{o.label}</div>
              <Mono className={['text-[10px] tracking-[.06em] uppercase mt-[3px] block', isSel ? 'text-accent' : 'text-ink-soft'].join(' ')}>
                {o.sub}
              </Mono>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function hexLuminance(hex) {
  if (!hex) return null;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function calcDynViewBox(svgViewBox, rotation, p = 6) {
  const [,, vbW, vbH] = svgViewBox.split(' ').map(Number);
  const θ = (rotation * Math.PI) / 180;
  const cx = vbW / 2, cy = vbH / 2;
  const hw = (vbW * Math.abs(Math.cos(θ)) + vbH * Math.abs(Math.sin(θ))) / 2;
  const hh = (vbW * Math.abs(Math.sin(θ)) + vbH * Math.abs(Math.cos(θ))) / 2;
  return { cx, cy, dynViewBox: `${cx - hw - p} ${cy - hh - p} ${(hw + p) * 2} ${(hh + p) * 2}` };
}

function ArtworkFrame({ svgViewBox = '0 0 100 100', rotation = 0, strokeColor, bgColor, strokeWidth, path, animate, className, children }) {
  const { cx, cy, dynViewBox } = calcDynViewBox(svgViewBox, rotation);
  return (
    <div className={['bg-panel-alt border border-rule-soft relative overflow-hidden', className].filter(Boolean).join(' ')} style={{ aspectRatio: '4 / 3', background: bgColor || undefined }}>
      <svg viewBox="0 0 100 75" width="100%" height="100%" preserveAspectRatio="none" className="absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 6.25} x2="100" y2={i * 6.25} stroke="var(--ink)" strokeOpacity=".05" strokeWidth=".2" />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 6.25} y1="0" x2={i * 6.25} y2="75" stroke="var(--ink)" strokeOpacity=".05" strokeWidth=".2" />
        ))}
      </svg>
      <svg viewBox={dynViewBox} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="absolute inset-0">
        <g transform={`rotate(${rotation} ${cx} ${cy})`} style={animate ? { transition: 'transform .35s cubic-bezier(.2,.7,.3,1)' } : undefined}>
          <path d={path || ''} fill="none" stroke={strokeColor || 'var(--brand)'} strokeWidth={strokeWidth ?? 2.8} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
      {children}
    </div>
  );
}

function CompositionCanvas({ path, svgViewBox = '0 0 100 100', rotation, title, visibility, memberName, memberSection, strokeColor, bgColor, strokeWidth, isOwner = false }) {
  const isPrivate = visibility === 'private';
  const attribution = visibility === 'public'
    ? `${memberName || '…'} · ${memberSection || '…'}`
    : visibility === 'anonymous'
    ? `Anonymous · ${memberSection || '…'}`
    : 'Only You';

  const displayDeg = ((rotation % 360) + 360) % 360;

  const lum = hexLuminance(bgColor);
  const onBg = lum === null
    ? { strong: 'var(--ink)', soft: 'var(--ink-soft)' }
    : lum > 128
    ? { strong: 'rgba(0,0,0,0.85)', soft: 'rgba(0,0,0,0.45)' }
    : { strong: 'rgba(255,255,255,0.9)', soft: 'rgba(255,255,255,0.45)' };

  return (
    <ArtworkFrame path={isOwner || !isPrivate ? path : ''} svgViewBox={svgViewBox} rotation={rotation} strokeColor={strokeColor} bgColor={bgColor} strokeWidth={strokeWidth} animate>
      {isPrivate && !isOwner && (
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
          <Mono className="text-xs tracking-[.18em] uppercase" style={{ color: onBg.soft }}>🔒 Private</Mono>
          <Mono className="text-[10px]" style={{ color: onBg.soft }}>visible only to you on the wall</Mono>
        </div>
      )}
      <div className="absolute top-[10px] left-3 font-mono text-[9px] tracking-[.14em] uppercase" style={{ color: onBg.soft }}>
        Rotation · {displayDeg}°
      </div>
      <div className="absolute top-[10px] right-3 font-mono text-[9px] tracking-[.14em] uppercase" style={{ color: onBg.soft }}>
        {visibility === 'public' ? 'PUBLIC' : visibility === 'anonymous' ? 'ANONYMOUS' : 'PRIVATE'}
      </div>
      <div className="absolute bottom-[10px] left-3 right-3 flex justify-between items-end">
        <div>
          <div className="font-tight font-bold text-base tracking-[-0.01em]" style={{ color: onBg.strong }}>{title || 'Untitled'}</div>
          <Mono className="text-[10px] mt-0.5" style={{ color: onBg.soft }}>{attribution}</Mono>
        </div>
      </div>
    </ArtworkFrame>
  );
}

const STROKE_SWATCHES = [
  { value: '', label: 'Brand' },
  { value: '#e54b4b', label: 'Red' },
  { value: '#e59c4b', label: 'Orange' },
  { value: '#f0c94b', label: 'Gold' },
  { value: '#4dc96b', label: 'Green' },
  { value: '#4b8ef0', label: 'Blue' },
  { value: '#a04be5', label: 'Purple' },
  { value: '#ffffff', label: 'White' },
];

const BG_SWATCHES = [
  { value: '', label: 'None' },
  { value: '#0a0a0a', label: 'Black' },
  { value: '#2a1f14', label: 'Espresso' },
  { value: '#2b0d14', label: 'Wine' },
  { value: '#1a1a2e', label: 'Navy' },
  { value: '#0d2818', label: 'Forest' },
  { value: '#3d3d3d', label: 'Charcoal' },
  { value: '#f8f5f0', label: 'Cream' },
  { value: '#ffffff', label: 'White' },
  { value: '#dce8f5', label: 'Ice' },
  { value: '#f5e6d0', label: 'Sand' },
];

const STROKE_WIDTHS = [
  { value: 1.0, label: 'Thin' },
  { value: 2.8, label: 'Medium' },
  { value: 5.0, label: 'Thick' },
  { value: 8.0, label: 'Bold' },
];

function Swatch({ color, selected, onClick, label }) {
  const isClear = color === '';
  return (
    <button
      onClick={onClick}
      title={label}
      className="cursor-pointer border-none p-0 relative"
      style={{
        width: 24,
        height: 24,
        background: isClear ? 'var(--panel-alt)' : color,
        outline: selected ? '2px solid var(--ink)' : '2px solid transparent',
        outlineOffset: 2,
      }}
    >
      {isClear && (
        <svg viewBox="0 0 24 24" width="100%" height="100%" style={{ display: 'block' }}>
          <line x1="3" y1="3" x2="21" y2="21" stroke="var(--rule)" strokeWidth="1.5" />
        </svg>
      )}
    </button>
  );
}

function ColorPicker({ strokeColor, bgColor, onStrokeColor, onBgColor }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div>
        <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase mb-1.5 block">Route color</Mono>
        <div className="flex gap-1.5 flex-wrap">
          {STROKE_SWATCHES.map((s) => (
            <Swatch
              key={s.value}
              color={s.value}
              label={s.label}
              selected={strokeColor === s.value}
              onClick={() => onStrokeColor(s.value)}
            />
          ))}
        </div>
      </div>
      <div>
        <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase mb-1.5 block">Canvas</Mono>
        <div className="flex gap-1.5 flex-wrap">
          {BG_SWATCHES.map((s) => (
            <Swatch
              key={s.value}
              color={s.value}
              label={s.label}
              selected={bgColor === s.value}
              onClick={() => onBgColor(s.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StrokeWidthPicker({ value, onChange }) {
  return (
    <div>
      <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Stroke weight</Mono>
      <div className="grid mt-1.5 border border-rule" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {STROKE_WIDTHS.map((w, i) => {
          const isSel = value === w.value;
          return (
            <button
              key={w.value}
              onClick={() => onChange(w.value)}
              className={[
                'text-left py-[10px] px-3 border-none cursor-pointer font-sans',
                i < 3 ? 'border-r border-rule-soft' : '',
                isSel ? 'bg-ink text-panel' : 'bg-panel text-ink',
              ].join(' ')}
            >
              <div className="font-tight font-bold text-[13px] tracking-[-0.01em]">{w.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


function SubmissionTile({ s, onLike, isOwn }) {
  return (
    <div className="p-4 pb-[18px]">
      <ArtworkFrame
        path={s.svg_path}
        svgViewBox={s.svg_view_box}
        rotation={s.rotation}
        strokeColor={s.stroke_color}
        bgColor={s.bg_color}
        strokeWidth={s.stroke_width}
        className="mb-3"
      />
      <div className="font-bold text-sm tracking-[-0.01em] mb-1.5">{s.title}</div>
      <div className="flex justify-between items-center">
        <Mono className="text-[11px] text-ink-soft">
          {s.who === null ? 'Anonymous' : s.who}{s.section ? ` · ${s.section}` : ''}
        </Mono>
        {!isOwn && (
          <button
            onClick={() => onLike && onLike(s)}
            className={[
              'bg-transparent border-none py-0.5 inline-flex items-center gap-[5px]',
              onLike ? 'cursor-pointer' : 'cursor-default',
              s.liked_by_me ? 'text-brand' : 'text-ink-soft',
            ].join(' ')}
          >
            {s.liked_by_me
              ? <HeartSolidIcon className="w-3.5 h-3.5" style={{ color: 'var(--brand)' }} />
              : <HeartIcon className="w-3.5 h-3.5" style={{ color: 'var(--ink-soft)' }} />}
            <Mono className="text-[11px] font-bold" style={{ color: 'inherit' }}>{s.likes}</Mono>
          </button>
        )}
        {isOwn && (
          <Mono className="text-[11px] text-ink-soft">{s.likes} {s.likes === 1 ? 'like' : 'likes'}</Mono>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared submission form controls (used by both weekly and open tabs)
// ---------------------------------------------------------------------------
function SubmissionControls({
  activities, activityId, onActivityId,
  rotation, onRotation,
  strokeColor, onStrokeColor,
  bgColor, onBgColor,
  strokeWidth, onStrokeWidth,
  title, onTitle,
  visibility, onVisibility,
  saving, onSave, onWithdraw,
  activeSub, submittedAt,
  saveLabel,
  footerNote,
  carouselRef,
  activityDateLabel,
}) {
  const selectedActivity = activities.find((a) => a.activity_id === activityId);
  const currentPath = selectedActivity?.svg_path ?? activeSub?.svg_path ?? '';
  const currentViewBox = selectedActivity?.svg_view_box ?? activeSub?.svg_view_box ?? '0 0 100 100';

  return (
    <>
      {/* Activity picker */}
      <section className="mt-6">
        <div className="flex justify-between items-baseline mb-[10px]">
          <h2 className="font-tight font-extrabold text-[22px] tracking-[-0.02em] m-0">Pick an activity</h2>
          <div className="flex items-center gap-3">
            <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">{activities.length} {activityDateLabel}</Mono>
            <div className="hidden sm:flex gap-1">
              <button
                onClick={() => carouselRef.current?.scrollBy({ left: -240, behavior: 'smooth' })}
                className="w-7 h-7 border border-rule-soft bg-panel flex items-center justify-center text-ink-soft hover:text-ink cursor-pointer font-sans text-base leading-none"
                aria-label="Scroll left"
              >‹</button>
              <button
                onClick={() => carouselRef.current?.scrollBy({ left: 240, behavior: 'smooth' })}
                className="w-7 h-7 border border-rule-soft bg-panel flex items-center justify-center text-ink-soft hover:text-ink cursor-pointer font-sans text-base leading-none"
                aria-label="Scroll right"
              >›</button>
            </div>
          </div>
        </div>
        <Rule />
        {activities.length === 0 ? (
          <div className="py-10 text-center text-ink-soft text-sm">No activities recorded yet.</div>
        ) : (
          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-3 pb-3 mt-[10px]"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-x' }}
          >
            {activities.map((a) => {
              const isSel = activityId === a.activity_id;
              return (
                <button
                  key={a.id}
                  onClick={() => { onActivityId(a.activity_id); onRotation(0); }}
                  className="text-left border-none bg-transparent p-0 cursor-pointer font-sans shrink-0 w-[200px] sm:w-[220px] flex flex-col"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div
                    className="w-full h-[120px] bg-panel-alt border overflow-hidden"
                    style={{
                      borderColor: isSel ? 'var(--brand)' : 'var(--rule-soft)',
                      boxShadow: isSel ? 'inset 0 0 0 2px var(--brand)' : 'none',
                    }}
                  >
                    {tinyMap({ svgPath: a.svg_path, svgViewBox: a.svg_view_box, accent: isSel ? 'var(--brand)' : 'var(--ink-soft)' })}
                  </div>
                  <div
                    className="flex-1 p-2.5 pt-2 border border-t-0 flex flex-col gap-0.5"
                    style={{ borderColor: isSel ? 'var(--brand)' : 'var(--rule-soft)' }}
                  >
                    <Mono className="text-[10px] text-ink-soft tracking-[.12em] uppercase leading-tight">
                      {new Date(a.datetime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: CT })} · {a.sport_type}
                    </Mono>
                    <div className={['font-bold text-sm tracking-[-0.01em] mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis', isSel ? 'text-brand' : 'text-ink'].join(' ')}>
                      {a.name}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <Mono className="text-[11px] text-ink-soft">
                        {a.distance > 0 ? `${a.distance.toFixed(1)} mi` : '—'} · {a.minutes} min
                      </Mono>
                      <div
                        className="w-[14px] h-[14px] shrink-0 rounded-full border grid place-items-center"
                        style={{
                          borderWidth: '1.5px',
                          borderColor: isSel ? 'var(--brand)' : 'var(--rule-soft)',
                          background: isSel ? 'var(--brand)' : 'transparent',
                        }}
                      >
                        {isSel && <span className="w-[6px] h-[6px] rounded-full bg-panel" />}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Composition */}
      <section className="mt-8">
        <div className="flex justify-between items-baseline mb-[10px]">
          <h2 className="font-tight font-extrabold text-[22px] tracking-[-0.02em] m-0">Your submission</h2>
          {activeSub && submittedAt && (
            <div className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-good" />
              <Mono className="text-[10px] text-ink-soft tracking-[.12em] uppercase">
                Submitted · {fmtDate(submittedAt)}
              </Mono>
            </div>
          )}
        </div>
        <Rule />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-6 mt-[10px]">
          <div>
            <CompositionCanvas
              path={currentPath}
              svgViewBox={currentViewBox}
              rotation={rotation}
              title={title}
              visibility={visibility}
              strokeColor={strokeColor}
              bgColor={bgColor}
              strokeWidth={strokeWidth}
              isOwner
            />
          </div>
          <div>
            <div className="py-[10px] px-3 bg-panel border border-rule-soft flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Orient your route</Mono>
                <Mono className="text-[10px] text-ink-soft tabular-nums">{((rotation % 360) + 360) % 360}°</Mono>
              </div>
              <input
                type="range"
                min="0"
                max="359"
                step="1"
                value={((rotation % 360) + 360) % 360}
                onChange={(e) => onRotation(Number(e.target.value))}
                className="w-full accent-ink cursor-pointer"
                style={{ height: 2, accentColor: 'var(--ink)' }}
              />
            </div>
            <div className="mt-3.5 py-[10px] px-3 bg-panel border border-rule-soft">
              <ColorPicker
                strokeColor={strokeColor}
                bgColor={bgColor}
                onStrokeColor={onStrokeColor}
                onBgColor={onBgColor}
              />
            </div>
            <div className="mt-3.5">
              <StrokeWidthPicker value={strokeWidth} onChange={onStrokeWidth} />
            </div>
            <div className="mt-3.5">
              <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Title your piece</Mono>
              <input
                value={title}
                onChange={(e) => onTitle(e.target.value)}
                placeholder="Untitled"
                className="mt-1.5 py-[10px] px-3 w-full border border-rule bg-panel text-ink font-tight font-bold text-lg tracking-[-0.01em] outline-none box-border placeholder:text-ink-soft"
              />
            </div>
            <div className="mt-3.5">
              <VisibilityRadio value={visibility} onChange={onVisibility} />
            </div>
            <div className="flex gap-2.5 mt-4">
              <button
                onClick={onSave}
                disabled={saving || !activityId}
                className="flex-1 py-[14px] px-5 bg-ink text-panel border-none font-tight font-bold text-sm tracking-[.06em] uppercase cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving…' : saveLabel}
              </button>
              {onWithdraw && activeSub && (
                <button
                  onClick={onWithdraw}
                  className="py-[14px] px-[18px] bg-transparent text-brand border border-brand font-tight font-bold text-sm tracking-[.06em] uppercase cursor-pointer"
                >
                  Withdraw
                </button>
              )}
            </div>
            {footerNote && (
              <Mono className="block mt-[10px] text-[11px] text-ink-soft">{footerNote}</Mono>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function StravaArt() {
  const [tab, setTab] = useState('weekly');

  // — Weekly state —
  const [me, setMe] = useState(null);
  const [allPeriods, setAllPeriods] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [livePeriodId, setLivePeriodId] = useState(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [wallData, setWallData] = useState(null);
  const [mySub, setMySub] = useState(undefined);
  const [periodActivities, setPeriodActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activityId, setActivityId] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [strokeColor, setStrokeColor] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [strokeWidth, setStrokeWidth] = useState(2.8);
  const [saving, setSaving] = useState(false);
  const carouselRef = useRef(null);

  // — Open state —
  const [openActivities, setOpenActivities] = useState([]);
  const [openWall, setOpenWall] = useState([]);
  const [myOpenSubs, setMyOpenSubs] = useState([]);
  const openLoaded = useRef(false);
  const [openLoading, setOpenLoading] = useState(false);

  const [openActivityId, setOpenActivityId] = useState(null);
  const [openRotation, setOpenRotation] = useState(0);
  const [openTitle, setOpenTitle] = useState('');
  const [openVisibility, setOpenVisibility] = useState('public');
  const [openStrokeColor, setOpenStrokeColor] = useState('');
  const [openBgColor, setOpenBgColor] = useState('');
  const [openStrokeWidth, setOpenStrokeWidth] = useState(2.8);
  const [editingOpenSubId, setEditingOpenSubId] = useState(null);
  const [openSaving, setOpenSaving] = useState(false);
  const openCarouselRef = useRef(null);

  // Load weekly data
  useEffect(() => {
    Promise.all([getPeriods(), getMe()]).then(([periodsData, meData]) => {
      setMe(meData);
      setAllPeriods(periodsData);
      const artPeriods = periodsData.filter((p) => p.state === 'done' || p.state === 'live');
      setPeriods(artPeriods);
      const live = artPeriods.find((p) => p.state === 'live');
      const initial = live ?? artPeriods[artPeriods.length - 1];
      if (live) setLivePeriodId(live.id);
      if (initial) setSelectedPeriodId(initial.id);
      else setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedPeriodId || periods.length === 0) return;
    const period = periods.find((p) => p.id === selectedPeriodId);
    if (!period) return;

    setLoading(true);
    const isLive = period.state === 'live';
    Promise.all([
      getArtWall(selectedPeriodId),
      getMyArtSub(selectedPeriodId),
      isLive ? getActivities({ period_id: selectedPeriodId }) : Promise.resolve({ results: [] }),
    ]).then(([wall, sub, acts]) => {
      setWallData(wall);
      setMySub(sub);
      setPeriodActivities(acts.results ?? []);

      const activeSub = sub && !sub.is_withdrawn ? sub : null;
      if (activeSub) {
        const matchedAct = (acts.results ?? []).find((a) => String(a.activity_id) === String(activeSub.activity_id));
        setActivityId(matchedAct?.activity_id ?? null);
        setRotation(activeSub.rotation);
        setTitle(activeSub.title);
        setVisibility(activeSub.visibility);
        setStrokeColor(activeSub.stroke_color ?? '');
        setBgColor(activeSub.bg_color ?? '');
        setStrokeWidth(activeSub.stroke_width ?? 2.8);
      } else {
        setActivityId(null);
        setRotation(0);
        setTitle('');
        setVisibility('public');
        setStrokeColor('');
        setBgColor('');
        setStrokeWidth(2.8);
      }
      setLoading(false);
    });
  }, [selectedPeriodId, periods]);

  // Load open data (lazy — only on first switch to open tab)
  useEffect(() => {
    if (tab !== 'open' || openLoaded.current) return;
    openLoaded.current = true;
    setOpenLoading(true);
    Promise.all([
      getOpenWall(),
      getMyOpenSubs(),
      getActivities({ page_size: 500 }),
    ]).then(([wall, mySubs, acts]) => {
      setOpenWall(wall.submissions ?? []);
      setMyOpenSubs(mySubs ?? []);
      setOpenActivities(acts.results ?? []);
      setOpenLoading(false);
    });
  }, [tab]);

  // Weekly computed values
  const wall = useMemo(() => {
    if (!wallData) return [];
    const mySubId = mySub && !mySub.is_withdrawn ? mySub.id : null;
    return [...wallData.submissions]
      .filter((s) => !(s.id === mySubId && mySub?.visibility === 'private'))
      .sort((a, b) => b.likes - a.likes)
      .map((s, i) => ({ ...s, rank: i }));
  }, [wallData, mySub]);

  async function handleToggleLike(s) {
    setWallData((prev) => ({
      ...prev,
      submissions: prev.submissions.map((x) =>
        x.id === s.id ? { ...x, liked_by_me: !x.liked_by_me, likes: x.likes + (x.liked_by_me ? -1 : 1) } : x
      ),
    }));
    try {
      const result = await toggleArtLike(s.id);
      setWallData((prev) => ({
        ...prev,
        submissions: prev.submissions.map((x) =>
          x.id === s.id ? { ...x, liked_by_me: result.liked, likes: result.likesCount } : x
        ),
      }));
    } catch {
      setWallData((prev) => ({
        ...prev,
        submissions: prev.submissions.map((x) => (x.id === s.id ? s : x)),
      }));
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const activeSub = mySub && !mySub.is_withdrawn ? mySub : null;
      const stravaId = periodActivities.find((a) => a.activity_id === activityId)?.activity_id ?? null;
      const savedRotation = ((rotation % 360) + 360) % 360;
      const styleFields = { strokeColor, bgColor, strokeWidth };
      const body = { period: selectedPeriodId, title, activityId: stravaId, rotation: savedRotation, visibility, ...styleFields };
      const updated = activeSub
        ? await patchArtSub(activeSub.id, { title, activityId: stravaId, rotation: savedRotation, visibility, ...styleFields })
        : await createArtSub(body);
      setMySub(updated);
      setWallData((prev) => {
        if (!prev) return prev;
        const existing = prev.submissions.find((s) => s.id === updated.id);
        if (updated.visibility === 'private') {
          return { ...prev, submissions: prev.submissions.filter((s) => s.id !== updated.id) };
        }
        const wallEntry = {
          id: updated.id,
          svg_path: updated.svg_path,
          svg_view_box: updated.svg_view_box,
          rotation: updated.rotation,
          stroke_color: updated.stroke_color,
          bg_color: updated.bg_color,
          stroke_width: updated.stroke_width,
          title: updated.title,
          who: updated.visibility === 'anonymous' ? null : me?.name,
          section: me?.section,
          likes: existing?.likes ?? 0,
          liked_by_me: existing?.liked_by_me ?? false,
        };
        return existing
          ? { ...prev, submissions: prev.submissions.map((s) => s.id === updated.id ? wallEntry : s) }
          : { ...prev, submissions: [...prev.submissions, wallEntry] };
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleWithdraw() {
    const activeSub = mySub && !mySub.is_withdrawn ? mySub : null;
    if (!activeSub) return;
    try {
      await deleteArtSub(activeSub.id);
      setMySub({ ...mySub, is_withdrawn: true });
      setWallData((prev) => prev
        ? { ...prev, submissions: prev.submissions.filter((s) => s.id !== activeSub.id) }
        : prev
      );
      setActivityId(null);
      setRotation(0);
      setTitle('');
      setVisibility('public');
      setStrokeColor('');
      setBgColor('');
      setStrokeWidth(2.8);
    } catch (e) {
      console.error(e);
    }
  }

  // Open tab handlers
  function resetOpenForm() {
    setOpenActivityId(null);
    setOpenRotation(0);
    setOpenTitle('');
    setOpenVisibility('public');
    setOpenStrokeColor('');
    setOpenBgColor('');
    setOpenStrokeWidth(2.8);
    setEditingOpenSubId(null);
  }

  function handleEditOpenSub(sub) {
    setEditingOpenSubId(sub.id);
    setOpenActivityId(sub.activity_id ? Number(sub.activity_id) : null);
    setOpenRotation(sub.rotation ?? 0);
    setOpenTitle(sub.title ?? '');
    setOpenVisibility(sub.visibility ?? 'public');
    setOpenStrokeColor(sub.stroke_color ?? '');
    setOpenBgColor(sub.bg_color ?? '');
    setOpenStrokeWidth(sub.stroke_width ?? 2.8);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDeleteOpenSub(sub) {
    try {
      await deleteArtSub(sub.id);
      setMyOpenSubs((prev) => prev.filter((s) => s.id !== sub.id));
      setOpenWall((prev) => prev.filter((s) => s.id !== sub.id));
      if (editingOpenSubId === sub.id) resetOpenForm();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSaveOpen() {
    setOpenSaving(true);
    const savedRotation = ((openRotation % 360) + 360) % 360;
    const body = {
      activityId: openActivityId,
      title: openTitle,
      rotation: savedRotation,
      visibility: openVisibility,
      strokeColor: openStrokeColor,
      bgColor: openBgColor,
      strokeWidth: openStrokeWidth,
    };
    try {
      let updated;
      if (editingOpenSubId) {
        updated = await patchArtSub(editingOpenSubId, body);
        setMyOpenSubs((prev) => prev.map((s) => s.id === updated.id ? updated : s));
      } else {
        updated = await createOpenSub(body);
        setMyOpenSubs((prev) => [updated, ...prev]);
      }
      // Update open wall optimistically
      const wallEntry = {
        id: updated.id,
        svg_path: updated.svg_path,
        svg_view_box: updated.svg_view_box,
        rotation: updated.rotation,
        stroke_color: updated.stroke_color,
        bg_color: updated.bg_color,
        stroke_width: updated.stroke_width,
        title: updated.title,
        who: updated.visibility === 'anonymous' ? null : me?.name,
        section: me?.section,
        likes: openWall.find((s) => s.id === updated.id)?.likes ?? 0,
        liked_by_me: false,
      };
      if (updated.visibility === 'private') {
        setOpenWall((prev) => prev.filter((s) => s.id !== updated.id));
      } else {
        setOpenWall((prev) => {
          const existing = prev.find((s) => s.id === updated.id);
          return existing
            ? prev.map((s) => s.id === updated.id ? wallEntry : s)
            : [wallEntry, ...prev];
        });
      }
      resetOpenForm();
    } catch (e) {
      console.error(e);
    } finally {
      setOpenSaving(false);
    }
  }

  async function handleToggleOpenLike(s) {
    setOpenWall((prev) =>
      prev.map((x) => x.id === s.id ? { ...x, liked_by_me: !x.liked_by_me, likes: x.likes + (x.liked_by_me ? -1 : 1) } : x)
    );
    try {
      const result = await toggleArtLike(s.id);
      setOpenWall((prev) =>
        prev.map((x) => x.id === s.id ? { ...x, liked_by_me: result.liked, likes: result.likesCount } : x)
      );
    } catch {
      setOpenWall((prev) => prev.map((x) => (x.id === s.id ? s : x)));
    }
  }

  const selectedPeriodObj = periods.find((p) => p.id === selectedPeriodId);
  const isSelectedLive = selectedPeriodId === livePeriodId;
  const activeSub = mySub && !mySub.is_withdrawn ? mySub : null;

  const selectedPeriodIdx = periods.findIndex((p) => p.id === selectedPeriodId);
  const selectedPeriodLabel = selectedPeriodIdx >= 0 ? `WK ${String(selectedPeriodIdx + 1).padStart(2, '0')}` : '';

  const theme = wallData?.theme ?? null;
  const dates = selectedPeriodObj
    ? fmtPeriodDates(selectedPeriodObj.start_date, selectedPeriodObj.end_date)
    : '';

  const openWallPublic = useMemo(() => {
    const myOpenSubIds = new Set(myOpenSubs.map((s) => s.id));
    return [...openWall]
      .filter((s) => !(myOpenSubIds.has(s.id) && s.visibility === 'private'))
      .sort((a, b) => b.likes - a.likes);
  }, [openWall, myOpenSubs]);

  return (
    <div className="w-full min-h-screen bg-bg text-ink font-sans px-9 pt-3 pb-20 relative" data-page-root>
      <TopBar />

      <PreCompetitionOverlay show={allPeriods.length > 0 && allPeriods.every((p) => p.state === 'future')} startDate={allPeriods[0]?.start_date ?? null}>
      {/* Hero grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end py-[26px] pb-[22px]">
        <div>
          {tab === 'weekly' ? (
            <>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <Mono className="text-[11px] text-ink-soft tracking-[.18em] uppercase">
                  {selectedPeriodLabel} · Artwork brief{dates ? ` · ${dates}` : ''}
                </Mono>
                {selectedPeriodObj && (
                  <Tag t={isSelectedLive ? 'OPEN' : 'CLOSED'} className={isSelectedLive ? 'bg-brand text-panel' : 'bg-ink-soft text-panel'} />
                )}
              </div>
              <h1 className="font-tight font-extrabold text-[56px] leading-[1.02] tracking-[-0.035em] mt-1 mb-0" style={{ textWrap: 'balance' }}>
                {theme ? themeHeading(theme) : <span className="text-ink-soft">Loading…</span>}
              </h1>
              <div className="mt-3.5 text-sm leading-[1.45] text-ink-soft max-w-[580px]">
                {isSelectedLive ? (
                  <>Pick one of your activities from this week whose route traces the shape. Rotate it to taste — the theme is the only constraint. Submissions close <strong className="text-ink">Sun 11:59pm</strong>.</>
                ) : (
                  <>This week's window is closed. Browse what the band submitted below.</>
                )}
              </div>
              <div className="mt-3.5 py-[10px] px-3 bg-panel border border-rule-soft flex items-start gap-2.5 max-w-[580px]" style={{ borderLeft: '3px solid var(--brand)' }}>
                <Mono className="text-[10px] text-brand tracking-[.18em] uppercase whitespace-nowrap pt-0.5">Be cool ·</Mono>
                <div className="text-xs leading-[1.45] text-ink-soft">
                  Submissions must be <strong className="text-ink">appropriate and on-theme</strong>. Anything off-theme, offensive, or otherwise inappropriate is subject to removal by program leaders.
                </div>
              </div>
            </>
          ) : (
            <>
              <Mono className="text-[11px] text-ink-soft tracking-[.18em] uppercase mb-1.5">Open gallery · all time</Mono>
              <h1 className="font-tight font-extrabold text-[56px] leading-[1.02] tracking-[-0.035em] mt-1 mb-0">
                Your map,{' '}<span className="text-brand">your art.</span>
              </h1>
              <div className="mt-3.5 text-sm leading-[1.45] text-ink-soft max-w-[580px]">
                Submit any route from this season — no theme, no deadline. As many pieces as you like.
              </div>
              <div className="mt-3.5 py-[10px] px-3 bg-panel border border-rule-soft flex items-start gap-2.5 max-w-[580px]" style={{ borderLeft: '3px solid var(--brand)' }}>
                <Mono className="text-[10px] text-brand tracking-[.18em] uppercase whitespace-nowrap pt-0.5">Be cool ·</Mono>
                <div className="text-xs leading-[1.45] text-ink-soft">
                  Keep it <strong className="text-ink">appropriate</strong>. Anything offensive or otherwise inappropriate is subject to removal by program leaders.
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 items-start">
          {tab === 'weekly' && (
            <WeekNav periods={periods} livePeriodId={livePeriodId} selectedPeriodId={selectedPeriodId} onSelect={setSelectedPeriodId} />
          )}
          <div className="bg-panel border border-rule-soft w-full p-[14px] px-[18px]" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {tab === 'weekly' ? (
              <>
                <div>
                  <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Theme</Mono>
                  <div className="font-tight font-extrabold text-[22px] text-brand tracking-[-0.02em] mt-0.5">{theme ?? '—'}</div>
                </div>
                <div>
                  <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">{isSelectedLive ? 'Submitted so far' : 'Final entries'}</Mono>
                  <div className="font-tight font-extrabold text-[22px] tracking-[-0.02em] mt-0.5">{wall.length}</div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Open entries</Mono>
                  <div className="font-tight font-extrabold text-[22px] tracking-[-0.02em] mt-0.5">{openWallPublic.length}</div>
                </div>
                <div>
                  <Mono className="text-[10px] text-ink-soft tracking-[.14em] uppercase">Your pieces</Mono>
                  <div className="font-tight font-extrabold text-[22px] tracking-[-0.02em] mt-0.5">{myOpenSubs.length}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-4 py-4">
        <TabSwitcher tab={tab} onChange={setTab} />
      </div>

      <Rule soft />

      {/* Weekly tab content */}
      {tab === 'weekly' && (
        <>
          {isSelectedLive && !loading && (
            <SubmissionControls
              activities={periodActivities}
              activityId={activityId}
              onActivityId={setActivityId}
              rotation={rotation}
              onRotation={setRotation}
              strokeColor={strokeColor}
              onStrokeColor={setStrokeColor}
              bgColor={bgColor}
              onBgColor={setBgColor}
              strokeWidth={strokeWidth}
              onStrokeWidth={setStrokeWidth}
              title={title}
              onTitle={setTitle}
              visibility={visibility}
              onVisibility={setVisibility}
              saving={saving}
              onSave={handleSave}
              onWithdraw={handleWithdraw}
              activeSub={activeSub}
              submittedAt={activeSub?.submitted_at}
              saveLabel={activeSub ? 'Update artwork' : 'Submit artwork'}
              footerNote="One submission per person, per week. You can revise until Sun 11:59pm."
              carouselRef={carouselRef}
              activityDateLabel={`from ${dates}`}
            />
          )}

          <div className="mt-9">
            <div className="flex items-baseline justify-between mb-[10px]">
              <h2 className="font-tight font-extrabold text-[22px] tracking-[-0.02em] m-0">
                {isSelectedLive ? "This week's wall" : `${selectedPeriodLabel} wall · ${theme ?? ''}`}
              </h2>
              <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">{wall.length} entries</Mono>
            </div>
            <Rule />
            {loading ? (
              <div className="py-16 text-center text-ink-soft text-sm">Loading…</div>
            ) : wall.length === 0 ? (
              <div className="py-16 text-center text-ink-soft text-sm">No public submissions yet.</div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4">
                {wall.map((s, i) => (
                  <div
                    key={s.id}
                    className={[
                      colSep(i, { base: 2, lg: 4 }),
                      rowSep(i, wall.length, { base: 2, lg: 4 }),
                    ].join(' ')}
                  >
                    <SubmissionTile s={s} onLike={handleToggleLike} isOwn={s.id === activeSub?.id} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Open tab content */}
      {tab === 'open' && (
        <>
          {openLoading ? (
            <div className="py-16 text-center text-ink-soft text-sm">Loading…</div>
          ) : (
            <>
              <SubmissionControls
                activities={openActivities}
                activityId={openActivityId}
                onActivityId={setOpenActivityId}
                rotation={openRotation}
                onRotation={setOpenRotation}
                strokeColor={openStrokeColor}
                onStrokeColor={setOpenStrokeColor}
                bgColor={openBgColor}
                onBgColor={setOpenBgColor}
                strokeWidth={openStrokeWidth}
                onStrokeWidth={setOpenStrokeWidth}
                title={openTitle}
                onTitle={setOpenTitle}
                visibility={openVisibility}
                onVisibility={setOpenVisibility}
                saving={openSaving}
                onSave={handleSaveOpen}
                onWithdraw={null}
                activeSub={editingOpenSubId ? myOpenSubs.find((s) => s.id === editingOpenSubId) ?? null : null}
                submittedAt={editingOpenSubId ? myOpenSubs.find((s) => s.id === editingOpenSubId)?.submitted_at : null}
                saveLabel={editingOpenSubId ? 'Update artwork' : 'Submit artwork'}
                footerNote={editingOpenSubId ? 'Editing an existing piece.' : 'Submit as many pieces as you like — open any time.'}
                carouselRef={openCarouselRef}
                activityDateLabel="from this season"
              />

              {/* My open pieces */}
              {myOpenSubs.length > 0 && (
                <div className="mt-9">
                  <div className="flex items-baseline justify-between mb-[10px]">
                    <h2 className="font-tight font-extrabold text-[22px] tracking-[-0.02em] m-0">Your pieces</h2>
                    <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">{myOpenSubs.length} {myOpenSubs.length === 1 ? 'piece' : 'pieces'}</Mono>
                  </div>
                  <Rule />
                  <div className="grid grid-cols-2 lg:grid-cols-4">
                    {myOpenSubs.map((s, i) => (
                      <div
                        key={s.id}
                        className={[
                          colSep(i, { base: 2, lg: 4 }),
                          rowSep(i, myOpenSubs.length, { base: 2, lg: 4 }),
                        ].join(' ')}
                      >
                        <div className="p-4 pb-[18px]">
                          <ArtworkFrame
                            path={s.svg_path}
                            svgViewBox={s.svg_view_box}
                            rotation={s.rotation}
                            strokeColor={s.stroke_color}
                            bgColor={s.bg_color}
                            strokeWidth={s.stroke_width}
                            className="mb-3"
                          />
                          <div className="font-bold text-sm tracking-[-0.01em] mb-1.5">{s.title || 'Untitled'}</div>
                          <div className="flex justify-between items-center gap-2">
                            <Mono className="text-[11px] text-ink-soft capitalize">{s.visibility}</Mono>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditOpenSub(s)}
                                className={[
                                  'font-mono text-[10px] tracking-[.1em] uppercase py-1 px-2 border cursor-pointer font-sans',
                                  editingOpenSubId === s.id
                                    ? 'bg-ink text-panel border-ink'
                                    : 'bg-transparent text-ink-soft border-rule-soft hover:text-ink hover:border-rule',
                                ].join(' ')}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteOpenSub(s)}
                                className="font-mono text-[10px] tracking-[.1em] uppercase py-1 px-2 border border-rule-soft bg-transparent text-brand cursor-pointer font-sans hover:border-brand"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Open gallery */}
              <div className="mt-9">
                <div className="flex items-baseline justify-between mb-[10px]">
                  <h2 className="font-tight font-extrabold text-[22px] tracking-[-0.02em] m-0">Open gallery</h2>
                  <Mono className="text-[11px] text-ink-soft tracking-[.1em] uppercase">{openWallPublic.length} entries</Mono>
                </div>
                <Rule />
                {openWallPublic.length === 0 ? (
                  <div className="py-16 text-center text-ink-soft text-sm">No public submissions yet.</div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4">
                    {openWallPublic.map((s, i) => {
                      const isOwn = myOpenSubs.some((ms) => ms.id === s.id);
                      return (
                        <div
                          key={s.id}
                          className={[
                            colSep(i, { base: 2, lg: 4 }),
                            rowSep(i, openWallPublic.length, { base: 2, lg: 4 }),
                          ].join(' ')}
                        >
                          <SubmissionTile s={s} onLike={isOwn ? null : handleToggleOpenLike} isOwn={isOwn} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      <PageFooter />
      </PreCompetitionOverlay>
      <BottomNav />
    </div>
  );
}
