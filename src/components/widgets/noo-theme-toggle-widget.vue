<template>
  <div class="noo-theme-toggle-widget">
    <button
      class="noo-theme-toggle-widget__button"
      title="Сменить тему"
      @click="toggle"
    >
      <noo-icon
        v-if="mode === 'dark'"
        name="moon"
      />
      <noo-icon
        v-else
        name="sun"
      />
      <span
        v-if="withName"
        class="noo-theme-toggle-widget__label"
      >
        {{ mode === 'dark' ? 'Тёмная' : 'Светлая' }} тема
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/core/composables/useTheme'

interface Props {
  withName?: boolean
}

defineProps<Props>()

const { mode, toggle } = useTheme()
</script>

<style scoped lang="sass">
.noo-theme-toggle-widget
  position: relative

  &__button
    padding: 0.2em
    font-size: 1.7em
    display: flex
    justify-content: center
    align-items: center
    border-radius: 0.5em
    background-color: transparent
    cursor: pointer
    border: none

    @media screen and (max-width: 768px)
      font-size: 1.4rem
      padding: 0.3em

    &:hover
      background-color: var(--light)

  &__label
    margin-left: 0.5em
    font-size: 0.7em
    color: var(--text-light)
</style>
