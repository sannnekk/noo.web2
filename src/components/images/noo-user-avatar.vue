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
    <div
      v-if="editable"
      class="noo-user-avatar__edit"
      @click="$emit('edit')"
    >
      <noo-icon name="edit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserAvatarEntity } from '@/modules/users/api/user.types'
import { computed } from 'vue'

interface Props {
  name?: string
  avatar?: UserAvatarEntity | null
  isOnline?: boolean
  editable?: boolean
}

type Emits = (e: 'edit') => void

const props = defineProps<Props>()

defineEmits<Emits>()

const src = computed(() => {
  switch (props.avatar?.avatarType) {
    case 'telegram':
      return props.avatar.avatarUrl
    case 'custom':
      return props.avatar.media?.url
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
  border-radius: 50%
  overflow: hidden

  &__image
    display: block
    width: 1em
    object-position: center
    object-fit: cover
    background-color: var(--border-color)
    overflow: hidden
    aspect-ratio: 1 / 1

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

  &:hover .noo-user-avatar__edit
    opacity: 1

  &__edit
    position: absolute
    z-index: 1
    top: 0
    left: 0
    background-color: rgba(0, 0, 0, 0.5)
    width: 100%
    height: 100%
    display: flex
    align-items: center
    justify-content: center
    font-size: 0.3em
    opacity: 0
    transition: opacity 0.2s ease-in-out
    cursor: pointer
</style>
