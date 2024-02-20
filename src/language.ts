/**
 * This is a list of supported languages, taken directly from the official client.
 */
export const languages = [
  "english",
  "german",
  "bulgarian",
  "czech",
  "danish",
  "dutch",
  "finnish",
  "french",
  "estonian",
  "greek",
  "hebrew",
  "hungarian",
  "italian",
  "japanese",
  "korean",
  "latvian",
  "macedonian",
  "norwegian",
  "portuguese",
  "polish",
  "romanian",
  "russian",
  "serbian",
  "slovakian",
  "spanish",
  "swedish",
  "tagalog",
  "turkish",
] as const;

export type Language = (typeof languages)[number];

/**
 * Converts a language to its ID.
 * @param language The language to convert to an ID.
 * @returns The ID of the language.
 */
export function toLanguageId(language: Language) {
  return languages.indexOf(language);
}

/**
 * Converts a language ID to its language.
 * @param id The ID of the language to convert to a language.
 * @returns The language of the ID.
 */
export function fromLanguageId(id: number) {
  return languages[id];
}
