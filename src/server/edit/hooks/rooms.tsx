import React from "react";
import { RoomTemplate, RoomType } from "../../../generate/types";
import { createTilemap } from "../../../generate/utils";

export interface RoomsValue {
  rooms: RoomTemplate[];
  selectedRoomId: string;
  addRoom: () => void;
  updateRoom: (updated: RoomTemplate, oldRoomId: string) => void;
  removeRoom: (roomId: string) => void;
  selectRoom: (roomId: string) => void;
  filterRooms: (type: RoomType | "all") => void;
  saveRooms: () => void;
  loadRooms: () => void;
}

export const RoomsContext = React.createContext<RoomsValue>({
  rooms: [],
  selectedRoomId: null,
  addRoom: () => {},
  updateRoom: () => {},
  removeRoom: () => {},
  selectRoom: () => {},
  filterRooms: () => {},
  saveRooms: () => {},
  loadRooms: () => {},
});

export function CollectionsProvider(props: {
  children: React.ReactNode;
}): React.ReactElement {
  const { children } = props;
  const [rooms, setRooms] = React.useState<RoomTemplate[]>([]);
  const [selectedRoomId, setSelectedRoomId] = React.useState<string>(null);
  const [filter, setFilter] = React.useState<RoomType | "all">("all");

  /** Add a room */
  const addRoom = () => {
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

  /** Update a room */
  const updateRoom = (updated: RoomTemplate, oldRoomId: string) => {
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

  /** Remove a room */
  const removeRoom = (roomId: string) => {
    setRooms((prev) => {
      const result = [...prev];

      const index = prev.findIndex((item) => item.id === roomId);
      if (index !== -1) {
        result.splice(index, 1);
      }
      return result;
    });
  };

  /** Select a room */
  const selectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  /** Filter rooms on their type */
  const filterRooms = (type: RoomType | "all") => {
    setFilter(type);
  };

  /** Save and download a JSON representation of the rooms */
  const saveRooms = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(rooms, null, 2)], {
      type: "text/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = "rooms.json";
    const added = document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    added.remove();
  };

  /** Load and populate using a JSON representation of the rooms  */
  const loadRooms = () => {};

  // Filter and sort rooms
  const filtered = React.useMemo(() => {
    const sorted = rooms.sort((a, b) => a.id.localeCompare(b.id));
    const filtered = sorted.filter(
      (item) => filter === "all" || item.type === filter
    );

    return filtered;
  }, [rooms]);

  const value: RoomsValue = React.useMemo(() => {
    return {
      rooms: filtered,
      selectedRoomId,
      addRoom,
      updateRoom,
      removeRoom,
      selectRoom,
      filterRooms,
      saveRooms,
      loadRooms,
    };
  }, [rooms, selectedRoomId, filter]);

  return (
    <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
  );
}

export function useRooms(): RoomsValue {
  return React.useContext(RoomsContext);
}
