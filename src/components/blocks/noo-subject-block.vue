<template>
  <div class="noo-subject-block">
    <noo-color-badge :color="subject?.color" />
    <span class="noo-subject-block__name">{{ subject?.name ?? '-' }}</span>
  </div>
</template>

<script setup lang="ts">
import type { SubjectEntity } from '@/modules/subjects/api/subject.types'

interface Props {
  subject: SubjectEntity | null
}

defineProps<Props>()
</script>

<style scoped lang="sass">
.noo-subject-block
  display: block
  padding: 0.25em 0.5em 0.25em 0
  font-size: 1em
  font-weight: 500
  white-space: nowrap

  &__name
    margin-left: 0.5em
</style>
