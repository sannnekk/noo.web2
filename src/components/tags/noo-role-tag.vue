<template>
  <noo-status-tag
    :type="userType"
    mode="background"
  >
    {{ userRole }}
  </noo-status-tag>
</template>

<script setup lang="ts">
import type { UserRole } from '@/core/api/endpoints/auth.types';
import { computed } from 'vue';

interface Props {
  role: UserRole
}

const props = defineProps<Props>()

const userRole = computed(() => {
  switch (props.role) {
    case 'admin':
      return 'Администратор'
    case 'teacher':
      return 'Преподаватель'
    case 'mentor':
      return 'Куратор'
    case 'assistant':
      return 'Ассистент'
    case 'student':
    default:
      return 'Ученик'
  }
})

const userType = computed(() => {
  switch (props.role) {
    case 'admin':
      return 'danger'
    case 'teacher':
      return 'warning'
    case 'mentor':
      return 'success'
    case 'assistant':
      return 'lila'
    case 'student':
    default:
      return 'info'
  }
})
</script>
