<template>
  <div class="noo-round-logo">
    <div class="noo-round-logo__circle">
      <div class="noo-round-logo__circle--bordered">
        <img
          src="/img/logo-circled.svg"
          alt="Логотип НОО"
          class="noo-round-logo__circle__img"
        />
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.noo-round-logo
  position: relative

  &__circle
    transform: translateX(-10px)
    background-color: #fff
    border-radius: 300px

    &__img
      width: 100%
      transform: translateX(10px)
</style>
