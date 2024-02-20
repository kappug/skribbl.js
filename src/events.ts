import { APIStroke, APIUser } from "./api";
import { Language, fromLanguageId } from "./language";
import { Color, colors } from "./managers/canvas";
import { Room } from "./room";

export interface Avatar {
  eyes: number;
  mouth: number;
  skinColor: number;
  special: number;
}

export type ReportReason =
  | "innapropriateMessagesOrDrawings"
  | "spam"
  | "bottingOrCheating";

export interface User {
  id: number;
  username: string;
  avatar: Avatar;
  score: number;
  hasGuessedCorrectly: boolean;
  isAdmin: boolean;
  /** @see {@link Room.kickUser} */
  kick: () => void;
  /** @see {@link Room.banUser} */
  ban: () => void;
  /** @see {@link Room.votekickUser} */
  votekick: () => void;
  /** @see {@link Room.reportUser} */
  report: (reasons: ReportReason[]) => void;
  /**
   * @see {@link Room.muteUser}
   * @deprecated See {@link Room.muteUser} for more details.
   */
  mute: () => void;
}

/**
 * Parses a raw user into an object usable by the library.
 * @param room The room the user is in.
 * @param user The user to parse.
 * @returns The parsed user.
 */
export function parseUser(room: Room, user: APIUser): User {
  return {
    id: user.id,
    username: user.name,
    avatar: {
      eyes: user.avatar[0],
      mouth: user.avatar[1],
      skinColor: user.avatar[2],
      special: user.avatar[3],
    },
    score: user.score,
    hasGuessedCorrectly: user.guessed,
    isAdmin: (user.flags & 16) === 16,
    kick: () => room.kickUser(user.id),
    ban: () => room.banUser(user.id),
    votekick: () => room.votekickUser(user.id),
    report: (reasons) => room.reportUser(user.id, reasons),
    mute: () => room.muteUser(user.id),
  };
}

export interface Settings {
  language: Language;
  maxPlayers: number;
  maxDrawTime: number;
  rounds: number;
  wordCount: number;
  maxHints: number;
  wordMode: "normal" | "hidden" | "combination";
  useCustomWordsOnly: boolean;
}

/**
 * Parses raw settings into an object usable by the library.
 * @param settings The raw settings to parse.
 * @returns The parsed settings.
 */
export function parseSettings(
  settings: [number, number, number, number, number, number, number, number],
): Settings {
  return {
    language: fromLanguageId(settings[0])!,
    maxPlayers: settings[1],
    maxDrawTime: settings[2],
    rounds: settings[3],
    wordCount: settings[4],
    maxHints: settings[5],
    wordMode: (["normal", "hidden", "combination"] as const)[settings[6]]!,
    useCustomWordsOnly: settings[7] === 1,
  };
}

export type Tool = "brush" | "fill";

export interface Stroke {
  tool: Tool;
  color: Color;
  x: number;
  y: number;
  thickness?: number;
  x2?: number;
  y2?: number;
}

/**
 * Parses a raw stroke into an object usable by the library.
 * @param stroke The raw stroke to parse.
 * @returns The parsed stroke.
 */
export function parseStroke(stroke: APIStroke): Stroke {
  if (stroke[0] === 0) {
    return {
      tool: "brush",
      color: colors[stroke[1]!]!,
      thickness: stroke[2],
      x: stroke[3]!,
      y: stroke[4]!,
      x2: stroke[5],
      y2: stroke[6],
    };
  } else {
    return {
      tool: "fill",
      color: colors[stroke[1]!]!,
      x: stroke[2]!,
      y: stroke[3]!,
    };
  }
}

export interface RoomInformation {
  selfId: number;
  ownerId?: number;
  roomId: string;
  settings: Settings;
  previousStrokes: Stroke[];
  currentRound: number;
  isPrivate: boolean;
}

export interface RoomEvents {
  addUser: (user: User) => void;
  removeUser: (
    user: User,
    reason: "disconnected" | "kicked" | "banned",
  ) => void;
  votekick: (
    voter: User,
    target: User,
    votes: number,
    requiredVotes: number,
  ) => void;
  vote: (voter: User, vote: boolean) => void;
  wordChoices: (user: User, words?: string[]) => void;
  join: (information: RoomInformation) => void;
  startGame: () => void;
  chooseWord: () => void;
  endRound: (word: string, scoreChanges: Record<number, number>) => void;
  podium: (podium: Record<number, { position: number; score: number }>) => void;
  endGame: () => void;
  settingsUpdate: (settings: Settings) => void;
  hintReveal: (hint: string) => void;
  correctGuess: (author: User, word?: string) => void;
  closeGuess: (word: string) => void;
  newOwner: (owner: User) => void;
  draw: (strokes: Stroke[]) => void;
  clear: () => void;
  undo: (strokeIndex: number) => void;
  guess: (author: User, word: string) => void;
  startGameFail: (reason: "notEnoughPlayers" | "serverRestartSoon") => void;
  spam: () => void;
}
