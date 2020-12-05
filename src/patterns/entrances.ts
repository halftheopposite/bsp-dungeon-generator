import { Pattern } from "../types";

export const entrance1: Pattern = {
  width: 5,
  height: 5,
  type: "entrance",
  tiles: [
    [5, 0, 0, 8, 7],
    [0, 0, 0, 0, 0],
    [0, 0, 9, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 3, 0, 0, 0],
  ],
};

export const entrance2: Pattern = {
  width: 5,
  height: 5,
  type: "entrance",
  tiles: [
    [8, 8, 0, 0, 6],
    [4, 0, 0, 0, 0],
    [0, 0, 9, 0, 0],
    [0, 0, 0, 3, 0],
    [5, 0, 0, 0, 0],
  ],
};

export const all: Pattern[] = [entrance1, entrance2];
