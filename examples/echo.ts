/** @fileoverview This is an example that echoes back user guesses. */

import { Client } from "../src/client";
import { AvatarBuilder } from "../src/builders/avatar";

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

    selfId = information.selfId;
  });

  room.on("guess", (author, word) => {
    if (author.id === selfId) return;

    room.guess(`${author.username} guessed: ${word}`);
  });
}

main();
