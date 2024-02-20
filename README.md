# skribbl.js

A fully typed library for interacting with Skribbl.io games.

## Why?

For reverse-engineering, Skribbl.io's protocol isn't ideal. It does not use any of the modern features of Socket.io, and instead opts for using a singular event name for all events involving the game. The fields in these events often use confusing naming conventions, and values are a mess - some numbers are strings, some booleans are numbers, etc. Anybody who is new to Socket.io, networking, or Skribbl.io as a whole will have a very difficult time understanding what's happening. This library aims to resolve those issues, providing a fully typed, documented, and simple interface for interacting with Skribbl.io.

## Installation

With NPM:

```sh
npm install skribbl.js
```

or with Yarn:

```sh
yarn add skribbl.js
```

## Protocol

If you're interested in a more barebones approach, all of the type definitions (and some documentation) for the protocol can be found in [this file](./src/api.ts). You can use these in combination with Socket.io's TypeScript support to create your own implementations, such as the following.

```ts
import io, { Socket } from "socket.io-client";
import { is, APIUserGuessed, ListenEvents, EmitEvents } from "skribbl.js";

const socket: Socket<ListenEvents, EmitEvents> = io("https://example.com");

socket.on("data", (data) => {
  if (is<APIUserGuessed>(data, 30)) {
    // `data.data` is now typed as `APIUserGuessed`, which includes the user's ID and their guess.
  }
});
```

## Examples

A collection of examples can be found in [the examples directory](./examples).
