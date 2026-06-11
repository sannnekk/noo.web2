<template>
  <div
    class="noo-tiptap-component"
    :class="{ 'noo-tiptap-component--readonly': readonly }"
  >
    <div
      v-if="!readonly && editor"
      class="noo-tiptap-component__toolbar"
    >
      <div
        v-for="(group, index) in toolbar"
        :key="index"
        class="noo-tiptap-component__toolbar__group"
      >
        <noo-tiptap-toolbar-button
          v-for="item in group"
          :key="item.name"
          :icon="item.icon"
          :title="item.title"
          :active="item.isActive()"
          @click="item.action?.()"
        />
        <!-- colour lives with the text-formatting tools -->
        <noo-tiptap-color-menu
          v-if="index === 0"
          :editor="editor"
        />
      </div>
      <div class="noo-tiptap-component__toolbar__group">
        <noo-tiptap-link-menu :editor="editor" />
        <noo-tiptap-video-menu :editor="editor" />
        <noo-tiptap-table-menu :editor="editor" />
        <noo-tiptap-latex-menu :editor="editor" />
        <noo-tiptap-toolbar-button
          icon="image"
          title="Изображение"
          disabled
        />
      </div>
    </div>
    <editor-content
      class="noo-tiptap-component__content"
      :editor="editor"
    />
    <noo-tiptap-math-edit
      v-if="mathTarget && editor"
      :key="mathTarget.pos"
      :editor="editor"
      :target="mathTarget"
      @close="mathTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import type { RichtextIcon } from '@/components/icons/noo-richtext-icon.vue'
import {
  richTextToTiptap,
  tiptapToRichText,
  type IRichText,
  type ITiptapRichText
} from '@/core/utils/richtext.utils'
import { Mathematics } from '@tiptap/extension-mathematics'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { TableKit } from '@tiptap/extension-table'
import { TextAlign } from '@tiptap/extension-text-align'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { computed, ref, watch } from 'vue'
import { Iframe } from './extensions/iframe'
import type { MathEditTarget } from './noo-tiptap-math-edit.vue'
import 'katex/dist/katex.min.css'

interface ToolbarItem {
  name: string
  title: string
  icon: RichtextIcon | 'color'
  isActive: () => boolean
  action?: () => void
}

interface Props {
  readonly?: boolean
  placeholder?: string
}

const props = defineProps<Props>()

const model = defineModel<IRichText | null>('modelValue', {
  default: null
})

const editor = useEditor({
  content: richTextToTiptap(model.value as ITiptapRichText | null),
  editable: !props.readonly,
  extensions: [
    StarterKit,
    Subscript,
    Superscript,
    TextStyle,
    Color,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TableKit.configure({ table: { resizable: true } }),
    Mathematics.configure({
      inlineOptions: { onClick: openMathEditor },
      blockOptions: { onClick: openMathEditor }
    }),
    Iframe
  ],
  onUpdate: ({ editor }) => {
    model.value = editor.isEmpty ? null : tiptapToRichText(editor.getJSON())
  }
})

// Math nodes are click-to-edit: capture the node and anchor the editor popover
// at its on-screen position.
const mathTarget = ref<MathEditTarget | null>(null)

function openMathEditor(node: ProseMirrorNode, pos: number) {
  const e = editor.value

  if (!e?.isEditable) {
    return
  }

  const coords = e.view.coordsAtPos(pos)

  mathTarget.value = {
    pos,
    isInline: node.type.name === 'inlineMath',
    latex: node.attrs.latex ?? '',
    top: coords.bottom,
    left: coords.left
  }
}

// Insert tools (link, video, table, latex, image) are rendered as their own
// menu components in the template, since they open dialogs instead of running a
// single command.
const toolbar = computed<ToolbarItem[][]>(() => {
  const e = editor.value

  return [
    [
      {
        name: 'bold',
        title: 'Жирный',
        icon: 'bold',
        isActive: () => !!e?.isActive('bold'),
        action: () => e?.chain().focus().toggleBold().run()
      },
      {
        name: 'italic',
        title: 'Курсив',
        icon: 'italic',
        isActive: () => !!e?.isActive('italic'),
        action: () => e?.chain().focus().toggleItalic().run()
      },
      {
        name: 'underline',
        title: 'Подчеркнутый',
        icon: 'underline',
        isActive: () => !!e?.isActive('underline'),
        action: () => e?.chain().focus().toggleUnderline().run()
      },
      {
        name: 'strike',
        title: 'Зачеркнутый',
        icon: 'strikethrough',
        isActive: () => !!e?.isActive('strike'),
        action: () => e?.chain().focus().toggleStrike().run()
      },
      {
        name: 'subscript',
        title: 'Подстрочный',
        icon: 'subscript',
        isActive: () => !!e?.isActive('subscript'),
        action: () => e?.chain().focus().toggleSubscript().run()
      },
      {
        name: 'superscript',
        title: 'Надстрочный',
        icon: 'superscript',
        isActive: () => !!e?.isActive('superscript'),
        action: () => e?.chain().focus().toggleSuperscript().run()
      }
    ],
    [
      {
        name: 'alignLeft',
        title: 'Выравнивание по левому краю',
        icon: 'align-left',
        isActive: () => !!e?.isActive({ textAlign: 'left' }),
        action: () => e?.chain().focus().setTextAlign('left').run()
      },
      {
        name: 'alignCenter',
        title: 'Выравнивание по центру',
        icon: 'align-center',
        isActive: () => !!e?.isActive({ textAlign: 'center' }),
        action: () => e?.chain().focus().setTextAlign('center').run()
      },
      {
        name: 'alignRight',
        title: 'Выравнивание по правому краю',
        icon: 'align-right',
        isActive: () => !!e?.isActive({ textAlign: 'right' }),
        action: () => e?.chain().focus().setTextAlign('right').run()
      },
      {
        name: 'alignJustify',
        title: 'Выравнивание по ширине',
        icon: 'align-justify',
        isActive: () => !!e?.isActive({ textAlign: 'justify' }),
        action: () => e?.chain().focus().setTextAlign('justify').run()
      }
    ],
    [
      {
        name: 'bulletList',
        title: 'Маркированный список',
        icon: 'list-ul',
        isActive: () => !!e?.isActive('bulletList'),
        action: () => e?.chain().focus().toggleBulletList().run()
      },
      {
        name: 'orderedList',
        title: 'Нумерованный список',
        icon: 'list-ol',
        isActive: () => !!e?.isActive('orderedList'),
        action: () => e?.chain().focus().toggleOrderedList().run()
      }
    ]
  ]
})

// keep the editor in sync when the model is changed from the outside
watch(model, (value) => {
  if (!editor.value) {
    return
  }

  const incoming = richTextToTiptap(value as ITiptapRichText | null)
  const current = editor.value.getJSON()

  if (JSON.stringify(incoming) !== JSON.stringify(current)) {
    editor.value.commands.setContent(incoming, { emitUpdate: false })
  }
})

watch(
  () => props.readonly,
  (readonly) => editor.value?.setEditable(!readonly)
)
</script>

<style lang="sass" scoped>
.noo-tiptap-component
  min-width: 100%

  &:not(&--readonly)
    background-color: var(--form-background)

  &__toolbar
    background-color: var(--light-background-color)
    border-radius: var(--border-radius)
    display: flex
    align-items: stretch
    justify-content: flex-start
    flex-wrap: wrap
    margin-bottom: 0

    &__group
      display: flex
      align-items: stretch

      &:not(:last-child)
        border-right: 1px solid var(--border-color)

  &__content
    border: 1px solid var(--border-color)
    border-bottom-left-radius: var(--border-radius)
    border-bottom-right-radius: var(--border-radius)
    font-family: 'Montserrat', sans-serif
    font-size: 16px

    &:deep(.ProseMirror)
      padding: 12px 15px
      outline: none
      min-height: 4em

      .noo-richtext-iframe-wrapper
        position: relative
        width: 100%
        max-width: 100%
        aspect-ratio: 16 / 9
        margin: 0.5em 0

      .noo-richtext-iframe
        width: 100%
        height: 100%
        border: none
        border-radius: var(--border-radius)

      table
        border-collapse: collapse
        width: 100%
        margin: 0.5em 0
        table-layout: fixed

        td,
        th
          border: 1px solid var(--border-color)
          padding: 0.3em 0.5em
          vertical-align: top

        th
          background-color: var(--light-background-color)
          font-weight: 600

      // The mathematics extension ships no CSS, so flow + affordances are ours.
      .tiptap-mathematics-render
        &[data-type='inline-math']
          display: inline-block
          vertical-align: middle

        &[data-type='block-math']
          display: block
          text-align: center
          margin: 0.5em 0

        &--editable
          position: relative
          cursor: pointer
          border-radius: 3px

          &:hover
            background-color: var(--lightest)
            outline: 1px dashed var(--border-color)

          // Edit affordance shown only on hover while editable.
          &:hover::after
            content: '✎'
            position: absolute
            top: -0.6em
            right: -0.5em
            width: 1.4em
            height: 1.4em
            font-size: 0.7em
            display: flex
            align-items: center
            justify-content: center
            background-color: var(--primary)
            color: var(--black)
            border-radius: 50%
            pointer-events: none

  &--readonly
    .noo-tiptap-component__content
      border: none
      box-shadow: none
      background-color: transparent

      &:deep(.ProseMirror)
        padding: 0
        line-height: 1.5
        min-height: unset
</style>
