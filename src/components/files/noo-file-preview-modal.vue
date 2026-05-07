<template>
  <noo-base-modal
    v-model:is-open="isOpen"
    full-width
  >
    <template #title>
      <noo-title :size="3">
        {{ file?.actualName ?? file?.name ?? 'Файл' }}
      </noo-title>
    </template>
    <template #content>
      <noo-image-file-preview
        v-if="kind === 'image'"
        :src="resolvedUrl"
        :alt="file?.actualName ?? file?.name ?? ''"
      />
      <noo-pdf-file-preview
        v-else-if="kind === 'pdf'"
        :src="resolvedUrl"
      />
      <noo-text-block
        v-else
        dimmed
      >
        Предпросмотр для этого типа файла недоступен.
      </noo-text-block>
    </template>
    <template #actions="{ close }">
      <noo-button
        v-if="resolvedUrl"
        variant="secondary"
        :to="resolvedUrl"
        new-tab
      >
        Открыть в новой вкладке
      </noo-button>
      <noo-button
        variant="primary"
        @click="close"
      >
        Закрыть
      </noo-button>
    </template>
  </noo-base-modal>
</template>

<script lang="ts" setup>
import type { MediaEntity } from '@/modules/media/api/media.types'
import { computed } from 'vue'
import { detectFileKind } from './file-kind.utils'

interface Props {
  file: MediaEntity | null
}

const props = defineProps<Props>()

const isOpen = defineModel<boolean>('isOpen', { default: false })

const kind = computed(() => (props.file ? detectFileKind(props.file) : null))

const resolvedUrl = computed(() => props.file?.url ?? null)
</script>
