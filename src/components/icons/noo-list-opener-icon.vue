<template>
  <div
    class="noo-list-opener-icon"
    :class="{
      'noo-list-opener-icon__vertical': type === 'vertical',
      'noo-list-opener-icon__opened': opened
    }"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      class="bi bi-chevron-down"
      viewBox="0 0 16 16"
    >
      <path
        fill-rule="evenodd"
        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
interface Props {
  opened?: boolean
  type?: 'horizontal' | 'vertical'
}

withDefaults(defineProps<Props>(), {
  opened: false,
  type: 'horizontal'
})
</script>

<style scoped lang="sass">
.noo-list-opener-icon
  display: flex
  align-items: center
  justify-content: center
  width: 1.5em
  height: 1.5em
  border-radius: 50%
  background: var(--icon-background)
  color: var(--icon-color)
  cursor: pointer
  transition: transform 0.2s ease
  transform: rotate(-90deg)

  svg
    width: 1.2em
    height: 1.2em

  &__opened
    transform: rotate(0deg)

  &__vertical
    transform: rotate(0deg)

    &.noo-list-opener-icon__opened
      transform: rotate(-180deg)
</style>
