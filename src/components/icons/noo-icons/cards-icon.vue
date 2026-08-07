<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    viewBox="0 0 24 24"
  >
    <g class="moveable-backwards">
      <rect
        x="2.4"
        y="6.4"
        width="13.2"
        height="15.2"
        rx="2"
        ry="2"
        fill="var(--secondary)"
      />
    </g>
    <g class="moveable-forwards">
      <rect
        x="8.4"
        y="2.4"
        width="13.2"
        height="15.2"
        rx="2"
        ry="2"
        fill="var(--primary)"
        stroke="var(--form-text-color)"
        stroke-width="1.2"
      />
      <path
        d="M11.6 7.2h6.8M11.6 10h6.8M11.6 12.8h4"
        stroke="var(--form-text-color)"
        stroke-width="1.2"
        stroke-linecap="round"
        fill="none"
      />
    </g>
  </svg>
</template>

<style lang="sass" scoped>
svg.animation
  .moveable-forwards
    transform: translate(1px, -1px)
  .moveable-backwards
    transform: translate(-1px, 1px)
</style>
