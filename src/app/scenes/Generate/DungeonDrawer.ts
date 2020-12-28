import * as PIXI from "pixi.js";
import { Dungeon } from "../../../generate/dungeon";
import { Container, TileMap, TreeNode } from "../../../generate/types";
import { Textures } from "../../utils";

export interface TexturesMap {
  [key: string]: PIXI.Texture;
}

export interface DrawOptions {
  debug: boolean;
  unitWidthInPixels: number;
}

export class DungeonDrawer {
  private app: PIXI.Application;
  private tilemapContainer: PIXI.Container;
  private shapesContainer: PIXI.Container;
  private unitInPixels: number;

  //
  // Lifecycle
  //
  constructor(container: HTMLDivElement) {
    this.app = new PIXI.Application({
      width: container.getBoundingClientRect().width,
      height: container.getBoundingClientRect().height,
      backgroundColor: 0x200b13,
    });

    if (container.hasChildNodes()) {
      container.firstChild.remove();
    }
    container.appendChild(this.app.view);

    // Containers
    this.tilemapContainer = new PIXI.Container();
    this.shapesContainer = new PIXI.Container();
    this.app.stage.addChild(this.tilemapContainer);
    this.app.stage.addChild(this.shapesContainer);
  }

  //
  // Layers
  //
  draw = (dungeon: Dungeon, options: DrawOptions) => {
    this.tilemapContainer.removeChildren();
    this.shapesContainer.removeChildren();
    this.unitInPixels = options.unitWidthInPixels;

    this.drawTiles(dungeon.layers.tiles, Textures.tilesSprites);
    this.drawProps(dungeon.layers.props, Textures.propsSprites);
    this.drawMonsters(dungeon.layers.monsters, Textures.monstersSprites);

    if (options.debug) {
      this.drawGrid(dungeon);
      this.drawContainers(dungeon.tree);
      this.drawRooms(dungeon.tree, options);
      this.drawCorridors(dungeon.tree);
    }
  };

  private drawTiles = (tilemap: TileMap, sprites: TexturesMap) => {
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const id = tilemap[y][x];
        const texture = sprites[id];
        if (texture) {
          const sprite = new PIXI.Sprite(texture);
          sprite.position.set(x * this.unitInPixels, y * this.unitInPixels);
          this.tilemapContainer.addChild(sprite);
        } else {
          const rectangle = new PIXI.Graphics();
          rectangle.beginFill(0xff0000);
          rectangle.drawRect(0, 0, this.unitInPixels, this.unitInPixels);
          rectangle.endFill();
          rectangle.position.set(x * this.unitInPixels, y * this.unitInPixels);
          this.tilemapContainer.addChild(rectangle);
        }
      }
    }
  };

  private drawProps = (tilemap: TileMap, sprites: TexturesMap) => {
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const id = tilemap[y][x];
        if (id === 0) {
          continue;
        }

        const texture = sprites[id];
        if (texture) {
          const sprite = new PIXI.Sprite(texture);
          sprite.position.set(x * this.unitInPixels, y * this.unitInPixels);
          this.tilemapContainer.addChild(sprite);
        } else {
          const rectangle = new PIXI.Graphics();
          rectangle.beginFill(0x00ff00);
          rectangle.drawRect(0, 0, this.unitInPixels, this.unitInPixels);
          rectangle.endFill();
          rectangle.position.set(x * this.unitInPixels, y * this.unitInPixels);
          this.tilemapContainer.addChild(rectangle);
        }
      }
    }
  };

  private drawMonsters = (tilemap: TileMap, sprites: TexturesMap) => {
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const id = tilemap[y][x];
        if (id === 0) {
          continue;
        }

        const texture = sprites[id];
        if (texture) {
          const sprite = new PIXI.Sprite(texture);
          sprite.anchor.set(0.5);
          sprite.position.set(
            x * this.unitInPixels + this.unitInPixels / 2,
            y * this.unitInPixels + this.unitInPixels / 2
          );
          this.tilemapContainer.addChild(sprite);
        } else {
          const rectangle = new PIXI.Graphics();
          rectangle.beginFill(0x0000ff);
          rectangle.drawRect(0, 0, this.unitInPixels, this.unitInPixels);
          rectangle.endFill();
          rectangle.position.set(x * this.unitInPixels, y * this.unitInPixels);
          this.tilemapContainer.addChild(rectangle);
        }
      }
    }
  };

  //
  // Debug
  //
  private drawGrid = (dungeon: Dungeon) => {
    for (let y = 0; y < dungeon.height; y++) {
      for (let x = 0; x < dungeon.width; x++) {
        const rectangle = new PIXI.Graphics();
        rectangle.lineStyle(1, 0xffffff, 0.1);
        rectangle.drawRect(0, 0, this.unitInPixels, this.unitInPixels);
        rectangle.position.set(x * this.unitInPixels, y * this.unitInPixels);
        this.shapesContainer.addChild(rectangle);
      }
    }
  };

  private drawContainers = (container: TreeNode<Container>) => {
    container.leaves.forEach((container) => {
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

  private drawRooms = (
    container: TreeNode<Container>,
    options: DrawOptions
  ) => {
    container.leaves.forEach((container) => {
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

      // Room id
      const text = new PIXI.Text(`${room.id}`, {
        fontSize: 22,
        fill: 0x00ff00,
      });
      text.anchor.set(0.5);
      rectangle.addChild(text);
      text.position.set(
        (room.width / 2) * options.unitWidthInPixels,
        (room.height / 2) * options.unitWidthInPixels
      );

      this.shapesContainer.addChild(rectangle);
    });
  };

  private drawCorridors = (container: TreeNode<Container>) => {
    const corridor = container.leaf.corridor;
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
}
