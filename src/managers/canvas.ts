import { Stroke } from "..";
import { APIClearCanvas, APIDraw, APIUndo } from "../api";
import { Room } from "../room";

export const colors = [
  "white",
  "black",
  "gray",
  "darkGray",
  "red",
  "darkRed",
  "orange",
  "darkOrange",
  "yellow",
  "darkYellow",
  "green",
  "darkGreen",
  "turqoise",
  "darkTurqoise",
  "skyBlue",
  "darkSkyBlue",
  "blue",
  "darkBlue",
  "purple",
  "darkPurple",
  "pink",
  "darkPink",
  "tan",
  "darkTan",
  "brown",
  "darkBrown",
] as const;
export type Color = (typeof colors)[number];

export class CanvasManager {
  private room: Room;

  constructor(room: Room) {
    this.room = room;
  }

  /**
   * Draws a stroke to the screen. This should only be called when the user is the drawer.
   * @param strokes The strokes to draw.
   */
  draw(strokes: Stroke[]) {
    this.room.emitData<APIDraw>(
      19,
      strokes.map((stroke) => {
        if (stroke.tool === "brush") {
          return [
            0,
            colors.indexOf(stroke.color),
            stroke.thickness!,
            stroke.x,
            stroke.y,
            stroke.x2,
            stroke.y2,
          ];
        } else {
          return [
            1,
            colors.indexOf(stroke.color),
            stroke.x,
            stroke.y,
            undefined,
            undefined,
            undefined,
          ];
        }
      }),
    );
  }

  /**
   * Fills a certain area with a color. This should only be called when the user is the drawer. The section to fill is automatically determined based on the cursor posiiton.
   * @param color The color to fill with.
   * @param x The X position of the cursor.
   * @param y The Y position of the cursor.
   */
  fill(color: Color, x: number, y: number) {
    this.room.emitData<APIDraw>(19, [
      [1, colors.indexOf(color), x, y, undefined, undefined, undefined],
    ]);
  }

  /**
   * Draws a line to the screen. This should only be called when the user is the drawer.
   * @param color The color of the line.
   * @param thickness The thickness of the line.
   * @param x1 The starting X position.
   * @param y1 The starting Y position.
   * @param x2 The ending X position.
   * @param y2 The ending Y position.
   */
  drawLine(
    color: Color,
    thickness: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) {
    this.draw([{ color, thickness, tool: "brush", x: x1, y: y1, x2, y2 }]);
  }

  /**
   * Draws a rectangle to the screen. This should only be called when the user is the drawer.
   * @param color The color of the rectangle.
   * @param thickness The thickness of the rectangle's border.
   * @param x1 The starting X position.
   * @param y1 The starting Y position.
   * @param x2 The ending X position.
   * @param y2 The ending Y position.
   */
  drawRectangle(
    color: Color,
    thickness: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) {
    const defaults = { color, thickness, tool: "brush" } as const;

    this.draw([
      { ...defaults, x: x1, y: y1, x2, y2: y1 },
      { ...defaults, x: x2, y: y1, x2, y2 },
      { ...defaults, x: x2, y: y2, x2: x1, y2 },
      { ...defaults, x: x1, y: y2, x2: x1, y2: y1 },
    ]);
  }

  /**
   * Draws a polygon to the screen. This should only be called when the user is the drawer.
   * @param color The color of the polygon.
   * @param thickness The thickness of the polygon's border.
   * @param x The center X position.
   * @param y The center Y position.
   * @param radius The radius of the polygon.
   * @param sides The number of sides to use when drawing the polygon.
   */
  drawPolygon(
    color: Color,
    thickness: number,
    x: number,
    y: number,
    radius: number,
    sides: number,
  ) {
    let strokes: Stroke[] = [];
    let prevX = x + radius;
    let prevY = y;
    for (let i = 1; i <= sides; i++) {
      const angle = (i / sides) * 2 * Math.PI;
      const newX = x + radius * Math.cos(angle);
      const newY = y + radius * Math.sin(angle);
      strokes.push({
        color,
        thickness,
        tool: "brush",
        x: prevX,
        y: prevY,
        x2: newX,
        y2: newY,
      });
      prevX = newX;
      prevY = newY;
    }

    // Since there can only be 8 strokes per packet, we need to split the strokes into multiple packets.
    const packets: Stroke[][] = [];
    for (let i = 0; i < strokes.length; i += 8) {
      packets.push(strokes.slice(i, i + 8));
    }

    for (const packet of packets) {
      this.draw(packet);
    }
  }

  /**
   * Clears the canvas. This should only be called when the user is the drawer.
   */
  clear() {
    this.room.emitData<APIClearCanvas>(20);
  }

  /**
   * Undoes the last action. This should only be called when the user is the drawer.
   * @param strokeIndex The index of the stroke to undo.
   * @todo Somehow implements some logic to automatically determine the last action, removing the need for the `strokeIndex` parameter.
   */
  undo(strokeIndex: number) {
    this.room.emitData<APIUndo>(21, strokeIndex);
  }
}
