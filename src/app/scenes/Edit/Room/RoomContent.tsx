import * as React from "react";
import {
  MonsterType,
  PropType,
  RoomTemplate,
  TileLayer,
  TileType,
} from "../../../../generate/types";
import { EditorDrawer } from "./EditorDrawer";
import { SIDEBAR_WIDTH } from "../../../constants";
import { useRooms } from "../hooks/rooms";

/**
 * The selected room tiles editor.
 */
export function RoomContent(props: {
  room: RoomTemplate;
  onUpdate: (layer: TileLayer, x: number, y: number, value: number) => void;
}): React.ReactElement {
  const { room, onUpdate } = props;
  const canvasRef = React.useRef<HTMLDivElement>();
  const canvasDrawer = React.useRef<EditorDrawer>();
  const { selectedLayer, selectedTile, debug } = useRooms();

  const onTileClick = (x: number, y: number) => {
    const layer = room.layers[selectedLayer];
    if (x >= room.width || y >= room.height) {
      return;
    }

    const tileId = layer[y][x];
    const newTileId = getTileIdFromName(selectedLayer, selectedTile);
    onUpdate(
      selectedLayer,
      x,
      y,
      tileId !== 0 && tileId === newTileId ? 0 : newTileId
    );
  };

  /** Initialize the canvas drawer */
  React.useEffect(() => {
    if (!canvasDrawer.current) {
      canvasDrawer.current = new EditorDrawer(canvasRef.current);
    }

    canvasDrawer.current.onTileClick = onTileClick;
  }, [canvasRef, room, selectedLayer, selectedTile]);

  /** Update drawer when room changes */
  React.useEffect(() => {
    canvasDrawer.current.drawLayers(room.layers, selectedLayer, debug);
  }, [room, selectedLayer, debug]);

  return (
    <div
      style={{
        position: "absolute",
        left: SIDEBAR_WIDTH + 4,
        bottom: 0,
        top: 0,
        right: 0,
        overflow: "scroll",
      }}
    >
      <div
        ref={canvasRef}
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          top: 0,
          right: 0,
        }}
      />
    </div>
  );
}

/**
 * Return a tile's id given a layer and its name.
 */
function getTileIdFromName(layer: TileLayer, tileName: string): number {
  switch (layer) {
    case "tiles":
      return TileType[tileName];
    case "props":
      return PropType[tileName];
    case "monsters":
      return MonsterType[tileName];
  }
}
