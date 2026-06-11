<template>
  <noo-dialog v-model:is-open="isOpen">
    <template #trigger="{ toggle }">
      <noo-tiptap-toolbar-button
        icon="table"
        title="Таблица"
        :active="editor?.isActive('table')"
        @click="toggle"
      />
    </template>
    <template #content="{ close }">
      <div class="noo-tiptap-table-menu">
        <div class="noo-tiptap-table-menu__label">
          {{ selectedCols }} × {{ selectedRows }}
        </div>
        <div
          class="noo-tiptap-table-menu__grid"
          :style="gridStyle"
          @mouseleave="reset"
        >
          <button
            v-for="cell in cells"
            :key="`${cell.row}-${cell.col}`"
            type="button"
            class="noo-tiptap-table-menu__cell"
            :class="{
              'noo-tiptap-table-menu__cell--active':
                cell.row <= selectedRows && cell.col <= selectedCols
            }"
            @mouseenter="hover(cell.row, cell.col)"
            @click="apply(cell.row, cell.col, close)"
          />
        </div>
      </div>
    </template>
  </noo-dialog>
</template>

<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import { computed, ref } from 'vue'

interface Props {
  editor?: Editor
}

const props = defineProps<Props>()

const MAX_ROWS = 8
const MAX_COLS = 8

const isOpen = ref(false)
const selectedRows = ref(0)
const selectedCols = ref(0)

// Row-major list of cells so the CSS grid lays them out in order.
const cells = computed(() => {
  const result: { row: number; col: number }[] = []

  for (let row = 1; row <= MAX_ROWS; row++) {
    for (let col = 1; col <= MAX_COLS; col++) {
      result.push({ row, col })
    }
  }

  return result
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)`
}))

function hover(row: number, col: number) {
  selectedRows.value = row
  selectedCols.value = col
}

function reset() {
  selectedRows.value = 0
  selectedCols.value = 0
}

function apply(rows: number, cols: number, close: () => void) {
  props.editor
    ?.chain()
    .focus()
    .insertTable({ rows, cols, withHeaderRow: true })
    .run()

  reset()
  close()
}
</script>

<style scoped lang="sass">
.noo-tiptap-table-menu
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.5em

  &__label
    font-size: 0.85em
    color: var(--form-text-color)

  &__grid
    display: grid
    gap: 3px

  &__cell
    width: 1.4em
    height: 1.4em
    padding: 0
    border: 1px solid var(--border-color)
    border-radius: 2px
    background-color: var(--light-background-color)
    cursor: pointer

    &--active
      background-color: var(--primary)
      border-color: var(--primary)
</style>
