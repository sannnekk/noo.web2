<template>
  <div class="noo-user-card">
    <div class="noo-user-card__avatar">
      <noo-user-avatar
        :name="user.name"
        :avatar="user.avatar"
        @click="isModalOpen = true"
      />
    </div>
    <div
      class="noo-user-card__credentials"
      @click="isModalOpen = true"
    >
      <noo-title
        class="noo-user-card__credentials__name"
        :size="4"
      >
        {{ user.name }}
      </noo-title>
      <noo-text-block
        class="noo-user-card__credentials__username"
        dimmed
        size="small"
      >
        {{ user.username }}
      </noo-text-block>
    </div>
  </div>
  <user-info-modal
    v-model:visible="isModalOpen"
    :user="user"
  />
</template>

<script setup lang="ts">
import type { UserEntity } from '@/modules/users/api/user.types'
import { ref } from 'vue'

interface Props {
  user: UserEntity
}

defineProps<Props>()

const isModalOpen = ref(false)
</script>

<style scoped lang="sass">
.noo-user-card
  display: flex
  align-items: center
  gap: 0.5em
  text-decoration: none
  color: inherit
  transition: 0.2s ease all
  cursor: pointer

  &:hover
    .noo-user-card__credentials__name
      color: var(--lila)

  &__avatar
    font-size: 2.5em
    transition: 0.2s ease all

  &__credentials
    display: block
    text-decoration: none
    color: inherit
    flex: 1

    &__name
      margin: 0
      font-weight: 500
      line-height: 1.3em

    &__username
      margin: 0
      line-height: 0.8em
</style>
