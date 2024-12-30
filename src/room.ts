import { EventEmitter } from "events";
import { Client } from "./client";
import { EventManager } from "./managers/event";
import { Socket, io } from "socket.io-client";
import {
  APIBanUser,
  APIChooseWord,
  APIEndGame,
  APIGuess,
  APIKickUser,
  APIMuteUser,
  APIReportUser,
  APIStartGame,
  APIUpdateSettings,
  APIVote,
  APIVotekickUser,
  EmitEvents,
  ListenEvents,
} from "./api";
import { ReportReason, RoomEvents, Settings, User } from "./events";
import { CanvasManager } from "./managers/canvas";
import { Language, toLanguageId } from "./language";

export interface RoomOptions {
  language: Language;
  shouldCreateRoom?: boolean;
  roomId?: string;
}

export class Room extends EventEmitter {
  options: RoomOptions;
  private client: Client;
  private eventManager = new EventManager(this);
  socket?: Socket<ListenEvents, EmitEvents>;

  override on = <K extends keyof RoomEvents>(
    event: K,
    listener: RoomEvents[K],
  ) => super.on(event, listener);
  override emit = <K extends keyof RoomEvents>(
    event: K,
    ...args: Parameters<RoomEvents[K]>
  ) => super.emit(event, ...args);

  canvas = new CanvasManager(this);
  users = new Map<number, User>();
  hint = "";
  settings?: Settings;

  constructor(client: Client, options: RoomOptions, url: string) {
    super();

    this.client = client;
    this.options = options;

    this.join(url);
  }

  private async join(url: string) {
    this.socket = io(url, { transports: ["websocket"] });
    this.socket.on("connect", () => {
      this.eventManager.registerEvents();
      this.socket!.emit("login", {
        name: this.client.options.username,
        avatar: this.client.options.avatar,
        create: this.options.shouldCreateRoom ? 1 : 0,
        join: this.options.roomId ?? 0,
        lang: this.options.language.toString() as `${number}`,
      });
    });
  }

  /**
   * Emits data to the server (with type safety).
   * @template T The type of data to emit.
   * @param id The ID of the data to emit.
   * @param data The data to emit.
   */
  emitData<T extends { id: number; data?: any }>(
    id: T["id"],
    data?: T["data"],
  ) {
    this.socket?.emit("data", { id, data });
  }

  /**
   * Kicks a user by their ID. This should only be called when the user is the owner of the room.
   * @param userId The user to kick.
   */
  kickUser(userId: number) {
    this.emitData<APIKickUser>(3, userId);
  }

  /**
   * Bans a user by their ID. This should only be called when the user is the owner of the room.
   * @param userId The user to kick.
   */
  banUser(userId: number) {
    this.emitData<APIBanUser>(4, userId);
  }

  /**
   * Votekicks a user by their ID. This should only be called when the target is drawing.
   * @param userId The user to votekick.
   */
  votekickUser(userId: number) {
    this.emitData<APIVotekickUser>(5, userId);
  }

  /**
   * Reports a user by their ID.
   * @param userId The user to report.
   * @param reasons The reason to report the user. Atleast one should be provided.
   */
  reportUser(userId: number, reasons: ReportReason[]) {
    let code = 0;
    for (const reason of reasons) {
      code |=
        1 <<
        [
          "innapropriateMessagesOrDrawings",
          "spam",
          "bottingOrCheating",
        ].indexOf(reason);
    }

    this.emitData<APIReportUser>(6, { id: userId, reason: code });
  }

  /**
   * Mutes a user by their ID.
   * @param userId The user to mute.
   * @deprecated This function does seemingly nothing on the network level. User message filtering is handled by the client anyways, and the server still sends messages by muted users.
   */
  muteUser(userId: number) {
    this.emitData<APIMuteUser>(7, userId);
  }

  /**
   * Votes on (likes or dislikes) the current drawing.
   * @param vote The vote, `true` being a like, and `false` being a dislike.
   */
  vote(vote: boolean) {
    this.emitData<APIVote>(8, Number(vote));
  }

  /**
   * Updates the room settings. This should only be called when the user is the owner of the room.
   * @param settings The settings to update.
   */
  updateSettings(settings: Partial<Settings>) {
    const updateSetting = (id: number, value: number) => {
      this.emitData<APIUpdateSettings>(12, {
        id: id === 7 ? id : id.toString(),
        val: value.toString(),
      });
    };

    for (const [name] of Object.entries(settings)) {
      const key = name as keyof Settings;

      if (key === "maxPlayers") updateSetting(1, settings.maxPlayers!);
      else if (key === "language")
        updateSetting(0, toLanguageId(settings.language!));
      else if (key === "maxDrawTime") updateSetting(2, settings.maxDrawTime!);
      else if (key === "rounds") updateSetting(3, settings.rounds!);
      else if (key === "wordMode")
        updateSetting(
          6,
          ["normal", "hidden", "combination"].indexOf(settings.wordMode!),
        );
      else if (key === "wordCount") updateSetting(4, settings.wordCount!);
      else if (key === "maxHints") updateSetting(5, settings.maxHints!);
      else if (key === "useCustomWordsOnly")
        updateSetting(7, settings.useCustomWordsOnly ? 1 : 0);
    }
  }

  /**
   * Chooses a word from the list of word choices. This should only be called when the user is able to choose a word.
   * @param index The index of the word to choose.
   */
  chooseWord(index: number) {
    this.emitData<APIChooseWord>(18, index);
  }

  /**
   * Starts the game. This should only be called when the user is the owner of the room.
   * @param customWords The custom words to use.
   */
  startGame(customWords?: string[]) {
    this.emitData<APIStartGame>(22, customWords?.join(",") ?? "");
  }

  /**
   * Ends the game. This should only be called when the user is the owner of the room.
   */
  endGame() {
    this.emitData<APIEndGame>(23);
  }

  /**
   * Guesses a word.
   * @param word The word to guess.
   */
  guess(word: string) {
    this.emitData<APIGuess>(30, word);
  }

  /**
   * Disconnects from the room and closes the socket.
   */
  disconnect() {
    this.socket?.close();
  }
}
