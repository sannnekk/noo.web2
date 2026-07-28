/**
 * Viewport breakpoints, in pixels.
 *
 * Mirror of the `$breakpoints` map in src/assets/styles/_breakpoints.sass and
 * of the Bootstrap 5 grid loaded in index.html — change one, change all three.
 *
 * Only use these from JS when the decision cannot be made in CSS: rendering a
 * different component, swapping a layout for a drawer, disabling a hover-only
 * interaction. Anything that is purely visual belongs in a media query.
 */
export const Breakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
} as const

export type BreakpointName = keyof typeof Breakpoints
