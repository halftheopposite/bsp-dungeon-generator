import { Pattern } from "../types";

export const giantStarSquare: Pattern = {
  width: 6,
  height: 6,
  type: "hole",
  tiles: [
    [-1, -1, 0, 0, -1, -1],
    [-2, 0, 0, 0, 0, -2],
    [0, 0, -1, -1, 0, 0],
    [0, 0, -2, -2, 0, 0],
    [-1, 0, 0, 0, 0, -1],
    [-2, -1, 0, 0, -1, -2],
  ],
};

export const largeSquare: Pattern = {
  width: 5,
  height: 5,
  type: "hole",
  tiles: [
    [-1, -1, 0, -1, -1],
    [-2, -2, 0, -2, -2],
    [0, 0, 0, 0, 0],
    [-1, -1, 0, -1, -1],
    [-2, -2, 0, -2, -2],
  ],
};

export const mediumSquare: Pattern = {
  width: 3,
  height: 3,
  type: "hole",
  tiles: [
    [-1, -1, -1],
    [-2, -2, -2],
    [-2, -2, -2],
  ],
};

export const smallLong: Pattern = {
  width: 2,
  height: 5,
  type: "hole",
  tiles: [
    [-1, -1],
    [-2, -2],
    [-2, -2],
    [-2, -2],
    [-2, -2],
  ],
};

export const smallLarge: Pattern = {
  width: 5,
  height: 2,
  type: "hole",
  tiles: [
    [-1, -1, -1, -1, -1],
    [-2, -2, -2, -2, -2],
  ],
};

export const smallSquare: Pattern = {
  width: 2,
  height: 2,
  type: "hole",
  tiles: [
    [-1, -1],
    [-2, -2],
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
