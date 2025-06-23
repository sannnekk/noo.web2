export interface IAppConstants {
  privacyLink: string
  termsLink: string
  courseShopLink: string
  supportChatLink: string
  supportChatName: string
}

const AppConstants: IAppConstants = Object.freeze({
  privacyLink: 'https://no-os.ru/confidentiality',
  termsLink: 'https://no-os.ru/oferta',
  courseShopLink: 'https://no-os.ru',
  supportChatLink: 'https://t.me/+oACQzPflwZQ1ODRi',
  supportChatName: '@noo_support_chat'
})

export { AppConstants }
