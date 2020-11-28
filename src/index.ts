import { Dungeon } from "./dungeon";
import { Drawer } from "./drawer";

const dungeon = new Dungeon({
  mapWidth: 48,
  mapHeight: 48,
  mapGutterWidth: 1,
  iterations: 3,
  containerGutterWidth: 1,
  containerWidthRatio: 0.45,
  containerHeightRatio: 0.45,
  roomGutterWidth: 2,
  roomMaxMonsters: 6,
  roomMinSize: 3,
  corridorWidth: 2,
});

const drawer = new Drawer(window.innerWidth, window.innerHeight);
drawer.draw(dungeon, { unitWidthInPixels: 16 });
