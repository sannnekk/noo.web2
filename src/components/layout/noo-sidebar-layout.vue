<template>
  <div class="noo-sidebar-layout">
    <aside
      class="noo-sidebar-layout__sidebar"
      :class="{
        'noo-sidebar-layout__sidebar--wide': wideSidebar,
        'noo-sidebar-layout__sidebar--collapsible': collapsible,
        'noo-sidebar-layout__sidebar--collapsed': isSidebarCollapsed
      }"
    >
      <button
        v-if="collapsible"
        type="button"
        class="noo-sidebar-layout__toggle"
        :class="{ 'noo-sidebar-layout__toggle--collapsed': isSidebarCollapsed }"
        :aria-expanded="sidebarOpened"
        :aria-controls="sidebarContentId"
        :aria-label="toggleButtonLabel"
        @click="toggleSidebar"
      >
        <noo-icon
          :key="isSidebarCollapsed ? 'arrow-right' : 'arrow-left'"
          :name="isSidebarCollapsed ? 'arrow-right' : 'arrow-left'"
        />
        <span class="noo-sidebar-layout__toggle__label">{{
          toggleButtonLabel
        }}</span>
      </button>
      <div
        :id="sidebarContentId"
        class="noo-sidebar-layout__sidebar__content"
        :class="{
          'noo-sidebar-layout__sidebar__content--hidden': isSidebarCollapsed
        }"
        :aria-hidden="isSidebarCollapsed"
      >
        <slot name="sidebar" />
      </div>
    </aside>
    <div
      class="noo-sidebar-layout__content"
      :class="{ 'noo-sidebar-layout__content--wide-sidebar': wideSidebar }"
    >
      <slot name="content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, useId, watch } from 'vue'

import { useBreakpoint } from '@/core/composables/useBreakpoint'

interface Props {
  wideSidebar?: boolean
  collapsible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  wideSidebar: false,
  collapsible: false
})
const { wideSidebar, collapsible } = toRefs(props)

const { isMobile } = useBreakpoint()

// Stacked on a phone, an open sidebar pushes the content off screen — start
// it collapsed there when there is a toggle to reopen it with.
const sidebarOpened = ref(!(props.collapsible && isMobile.value))
const sidebarContentId = `noo-sidebar-content-${useId()}`

const isSidebarCollapsed = computed(
  () => props.collapsible && !sidebarOpened.value
)

const toggleButtonLabel = computed(() =>
  isSidebarCollapsed.value ? 'Развернуть' : 'Свернуть'
)

function toggleSidebar() {
  sidebarOpened.value = !sidebarOpened.value
}

watch(
  () => props.collapsible,
  (collapsible) => {
    if (!collapsible) {
      sidebarOpened.value = true
    }
  }
)

// Crossing the breakpoint resets the sidebar to whatever suits the new layout:
// beside the content there is no reason to keep it collapsed, stacked above it
// there is no reason to keep it open.
watch(isMobile, (mobile, wasMobile) => {
  if (mobile === wasMobile || !props.collapsible) {
    return
  }

  sidebarOpened.value = !mobile
})
</script>

<style scoped lang="sass">
.noo-sidebar-layout
  --sidebar-width: 350px
  --sidebar-width-wide: 500px
  --sidebar-collapsed-width: 72px

  display: flex
  flex-direction: row
  align-items: flex-start

  +mobile
    flex-direction: column
    align-items: stretch

  &__sidebar
    width: var(--sidebar-width)
    height: fit-content
    padding: var(--space-s)
    margin: var(--space-s)
    border-radius: var(--border-radius)
    box-shadow: var(--block-shadow)
    transition: width 0.3s ease, padding 0.3s ease, max-height 0.3s ease

    &--wide
      width: var(--sidebar-width-wide)

    &--collapsed
      width: var(--sidebar-collapsed-width)
      padding-right: var(--space-2xs)
      padding-left: var(--space-2xs)
      overflow: hidden

    // Stacked, the sidebar spans the column and the widths above no longer
    // apply — `auto` lets align-items: stretch do the sizing.
    +mobile
      width: auto
      margin-bottom: 0

      &--wide
        width: auto

      &--collapsed
        width: auto
        max-height: 4.5em
        overflow: hidden

    &__content
      max-height: 1000vh
      opacity: 1
      transform: translateX(0)
      transition: max-height 0.3s ease, opacity 0.2s ease, transform 0.2s ease

      &--hidden
        max-height: 0
        opacity: 0
        transform: translateX(-10px)
        pointer-events: none

  &__toggle
    width: 100%
    border: none
    border-radius: 999px
    margin-bottom: 0.75em
    padding: var(--space-2xs) var(--space-xs)
    display: flex
    align-items: center
    justify-content: flex-start
    gap: 0.5em
    background-color: var(--light-background-color)
    color: var(--form-text-color)
    font-size: 0.9em
    font-weight: 500
    text-align: left
    cursor: pointer
    transition: background-color 0.2s ease, box-shadow 0.2s ease

    &:hover
      background-color: var(--icon-background)
      box-shadow: var(--block-shadow)

    &:focus-visible
      outline: 2px solid var(--primary)
      outline-offset: 2px

    &--collapsed
      justify-content: center

      .noo-sidebar-layout__toggle__label
        max-width: 0
        opacity: 0

    &__label
      overflow: hidden
      white-space: nowrap
      text-overflow: ellipsis
      max-width: 16em
      transition: max-width 0.2s ease, opacity 0.2s ease

    +mobile
      margin-bottom: 0.5em

      &--collapsed
        justify-content: flex-start

        .noo-sidebar-layout__toggle__label
          max-width: 16em
          opacity: 1

  &__content
    flex: 1
    min-width: 0
    padding: var(--space-s)
    width: auto

    &--wide-sidebar
      width: auto

    +mobile
      width: 100%
</style>
