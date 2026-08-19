<template>
  <!-- Rendered by the editor whose format the value names. One today; a second
       would be another branch on `$type`. -->
  <noo-tiptap-component
    v-if="value?.$type === 'tiptap'"
    :model-value="value"
    readonly
  />
</template>

<script setup lang="ts">
import type { IRichText } from '@/core/utils/richtext.utils'

interface Props {
  value: IRichText | null | undefined
}

defineProps<Props>()
</script>
