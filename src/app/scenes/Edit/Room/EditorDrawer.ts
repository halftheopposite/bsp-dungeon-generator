import * as PIXI from "pixi.js";
import { computeTilesMask } from "../../../../generate/dungeon";
import { TileLayer, TileMaps, TileMap } from "../../../../generate/types";
import { Textures } from "../../../utils";

const TILE_SIZE = 32;

type TileClickCallback = (x: number, y: number) => void;

export class EditorDrawer {
  private app: PIXI.Application;

  private tilesContainer: PIXI.Container;
  private propsContainer: PIXI.Container;
  private monstersContainer: PIXI.Container;

  private cursorContainer: PIXI.Container;
  private cursorPosition: PIXI.Point;
  private cursorSprite: PIXI.Graphics;

  private debugContainer: PIXI.Container;

  onTileClick: TileClickCallback;

  //
  // Lifecycle
  //
  constructor(container: HTMLDivElement) {
    this.app = new PIXI.Application({
      width: container.getBoundingClientRect().width,
      height: container.getBoundingClientRect().height,
      backgroundColor: 0x200b13,
      resizeTo: window,
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
    this.app.stage.addChild(this.tilesContainer);
    this.app.stage.addChild(this.propsContainer);
    this.app.stage.addChild(this.monstersContainer);

    // Cursor
    this.cursorPosition = new PIXI.Point(0, 0);
    this.cursorSprite = new PIXI.Graphics();
    this.cursorSprite.beginFill(0x0000ff, 0.5);
    this.cursorSprite.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
    this.cursorSprite.endFill();
    this.cursorContainer = new PIXI.Container();
    this.cursorContainer.addChild(this.cursorSprite);
    this.app.stage.addChild(this.cursorContainer);

    // Debug
    this.debugContainer = new PIXI.Container();
    this.app.stage.addChild(this.debugContainer);
  }

  //
  // Handlers
  //
  private onMouseMove = (event: PIXI.InteractionEvent) => {
    const { x, y } = event.data.global;

    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);

    this.cursorPosition.set(gridX, gridY);
    this.cursorSprite.position.set(
      this.cursorPosition.x * TILE_SIZE,
      this.cursorPosition.y * TILE_SIZE
    );
  };

  onMouseClick = () => {
    if (!this.onTileClick) {
      console.warn("No listener attached to onMouseClick.");
    }

    this.onTileClick(this.cursorPosition.x, this.cursorPosition.y);
  };

  //
  // Layers
  //
  drawLayers = (layers: TileMaps, selectedLayer: TileLayer, debug: boolean) => {
    const { tiles, props, monsters } = layers;

    this.drawTiles(tiles, selectedLayer === "tiles");
    this.drawProps(props, selectedLayer === "props");
    this.drawMonsters(monsters, selectedLayer === "monsters");

    if (debug) {
      this.drawGrid(tiles);
    } else {
      this.clearGrid();
    }
  };

  private drawTiles = (tiles: TileMap, selected: boolean) => {
    this.tilesContainer.removeChildren();
    this.tilesContainer.alpha = selected ? 1.0 : 0.5;
    tiles = computeTilesMask(tiles);

    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const tileId = tiles[y][x];
        const texture = Textures.tilesSprites[tileId];
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

        const texture = Textures.propsSprites[tileId];
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

        const texture = Textures.monstersSprites[tileId];
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
  private drawGrid = (tiles: TileMap) => {
    tiles = computeTilesMask(tiles);

    this.debugContainer.removeChildren();

    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const rectangle = new PIXI.Graphics();
        rectangle.lineStyle(1, 0x00ff00, 0.5);
        rectangle.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        rectangle.position.set(x * TILE_SIZE, y * TILE_SIZE);

        // Drawing tiles ids is expensive, use when debugging.
        // const tileId = tiles[y][x];
        // const text = new PIXI.Text(`${tileId}`, {
        //   fontSize: 10,
        //   fill: 0xffffff,
        // });
        // text.anchor.set(0.5);
        // text.position.set(TILE_SIZE / 2, TILE_SIZE / 2);
        // rectangle.addChild(text);

        this.debugContainer.addChild(rectangle);
      }
    }
  };

  private clearGrid = () => {
    this.debugContainer.removeChildren();
  };
}
