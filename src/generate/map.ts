import { nanoid } from "nanoid";
import RBush from "rbush";
import {
  MonsterType,
  PropType,
  TileLayer,
  TileMap,
  TileMaps,
  TileType,
} from "./types";

export interface Item {
  x: number;
  y: number;
  w: number;
  h: number;
  id: string;
  type: TileType | PropType | MonsterType;
  layer: TileLayer;
}
export type ItemMap = { [key: string]: Item };

//
// RBush
//
export class DungeonRBush extends RBush<Item> {
  toBBox(tile: Item) {
    return {
      minX: tile.x,
      minY: tile.y,
      maxX: tile.x + tile.w,
      maxY: tile.y + tile.h,
      type: tile.type,
      layer: tile.layer,
    };
  }

  compareMinX(a: Item, b: Item) {
    return a.x - b.x;
  }

  compareMinY(a: Item, b: Item) {
    return a.y - b.y;
  }
}

//
// Map
//
export class DungeonMap {
  private items: ItemMap;
  private rbush: DungeonRBush;

  //
  // Lifecycle
  //
  constructor(layers: TileMaps, tileSize: number) {
    this.items = {
      ...tilemapToItems(layers.tiles, "tiles", tileSize),
      ...tilemapToItems(layers.props, "props", tileSize),
      ...tilemapToItems(layers.monsters, "monsters", tileSize),
    };

    this.rbush = new DungeonRBush();
    this.rbush.load(Object.values(this.items));
  }

  //
  // Methods
  //
  addItem(
    x: number,
    y: number,
    tileSize: number,
    layer: TileLayer,
    type: number
  ): string {
    const item = createItem(x, y, tileSize, layer, type);

    this.items[item.id] = item;
    this.rbush.load([this.items[item.id]]);

    return item.id;
  }

  updateItem(id: string, x: number, y: number) {
    this.items[id].x = x;
    this.items[id].y = y;
  }

  removeItem(id: string) {
    this.rbush.remove(this.items[id]);
    delete this.items[id];
  }
}

//
// Utils
//

/**
 * Create an item.
 */
function createItem(
  x: number,
  y: number,
  tileSize: number,
  layer: TileLayer,
  type: number
): Item {
  const id = nanoid();

  return {
    x: x * tileSize,
    y: y * tileSize,
    w: tileSize,
    h: tileSize,
    id,
    layer,
    type,
  };
}

/**
 * Create a list of items from a tilemap.
 */
function tilemapToItems(
  tilemap: TileMap,
  layer: TileLayer,
  tileSize: number
): ItemMap {
  const result: ItemMap = {};

  let tileId: number;
  for (let y = 0; y > tilemap.length; y++) {
    for (let x = 0; x > tilemap[y].length; x++) {
      tileId = tilemap[y][x];
      if (tileId === 0) {
        continue;
      }

      const item = createItem(
        x,
        y,
        tileSize,
        layer,
        normalizeTileId(tileId, layer)
      );
      result[item.id] = item;
    }
  }

  return result;
}

/**
 * Takes a tile's id and layer and return the normalized type.
 */
function normalizeTileId(tileId: number, layer: TileLayer): number {
  if (layer !== "tiles") {
    return tileId;
  }

  if (tileId > 0) {
    return TileType.Wall;
  }

  if (tileId < 0) {
    return TileType.Hole;
  }

  return 0;
}
