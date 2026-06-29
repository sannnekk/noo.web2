<template>
  <div class="save-course-changes-modal__content__patch-list">
    <noo-patch-list
      :patch="patchForList"
      :original="originalForList"
      :path-labels="coursePathLabels"
      :normalize-value="normalizeCoursePatch"
    >
      <template #path--subjectId="{ value }">
        <noo-subject-select
          :subject-id="(value as string | null) ?? null"
          label=""
          readonly
        />
      </template>

      <template #path--startDate="{ value }">
        <noo-text-block>
          <noo-date
            v-if="isDateValue(value)"
            :value="value as DateValue"
          />
          <span v-else>Не указана</span>
        </noo-text-block>
      </template>

      <template #path--endDate="{ value }">
        <noo-text-block>
          <noo-date
            v-if="isDateValue(value)"
            :value="value as DateValue"
          />
          <span v-else>Не указана</span>
        </noo-text-block>
      </template>

      <template #path--chapters="{ op, side }">
        <noo-text-block>
          {{
            formatEntityOperation(
              op as string,
              side as SlotSide,
              'Глава добавлена',
              'Глава удалена',
              'Структура глав обновлена'
            )
          }}
        </noo-text-block>
      </template>

      <template #path--chapters-any="{ op, side }">
        <noo-text-block>
          {{
            formatEntityOperation(
              op as string,
              side as SlotSide,
              'Глава добавлена',
              'Глава удалена',
              'Глава обновлена'
            )
          }}
        </noo-text-block>
      </template>

      <template #path--chapters-any-parentChapterId="{ value }">
        <noo-text-block>
          {{ value ? 'Вложенная глава' : 'Глава верхнего уровня' }}
        </noo-text-block>
      </template>

      <template #path--chapters-any-materials="{ op, side }">
        <noo-text-block>
          {{
            formatEntityOperation(
              op as string,
              side as SlotSide,
              'Материал добавлен',
              'Материал удален',
              'Список материалов обновлен'
            )
          }}
        </noo-text-block>
      </template>

      <template #path--chapters-any-materials-any="{ op, side }">
        <noo-text-block>
          {{
            formatEntityOperation(
              op as string,
              side as SlotSide,
              'Материал добавлен',
              'Материал удален',
              'Материал обновлен'
            )
          }}
        </noo-text-block>
      </template>

      <template #path--chapters-any-isActive="{ value }">
        <noo-text-block>
          {{ formatBoolean(value) }}
        </noo-text-block>
      </template>

      <template #path--chapters-any-publishAt="{ value }">
        <noo-text-block>
          <noo-date
            v-if="isDateValue(value)"
            :value="value as DateValue"
          />
          <span v-else>Не запланировано</span>
        </noo-text-block>
      </template>

      <template #path--chapters-any-materials-any-isActive="{ value }">
        <noo-text-block>
          {{ formatBoolean(value) }}
        </noo-text-block>
      </template>

      <template #path--chapters-any-materials-any-publishAt="{ value }">
        <noo-text-block>
          <noo-date
            v-if="isDateValue(value)"
            :value="value as DateValue"
          />
          <span v-else>Не запланировано</span>
        </noo-text-block>
      </template>
    </noo-patch-list>
  </div>
</template>

<script setup lang="ts">
import type {
  LabelContext,
  LabelMap
} from '@/components/utils/noo-patch-list.types'
import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import { computed } from 'vue'
import type { PossiblyUnsavedCourse } from '../../types'
import { normalizeCoursePatch } from '../../utils'

type SlotSide = 'prev' | 'now'
type DateValue = string | Date
type PatchListTarget = Record<string, unknown>
type PatchLabelContext = LabelContext<PatchListTarget, unknown, unknown>

interface Props {
  patch: JsonPatchDocument<PossiblyUnsavedCourse>
  original: PossiblyUnsavedCourse
}

const props = defineProps<Props>()

const patchForList = computed(
  () => props.patch as unknown as JsonPatchDocument<PatchListTarget>
)
const originalForList = computed(
  () => props.original as unknown as PatchListTarget
)

const coursePathLabels: LabelMap<PatchListTarget> = {
  '/name': 'Название курса',
  '/description': 'Описание курса',
  '/subjectId': 'Предмет',
  '/startDate': 'Дата начала',
  '/endDate': 'Дата окончания',
  '/chapters': 'Главы курса',
  '/chapters/*': (ctx: PatchLabelContext) =>
    `Глава «${getTitle(ctx.value, 'Без названия')}»`,
  '/chapters/*/title': (ctx: PatchLabelContext) =>
    `Название главы «${getTitle(ctx.entity)}»`,
  '/chapters/*/isActive': (ctx: PatchLabelContext) =>
    `Активность главы «${getTitle(ctx.entity)}»`,
  '/chapters/*/publishAt': (ctx: PatchLabelContext) =>
    `Дата публикации главы «${getTitle(ctx.entity)}»`,
  '/chapters/*/parentChapterId': (ctx: PatchLabelContext) =>
    `Расположение главы «${getTitle(ctx.entity)}»`,
  '/chapters/*/materials': (ctx: PatchLabelContext) =>
    `Материалы главы «${getTitle(ctx.entity)}»`,
  '/chapters/*/materials/*': (ctx: PatchLabelContext) =>
    `Материал «${getTitle(ctx.value, 'Без названия')}»`,
  '/chapters/*/materials/*/title': (ctx: PatchLabelContext) =>
    `Название материала «${getTitle(ctx.entity)}»`,
  '/chapters/*/materials/*/isActive': (ctx: PatchLabelContext) =>
    `Активность материала «${getTitle(ctx.entity)}»`,
  '/chapters/*/materials/*/publishAt': (ctx: PatchLabelContext) =>
    `Дата публикации материала «${getTitle(ctx.entity)}»`
}

function formatEntityOperation(
  operation: string,
  side: SlotSide,
  addedText: string,
  removedText: string,
  changedText: string
): string {
  if (operation === 'add') {
    return side === 'now' ? addedText : '—'
  }

  if (operation === 'remove') {
    return side === 'prev' ? removedText : '—'
  }

  return changedText
}

function formatBoolean(value: unknown): string {
  if (typeof value !== 'boolean') {
    return '—'
  }

  return value ? 'Да' : 'Нет'
}

function isDateValue(value: unknown): value is DateValue {
  return typeof value === 'string' || value instanceof Date
}

function getTitle(value: unknown, fallback = 'Без названия'): string {
  if (!value || typeof value !== 'object') {
    return fallback
  }

  const title = (value as Record<string, unknown>).title

  if (typeof title === 'string' && title.trim().length > 0) {
    return title
  }

  return fallback
}
</script>

<style scoped lang="sass">
.save-course-changes-modal__content__patch-list
  max-height: 300px
  overflow-y: auto
</style>
