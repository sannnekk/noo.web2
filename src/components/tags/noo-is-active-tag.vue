<template>
  <div class="noo-is-active-tag">
    <noo-status-tag
      mode="background"
      :type="value ? 'success' : 'danger'"
    >
      {{ value ? values[0] : values[1] }}
    </noo-status-tag>
  </div>
</template>

<script setup lang="ts">
interface Props {
  value: boolean
  values?: [string, string]
}

withDefaults(defineProps<Props>(), {
  values: () => ['Активен', 'Неактивен']
})
</script>
