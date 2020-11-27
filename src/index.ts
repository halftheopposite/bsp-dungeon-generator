import { ShapeDrawer } from "./shapeDrawer";
import { Dungeon } from "./dungeon";
import { GridDrawer } from "./gridDrawer";

const result = new Dungeon().generate({
  mapWidth: 96,
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

const gridDrawer = new GridDrawer(window.innerWidth, window.innerHeight);
gridDrawer.draw(result);

// const shapeDrawer = new ShapeDrawer();
// shapeDrawer.draw(result);
