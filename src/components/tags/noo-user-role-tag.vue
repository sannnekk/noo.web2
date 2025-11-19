<template>
  <div
    class="noo-user-role-tag"
    :style="{ backgroundColor }"
  >
    <span class="noo-user-role-tag__text">
      {{ statusText }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import type { UserRole } from '@/core/api/endpoints/auth.types'
import { userRoles } from '@/modules/users/constants'
import { computed } from 'vue'

interface Props {
  role: UserRole
}

const props = defineProps<Props>()

const statusText = computed(
  () =>
    userRoles.find((t) => t.value === props.role)?.label ?? 'Неизвестная роль'
)

const backgroundColor = computed(() => {
  switch (props.role) {
    case 'student':
      return 'var(--text-light)'
    case 'mentor':
      return 'var(--warning)'
    case 'assistant':
      return 'var(--info)'
    case 'teacher':
      return 'var(--success)'
    case 'admin':
      return 'var(--danger)'
    default:
      return 'var(--text-light)'
  }
})
</script>

<style lang="sass" scoped>
.noo-user-role-tag
  display: inline-block
  font-weight: 500
  font-size: 0.9em
  color: #fff
  border-radius: var(--border-radius)
  padding: 0.1em 0.5em
</style>
