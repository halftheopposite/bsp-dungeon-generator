import * as PIXI from "pixi.js";

import { Dungeon } from "./dungeon";
import { Drawer } from "./drawer";
import { generate } from "./dungeon2";

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
  roomHoleChance: 0.5,
  corridorWidth: 2,
  corridorTrapChance: 0.5,
});

const dungeon2 = generate({
  mapWidth: 96,
  mapHeight: 54,
  mapGutterWidth: 1,
  iterations: 5,
  containerGutterWidth: 1,
  containerWidthRatio: 0.45,
  containerHeightRatio: 0.45,
  roomSpawnChance: 0.7,
  roomGutterWidth: 2,
  roomMaxMonsters: 6,
  roomMinSize: 3,
  roomHoleChance: 0.5,
  corridorWidth: 2,
  corridorTrapChance: 0.5,
});

console.log("dungeon2:", dungeon2);

// Render dungeon
const drawer = new Drawer(window.innerWidth, window.innerHeight);
drawer.draw(dungeon2, {
  debug: false,
  unitWidthInPixels: 16,
  tilesColors: {
    "-2": 0x00,
  },
  tilesSprites: {
    "-1": PIXI.Texture.from("assets/tiles/hole.png"),
    0: PIXI.Texture.from("assets/tiles/ground.png"),
    1: PIXI.Texture.from("assets/tiles/s.png"),
    2: PIXI.Texture.from("assets/tiles/s.png"),
    3: PIXI.Texture.from("assets/tiles/s.png"),
    4: PIXI.Texture.from("assets/tiles/s.png"),
    5: PIXI.Texture.from("assets/tiles/s.png"),
    7: PIXI.Texture.from("assets/tiles/s.png"),
    6: PIXI.Texture.from("assets/tiles/s.png"),
    8: PIXI.Texture.from("assets/tiles/s.png"),
    10: PIXI.Texture.from("assets/tiles/s.png"),
    11: PIXI.Texture.from("assets/tiles/s.png"),
    12: PIXI.Texture.from("assets/tiles/s.png"),
    13: PIXI.Texture.from("assets/tiles/w-e.png"),
    14: PIXI.Texture.from("assets/tiles/w-e.png"),
    15: PIXI.Texture.from("assets/tiles/w-e.png"),
    17: PIXI.Texture.from("assets/tiles/w-e.png"),
    18: PIXI.Texture.from("assets/tiles/w-e.png"),
    20: PIXI.Texture.from("assets/tiles/w-e.png"),
    26: PIXI.Texture.from("assets/tiles/n-ne-e.png"),
    27: PIXI.Texture.from("assets/tiles/n-ne-e.png"),
    29: PIXI.Texture.from("assets/tiles/n-ne-e.png"),
    28: PIXI.Texture.from("assets/tiles/e.png"),
    33: PIXI.Texture.from("assets/tiles/e.png"),
    34: PIXI.Texture.from("assets/tiles/n-nw-w.png"),
    35: PIXI.Texture.from("assets/tiles/n-nw-w.png"),
    36: PIXI.Texture.from("assets/tiles/w.png"),
    37: PIXI.Texture.from("assets/tiles/n-nw-w.png"),
    41: PIXI.Texture.from("assets/tiles/w.png"),
    42: PIXI.Texture.from("assets/tiles/n.png"),
    44: PIXI.Texture.from("assets/tiles/ne.png"),
    45: PIXI.Texture.from("assets/tiles/nw.png"),
    46: PIXI.Texture.from("assets/tiles/all.png"),
  },
  propsSprites: {
    1: PIXI.Texture.from("assets/props/peak.png"),
    2: PIXI.Texture.from("assets/props/torch.png"),
  },
  monstersSprites: {
    bandit: PIXI.Texture.from("assets/monsters/bandit.png"),
    mushroom: PIXI.Texture.from("assets/monsters/mushroom.png"),
    skeleton: PIXI.Texture.from("assets/monsters/skeleton.png"),
    troll: PIXI.Texture.from("assets/monsters/troll.png"),
  },
});
