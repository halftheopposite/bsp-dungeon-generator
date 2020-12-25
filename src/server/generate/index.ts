import { Drawer } from "./drawer";
import { generate } from "../../generate/dungeon";
import {
  tilesSprites,
  propsSprites,
  monstersSprites,
} from "../common/textures";

const dungeon = generate({
  mapWidth: 96,
  mapHeight: 56,
  mapGutterWidth: 1,
  iterations: 5,
  containerSizeRatio: 0.45,
  roomSpawnChance: 0.9,
  corridorWidth: 2,
  corridorTrapChance: 0.5,
});

console.log("Dungeon:", dungeon);

const drawer = new Drawer(window.innerWidth, window.innerHeight);
drawer.draw(dungeon, {
  debug: false,
  debugTilesNumber: false,
  unitWidthInPixels: 16,
  tilesSprites,
  propsSprites,
  monstersSprites,
});
