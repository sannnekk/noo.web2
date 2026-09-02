<template>
  <div class="auth-page">
    <div class="auth-page__inner">
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
        <div
          v-if="settings"
          class="auth-page__inner__background__actions"
        >
          <div class="auth-page__inner__background__actions__title">
            <h4>Приобрести наши курсы можно здесь:</h4>
          </div>
          <div class="auth-page__inner__background__actions__list">
            <noo-button
              variant="primary"
              size="large"
              :to="settings.shopLink"
              new-tab
            >
              Курсы ЕГЭ
            </noo-button>
            <noo-button
              variant="secondary"
              size="large"
              :to="settings.shopLink"
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
          <div class="auth-page__inner__content__inner__help">
            <noo-text-block
              size="small"
              no-margin
            >
              Возникли проблемы или вопросы?
            </noo-text-block>
            <noo-help-widget />
          </div>
          <div class="auth-page__inner__content__inner__rights">
            <noo-text-block
              size="small"
              align="center"
            >
              Все права защищены &copy; {{ new Date().getFullYear() }}
              <template v-if="settings">
                <br />
                <noo-inline-link :href="settings.privacyPolicyLink">
                  Политика конфиденциальности
                </noo-inline-link>
                <br />
                <noo-inline-link :href="settings.termsLink">
                  Договор публичной оферты
                </noo-inline-link>
              </template>
            </noo-text-block>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/core/composables/useTheme'
import { usePlatformSettings } from '@/core/stores/platform-settings.store'
import { useAuthStore } from '@/core/stores/auth.store'

interface Props {
  redirect?: string
}

const props = defineProps<Props>()

const authStore = useAuthStore()

authStore.setRedirect(props.redirect)

// The auth screen is drawn light whatever the reader prefers elsewhere.
const { mode } = useTheme()

mode.value = 'light'

const settings = usePlatformSettings()
</script>

<style scoped lang="sass">
.auth-page
	+full-height
	overflow: hidden
	background: var(--light-background-color)

	+tablet-down
		height: auto
		min-height: 100vh
		min-height: 100dvh
		overflow: visible

	&__inner
		display: grid
		grid-template: "background content" / 2fr 1fr
		width: calc(100% - 20px)
		height: calc(100% - 20px)
		background-color: #fff
		background-image: url('/img/line-background.svg')
		background-position: center
		background-repeat: no-repeat
		background-size: contain
		margin: 10px
		border-radius: var(--border-radius)

		+tablet-down
			grid-template: "background" auto "content" 1fr / minmax(0, 1fr)
			background-image: none
			height: auto
			min-height: calc(100vh - 20px)
			min-height: calc(100dvh - 20px)

		+mobile
			width: 100%
			height: auto
			min-height: 100vh
			min-height: 100dvh
			margin: 0
			border-radius: 0

		&__background
			height: 100%
			grid-area: background
			padding: 3em
			display: flex
			flex-direction: column
			gap: 1em
			justify-content: space-around

			+tablet-down
				height: auto
				flex-direction: row
				flex-wrap: wrap
				align-items: center
				justify-content: space-between
				gap: var(--space-2xs)
				padding: var(--space-s) var(--page-gutter) 0

			&__logo
				// The logo is an <h1> in a child component — em on this
				// wrapper scales it without crossing the scoped boundary.
				+tablet-down
					font-size: 0.7em

				+mobile
					font-size: 0.55em

			&__typing-text
				font-size: fluid(1.5rem, 2.5rem)
				height: 130px

				+tablet-down
					display: none

			&__image
				padding: 1em 0
				display: flex
				justify-content: center

				img
					width: 85%

				+tablet-down
					display: none

			&__actions
				display: flex
				flex-direction: column

				+tablet-down
					flex-direction: row
					align-items: center
					gap: var(--space-2xs)

				&__title
					font-size: 1em

					+tablet-down
						display: none

				&__list
					display: flex
					gap: 1em

					+tablet-down
						gap: var(--space-2xs)
						font-size: 0.8em

		&__content
			height: 100%
			grid-area: content
			display: flex
			justify-content: center
			align-items: center
			border-radius: 10px
			padding: 2em

			+tablet-down
				height: auto
				align-items: flex-start
				padding: var(--space-s) var(--page-gutter) var(--space-l)

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

				+tablet-down
					max-width: 30rem
					margin-inline: auto
					max-height: none
					overflow-y: visible
					padding: var(--space-m) var(--space-m) var(--space-2xs)

				+mobile
					padding: var(--space-s) var(--space-s) var(--space-2xs)

				&__help
					margin-top: 1em
					display: flex
					gap: 0.5em
					align-items: center
					justify-content: center
					flex-direction: row
					border-radius: var(--border-radius)
					background-color: var(--lightest)
					padding: 0.5em

				&__rights
					margin-top: 3em
					color: var(--text-light)

					+mobile
						margin-top: var(--space-m)
</style>
