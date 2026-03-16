<template>
  <component
    :is="`h${size}`"
    :class="['noo-title', size]"
    :style="{
      textAlign: align,
      margin: noMargin ? '0' : undefined,
      color
    }"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
interface Props {
  size: number
  align?: 'left' | 'center' | 'right'
  color?: string | null
  noMargin?: boolean
}

defineProps<Props>()
</script>
