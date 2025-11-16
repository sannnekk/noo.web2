<template>
  <div
    class="noo-search-input"
    @mouseenter="isOnHover = true"
    @mouseleave="isOnHover = false"
  >
    <noo-text-input
      v-model="model"
      label=""
      placeholder="Поиск..."
      :autocomplete="false"
      class="noo-search-input__input"
      type="text"
    >
      <template #before>
        <noo-loader-icon
          v-if="isLoading"
          class="noo-search-input__icon"
          contrast
        />
        <noo-icon
          v-else
          class="noo-search-input__icon"
          name="search"
          :animation="isOnHover"
        />
      </template>
      <template #after>
        <noo-icon
          v-show="model && model.length"
          name="cross-red"
          class="noo-search-input__erase-button"
          @click="model = ''"
        />
      </template>
    </noo-text-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  isLoading?: boolean
}

defineProps<Props>()

const model = defineModel<string | undefined>('model', {
  default: ''
})

const isOnHover = ref(false)
</script>

<style scoped lang="sass">
.noo-search-input
  position: relative

  @media screen and (max-width: 768px)
    font-size: 12px

  &__icon
    position: absolute
    top: 50%
    left: 0.3rem
    transform: translateY(-50%)
    transition: transform 0.2s ease-in-out
    font-size: 30px

    @media screen and (max-width: 768px)
      font-size: 22px

  &__input:deep()
    input
      font-size: 16px
      padding: 0.75em 1em 0.75em 1em !important
      padding-left: 2.75em !important
      border-color: var(--border-color) !important
      color: var(--form-text-color)

      @media screen and (max-width: 768px)
        font-size: 12px

  &__erase-button
    position: absolute
    top: 50%
    right: 0.25em
    transform: translateY(-50%)
    font-size: 2em
    cursor: pointer
    color: var(--text-light)
    transition: transform 0.2s ease-in-out

    &:hover
      transform: translateY(-50%) rotate(90deg)
</style>
