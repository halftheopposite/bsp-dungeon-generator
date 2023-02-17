import { TileMap } from "./types";

/**
 * An object containing random options that can be customized.
 */
export interface RandomOptions {
  /**
   * The seed used for generating random values.
   */
  seed: string | null;
  random(): number;
}

/**
 * Singleton configuration object for generating random options.
 */
export const randomOptions: RandomOptions = {
  seed: null,
  random: Math.random
};

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
 * Resize a tilemap.
 */
export function resizeTileMap(
  tilemap: TileMap,
  width: number,
  height: number
): TileMap {
  const result: TileMap = [];

  for (let y = 0; y < height; y++) {
    result[y] = [];
    for (let x = 0; x < width; x++) {
      let value = 0;

      if (y < tilemap.length && x < tilemap[y].length) {
        value = tilemap[y][x];
      }

      result[y][x] = value;
    }
  }

  return result;
}

/**
 * Shuffle an array's entries into a new one.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(randomOptions.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

/**
 * Generate a random number between `min` and `max`.
 */
export function random(min: number, max: number): number {
  return Math.floor(randomOptions.random() * (max - min + 1) + min);
}

/**
 * Return one of the values matching the randomly selected weight.
 */
export function randomWeights<T>(weights: number[], values: T[]): T {
  const num = randomOptions.random();
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

/**
 * Return one of the values.
 */
export function randomChoice<T>(values: T[]): T {
  return values[Math.floor(randomOptions.random() * values.length)];
}

/**
 * Return `true` if probability is matched.
 */
export function randomProbability(probability: number): boolean {
  return randomOptions.random() > 1 - probability;
}

/**
 * Create and return a deep copy of a tilemap.
 */
export function duplicateTilemap(tilemap: TileMap): TileMap {
  return tilemap.map((row) => {
    return [...row];
  });
}
