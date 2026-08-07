<template>
  <task-card
    class="task-mentor-comment-block"
    title="Комментарий куратора"
  >
    <template v-if="!readonly">
      <noo-richtext-editor
        ref="editor"
        v-model="model"
        placeholder="Введите комментарий куратора здесь..."
        media-category="assigned-work-mentor-rich-text"
      />
      <snippets-block @insert="insertSnippet" />
    </template>
    <noo-richtext-block
      v-else-if="hasComment"
      :value="model"
    />
    <noo-text-block
      v-else
      dimmed
      size="small"
      no-margin
    >
      Ещё нет комментария
    </noo-text-block>
  </task-card>
</template>

<script setup lang="ts">
import type NooRichtextEditor from '@/components/richtext/noo-richtext-editor.vue'
import { richTextIsEmpty, type IRichText } from '@/core/utils/richtext.utils'
import { computed, useTemplateRef } from 'vue'
import snippetsBlock from '../snippets-block.vue'
import taskCard from './task-card.vue'

interface Props {
  readonly?: boolean
}

defineProps<Props>()

const model = defineModel<IRichText | null>('comment', { default: null })

const hasComment = computed(
  () => !!model.value && !richTextIsEmpty(model.value)
)

const editor = useTemplateRef<InstanceType<typeof NooRichtextEditor>>('editor')

function insertSnippet(content: IRichText | null): void {
  editor.value?.insertRichText(content)
}
</script>
