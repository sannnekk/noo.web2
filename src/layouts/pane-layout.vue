<template>
  <div class="pane-layout">
    <noo-pane
      v-model:is-open="isPaneOpen"
      :nav-entries="navEntries"
    />
    <noo-notifications-pane />
    <div class="container">
      <div class="pane-layout__content">
        <div class="pane-layout__header">
          <noo-header v-model:is-pane-open="isPaneOpen" />
        </div>
        <div class="pane-layout__slot">
          <slot />
        </div>
        <div class="pane-layout__footer">
          <noo-footer />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { NavEntry } from '@/components/layout/noo-pane.vue'
import { useAuthStore } from '@/core/stores/auth.store'
import { computed, shallowRef } from 'vue'

const authStore = useAuthStore()

const isPaneOpen = shallowRef(false)

const allEntries: NavEntry[] = [
  {
    for: 'all',
    title: 'НОО.Tube',
    icon: 'nootube',
    route: { name: 'nootube.list' }
  },
  {
    for: 'all',
    title: 'Курсы',
    icon: 'uni-cap',
    route: { name: 'courses.list' }
  },
  {
    for: 'all', //['student', 'mentor'],
    title: 'Работы',
    icon: 'list',
    route: { name: 'assigned-works.list' }
  },
  {
    for: 'all', //['student', 'mentor'],
    title: 'Работы *',
    icon: 'list',
    route: { name: 'works.list' }
  },
  {
    for: 'all', //['admin', 'teacher', 'mentor'],
    title: 'Пользователи',
    icon: 'users',
    route: { name: 'users.list' }
  },
  {
    for: 'all', //['admin', 'teacher'],
    title: 'Опросы',
    icon: 'poll',
    route: { name: 'polls.list' }
  },
  {
    for: 'all',
    title: 'Календарь',
    icon: 'calendar',
    route: { name: 'calendar' }
  },
  {
    for: 'all',
    title: 'Профиль',
    icon: 'user',
    route: { name: 'auth.login' }
  },
  {
    for: 'all',
    title: 'Настройки',
    icon: 'settings',
    route: { name: 'auth.login' }
  }
]

const navEntries = computed<NavEntry[]>(() => {
  return allEntries.filter((entry) => {
    if (entry.for === 'all') {
      return true
    }

    return entry.for.includes(authStore.userInfo!.role)
  })
})
</script>

<style lang="sass" scoped>
.pane-layout
  margin-bottom: 1em
  background-size: cover
  background-position: center
  background-repeat: no-repeat
  background-attachment: fixed

  &__slot
    background-color: var(--lightest)
    border-radius: var(--border-radius)
    min-height: 50vh
    margin-top: 1em
    box-shadow: 0px 0px 10px #00000011
</style>
