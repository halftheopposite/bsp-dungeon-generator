import * as React from "react";
import {
  MonsterType,
  MonsterTypes,
  PropType,
  PropTypes,
  RoomTemplate,
  RoomType,
  RoomTypes,
  TileLayer,
  TileLayers,
  TileType,
  TileTypes,
} from "../../../../generate/types";
import { resizeTileMap } from "../../../../generate/utils";
import { CanvasDrawer } from "./CanvasDrawer";
import { BORDER_COLOR, SIDEBAR_WIDTH } from "../../constants";
import { useRooms } from "./hooks/rooms";
import { Separator } from "../../components";

/**
 * The selected room's editor.
 */
export function Room(props: {}): React.ReactElement {
  const { rooms, selectedRoomId, updateRoom } = useRooms();

  const room = rooms.find((item) => item.id === selectedRoomId);
  if (!room) {
    return <RoomEmpty />;
  }

  /** When a room's details are updated */
  const onDetailsUpdate = (
    params: {
      id: string;
      type: RoomType;
      width: number;
      height: number;
    },
    oldRoomId: string
  ) => {
    const updated = {
      ...room,
      ...params,
    };

    // If size of the map was changed, we want to update the corresponding layers
    if (params.width !== room.width || params.height !== room.height) {
      updated.layers.tiles = resizeTileMap(
        updated.layers.tiles,
        params.width,
        params.height
      );
      updated.layers.props = resizeTileMap(
        updated.layers.props,
        params.width,
        params.height
      );
      updated.layers.monsters = resizeTileMap(
        updated.layers.monsters,
        params.width,
        params.height
      );
    }

    updateRoom(updated, oldRoomId);
  };

  /** When a tile is updated in a layer */
  const onTileUpdate = (
    layer: TileLayer,
    x: number,
    y: number,
    value: number
  ) => {
    const updated = {
      ...room,
    };

    updated.layers[layer][y][x] = value;
    updateRoom(updated, room.id);
  };

  return (
    <div
      style={{
        position: "absolute",
        left: SIDEBAR_WIDTH,
        bottom: 0,
        top: 0,
        right: 0,
        display: "flex",
        flexDirection: "row",
      }}
    >
      <RoomDetails room={room} onUpdate={onDetailsUpdate} />
      <RoomLayers room={room} onUpdate={onTileUpdate} />
    </div>
  );
}

function RoomEmpty(): React.ReactElement {
  return (
    <div
      style={{
        position: "absolute",
        left: SIDEBAR_WIDTH,
        bottom: 0,
        top: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      Select a room or create one.
    </div>
  );
}

/**
 * The selected room's base parameters.
 */
function RoomDetails(props: {
  room: RoomTemplate;
  onUpdate: (
    params: {
      id: string;
      type: RoomType;
      width: number;
      height: number;
    },
    oldRoomId: string
  ) => void;
}): React.ReactElement {
  const { room, onUpdate } = props;
  const [oldId, setOldId] = React.useState(room.id); // Keep a ref to the old id since ids can be changed
  const [id, setId] = React.useState(room.id);
  const [type, setType] = React.useState<RoomType>(room.type);
  const [width, setWidth] = React.useState(room.width);
  const [height, setHeight] = React.useState(room.height);
  const { selectedLayer, selectedTile, selectLayer, selectTile } = useRooms();

  /** When the room is updated we reset all the fields */
  React.useEffect(() => {
    setOldId(room.id);
    setId(room.id);
    setType(room.type);
    setWidth(room.width);
    setHeight(room.height);
  }, [room.id]);

  React.useEffect(() => {
    if (
      room.id !== id ||
      room.type !== type ||
      room.width !== width ||
      room.height !== height
    ) {
      onUpdate(
        {
          id,
          type,
          width,
          height,
        },
        oldId
      );
    }
  }, [id, type, width, height]);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        top: 0,
        width: SIDEBAR_WIDTH,
        borderRight: `2px solid ${BORDER_COLOR}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2
        style={{
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {room.id}
      </h2>
      <Separator size={2} />

      {/* Params */}
      <div
        style={{
          padding: 8,
        }}
      >
        <h3>Params:</h3>

        {/* Id */}
        <p style={{ marginTop: 16 }}>Id:</p>
        <input
          type="text"
          value={id}
          onChange={(event) => setId(event.target.value)}
        />

        {/* Type */}
        <p style={{ marginTop: 16 }}>Type:</p>
        <select
          value={type}
          onChange={(event) => setType(event.target.value as RoomType)}
        >
          {RoomTypes.map((roomType) => (
            <option key={roomType} value={roomType}>
              {roomType}
            </option>
          ))}
        </select>

        {/* Width */}
        <p style={{ marginTop: 16 }}>Width:</p>
        <input
          type="number"
          value={width}
          onChange={(event) => setWidth(Number.parseInt(event.target.value))}
        />

        {/* Height */}
        <p style={{ marginTop: 16 }}>Height:</p>
        <input
          type="number"
          value={height}
          onChange={(event) => setHeight(Number.parseInt(event.target.value))}
        />
      </div>
      <Separator size={2} />

      {/* Layers */}
      <div
        style={{
          marginTop: 16,
          padding: 8,
        }}
      >
        <h3>Selected layer:</h3>

        {/* Layer */}
        <p style={{ marginTop: 16 }}>Layer:</p>
        <select
          value={selectedLayer}
          onChange={(event) => selectLayer(event.target.value as TileLayer)}
        >
          {TileLayers.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Tile */}
        <p style={{ marginTop: 16 }}>Tile:</p>
        <select
          value={selectedTile}
          onChange={(event) => selectTile(event.target.value)}
        >
          {getTilesForLayer(selectedLayer).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/**
 * The selected room's tile editor.
 */
function RoomLayers(props: {
  room: RoomTemplate;
  onUpdate: (layer: TileLayer, x: number, y: number, value: number) => void;
}): React.ReactElement {
  const { room, onUpdate } = props;
  const canvasRef = React.useRef<HTMLDivElement>();
  const canvasDrawer = React.useRef<CanvasDrawer>();
  const { selectedLayer, selectedTile } = useRooms();

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
    if (!canvasRef.current) {
      return;
    }

    if (!canvasDrawer.current) {
      canvasDrawer.current = new CanvasDrawer(canvasRef.current, 500, 500);
    }

    canvasDrawer.current.onTileClick = onTileClick;
  }, [canvasRef, room, selectedLayer, selectedTile]);

  /** Update drawer when room changes */
  React.useEffect(() => {
    canvasDrawer.current.drawLayers(room.layers, selectedLayer);
    canvasDrawer.current.resizeGrid(room.width, room.height);
  }, [room, selectedLayer]);

  return (
    <div
      style={{
        position: "absolute",
        left: SIDEBAR_WIDTH + 2,
        bottom: 0,
        top: 0,
        right: 0,
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

function getTilesForLayer(layer: TileLayer): string[] {
  switch (layer) {
    case "tiles":
      return TileTypes;
    case "props":
      return PropTypes;
    case "monsters":
      return MonsterTypes;
  }
}

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
