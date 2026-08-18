<template>
  <noo-button
    variant="secondary"
    :is-loading="isLoading"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <span class="icon">
      <noo-icon :name="descriptor.icon" />
    </span>
    <span class="label">
      <slot>Войти через {{ title ?? descriptor.title }}</slot>
    </span>
  </noo-button>
</template>

<script setup lang="ts">
import type { ExternalAuthProvider } from '@/core/api/endpoints/auth.types'
import { describeAuthProvider } from '@/core/config/auth-providers.config'
import { computed } from 'vue'

interface Props {
  provider: ExternalAuthProvider
  /** The provider's own name as the server reports it; falls back to the descriptor. */
  title?: string
  isLoading?: boolean
  disabled?: boolean
}

type Emits = (e: 'click') => void

const props = defineProps<Props>()

defineEmits<Emits>()

const descriptor = computed(() => describeAuthProvider(props.provider))
</script>

<style scoped lang="sass">
.icon
  font-size: 1.2em
  display: inline-block
  margin-right: 0.2em
  position: relative
  top: 0.1em

.label
  display: inline-block
  position: relative
  top: -0.2em
</style>
