<template>
  <div class="save-work-changes-modal__content__patch-list">
    <noo-patch-list
      :patch="patch"
      :original="original"
      :path-labels="workPathLabels"
    >
      <template #path--tasks-any="{ op, side }">
        <noo-text-block>
          {{ formatTaskOperation(op as string, side as SlotSide) }}
        </noo-text-block>
      </template>
      <template #path--subjectId="{ value }">
        <noo-subject-select
          :subject-id="(value as string | null) ?? null"
          label=""
          readonly
        />
      </template>
      <template #path--type="{ value }">
        <noo-work-type-select
          :model-value="(value as string | null) ?? null"
          label=""
          readonly
        />
      </template>
      <template #path--tasks-any-type="{ value }">
        <noo-select-input
          :model-value="(value as string | null) ?? null"
          :options="taskTypes"
          label=""
          readonly
        />
      </template>
      <template #path--tasks-any-checkStrategy="{ value }">
        <noo-select-input
          :model-value="(value as string | null) ?? null"
          :options="taskCheckStrategies"
          label=""
          readonly
        />
      </template>
      <template #path--tasks-any-rightAnswers="{ value }">
        <noo-text-tag-input
          :model-value="toRightAnswersModel(value)"
          label=""
          readonly
        />
      </template>
      <template #path--tasks-any-showAnswerBeforeCheck="{ value }">
        <noo-text-block>
          {{ formatBoolean(value) }}
        </noo-text-block>
      </template>
      <template #path--tasks-any-checkOneByOne="{ value }">
        <noo-text-block>
          {{ formatBoolean(value) }}
        </noo-text-block>
      </template>
      <template #path--tasks-any-content>
        <noo-text-block>Текст обновлён</noo-text-block>
      </template>
      <template #path--tasks-any-solveHint>
        <noo-text-block>Подсказка обновлена</noo-text-block>
      </template>
      <template #path--tasks-any-explanation>
        <noo-text-block>Пояснение обновлено</noo-text-block>
      </template>
    </noo-patch-list>
  </div>
</template>

<script setup lang="ts">
import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import { taskCheckStrategies, taskTypes, workPathLabels } from '../constants'
import type { PossiblyUnsavedWork } from '../types'

type SlotSide = 'prev' | 'now'

interface Props {
  patch: JsonPatchDocument<PossiblyUnsavedWork>
  original: PossiblyUnsavedWork
}

defineProps<Props>()

function formatTaskOperation(operation: string, side: SlotSide): string {
  if (operation === 'add') {
    return side === 'now' ? 'Задание добавлено' : '—'
  }

  if (operation === 'remove') {
    return side === 'prev' ? 'Задание удалено' : '—'
  }

  return 'Задание изменено'
}

function toRightAnswersModel(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string')
}

function formatBoolean(value: unknown): string {
  if (typeof value !== 'boolean') {
    return '—'
  }

  return value ? 'Да' : 'Нет'
}
</script>
