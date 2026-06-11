<template>
  <noo-quill-component
    v-if="value?.$type === 'delta'"
    :model-value="value as unknown as Delta"
    readonly
  />
  <noo-tiptap-component
    v-else-if="value?.$type === 'tiptap'"
    :model-value="value"
    readonly
  />
</template>

<script setup lang="ts">
import type { IRichText } from '@/core/utils/richtext.utils'
import type { Delta } from 'quill/core'

interface Props {
  value: IRichText | null | undefined
}

defineProps<Props>()
</script>
