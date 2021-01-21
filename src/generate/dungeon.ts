import {
  Container,
  Corridor,
  Direction,
  PropType,
  Room,
  RoomTemplate,
  RoomType,
  TileDirection,
  TileMap,
  TreeNode,
} from "./types";
import { createTilemap, duplicateTilemap, random, randomChoice } from "./utils";
import seedrandom from "seedrandom";

export interface DungeonArgs {
  /** A list of rooms to be used in the dungeon */
  rooms: RoomTemplate[];
  /** Width of the map */
  mapWidth: number;
  /** Height of the map */
  mapHeight: number;
  /** Gutter of the top-most container (used for sub-containers) */
  mapGutterWidth: number;
  /** Number of recursive divisions */
  iterations: number;
  /** Maximum attempts to split a container in half */
  containerSplitRetries: number;
  /** Minimum size ratio of a split a container in its parent */
  containerMinimumRatio: number;
  /** Minimum size for a container under which he cannot be split */
  containerMinimumSize: number;
  /** Width of corridors */
  corridorWidth: number;
  /** The seed used to generate the dungeon */
  seed?: string;
}

export interface Dungeon {
  width: number;
  height: number;
  tree: TreeNode<Container>;
  layers: {
    tiles: TileMap;
    props: TileMap;
    monsters: TileMap;
  };
}

export function generate(args: DungeonArgs): Dungeon {
  // If a seed is provided, use it to generate dungeon.
  if (args.seed) {
    seedrandom(args.seed, { global: true });
  }

  const startAt = Date.now();

  const tree = createTree(args);
  const tiles = createTilesLayer(tree, args);
  const props = createPropsLayer(tree, tiles, args);
  const monsters = createMonstersLayer(tree, args);

  const endAt = Date.now();
  console.log(`Dungeon generated in ${endAt - startAt}ms`);

  return {
    width: args.mapWidth,
    height: args.mapHeight,
    tree,
    layers: {
      tiles,
      props,
      monsters,
    },
  };
}

//
// Tree
//
function createTree(args: DungeonArgs): TreeNode<Container> {
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
  args: DungeonArgs
): TreeNode<Container> {
  const node = new TreeNode<Container>(container);

  if (
    iterations !== 0 &&
    node.leaf.width > args.containerMinimumSize * 2 &&
    node.leaf.height > args.containerMinimumSize * 2
  ) {
    // We still need to divide the container
    const [left, right] = splitContainer(
      container,
      args,
      args.containerSplitRetries
    );
    if (left && right) {
      node.left = generateTree(left, iterations - 1, args);
      node.right = generateTree(right, iterations - 1, args);

      // Once divided, we create a corridor between the two containers
      node.leaf.corridor = generateCorridor(
        node.left.leaf,
        node.right.leaf,
        args
      );
    }
  }

  return node;
}

function splitContainer(
  container: Container,
  args: DungeonArgs,
  iterations: number
): [Container, Container] | [null, null] {
  let left: Container;
  let right: Container;

  // We tried too many times to split the container without success
  if (iterations === 0) {
    return [null, null];
  }

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
      leftWidthRatio < args.containerMinimumRatio ||
      rightWidthRatio < args.containerMinimumRatio
    ) {
      return splitContainer(container, args, iterations - 1);
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
      leftHeightRatio < args.containerMinimumRatio ||
      rightHeightRatio < args.containerMinimumRatio
    ) {
      return splitContainer(container, args, iterations - 1);
    }
  }

  return [left, right];
}

function generateCorridor(
  left: Container,
  right: Container,
  args: DungeonArgs
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

  return corridor;
}

function generateRooms(tree: TreeNode<Container>, args: DungeonArgs) {
  fillByType(tree, args, "boss", 1);
  fillByType(tree, args, "entrance", 1);
  fillByType(tree, args, "heal", 1);
  fillByType(tree, args, "treasure", 1);
  fillByType(tree, args, "monsters", -1);
}

function fillByType(
  tree: TreeNode<Container>,
  args: DungeonArgs,
  type: RoomType,
  count: number
) {
  // Filter available templates by type
  const templates = getTemplatesByType(args.rooms, type);
  if (templates.length === 0) {
    throw new Error(`Couldn't find templates of type "${type}"`);
  }

  // List containers ids that have no rooms yet
  const containers = getEmptyContainers(tree.leaves);
  if (containers.length === 0) {
    throw new Error(
      `Couldn't find containers to fit ${count} templates of type "${type}"`
    );
  }

  // "-1" means "fill rest"
  if (count === -1) {
    count = containers.length;
  }

  // NEW
  const usedContainersIds = [];
  const usedTemplatesIds = [];
  while (count > 0) {
    const container = getRandomContainer(containers, usedContainersIds);
    if (!container) {
      break;
    }

    const template = findFittingTemplate(
      templates,
      container,
      usedTemplatesIds
    );

    if (template) {
      const x = Math.floor(container.center.x - template.width / 2);
      const y = Math.floor(container.center.y - template.height / 2);
      container.room = new Room(x, y, template.id, template);
      usedTemplatesIds.push(template.id);
    } else {
      console.warn(
        `Couldn't find a template fitting width="${container.width}" height="${container.height}" for type="${type}"`
      );
    }

    usedContainersIds.push(container.id);
    count--;
  }
}

//
// Tiles
//
function createTilesLayer(
  tree: TreeNode<Container>,
  args: DungeonArgs
): TileMap {
  let tiles = createTilemap(args.mapWidth, args.mapHeight, 1);

  tiles = carveCorridors(tree, duplicateTilemap(tiles));
  tiles = carveRooms(tree, duplicateTilemap(tiles));
  tiles = computeTilesMask(duplicateTilemap(tiles));

  return tiles;
}

function carveCorridors(node: TreeNode<Container>, tiles: TileMap): TileMap {
  const corridor = node.leaf.corridor;
  if (!corridor) {
    return tiles;
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

  if (node.left) {
    carveCorridors(node.left, tiles);
  }

  if (node.right) {
    carveCorridors(node.right, tiles);
  }

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
  args: DungeonArgs
): TileMap {
  let props = createTilemap(args.mapWidth, args.mapHeight, 0);

  props = carveProps(tree, props);
  props = carveTorches(tiles, props);

  return props;
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
function createMonstersLayer(
  tree: TreeNode<Container>,
  args: DungeonArgs
): TileMap {
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
const maskToTileIdMap: { [key: number]: number } = {
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

function sortTemplatesBySize(templates: RoomTemplate[]): RoomTemplate[] {
  return templates.sort((a, b) => a.width - b.width || a.height - b.height);
}

function findFittingTemplate(
  templates: RoomTemplate[],
  container: Container,
  usedIds: string[]
): RoomTemplate | undefined {
  const sorted = sortTemplatesBySize(templates).reverse();

  let result = sorted.find(
    (template) =>
      !usedIds.includes(template.id) &&
      template.width <= container.width &&
      template.height <= container.height
  );

  if (!result) {
    result = sorted.find(
      (template) =>
        template.width <= container.width && template.height <= container.height
    );
  }

  return result;
}

function getTemplatesByType(
  templates: RoomTemplate[],
  type: RoomType
): RoomTemplate[] {
  return templates.filter((room) => room.type === type);
}

function getEmptyContainers(containers: Container[]): Container[] {
  return containers.filter((leaf) => !leaf.room);
}

function getRandomContainer(
  containers: Container[],
  usedIds: string[]
): Container | null {
  const filtered = containers.filter(
    (container) => !usedIds.includes(container.id)
  );
  if (!filtered.length) {
    return null;
  }

  return randomChoice(filtered);
}
