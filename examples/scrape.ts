/** @fileoverview This is an example that scrapes the offical word list using two bots. */

import { Client } from "../src/client";
import { AvatarBuilder } from "../src/builders/avatar";
import { readFile, writeFile } from "fs/promises";
import { SettingsBuilder } from "../src/builders/settings";

async function main() {
  let savedWords = JSON.parse(await readFile("./data/english.json", "utf8"));

  const client = new Client({
    username: "Example",
    avatar: new AvatarBuilder().build(),
  });

  const room = await client.connect({
    language: "english",
    shouldCreateRoom: true,
  });

  let rooms = [room];

  room.on("join", (information) => {
    console.log(
      `Created a private room: https://skribbl.io/?${information.roomId}`,
    );

    const settings = new SettingsBuilder(room.settings)
      .setMaxDrawTime(15)
      .setWordCount(10)
      .setRounds(14)
      .build();

    room.updateSettings(settings);

    setTimeout(async () => {
      rooms.push(
        await client.connect({
          language: "english",
          roomId: information.roomId,
        }),
      );

      rooms[1].on("join", () => {
        room.startGame();
      });

      for (let i = 0; i < rooms.length; i++) {
        rooms[i].on("wordChoices", (user, words) => {
          if (user.id !== i) return;

          rooms[i].chooseWord(0);

          for (const word of words!) {
            if (!savedWords.includes(word)) {
              console.log(`Found a new word: ${word} (${savedWords.length})`);
              savedWords.push(word);
            }
          }
          writeFile("./data/english.json", JSON.stringify(savedWords));

          setTimeout(() => {
            rooms[+!i]!.guess(words![0]);
          }, 250);
        });
      }
    }, 2000);
  });

  room.on("endGame", () => {
    room.startGame();
  });
}

main();
