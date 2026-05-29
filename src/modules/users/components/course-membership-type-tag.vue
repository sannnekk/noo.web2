<template>
  <div
    class="course-membership-type-tag"
    :class="`course-membership-type-tag--${props.type}`"
  >
    {{ label }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { courseMembershipTypes } from '@/modules/courses/constants'
import { type CourseMembershipEntity } from '@/modules/courses/api/course.types'

interface Props {
  type: CourseMembershipEntity['type']
}

const props = defineProps<Props>()

const label = computed(() => {
  return (
    courseMembershipTypes.find((entry) => entry.value === props.type)?.label ??
    props.type
  )
})
</script>

<style lang="sass" scoped>
.course-membership-type-tag
  font-size: 0.75em
  padding: 0.15em 0.5em
  border-radius: var(--border-radius)
  white-space: nowrap
  display: inline-block
  font-weight: bold

  &--manual-assigned
    background-color: var(--warning)
    color: #000

  &--external-assigned
    background-color: var(--secondary)
    color: #fff

  &--subscription
    background-color: var(--success)
    color: #fff
</style>
