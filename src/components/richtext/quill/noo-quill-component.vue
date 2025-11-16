<template>
  <div
    class="noo-quill-component"
    :class="{ 'noo-quill-component--readonly': readonly }"
  >
    <quill-editor
      v-model:content="contentModel as unknown as any"
      :toolbar="readonly ? toolbar : undefined"
      :options="options"
      :placeholder="placeholder"
      content-type="delta"
    />
  </div>
</template>

<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { Delta, type QuillOptions } from 'quill/core'
import { computed } from 'vue'

interface Props {
  readonly?: boolean
  placeholder?: string
}

const props = defineProps<Props>()

const model = defineModel<Delta | null>('modelValue', {
  default: new Delta().insert('')
})

const contentModel = computed<Delta>({
  get: () => new Delta(model.value ?? undefined),
  set: (value: Delta) => (model.value = value)
})

const toolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote'],

  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }],

  [{ header: [1, 2, 3, false] }],

  [{ color: [] }, { background: [] }],
  [{ align: [] }],

  ['clean'],

  ['link', 'image', 'video']
]

const options = computed<QuillOptions>(() => ({
  modules: {},
  readOnly: props.readonly,
  theme: 'snow'
}))
</script>

<style lang="sass">
.noo-quill-component
  min-width: 100%

  &:not(&--readonly)
    background-color: var(--form-background)

  .ql-blank
    &:before
      color: var(--text-light)
      font-style: normal

  .ql-toolbar
    background-color: var(--light-background-color)
    border: none
    box-shadow: none
    margin-bottom: 0
    border-radius: var(--border-radius)
    display: flex
    align-items: stretch
    justify-content: flex-start
    padding: 0

    .ql-formats
      display: flex
      margin-right: 0
      height: 100%

      > button
        padding: 0.7em
        margin: 0
        width: unset
        height: unset

        &:hover
          background-color: var(--lightest)

        svg
          width: 1.5em
          height: 1.5em

        &.ql-active
          background-color: var(--primary)
          color: var(--lightest)

          .ql-stroke
            stroke: var(--form-text-color)

      .ql-picker
        height: 100%
        padding: 0.5em
        float: none
        margin: 0

        .ql-picker-label
          background: transparent
          height: 100%
          width: 100%
          display: block

        &:hover
          background-color: var(--lightest)

  .ql-container
    border-bottom-left-radius: var(--border-radius)
    border-bottom-right-radius: var(--border-radius)
    border: 1px solid var(--border-color)
    font-family: 'Montserrat', sans-serif
    font-size: 16px

  &--readonly
    .ql-blank
      &:before
        left: 0

    .ql-toolbar
      display: none

    .ql-editor
      padding: 0
      font-family: 'Montserrat', sans-serif
      font-size: 16px
      line-height: 1.5

    .ql-container
      border: none
      box-shadow: none
      background-color: transparent
</style>
