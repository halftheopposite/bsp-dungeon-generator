import * as React from "react";
import {
  MonsterTypes,
  PropTypes,
  RoomTemplate,
  RoomType,
  RoomTypes,
  TileLayer,
  TileLayers,
  TileTypes,
} from "../../../../generate/types";
import { SectionTitle, Separator, Spacer } from "../../../components";
import {
  BACKGROUND_LIGHT,
  BORDER_COLOR,
  SIDEBAR_WIDTH,
} from "../../../constants";
import { useRooms } from "../hooks/rooms";

/**
 * The selected room base parameters.
 */
export function RoomSidebar(props: {
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
  const {
    selectedLayer,
    selectedTile,
    debug,
    selectLayer,
    selectTile,
    setDebug,
  } = useRooms();

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

      {/* Debug */}
      <div
        style={{
          padding: 16,
        }}
      >
        <SectionTitle>Debug</SectionTitle>
        <Spacer size={16} />

        <label>
          <input
            type="checkbox"
            style={{ marginRight: 8 }}
            checked={debug}
            onChange={(event) => setDebug(event.target.checked)}
          />
          Show grid?
        </label>
      </div>
      <Separator />
    </div>
  );
}

/**
 * Return a list of tiles given a layer.
 */
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
