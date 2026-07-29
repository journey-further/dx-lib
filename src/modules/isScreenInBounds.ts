/**
 * Checks whether the current viewport width sits within the given bounds — inclusive on both ends, so exact
 * breakpoint widths (an iPad rotating onto 768/1024) behave the same everywhere.
 *
 * This is the same check useSPA runs for its `screen` option; use it directly in builds that don't run under useSPA
 * instead of hand-rolling `matchMedia`/`innerWidth` comparisons.
 *
 * @param {object} [screen] - The bounds to check against. Omitted bounds are unbounded.
 * @param {number} [screen.minWidth=0] - Minimum viewport width, inclusive.
 * @param {number} [screen.maxWidth=Infinity] - Maximum viewport width, inclusive.
 * @returns {boolean} True when `window.innerWidth` is within bounds.
 *
 * @example
 *   if (!isScreenInBounds({ maxWidth: 767 })) return; // mobile-only build
 */
export const isScreenInBounds = ({
  minWidth = 0,
  maxWidth = Infinity,
}: { minWidth?: number; maxWidth?: number } = {}): boolean =>
  window.innerWidth >= minWidth && window.innerWidth <= maxWidth;
