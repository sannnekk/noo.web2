<template>
  <noo-base-modal v-model:is-open="isOpenModel">
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
          v-if="changesCount > 0"
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
        <noo-collapsable-block
          v-if="
            workDetailStore.mode === 'edit' &&
            workDetailStore.workPatchGenerator &&
            changesCount > 0
          "
        >
          <template #collapsed>
            <noo-text-block>
              Внесённых изменений:
              {{ changesCount }}
            </noo-text-block>
          </template>
          <template #visible>
            <div class="save-work-changes-modal__content__patch-list">
              <noo-patch-list
                :patch="workDetailStore.workPatchGenerator.generate()"
                :original="workDetailStore.workPatchGenerator.getOriginal()"
                :path-labels="workPathLabels"
              />
            </div>
          </template>
        </noo-collapsable-block>
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
        v-if="changesCount > 0"
        variant="primary"
        @click="onSave()"
      >
        Сохранить
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { workPathLabels } from '../constants'
import { useWorkDetailStore } from '../stores/work-detail.store'

const isOpenModel = defineModel<boolean>('isOpen', {
  default: false
})

const workDetailStore = useWorkDetailStore()

const changesCount = ref(0)

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
