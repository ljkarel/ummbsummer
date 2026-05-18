// colSep: right-border separator for a responsive grid item.
// cols: { base?: number, sm?: number, lg: number }
export function colSep(i, { base = 1, sm = null, lg }) {
  if (i % lg === lg - 1) return '';

  if (sm) {
    if (i % sm === sm - 1) return 'lg:border-r border-rule-soft';
    return base === 1 ? 'sm:border-r border-rule-soft' : 'border-r border-rule-soft';
  }

  if (base > 1 && i % base === base - 1) return 'lg:border-r border-rule-soft';
  return base === 1 ? 'lg:border-r border-rule-soft' : 'border-r border-rule-soft';
}

// rowSep: bottom-border separator for a responsive grid item.
// Returns a class that shows border-b only between rows (not below the last row),
// correctly adjusted for each breakpoint where the column count changes.
// cols: { base?: number, sm?: number, lg: number }; total: total item count
export function rowSep(i, total, { base = 1, sm = null, lg }) {
  const lgLRS = total - (total % lg || lg); // index where last lg-row starts
  const inLgLast = i >= lgLRS;

  if (sm) {
    // When sm is provided, assume base === 1 (single-column mobile)
    const smLRS = total - (total % sm || sm);
    const inSmLast = i >= smLRS;
    if (i >= total - 1) return '';
    if (inSmLast && inLgLast) return 'border-b sm:border-b-0 border-rule-soft';
    // edge case: inSmLast but not inLgLast (smLRS < lgLRS) — restore border at lg
    if (inSmLast) return 'border-b sm:border-b-0 lg:border-b border-rule-soft';
    if (inLgLast) return 'border-b lg:border-b-0 border-rule-soft';
    return 'border-b border-rule-soft';
  }

  // No sm breakpoint
  const baseLRS = total - (total % base || base);
  if (i >= baseLRS) return '';
  if (inLgLast) return 'border-b lg:border-b-0 border-rule-soft';
  return 'border-b border-rule-soft';
}
