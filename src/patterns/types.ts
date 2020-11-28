import { TileMap } from "../types";

export type PatternType = "holes";

export interface Pattern {
  type: PatternType;
  width: number;
  height: number;
  tiles: TileMap;
}
