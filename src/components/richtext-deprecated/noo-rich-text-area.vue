<template>
  <div class="rich-text-area">
    <label>{{ label }}</label>
    <div class="rich-text-area__inner">
      <quill-editor
        v-model="model"
        :font-size="userSettingsStore.fontSize"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DeltaContentType } from '@/types/richtext/DeltaContentType'
import { computed } from 'vue'
import { Core } from '@/core/Core'

interface Props {
  modelValue: DeltaContentType
  label?: string
}

type Emits = (e: 'update:modelValue', value: DeltaContentType) => void

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const userSettingsService = Core.Services.UserSettings
const userSettingsStore = userSettingsService.Store()

const model = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
</script>

<style scoped lang="sass">
.rich-text-area
  label
    font-size: 0.8em
    color: var(--text-light)

  &__inner
    border: 1px solid var(--border-color)
    border-radius: var(--border-radius)
</style>
