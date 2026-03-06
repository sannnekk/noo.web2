/**
 * Russian pluralization helper
 *
 * @param count - number (usually amount)
 * @param forms - array of 3 string forms:
 *   [0] = form for 1    (1 яблоко, 21 яблоко, 101 яблоко...)
 *   [1] = form for 2–4  (2 яблока, 23 яблока, 94 яблока...)
 *   [2] = form for 5+   (5 яблок, 11 яблок, 1000 яблок...)
 * @returns correct form
 *
 * @example
 * pluralizeRu(1,  ["яблоко", "яблока", "яблок"])    // "яблоко"
 * pluralizeRu(3,  ["яблоко", "яблока", "яблок"])    // "яблока"
 * pluralizeRu(25, ["яблоко", "яблока", "яблок"])    // "яблок"
 * pluralizeRu(0,  ["яблоко", "яблока", "яблок"])    // "яблок"
 */
export function pluralize(
  count: number,
  forms: [string, string, string]
): string {
  // Handle negative numbers and convert to absolute value
  const n = Math.abs(count)

  // Special case: 0 → uses genitive plural (5+ form)
  if (n === 0) {
    return forms[2]
  }

  // Last two digits determine the rule in most cases
  const lastTwo = n % 100
  const lastOne = n % 10

  // 11–14 → always genitive plural
  if (lastTwo >= 11 && lastTwo <= 14) {
    return forms[2]
  }

  // Main rule by last digit
  if (lastOne === 1) {
    return forms[0]
  }
  if (lastOne >= 2 && lastOne <= 4) {
    return forms[1]
  }

  // everything else → genitive plural (5,6,7,8,9,0)
  return forms[2]
}

export default { pluralize }
