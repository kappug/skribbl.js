import { EventEmitter } from "events";
import { APIAvatar } from "./api";
import axios, { AxiosInstance } from "axios";
import { Room, RoomOptions } from "./room";
import { Language, toLanguageId } from "./language";

interface ClientOptions {
  username: string;
  avatar: APIAvatar;
}

export class Client extends EventEmitter {
  options: ClientOptions;
  private axios: AxiosInstance;

  constructor(options: ClientOptions) {
    super();

    this.options = options;
    this.axios = axios.create({
      baseURL: "https://skribbl.io:3000",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
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

    const res = await this.axios.post<string>("/play", params);
    return res.data;
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
