<template>
  <div class="noo-support-logo">
    <div class="noo-support-logo__img">
      <noo-round-logo />
    </div>
    <div class="noo-support-logo__title">
      <h1>
        <b>НОО.</b>
        <span>Помощь и поддержка</span>
      </h1>
    </div>
  </div>
</template>

<style scoped lang="sass">
.noo-support-logo
  display: flex
  align-items: center
  gap: 1em

  &__img
    width: 7em
    height: 7em

  &__title
    white-space: nowrap

    h1
      span
        font-weight: normal
</style>
