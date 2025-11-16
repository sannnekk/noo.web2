<template>
  <div
    v-if="user"
    class="noo-inline-user-block"
  >
    <div class="noo-inline-user-block__avatar">
      <noo-user-avatar
        :name="user.name"
        :avatar="
          // @ts-expect-error not-implemented yet
          user.avatar
        "
      />
    </div>
    <noo-inline-link
      class="noo-inline-user-block__name"
      :class="{
        'noo-inline-user-block__name--dimmed': dimmed
      }"
      :to="{
        name: 'auth.login'
      } /* TODO: { name: 'users.detail', params: { userId: user.id } } */"
    >
      {{ user.name }}
    </noo-inline-link>
  </div>
</template>

<script setup lang="ts">
import type { UserEntity } from '@/modules/users/api/user.types'

interface Props {
  user?: UserEntity | null
  dimmed?: boolean
}

defineProps<Props>()
</script>

<style scoped lang="sass">
.noo-inline-user-block
  display: inline-block
  font-size: 1em
  font-weight: normal

  &__avatar
    display: inline-block
    position: relative
    top: -0.125em
    font-size: 1.5em

  &__name
    display: inline-block
    text-decoration: none
    color: var(--lila)
    font-weight: 200
    line-height: 1.5em
    margin-left: 0.5em
</style>
