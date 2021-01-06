import * as React from "react";
import { RoomTemplate } from "../../../generate/types";
import { BORDER_COLOR } from "../../constants";
import { useRooms, RoomsFilters, RoomsFilter } from "./hooks/rooms";

import { Spacer, SectionTitle } from "../../components";

/**
 * A list of all rooms.
 */
export function RoomsList(props: {}): React.ReactElement {
  const { rooms, selectedRoomId, addRoom, selectRoom, removeRoom } = useRooms();

  return (
    <div>
      <RoomsListHeader />
      <Spacer />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {rooms.map((room, index) => (
          <RoomListItem
            key={room.id}
            index={index}
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

function RoomsListHeader(props: {}): React.ReactElement {
  const { roomsFilter, filterRooms, addRoom } = useRooms();

  return (
    <div
      style={{
        padding: 16,
      }}
    >
      <SectionTitle>Rooms</SectionTitle>
      <Spacer size={16} />

      <p>Filter rooms:</p>
      <select
        style={{ width: "100%" }}
        value={roomsFilter}
        onChange={(event) => filterRooms(event.target.value as RoomsFilter)}
      >
        {RoomsFilters.map((filter) => (
          <option key={filter} value={filter}>
            {filter}
          </option>
        ))}
      </select>
      <Spacer size={16} />

      {/* Add room button */}
      <input
        style={{ width: "100%" }}
        type="button"
        value="+ Add room"
        onClick={addRoom}
      />
    </div>
  );
}

function RoomListItem(props: {
  index: number;
  room: RoomTemplate;
  selected: boolean;
  onClick: (roomId: string) => void;
  onDelete: (roomId: string) => void;
}): React.ReactElement {
  const { index, room, selected, onClick, onDelete } = props;
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
        position: "relative",
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        borderTop: index === 0 ? `1px solid ${BORDER_COLOR}` : null,
        borderBottom: `1px solid ${BORDER_COLOR}`,
        backgroundColor:
          hovered || selected ? `rgba(0,0,0,0.2)` : "transparent",
        width: "100%",
      }}
      title={room.id}
      onClick={() => onClick(room.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p style={{ fontSize: 12 }}>{room.id}</p>
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
