declare module '@kinescope/vue-kinescope-player' {
  import type { DefineComponent } from 'vue'

  /**
   * Minimal typing for the official Kinescope Vue player. The package ships
   * without declarations, so only the props/events actually used in the app are
   * described here. See https://github.com/kinescope/vue-kinescope-player.
   */
  export const KinescopePlayer: DefineComponent<{
    videoId: string | number
    width?: string | number
    height?: string | number
    autoPlay?: boolean | 'viewable' | 'hover'
    muted?: boolean
    loop?: boolean
    playsInline?: boolean
    controls?: boolean
    title?: boolean
    controlBar?: boolean
  }>
}
