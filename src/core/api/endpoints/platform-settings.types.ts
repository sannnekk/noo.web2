/**
 * The links and contacts the platform points visitors at. Editable by admins
 * rather than compiled in, so a changed support chat or a moved offer does not
 * need a release.
 */
export interface PlatformSettings {
  /** The school's site, where courses are bought. */
  shopLink: string
  privacyPolicyLink: string
  termsLink: string
  supportChatLink: string
  /** How the support chat is written out, e.g. `@noo_support_chat`. */
  supportChatName: string
  supportEmail: string
  /** How long an answer takes, in the words shown to the reader. */
  supportResponseTime: string
}
