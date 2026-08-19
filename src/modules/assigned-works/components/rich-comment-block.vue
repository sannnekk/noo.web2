<template>
  <task-card
    class="rich-comment-block"
    :title="title"
  >
    <template
      v-if="$slots.meta"
      #meta
    >
      <slot name="meta" />
    </template>

    <template v-if="!readonly">
      <noo-richtext-editor
        ref="editor"
        v-model="model"
        :placeholder="placeholder"
        :media-category="mediaCategory"
      />
      <snippets-block
        v-if="withSnippets"
        @insert="insertSnippet"
      />
    </template>
    <noo-richtext-block
      v-else-if="hasContent"
      :value="model"
    />
    <noo-text-block
      v-else
      dimmed
      size="small"
      no-margin
    >
      {{ emptyText }}
    </noo-text-block>
  </task-card>
</template>

<script setup lang="ts">
import type NooRichtextEditor from '@/components/richtext/noo-richtext-editor.vue'
import { richTextIsEmpty, type IRichText } from '@/core/utils/richtext.utils'
import type { MediaCategory } from '@/modules/media/api/media.types'
import { computed, useTemplateRef } from 'vue'
import snippetsBlock from './snippets-block.vue'
import taskCard from './task-view/task-card.vue'

interface Props {
  title: string
  placeholder?: string
  mediaCategory?: MediaCategory
  readonly?: boolean
  /** Offers the mentor's saved snippets under the editor. */
  withSnippets?: boolean
  emptyText?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: undefined,
  mediaCategory: undefined,
  emptyText: 'Ещё нет комментария'
})

const model = defineModel<IRichText | null>('content', { default: null })

const hasContent = computed(
  () => !!model.value && !richTextIsEmpty(model.value)
)

const editor = useTemplateRef<InstanceType<typeof NooRichtextEditor>>('editor')

function insertSnippet(content: IRichText | null): void {
  editor.value?.insertRichText(content)
}
</script>
