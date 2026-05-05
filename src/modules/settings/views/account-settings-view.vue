<template>
  <div class="account-settings-view">
    <noo-section
      title="Личная информация"
      description="Эти данные видны только Вам и преподавателям. Они нужны нам для связи с Вами, поэтому важно, чтобы они были актуальными."
    >
      <noo-grid-layout
        :cols="2"
        gap="0.5em"
      >
        <noo-grid-layout-item
          :col="1"
          :row="1"
          horizontal-align="stretch"
          vertical-align="top"
        >
          <noo-text-input
            v-model="name"
            label="Имя и фамилия"
          />
        </noo-grid-layout-item>
        <noo-grid-layout-item
          :col="2"
          :row="1"
          horizontal-align="stretch"
          vertical-align="top"
        >
          <noo-text-input
            v-model="phone"
            label="Номер телефона"
          />
        </noo-grid-layout-item>
        <noo-grid-layout-item
          :col="1"
          :row="2"
          vertical-align="top"
          horizontal-align="stretch"
        >
          <noo-date-input
            v-model="date"
            label="Дата регистрации"
            readonly
          />
        </noo-grid-layout-item>
        <noo-grid-layout-item
          :col="2"
          :row="2"
          vertical-align="top"
          horizontal-align="stretch"
        >
          <noo-text-input
            v-model="email"
            label="Email"
            readonly
          />
          <noo-button
            variant="inline"
            size="small"
          >
            Сменить email
          </noo-button>
        </noo-grid-layout-item>
      </noo-grid-layout>
    </noo-section>
    <noo-section
      title="Активные сессии"
      description="Здесь отображаются все устройства, на которых Вы вошли в аккаунт. Если Вы заметили незнакомое устройство, рекомендуем выйти из всех сессий и сменить пароль."
    >
      <noo-card-stack>
        <session-card
          v-for="session in sessions"
          :key="session.id"
          :session="session"
        />
      </noo-card-stack>
    </noo-section>
    <noo-section
      title="Удаление аккаунта"
      description="Удаление аккаунта приведёт к безвозвратной потере доступа ко всем курсам и работам, а также к удалению всех данных, связанных с аккаунтом. Вся личная информация, включая имя, email, telegram и номер телефона, будет удалена. Если Вы уверены в своём решении, пожалуйста, нажмите кнопку ниже."
    >
      <noo-button
        variant="danger-inline"
        size="medium"
      >
        Удалить аккаунт
      </noo-button>
    </noo-section>
  </div>
</template>

<script lang="ts" setup>
import { type SessionEntity } from '../api/session.types.ts'
import SessionCard from '../components/session-card.vue'
import { ref } from 'vue'

const name = ref<string>('Иван Иванов')
const phone = ref<string>('+7 (999) 123-45-67')
const date = ref<Date>(new Date())
const email = ref<string>('nukleoid@outlook.com')
const sessions = ref<SessionEntity[]>([
  {
    _entityName: 'Session',
    id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    createdAt: new Date('2025-01-15T10:30:00Z'),
    updatedAt: null,
    lastRequestAt: new Date('2025-01-29T14:22:15Z'),
    device: 'MacBook Pro',
    os: 'macOS 14.2',
    browser: 'Chrome',
    deviceType: 'desktop'
  },
  {
    _entityName: 'Session',
    id: '01ARZ3NDEKTSV4RRFFQ69G5FAW',
    createdAt: new Date('2025-01-20T09:15:00Z'),
    updatedAt: null,
    lastRequestAt: new Date('2025-01-28T18:45:32Z'),
    device: 'iPhone 14 Pro',
    os: 'iOS 17.3',
    browser: 'Safari',
    deviceType: 'mobile'
  },
  {
    _entityName: 'Session',
    id: '01ARZ3NDEKTSV4RRFFQ69G5FAX',
    createdAt: new Date('2025-01-25T14:20:00Z'),
    updatedAt: null,
    lastRequestAt: new Date('2025-01-29T11:05:48Z'),
    device: 'Dell XPS 15',
    os: 'Windows 11',
    browser: 'Firefox',
    deviceType: 'desktop'
  },
  {
    _entityName: 'Session',
    id: '01ARZ3NDEKTSV4RRFFQ69G5FAY',
    createdAt: new Date('2025-01-28T08:45:00Z'),
    updatedAt: null,
    lastRequestAt: new Date('2025-01-29T15:30:12Z'),
    device: 'iPad Air',
    os: 'iPadOS 17.3',
    browser: 'Safari',
    deviceType: 'tablet'
  },
  {
    _entityName: 'Session',
    id: '01ARZ3NDEKTSV4RRFFQ69G5FAZ',
    createdAt: new Date('2025-01-29T07:00:00Z'),
    updatedAt: null,
    lastRequestAt: new Date('2025-01-29T16:10:25Z'),
    device: 'Samsung Galaxy S24',
    os: 'Android 14',
    browser: 'Chrome',
    deviceType: 'mobile'
  }
])
</script>
