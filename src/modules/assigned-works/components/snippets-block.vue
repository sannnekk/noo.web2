<template>
  <div
    v-if="canUseSnippets"
    class="snippets-block"
  >
    <noo-text-block
      class="snippets-block__title"
      size="small"
      dimmed
      no-margin
    >
      Сниппеты
    </noo-text-block>

    <div
      v-if="isLoading"
      class="snippets-block__loading"
    >
      <noo-loader-icon />
    </div>
    <div
      v-else-if="snippets.length"
      class="snippets-block__list"
    >
      <noo-button
        v-for="snippet in snippets"
        :key="snippet.id"
        variant="tertiary"
        size="small"
        @click="emit('insert', snippet.content)"
      >
        {{ snippet.name }}
      </noo-button>
    </div>
    <noo-text-block
      v-else
      size="small"
      dimmed
      no-margin
    >
      <template v-if="hasError"> Не удалось загрузить сниппеты. </template>
      <template v-else>
        Сниппетов пока нет — их можно создать в
        <noo-inline-link
          size="small"
          :to="{ name: 'settings.snippets' }"
        >
          настройках
        </noo-inline-link>
      </template>
    </noo-text-block>
  </div>
</template>

<script setup lang="ts">
import { richTextIsEmpty, type IRichText } from '@/core/utils/richtext.utils'
import { computed, onMounted } from 'vue'
import type { SnippetEntity } from '../api/snippet.types'
import {
  AssignedWorksPermissions,
  useAssignedWorksPermissions
} from '../permissions'
import { useSnippetStore } from '../stores/snippet.store'

type Emits = (event: 'insert', content: IRichText | null) => void

const emit = defineEmits<Emits>()

const { can } = useAssignedWorksPermissions()
const snippetStore = useSnippetStore()

const canUseSnippets = can(AssignedWorksPermissions.useSnippets)

const snippets = computed<SnippetEntity[]>(() =>
  (snippetStore.snippets.data ?? []).filter(
    (snippet) => !richTextIsEmpty(snippet.content)
  )
)

const isLoading = computed(
  () => !snippetStore.snippets.data && snippetStore.snippets.isLoading
)

const hasError = computed(() => !!snippetStore.snippets.error)

onMounted(() => {
  if (canUseSnippets) {
    void snippetStore.init()
  }
})
</script>

<style scoped lang="sass">
.snippets-block
  display: flex
  flex-direction: column
  gap: var(--space-3xs)
  margin-top: var(--space-2xs)

  &__loading
    font-size: 1.5em

  &__list
    display: flex
    flex-wrap: wrap
    gap: var(--space-3xs)
</style>
