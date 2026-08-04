<template>
  <div class="not-found-page">
    <div class="not-found-page__image">
      <noo-not-found-image />
    </div>
    <noo-title
      :size="1"
      align="center"
    >
      Страница не найдена
    </noo-title>
    <noo-text-block align="center">
      Возможно, она была удалена или перенесена, либо у вашей учетной записи нет
      доступа к ней.
    </noo-text-block>
    <div class="not-found-page__actions">
      <noo-button
        variant="primary"
        :to="{ name: 'root' }"
      >
        На главную
      </noo-button>
      <noo-button
        variant="secondary"
        @click="goBack()"
      >
        Вернуться назад
      </noo-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// A visitor who typed the address by hand has nothing to go back to, so the
// platform itself is the fallback.
function goBack(): void {
  if (window.history.state?.back) {
    router.back()

    return
  }

  router.push({ name: 'root' })
}
</script>

<style scoped lang="sass">
.not-found-page
  display: flex
  flex-direction: column
  align-items: center
  width: min(100%, 40rem)

  &__image
    width: min(100%, 22rem)

  &__actions
    display: flex
    flex-wrap: wrap
    justify-content: center
    gap: var(--space-2xs)
    margin-top: var(--space-s)
</style>
