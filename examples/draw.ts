/** @fileoverview This is an example that uses most of the drawing functions in {@link Room.canvas}. */

import { Client } from "../src/client";
import { AvatarBuilder } from "../src/builders/avatar";
import { SettingsBuilder } from "../src/builders/settings";
import { colors } from "../src/managers/canvas";

async function main() {
  const client = new Client({
    username: "Example",
    avatar: new AvatarBuilder().build(),
  });

  const room = await client.connect({
    language: "english",
    shouldCreateRoom: true,
  });

  let selfId: number;

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
    if (user.id !== selfId) return;

    room.chooseWord(0);
    console.log(`Chose a word: ${words![0]}`);

    let x = 32;
    for (let i = 4; i < 40; i += 4) {
      room.canvas.drawLine("black", i, x, 32, x, 32);
      x += 10 + i;
    }

    room.canvas.drawRectangle("black", 4, 32, 64, 128, 192);
    room.canvas.drawPolygon("black", 4, 220, 128, 64, 32);
    room.canvas.drawRectangle("black", 4, 320, 64, 416, 192);
    room.canvas.fill("black", 356, 150);
    room.canvas.drawPolygon("black", 4, 512, 128, 64, 32);
    room.canvas.fill("black", 512, 128);

    for (let i = 0; i < colors.length; i++) {
      room.canvas.drawLine(colors[i]!, 16, 32 + i * 16, 208, 32 + i * 16, 320);
    }
  });
}

main();
