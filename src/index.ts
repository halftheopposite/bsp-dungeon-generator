import * as PIXI from "pixi.js";

import { Drawer } from "./drawer";
import { generate } from "./dungeon";

const dungeon = generate({
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
  roomMinSize: 4,
  roomHoleChance: 0.5,
  corridorWidth: 2,
  corridorTrapChance: 0.5,
});

console.log("Dungeon:", dungeon);

const textures = {
  hole: PIXI.Texture.from("assets/tiles/hole.png"),
  edge: PIXI.Texture.from("assets/tiles/edge.png"),
  ground: PIXI.Texture.from("assets/tiles/ground.png"),
  n: PIXI.Texture.from("assets/tiles/n.png"),
  s: PIXI.Texture.from("assets/tiles/s.png"),
  e: PIXI.Texture.from("assets/tiles/e.png"),
  w: PIXI.Texture.from("assets/tiles/w.png"),
  ne: PIXI.Texture.from("assets/tiles/ne.png"),
  nw: PIXI.Texture.from("assets/tiles/nw.png"),
  "w-e": PIXI.Texture.from("assets/tiles/w-e.png"),
  "n-nw-w": PIXI.Texture.from("assets/tiles/n-nw-w.png"),
  "n-ne-e": PIXI.Texture.from("assets/tiles/n-ne-e.png"),
  all: PIXI.Texture.from("assets/tiles/all.png"),
};

const drawer = new Drawer(window.innerWidth, window.innerHeight);
drawer.draw(dungeon, {
  debug: false,
  debugTilesNumber: true,
  unitWidthInPixels: 16,
  tilesSprites: {
    "-2": textures["hole"],
    "-1": textures["edge"],
    0: textures["ground"],
    1: textures["s"],
    2: textures["s"],
    3: textures["s"],
    4: textures["s"],
    5: textures["s"],
    7: textures["s"],
    6: textures["s"],
    8: textures["s"],
    10: textures["s"],
    11: textures["s"],
    12: textures["s"],
    13: textures["w-e"],
    14: textures["w-e"],
    15: textures["w-e"],
    17: textures["w-e"],
    18: textures["w-e"],
    20: textures["w-e"],
    26: textures["n-ne-e"],
    27: textures["n-ne-e"],
    29: textures["n-ne-e"],
    28: textures["e"],
    33: textures["e"],
    34: textures["n-nw-w.png"],
    35: textures["n-nw-w.png"],
    36: textures["w.png"],
    37: textures["n-nw-w.png"],
    41: textures["w.png"],
    42: textures["n.png"],
    44: textures["ne.png"],
    45: textures["nw.png"],
    46: textures["all.png"],
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
