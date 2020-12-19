import * as PIXI from "pixi.js";
import { computeTilesMask } from "../../generate/dungeon";
import { TileLayer, TileMaps, TileMap } from "../../generate/types";
import { tilesSprites, propsSprites, monstersSprites } from "../common";

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const TILE_SIZE = 32;

type TileClickCallback = (x: number, y: number) => void;

export class CanvasDrawer {
  private app: PIXI.Application;

  private tilesContainer: PIXI.Container;
  private propsContainer: PIXI.Container;
  private monstersContainer: PIXI.Container;

  private gridContainer: PIXI.Container;
  private cursorGridPos: PIXI.Point;
  private cursorGridHover: PIXI.Graphics;

  onTileClick: TileClickCallback;

  // Lifecycle
  constructor(container: HTMLDivElement, width: number, height: number) {
    this.app = new PIXI.Application({
      width: container.getBoundingClientRect().width,
      height: container.getBoundingClientRect().height,
      backgroundColor: 0xffffff,
    });

    if (container.hasChildNodes()) {
      container.firstChild.remove();
    }
    container.appendChild(this.app.view);

    // Events
    this.app.stage.interactive = true;
    this.app.stage.on("pointermove", this.onMouseMove);
    this.app.stage.on("mouseup", this.onMouseClick);

    // Containers
    this.tilesContainer = new PIXI.Container();
    this.propsContainer = new PIXI.Container();
    this.monstersContainer = new PIXI.Container();
    this.gridContainer = new PIXI.Container();
    this.app.stage.addChild(this.tilesContainer);
    this.app.stage.addChild(this.propsContainer);
    this.app.stage.addChild(this.monstersContainer);
    this.app.stage.addChild(this.gridContainer);

    // Cursor
    this.cursorGridPos = new PIXI.Point(0, 0);
    this.cursorGridHover = new PIXI.Graphics();
    this.cursorGridHover.beginFill(0x0000ff, 0.5);
    this.cursorGridHover.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
    this.cursorGridHover.endFill();
  }

  //
  // Handlers
  //
  private onMouseMove = (event: PIXI.InteractionEvent) => {
    const { x, y } = event.data.global;

    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);

    this.cursorGridPos.set(gridX, gridY);
    this.cursorGridHover.position.set(
      this.cursorGridPos.x * TILE_SIZE,
      this.cursorGridPos.y * TILE_SIZE
    );
  };

  onMouseClick = () => {
    if (!this.onTileClick) {
      console.warn("No listener attached to onMouseClick.");
    }

    this.onTileClick(this.cursorGridPos.x, this.cursorGridPos.y);
  };

  //
  // Layers
  //
  drawLayers = (layers: TileMaps, selectedLayer: TileLayer) => {
    const { tiles, props, monsters } = layers;

    this.drawTiles(tiles, selectedLayer === "tiles");
    this.drawProps(props, selectedLayer === "props");
    this.drawMonsters(monsters, selectedLayer === "monsters");
  };

  private drawTiles = (tiles: TileMap, selected: boolean) => {
    this.tilesContainer.removeChildren();
    this.tilesContainer.alpha = selected ? 1.0 : 0.5;
    tiles = computeTilesMask(tiles);

    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const tileId = tiles[y][x];
        const texture = tilesSprites[tileId];
        if (texture) {
          const sprite = new PIXI.Sprite(texture);
          sprite.scale.set(TILE_SIZE / texture.width);
          sprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
          this.tilesContainer.addChild(sprite);
        } else {
          const rectangle = new PIXI.Graphics();
          rectangle.beginFill(0xff0000);
          rectangle.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
          rectangle.endFill();
          rectangle.position.set(x * TILE_SIZE, y * TILE_SIZE);
          this.tilesContainer.addChild(rectangle);
        }
      }
    }
  };

  private drawProps = (tiles: TileMap, selected: boolean) => {
    this.propsContainer.removeChildren();
    this.propsContainer.alpha = selected ? 1.0 : 0.5;

    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const tileId = tiles[y][x];
        if (tileId === 0) {
          continue;
        }

        const texture = propsSprites[tileId];
        const sprite = new PIXI.Sprite(texture);
        sprite.scale.set(TILE_SIZE / texture.width);
        sprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
        this.propsContainer.addChild(sprite);
      }
    }
  };

  private drawMonsters = (tiles: TileMap, selected: boolean) => {
    this.monstersContainer.removeChildren();
    this.monstersContainer.alpha = selected ? 1.0 : 0.5;

    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const tileId = tiles[y][x];
        if (tileId === 0) {
          continue;
        }

        const texture = monstersSprites[tileId];
        const sprite = new PIXI.Sprite(texture);
        sprite.scale.set(TILE_SIZE / texture.width);
        sprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
        this.monstersContainer.addChild(sprite);
      }
    }
  };

  //
  // Debug
  //
  resizeGrid = (width: number, height: number) => {
    this.gridContainer.removeChildren();
    this.gridContainer.addChild(this.cursorGridHover);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const rectangle = new PIXI.Graphics();
        rectangle.lineStyle(1, 0x00ff00, 0.5);
        rectangle.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        rectangle.position.set(x * TILE_SIZE, y * TILE_SIZE);
        this.gridContainer.addChild(rectangle);
      }
    }
  };
}
