<template>
  <span
    class="noo-active-tag"
    :class="{
      'noo-active-tag--active': active,
      'noo-active-tag--inactive': !active
    }"
  >
    <slot>{{ active ? 'Активен' : 'Неактивен' }}</slot>
  </span>
</template>

<script setup lang="ts">
interface Props {
  active: boolean
}

defineProps<Props>()
</script>

<style scoped lang="sass">
.noo-active-tag
  font-size: 0.75em
  padding: 0.15em 0.5em
  border-radius: 0.25rem
  white-space: nowrap
  display: inline-block
  font-weight: bold

  &--active
    background: var(--success-light, rgba(0, 200, 83, 0.15))
    color: var(--success, #00c853)

  &--inactive
    background: var(--warning-light, rgba(255, 152, 0, 0.15))
    color: var(--warning, #ff9800)
</style>
