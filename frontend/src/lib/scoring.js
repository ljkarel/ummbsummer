// p = t             for 0 ≤ t ≤ 210
// p = log_{1.01}(t/210) + 210   for t > 210
export function scoreFor(minutes) {
  const cap = 210;
  if (minutes <= cap) return minutes;
  return Math.log(minutes / cap) / Math.log(1.01) + cap;
}
