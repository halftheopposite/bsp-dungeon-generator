import React from "react";
import {
  RoomTemplate,
  RoomType,
  RoomTypes,
  TileLayer,
} from "../../../../generate/types";
import { createTilemap } from "../../../../generate/utils";
import { Data } from "../../../utils";

export type RoomsFilter = RoomType | "all";
export const RoomsFilters = [...RoomTypes, "all"];

export interface RoomsValue {
  rooms: RoomTemplate[];
  roomsFilter: RoomsFilter;
  selectedRoomId: string;
  selectedLayer: TileLayer;
  selectedTile: string;
  debug: boolean;
  addRoom: () => void;
  updateRoom: (updated: RoomTemplate, oldRoomId: string) => void;
  removeRoom: (roomId: string) => void;
  selectRoom: (roomId: string) => void;
  selectLayer: (layer: TileLayer) => void;
  selectTile: (tileName: string) => void;
  filterRooms: (type: RoomType | "all") => void;
  saveRooms: () => void;
  loadRooms: (rooms: RoomTemplate[]) => void;
  setDebug: (debug: boolean) => void;
}

export const RoomsContext = React.createContext<RoomsValue>({
  rooms: [],
  roomsFilter: "all",
  selectedRoomId: null,
  selectedLayer: "tiles",
  selectedTile: "",
  debug: false,
  addRoom: () => {},
  updateRoom: () => {},
  removeRoom: () => {},
  selectRoom: () => {},
  selectLayer: () => {},
  selectTile: () => {},
  filterRooms: () => {},
  saveRooms: () => {},
  loadRooms: () => {},
  setDebug: () => {},
});

export function CollectionsProvider(props: {
  children: React.ReactNode;
}): React.ReactElement {
  const { children } = props;
  const [rooms, setRooms] = React.useState<RoomTemplate[]>([]);
  const [roomsFilter, setRoomsFilter] = React.useState<RoomsFilter>("all");
  const [selectedRoomId, setSelectedRoomId] = React.useState<string>(null);
  const [selectedLayer, setSelectedLayer] = React.useState<TileLayer>("tiles");
  const [selectedTile, setSelectedTile] = React.useState<string>("");
  const [debug, setDebug] = React.useState<boolean>(false);

  /** Add a room */
  const addRoom = () => {
    const id = String(Date.now());
    setRooms((prev) => {
      const updatedRooms = [...prev];
      updatedRooms.push({
        id,
        width: 8,
        height: 8,
        type: roomsFilter === "all" ? "monsters" : roomsFilter,
        layers: {
          tiles: createTilemap(8, 8, 0),
          props: createTilemap(8, 8, 0),
          monsters: createTilemap(8, 8, 0),
        },
      });

      Data.saveRooms(updatedRooms);

      return updatedRooms;
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

      Data.saveRooms(updatedRooms);

      return updatedRooms;
    });
    setSelectedRoomId(updated.id);
  };

  /** Remove a room */
  const removeRoom = (roomId: string) => {
    setRooms((prev) => {
      const updatedRooms = [...prev];

      const index = prev.findIndex((item) => item.id === roomId);
      if (index !== -1) {
        updatedRooms.splice(index, 1);
      }

      Data.saveRooms(updatedRooms);

      return updatedRooms;
    });
  };

  /** Select a room */
  const selectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setSelectedLayer("tiles");
  };

  /** Select a tile layer in the room */
  const selectLayer = (layer: TileLayer) => {
    setSelectedLayer(layer);
  };

  /** Select a tile in the layer */
  const selectTile = (tileName: string) => {
    setSelectedTile(tileName);
  };

  /** Filter rooms on their type */
  const filterRooms = (type: RoomType | "all") => {
    setRoomsFilter(type);
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
  const loadRooms = (loadedRooms: RoomTemplate[]) => {
    setRooms(loadedRooms);
    setSelectedRoomId(null);
    setRoomsFilter("all");
  };

  // When updating the selected layer, update the selected tile accordingly
  React.useEffect(() => {
    switch (selectedLayer) {
      case "tiles":
        setSelectedTile("Wall");
        break;
      case "props":
        setSelectedTile("Peak");
        break;
      case "monsters":
        setSelectedTile("Bandit");
        break;
    }
  }, [selectedLayer]);

  // Load rooms from localstorage when initialized
  React.useEffect(() => {
    loadRooms(Data.loadRooms());
  }, []);

  // Filter and sort rooms
  const filtered = React.useMemo(() => {
    const sorted = rooms.sort((a, b) => a.id.localeCompare(b.id));
    const filtered = sorted.filter(
      (item) => roomsFilter === "all" || item.type === roomsFilter
    );

    return filtered;
  }, [rooms, roomsFilter]);

  const value: RoomsValue = React.useMemo(() => {
    return {
      rooms: filtered,
      roomsFilter,
      selectedRoomId,
      selectedLayer,
      selectedTile,
      debug,
      addRoom,
      updateRoom,
      removeRoom,
      selectRoom,
      selectLayer,
      selectTile,
      filterRooms,
      saveRooms,
      loadRooms,
      setDebug,
    };
  }, [rooms, roomsFilter, selectedRoomId, selectedLayer, selectedTile, debug]);

  return (
    <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
  );
}

export function useRooms(): RoomsValue {
  return React.useContext(RoomsContext);
}
