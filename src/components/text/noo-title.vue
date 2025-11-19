<template>
  <component
    :is="`h${size}`"
    :class="['noo-title', size]"
    :style="{
      textAlign: align,
      margin: noMargin ? '0' : undefined
    }"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
interface Props {
  size: number
  align?: 'left' | 'center' | 'right'
  noMargin?: boolean
}

defineProps<Props>()
</script>

<style scoped lang="sass"></style>
