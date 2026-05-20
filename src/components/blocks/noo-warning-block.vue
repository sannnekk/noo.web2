<template>
  <div
    class="noo-warning-block"
    :class="{ 'noo-warning-block--small': small }"
  >
    <div class="noo-warning-block__icon">
      <noo-icon name="attention-yellow" />
    </div>
    <div class="noo-warning-block__text">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  small?: boolean
}

defineProps<Props>()
</script>

<style scoped lang="sass">
.noo-warning-block
  display: flex
  align-items: center
  padding: 0.2em 0
  color: var(--warning)

  &--small
    padding: 0.5em
    font-size: 0.9em

  &__icon
    font-size: 40px
    line-height: 10px

  &__text
    padding-left: 1em
</style>
