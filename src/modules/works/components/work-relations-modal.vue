<template>
  <noo-base-modal
    v-if="props.workId"
    v-model:is-open="isOpen"
    close-on-esc
    close-on-outside-click
    full-width
  >
    <template #title>
      <noo-title
        :size="5"
        no-margin
      >
        Присвоенные материалы к работе
      </noo-title>
      <noo-title :size="3">
        {{ props.workTitle }}
      </noo-title>
    </template>
    <template #content>
      <noo-entity-table
        :columns="columns"
        :data="rows"
        :is-loading="relations.isLoading.value"
        :error="relations.error.value"
        :try-again="
          () => (props.workId ? relations.execute(props.workId) : undefined)
        "
      >
        <template #column-subject="{ item }">
          <noo-subject-block :subject="item.subject" />
        </template>
        <template #column-path="{ item }">
          <div class="work-relations-modal__path">
            <noo-title
              no-margin
              :size="4"
            >
              {{ item.path[0] ?? '-' }}
            </noo-title>
            <noo-text-block
              dimmed
              no-margin
            >
              <span
                v-for="(part, index) in item.path.slice(1)"
                :key="part"
                class="work-relations-modal__path__parts"
                :style="{ 'margin-left': `${index}em` }"
              >
                <noo-icon name="arrow-right" />
                {{ part }}
              </span>
            </noo-text-block>
          </div>
        </template>
        <template #column-isActive="{ item }">
          {{ item.isActive ? 'Да' : 'Нет' }}
        </template>
        <template #column-link="{ item }">
          <noo-inline-link
            size="small"
            :to="{
              name: 'courses.detail.material',
              params: { courseId: item.courseId, materialId: item.materialId }
            }"
          >
            Открыть материал
          </noo-inline-link>
        </template>
        <template #empty>
          <noo-text-block
            dimmed
            align="center"
          >
            Работа не присвоена ни к одному материалу
          </noo-text-block>
        </template>
      </noo-entity-table>
    </template>
    <template #actions="{ close }">
      <noo-button
        variant="secondary"
        @click="close()"
      >
        Закрыть
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import { useApiRequest } from '@/core/composables/useApiRequest'
import type { EntityTableColumnType } from '@/components/entity-table/entity-table-helpers'
import type { CourseWorkAssignmentEntity } from '@/modules/courses/api/course.types'
import type { SubjectEntity } from '@/modules/subjects/api/subject.types'
import { WorkService } from '../api/work.service'
import type { WorkEntity } from '../api/work.types'

interface Props {
  workId: WorkEntity['id'] | null
  workTitle: WorkEntity['title'] | null
}

const props = defineProps<Props>()

const isOpen = defineModel<boolean>('isOpen', {
  default: false
})

/**
 * A single row of the relations table: the assignment enriched with the
 * course it belongs to and the full path to the material inside the course tree.
 */
interface WorkRelationRow extends CourseWorkAssignmentEntity {
  courseId: string
  materialId: string
  subject: SubjectEntity | null
  path: string[]
}

const relations = useApiRequest(WorkService.getRelationsById)

watch(
  () => props.workId,
  async (workId) => {
    if (!workId) {
      return
    }

    await relations.execute(workId)
  },
  {
    immediate: true
  }
)

const rows = computed<WorkRelationRow[]>(() =>
  (relations.data.value ?? []).map((relation) => ({
    ...relation.assignment,
    courseId: relation.courseId,
    materialId: relation.materialId,
    subject: relation.subject,
    path: relation.path
  }))
)

const columns: EntityTableColumnType<WorkRelationRow>[] = [
  {
    key: 'subject',
    title: 'Предмет'
  },
  {
    key: 'path',
    title: 'Полный путь к материалу'
  },
  {
    key: 'isActive',
    title: 'Доступна для решения',
    width: '8em'
  },
  {
    key: 'link',
    title: '',
    disableLink: true
  }
]
</script>

<style scoped lang="sass">
.work-relations-modal
  &__path
    display: flex
    flex-direction: column

    &__parts
      display: block
</style>
