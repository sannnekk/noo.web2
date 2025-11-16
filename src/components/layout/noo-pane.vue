<template>
  <div
    class="pane"
    :class="{ open: openedModel }"
  >
    <div class="pane__inner">
      <div class="pane__logo">
        <noo-main-logo />
      </div>
      <div class="pane__nav">
        <nav>
          <ul>
            <li
              v-for="(navEntry, index) in navEntries"
              :key="navEntry.route.name"
              class="pane__nav__entry"
            >
              <router-link
                :to="navEntry.route"
                @click="openedModel = false"
                @mouseenter="isOnHover[index] = true"
                @mouseleave="isOnHover[index] = false"
              >
                <noo-icon
                  class="pane__nav__entry__icon"
                  :class="{
                    'pane__nav__entry__icon--opened': isOpening[index]
                  }"
                  :name="navEntry.icon"
                  :animation="isOnHover[index]"
                />
                <span class="pane__nav__entry__title">
                  {{ navEntry.title }}
                </span>
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
      <div class="pane__help">
        <p>
          Есть проблема? Напишите нам в
          <a
            :href="AppConstants.supportChatLink"
            target="_blank"
          >
            {{ AppConstants.supportChatName }}
          </a>
        </p>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <div
      v-if="openedModel"
      class="overlay"
      @click="openedModel = false"
    />
  </Teleport>
</template>

<script setup lang="ts">
import type { UserRole } from '@/core/api/endpoints/auth.types'
import { AppConstants } from '@/core/config/constants.config'
import { ref, watch } from 'vue'
import type { IconName } from '../icons/noo-icon.vue'

export interface NavEntry {
  for: UserRole[] | 'all'
  title: string
  icon: IconName
  route: {
    name: string
  }
}

interface Props {
  isOpen: boolean
  navEntries: NavEntry[]
}

const props = defineProps<Props>()

const openedModel = defineModel<boolean>('isOpen', {
  default: false
})

const isOnHover = ref(props.navEntries.map(() => false))
const isOpening = ref(props.navEntries.map(() => false))

const animationDelay = 300
const animationStep = 100
const animationDuration = 200

watch(
  () => props.isOpen,
  () => {
    if (props.isOpen) {
      for (let index = 0; index < props.navEntries.length; index++) {
        isOnHover.value[index] = false
        isOpening.value[index] = false

        setTimeout(
          () => {
            isOnHover.value[index] = true
            isOpening.value[index] = true
          },
          animationDelay + index * animationStep
        )
        setTimeout(
          () => {
            isOnHover.value[index] = false
          },
          animationDelay + index * animationStep + animationDuration
        )
      }
    } else {
      isOpening.value = props.navEntries.map(() => false)
    }
  }
)
</script>

<style scoped lang="sass">
.overlay
  position: fixed
  top: 0
  left: 0
  width: 100%
  height: 100%
  background-color: #00000088
  z-index: 999998
  cursor: pointer

.pane
  position: fixed
  left: -350px
  top: 0
  z-index: 999999
  width: min(90%, 350px)
  height: 100%
  background-color: var(--lightest)
  transition: left 0.3s ease-in-out

  &.open
    left: 0

  &__inner
    display: flex
    flex-direction: column
    height: 100%

  &__logo
    padding: 30px 5px
    text-align: center

  &__nav
    flex: 1
    max-height: 90%
    overflow-y: auto

    nav
      ul
        list-style: none
        padding: 0
        margin: 0

    &__entry
      font-size: 17px
      width: 100%

      a
        text-decoration: none
        color: inherit
        display: flex
        align-items: center
        padding: 0.7em 0

        @media screen and (max-width: 768px)
          padding-top: 0.5em
          padding-bottom: 0.5em
          font-size: 15px

        &.router-link-active
          background-color: var(--lightest)
          font-weight: bold

      &__icon
        font-size: 42px
        margin: 0 30px
        transition: transform 0.2s ease-in-out
        transform: scale(0)
        opacity: 0

        &--opened
          opacity: 1
          transform: scale(1)

      &:hover
        background-color: var(--lightest)

  &__help
    padding: 0 15px 15px 15px
    text-align: center
    font-size: 14px
    color: var(--text-light)

    a
      color: var(--lila)
      font-weight: bold
      text-decoration: none

      &:hover
        text-decoration: underline
</style>
