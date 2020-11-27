import { DungeonResult } from "./dungeon";
import { Container, TreeNode } from "./types";

const TILE_SIZE = 16;

export class ShapeDrawer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.context = this.canvas.getContext("2d");
  }

  draw = (dungeon: DungeonResult) => {
    this.canvas.width = dungeon.width * 16;
    this.canvas.height = dungeon.height * 16;

    this.drawContainers(dungeon.tree);
    this.drawRooms(dungeon.tree);
    this.drawCorridors(dungeon.tree);
    this.drawGrid(dungeon);
  };

  drawContainers = (node: TreeNode<Container>) => {
    node.nodes.forEach((container) => {
      this.context.strokeStyle = "rgba(255,0,0,1)";
      this.context.lineWidth = 2;
      this.context.strokeRect(
        container.x * TILE_SIZE,
        container.y * TILE_SIZE,
        container.width * TILE_SIZE,
        container.height * TILE_SIZE
      );
    });
  };

  drawRooms = (node: TreeNode<Container>) => {
    node.nodes.forEach((container) => {
      this.context.fillStyle = "rgba(0,255,0, 1)";
      this.context.fillRect(
        container.room.x * TILE_SIZE,
        container.room.y * TILE_SIZE,
        container.room.width * TILE_SIZE,
        container.room.height * TILE_SIZE
      );
    });
  };

  drawCorridors = (node: TreeNode<Container>) => {
    const corridor = node.data.corridor;
    if (!corridor) {
      return;
    }

    this.context.fillStyle = "rgba(0,0,255,0.4)";
    this.context.fillRect(
      corridor.x * TILE_SIZE,
      corridor.y * TILE_SIZE,
      corridor.width * TILE_SIZE,
      corridor.height * TILE_SIZE
    );

    this.drawCorridors(node.left);
    this.drawCorridors(node.right);
  };

  drawGrid = (dungeon: DungeonResult) => {
    this.context.beginPath();
    this.context.strokeStyle = "rgba(0,0,0,0.4)";
    this.context.lineWidth = 0.5;
    for (var i = 0; i < dungeon.width; i++) {
      this.context.moveTo(i * TILE_SIZE, 0);
      this.context.lineTo(i * TILE_SIZE, dungeon.width * TILE_SIZE);
      this.context.moveTo(0, i * TILE_SIZE);
      this.context.lineTo(dungeon.width * TILE_SIZE, i * TILE_SIZE);
    }
    this.context.stroke();
    this.context.closePath();
  };
}
