import { Rooms } from "./rooms";
import { Traps } from "./traps";
import {
  Container,
  Corridor,
  Direction,
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
  /** Minimum size ratio for a container */
  containerSizeRatio: number;
  /** Chance that a room spaws in a container */
  roomSpawnChance: number;
  /** Width of corridors */
  corridorWidth: number;
  /** Chance that a trap will appear in a corridor */
  corridorTrapChance: number;
}

export interface Dungeon {
  width: number;
  height: number;
  tree: TreeNode<Container>;
  tiles: TileMap;
  props: TileMap;
  monsters: TileMap;
}

export function generate(args: Args): Dungeon {
  const startAt = performance.now();

  const tree = createTree(args);
  const tiles = createTilesLayer(tree, args);
  const props = createPropsLayer(tree, tiles, args);
  const monsters = createMonstersLayer(tree, args);

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

  generateRooms(tree, args);

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
      x - Math.ceil(args.corridorWidth / 2),
      y - Math.ceil(args.corridorWidth / 2),
      Math.ceil(args.corridorWidth),
      Math.ceil(rightCenter.y) - y
    );
  } else {
    // Horizontal
    corridor = new Corridor(
      x - Math.ceil(args.corridorWidth / 2),
      y - Math.ceil(args.corridorWidth / 2),
      Math.ceil(rightCenter.x) - x,
      Math.ceil(args.corridorWidth)
    );
  }

  // Generate the corridor's traps (if any)
  const hasTrap = randomProbability(args.corridorTrapChance);
  if (hasTrap) {
    corridor.traps = corridor.direction === "horizontal" ? Traps[0] : Traps[1];
  }

  return corridor;
}

function generateRooms(tree: TreeNode<Container>, args: Args) {
  let roomId = 0;

  tree.leaves.forEach((leaf) => {
    if (!randomProbability(args.roomSpawnChance)) {
      return;
    }

    const filteredRooms = Rooms.filter(
      (room) => room.width <= leaf.width && room.height <= leaf.height
    );
    if (!filteredRooms.length) {
      return;
    }

    const template = randomChoice(filteredRooms);
    if (leaf.width > template.width && leaf.height > template.height) {
      const x = Math.floor(leaf.center.x - template.width / 2);
      const y = Math.floor(leaf.center.y - template.height / 2);
      leaf.room = new Room(x, y, String(roomId), template);
      roomId++;
    }
  });
}

//
// Tiles
//
function createTilesLayer(tree: TreeNode<Container>, args: Args): TileMap {
  let tiles = createTilemap(args.mapWidth, args.mapHeight, 1);

  tiles = carveCorridors(tree, duplicateTilemap(tiles));
  tiles = carveRooms(tree, duplicateTilemap(tiles));
  tiles = computeTilesMask(duplicateTilemap(tiles));

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

function carveRooms(node: TreeNode<Container>, tiles: TileMap) {
  let result = duplicateTilemap(tiles);

  node.leaves.forEach((container) => {
    const room = container.room;
    if (!room) {
      return;
    }

    const tilesLayer = room.template.layers.tiles;
    for (let y = 0; y < room.template.height; y++) {
      for (let x = 0; x < room.template.width; x++) {
        const posY = room.y + y;
        const posX = room.x + x;
        result[posY][posX] = tilesLayer[y][x];
      }
    }
  });

  return result;
}

export function computeTilesMask(tiles: TileMap) {
  const result = duplicateTilemap(tiles);

  for (let y = 0; y < result.length; y++) {
    for (let x = 0; x < result[y].length; x++) {
      // Apply tilemask only to walls
      if (result[y][x] > 0) {
        result[y][x] = computeBitMask(x, y, result);
      }

      // Compute holes
      if (result[y][x] < 0) {
        result[y][x] = computeHole(x, y, result);
      }
    }
  }

  return result;
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

  props = carveCorridorsTraps(tree, props);
  props = carveProps(tree, props);
  props = carveTorches(tiles, props);

  return props;
}

function carveCorridorsTraps(
  node: TreeNode<Container>,
  props: TileMap
): TileMap {
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

  result = carveCorridorsTraps(node.left, result);
  result = carveCorridorsTraps(node.right, result);

  return result;
}

function carveProps(node: TreeNode<Container>, props: TileMap) {
  let result = duplicateTilemap(props);

  node.leaves.forEach((container) => {
    const room = container.room;
    if (!room) {
      return;
    }

    const propsLayer = room.template.layers.props;
    for (let y = 0; y < room.template.height; y++) {
      for (let x = 0; x < room.template.width; x++) {
        const posY = room.y + y;
        const posX = room.x + x;
        result[posY][posX] = propsLayer[y][x];
      }
    }
  });

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

//
// Monsters
//
function createMonstersLayer(tree: TreeNode<Container>, args: Args): TileMap {
  let monsters = createTilemap(args.mapWidth, args.mapHeight, 0);

  monsters = carveMonsters(tree, monsters);

  return monsters;
}

function carveMonsters(node: TreeNode<Container>, monsters: TileMap) {
  let result = duplicateTilemap(monsters);

  node.leaves.forEach((container) => {
    const room = container.room;
    if (!room) {
      return;
    }

    const monstersLayer = room.template.layers.monsters;
    for (let y = 0; y < room.template.height; y++) {
      for (let x = 0; x < room.template.width; x++) {
        const posY = room.y + y;
        const posX = room.x + x;
        result[posY][posX] = monstersLayer[y][x];
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

function computeHole(x: number, y: number, tiles: TileMap): number {
  let result = -1;

  const isTop = y === 0;
  if (!isTop && tiles[y - 1][x] < 0) {
    result = -2;
  }

  return result;
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
