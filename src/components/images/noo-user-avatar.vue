<template>
  <div class="noo-user-avatar">
    <noo-uploaded-image
      v-if="src"
      class="noo-user-avatar__image"
      :src="src"
    />
    <img
      v-else
      :src="`https://api.dicebear.com/10.x/initial-face/svg?seed=${name || 'unknown'}`"
      class="noo-user-avatar__initials"
    />
    <div
      v-if="isOnline"
      class="noo-user-avatar__is-online"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name?: string
  // @ts-expect-error type not implemented
  // eslint-disable-next-line no-undef
  avatar?: UserAvatarEntity | null
  isOnline?: boolean
}

const props = defineProps<Props>()

const src = computed(() => {
  switch (props.avatar?.avatarType) {
    case 'telegram':
      return props.avatar.telegramAvatarUrl
    case 'custom':
      return props.avatar.media?.src
    case undefined:
    default:
      return null
  }
})
</script>

<style scoped lang="sass">
.noo-user-avatar
  width: 1em
  height: 1em
  aspect-ratio: 1 / 1
  border-radius: 50%
  position: relative

  &__image
    display: block
    width: 1em
    object-position: center
    object-fit: cover
    background-color: var(--border-color)
    overflow: hidden
    aspect-ratio: 1 / 1
    border-radius: 50%

  &__initials
    display: block
    width: 100%
    height: 100%
    overflow: hidden
    aspect-ratio: 1 / 1
    border-radius: 50%

  &__is-online
    position: absolute
    bottom: 0px
    right: 0px
    width: 15px
    height: 15px
    border-radius: 50%
    background-color: var(--success)
    border: 1px solid var(--lightest)
</style>
