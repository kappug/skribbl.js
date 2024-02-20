import { APIAvatar } from "../api";

/**
 * A builder for creating avatars.
 */
export class AvatarBuilder {
  private avatar: APIAvatar;

  constructor(avatar?: APIAvatar) {
    this.avatar = avatar || [0, 0, 0, 0];
  }

  /**
   * Sets the eyes of the avatar.
   * @param eyes The eyes to set.
   */
  setEyes(eyes: number) {
    this.avatar[0] = eyes;
    return this;
  }

  /**
   * Sets the mouth of the avatar.
   * @param mouth The mouth to set.
   */
  setMouth(mouth: number) {
    this.avatar[1] = mouth;
    return this;
  }

  /**
   * Sets the skin of the avatar.
   * @param skin The skin to set.
   */
  setSkinColor(skinColor: number) {
    this.avatar[2] = skinColor;
    return this;
  }

  /**
   * Sets the special feature of the avatar.
   * @param special The special feature to set.
   */
  setSpecial(special: number) {
    this.avatar[3] = special;
    return this;
  }

  /**
   * Builds the avatar into a form that can be used by Skribbl.
   * @returns The avatar.
   */
  build() {
    return this.avatar;
  }
}
