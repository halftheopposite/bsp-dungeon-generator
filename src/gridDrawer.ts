import * as PIXI from "pixi.js";
import { DungeonResult } from "./dungeon";
import { Container, TreeNode } from "./types";

const DEBUG = false;

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const TILE_SIZE = 16;
const ground = PIXI.Texture.from("assets/tiles/ground.png");
const tile3 = PIXI.Texture.from("assets/tiles/3.png");
const tile5 = PIXI.Texture.from("assets/tiles/5.png");
const tile7 = PIXI.Texture.from("assets/tiles/7.png");
const tile10 = PIXI.Texture.from("assets/tiles/10.png");
const tile11 = PIXI.Texture.from("assets/tiles/11.png");
const tile12 = PIXI.Texture.from("assets/tiles/12.png");
const tile13 = PIXI.Texture.from("assets/tiles/13.png");
const tile14 = PIXI.Texture.from("assets/tiles/14.png");
const tile15 = PIXI.Texture.from("assets/tiles/15.png");
const tile31 = PIXI.Texture.from("assets/tiles/31.png");
const tile47 = PIXI.Texture.from("assets/tiles/47.png");

const bandit = PIXI.Texture.from("assets/monsters/bandit.png");
const mushroom = PIXI.Texture.from("assets/monsters/mushroom.png");
const skeleton = PIXI.Texture.from("assets/monsters/skeleton.png");
const troll = PIXI.Texture.from("assets/monsters/troll.png");

const tilesColors = {
  1: 0x1f466c,
  2: 0x13c3a1,
  3: 0x4760b0,
  4: 0xd38be7,
  5: 0x4113f0,
  6: 0x802d70,
  7: 0x267492,
  8: 0xd2f3fd,
  9: 0xf9cd26,
  10: 0xef2db3,
  11: 0x54fccd,
  12: 0x6899ce,
  13: 0xa67493,
  14: 0xddffd1,
  15: 0xa21cd2,
  16: 0xe3e7c7,
};

const tilesSprites = {
  3: tile3,
  5: tile5,
  7: tile7,
  10: tile10,
  11: tile11,
  12: tile12,
  13: tile13,
  14: tile14,
  15: tile15,
  31: tile31,
  47: tile47,
};

const monstersSprites = {
  bandit: bandit,
  mushroom: mushroom,
  skeleton: skeleton,
  troll: troll,
};

export class GridDrawer {
  app: PIXI.Application;
  tilemapContainer: PIXI.Container;
  shapesContainer: PIXI.Container;

  constructor(width: number, height: number) {
    this.app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0x00,
    });
    document.body.appendChild(this.app.view);

    this.tilemapContainer = new PIXI.Container();
    this.shapesContainer = new PIXI.Container();
    this.app.stage.addChild(this.tilemapContainer);
    this.app.stage.addChild(this.shapesContainer);
  }

  draw = (dungeon: DungeonResult) => {
    this.drawTiles(dungeon);
    this.drawMonsters(dungeon);

    if (DEBUG) {
      this.drawGrid(dungeon);
      this.drawContainers(dungeon.tree);
      this.drawRooms(dungeon.tree);
      this.drawCorridors(dungeon.tree);
    }
  };

  drawTiles = (dungeon: DungeonResult) => {
    for (let y = 0; y < dungeon.height; y++) {
      for (let x = 0; x < dungeon.width; x++) {
        const tileId = dungeon.tilemap[y][x];
        // Hole
        if (tileId < 0) {
          const rectangle = new PIXI.Graphics();
          rectangle.beginFill(0x00);
          rectangle.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
          rectangle.endFill();
          rectangle.position.set(x * TILE_SIZE, y * TILE_SIZE);
          this.tilemapContainer.addChild(rectangle);
        }
        // Ground
        else if (tileId === 0) {
          const sprite = new PIXI.Sprite(ground);
          sprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
          this.tilemapContainer.addChild(sprite);
        }
        // Wall
        else if (tileId > 0) {
          if (tileId in tilesSprites) {
            const texture = tilesSprites[tileId];
            const sprite = new PIXI.Sprite(texture);
            sprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
            this.tilemapContainer.addChild(sprite);
          } else {
            const rectangle = new PIXI.Graphics();
            rectangle.beginFill(tilesColors[tileId]);
            rectangle.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
            rectangle.endFill();
            rectangle.position.set(x * TILE_SIZE, y * TILE_SIZE);
            this.tilemapContainer.addChild(rectangle);
          }
        }
      }
    }
  };

  drawMonsters = (dungeon: DungeonResult) => {
    dungeon.monsters.forEach((monster) => {
      const sprite = new PIXI.Sprite(monstersSprites[monster.type]);
      sprite.position.set(monster.x * TILE_SIZE, monster.y * TILE_SIZE);
      this.shapesContainer.addChild(sprite);
    });
  };

  drawContainers = (container: TreeNode<Container>) => {
    container.nodes.forEach((container) => {
      const rectangle = new PIXI.Graphics();
      rectangle.lineStyle(1, 0xff0000, 0.8);
      rectangle.drawRect(
        0,
        0,
        container.width * TILE_SIZE,
        container.height * TILE_SIZE
      );
      rectangle.position.set(container.x * TILE_SIZE, container.y * TILE_SIZE);
      this.shapesContainer.addChild(rectangle);
    });
  };

  drawRooms = (container: TreeNode<Container>) => {
    container.nodes.forEach((container) => {
      const room = container.room;
      if (!room) {
        return;
      }

      const rectangle = new PIXI.Graphics();
      rectangle.lineStyle(1, 0x00ff00, 0.8);
      rectangle.drawRect(0, 0, room.width * TILE_SIZE, room.height * TILE_SIZE);
      rectangle.position.set(room.x * TILE_SIZE, room.y * TILE_SIZE);
      this.shapesContainer.addChild(rectangle);
    });
  };

  drawCorridors = (container: TreeNode<Container>) => {
    const corridor = container.data.corridor;
    if (!corridor) {
      return;
    }

    const rectangle = new PIXI.Graphics();
    rectangle.lineStyle(1, 0x0000ff, 0.8);
    rectangle.drawRect(
      0,
      0,
      corridor.width * TILE_SIZE,
      corridor.height * TILE_SIZE
    );
    rectangle.position.set(corridor.x * TILE_SIZE, corridor.y * TILE_SIZE);
    this.shapesContainer.addChild(rectangle);

    this.drawCorridors(container.left);
    this.drawCorridors(container.right);
  };

  drawGrid = async (dungeon: DungeonResult) => {
    for (let y = 0; y < dungeon.height; y++) {
      for (let x = 0; x < dungeon.width; x++) {
        const rectangle = new PIXI.Graphics();
        rectangle.lineStyle(1, 0xffffff, 0.1);
        rectangle.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        rectangle.position.set(x * TILE_SIZE, y * TILE_SIZE);

        // Add cell number
        const tileId = dungeon.tilemap[y][x];
        const text = new PIXI.Text(`${tileId}`, {
          fontSize: 10,
          fill: 0xffffff,
          align: "center",
        });
        text.anchor.set(0.5);
        text.position.set(TILE_SIZE / 2, TILE_SIZE / 2);
        rectangle.addChild(text);
        this.shapesContainer.addChild(rectangle);
      }
    }
  };
}
