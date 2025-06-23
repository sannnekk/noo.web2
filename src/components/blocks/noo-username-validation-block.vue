<template>
  <p
    v-if="usernameExists.exists !== undefined && username"
    class="username-validation"
  >
    <span
      v-if="usernameExists.loading"
      class="username-validation__loading"
    >
      <loader-icon contrast />
      Проверка...
    </span>
    <span
      v-else-if="usernameExists.exists"
      class="username-validation__not-available"
    >
      Никнейм занят
    </span>
    <span
      v-else-if="usernameExists.error"
      class="username-validation__not-available"
    >
      Никнейм должен быть хотя бы 3 символа в длину и содержать только латинские
      буквы, цифры и символы _ и -
    </span>
    <span
      v-else
      class="username-validation__available"
    >
      Никнейм свободен
    </span>
  </p>
</template>

<script setup lang="ts">
import { Core } from '@/core/Core'
import { debounce } from '@/core/utils/debounce'
import { reactive, watch } from 'vue'

interface Props {
  username: string
  valid: boolean
}

type Emits = (e: 'update:valid', value: boolean) => void

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const usernameExists = reactive<{
  exists: boolean | undefined
  loading: boolean
  error?: boolean
}>({
  exists: undefined,
  loading: false,
  error: false
})

const checkUsername = debounce(async () => {
  if (!props.username) {
    usernameExists.exists = false
    usernameExists.error = true
    usernameExists.loading = false
    emits('update:valid', false)

    return
  }

  if (props.username.length < 3) {
    usernameExists.exists = false
    usernameExists.error = true
    usernameExists.loading = false
    emits('update:valid', false)

    return
  }

  if (!(/^[A-Za-z0-9_-]+$/i.exec(props.username))) {
    usernameExists.error = true
    usernameExists.exists = false
    usernameExists.loading = false
    emits('update:valid', false)

    return
  }

  usernameExists.error = false

  try {
    const response = await Core.Services.Auth.checkUsername(props.username)

    usernameExists.exists = response
    emits('update:valid', !response)
  } catch (e: any) {
    usernameExists.exists = true
    usernameExists.loading = false
    emits('update:valid', false)
  } finally {
    usernameExists.loading = false
  }
}, 500)

watch(
  () => props.username,
  async () => {
    usernameExists.loading = true
    await checkUsername()
  }
)
</script>

<style lang="sass" scoped>
.username-validation
  font-size: 12px
  background-color: var(--lightest)
  padding: 0.5em 1.8em
  border-radius: var(--border-radius)

  &__loading
    color: var(--dark)
    font-weight: bold

  &__not-available
    color: var(--danger)

  &__available
    color: var(--success)
</style>
