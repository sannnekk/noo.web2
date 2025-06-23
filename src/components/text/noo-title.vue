<template>
  <component
    :is="`h${size}`"
    :class="['noo-title', size]"
    :style="{
      textAlign: align
    }"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
interface Props {
  size: number
  align?: 'left' | 'center' | 'right'
}

defineProps<Props>()
</script>

<style scoped lang="sass"></style>
