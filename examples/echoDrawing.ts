/** @fileoverview This is an example that echoes back exactly what the user draws. */

import { Client } from "../src/client";
import { AvatarBuilder } from "../src/builders/avatar";
import { Stroke } from "../src/events";
import { SettingsBuilder } from "../src/builders/settings";

async function main() {
  const client = new Client({
    username: "Example",
    avatar: new AvatarBuilder().build(),
  });

  const room = await client.connect({
    language: "english",
    shouldCreateRoom: true,
  });

  let drawerId: number;
  let selfId: number;
  let startTime: number;
  let savedStrokes: { time: number; strokes: Stroke[] }[] = [];
  let clears: number[] = [];
  let undos: { time: number; strokeIndex: number }[] = [];

  room.on("join", (information) => {
    console.log(
      `Created a private room: https://skribbl.io/?${information.roomId}`,
    );

    const settings = new SettingsBuilder(room.settings)
      .setMaxDrawTime(15)
      .build();

    room.updateSettings(settings);

    selfId = information.selfId;
  });

  room.on("addUser", () => {
    room.startGame();
  });

  room.on("wordChoices", (user, words) => {
    drawerId = user.id;

    if (user.id !== selfId) return;

    room.chooseWord(0);
    console.log(`Chose a word: ${words![0]}`);
  });

  room.on("chooseWord", () => {
    if (drawerId === selfId) {
      for (const { time, strokes } of savedStrokes) {
        setTimeout(() => {
          room.canvas.draw(strokes);
        }, time);
      }

      for (const clear of clears) {
        setTimeout(() => {
          room.canvas.clear();
        }, clear);
      }

      for (const { time, strokeIndex } of undos) {
        setTimeout(() => {
          room.canvas.undo(strokeIndex);
        }, time);
      }
    } else {
      startTime = Date.now();
    }
  });

  room.on("draw", (strokes) => {
    if (drawerId !== selfId)
      savedStrokes.push({ time: Date.now() - startTime, strokes });
  });

  room.on("clear", () => {
    if (drawerId !== selfId) clears.push(Date.now() - startTime);
  });

  room.on("undo", (strokeIndex) => {
    if (drawerId !== selfId)
      undos.push({ time: Date.now() - startTime, strokeIndex });
  });

  room.on("endRound", () => {
    if (drawerId === selfId) {
      savedStrokes = [];
      clears = [];
      undos = [];
    }
  });
}

main();
