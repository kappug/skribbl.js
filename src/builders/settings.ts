import { Settings } from "../events";
import { Language } from "../language";

/**
 * A builder for configuring the settings of a room.
 * @example
 * ```ts
 * const settings = new SettingsBuilder(room.settings)
 *   .setMaxPlayers(5)
 *   .setMaxDrawTime(30)
 *   .setRounds(5)
 *   .build();
 *
 * room.updateSettings(settings);
 * ```
 */
export class SettingsBuilder {
  private settings: Settings;

  constructor(settings?: Settings) {
    this.settings = settings || {
      language: "english",
      maxPlayers: 8,
      maxDrawTime: 80,
      rounds: 3,
      wordCount: 3,
      maxHints: 2,
      wordMode: "normal",
      useCustomWordsOnly: false,
    };
  }

  /**
   * Sets the language of the room.
   * @param language The language to set.
   */
  setLanguage(language: Language) {
    this.settings.language = language;
    return this;
  }

  /**
   * Sets the maximum number of players in the room.
   * @param maxPlayers The maximum number of players to set.
   */
  setMaxPlayers(maxPlayers: number) {
    this.settings.maxPlayers = maxPlayers;
    return this;
  }

  /**
   * Sets the maximum drawing time in the room.
   * @param maxDrawTime The maximum drawing time to set.
   */
  setMaxDrawTime(maxDrawTime: number) {
    this.settings.maxDrawTime = maxDrawTime;
    return this;
  }

  /**
   * Sets the number of rounds per game.
   * @param rounds The number of rounds to set.
   */
  setRounds(rounds: number) {
    this.settings.rounds = rounds;
    return this;
  }

  /**
   * Sets the number of given words to choose when drawing.
   * @param wordCount The number of words to give.
   */
  setWordCount(wordCount: number) {
    this.settings.wordCount = wordCount;
    return this;
  }

  /**
   * Sets the maximum number of hints to give when guessing.
   * @param maxHints The maximum number of hints to give.
   */
  setMaxHints(maxHints: number) {
    this.settings.maxHints = maxHints;
    return this;
  }

  /**
   * Sets the word mode of the room.
   * @param wordMode The word mode to set.
   */
  setWordMode(wordMode: "normal" | "hidden" | "combination") {
    this.settings.wordMode = wordMode;
    return this;
  }

  /**
   * Sets whether to use custom words only.
   * @param useCustomWordsOnly Whether to use custom words only.
   */
  setUseCustomWordsOnly(useCustomWordsOnly: boolean) {
    this.settings.useCustomWordsOnly = useCustomWordsOnly;
    return this;
  }

  /**
   * Builds the settings.
   */
  build() {
    return this.settings;
  }
}
