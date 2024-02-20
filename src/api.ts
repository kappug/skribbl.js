type APIData<T = any, I = number> = T extends undefined
  ? { id: I }
  : { id: I; data: T };

export interface APIUser {
  id: number;
  name: string;
  avatar: APIAvatar;
  score: number;
  guessed: boolean;
  flags: number;
}
export type APIUserAdded = APIData<APIUser, 1>;
export type APIUserRemoved = APIData<
  {
    id: number;
    reason: 0 | 1 | 2;
  },
  2
>;
/**
 * @note Sent when a user votekicks another user. The indexes represent the following:
 * - 0: The voter's ID.
 * - 1: The target's ID.
 * - 2: The current amount of votes.
 * - 3: The required amount of votes for the target to be kicked.
 */
export type APIUserVotekicked = APIData<[number, number, number, number], 5>;
export type APIUserVoted = APIData<
  {
    id: number;
    vote: 0 | 1;
  },
  8
>;
export interface APIState {
  data: {
    drawCommands: APIStroke[];
    hints: APIHint[];
    id: number;
    word: number[];
  };
  id: number;
  time: number;
}
export type APIRoomInformation = APIData<
  {
    settings: [number, number, number, number, number, number, number, number];
    id: string;
    type: 0 | 1;
    me: number;
    owner: number;
    users: APIUser[];
    round: number;
    state: APIState;
  },
  10
>;
export type APIUpdateGameStarted = APIData<number, 2>;
export type APIUpdateWordChoicesGiven = APIData<
  {
    id: number;
    words?: string[];
  },
  3
>;
export type APIUpdateWordChosen = APIData<
  {
    drawCommands: APIStroke[];
    hints: APIHint[];
    id: number;
    word: number[];
  },
  4
>;
/**
 * @note The array is split into chunks of 3. The indexes represent the following:
 * - 0: The user's ID.
 * - 1: The user's total score, after the round bonus has been added.
 * - 2: The amount of points the user earned in the round.
 * @todo Figure out the rest of the `reason` values.
 */
export type APIUpdateRoundResultsShown = APIData<
  {
    reason: 0;
    scores: number[];
    word: string;
  },
  5
>;
/**
 * @note The indexes of each array represent the following:
 * - 0: The user's ID
 * - 1: The user's position on the podium.
 * - 2: Unknown.
 * @todo Figure out the meaning of the third index.
 */
export type APIUpdatePodiumShown = APIData<[number, number, number][], 6>;
export type APIUpdateGameEnded = APIData<0, 7>;
export type APIGameUpdated = APIData<{ time: number } & APIData<any>, 11>;
export type APISettingsUpdated = APIData<
  {
    id: number;
    val: number;
  },
  12
>;
export type APIHint = [number, string];
export type APIHintRevealed = APIData<APIHint[], 13>;
export type APITimeUpdated = APIData<number, 14>;
export type APIGuessedCorrectly = APIData<
  {
    id: number;
    word?: string;
  },
  15
>;
export type APIGuessedClosely = APIData<string, 16>;
export type APIOwnerUpdated = APIData<number, 17>;
/**
 * @note The indexes represent the following:
 *
 * All
 * - 0: The tool (0 = brush, 1 = fill)
 * - 1: The color.
 *
 * Brush
 * - 2: The brush thickness.
 * - 3: The starting X position.
 * - 4: The starting Y position.
 * - 5: The ending X position.
 * - 6: The ending Y position.
 *
 * Fill
 * - 2: The X position.
 * - 3: The Y position.
 */
export type APIStroke = [
  number,
  number,
  number,
  number,
  number | undefined,
  number | undefined,
  number | undefined,
];
export type APIDrawn = APIData<APIStroke[], 19>;
export type APICanvasCleared = APIData<undefined, 20>;
export type APIUserGuessed = APIData<{ id: number; msg: string }, 30>;
export type APIStartGameFailed = APIData<{ id: 0 | 100; data?: number }, 31>;
export type APISpamDetected = APIData<undefined, 32>;

export interface ListenEvents {
  data: (data: APIData) => void;
  joinerr: (reason: number) => void;
}

export type APIAvatar = [number, number, number, number];
export interface APILoginOptions {
  avatar: APIAvatar;
  create: 0 | 1;
  join: 0 | string;
  lang: `${number}`;
  name: string;
}
export type APIKickUser = APIData<number, 3>;
export type APIBanUser = APIData<number, 4>;
export type APIVotekickUser = APIData<number, 5>;
export type APIReportUser = APIData<
  {
    id: number;
    reason: number;
  },
  6
>;
export type APIMuteUser = APIData<number, 7>;
export type APIVote = APIData<number, 8>;
export type APIUpdateSettings = APIData<
  {
    id: string | number;
    val: string;
  },
  12
>;
export type APIChooseWord = APIData<number, 18>;
export type APIDraw = APIData<APIStroke[], 19>;
export type APIClearCanvas = APIData<undefined, 20>;
export type APIUndo = APIData<number, 21>;
/** @note The `data` passed is the list of custom words, seperated by commas. If there are none, the string should be empty. */
export type APIStartGame = APIData<string, 22>;
export type APIEndGame = APIData<undefined, 23>;
export type APIGuess = APIData<string, 30>;

export interface EmitEvents {
  login: (options: APILoginOptions) => void;
  data: (data: APIData) => void;
}

/**
 * Checks if the given data is of the type `T`.
 * @template T The type to check for.
 * @param data The data to check.
 * @param id The ID to check against.
 * @returns Whether the data is of the type `T`.
 */
export function is<T extends APIData>(data: APIData, id: T["id"]): data is T {
  return data.id === id;
}
