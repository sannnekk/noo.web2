<template>
  <noo-quill-component
    v-if="value?.$type === 'delta'"
    :model-value="value"
    readonly
  />
</template>

<script setup lang="ts">
import type { IRichText } from '@/core/utils/richtext.utils';

interface Props {
  value: IRichText | null | undefined
}

defineProps<Props>()
</script>
