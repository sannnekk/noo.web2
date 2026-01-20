<template>
  <noo-base-modal
    v-model:is-open="isOpenModel"
    :full-width="showChanges"
  >
    <template #title>
      <noo-title :size="2">
        {{
          workDetailStore.mode === 'create'
            ? 'Сохранить работу'
            : 'Сохранить изменения'
        }}
      </noo-title>
    </template>
    <template #content>
      <div class="save-work-changes-modal__content">
        <noo-text-block
          v-if="hasChanges"
          dimmed
        >
          {{
            workDetailStore.mode === 'create'
              ? 'Вы уверены, что хотите сохранить работу?'
              : 'Вы хотите сохранить внесённые изменения в работу?'
          }}
        </noo-text-block>
        <noo-text-block
          v-else
          dimmed
        >
          Нет внесённых изменений.
        </noo-text-block>
        <noo-collapsable-block v-if="showChanges">
          <template #collapsed>
            <noo-text-block>
              Внесённых изменений:
              {{ changesCount }}
            </noo-text-block>
          </template>
          <template #visible>
            <work-patch-list
              :patch="workDetailStore.workPatchGenerator!.generate()"
              :original="workDetailStore.workPatchGenerator!.getOriginal()"
            />
          </template>
        </noo-collapsable-block>
        <noo-error-block
          v-if="workDetailStore.workValidationState.isValid === false"
          no-margin
        >
          Не все поля работы заполнены корректно. Пожалуйста, исправьте ошибки:
          <ul>
            <li
              v-for="(
                error, index
              ) in workDetailStore.workValidationState.errors.slice(0, 5)"
              :key="index"
            >
              {{ error }}
            </li>
            <li v-if="workDetailStore.workValidationState.errors.length > 5">
              И ещё
              {{ workDetailStore.workValidationState.errors.length - 5 }}
              ошибка...
            </li>
          </ul>
        </noo-error-block>
      </div>
    </template>
    <template #actions>
      <noo-button
        variant="secondary"
        @click="isOpenModel = false"
      >
        Отмена
      </noo-button>
      <noo-button
        variant="primary"
        :disabled="
          !hasChanges || workDetailStore.workValidationState.isValid === false
        "
        @click="onSave()"
      >
        Сохранить
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useWorkDetailStore } from '../stores/work-detail.store'
import workPatchList from './work-patch-list.vue'

const isOpenModel = defineModel<boolean>('isOpen', {
  default: false
})

const workDetailStore = useWorkDetailStore()

const changesCount = ref(0)

const hasChanges = computed(() => changesCount.value > 0)

const showChanges = computed(
  () =>
    workDetailStore.mode === 'edit' &&
    changesCount.value > 0 &&
    workDetailStore.workValidationState.isValid
)

watch(isOpenModel, () => {
  changesCount.value = workDetailStore.workPatchGenerator?.countChanges() ?? 0
})

function onSave(): void {
  isOpenModel.value = false
  workDetailStore.save()
}
</script>

<style scoped lang="sass">
.save-work-changes-modal
  &__content
    padding-bottom: 1em

    &__patch-list
      max-height: 300px
      overflow-y: auto

      //
</style>
