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
    <noo-quill-component
      v-if="isDelta"
      v-model="deltaModel"
      :placeholder="placeholder"
      :readonly="readonly"
      :class="{ 'noo-richtext-editor__has-error': errors?.length }"
    />
    <noo-tiptap-component
      v-else
      v-model="tiptapModel"
      :placeholder="placeholder"
      :readonly="readonly"
      :class="{ 'noo-richtext-editor__has-error': errors?.length }"
      :media-category="mediaCategory"
    />
    <noo-input-error-list :errors="errors" />
  </div>
</template>

<script setup lang="ts">
import { richTextIsEmpty, type IRichText } from '@/core/utils/richtext.utils'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { Delta } from 'quill/core'
import { computed } from 'vue'
import type { MediaCategory } from '@/modules/media/api/media.types'

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

// tiptap is the default editor; quill is only used for existing delta content
const isDelta = computed(() => props.modelValue?.$type === 'delta')

const deltaModel = computed<Delta | null>({
  get: () => toDelta(props.modelValue),
  set: (value) => {
    emits(
      'update:modelValue',
      richTextIsEmpty(value as unknown as IRichText) ? null : toRichText(value)
    )
  }
})

const tiptapModel = computed<IRichText | null>({
  // the tiptap component already emits null for empty content
  get: () => props.modelValue ?? null,
  set: (value) => emits('update:modelValue', value)
})

function toRichText(delta: Delta | undefined | null): IRichText {
  return {
    ...(delta ?? new Delta()),
    $type: 'delta'
  }
}

function toDelta(richText: IRichText | undefined | null): Delta {
  // this editor wraps quill, which only understands delta content
  return richText?.$type === 'delta'
    ? new Delta(richText)
    : new Delta().insert('')
}
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

  &__has-error
    &:deep()
      .ql-container
        border-color: var(--danger)
</style>
