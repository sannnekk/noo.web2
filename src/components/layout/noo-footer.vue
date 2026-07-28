<template>
  <footer class="the-footer">
    <div class="container">
      <div class="row">
        <div class="col-md-4">
          <div class="the-footer__logo">
            <h1>
              <img
                src="/img/logo-circled.svg"
                alt="НОО логотип"
              />
              <a href="https://noo-school.ru"> <b>НОО.</b>Платформа </a>
            </h1>
          </div>
        </div>
        <div class="col-md-8">
          <div class="the-footer__links">
            <a
              href="https://no-os.ru"
              target="_blank"
            >
              &copy; {{ new Date().getFullYear() }} НОО-Школа
            </a>
            <span class="dot">&bullet;</span>
            <a
              href="https://no-os.ru/confidentiality"
              target="_blank"
            >
              Политика конфиденциальности
            </a>
            <span class="dot">&bullet;</span>
            <a
              href="https://no-os.ru/oferta"
              target="_blank"
            >
              Договор публичной оферты
            </a>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <p class="the-footer__cookies">
            Используя сайт, вы даете согласие на использование файлов cookie для
            улучшения работы сайта.
          </p>
        </div>
      </div>
    </div>
  </footer>
  <br />
</template>

<style scoped lang="sass">
.the-footer
  margin-top: 1em
  padding-bottom: 1em
  border-radius: var(--border-radius)
  background-color: var(--light-background-color)

  > .container
    padding-top: 0.5em

  &__logo
    margin: 0
    padding: 0
    height: 3rem
    display: flex
    justify-content: flex-start
    align-items: center

    h1
      margin: 0
      margin-top: -0.6rem
      padding: 0

    img
      height: fluid(1rem, 2rem)
      margin-right: 0.5rem
      position: relative
      top: fluid(0.1rem, 0.6rem)

    a
      color: var(--text-light)
      text-decoration: none
      font-size: fluid(0.8rem, 1rem)
      font-weight: normal
      transition: color 0.2s

      &:hover
        color: var(--lila)

  &__links
    height: 3rem
    display: flex
    justify-content: flex-end
    gap: 0.3rem
    align-items: center
    color: var(--text-light)
    font-size: fluid(0.6rem, 0.9rem)

    +down(lg)
      padding-top: var(--space-3xs)

    +mobile
      padding-top: var(--space-l)
      flex-direction: column
      align-items: flex-start

      .dot
        display: none

    a
      color: var(--text-light)
      text-decoration: none
      transition: color 0.2s

      &:hover
        color: var(--lila)

  &__cookies
    color: var(--text-light)
    font-size: fluid(0.6rem, 0.8rem)
    margin-top: 0.5rem
    margin-bottom: 0
    text-align: right
    padding: 0
    font-weight: 300
    line-height: 1.2

    +down(lg)
      text-align: left
</style>

<style lang="sass">
body.theme--dark .the-footer__logo h1 img
  filter: invert(1)
</style>
