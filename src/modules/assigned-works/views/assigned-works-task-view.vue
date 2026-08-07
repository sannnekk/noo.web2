<template>
  <div
    v-if="task"
    class="assigned-works-task-view"
  >
    <task-statement-block :task="task">
      <template
        v-if="canSaveTask"
        #actions
      >
        <save-task-button
          :task-id="task.id"
          :assigned-work-id="assignedWorkId!"
        />
      </template>
    </task-statement-block>

    <task-answer-block
      v-if="answer && layout.answer !== 'hidden'"
      :task="task"
      :answer="answer"
      :title="answerTitle"
      :readonly="layout.answer === 'readonly'"
      @update="updateAnswer"
    >
      <!-- The score belongs to the answer, so it is shown as its footer rather
           than as a block of its own. The layout never asks for a score without
           the answer it scores — see `resolveTaskViewLayout()`. -->
      <template
        v-if="layout.score !== 'hidden'"
        #footer
      >
        <task-score-block
          v-model:score="scoreModel"
          :max-score="task.maxScore"
          :is-checked="isAnswerChecked"
          :readonly="layout.score === 'readonly'"
        />
      </template>
    </task-answer-block>

    <task-mentor-comment-block
      v-if="layout.mentorComment !== 'hidden'"
      v-model:comment="mentorCommentModel"
      :readonly="layout.mentorComment === 'readonly'"
    />

    <div class="assigned-works-task-view__hints">
      <task-hint-block
        title="Подсказка"
        :content="task.solveHint"
        :presentation="layout.solveHint"
      />
      <task-hint-block
        title="Объяснение"
        :content="task.explanation"
        :presentation="layout.explanation"
      />
    </div>
  </div>
  <div
    v-else
    class="assigned-works-task-view__not-found"
  >
    <noo-text-block dimmed> Задание не найдено </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import type { IRichText } from '@/core/utils/richtext.utils'
import saveTaskButton from '@/modules/task-cards/components/save-task-button.vue'
import {
  TaskCardsPermissions,
  useTaskCardsPermissions
} from '@/modules/task-cards/permissions'
import { computed } from 'vue'
import taskAnswerBlock from '../components/task-view/task-answer-block.vue'
import taskHintBlock from '../components/task-view/task-hint-block.vue'
import taskMentorCommentBlock from '../components/task-view/task-mentor-comment-block.vue'
import taskScoreBlock from '../components/task-view/task-score-block.vue'
import taskStatementBlock from '../components/task-view/task-statement-block.vue'
import { useAssignedWorkDetailStore } from '../stores/assigned-work-detail.store'
import { resolveTaskViewLayout } from '../task-view.utils'
import type { AssignedWorkViewMode, PossiblyUnsavedAnswer } from '../types'

export interface AssignedWorksTaskViewProps {
  taskId: string
  mode: AssignedWorkViewMode
}

const props = defineProps<AssignedWorksTaskViewProps>()

const assignedWorkDetailStore = useAssignedWorkDetailStore()

const { can } = useTaskCardsPermissions()

const task = computed(() => assignedWorkDetailStore.getTask(props.taskId))
const answer = computed<PossiblyUnsavedAnswer | undefined>(
  () => assignedWorkDetailStore.answers[props.taskId]
)

const layout = computed(() =>
  resolveTaskViewLayout({
    mode: props.mode,
    answerStatus: answer.value?.status ?? 'not-submitted'
  })
)

const isAnswerChecked = computed(() => answer.value?.status === 'checked')

const assignedWorkId = computed(() => assignedWorkDetailStore.assignedWork?.id)

// A task is only worth putting aside once the student has seen it checked, so
// the button waits for the whole work to be checked.
const canSaveTask = computed(
  () =>
    can(TaskCardsPermissions.saveTask) &&
    assignedWorkDetailStore.workIsChecked &&
    Boolean(assignedWorkId.value)
)

const answerTitle = computed(() =>
  props.mode === 'check' ? 'Ответ ученика' : 'Ответ'
)

function updateAnswer(patch: Partial<PossiblyUnsavedAnswer>): void {
  assignedWorkDetailStore.updateAnswer(props.taskId, patch)
}

const scoreModel = computed<number | null>({
  get: () => answer.value?.score ?? null,
  set: (score) => updateAnswer({ score })
})

const mentorCommentModel = computed<IRichText | null>({
  get: () => answer.value?.mentorComment ?? null,
  set: (mentorComment) => updateAnswer({ mentorComment })
})
</script>

<style scoped lang="sass">
.assigned-works-task-view
  display: flex
  flex-direction: column
  gap: var(--space-2xs)

  &__hints
    display: flex
    flex-direction: column
    gap: var(--space-3xs)
    margin-top: var(--space-3xs)

  &__not-found
    padding-block: var(--space-s)
</style>
