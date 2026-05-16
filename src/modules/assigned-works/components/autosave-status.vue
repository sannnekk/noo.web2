<template>
  <div class="autosave-block">
    <noo-text-block
      v-if="saveStatus.isLoading"
      class="autosave-block__is-loading"
      size="small"
      dimmed
    >
      <noo-loader-icon contrast />
      Сохранение...
    </noo-text-block>
    <noo-text-block
      v-else-if="saveStatus.hasError"
      class="autosave-block__error"
      size="small"
    >
      Не удалось сохранить. Изменения сохранятся при следующем редактировании.
    </noo-text-block>
    <noo-text-block
      v-else-if="lastSavedAtLabel"
      class="autosave-block__saved"
      size="small"
      dimmed
    >
      Последнее сохранение: {{ lastSavedAtLabel }}
    </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import { DateHelpers } from '@/core/utils/dates'
import { computed } from 'vue'
import { useAssignedWorkDetailStore } from '../stores/assigned-work-detail.store'

const assignedWorkDetailStore = useAssignedWorkDetailStore()
const saveStatus = computed(() => assignedWorkDetailStore.saveStatus)

const lastSavedAtLabel = computed(() => {
  const value = saveStatus.value.lastSavedAt

  if (!value) {
    return null
  }

  return DateHelpers.formatDate(value, { includeTime: true })
})
</script>

<style scoped lang="sass">
.autosave-block
  &__is-loading
    display: flex
    align-items: center
    gap: 0.5rem
    margin-bottom: 0

  &__saved,
  &__error
    margin-bottom: 0
</style>
