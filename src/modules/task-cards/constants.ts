/**
 * Fewer cards than this on a subject and a quiz is not worth running: the same
 * handful would come back every time. Mirrors `SavedTaskConfig` on the API,
 * which enforces it — this copy only keeps the setup form from offering a run
 * the server would refuse.
 */
export const MIN_QUIZ_CARD_COUNT = 5

export const MAX_QUIZ_CARD_COUNT = 50

export const DEFAULT_QUIZ_CARD_COUNT = 10
