import { useBreakpoints, useMediaQuery } from '@vueuse/core'
import type { ComputedRef, Ref } from 'vue'

import {
  type BreakpointName,
  Breakpoints
} from '@/core/config/breakpoints.config'

/**
 * Created once at module scope on purpose: every component that calls
 * useBreakpoint() shares the same media query listeners instead of registering
 * its own.
 */
const breakpoints = useBreakpoints(Breakpoints)

const isMobile = breakpoints.smaller('md')
const isTablet = breakpoints.between('md', 'lg')
const isTabletOrSmaller = breakpoints.smaller('lg')
const isDesktop = breakpoints.greaterOrEqual('lg')

const isTouch = useMediaQuery('(hover: none) and (pointer: coarse)')
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

interface UseBreakpointReturn {
  /** Viewport is narrower than `md` (768px) */
  isMobile: Ref<boolean>
  /** Viewport is between `md` (768px) and `lg` (992px) */
  isTablet: Ref<boolean>
  /** Viewport is narrower than `lg` (992px) */
  isTabletOrSmaller: Ref<boolean>
  /** Viewport is at least `lg` (992px) */
  isDesktop: Ref<boolean>
  /** Device cannot hover and has a coarse pointer */
  isTouch: Ref<boolean>
  /** Largest breakpoint the viewport currently satisfies */
  active: ComputedRef<BreakpointName | undefined>
  /** Viewport is at least `name` wide */
  greaterOrEqual: (name: BreakpointName) => Ref<boolean>
  /** Viewport is narrower than `name` */
  smaller: (name: BreakpointName) => Ref<boolean>
  /** Viewport is at least `from` and narrower than `to` */
  between: (from: BreakpointName, to: BreakpointName) => Ref<boolean>
  /** User asked for reduced motion */
  prefersReducedMotion: Ref<boolean>
}

/**
 * Reactive viewport state for decisions CSS cannot make — rendering a
 * different component, collapsing a layout into a drawer, turning off a
 * hover-only interaction.
 *
 * Anything purely visual should stay a media query: use the `+mobile`,
 * `+down()` and `+up()` mixins, which are auto-injected into every SFC style
 * block and read the same breakpoints this composable does.
 */
function useBreakpoint(): UseBreakpointReturn {
  return {
    isMobile,
    isTablet,
    isTabletOrSmaller,
    isDesktop,
    isTouch,
    active: breakpoints.active() as ComputedRef<BreakpointName | undefined>,
    greaterOrEqual: (name) => breakpoints.greaterOrEqual(name),
    smaller: (name) => breakpoints.smaller(name),
    between: (from, to) => breakpoints.between(from, to),
    prefersReducedMotion
  }
}

export { useBreakpoint, type UseBreakpointReturn }
