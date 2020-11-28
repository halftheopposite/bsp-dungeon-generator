import PoissonDiscSampling from "poisson-disk-sampling";
import {
  Container,
  Corridor,
  DirectionNW,
  DirectionNES,
  DirectionNEW,
  DirectionNEWS,
  DirectionNWS,
  Monster,
  MonsterType,
  Room,
  TileDirection,
  TileMap,
  TreeNode,
} from "./types";
import { Holes } from "./patterns";
import { random, randomInRanges, shuffleArray } from "./utils";

export interface DungeonArgs {
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
  /** Width of corridors */
  corridorWidth: number;
}

export interface DungeonResult {
  /** The width in tiles */
  width: number;
  /** The height in tiles */
  height: number;
  /** The tree representing the dungeon */
  tree: TreeNode<Container>;
  /** The tilemap representing the dungeon */
  tilemap: TileMap;
  /** The monsters entities in the dungeon */
  monsters: Monster[];
}

export class Dungeon {
  //
  // Entrypoint
  //
  generate = (args: DungeonArgs): DungeonResult => {
    const startAt = performance.now();

    // Create the tree
    const tree = this.generateTree(
      new Container(
        args.mapGutterWidth,
        args.mapGutterWidth,
        args.mapWidth - args.mapGutterWidth * 2,
        args.mapHeight - args.mapGutterWidth * 2
      ),
      args.iterations,
      args
    );

    // Create the rooms
    this.generateRooms(tree, args);

    // Create the corridors
    this.generateCorridors(tree, args);

    // Create the monsters
    const monsters = this.generateMonsters(tree, args);

    // Create the tilemap
    const tilemap = this.generateTilemap(tree, args);

    const endAt = performance.now();
    console.log(`Dungeon generated in ${endAt - startAt}ms`);

    return {
      width: args.mapWidth,
      height: args.mapHeight,
      tree,
      tilemap,
      monsters,
    };
  };

  //
  // Tree
  //
  private generateTree = (
    container: Container,
    iterations: number,
    args: DungeonArgs
  ): TreeNode<Container> => {
    const node = new TreeNode<Container>(container);

    if (iterations != 0) {
      const [left, right] = this.splitContainer(container, args);
      node.left = this.generateTree(left, iterations - 1, args);
      node.right = this.generateTree(right, iterations - 1, args);
    }

    return node;
  };

  private splitContainer = (
    container: Container,
    args: DungeonArgs
  ): [Container, Container] => {
    let left: Container;
    let right: Container;

    // Generate a random direction to split the container
    const direction = randomInRanges<"vertical" | "horizontal">(
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
        return this.splitContainer(container, args);
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
        return this.splitContainer(container, args);
      }
    }

    return [left, right];
  };

  private generateRooms = (
    node: TreeNode<Container>,
    args: DungeonArgs
  ): TreeNode<Container> => {
    node.nodes.forEach((container) => {
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

      const room = new Room(x, y, width, height);
      if (room.width < args.roomMinSize || room.height < args.roomMinSize) {
        return;
      }

      // Generate the room's holes (if any)
      const hasHole = randomInRanges([0.6, 0.4], [true, true]);
      if (hasHole) {
        Holes.all.forEach((hole) => {
          if (
            !room.holes &&
            room.width > hole.width * 2 &&
            room.height > hole.height * 2
          ) {
            room.holes = hole;
          }
        });
      }

      container.room = room;
    });

    return node;
  };

  private generateCorridors = (
    node: TreeNode<Container>,
    args: DungeonArgs
  ) => {
    if (!node.left || !node.right) {
      return;
    }

    const leftCenter = node.left.data.center;
    const rightCenter = node.right.data.center;

    const x = Math.ceil(leftCenter.x);
    const y = Math.ceil(leftCenter.y);
    if (leftCenter.x === rightCenter.x) {
      // Vertical
      const corridor = new Corridor(
        x,
        y,
        Math.ceil(args.corridorWidth),
        Math.ceil(rightCenter.y) - y
      );
      node.data.corridor = corridor;
    } else {
      // Horizontal
      const corridor = new Corridor(
        x,
        y,
        Math.ceil(rightCenter.x) - x,
        Math.ceil(args.corridorWidth)
      );
      node.data.corridor = corridor;
    }

    this.generateCorridors(node.left, args);
    this.generateCorridors(node.right, args);
  };

  private generateMonsters = (
    node: TreeNode<Container>,
    args: DungeonArgs
  ): Monster[] => {
    const monsters: Monster[] = [];

    node.nodes.forEach((node) => {
      const room = node.room;
      if (!room) {
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
        const type = randomInRanges<MonsterType>(
          [0.5, 0.3, 0.15, 0.05],
          ["bandit", "skeleton", "troll", "mushroom"]
        );
        const radius = 3;

        monsters.push(new Monster(x, y, radius, type));
      });
    });

    return monsters;
  };

  //
  // Tilemap
  //
  private generateTilemap = (
    tree: TreeNode<Container>,
    args: DungeonArgs
  ): TileMap => {
    // Initialize the tilemap
    const tilemap: TileMap = [];
    for (let y = 0; y < args.mapHeight; y++) {
      tilemap[y] = [];
      for (let x = 0; x < args.mapWidth; x++) {
        tilemap[y][x] = 1;
      }
    }

    this.carveRooms(tree, tilemap);
    this.carveCorridors(tree, tilemap);
    this.carvePatterns(tree, tilemap);
    this.cleanTilemap(tilemap);
    this.generateTileMask(tilemap);
    this.normalizeTileMask(tilemap);

    return tilemap;
  };

  private carveRooms = (node: TreeNode<Container>, tilemap: TileMap) => {
    node.nodes.forEach((container) => {
      if (!container.room) {
        return;
      }

      for (let y = 0; y < tilemap.length; y++) {
        for (let x = 0; x < tilemap[y].length; x++) {
          const inHeightRange =
            y >= container.room.y && y < container.room.down;
          const inWidthRange =
            x >= container.room.x && x < container.room.right;
          if (inHeightRange && inWidthRange) {
            tilemap[y][x] = 0;
          }
        }
      }
    });
  };

  private carveCorridors = (node: TreeNode<Container>, tilemap: TileMap) => {
    const corridor = node.data.corridor;
    if (!corridor) {
      return;
    }

    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const inHeightRange = y >= corridor.y && y < corridor.down;
        const inWidthRange = x >= corridor.x && x < corridor.right;
        if (inHeightRange && inWidthRange) {
          tilemap[y][x] = 0;
        }
      }
    }

    this.carveCorridors(node.left, tilemap);
    this.carveCorridors(node.right, tilemap);
  };

  private carvePatterns = (node: TreeNode<Container>, tilemap: TileMap) => {
    node.nodes.forEach((container) => {
      if (!container.room || !container.room.holes) {
        return;
      }

      // Carve holes
      const holes = container.room.holes;
      const startY = Math.ceil(container.room.center.y - holes.height / 2);
      const startX = Math.ceil(container.room.center.x - holes.width / 2);
      for (let y = 0; y < holes.height; y++) {
        for (let x = 0; x < holes.width; x++) {
          const posY = startY + y;
          const posX = startX + x;
          tilemap[posY][posX] = holes.tiles[y][x];
        }
      }
    });
  };

  /**
   * Clean a tilemap (optional).
   */
  private cleanTilemap = (tilemap: TileMap) => {
    // Remove any 1 unit width tiles (vertical or horizontal)
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const tileId = tilemap[y][x];
        if (tileId <= 0) {
          continue;
        }

        const beforeH = tilemap[y][x - 1];
        const afterH = tilemap[y][x + 1];
        if (beforeH === 0 && afterH === 0) {
          tilemap[y][x] = 0;
          continue;
        }

        const beforeV = y > 0 && tilemap[y - 1][x];
        const afterV = y < tilemap.length - 1 && tilemap[y + 1][x];
        if (beforeV === 0 && afterV === 0) {
          tilemap[y][x] = 0;
          continue;
        }
      }
    }
  };

  private generateTileMask = (tilemap: TileMap) => {
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        if (tilemap[y][x] > 0) {
          tilemap[y][x] = this.getTileMask(x, y, tilemap);
        }
      }
    }
  };

  private getTileMask = (x: number, y: number, tilemap: TileMap): number => {
    let mask = 0;

    //
    // Compute tilemap edges
    //
    if (this.isColliding(x, y, "west", tilemap)) {
      mask |= TileDirection.West;
    }

    if (this.isColliding(x, y, "east", tilemap)) {
      mask |= TileDirection.East;
    }

    if (this.isColliding(x, y, "north", tilemap)) {
      mask |= TileDirection.North;
    }

    if (this.isColliding(x, y, "south", tilemap)) {
      mask |= TileDirection.South;
    }

    return mask;
  };

  private isColliding = (
    x: number,
    y: number,
    side: "north" | "west" | "east" | "south",
    tilemap: TileMap
  ) => {
    switch (side) {
      case "north":
        {
          if (y === 0 || tilemap[y - 1][x] > 0) {
            return true;
          }
        }
        break;
      case "west": {
        if (x === tilemap[y].length - 1 || tilemap[y][x + 1] > 0) {
          return true;
        }
        break;
      }
      case "east":
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
  };

  /**
   * Normalize a tilemask to match rendering and gameplay expectations (optional).
   * - Diagonals tiles are rendered differently depending on tilesets
   */
  private normalizeTileMask = (tilemap: TileMap) => {
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        if (y > 0 && y < tilemap.length - 1 && x < tilemap[y].length - 1) {
          const leftTile = tilemap[y][x - 1];
          const rightTile = tilemap[y][x + 1];
          const topTile = tilemap[y - 1][x];
          const bottomTile = tilemap[y + 1][x];

          // [x][ ]
          // [ ]
          if (rightTile > 0 && bottomTile > 0 && tilemap[y + 1][x + 1] <= 0) {
            tilemap[y][x] = DirectionNES;
          }
          // [ ][x]
          //    [ ]
          else if (
            leftTile > 0 &&
            bottomTile > 0 &&
            tilemap[y + 1][x - 1] <= 0
          ) {
            tilemap[y][x] = DirectionNWS;
          }
          // [ ]
          // [x][ ]
          else if (topTile > 0 && rightTile > 0 && tilemap[y - 1][x + 1] <= 0) {
            tilemap[y][x] = tilemap[y][x] | TileDirection.NorthEast;
          }
          //    [ ]
          // [ ][x]
          else if (topTile > 0 && leftTile > 0 && tilemap[y - 1][x - 1] <= 0) {
            tilemap[y][x] = tilemap[y][x] | TileDirection.NorthWest;
          }
        }
      }
    }
  };
}
