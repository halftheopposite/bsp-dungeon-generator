import { Holes, Traps } from "./patterns";
import {
  Container,
  Corridor,
  Direction,
  Monster,
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
  randomInRanges,
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
  /** Minimum width ratio for an horizontal container */
  containerWidthRatio: number;
  /** Minimum height ratio for a vertical container */
  containerHeightRatio: number;
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
  width: number;
  height: number;
  tree: TreeNode<Container>;
  tilemap: TileMap;
  props: TileMap;
  monsters: Monster[];
}

export function generate(args: Args): Dungeon {
  const tree = createTree(args);
  const tiles = createTilesLayer(tree, args);
  const props = createPropsLayer(tree, args);

  return {
    width: args.mapWidth,
    height: args.mapHeight,
    tree,
    tilemap: tiles,
    props: props,
    monsters: [],
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
    node.leaf.room = generateRoom(container, args);
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
  const direction = randomInRanges<Direction>(
    [0.5, 0.5],
    ["vertical", "horizontal"]
  );

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
      leftWidthRatio < args.containerWidthRatio ||
      rightWidthRatio < args.containerWidthRatio
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
      leftHeightRatio < args.containerHeightRatio ||
      rightHeightRatio < args.containerHeightRatio
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
    console.log("too small");
    return;
  }

  const room = new Room(x, y, width, height);

  // Generate the room's holes (if any)
  const hasHole = randomInRanges(
    [args.roomHoleChance, 1 - args.roomHoleChance],
    [true, false]
  );
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
  const hasTrap = randomInRanges(
    [args.corridorTrapChance, 1 - args.corridorTrapChance],
    [true, false]
  );
  if (hasTrap) {
    corridor.traps =
      corridor.direction === "horizontal" ? Traps.smallLarge : Traps.smallLong;
  }

  return corridor;
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

function carveTilesMask(tilemap: TileMap) {
  for (let y = 0; y < tilemap.length; y++) {
    for (let x = 0; x < tilemap[y].length; x++) {
      // Apply tilemask only to walls
      if (tilemap[y][x] > 0) {
        let mask = 0;

        if (tileDirectionCollides(x, y, "west", tilemap)) {
          mask |= TileDirection.West;
        }

        if (tileDirectionCollides(x, y, "east", tilemap)) {
          mask |= TileDirection.East;
        }

        if (tileDirectionCollides(x, y, "north", tilemap)) {
          mask |= TileDirection.North;
        }

        if (tileDirectionCollides(x, y, "south", tilemap)) {
          mask |= TileDirection.South;
        }

        tilemap[y][x] = mask;
      }
    }
  }

  return tilemap;
}

function tileDirectionCollides(
  x: number,
  y: number,
  side: "north" | "west" | "east" | "south",
  tilemap: TileMap
) {
  switch (side) {
    case "north":
      {
        if (y === 0 || tilemap[y - 1][x] > 0) {
          return true;
        }
      }
      break;
    case "east": {
      if (x === tilemap[y].length - 1 || tilemap[y][x + 1] > 0) {
        return true;
      }
      break;
    }
    case "west":
      {
        if (x === 0 || tilemap[y][x - 1] > 0) {
          return true;
        }
      }
      break;
    case "south":
      {
        if (y === tilemap.length - 1 || tilemap[y + 1][x] > 0) {
          return true;
        }
      }
      break;
  }

  return false;
}

//
// Props
//
function createPropsLayer(node: TreeNode<Container>, args: Args): TileMap {
  let props = createTilemap(args.mapWidth, args.mapHeight, 0);

  props = carveTraps(node, duplicateTilemap(props));

  return props;
}

function carveTraps(node: TreeNode<Container>, props: TileMap): TileMap {
  const corridor = node.leaf.corridor;
  if (!corridor) {
    return;
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
        props[posY][posX] = PropType.Spikes;
      }
    }
  }

  carveTraps(node.left, props);
  carveTraps(node.right, props);

  return props;
}
