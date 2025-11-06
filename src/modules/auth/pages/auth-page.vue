<template>
  <div class="auth-page">
    <div
      class="auth-page__inner"
      style="background-image: url('/img/line-background.svg')"
    >
      <div class="auth-page__inner__background">
        <div class="auth-page__inner__background__logo">
          <noo-main-logo />
        </div>
        <div class="auth-page__inner__background__typing-text">
          <noo-typing-text
            :words="[
              'Ты можешь поступить на бюджет туда, куда хочешь!',
              'Здесь заканчиваются твои проблемы в подготовке!',
              'Ты можешь больше! Ты можешь лучше!'
            ]"
            :speed="50"
          />
        </div>
        <div class="auth-page__inner__background__image">
          <img
            src="/img/auth-icon-space.svg"
            alt="Auth Icon Space"
          />
        </div>
        <div class="auth-page__inner__background__actions">
          <div class="auth-page__inner__background__actions__title">
            <h4>Приобрести наши курсы можно здесь:</h4>
          </div>
          <div class="auth-page__inner__background__actions__list">
            <noo-button
              variant="primary"
              size="large"
              :to="AppConstants.courseShopLink"
              new-tab
            >
              Курсы ЕГЭ
            </noo-button>
            <noo-button
              variant="secondary"
              size="large"
              :to="AppConstants.courseShopLink"
              new-tab
            >
              Курсы ОГЭ
            </noo-button>
          </div>
        </div>
      </div>
      <div class="auth-page__inner__content">
        <div class="auth-page__inner__content__inner">
          <noo-animated-router-view />
          <div class="auth-page__inner__content__inner__rights">
            <noo-text-block
              size="small"
              align="center"
            >
              Все права защищены &copy; {{ new Date().getFullYear() }}
              <br />
              <noo-inline-link :href="AppConstants.privacyLink">
                Политика конфиденциальности
              </noo-inline-link>
              <br />
              <noo-inline-link :href="AppConstants.termsLink">
                Договор публичной оферты
              </noo-inline-link>
            </noo-text-block>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/core/composables/useTheme'
import { AppConstants } from '@/core/config/constants.config'
import { useAuthStore } from '@/core/stores/auth.store'

interface Props {
  redirect?: string
}

const props = defineProps<Props>()

const authStore = useAuthStore()

authStore.setRedirect(props.redirect)

const { setTheme } = useTheme()

setTheme('light')
</script>

<style scoped lang="sass">
.auth-page
	height: 100vh
	overflow: hidden
	background: var(--light-background-color)

	&__inner
		display: grid
		grid-template: "background content" / 2fr 1fr
		width: calc(100% - 20px)
		height: calc(100% - 20px)
		background-color: #fff
		background-position: center
		background-repeat: no-repeat
		background-size: contain
		margin: 10px
		border-radius: var(--border-radius)

		&__background
			height: 100%
			grid-area: background
			padding: 3em
			display: flex
			flex-direction: column
			gap: 1em
			justify-content: space-around

			&__typing-text
				font-size: 2.5em
				height: 130px

			&__image
				padding: 1em 0
				display: flex
				justify-content: center

				img
					width: 85%

			&__actions
				display: flex
				flex-direction: column

				&__title
					font-size: 1em

				&__list
					display: flex
					gap: 1em

		&__content
			height: 100%
			grid-area: content
			display: flex
			justify-content: center
			align-items: center
			border-radius: 10px
			padding: 2em

			&__inner
				border-radius: var(--border-radius)
				background: var(--light-background-color)
				box-shadow: var(--block-shadow)
				width: 100%
				padding: 2em 2em 0.3em 2em
				transition: height 0.3s ease-in-out
				overflow-y: auto
				overflow-x: hidden
				max-height: calc(100vh - 20px - 4em)

				&__rights
					margin-top: 3em
					color: var(--text-light)
</style>
