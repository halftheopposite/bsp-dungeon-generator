import { Pattern } from "../types";

export const giantStarSquare: Pattern = {
  width: 6,
  height: 6,
  type: "holes",
  tiles: [
    [-1, -1, 0, 0, -1, -1],
    [-1, 0, 0, 0, 0, -1],
    [0, 0, -1, -1, 0, 0],
    [0, 0, -1, -1, 0, 0],
    [-1, 0, 0, 0, 0, -1],
    [-1, -1, 0, 0, -1, -1],
  ],
};

export const largeSquare: Pattern = {
  width: 5,
  height: 5,
  type: "holes",
  tiles: [
    [-1, -1, 0, -1, -1],
    [-1, -1, 0, -1, -1],
    [0, 0, 0, 0, 0],
    [-1, -1, 0, -1, -1],
    [-1, -1, 0, -1, -1],
  ],
};

export const mediumSquare: Pattern = {
  width: 3,
  height: 3,
  type: "holes",
  tiles: [
    [-1, -1, -1],
    [-1, -1, -1],
    [-1, -1, -1],
  ],
};

export const smallLong: Pattern = {
  width: 2,
  height: 5,
  type: "holes",
  tiles: [
    [-1, -1],
    [-1, -1],
    [-1, -1],
    [-1, -1],
    [-1, -1],
  ],
};

export const smallLarge: Pattern = {
  width: 5,
  height: 2,
  type: "holes",
  tiles: [
    [-1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1],
  ],
};

export const smallSquare: Pattern = {
  width: 2,
  height: 2,
  type: "holes",
  tiles: [
    [-1, -1],
    [-1, -1],
  ],
};

export const all: Pattern[] = [
  giantStarSquare,
  largeSquare,
  mediumSquare,
  smallLong,
  smallLarge,
  smallSquare,
];
