<template>
  <router-link
    :to="/* { name: 'profile' } */ '/'"
    class="profile-widget"
  >
    <div class="profile-widget__avatar">
      <noo-user-avatar :name="authStore.userInfo?.name" />
      <!-- TODO: add avatar -->
    </div>
    <div class="profile-widget__credentials">
      <noo-title
        :size="3"
        class="profile-widget__credentials__name"
      >
        {{ authStore.userInfo?.name }}
      </noo-title>
      <div class="profile-widget__credentials__actions">
        <span class="profile-widget__credentials__actions__username">
          {{ authStore.userInfo?.username }}
        </span>
        <div class="profile-widget__credentials__actions__separator" />
        <noo-logout-button
          class="profile-widget__credentials__actions__logout-button"
        />
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/core/stores/auth.store'

const authStore = useAuthStore()
</script>

<style scoped lang="sass">
.profile-widget
  display: flex
  align-items: center
  text-decoration: none
  color: unset
  padding: 10px
  border-radius: var(--border-radius)

  @media screen and (max-width: 768px)
    padding: 0

  &:hover
    background-color: var(--light-background-color)

  &__avatar
    font-size: 50px
    margin-right: 10px

    @media screen and (max-width: 768px)
      font-size: 40px

  &__credentials
    @media screen and (max-width: 768px)
      font-size: 12px

    &__name
      margin: 0
      padding: 0
      white-space: nowrap
      text-overflow: ellipsis
      overflow: hidden

    &__actions
      display: flex
      align-items: center
      gap: 5px
      font-size: 12px

      &__username
        color: var(--text-light)
        white-space: nowrap
        text-overflow: ellipsis
        overflow: hidden

      &__separator
        width: 3px
        height: 3px
        border-radius: 50%
        background-color: var(--text-light)

      &__logout-button
        padding: 0
</style>
