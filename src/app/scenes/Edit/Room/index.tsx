import * as React from "react";
import { RoomType, TileLayer } from "../../../../generate/types";
import { resizeTileMap } from "../../../../generate/utils";
import { SIDEBAR_WIDTH } from "../../../constants";
import { useRooms } from "../hooks/rooms";
import { RoomContent } from "./RoomContent";
import { RoomEmpty } from "./RoomEmpty";
import { RoomSidebar } from "./RoomSidebar";

/**
 * The currently selected room.
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
