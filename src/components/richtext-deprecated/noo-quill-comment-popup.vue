<template>
  <div
    v-if="model?.visible.popup"
    class="comment-popup"
    :style="{
      top: `${model.popupPosition ? model.popupPosition.y : model.y + 15}px`,
      left: `${model.popupPosition ? model.popupPosition.x : model.x}px`
    }"
  >
    <div
      v-if="model.visible"
      class="comment-popup__inner"
    >
      <div class="comment-popup__label">
        <label>Комментарий</label>
      </div>
      <div class="comment-popup__field">
        <textarea
          v-model="model.content"
          type="text"
          @keypress.prevent.enter="onSubmit()"
        />
      </div>
      <div class="comment-popup__toggle">
        <horizontal-selection
          v-if="commentTypes"
          v-model="model.type"
          :options="commentTypes"
        />
        <form-toggle
          v-else
          v-model="model.type"
          :values="types"
        />
      </div>
      <div class="comment-popup__actions">
        <button
          class="comment-popup__actions__ok"
          @click="onSubmit()"
        >
          Ок
        </button>
        <button
          class="comment-popup__actions__cancel"
          @click="model.visible.popup = false"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { Comment } from './CommentBlot'
import type { ImageComment } from './ImageCommentBlot'

interface Props {
  modelValue: (Comment & ImageComment) & {
    x: number
    y: number
    visible: {
      modal?: boolean
      popup?: boolean
    }
    popupPosition?: {
      x: number
      y: number
    }
  }
  commentTypes?: string[]
}

interface Emits {
  (e: 'update:modelValue', value: Props['modelValue']): void
  (e: 'submit'): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const types: [
  {
    value: Comment['type']
    label: string
  },
  {
    value: Comment['type']
    label: string
  }
] = [
  {
    value: 'logic-error',
    label: 'Логическая ошибка'
  },
  {
    value: 'fact-error',
    label: 'Фактическая ошибка'
  }
]

const model = computed({
  get: () => props.modelValue,
  set: (value) => { emits('update:modelValue', value); }
})

watch(
  model,
  () => {
    if (
      props.commentTypes?.length &&
      !props.commentTypes.includes(model.value.type)
    ) {
      model.value.type = props.commentTypes[0]
    }
  },
  { deep: true, immediate: true }
)

function onSubmit() {
  model.value.visible.popup = false
  emits('submit')
}
</script>

<style scoped lang="sass">
.comment-popup
  position: absolute
  z-index: 1000
  width: min(90%, 400px)
  background-color: var(--form-background)
  border: 1px solid var(--border-color)
  border-radius: var(--border-radius)
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5)
  transition: top ease 0.3s, left ease 0.3s

  &__inner
    padding: 0.5em

  &__label
    font-size: 0.9em

  &__field
    textarea
      width: 100%
      min-height: 5em
      padding: 0.5em
      resize: vertical
      border: 1px solid var(--border-color)
      border-radius: var(--border-radius)
      background: var(--form-background)
      color: var(--form-text-color)

      &:focus
        outline: none
        border-color: var(--primary)

  &__toggle
    font-size: 0.8em
    margin-bottom: 0.5em

  &__actions
    display: flex
    justify-content: flex-end
    gap: 0.5em

    &__ok, &__cancel
      border: 1px solid transparent
      border-radius: var(--border-radius)
      cursor: pointer
      font-size: 0.9em
      padding: 0.25em 0.5em

    &__ok
      border-color: var(--secondary)
      background-color: var(--secondary)
      color: var(--form-text-color)

      &:hover
        background-color: transparent
        color: var(--form-text-color)

    &__cancel
      border-color: var(--dark)
      background-color: var(--dark)
      color: var(--white)

      &:hover
        background-color: var(--border-color)
        color: var(--dark)
</style>
