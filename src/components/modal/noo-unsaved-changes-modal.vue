<template>
  <noo-base-modal
    v-model:is-open="isOpenModel"
    :full-width="hasChangeList"
  >
    <template #title>
      <noo-title :size="3"> Несохранённые изменения </noo-title>
    </template>
    <template #content>
      <div class="noo-unsaved-changes-modal__content">
        <noo-text-block
          dimmed
          no-margin
        >
          У вас есть несохранённые изменения. Если вы продолжите, они будут
          потеряны.
        </noo-text-block>

        <noo-collapsable-block v-if="hasChangeList">
          <template #collapsed>
            <noo-text-block no-margin>
              Внесённых изменений: {{ changesCount }}
            </noo-text-block>
          </template>
          <template #visible>
            <slot name="changes" />
          </template>
        </noo-collapsable-block>
      </div>
    </template>
    <template #actions>
      <noo-button
        variant="secondary"
        @click="emits('decide', 'stay')"
      >
        Отмена
      </noo-button>
      <noo-button
        variant="secondary"
        @click="emits('decide', 'discard')"
      >
        Не сохранять
      </noo-button>
      <noo-button
        v-if="canSave"
        variant="primary"
        @click="emits('decide', 'save')"
      >
        Сохранить
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script setup lang="ts">
import type { UnsavedChangesDecision } from '@/core/composables/useUnsavedChangesGuard'
import { computed, watch, type VNode } from 'vue'

interface Slots {
  /**
   * The changes themselves, spelled out. Pages that can show what is pending —
   * a patch list, say — fill it in; the rest just get the warning.
   */
  changes?: () => VNode | VNode[] | null
}

interface Props {
  /**
   * Whether saving is possible from where the page stands. A page that cannot
   * save right now only offers to keep or drop the changes.
   */
  canSave?: boolean
  /**
   * How many changes are pending, shown above the `changes` slot. Only means
   * anything together with it.
   */
  changesCount?: number
}

type Emits = (e: 'decide', decision: UnsavedChangesDecision) => void

const props = defineProps<Props>()
const emits = defineEmits<Emits>()
const slots = defineSlots<Slots>()

const isOpenModel = defineModel<boolean>('isOpen', { default: false })

const hasChangeList = computed(
  () => !!slots.changes && (props.changesCount ?? 0) > 0
)

// Dismissing the modal with Esc or a click outside says nothing beyond "not
// now", so every way out of it that is not one of the actions keeps the changes
// and calls off whatever was waiting on the answer.
watch(isOpenModel, (isOpen) => {
  if (!isOpen) {
    emits('decide', 'stay')
  }
})
</script>

<style scoped lang="sass">
.noo-unsaved-changes-modal
  &__content
    display: flex
    flex-direction: column
    gap: 0.6em
</style>
