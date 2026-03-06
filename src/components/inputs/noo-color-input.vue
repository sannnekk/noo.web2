<template>
  <noo-select-input
    v-model="model"
    :label="label"
    :options="options"
  >
    <template #label>
      <noo-color-badge
        :color="model ?? 'var(--form-text-color)'"
        class="noo-color-input__color-badge"
      />
      {{ label }}
    </template>
  </noo-select-input>
</template>

<script setup lang="ts">
interface Props {
  label?: string
}

defineProps<Props>()

const model = defineModel<string | null>()

const options: { label: string; value: string | null }[] = [
  { label: 'Фирменный зеленый', value: 'var(--primary)' },
  { label: 'Фирменный фиолетовый', value: 'var(--secondary)' },
  { label: 'Красный', value: 'var(--danger)' },
  { label: 'Желтый', value: 'var(--warning)' },
  { label: 'Зеленый', value: 'var(--success)' },
  { label: 'Без цвета', value: null }
]
</script>

<style scoped lang="sass">
.noo-color-input
  &__color-badge
    margin-right: 0.5em
</style>
