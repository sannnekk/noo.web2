<template>
  <div class="autosave-block">
    <noo-text-block
      v-if="true"
      class="autosave-block__is-loading"
    >
      <noo-loader-icon contrast />
      Сохранение...
    </noo-text-block>
    <noo-text-block
      v-else-if="saveStatus.lastSavedAt"
      class="autosave-block__saved"
      size="small"
      dimmed
    >
      Последнее сохранение: {{ saveStatus.lastSavedAt }}
    </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAssignedWorkDetailStore } from '../stores/assigned-work-detail.store';

const assignedWorkDetailStore = useAssignedWorkDetailStore()
const saveStatus = computed(() => assignedWorkDetailStore.saveStatus)
</script>

<style scoped lang="sass">
.autosave-block
  &__is-loading
    display: flex
    align-items: center
    gap: 0.5rem
    margin-bottom: 0

  &__saved
    margin-bottom: 0
</style>
