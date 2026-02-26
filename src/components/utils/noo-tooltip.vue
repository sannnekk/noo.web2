<template>
  <div
    class="noo-tooltip"
    @click.stop.prevent="isTooltipVisible = true"
  >
    <noo-icon name="question" />
  </div>
  <noo-base-modal v-model:is-open="isTooltipVisible">
    <template #title>{{ title }}</template>
    <template #content>
      <slot />
    </template>
    <template #actions="{ close }">
      <noo-button
        variant="secondary"
        @click="close()"
      >
        Закрыть
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title?: string
}

defineProps<Props>()

const isTooltipVisible = ref(false)
</script>

<style lang="sass" scoped>
.noo-tooltip
  display: inline-flex
  align-items: center
  justify-content: center
  width: 1em
  height: 1.4em
  cursor: pointer

  &:hover
    --text-light: var(--form-text-color)
</style>
