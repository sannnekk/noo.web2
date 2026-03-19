<template>
  <div
    class="noo-search-input"
    @mouseenter="isOnHover = true"
    @mouseleave="isOnHover = false"
    @keydown="$emit('keydown', $event)"
  >
    <noo-text-input
      v-model="model"
      label=""
      placeholder="Поиск..."
      autocomplete="off"
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
          name="close"
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

interface Emits {
  keydown: [event: KeyboardEvent]
}

defineProps<Props>()
defineEmits<Emits>()

const model = defineModel<string | undefined>({
  default: ''
})

const isOnHover = ref(false)
</script>

<style scoped lang="sass">
.noo-search-input
  width: 100%
  position: relative

  &__icon
    position: absolute
    top: 50%
    left: 0.3rem
    transform: translateY(-50%)
    font-size: 1.5em

  &__input
    margin-bottom: 0 !important

    &:deep()
      input
        padding: 0.75em 1em 0.75em 2.5em !important

  &__erase-button
    position: absolute
    top: 50%
    right: 0.25em
    transform: translateY(-50%)
    font-size: 1.7em
    cursor: pointer
    color: var(--text-light)
    transition: transform 0.2s ease-in-out

    &:hover
      --form-text-color: var(--danger)
</style>
