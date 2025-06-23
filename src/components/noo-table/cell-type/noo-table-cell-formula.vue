<template>
  <div class="noo-table-cell-formula">
    Formula
  </div>
</template>

<script lang="ts" setup>
import type { TableFormula } from '../TableFormula';

interface Props {
  value: TableFormula
}

defineProps<Props>()
</script>
