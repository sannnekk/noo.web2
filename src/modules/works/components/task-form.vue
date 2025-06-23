<template>
  <div
    v-if="workDetailStore.task"
    :key="isReadonlyMode ? 'readonly' : 'editable'"
    class="task-form"
  >
    <noo-grid-layout>
      <noo-grid-layout-item
        :col="1"
        :row="1"
        :colspan="2"
        horizontal-align="stretch"
      >
        <noo-select-input
          v-model="workDetailStore.task.type"
          label="Тип задания"
          :options="taskTypes"
          :readonly="isReadonlyMode"
        />
      </noo-grid-layout-item>
      <noo-grid-layout-item
        :col="3"
        :row="1"
        :colspan="2"
        horizontal-align="stretch"
      >
        <noo-number-input
          v-model="workDetailStore.task.maxScore"
          label="Максимальный балл"
          :options="taskTypes"
          :readonly="isReadonlyMode"
        />
      </noo-grid-layout-item>
      <noo-grid-layout-item
        :col="5"
        :row="1"
        :colspan="2"
        horizontal-align="stretch"
      >
        <noo-if-animation>
          <noo-select-input
            v-if="canBeAutomaticallyChecked"
            v-model="workDetailStore.task.checkStrategy"
            label="Тип проверки"
            :options="taskCheckStrategies"
            :readonly="isReadonlyMode"
          />
        </noo-if-animation>
      </noo-grid-layout-item>
      <noo-grid-layout-item
        :col="1"
        :row="2"
        :colspan="2"
        horizontal-align="stretch"
      >
        <noo-if-animation>
          <noo-text-input
            v-if="canBeAutomaticallyChecked"
            v-model="workDetailStore.task.rightAnswer"
            label="Правильный ответ"
            :readonly="isReadonlyMode"
            :validators="[(value) => maxLength(value, 100)]"
          />
        </noo-if-animation>
      </noo-grid-layout-item>
      <noo-grid-layout-item
        :col="3"
        :row="2"
        :colspan="2"
      >
        <noo-if-animation>
          <noo-checkbox
            v-if="canBeAutomaticallyChecked"
            v-model="workDetailStore.task.showAnswerBeforeCheck"
            dimmed
            size="small"
            :readonly="isReadonlyMode"
          >
            Показывать ответ до проверки
          </noo-checkbox>
        </noo-if-animation>
      </noo-grid-layout-item>
      <noo-grid-layout-item
        :col="5"
        :row="1"
        :colspan="2"
      >
        <noo-if-animation>
          <noo-checkbox
            v-if="canBeAutomaticallyChecked"
            v-model="workDetailStore.task.checkOneByOne"
            dimmed
            size="small"
            :readonly="isReadonlyMode"
          >
            Проверка по одному
          </noo-checkbox>
        </noo-if-animation>
      </noo-grid-layout-item>
      <noo-grid-layout-item
        :col="5"
        :row="3"
        :colspan="6"
      >
        <noo-richtext-editor
          v-model="workDetailStore.task.content"
          label="Текст задания"
          :readonly="isReadonlyMode"
          :placeholder="
            isReadonlyMode ? 'Нет текста задания' : 'Введите текст задания'
          "
        />
      </noo-grid-layout-item>
      <noo-grid-layout-item
        :col="1"
        :row="4"
        :colspan="6"
      >
        <noo-richtext-editor
          v-model="workDetailStore.task.solveHint"
          label="Подсказка"
          :readonly="isReadonlyMode"
          :placeholder="
            isReadonlyMode ? 'Нет текста подсказки' : 'Введите текст подсказки'
          "
        />
      </noo-grid-layout-item>
      <noo-grid-layout-item
        :col="1"
        :row="5"
        :colspan="6"
      >
        <noo-richtext-editor
          v-model="workDetailStore.task.explanation"
          label="Объяснение"
          :readonly="isReadonlyMode"
          :placeholder="
            isReadonlyMode
              ? 'Нет текста объяснения'
              : 'Введите текст объяснения'
          "
        />
      </noo-grid-layout-item>
      <noo-grid-layout-item
        :col="1"
        :row="6"
        :colspan="6"
        horizontal-align="right"
      >
        <noo-button
          v-if="!isReadonlyMode"
          variant="danger"
          @click="workDetailStore.removeTask(workDetailStore.task?._key)"
        >
          Удалить задание
        </noo-button>
      </noo-grid-layout-item>
    </noo-grid-layout>
  </div>
  <div
    v-else
    class="task-form__empty"
  >
    <noo-text-block dimmed> Выберите задание из списка слева </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import { maxLength } from '@/core/validators/string.utils'
import { computed } from 'vue'
import type { WorkTaskCheckStrategy, WorkTaskType } from '../api/work.types'
import { useWorkDetailStore } from '../stores/work-detail.store'

const workDetailStore = useWorkDetailStore()

const isReadonlyMode = computed(() => workDetailStore.mode === 'view')

const canBeAutomaticallyChecked = computed(
  () => workDetailStore.task?.type === 'word'
)

const taskTypes: { label: string; value: WorkTaskType }[] = [
  { label: 'В одну строку', value: 'word' },
  { label: 'Открытый вопрос', value: 'text' },
  { label: 'Сочинение', value: 'essay' },
  { label: 'Итоговое сочинение', value: 'final-essay' }
]

const taskCheckStrategies: {
  label: string
  value: WorkTaskCheckStrategy
}[] = [
  { label: 'Вручную', value: 'manual' },
  { label: 'Точно совпадает или ноль', value: 'exact-match-or-zero' },
  {
    value: 'exact-match-with-wrong-character',
    label: 'Неверный символ минус балл'
  },
  { value: 'multiple-choice', label: 'Множественный выбор' },
  { value: 'sequence', label: 'Последовательность' }
]
</script>

<style scoped lang="sass"></style>
