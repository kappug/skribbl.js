import { Room } from "../room";
import {
  is,
  APIUserAdded,
  APIUserRemoved,
  APIRoomInformation,
  APIUserGuessed,
  APIUserVotekicked,
  APIUserVoted,
  APIGameUpdated,
  APIUpdateWordChoicesGiven,
  APISettingsUpdated,
  APIHintRevealed,
  APIUpdateWordChosen,
  APIGuessedClosely,
  APIGuessedCorrectly,
  APIOwnerUpdated,
  APICanvasCleared,
  APIStartGameFailed,
  APISpamDetected,
  APIDrawn,
  APIUpdateGameEnded,
  APIUpdateRoundResultsShown,
  APIUpdatePodiumShown,
  APIUndo,
} from "../api";
import { Stroke, parseUser, parseSettings, parseStroke } from "../events";

export class EventManager {
  private room: Room;

  constructor(room: Room) {
    this.room = room;
  }

  registerEvents() {
    this.room.socket!.on("data", (data) => {
      if (is<APIUserAdded>(data, 1)) {
        this.room.users.set(data.data.id, parseUser(this.room, data.data));

        this.room.emit("addUser", parseUser(this.room, data.data));
      } else if (is<APIUserRemoved>(data, 2)) {
        this.room.emit(
          "removeUser",
          this.room.users.get(data.data.id)!,
          (["disconnected", "kicked", "banned"] as const)[data.data.reason],
        );

        this.room.users.delete(data.data.id);
      } else if (is<APIUserVotekicked>(data, 5))
        this.room.emit(
          "votekick",
          this.room.users.get(data.data[0])!,
          this.room.users.get(data.data[1])!,
          data.data[2],
          data.data[3],
        );
      else if (is<APIUserVoted>(data, 8))
        this.room.emit(
          "vote",
          this.room.users.get(data.data.id)!,
          !data.data.vote,
        );
      else if (is<APIRoomInformation>(data, 10)) {
        this.room.users = new Map(
          data.data.users.map((user) => [user.id, parseUser(this.room, user)]),
        );

        const settings = parseSettings(data.data.settings);
        this.room.settings = settings;

        let strokes: Stroke[] = [];

        if (data.data.state.data.drawCommands) {
          for (const stroke of data.data.state.data.drawCommands) {
            strokes.push(parseStroke(stroke));
          }
        }

        this.room.emit("join", {
          selfId: data.data.me,
          ownerId: data.data.owner,
          roomId: data.data.id,
          settings,
          previousStrokes: strokes,
          currentRound: data.data.round,
          isPrivate: data.data.type === 1,
        });
      } else if (is<APIGameUpdated>(data, 11)) {
        if (is<APIUpdateWordChoicesGiven>(data.data, 3)) {
          const { id, words } = data.data
            .data as APIUpdateWordChoicesGiven["data"];

          this.room.emit("wordChoices", this.room.users.get(id)!, words);
        } else if (is<APIUpdateWordChosen>(data.data, 4)) {
          const { word } = data.data.data as APIUpdateWordChosen["data"];

          const hint = new Array(word.length).fill("");

          for (let i = 0; i < word.length; i++) {
            hint[i] = "_".repeat(word[i]!);
          }

          this.room.hint = hint.join(" ");
          this.room.emit("chooseWord");
        } else if (is<APIUpdateRoundResultsShown>(data.data, 5)) {
          const { scores, word } = data.data
            .data as APIUpdateRoundResultsShown["data"];
          const scoreChanges: Record<number, number> = {};
          const totalScores: Record<number, number> = {};

          for (let i = 0; i < scores.length; i += 3) {
            scoreChanges[scores[i]!] = scores[i + 2]!;
            totalScores[scores[i]!] = scores[i + 1]!;
          }

          for (const user of this.room.users.values()) {
            this.room.users.set(user.id, {
              ...user,
              hasGuessedCorrectly: false,
              score: totalScores[user.id]!,
            });
          }

          this.room.emit("endRound", word, scoreChanges);
        } else if (is<APIUpdatePodiumShown>(data.data, 6)) {
          const scores = data.data.data as APIUpdatePodiumShown["data"];
          const podium: Record<number, { position: number; score: number }> =
            {};

          for (const [id, position, score] of scores) {
            podium[id] = { position, score };
          }

          this.room.emit("podium", podium);
        } else if (is<APIUpdateGameEnded>(data.data, 7)) {
          for (const user of this.room.users.values()) {
            this.room.users.set(user.id, {
              ...user,
              score: 0,
            });
          }
          this.room.emit("endGame");
        }
      } else if (is<APISettingsUpdated>(data, 12)) {
        const settingKeys = [
          "language",
          "maxPlayers",
          "maxDrawTime",
          "rounds",
          "wordCount",
          "maxHints",
          "wordMode",
          "useCustomWordsOnly",
        ] as const;

        const settingKey = settingKeys[parseInt(data.data.id.toString())]!;
        (this.room.settings![settingKey] as number) = data.data.val;

        this.room.emit("settingsUpdate", this.room.settings!);
      } else if (is<APIHintRevealed>(data, 13)) {
        const split = this.room.hint.split("");
        for (const hint of data.data) {
          split[hint[0]] = hint[1];
        }
        this.room.hint = split.join("");
        this.room.emit("hintReveal", this.room.hint);
      } else if (is<APIGuessedCorrectly>(data, 15)) {
        const user = this.room.users.get(data.data.id)!;

        this.room.users.set(data.data.id, {
          ...user,
          hasGuessedCorrectly: true,
        });

        this.room.emit("correctGuess", user, data.data.word);
      } else if (is<APIGuessedClosely>(data, 16))
        this.room.emit("closeGuess", data.data);
      else if (is<APIOwnerUpdated>(data, 17))
        this.room.emit("newOwner", this.room.users.get(data.data)!);
      else if (is<APIDrawn>(data, 19)) {
        let strokes: Stroke[] = [];

        for (const stroke of data.data) {
          strokes.push(parseStroke(stroke));
        }

        this.room.emit("draw", strokes);
      } else if (is<APICanvasCleared>(data, 20)) this.room.emit("clear");
      else if (is<APIUndo>(data, 21)) this.room.emit("undo", data.data);
      else if (is<APIUserGuessed>(data, 30))
        this.room.emit(
          "guess",
          this.room.users.get(data.data.id)!,
          data.data.msg,
        );
      else if (is<APIStartGameFailed>(data, 31))
        this.room.emit(
          "startGameFail",
          ({ 0: "notEnoughPlayers", 100: "serverRestartSoon" } as const)[
            data.data.id
          ],
        );
      else if (is<APISpamDetected>(data, 32)) this.room.emit("spam");
    });

    this.room.socket!.on("joinerr", (reason) => {
      throw new Error(`Failed to join the room: ${reason}`);
    });
  }
}
