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
} from "../../../generate/types";
import { resizeTileMap } from "../../../generate/utils";
import { EditorDrawer } from "./EditorDrawer";
import { BACKGROUND_LIGHT, BORDER_COLOR, SIDEBAR_WIDTH } from "../../constants";
import { useRooms } from "./hooks/rooms";
import { SectionTitle, Separator, Spacer } from "../../components";

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
      <RoomSidebar room={room} onUpdate={onDetailsUpdate} />
      <RoomContent room={room} onUpdate={onTileUpdate} />
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
      Select an existing room or create a new one.
    </div>
  );
}

/**
 * The selected room base parameters.
 */
function RoomSidebar(props: {
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
        left: 2,
        bottom: 0,
        top: 0,
        width: SIDEBAR_WIDTH,
        borderRight: `2px solid ${BORDER_COLOR}`,
        backgroundColor: BACKGROUND_LIGHT,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Params */}
      <div
        style={{
          padding: 16,
        }}
      >
        <SectionTitle>Params</SectionTitle>
        <Spacer size={16} />

        {/* Id */}
        <p>Id:</p>
        <input
          style={{ width: "100%" }}
          type="text"
          value={id}
          onChange={(event) => setId(event.target.value)}
        />
        <Spacer size={16} />

        {/* Type */}
        <p>Type:</p>
        <select
          style={{ width: "100%" }}
          value={type}
          onChange={(event) => setType(event.target.value as RoomType)}
        >
          {RoomTypes.map((roomType) => (
            <option key={roomType} value={roomType}>
              {roomType}
            </option>
          ))}
        </select>
        <Spacer size={16} />

        {/* Width */}
        <p>Width:</p>
        <input
          style={{ width: "100%" }}
          type="number"
          value={width}
          onChange={(event) => setWidth(Number.parseInt(event.target.value))}
        />
        <Spacer size={16} />

        {/* Height */}
        <p>Height:</p>
        <input
          style={{ width: "100%" }}
          type="number"
          value={height}
          onChange={(event) => setHeight(Number.parseInt(event.target.value))}
        />
      </div>
      <Separator size={2} />

      {/* Layers */}
      <div
        style={{
          padding: 16,
        }}
      >
        <SectionTitle>Layer</SectionTitle>
        <Spacer size={16} />

        {/* Layer */}
        <p>Selected layer:</p>
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
        <Spacer size={16} />

        {/* Tile */}
        <p>Selected tile:</p>
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
      <Separator size={2} />
    </div>
  );
}

/**
 * The selected room tiles editor.
 */
function RoomContent(props: {
  room: RoomTemplate;
  onUpdate: (layer: TileLayer, x: number, y: number, value: number) => void;
}): React.ReactElement {
  const { room, onUpdate } = props;
  const canvasRef = React.useRef<HTMLDivElement>();
  const canvasDrawer = React.useRef<EditorDrawer>();
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
      canvasDrawer.current = new EditorDrawer(canvasRef.current);
    }

    canvasDrawer.current.onTileClick = onTileClick;
  }, [canvasRef, room, selectedLayer, selectedTile]);

  /** Update drawer when room changes */
  React.useEffect(() => {
    canvasDrawer.current.drawLayers(room.layers, selectedLayer);
  }, [room, selectedLayer]);

  return (
    <div
      style={{
        position: "absolute",
        left: SIDEBAR_WIDTH + 4,
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
