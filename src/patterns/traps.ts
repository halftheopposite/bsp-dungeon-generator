import { Pattern } from "../types";

export const smallSquare: Pattern = {
  width: 2,
  height: 2,
  type: "trap",
  tiles: [
    [1, 1],
    [1, 1],
  ],
};

export const all: Pattern[] = [smallSquare];
