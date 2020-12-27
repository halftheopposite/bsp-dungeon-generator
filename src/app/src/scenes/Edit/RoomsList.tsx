import * as React from "react";
import { RoomTemplate } from "../../../../generate/types";
import { BORDER_COLOR } from "../../constants";
import { useRooms } from "./hooks/rooms";

import { Spacer, Separator } from "../../components";

/**
 * A list of all rooms.
 */
export function RoomsList(props: {}): React.ReactElement {
  const { rooms, selectedRoomId, addRoom, selectRoom, removeRoom } = useRooms();

  return (
    <div
      style={{
        padding: 8,
        overflow: "hidden",
        overflowY: "scroll",
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
