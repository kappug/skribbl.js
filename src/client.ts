import { EventEmitter } from "events";
import { APIAvatar } from "./api";
import { Room, RoomOptions } from "./room";
import { Language, toLanguageId } from "./language";

interface ClientOptions {
  username: string;
  avatar: APIAvatar;
}

const BASE_URL = "https://skribbl.io/api";

export class Client extends EventEmitter {
  options: ClientOptions;

  constructor(options: ClientOptions) {
    super();

    this.options = options;
  }

  /**
   * Fetches the socket URL for a room.
   * @param language The language to use for the room.
   * @param roomId The room ID to join. This should only be used for joining a specific room.
   * @returns The socket URL for the room.
   */
  async getSocketURL(language: Language, roomId?: string) {
    const params = new URLSearchParams();

    if (language) params.append("lang", toLanguageId(language).toString());
    if (roomId) params.append("id", roomId);

    const res = await fetch(BASE_URL + "/play", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    return await res.text();
  }

  /**
   * Connects to a room.
   * @param options The options to connect.
   * @returns The room that was connected to.
   */
  async connect(options: RoomOptions) {
    const room = new Room(
      this,
      options,
      await this.getSocketURL(options.language, options.roomId),
    );

    return room;
  }
}
