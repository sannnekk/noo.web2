<template>
  <div
    v-if="store.draft"
    class="help-faq-editor"
  >
    <noo-text-input
      v-model="store.draft.question"
      label="Вопрос"
      placeholder="Например: Забыл пароль. Как войти?"
      :validators="[validateQuestion]"
    />

    <div class="help-faq-editor__answer">
      <label class="help-faq-editor__answer__label">Ответ</label>
      <noo-richtext-editor
        v-model="store.draft.answer"
        media-category="help-rich-text"
      />
    </div>

    <div class="help-faq-editor__meta">
      <noo-select-input
        v-model="store.draft.category"
        label="Раздел"
        :options="categoryOptions"
      />
      <noo-number-input
        v-model="store.draft.order"
        label="Порядок"
        :min="0"
        :max="255"
      />
    </div>
    <noo-text-block
      size="small"
      dimmed
      no-margin
    >
      Раздел добавляет под ответом ссылку на статьи по теме. Для общих вопросов
      оставьте «Без раздела».
    </noo-text-block>

    <noo-checkbox
      v-model="store.draft.isActive"
      dimmed
      size="small"
    >
      Вопрос виден на странице помощи
    </noo-checkbox>

    <div class="help-faq-editor__actions">
      <noo-button
        variant="primary"
        :is-loading="store.isSaving"
        :disabled="!canSave"
        @click="$emit('save')"
      >
        {{ store.mode === 'create' ? 'Создать' : 'Сохранить' }}
      </noo-button>
      <noo-button
        variant="inline"
        :disabled="store.isSaving"
        @click="$emit('cancel')"
      >
        Отменить
      </noo-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { richTextIsEmpty } from '@/core/utils/richtext.utils'
import { isStringOfLength } from '@/core/validators/string.utils'
import type { ValidationError } from '@/core/validators/validation-helpers.utils'
import { computed } from 'vue'
import type { SupportCategory } from '../api/support.types'
import { helpCategories } from '../content'
import { useHelpFaqStore } from '../stores/help-faq.store'

interface Emits {
  save: []
  cancel: []
}

defineEmits<Emits>()

/**
 * Edits the store's draft in place rather than through props: the draft is what
 * the patch generator observes, so an edit has to land on that object for the
 * save to see it. The same reason the article page binds to `store.article`.
 */
const store = useHelpFaqStore()

const categoryOptions = computed<
  { label: string; value: SupportCategory | null }[]
>(() => [
  { label: 'Без раздела', value: null },
  ...helpCategories.map(({ category, title }) => ({
    label: title,
    value: category
  }))
])

const canSave = computed(
  () =>
    !!store.draft &&
    !store.isSaving &&
    validateQuestion(store.draft.question) === true &&
    !richTextIsEmpty(store.draft.answer)
)

function validateQuestion(value: string): true | ValidationError[] {
  return isStringOfLength(value, 1, 255)
}
</script>

<style scoped lang="sass">
.help-faq-editor
  display: flex
  flex-direction: column
  gap: var(--space-2xs)
  padding: var(--space-s)
  border: 1px solid var(--border-color)
  border-radius: var(--border-radius)
  background-color: var(--form-background)

  &__answer
    display: flex
    flex-direction: column
    gap: 0.3em

    &__label
      font-size: 0.8em
      color: var(--text-light)

  &__meta
    display: grid
    grid-template-columns: 2fr 1fr
    gap: var(--space-s)
    align-items: start

    +mobile
      grid-template-columns: 1fr

  &__actions
    display: flex
    flex-wrap: wrap
    align-items: center
    gap: 0.75em
    margin-top: var(--space-2xs)
</style>
