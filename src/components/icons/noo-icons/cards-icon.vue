<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-8 -8 100 108"
  >
    <g class="moveable-forwards">
      <rect
        fill="var(--primary)"
        x="16"
        y="16"
        width="68"
        height="76"
        rx="12"
        ry="12"
      />
    </g>
    <g class="moveable-backwards">
      <rect
        fill="none"
        stroke="var(--secondary)"
        stroke-width="8"
        x="4"
        y="4"
        width="68"
        height="76"
        rx="12"
        ry="12"
      />
      <path
        fill="none"
        stroke="var(--secondary)"
        stroke-width="8"
        stroke-linecap="round"
        d="M20,26h36M20,42h36M20,58h20"
      />
    </g>
  </svg>
</template>
