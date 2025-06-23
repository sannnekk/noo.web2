<template>
  <div class="noo-sidebar-layout">
    <div
      class="noo-sidebar-layout__sidebar"
      :class="{ 'noo-sidebar-layout__sidebar--wide': wideSidebar }"
    >
      <div class="noo-sidebar-layout__sidebar__hide">
        <span
          v-if="sidebarOpened"
          @click="sidebarOpened = false"
        >
          Скрыть
        </span>
        <span
          v-else
          @click="sidebarOpened = true"
        >
          Открыть
        </span>
      </div>
      <slot
        v-if="sidebarOpened"
        name="sidebar"
      />
    </div>
    <div
      class="noo-sidebar-layout__content"
      :class="{ 'noo-sidebar-layout__content--wide-sidebar': wideSidebar }"
    >
      <slot name="content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

interface Props {
  wideSidebar?: boolean
}

defineProps<Props>()

const sidebarOpened = ref(true)

function handleResize() {
  if (window.innerWidth > 768) {
    sidebarOpened.value = true
  }
}

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
  display: flex
  flex-direction: row

  @media screen and (max-width: 768px)
    flex-direction: column

  &__sidebar
    width: 350px
    height: fit-content
    padding: 1em
    margin: 1em
    border-radius: var(--border-radius)
    box-shadow: var(--block-shadow)

    &--wide
      width: 500px

    @media screen and (max-width: 768px)
      width: calc(100% - 2em) !important

    &__hide
      display: none
      padding: 0
      text-align: right
      cursor: pointer
      color: var(--text-light)
      font-size: 0.8em

      &:hover
        color: var(--info)

      @media screen and (max-width: 768px)
        display: block

  &__content
    flex: 1
    padding: 1em
    width: calc(100% - 300px)

    &--wide-sidebar
      width: calc(100% - 500px)

    @media screen and (max-width: 768px)
      width: 100%
</style>
