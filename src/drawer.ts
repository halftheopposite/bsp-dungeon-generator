import * as PIXI from "pixi.js";
import { Dungeon } from "./dungeon";
import { Container, TreeNode } from "./types";

const DEBUG = false;

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

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

export interface DrawOptions {
  unitWidthInPixels: number;
}

export class Drawer {
  app: PIXI.Application;
  tilemapContainer: PIXI.Container;
  shapesContainer: PIXI.Container;
  unitInPixels: number;

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

  draw = (dungeon: Dungeon, options: DrawOptions) => {
    this.tilemapContainer.removeChildren();
    this.shapesContainer.removeChildren();
    this.unitInPixels = options.unitWidthInPixels;

    this.drawTiles(dungeon);
    this.drawMonsters(dungeon);

    if (DEBUG) {
      this.drawGrid(dungeon);
      this.drawContainers(dungeon.tree);
      this.drawRooms(dungeon.tree);
      this.drawCorridors(dungeon.tree);
    }
  };

  private drawTiles = (dungeon: Dungeon) => {
    for (let y = 0; y < dungeon.height; y++) {
      for (let x = 0; x < dungeon.width; x++) {
        const tileId = dungeon.tilemap[y][x];
        // Hole
        if (tileId < 0) {
          const rectangle = new PIXI.Graphics();
          rectangle.beginFill(0x00);
          rectangle.drawRect(0, 0, this.unitInPixels, this.unitInPixels);
          rectangle.endFill();
          rectangle.position.set(x * this.unitInPixels, y * this.unitInPixels);
          this.tilemapContainer.addChild(rectangle);
        }
        // Ground
        else if (tileId === 0) {
          const sprite = new PIXI.Sprite(ground);
          sprite.position.set(x * this.unitInPixels, y * this.unitInPixels);
          this.tilemapContainer.addChild(sprite);
        }
        // Wall
        else if (tileId > 0) {
          if (tileId in tilesSprites) {
            const texture = tilesSprites[tileId];
            const sprite = new PIXI.Sprite(texture);
            sprite.position.set(x * this.unitInPixels, y * this.unitInPixels);
            this.tilemapContainer.addChild(sprite);
          } else {
            const rectangle = new PIXI.Graphics();
            rectangle.beginFill(tilesColors[tileId]);
            rectangle.drawRect(0, 0, this.unitInPixels, this.unitInPixels);
            rectangle.endFill();
            rectangle.position.set(
              x * this.unitInPixels,
              y * this.unitInPixels
            );
            this.tilemapContainer.addChild(rectangle);
          }
        }
      }
    }
  };

  private drawMonsters = (dungeon: Dungeon) => {
    dungeon.monsters.forEach((monster) => {
      const sprite = new PIXI.Sprite(monstersSprites[monster.type]);
      sprite.position.set(
        monster.x * this.unitInPixels,
        monster.y * this.unitInPixels
      );
      this.shapesContainer.addChild(sprite);
    });
  };

  private drawContainers = (container: TreeNode<Container>) => {
    container.nodes.forEach((container) => {
      const rectangle = new PIXI.Graphics();
      rectangle.lineStyle(1, 0xff0000, 0.8);
      rectangle.drawRect(
        0,
        0,
        container.width * this.unitInPixels,
        container.height * this.unitInPixels
      );
      rectangle.position.set(
        container.x * this.unitInPixels,
        container.y * this.unitInPixels
      );
      this.shapesContainer.addChild(rectangle);
    });
  };

  private drawRooms = (container: TreeNode<Container>) => {
    container.nodes.forEach((container) => {
      const room = container.room;
      if (!room) {
        return;
      }

      const rectangle = new PIXI.Graphics();
      rectangle.lineStyle(1, 0x00ff00, 0.8);
      rectangle.drawRect(
        0,
        0,
        room.width * this.unitInPixels,
        room.height * this.unitInPixels
      );
      rectangle.position.set(
        room.x * this.unitInPixels,
        room.y * this.unitInPixels
      );
      this.shapesContainer.addChild(rectangle);
    });
  };

  private drawCorridors = (container: TreeNode<Container>) => {
    const corridor = container.data.corridor;
    if (!corridor) {
      return;
    }

    const rectangle = new PIXI.Graphics();
    rectangle.lineStyle(1, 0x0000ff, 0.8);
    rectangle.drawRect(
      0,
      0,
      corridor.width * this.unitInPixels,
      corridor.height * this.unitInPixels
    );
    rectangle.position.set(
      corridor.x * this.unitInPixels,
      corridor.y * this.unitInPixels
    );
    this.shapesContainer.addChild(rectangle);

    this.drawCorridors(container.left);
    this.drawCorridors(container.right);
  };

  private drawGrid = async (dungeon: Dungeon) => {
    for (let y = 0; y < dungeon.height; y++) {
      for (let x = 0; x < dungeon.width; x++) {
        const rectangle = new PIXI.Graphics();
        rectangle.lineStyle(1, 0xffffff, 0.1);
        rectangle.drawRect(0, 0, this.unitInPixels, this.unitInPixels);
        rectangle.position.set(x * this.unitInPixels, y * this.unitInPixels);

        // Add cell number
        const tileId = dungeon.tilemap[y][x];
        const text = new PIXI.Text(`${tileId}`, {
          fontSize: 10,
          fill: 0xffffff,
          align: "center",
        });
        text.anchor.set(0.5);
        text.position.set(this.unitInPixels / 2, this.unitInPixels / 2);
        rectangle.addChild(text);
        this.shapesContainer.addChild(rectangle);
      }
    }
  };
}
