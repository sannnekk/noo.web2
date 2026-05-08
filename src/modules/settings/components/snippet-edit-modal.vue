<template>
  <noo-base-modal
    v-model:is-open="openModel"
    full-width
    :close-on-outside-click="!isLoading"
    :close-on-esc="!isLoading"
  >
    <template #title>
      <noo-title :size="2">
        {{ isNew ? 'Новый сниппет' : 'Редактирование сниппета' }}
      </noo-title>
    </template>
    <template #content>
      <div class="snippet-edit-modal__form">
        <noo-text-input
          v-model="nameModel"
          label="Название"
          placeholder="Например: Шаблон комментария"
          :validators="[validateName]"
        />
        <noo-richtext-editor
          v-model="contentModel"
          label="Содержимое"
          placeholder="Текст сниппета"
        />
      </div>
    </template>
    <template #actions="{ close }">
      <noo-button
        variant="primary"
        :is-loading="isLoading"
        :disabled="!canSave"
        @click="$emit('save')"
      >
        Сохранить
      </noo-button>
      <noo-button
        variant="secondary"
        :disabled="isLoading"
        @click="close()"
      >
        Отмена
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script lang="ts" setup>
import { isStringOfLength } from '@/core/validators/string.utils'
import type { IRichText } from '@/core/utils/richtext.utils'
import { computed } from 'vue'

interface Props {
  name: string
  content: IRichText | null
  isNew: boolean
  hasChanges: boolean
  isLoading?: boolean
}

interface Emits {
  (e: 'update:name', value: string): void
  (e: 'update:content', value: IRichText | null): void
  (e: 'save'): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const openModel = defineModel<boolean>('isOpen', { default: false })

const nameModel = computed<string>({
  get: () => props.name,
  set: (value) => emits('update:name', value)
})

const contentModel = computed<IRichText | null>({
  get: () => props.content,
  set: (value) => emits('update:content', value)
})

const isNameValid = computed(() => validateName(props.name) === true)
const canSave = computed(
  () => !props.isLoading && props.hasChanges && isNameValid.value
)

function validateName(value: string) {
  return isStringOfLength(value, 1, 63)
}
</script>

<style lang="sass" scoped>
.snippet-edit-modal__form
  display: flex
  flex-direction: column
  gap: 1em
</style>
