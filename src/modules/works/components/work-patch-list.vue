<template>
  <div class="save-work-changes-modal__content__patch-list">
    <noo-patch-list
      :patch="patch"
      :original="original"
      :path-labels="workPathLabels"
    >
      <template #path--subjectId="{ value }">
        <noo-subject-select
          v-model:subject-id="value as string"
          label=""
          readonly
        />
      </template>
      <template #path--type="{ value }">
        <noo-work-type-select
          v-model="value as string"
          label=""
          readonly
        />
      </template>
    </noo-patch-list>
  </div>
</template>

<script setup lang="ts">
import type { JsonPatchDocument } from '@/core/utils/jsonpatch.utils'
import { workPathLabels } from '../constants'
import type { PossiblyUnsavedWork } from '../types'

interface Props {
  patch: JsonPatchDocument<PossiblyUnsavedWork>
  original: PossiblyUnsavedWork
}

defineProps<Props>()
</script>
