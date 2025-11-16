<template>
  <div
    v-if="
      username?.length &&
      username.length >= minUsernameLength &&
      usernameIsFree !== undefined
    "
    class="noo-username-exists-block"
  >
    <span
      v-if="isLoading"
      сlass="noo-username-exists-block__loading"
      style="color: var(--text-light)"
    >
      <noo-loader-icon v-if="isLoading" />
      Загрузка...
    </span>
    <span
      v-else-if="usernameIsFree"
      style="color: var(--success)"
    >
      Никнейм свободен
    </span>
    <span
      v-else
      style="color: var(--danger)"
    >
      Никнейм уже занят
    </span>
  </div>
</template>

<script setup lang="ts">
import { AuthService } from '@/core/api/endpoints/auth.service'
import { debounce } from 'lodash'
import { shallowRef, watch } from 'vue'

interface Props {
  username?: string
}

const props = defineProps<Props>()

const minUsernameLength = 3
const isLoading = shallowRef(false)
const usernameIsFree = shallowRef<boolean>()

watch(() => props.username, debounce(checkUsername, 500))

async function checkUsername() {
  if (props.username && props.username.length >= minUsernameLength) {
    isLoading.value = true

    try {
      const response = await AuthService.usernameIsFree(props.username)

      usernameIsFree.value = response.data ?? false

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      usernameIsFree.value = undefined
    } finally {
      isLoading.value = false
    }
  } else {
    usernameIsFree.value = undefined
  }
}
</script>

<style scoped lang="sass">
.noo-username-exists-block
  padding: 0.3em 0
  font-size: 0.8em
</style>
