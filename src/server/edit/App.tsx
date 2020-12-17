import * as React from "react";
import { Rooms } from "../../generate/rooms";
import {
  RoomTemplate,
  RoomType,
  RoomTypes,
  TileLayer,
  TileLayers,
} from "../../generate/types";
import { createTilemap, resizeTileMap } from "../../generate/utils";
import { CanvasDrawer } from "./CanvasDrawer";

const COLUMN_WIDTH = 200;

export function App(props: {}): React.ReactElement {
  const [rooms, setRooms] = React.useState<RoomTemplate[]>([]);
  const [selectedRoomId, setSelectedRoomId] = React.useState<string>(null);
  const selectedRoom = selectedRoomId
    ? rooms.find((item) => item.id === selectedRoomId)
    : null;

  // Add a room
  const onRoomAdd = () => {
    const id = String(Date.now());
    setRooms((prev) => {
      const result = [...prev];

      result.push({
        id,
        width: 8,
        height: 8,
        type: "monsters",
        layers: {
          tiles: createTilemap(8, 8, 0),
          props: createTilemap(8, 8, 0),
          monsters: createTilemap(8, 8, 0),
        },
      });

      return result;
    });
    setSelectedRoomId(id);
  };

  // Update a room
  const onRoomUpdate = (updated: RoomTemplate, oldRoomId: string) => {
    setRooms((prev) => {
      const index = prev.findIndex((item) => item.id === oldRoomId);
      const updatedRooms = [...prev];
      updatedRooms[index] = {
        ...updatedRooms[index],
        ...updated,
      };

      return updatedRooms;
    });
    setSelectedRoomId(updated.id);
  };

  // Delete a room
  const onRoomDelete = (roomId: string) => {
    setRooms((prev) => {
      const result = [...prev];

      const index = prev.findIndex((item) => item.id === roomId);
      if (index !== -1) {
        result.splice(index, 1);
      }
      return result;
    });
  };

  // Load all rooms on mount.
  React.useEffect(() => {
    const sorted = Rooms.sort((a, b) => a.id.localeCompare(b.id));
    setRooms(sorted);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <RoomsList
        rooms={rooms}
        selectedRoomId={selectedRoomId}
        onRoomAdd={onRoomAdd}
        onRoomClick={(roomId) => setSelectedRoomId(roomId)}
        onRoomDelete={onRoomDelete}
      />
      {selectedRoom ? (
        <Room room={selectedRoom} onUpdate={onRoomUpdate} />
      ) : null}
    </div>
  );
}

/**
 * A list of all available rooms.
 */
export function RoomsList(props: {
  rooms: RoomTemplate[];
  selectedRoomId: string;
  onRoomAdd: () => void;
  onRoomClick: (roomId: string) => void;
  onRoomDelete: (roomId: string) => void;
}): React.ReactElement {
  const { rooms, selectedRoomId, onRoomAdd, onRoomClick, onRoomDelete } = props;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        top: 0,
        width: COLUMN_WIDTH,
        cursor: "pointer",
        borderRight: "2px solid #efefef",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1
        style={{
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid #efefef",
        }}
      >
        Rooms
      </h1>
      <input type="button" value="+ Add room" onClick={onRoomAdd} />
      {rooms.map((room) => (
        <RoomListItem
          key={room.id}
          room={room}
          selected={selectedRoomId === room.id}
          onClick={onRoomClick}
          onDelete={onRoomDelete}
        />
      ))}
    </div>
  );
}

export function RoomListItem(props: {
  room: RoomTemplate;
  selected: boolean;
  onClick: (roomId: string) => void;
  onDelete: (roomId: string) => void;
}): React.ReactElement {
  const { room, selected, onClick, onDelete } = props;
  const [hovered, setHovered] = React.useState(false);

  const handleDelete = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();

    onDelete(room.id);
  };

  return (
    <div
      style={{
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        borderBottom: "1px solid #efefef",
        backgroundColor: hovered || selected ? `rgba(0,0,0,0.1)` : "white",
      }}
      onClick={() => onClick(room.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {room.id}
      {/* When hovered, display a delete button */}
      {hovered ? (
        <div
          style={{
            position: "absolute",
            right: 8,
          }}
          onClick={handleDelete}
        >
          🗑️
        </div>
      ) : null}
    </div>
  );
}

/**
 * A selected room details and editor.
 */
export function Room(props: {
  room: RoomTemplate;
  onUpdate: (updated: RoomTemplate, oldRoomId: string) => void;
}): React.ReactElement {
  const { room, onUpdate } = props;
  const [selectedLayer, setSelectedLayer] = React.useState<TileLayer>("tiles");

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

    onUpdate(updated, oldRoomId);
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
    onUpdate(updated, room.id);
  };

  const onLayerUpdate = (layer: TileLayer) => {
    setSelectedLayer(layer);
  };

  return (
    <div
      style={{
        position: "absolute",
        left: COLUMN_WIDTH,
        bottom: 0,
        top: 0,
        right: 0,
        display: "flex",
        flexDirection: "row",
      }}
    >
      <RoomDetails
        room={room}
        selectedLayer={selectedLayer}
        onLayerUpdate={onLayerUpdate}
        onUpdate={onDetailsUpdate}
      />
      <RoomLayers
        room={room}
        selectedLayer={selectedLayer}
        onUpdate={onTileUpdate}
      />
    </div>
  );
}

export function RoomDetails(props: {
  room: RoomTemplate;
  selectedLayer: TileLayer;
  onLayerUpdate: (layer: TileLayer) => void;
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
  const { room, selectedLayer, onLayerUpdate, onUpdate } = props;
  const [oldId, setOldId] = React.useState(room.id); // Keep a ref to the old id since ids can be changed
  const [id, setId] = React.useState(room.id);
  const [type, setType] = React.useState<RoomType>(room.type);
  const [width, setWidth] = React.useState(room.width);
  const [height, setHeight] = React.useState(room.height);

  /** When the room is updated we reset all the fields */
  React.useEffect(() => {
    setOldId(room.id);
    setId(room.id);
    setType(room.type);
    setWidth(room.width);
    setHeight(room.height);
  }, [room.id]);

  React.useEffect(() => {
    onUpdate(
      {
        id,
        type,
        width,
        height,
      },
      oldId
    );
  }, [id, type, width, height]);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        top: 0,
        width: COLUMN_WIDTH,
        borderRight: "2px solid #efefef",
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
          borderBottom: "1px solid #efefef",
        }}
      >
        {room.id}
      </h2>

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

      {/* Layers */}
      <div
        style={{
          borderTop: "1px solid #efefef",
          marginTop: 16,
          padding: 8,
        }}
      >
        <h3>Selected layer:</h3>

        {/* Layer */}
        <p style={{ marginTop: 16 }}>Layer:</p>
        <select
          value={selectedLayer}
          onChange={(event) => onLayerUpdate(event.target.value as TileLayer)}
        >
          {TileLayers.map((tileLayer) => (
            <option key={tileLayer} value={tileLayer}>
              {tileLayer}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function RoomLayers(props: {
  room: RoomTemplate;
  selectedLayer: TileLayer;
  onUpdate: (layer: TileLayer, x: number, y: number, value: number) => void;
}): React.ReactElement {
  const { room, selectedLayer, onUpdate } = props;
  const canvasRef = React.useRef<HTMLDivElement>();
  const canvasDrawer = React.useRef<CanvasDrawer>();

  const onTileClick = (x: number, y: number) => {
    const layer = room.layers[selectedLayer];
    if (x >= room.width || y >= room.height) {
      return;
    }

    const tileId = layer[y][x];

    switch (selectedLayer) {
      case "tiles":
        onUpdate(selectedLayer, x, y, tileId !== 0 ? 0 : 1);
        break;
    }
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
  }, [canvasRef, room]);

  /** Update drawer when room changes */
  React.useEffect(() => {
    canvasDrawer.current.drawLayers(room.layers, selectedLayer);
    canvasDrawer.current.resizeGrid(room.width, room.height);
  }, [room, selectedLayer]);

  return (
    <div
      style={{
        position: "absolute",
        left: COLUMN_WIDTH,
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
