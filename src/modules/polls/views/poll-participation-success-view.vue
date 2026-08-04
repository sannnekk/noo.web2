<template>
  <div class="poll-participation-success-view">
    <div class="poll-participation-success-view__icon">
      <noo-icon name="check-green" />
    </div>
    <noo-title
      :size="3"
      align="center"
      no-margin
    >
      Спасибо за участие!
    </noo-title>
    <noo-text-block align="center">
      Ваши ответы отправлены и сохранены.
    </noo-text-block>
    <noo-text-block
      align="center"
      size="small"
      dimmed
      no-margin
    >
      Ответы можно отправить только один раз, изменить их уже не получится.
      Просмотреть ответы можно в личном кабинете на платформе, во вкладке
      "Профиль".
    </noo-text-block>
    <div class="poll-participation-success-view__actions">
      <noo-button
        variant="primary"
        :to="{ name: 'root' }"
      >
        К платформе
      </noo-button>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.poll-participation-success-view
  display: flex
  flex-direction: column
  align-items: center
  text-align: center
  padding-block: var(--space-s)

  &__icon
    font-size: fluid(3rem, 4rem)
    line-height: 1
    margin-bottom: var(--space-2xs)

  &__actions
    display: flex
    flex-wrap: wrap
    justify-content: center
    gap: var(--space-2xs)
    margin-top: var(--space-s)
</style>
