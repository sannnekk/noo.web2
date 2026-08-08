<template>
  <div class="user-history-details">
    <noo-inline-link
      v-if="courseLink"
      :to="courseLink"
      size="small"
    >
      {{ payload!.courseName || 'Курс' }}
    </noo-inline-link>
    <noo-inline-link
      v-else-if="assignedWorkLink"
      :to="assignedWorkLink"
      size="small"
    >
      {{ payload!.workTitle || 'Работа' }}
    </noo-inline-link>
    <noo-inline-link
      v-else-if="mentorLink"
      :to="mentorLink"
      size="small"
    >
      {{ payload!.mentorName || 'Куратор' }}
    </noo-inline-link>
    <noo-text-block
      v-else-if="text"
      dimmed
      size="small"
      no-margin
    >
      {{ text }}
    </noo-text-block>
    <noo-text-block
      v-else
      dimmed
      size="small"
      no-margin
    >
      —
    </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserHistoryEntity } from '../api/user-history.types'
import { userRoles } from '../constants'

interface Props {
  item: UserHistoryEntity
}

const props = defineProps<Props>()

const payload = computed(() => props.item.payload)

const courseLink = computed(() => {
  if (
    props.item.type !== 'added-to-course' &&
    props.item.type !== 'removed-from-course'
  ) {
    return null
  }

  const courseId = payload.value?.courseId

  return courseId ? { name: 'courses.detail', params: { courseId } } : null
})

const assignedWorkLink = computed(() => {
  if (!props.item.type.startsWith('work-')) {
    return null
  }

  const assignedWorkId = payload.value?.assignedWorkId

  return assignedWorkId
    ? { name: 'assigned-works.detail', params: { assignedWorkId } }
    : null
})

const mentorLink = computed(() => {
  if (
    props.item.type !== 'mentor-assigned' &&
    props.item.type !== 'mentor-unassigned'
  ) {
    return null
  }

  const mentorId = payload.value?.mentorId

  return mentorId
    ? { name: 'users.detail', params: { userId: mentorId } }
    : null
})

function roleLabel(role: string | undefined): string {
  return userRoles.find((entry) => entry.value === role)?.label ?? role ?? '—'
}

/** Everything that reads as a sentence rather than a link to somewhere. */
const text = computed(() => {
  switch (props.item.type) {
    case 'role-changed':
      return `${roleLabel(payload.value?.oldRole)} → ${roleLabel(payload.value?.newRole)}`
    case 'registered':
      return roleLabel(payload.value?.role)
    case 'email-changed':
      return `${payload.value?.oldEmail ?? ''} → ${payload.value?.newEmail ?? ''}`
    case 'profile-updated':
      return payload.value?.fields ?? null
    default:
      return null
  }
})
</script>

<style scoped lang="sass">
.user-history-details
  display: inline-block
</style>
