import { Pattern } from "../types";

export const smallLarge: Pattern = {
  width: 5,
  height: 2,
  type: "trap",
  tiles: [
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
  ],
};

export const smallLong: Pattern = {
  width: 2,
  height: 5,
  type: "trap",
  tiles: [
    [1, 1],
    [1, 1],
    [1, 1],
    [1, 1],
    [1, 1],
  ],
};

export const all: Pattern[] = [smallLarge, smallLong];
