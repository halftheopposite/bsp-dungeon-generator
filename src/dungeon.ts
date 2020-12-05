import PoissonDiscSampling from "poisson-disk-sampling";
import { Entrances, Holes, Traps } from "./patterns";
import {
  Container,
  Corridor,
  Direction,
  Monster,
  MonsterType,
  PropType,
  Room,
  TileDirection,
  TileMap,
  TreeNode,
} from "./types";
import {
  createTilemap,
  duplicateTilemap,
  random,
  randomChoice,
  randomProbability,
  randomWeights,
  shuffleArray,
} from "./utils";

export interface Args {
  /** Width of the map */
  mapWidth: number;
  /** Height of the map */
  mapHeight: number;
  /** Gutter of the top-most container (used for sub-containers) */
  mapGutterWidth: number;
  /** Number of recursive divisions */
  iterations: number;
  /** Gutter of a container */
  containerGutterWidth: number;
  /** Minimum size ratio for a container */
  containerSizeRatio: number;
  /** Chance that a room spaws in a container */
  roomSpawnChance: number;
  /** Gutter of a room */
  roomGutterWidth: number;
  /** Maximum monsters per room */
  roomMaxMonsters: number;
  /** Minimum size (width or height) under which it is discarded */
  roomMinSize: number;
  /** Chance that a hole will appear in a room */
  roomHoleChance: number;
  /** Width of corridors */
  corridorWidth: number;
  /** Chance that a trap will appear in a corridor */
  corridorTrapChance: number;
}

export interface Dungeon {
  /** The width in tiles */
  width: number;
  /** The height in tiles */
  height: number;
  /** The tree representing the dungeon */
  tree: TreeNode<Container>;
  /** The tilemap representing the dungeon */
  tiles: TileMap;
  /** The props in the dungeon (traps, flags, torches...) */
  props: TileMap;
  /** The monsters entities in the dungeon */
  monsters: Monster[];
}

export function generate(args: Args): Dungeon {
  const startAt = performance.now();

  const tree = createTree(args);
  const tiles = createTilesLayer(tree, args);
  const props = createPropsLayer(tree, tiles, args);
  const monsters = generateMonsters(tree, args);

  const endAt = performance.now();
  console.log(`Dungeon generated in ${endAt - startAt}ms`);

  return {
    width: args.mapWidth,
    height: args.mapHeight,
    tree,
    tiles,
    props,
    monsters,
  };
}

//
// Tree
//
function createTree(args: Args): TreeNode<Container> {
  const tree = generateTree(
    new Container(
      args.mapGutterWidth,
      args.mapGutterWidth,
      args.mapWidth - args.mapGutterWidth * 2,
      args.mapHeight - args.mapGutterWidth * 2
    ),
    args.iterations,
    args
  );

  generateRoomIds(tree);
  generateEntrance(tree);

  return tree;
}

function generateTree(
  container: Container,
  iterations: number,
  args: Args
): TreeNode<Container> {
  const node = new TreeNode<Container>(container);

  if (iterations !== 0) {
    // We still need to divide the container
    const [left, right] = splitContainer(container, args);
    node.left = generateTree(left, iterations - 1, args);
    node.right = generateTree(right, iterations - 1, args);

    // Once divided, we create a corridor between the two containers
    node.leaf.corridor = generateCorridor(
      node.left.leaf,
      node.right.leaf,
      args
    );
  } else {
    // We arrived at the bottom-most node and we can generate a room
    if (randomProbability(args.roomSpawnChance)) {
      node.leaf.room = generateRoom(container, args);
    }
  }

  return node;
}

function splitContainer(
  container: Container,
  args: Args
): [Container, Container] {
  let left: Container;
  let right: Container;

  // Generate a random direction to split the container
  const direction = randomChoice<Direction>(["vertical", "horizontal"]);
  if (direction === "vertical") {
    // Vertical
    left = new Container(
      container.x,
      container.y,
      random(1, container.width),
      container.height
    );
    right = new Container(
      container.x + left.width,
      container.y,
      container.width - left.width,
      container.height
    );

    // Retry splitting the container if it's not large enough
    const leftWidthRatio = left.width / left.height;
    const rightWidthRatio = right.width / right.height;
    if (
      leftWidthRatio < args.containerSizeRatio ||
      rightWidthRatio < args.containerSizeRatio
    ) {
      return splitContainer(container, args);
    }
  } else {
    // Horizontal
    left = new Container(
      container.x,
      container.y,
      container.width,
      random(1, container.height)
    );
    right = new Container(
      container.x,
      container.y + left.height,
      container.width,
      container.height - left.height
    );

    // Retry splitting the container if it's not high enough
    const leftHeightRatio = left.height / left.width;
    const rightHeightRatio = right.height / right.width;
    if (
      leftHeightRatio < args.containerSizeRatio ||
      rightHeightRatio < args.containerSizeRatio
    ) {
      return splitContainer(container, args);
    }
  }

  return [left, right];
}

function generateRoom(container: Container, args: Args): Room {
  // Generate the room's dimensions
  const x = Math.floor(
    container.x +
      args.containerGutterWidth +
      random(0, Math.floor(container.width / 4))
  );
  const y = Math.floor(
    container.y +
      args.containerGutterWidth +
      random(0, Math.floor(container.height / 4))
  );
  const width =
    container.width -
    (x - container.x) -
    args.containerGutterWidth -
    random(0, Math.floor(container.width / 4));
  const height =
    container.height -
    (y - container.y) -
    args.containerGutterWidth -
    random(0, Math.floor(container.height / 4));

  // Dismiss room if it does not fit minimum dimensions
  if (width < args.roomMinSize || height < args.roomMinSize) {
    return;
  }

  const room = new Room(x, y, width, height);

  // Generate the room's holes (if any)
  const hasHole = randomProbability(args.roomHoleChance);
  if (hasHole) {
    Holes.all.forEach((hole) => {
      if (
        !room.holes &&
        room.width >= hole.width * 2 &&
        room.height >= hole.height * 2
      ) {
        room.holes = hole;
      }
    });
  }

  return room;
}

function generateCorridor(
  left: Container,
  right: Container,
  args: Args
): Corridor {
  // Create the corridor
  const leftCenter = left.center;
  const rightCenter = right.center;
  const x = Math.ceil(leftCenter.x);
  const y = Math.ceil(leftCenter.y);

  let corridor: Corridor;
  if (leftCenter.x === rightCenter.x) {
    // Vertical
    corridor = new Corridor(
      x,
      y,
      Math.ceil(args.corridorWidth),
      Math.ceil(rightCenter.y) - y
    );
  } else {
    // Horizontal
    corridor = new Corridor(
      x,
      y,
      Math.ceil(rightCenter.x) - x,
      Math.ceil(args.corridorWidth)
    );
  }

  // Generate the corridor's traps (if any)
  const hasTrap = randomProbability(args.corridorTrapChance);
  if (hasTrap) {
    corridor.traps =
      corridor.direction === "horizontal" ? Traps.smallLarge : Traps.smallLong;
  }

  return corridor;
}

function generateRoomIds(tree: TreeNode<Container>) {
  let roomId = 0;
  tree.leaves.forEach((leaf) => {
    if (leaf.room) {
      leaf.room.id = `${roomId}`;
      roomId++;
    }
  });
}

function generateEntrance(tree: TreeNode<Container>) {
  let entranceFound = false;
  tree.leaves.forEach((leaf) => {
    if (entranceFound) {
      return;
    }

    const entrance = randomChoice(Entrances.all);
    if (leaf.width > entrance.width && leaf.height > entrance.height) {
      const x = Math.floor(leaf.center.x - entrance.width / 2);
      const y = Math.floor(leaf.center.y - entrance.height / 2);
      leaf.room = new Room(x, y, entrance.width, entrance.height);
      leaf.room.entrance = entrance;
      entranceFound = true;
    }
  });

  if (!entranceFound) {
    throw new Error("Could not find a room to create the dungeon entrance.");
  }
}

//
// Tiles
//
function createTilesLayer(tree: TreeNode<Container>, args: Args): TileMap {
  let tiles = createTilemap(args.mapWidth, args.mapHeight, 1);

  tiles = carveCorridors(tree, duplicateTilemap(tiles));
  tiles = carveRooms(tree, duplicateTilemap(tiles));
  tiles = carveTilesMask(duplicateTilemap(tiles));

  return tiles;
}

function carveRooms(node: TreeNode<Container>, tiles: TileMap) {
  node.leaves.forEach((container) => {
    if (!container.room) {
      return;
    }

    // Carve room
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const inHeightRange = y >= container.room.y && y < container.room.down;
        const inWidthRange = x >= container.room.x && x < container.room.right;
        if (inHeightRange && inWidthRange) {
          tiles[y][x] = 0;
        }
      }
    }

    // Carve holes
    const holes = container.room.holes;
    if (container.room.holes) {
      const startY = Math.ceil(container.room.center.y - holes.height / 2);
      const startX = Math.ceil(container.room.center.x - holes.width / 2);
      for (let y = 0; y < holes.height; y++) {
        for (let x = 0; x < holes.width; x++) {
          const posY = startY + y;
          const posX = startX + x;
          tiles[posY][posX] = holes.tiles[y][x];
        }
      }
    }
  });

  return tiles;
}

function carveCorridors(node: TreeNode<Container>, tiles: TileMap): TileMap {
  const corridor = node.leaf.corridor;
  if (!corridor) {
    return;
  }

  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      const inHeightRange = y >= corridor.y && y < corridor.down;
      const inWidthRange = x >= corridor.x && x < corridor.right;
      if (inHeightRange && inWidthRange) {
        tiles[y][x] = 0;
      }
    }
  }

  carveCorridors(node.left, tiles);
  carveCorridors(node.right, tiles);

  return tiles;
}

function carveTilesMask(tiles: TileMap) {
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      // Apply tilemask only to walls
      if (tiles[y][x] > 0) {
        tiles[y][x] = computeBitMask(x, y, tiles);
      }
    }
  }

  return tiles;
}

//
// Entities
//
function generateMonsters(node: TreeNode<Container>, args: Args): Monster[] {
  const monsters: Monster[] = [];

  node.leaves.forEach((node) => {
    const room = node.room;
    if (!room || room.entrance) {
      return;
    }

    const poisson = new PoissonDiscSampling({
      shape: [
        room.width - args.roomGutterWidth * 2,
        room.height - args.roomGutterWidth * 2,
      ],
      minDistance: 1.5,
      maxDistance: 4,
      tries: 10,
    });
    const points: Array<number[]> = poisson.fill();
    const shuffledPoints = shuffleArray(points);
    const slicedPoints = shuffledPoints.slice(0, args.roomMaxMonsters);

    slicedPoints.forEach((point) => {
      const x = room.x + args.roomGutterWidth + point[0];
      const y = room.y + args.roomGutterWidth + point[1];
      const type = randomWeights<MonsterType>(
        [0.5, 0.3, 0.15, 0.05],
        ["bandit", "skeleton", "troll", "mushroom"]
      );
      const radius = 3;

      monsters.push(new Monster(x, y, radius, type));
    });
  });

  return monsters;
}

//
// Props
//
function createPropsLayer(
  tree: TreeNode<Container>,
  tiles: TileMap,
  args: Args
): TileMap {
  let props = createTilemap(args.mapWidth, args.mapHeight, 0);

  props = carveTraps(tree, props);
  props = carveTorches(tiles, props);
  props = carveEntrance(tree, props);
  props = cleanProps(tree, props); // Optional

  return props;
}

function carveTraps(node: TreeNode<Container>, props: TileMap): TileMap {
  let result = duplicateTilemap(props);

  const corridor = node.leaf.corridor;
  if (!corridor) {
    return result;
  }

  // Carve traps
  if (corridor.traps) {
    const traps = corridor.traps;
    const startY = Math.ceil(corridor.center.y - traps.height / 2);
    const startX = Math.ceil(corridor.center.x - traps.width / 2);
    for (let y = 0; y < traps.height; y++) {
      for (let x = 0; x < traps.width; x++) {
        const posY = startY + y;
        const posX = startX + x;
        result[posY][posX] = PropType.Peak;
      }
    }
  }

  result = carveTraps(node.left, result);
  result = carveTraps(node.right, result);

  return result;
}

function carveTorches(tiles: TileMap, props: TileMap): TileMap {
  let result = duplicateTilemap(props);

  for (let y = 0; y < result.length; y++) {
    for (let x = 0; x < result[y].length; x++) {
      const tileId = tiles[y][x];

      const leftCorner =
        maskToTileIdMap[
          TileDirection.North | TileDirection.West | TileDirection.NorthWest
        ];
      const rightCorner =
        maskToTileIdMap[
          TileDirection.North | TileDirection.East | TileDirection.NorthEast
        ];

      if (tileId === leftCorner || tileId === rightCorner) {
        result[y][x] = PropType.Torch;
      }
    }
  }

  return result;
}

function carveEntrance(node: TreeNode<Container>, props: TileMap): TileMap {
  let result = duplicateTilemap(props);

  node.leaves.forEach((leaf) => {
    const room = leaf.room;
    if (!room || !room.entrance) {
      return;
    }

    const entrance = room.entrance;
    const startY = Math.ceil(room.center.y - entrance.height / 2);
    const startX = Math.ceil(room.center.x - entrance.width / 2);
    for (let y = 0; y < entrance.height; y++) {
      for (let x = 0; x < entrance.width; x++) {
        const posY = startY + y;
        const posX = startX + x;
        result[posY][posX] = entrance.tiles[y][x];
      }
    }
  });

  return result;
}

function cleanProps(node: TreeNode<Container>, props: TileMap): TileMap {
  let result = duplicateTilemap(props);

  // Clean traps that are inside rooms
  node.leaves.forEach((container) => {
    if (!container.room) {
      return result;
    }

    for (let y = 0; y < result.length; y++) {
      for (let x = 0; x < result[y].length; x++) {
        const propId = result[y][x];
        if (propId === PropType.Peak) {
          const inHeightRange =
            y >= container.room.y && y < container.room.down;
          const inWidthRange =
            x >= container.room.x && x < container.room.right;
          if (inHeightRange && inWidthRange) {
            result[y][x] = 0;
          }
        }
      }
    }
  });

  return result;
}

//
// Utils
//
const maskToTileIdMap = {
  2: 1,
  8: 2,
  10: 3,
  11: 4,
  16: 5,
  18: 6,
  22: 7,
  24: 8,
  26: 9,
  27: 10,
  30: 11,
  31: 12,
  64: 13,
  66: 14,
  72: 15,
  74: 16,
  75: 17,
  80: 18,
  82: 19,
  86: 20,
  88: 21,
  90: 22,
  91: 23,
  94: 24,
  95: 25,
  104: 26,
  106: 27,
  107: 28,
  120: 29,
  122: 30,
  123: 31,
  126: 32,
  127: 33,
  208: 34,
  210: 35,
  214: 36,
  216: 37,
  218: 38,
  219: 39,
  222: 40,
  223: 41,
  246: 36,
  248: 42,
  250: 43,
  251: 44,
  254: 45,
  255: 46,
  0: 47,
};

function computeBitMask(x: number, y: number, tiles: TileMap): number {
  let mask = 0;

  if (tileDirectionCollides(x, y, "north", tiles)) {
    mask |= TileDirection.North;
  }

  if (tileDirectionCollides(x, y, "west", tiles)) {
    mask |= TileDirection.West;
  }

  if (tileDirectionCollides(x, y, "east", tiles)) {
    mask |= TileDirection.East;
  }

  if (tileDirectionCollides(x, y, "south", tiles)) {
    mask |= TileDirection.South;
  }

  if (
    mask & TileDirection.North &&
    mask & TileDirection.West &&
    tileDirectionCollides(x, y, "north-west", tiles)
  ) {
    mask |= TileDirection.NorthWest;
  }

  if (
    mask & TileDirection.North &&
    mask & TileDirection.East &&
    tileDirectionCollides(x, y, "north-east", tiles)
  ) {
    mask |= TileDirection.NorthEast;
  }

  if (
    mask & TileDirection.South &&
    mask & TileDirection.West &&
    tileDirectionCollides(x, y, "south-west", tiles)
  ) {
    mask |= TileDirection.SouthWest;
  }

  if (
    mask & TileDirection.South &&
    mask & TileDirection.East &&
    tileDirectionCollides(x, y, "south-east", tiles)
  ) {
    mask |= TileDirection.SouthEast;
  }

  return maskToTileIdMap[mask];
}

function tileDirectionCollides(
  x: number,
  y: number,
  side:
    | "north"
    | "west"
    | "east"
    | "south"
    | "north-west"
    | "north-east"
    | "south-west"
    | "south-east",
  tilemap: TileMap
) {
  const isLeft = x === 0;
  const isRight = x === tilemap[y].length - 1;
  const isTop = y === 0;
  const isBottom = y === tilemap.length - 1;

  switch (side) {
    case "north":
      return isTop || tilemap[y - 1][x] > 0;
    case "west":
      return isLeft || tilemap[y][x - 1] > 0;
    case "east":
      return isRight || tilemap[y][x + 1] > 0;
    case "south":
      return isBottom || tilemap[y + 1][x] > 0;
    case "north-west":
      return isLeft || isTop || tilemap[y - 1][x - 1] > 0;
    case "north-east":
      return isRight || isTop || tilemap[y - 1][x + 1] > 0;
    case "south-west":
      return isLeft || isBottom || tilemap[y + 1][x - 1] > 0;
    case "south-east":
      return isRight || isBottom || tilemap[y + 1][x + 1] > 0;
  }
}
