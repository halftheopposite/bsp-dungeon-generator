import * as React from "react";
import {
  RoomTemplate,
  RoomType,
  RoomTypes,
  TileLayer,
  TileLayers,
} from "../../generate/types";
import { resizeTileMap } from "../../generate/utils";
import { CanvasDrawer } from "./CanvasDrawer";
import { BORDER_COLOR } from "./constants";
import { CollectionsProvider, useRooms } from "./hooks/rooms";

const COLUMN_WIDTH = 200;

export function App(props: {}): React.ReactElement {
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
      <CollectionsProvider>
        <Sidebar />
        <Room />
      </CollectionsProvider>
    </div>
  );
}

//
// Sidebar
//
export function Sidebar(props: {}): React.ReactElement {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        top: 0,
        width: COLUMN_WIDTH,
        cursor: "pointer",
        borderRight: `2px solid ${BORDER_COLOR}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SidebarHeader />
      <Separator />
      <RoomsList />
    </div>
  );
}

function SidebarHeader(props: {}): React.ReactElement {
  const { saveRooms, loadRooms } = useRooms();

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      const rawJSON = event.target.result;
      const parsedJSON = JSON.parse(rawJSON);
      loadRooms(parsedJSON);
    });
    reader.readAsText(file);
  };

  return (
    <div>
      <h1
        style={{
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Editor
      </h1>
      <Separator />
      <div style={{ display: "flex", flexDirection: "column", margin: 8 }}>
        {/* Load */}
        <p style={{ fontWeight: "bold" }}>You can load an existing save:</p>
        <input type="file" accept="application/json" onChange={onFileChange} />
        <p style={{ marginTop: 8, fontWeight: "bold" }}>
          You can save your edits:
        </p>
        <input type="button" value="Save file" onClick={saveRooms} />
      </div>
    </div>
  );
}

function RoomsList(props: {}): React.ReactElement {
  const { rooms, selectedRoomId, addRoom, selectRoom, removeRoom } = useRooms();

  return (
    <div
      style={{
        padding: 8,
      }}
    >
      <h2>Rooms</h2>
      <Spacer />

      {/* Add room button */}
      <input type="button" value="+ Add room" onClick={addRoom} />
      <Spacer size={16} />
      <Separator size={2} />

      {/* Rooms list */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {rooms.map((room) => (
          <RoomListItem
            key={room.id}
            room={room}
            selected={selectedRoomId === room.id}
            onClick={() => selectRoom(room.id)}
            onDelete={() => removeRoom(room.id)}
          />
        ))}
      </div>
    </div>
  );
}

function RoomListItem(props: {
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
        borderBottom: `1px solid ${BORDER_COLOR}`,
        backgroundColor: hovered || selected ? `rgba(0,0,0,0.1)` : "white",
        width: "100%",
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

//
// Room
//
function Room(props: {}): React.ReactElement {
  const { rooms, selectedRoomId, updateRoom } = useRooms();
  const [selectedLayer, setSelectedLayer] = React.useState<TileLayer>("tiles");

  const room = rooms.find((item) => item.id === selectedRoomId);
  if (!room) {
    return (
      <div
        style={{
          position: "absolute",
          left: COLUMN_WIDTH,
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

function RoomDetails(props: {
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

function RoomLayers(props: {
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
        left: COLUMN_WIDTH + 2,
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

//
// Utils
//
function Separator(props: { size?: number }): React.ReactElement {
  const { size = 2 } = props;

  return <div style={{ height: size, backgroundColor: BORDER_COLOR }} />;
}

function Spacer(props: { size?: number }): React.ReactElement {
  const { size = 8 } = props;

  return <div style={{ height: size, minHeight: size }} />;
}
