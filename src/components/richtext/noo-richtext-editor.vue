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
      v-model="model"
      :placeholder="placeholder"
      :readonly="readonly"
    />
  </div>
</template>

<script setup lang="ts">
import { richTextIsEmpty, type IRichText } from '@/core/utils/richtext.utils'
import { Delta } from 'quill/core'
import { computed } from 'vue'

interface Props {
  modelValue?: IRichText | null
  placeholder?: string
  readonly?: boolean
  label?: string
}

type Emits = (event: 'update:modelValue', value: IRichText | null) => void

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const model = computed<Delta | null>({
  get: () => toDelta(props.modelValue),
  set: (value) => {
    emits(
      'update:modelValue',
      richTextIsEmpty(value as unknown as IRichText) ? null : toRichText(value)
    )
  }
})

function toRichText(delta: Delta | undefined | null): IRichText {
  return {
    ...(delta ?? new Delta()),
    $type: 'delta'
  }
}

function toDelta(richText: IRichText | undefined | null): Delta {
  return richText ? new Delta(richText) : new Delta().insert('')
}
</script>

<style lang="sass" scoped>
.noo-richtext-editor
  width: 100%
  height: 100%

  &__label
    margin-bottom: 0.3em
</style>
