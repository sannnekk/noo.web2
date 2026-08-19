<template>
  <header class="header">
    <noo-google-translate-warner />
    <div class="header__inner">
      <div class="header__pane-toggler">
        <noo-pane-toggler v-model:is-open="model" />
      </div>
      <div class="header__page-title">
        <noo-title :size="1">
          {{ route.meta.pageTitle }}
        </noo-title>
      </div>
      <div class="header__widgets">
        <div class="header__widgets__hotkey-widget">
          <noo-hotkey-widget />
        </div>
        <div class="header__widgets__theme-toggle-widget">
          <noo-theme-toggle-widget />
        </div>
        <div class="header__widgets__notifications-widget">
          <noo-notifications-widget />
        </div>
        <div class="header__widgets__theme-toggle-widget">
          <noo-help-widget />
        </div>
      </div>
      <div class="header__profile-widget">
        <noo-profile-widget />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const model = defineModel<boolean>('isPaneOpen', {
  default: false
})

const route = useRoute()
</script>

<style scoped lang="sass">
.header
  padding-top: 1em

  &__inner
    box-shadow: 0px 0px 10px #00000011
    background-color: var(--lightest)
    border-radius: var(--border-radius)
    padding: 0.5em 1em
    width: 100%
    overflow: hidden

    display: grid
    grid-template-columns: auto minmax(0, 1fr) auto auto
    grid-template-rows: 1fr
    align-items: center

    +mobile
      grid-template-columns: auto minmax(0, 1fr) auto
      grid-template-rows: auto auto

  &__pane-toggler
    font-size: fluid(2.5rem, 3.75rem)
    margin-right: 0em
    height: 1em
    min-width: fluid(2.5rem, 4.375rem)
    width: fluid(2.5rem, 4.375rem)
    overflow: hidden

  &__page-title
    h1
      margin: 0
      padding: 0
      white-space: nowrap
      text-overflow: ellipsis
      overflow: hidden

      +mobile
        margin-left: 0.4em
        font-size: 20px

  &__widgets
    display: flex
    justify-content: flex-end
    align-items: center
    margin: 0 1em
    gap: 0.4em

    +mobile
      margin: 0
      padding-left: 0.5em

    &__hotkey-widget
      +mobile
        display: none

  &__profile-widget
    +mobile
      grid-column: 1 / -1
      width: 100%
      border-top: 1px solid var(--border-color)
      padding-top: 0.5em
      margin-top: 0.5em
</style>
