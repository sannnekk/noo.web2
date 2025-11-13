<template>
  <noo-grid-layout>
    <noo-grid-layout-item
      :col="1"
      :row="1"
      :colspan="2"
      horizontal-align="stretch"
    >
      <div class="noo-form-skeleton__loader" />
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="3"
      :row="1"
      :colspan="2"
      horizontal-align="stretch"
    >
      <div class="noo-form-skeleton__loader" />
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="5"
      :row="1"
      :colspan="2"
      horizontal-align="stretch"
    >
      <div class="noo-form-skeleton__loader" />
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="1"
      :row="2"
      :colspan="2"
      horizontal-align="stretch"
    >
      <div class="noo-form-skeleton__loader" />
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="3"
      :row="2"
      :colspan="2"
      vertical-align="center"
    >
      <div class="noo-form-skeleton__loader" />
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="5"
      :row="1"
      :colspan="2"
    >
      <div class="noo-form-skeleton__loader" />
    </noo-grid-layout-item>
    <noo-grid-layout-item
      :col="5"
      :row="3"
      :colspan="6"
    >
      <div class="noo-form-skeleton__loader noo-form-skeleton__loader--large" />
    </noo-grid-layout-item>
  </noo-grid-layout>
</template>

<style lang="sass" scoped>
.noo-form-skeleton
  &__loader
    width: 100%
    height: 40px
    background: var(--skeleton-bg)
    animation: var(--skeleton-animation)
    border-radius: var(--border-radius)

    &--large
      height: 120px
</style>
