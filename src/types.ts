//
// Tree
//
export class TreeNode<T> {
  left?: TreeNode<T>;
  right?: TreeNode<T>;
  leaf: T;

  constructor(data: T) {
    this.leaf = data;
  }

  get leaves(): T[] {
    const result: T[] = [];

    if (this.left && this.right) {
      result.push(...this.left.leaves, ...this.right.leaves);
    } else {
      result.push(this.leaf);
    }

    return result;
  }
}

//
// Containers
//
export type Direction = "horizontal" | "vertical";

export class Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get center(): Point {
    return new Point(this.x + this.width / 2, this.y + this.height / 2);
  }

  get surface(): number {
    return this.width * this.height;
  }

  get down(): number {
    return this.y + this.height;
  }

  get right(): number {
    return this.x + this.width;
  }
}

export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Room extends Rectangle {
  holes?: Pattern;

  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height);
  }
}

export class Corridor extends Rectangle {
  traps?: Pattern;
  direction: Direction;

  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height);

    this.direction = width > height ? "horizontal" : "vertical";
  }
}

export class Container extends Rectangle {
  room?: Room;
  corridor?: Corridor;

  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height);
  }
}

//
// Patterns
//
export type PatternType = "hole" | "trap";
export interface Pattern {
  type: PatternType;
  width: number;
  height: number;
  tiles: TileMap;
}

//
// Props
//
export enum PropType {
  Spikes = 1,
}

//
// Entities
//
export type MonsterType = "bandit" | "mushroom" | "skeleton" | "troll";
export class Monster extends Point {
  radius: number;
  type: MonsterType;

  constructor(x: number, y: number, radius: number, type: MonsterType) {
    super(x, y);

    this.radius = radius;
    this.type = type;
  }
}

//
// Tilemap
//
export type TileMap = number[][];
export enum TileDirection {
  North = 1,
  West = 2,
  East = 4,
  South = 8,
  NorthWest = 16,
  NorthEast = 32,
}
export const DirectionNW = TileDirection.North | TileDirection.West;
export const DirectionNEW =
  TileDirection.North | TileDirection.East | TileDirection.West;
export const DirectionNES =
  TileDirection.North | TileDirection.East | TileDirection.South;
export const DirectionNWS =
  TileDirection.North | TileDirection.West | TileDirection.South;
export const DirectionNEWS =
  TileDirection.North |
  TileDirection.East |
  TileDirection.West |
  TileDirection.South;
