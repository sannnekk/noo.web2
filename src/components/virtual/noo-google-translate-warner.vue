<template>
  <noo-warning-block v-if="googleTranslateDetected">
    Похоже, Вы используете расширение Google Translate для Вашего браузера.
    Пожалуйста, отключите его и перезагрузите страницу для корректной работы
    платформы
  </noo-warning-block>
</template>

<script lang="ts" setup>
import { debounce } from 'lodash'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const googleTranslateDetected = ref(false)

let observer: MutationObserver | null = null

async function detectGoogleTranslate(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    // Check for the global 'google' object and its 'translate' property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (window.google && (window.google as any).translate) {
      resolve(true);

 return;
    }

    // Check goog-gt-tt id
    if (document.getElementById('goog-gt-tt')) {
      resolve(true);

 return;
    }

    // Check for specific iframes added by the extension
    if (
      document.querySelector('.goog-te-banner-frame') ||
      document.querySelector('.goog-te-menu-frame')
    ) {
      resolve(true);

 return;
    }

    // Check for elements with classes that start with 'goog-t'
    if (document.querySelector('[class^="goog-t"]')) {
      resolve(true);

 return;
    }

    resolve(false);
  })
}

onMounted(async () => {
  if (await detectGoogleTranslate()) {
    googleTranslateDetected.value = true
  } else {
    googleTranslateDetected.value = false
  }

  observer = new MutationObserver(
    debounce(async () => {
      if (await detectGoogleTranslate()) {
        googleTranslateDetected.value = true
        observer?.disconnect()
      } else {
        googleTranslateDetected.value = false
      }
    }, 5000)
  )

  observer.observe(document.body, { childList: true, subtree: true })
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>
