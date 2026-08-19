<template>
  <div class="noo-richtext-editor">
    <noo-text-block
      v-if="label"
      class="noo-richtext-editor__label"
      dimmed
      size="small"
    >
      {{ label }}
    </noo-text-block>
    <!-- One editor today. A second format would branch here on the value's
         `$type`, the way the stored discriminator is meant to be used. -->
    <noo-tiptap-component
      ref="tiptap"
      v-model="model"
      :placeholder="placeholder"
      :readonly="readonly"
      :class="{ 'noo-richtext-editor__has-error': errors?.length }"
      :media-category="mediaCategory"
    />
    <noo-input-error-list :errors="errors" />
  </div>
</template>

<script setup lang="ts">
import type { IRichText } from '@/core/utils/richtext.utils'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { computed, useTemplateRef } from 'vue'
import type { MediaCategory } from '@/modules/media/api/media.types'
import type NooTiptapComponent from './tiptap/noo-tiptap-component.vue'

interface Props {
  modelValue?: IRichText | null
  placeholder?: string
  readonly?: boolean
  label?: string
  mediaCategory?: MediaCategory
  errors?: ValidationError[]
}

type Emits = (event: 'update:modelValue', value: IRichText | null) => void

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const model = computed<IRichText | null>({
  // the tiptap component already emits null for empty content
  get: () => props.modelValue ?? null,
  set: (value) => emits('update:modelValue', value)
})

const tiptap = useTemplateRef<InstanceType<typeof NooTiptapComponent>>('tiptap')

defineExpose({
  insertRichText: (value: IRichText | null | undefined) =>
    tiptap.value?.insertRichText(value)
})
</script>

<style lang="sass" scoped>
.noo-richtext-editor
  width: 100%
  height: 100%

  &__label
    margin-bottom: 0.3em

  &__error
    font-size: 0.8rem
    color: var(--danger)
</style>
