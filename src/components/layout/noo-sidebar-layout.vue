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
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  toRefs,
  useId,
  watch
} from 'vue'

interface Props {
  wideSidebar?: boolean
  collapsible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  wideSidebar: false,
  collapsible: false
})
const { wideSidebar, collapsible } = toRefs(props)

const sidebarOpened = ref(true)
const isMobileViewport = ref(false)
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

function handleResize() {
  const isMobile = window.innerWidth <= 768

  if (isMobileViewport.value && !isMobile && props.collapsible) {
    sidebarOpened.value = true
  }

  isMobileViewport.value = isMobile
}

watch(
  () => props.collapsible,
  (collapsible) => {
    if (!collapsible) {
      sidebarOpened.value = true
    }
  }
)

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
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

  @media screen and (max-width: 768px)
    flex-direction: column

  &__sidebar
    width: var(--sidebar-width)
    height: fit-content
    padding: 1em
    margin: 1em
    border-radius: var(--border-radius)
    box-shadow: var(--block-shadow)
    transition: width 0.3s ease, padding 0.3s ease, max-height 0.3s ease

    &--wide
      width: var(--sidebar-width-wide)

    &--collapsible
      overflow: hidden

    &--collapsed
      width: var(--sidebar-collapsed-width)
      padding-right: 0.6em
      padding-left: 0.6em

    @media screen and (max-width: 768px)
      width: calc(100% - 2em) !important

      &--collapsed
        width: calc(100% - 2em) !important
        max-height: 4.5em
        margin-top: 0
        margin-bottom: 0

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
    padding: 0.5em 0.8em
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

    @media screen and (max-width: 768px)
      margin-bottom: 0.5em

      &--collapsed
        justify-content: flex-start

        .noo-sidebar-layout__toggle__label
          max-width: 16em
          opacity: 1

  &__content
    flex: 1
    min-width: 0
    padding: 1em
    width: auto

    &--wide-sidebar
      width: auto

    @media screen and (max-width: 768px)
      width: 100%
</style>
