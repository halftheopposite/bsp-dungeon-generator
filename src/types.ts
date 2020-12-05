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

  /** Get the bottom-most leaves */
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

export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

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

export class Container extends Rectangle {
  room?: Room;
  corridor?: Corridor;

  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height);
  }
}

export class Room extends Rectangle {
  id: string;
  entrance?: Pattern;
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

//
// Patterns
//
export type PatternType = "hole" | "trap" | "entrance";
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
  Peak = 1,
  Torch = 2,
  Bone = 3,
  Skull = 4,
  WebLeft = 5,
  WebRight = 6,
  CrateSilver = 7,
  CrateWood = 8,
  Ladder = 9,
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
  NorthWest = 1,
  North = 2,
  NorthEast = 4,
  West = 8,
  East = 16,
  SouthWest = 32,
  South = 64,
  SouthEast = 128,
}
