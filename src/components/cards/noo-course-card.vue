<template>
  <div class="noo-course-card">
    <div class="noo-course-card__img">
      <router-link
        class="router-link"
        :to="to"
      >
        <noo-uploaded-image :media="course.thumbnail" />
      </router-link>
      <div class="noo-course-card__img__more-widget">
        <!-- <more-widget :items="actions" /> -->
      </div>
    </div>
    <div
      v-if="course.subject"
      class="noo-course-card__subject"
    >
      <noo-subject-block :subject="course.subject" />
    </div>
    <div class="noo-course-card__title">
      <router-link :to="to">
        {{ course.name }}
      </router-link>
    </div>
    <div class="noo-course-card__description">
      {{ course.description }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CourseEntity } from '@/modules/courses/api/course.types'
import { computed } from 'vue'

interface Props {
  course: CourseEntity
}

const props = defineProps<Props>()

const to = computed(() => {
  return {
    name: 'courses.detail',
    params: { courseId: props.course.id }
  }
})
</script>

<style scoped lang="sass">
.noo-course-card
  border-radius: var(--border-radius)
  margin-bottom: 1em
  transition: box-shadow 0.3s ease
  margin-bottom: 2em

  &:hover
    color: var(--lila)

  &__img
    width: 100%
    aspect-ratio: 1.5848
    overflow: hidden
    border-radius: var(--border-radius)
    margin-bottom: 1rem
    position: relative

    a
      display: block
      text-decoration: none
      width: 100%
      height: 100%
      overflow: hidden

      img
        width: 100%
        height: 100%
        object-fit: cover
        object-position: center

    &__more-widget
      position: absolute
      top: 10px
      right: 10px
      z-index: 1

  &__title
    font-size: 1.2rem
    font-weight: bold
    margin-bottom: 0.5rem

    a
      color: var(--text-dark)
      text-decoration: none

      &:hover
        color: var(--secondary)

  &__description
    margin-bottom: 0.8rem
    color: var(--text-light)
    font-size: 0.9em

  &__author
    display: flex
    flex-direction: row
    align-items: center

    &__avatar
      margin-right: 0.5rem
      font-size: 1.5em

    &__name
      font-size: 0.8rem

      a
        color: var(--text-light)
        text-decoration: none

        &:hover
          color: var(--secondary)

  &__edit
    margin-top: 1rem
    font-size: 0.8rem

    a
      color: var(--text-light)
      text-decoration: none

      &:hover
        color: var(--secondary)
</style>
