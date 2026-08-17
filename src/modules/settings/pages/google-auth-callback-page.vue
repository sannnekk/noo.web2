<template>
  <div class="google-auth-callback-page">
    <noo-text-block dimmed>
      {{ message }}
    </noo-text-block>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, shallowRef } from 'vue'
import type { GoogleOAuthMessage } from '../composables/useGoogleOAuth'

const message = shallowRef('Завершаем авторизацию в Google…')

/**
 * Google redirects the consent popup here. This page does nothing but hand the
 * authorization code back to the window that opened it and close itself — the
 * code is never used from this context.
 */
onMounted(() => {
  const params = new URLSearchParams(window.location.search)

  const payload: GoogleOAuthMessage = {
    source: 'noo-google-oauth',
    code: params.get('code') ?? undefined,
    state: params.get('state') ?? undefined,
    error: params.get('error') ?? undefined
  }

  if (!window.opener) {
    message.value =
      'Это окно открывается автоматически при подключении Google. Закройте его и повторите попытку из настроек.'

    return
  }

  window.opener.postMessage(payload, window.location.origin)
  message.value = 'Готово. Это окно можно закрыть.'
  window.close()
})
</script>

<style lang="sass" scoped>
.google-auth-callback-page
  display: flex
  align-items: center
  justify-content: center
  min-height: 100vh
  padding: 2em
  text-align: center
</style>
