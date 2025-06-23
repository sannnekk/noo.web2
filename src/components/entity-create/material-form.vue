<template>
  <div class="material-form">
    <div class="material-form__title">
      <h3>{{ model.name }}</h3>
    </div>
    <div class="form-group">
      <form-input
        v-model="model.name"
        type="text"
        label="Название материала"
      />
    </div>
    <div class="form-group">
      <text-area
        v-model="model.description"
        label="Описание"
      />
    </div>
    <div class="form-group">
      <rich-text-area
        v-model="model.content"
        label="Содержание"
      />
    </div>
    <div class="form-group">
      <poll-select
        v-model="model.poll!"
        label="Прикрепленный опрос (необязательно)"
      />
    </div>
    <div class="row">
      <div class="col-md-6">
        <div class="form-group dimmed-checkbox">
          <form-checkbox
            v-model="isSchedulingEnabled"
            label="Запланировать публикацию"
          />
        </div>
      </div>
      <div class="col-md-6">
        <div
          v-auto-animate
          class="form-group dimmed-checkbox"
        >
          <form-input
            v-if="model.activateAt"
            v-model="model.activateAt"
            type="datetime-local"
            label="Дата публикации (МСК)"
          />
          <warning-block class="test-functionality">
            Функционал находится в режиме тестирования разработчиками
          </warning-block>
        </div>
      </div>
    </div>
    <div class="form-group">
      <file-input
        v-model="model.files"
        label="Файлы, прикрепленные к материалу"
        :max-count="20"
        :allowed-mime-types="['application/pdf', 'image/jpeg', 'image/png']"
        :max-file-size="100 * 1024 * 1024"
      />
    </div>
    <div
      v-if="subjectId"
      v-auto-animate
      class="form-group"
    >
      <h3>Прикрепить работу</h3>
      <div class="form-group">
        <work-select
          v-model="model.work!"
          :subject-id="subjectId"
          label="Прикрепленная работа (необязательно)"
        />
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="form-group dimmed-checkbox">
            <form-checkbox
              v-model="areDeadlinesSet"
              label="Установить дедлайны"
            />
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group dimmed-checkbox">
            <form-checkbox
              v-model="model.isWorkAvailable"
              label="Работа доступна для сдачи"
            />
          </div>
        </div>
      </div>
      <div
        v-if="areDeadlinesSet"
        class="row"
      >
        <div class="col-lg-6">
          <div class="form-group">
            <form-input
              v-model="model.workSolveDeadline!"
              type="date"
              label="Дедлайн сдачи"
            />
          </div>
        </div>
        <div class="col-lg-6">
          <div class="form-group">
            <form-input
              v-model="model.workCheckDeadline!"
              type="date"
              label="Дедлайн проверки"
            />
          </div>
        </div>
      </div>
    </div>
    <div
      v-else
      class="form-group subejct-not-selected"
    >
      <warning-block>
        Для прикрепления работы выберите предмет курса
      </warning-block>
    </div>
    <div class="form-group">
      <h3>Прикрепить видео из НОО.Tube</h3>
      <info-block>
        Рекомендуется использовать только для тестирования, так как этот
        функционал дает доступ ученикам к переходу на видео в НОО.Tube, который
        пока находится в режиме <beta-tag />.
      </info-block>
      <br>
      <nootube-select-input
        v-model="model.videos"
        :max-count="3"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Material } from '@/core/data/entities/Material'
import { computed, ref, watch } from 'vue'
import Date from '@/core/utils/date'
import type { Subject } from '@/core/data/entities/Subject'

interface Props {
  modelValue: Material
  subjectId?: Subject['id']
}

type Emits = (event: 'update:modelValue', value: Material) => void

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const model = computed({
  get: () => props.modelValue,
  set: (value: Material) => { emit('update:modelValue', value); }
})

const isSchedulingEnabled = computed({
  get: () => !!model.value.activateAt,
  set: (value: boolean) => {
    if (!value) {
      model.value.activateAt = null
    } else if (!model.value.activateAt) {
      model.value.activateAt = Date.tomorrow()
      model.value.isActive = false
    }
  }
})

const areDeadlinesSet = ref(false)

watch(areDeadlinesSet, setDeadlines)

if (model.value.workCheckDeadline || model.value.workCheckDeadline) {
  areDeadlinesSet.value = true
}

function setDeadlines(value: boolean) {
  if (!value) {
    model.value.workSolveDeadline = null
    model.value.workCheckDeadline = null
  } else if (!model.value.workCheckDeadline && !model.value.workCheckDeadline) {
    model.value.workSolveDeadline = Date.inDays(3)
    model.value.workCheckDeadline = Date.inDays(7)
  }
}
</script>

<style scoped lang="sass">
.form-group
	margin: 0.7em 0

	&.dimmed-checkbox
		&:deep()
			*
				color: var(--text-light)

			> *
				font-size: 0.9em

.test-functionality
	margin-top: 0.5em
	padding: 0.7em

	:deep()
		.warning-block__icon
			font-size: 2em

		.warning-block__text
			font-size: 0.9em
			color: var(--warning)
</style>
