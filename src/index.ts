import * as PIXI from "pixi.js";

import { Dungeon } from "./dungeon";
import { Drawer } from "./drawer";

// Generate dungeon
const dungeon = new Dungeon({
  mapWidth: 64,
  mapHeight: 48,
  mapGutterWidth: 1,
  iterations: 4,
  containerGutterWidth: 1,
  containerWidthRatio: 0.45,
  containerHeightRatio: 0.45,
  roomGutterWidth: 2,
  roomMaxMonsters: 6,
  roomMinSize: 3,
  corridorWidth: 2,
});

// Render dungeon
const drawer = new Drawer(window.innerWidth, window.innerHeight);
drawer.draw(dungeon, {
  debug: false,
  unitWidthInPixels: 16,
  tilesColors: {
    "-1": 0xffffff,
    0: 0x1f466c,
    3: 0x4760b0,
    5: 0x4113f0,
    7: 0x267492,
    10: 0xef2db3,
    11: 0x54fccd,
    12: 0x6899ce,
    13: 0xa67493,
    14: 0xddffd1,
    15: 0xa21cd2,
    31: 0xd38be7,
    47: 0x802d70,
  },
  tilesSprites: {
    0: PIXI.Texture.from("assets/tiles/0.png"),
    3: PIXI.Texture.from("assets/tiles/3.png"),
    5: PIXI.Texture.from("assets/tiles/5.png"),
    7: PIXI.Texture.from("assets/tiles/7.png"),
    10: PIXI.Texture.from("assets/tiles/10.png"),
    11: PIXI.Texture.from("assets/tiles/11.png"),
    12: PIXI.Texture.from("assets/tiles/12.png"),
    13: PIXI.Texture.from("assets/tiles/13.png"),
    14: PIXI.Texture.from("assets/tiles/14.png"),
    15: PIXI.Texture.from("assets/tiles/15.png"),
    31: PIXI.Texture.from("assets/tiles/31.png"),
    47: PIXI.Texture.from("assets/tiles/47.png"),
  },
  monstersSprites: {
    bandit: PIXI.Texture.from("assets/monsters/bandit.png"),
    mushroom: PIXI.Texture.from("assets/monsters/mushroom.png"),
    skeleton: PIXI.Texture.from("assets/monsters/skeleton.png"),
    troll: PIXI.Texture.from("assets/monsters/troll.png"),
  },
});
