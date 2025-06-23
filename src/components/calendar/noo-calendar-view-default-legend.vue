<template>
  <div class="noo-calendar-view-default-legend">
    <div class="noo-calendar-view-default-legend__items">
      <div
        v-for="item in items"
        :key="item.label"
        class="noo-calendar-view-default-legend__items__item"
      >
        <div class="noo-calendar-view-default-legend__items__item__color">
          <noo-color-badge :color="item.color" />
        </div>
        <div class="noo-calendar-view-default-legend__items__item__definition">
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const items: {
  label: string
  color: string
}[] = [
  { label: 'дедлайн сдачи работы', color: 'var(--danger)' },
  { label: 'дедлайн проверки работы', color: 'var(--lila)' },
  { label: 'работа проверена', color: 'var(--success)' },
  { label: 'работа сдана', color: 'var(--warning)' },
  { label: 'другое событие', color: 'var(--text-light)' }
]
</script>

<style scoped lang="sass">
.noo-calendar-view-default-legend
  padding: 1em

  &__items
    display: flex
    flex-wrap: wrap
    gap: 2em

    &__item
      display: flex
      align-items: center
      gap: 0.5em

      &__color
        font-size: 1.2em

      &__definition
        font-size: 0.9em
        color: var(--text-light)
</style>
