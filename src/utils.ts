import { TileMap } from "./types";

/**
 * Create an empty tilemap.
 */
export function createTilemap(
  width: number,
  height: number,
  value: number
): TileMap {
  const tilemap: TileMap = [];

  for (let y = 0; y < height; y++) {
    tilemap[y] = [];
    for (let x = 0; x < width; x++) {
      tilemap[y][x] = value;
    }
  }

  return tilemap;
}

/**
 * Shuffle an array's entries into a new one.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

/**
 * Generate a random number between `min` and `max`.
 */
export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Return one of the values matching the randomly selected weight.
 */
export function randomInRanges<T>(weights: number[], values: T[]): T {
  const num = Math.random();
  let s = 0;
  let lastIndex = weights.length - 1;

  for (var i = 0; i < lastIndex; ++i) {
    s += weights[i];
    if (num < s) {
      return values[i];
    }
  }

  return values[lastIndex];
}
