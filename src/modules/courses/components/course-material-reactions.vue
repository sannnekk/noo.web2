<template>
  <div class="course-material-reactions">
    <div class="course-material-reactions__items">
      <button
        v-for="reaction in courseMaterialReactions"
        :key="reaction.value"
        type="button"
        class="course-material-reactions__item"
        :class="{
          'course-material-reactions__item--active':
            myReaction === reaction.value
        }"
        :title="reaction.label"
        :disabled="togglingReaction !== null"
        @click="toggle(reaction.value)"
      >
        <noo-loader-icon
          v-if="togglingReaction === reaction.value"
          class="course-material-reactions__item__loader"
        />
        <template v-else>{{ reaction.emoji }}</template>
      </button>
    </div>
    <div class="course-material-reactions__description">
      <noo-text-block
        dimmed
        size="small"
      >
        Это Ваша реакция на материал. Она видна только Вам и помогает
        отслеживать прогресс прохождения курса. <br />
        ✅ - материал пройден <br />
        🤔 - стоит вернуться<br />
      </noo-text-block>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import type { CourseMaterialReaction } from '../api/course.types'
import { courseMaterialReactions } from '../constants'
import { useCourseDetailStore } from '../stores/course-detail.store'

const courseDetailStore = useCourseDetailStore()

const myReaction = computed(
  () => courseDetailStore.currentMaterial?.myReaction ?? null
)

const togglingReaction = shallowRef<CourseMaterialReaction | null>(null)

async function toggle(reaction: CourseMaterialReaction): Promise<void> {
  if (togglingReaction.value !== null) {
    return
  }

  togglingReaction.value = reaction

  try {
    await courseDetailStore.toggleReaction(reaction)
  } finally {
    togglingReaction.value = null
  }
}
</script>

<style lang="sass" scoped>
.course-material-reactions
  margin-top: 1em

  &__items
    display: flex
    flex-direction: row
    gap: 0.5em
    margin-bottom: 0.5em

  &__item
    line-height: 1
    padding: 0.6em 0.8em
    border-radius: 50px
    background: var(--light)
    border: none
    cursor: pointer
    transition: filter 0.2s, border-color 0.2s, background-color 0.2s

    &:hover
      background: var(--secondary)

    &:disabled
      cursor: default
      opacity: 0.6

    &__loader
      font-size: 1em
      width: 1em
      height: 1em

    &--active
      background-color: var(--primary)
</style>
