<template>
  <label>{{ label }}</label>
  <div class="noo-tag-input">
    <div class="noo-tag-input__tags">
      <span
        v-for="(tag, index) in model"
        :key="index"
        class="noo-tag-input__tag"
      >
        {{ tag }}
        <b
          class="noo-tag-input__tag__remove"
          @click="removeTag(index)"
        >
          +
        </b>
      </span>
    </div>
    <input
      v-model="input"
      type="text"
      @keydown.enter.prevent="addTag()"
      @keydown.backspace="removeLastTag()"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  label: string
}

defineProps<Props>()

const model = defineModel<string[]>({
  default: () => [],
  required: false
})

const input = ref('')

function addTag() {
  if (input.value?.trim()) {
    model.value = [...model.value, input.value.trim()]
    input.value = ''
  }
}

function removeTag(index: number) {
  model.value = model.value.filter((_, i) => i !== index)
}

function removeLastTag() {
  if (input.value === '' && model.value.length > 0) {
    removeTag(model.value.length - 1)
  }
}
</script>

<style scoped lang="sass">
label
  font-size: 0.8em
  color: var(--text-light)

.noo-tag-input
  display: flex
  flex-wrap: wrap
  gap: 0.5rem
  border: 1px solid var(--border-color)
  border-radius: var(--border-radius)
  padding: 0.5rem 0.8rem
  max-width: 100%
  overflow: auto

  &__tags
    display: flex
    flex-wrap: wrap
    gap: 0.5rem

    &--empty
      display: none

  &__tag
    background-color: var(--lila)
    color: var(--lightest)
    padding: 0.1em 2em 0.1em 0.5em
    border-radius: 0.25rem
    cursor: pointer
    position: relative
    font-size: 0.8em

    &__remove
      margin-left: 0.5rem
      font-weight: normal
      font-size: 1.8em
      line-height: 0
      position: absolute
      top: 50%
      right: 5px
      transform: translateY(-50%) rotate(45deg)
      color: var(--dark)
      cursor: pointer

      &:hover
        color: var(--lightest)

  input
    border: none
    padding: 0
    outline: none
    flex: 1
    color: var(--form-text-color)
    background-color: transparent
</style>
