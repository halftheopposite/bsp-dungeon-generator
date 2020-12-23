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
  template: RoomTemplate;

  constructor(x: number, y: number, id: string, template: RoomTemplate) {
    super(x, y, template.width, template.height);

    this.id = id;
    this.template = template;
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
export type RoomType =
  | "entrance"
  | "monsters"
  | "heal"
  | "treasure"
  | "mini-boss"
  | "boss";
export const RoomTypes: RoomType[] = [
  "entrance",
  "monsters",
  "heal",
  "treasure",
  "mini-boss",
  "boss",
];
export interface RoomTemplate {
  id: string;
  type: RoomType;
  width: number;
  height: number;
  layers: {
    tiles: TileMap;
    props: TileMap;
    monsters: TileMap;
  };
}

export type PatternType = "hole" | "trap" | "entrance";
export interface Pattern {
  type: PatternType;
  width: number;
  height: number;
  tiles: TileMap;
}

//
// Tiles
//
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
export enum TileType {
  Hole = -1,
  Wall = 1,
}
export const TileTypes = Object.keys(TileType);

//
// Props
//
export enum PropType {
  // Traps
  Peak = 1,
  // Decor
  Bone = 2,
  CrateSilver = 3,
  CrateWood = 4,
  Flag = 5,
  Handcuff1 = 6,
  Handcuff2 = 7,
  Lamp = 8,
  Skull = 9,
  StonesLarge = 10,
  StonesSmall = 11,
  Torch = 12,
  WebLeft = 13,
  WebRight = 14,
  // Items
  HealthLarge = 15,
  HealthSmall = 16,
  KeyGold = 17,
  KeySilver = 18,
  ManaLarge = 19,
  ManaSmall = 20,
  // Spawns
  Ladder = 21,
}
export const PropTypes = Object.keys(PropType);

//
// Monsters
//
export enum MonsterType {
  Bandit = 1,
  Mushroom = 2,
  Skeleton = 3,
  Troll = 4,
}
export const MonsterTypes = Object.keys(MonsterType);

//
// Tilemap
//
export type TileMap = number[][];
export type TileMaps = { [layer: string]: TileMap };
export type TileLayer = "tiles" | "props" | "monsters";
export const TileLayers: TileLayer[] = ["tiles", "props", "monsters"];
