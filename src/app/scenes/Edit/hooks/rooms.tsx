import React from "react";
import { RoomTemplate, RoomType, TileLayer } from "../../../../generate/types";
import { createTilemap } from "../../../../generate/utils";

export interface RoomsValue {
  rooms: RoomTemplate[];
  selectedRoomId: string;
  selectedLayer: TileLayer;
  selectedTile: string;
  addRoom: () => void;
  updateRoom: (updated: RoomTemplate, oldRoomId: string) => void;
  removeRoom: (roomId: string) => void;
  selectRoom: (roomId: string) => void;
  selectLayer: (layer: TileLayer) => void;
  selectTile: (tileName: string) => void;
  filterRooms: (type: RoomType | "all") => void;
  saveRooms: () => void;
  loadRooms: (rooms: RoomTemplate[]) => void;
}

export const RoomsContext = React.createContext<RoomsValue>({
  rooms: [],
  selectedRoomId: null,
  selectedLayer: "tiles",
  selectedTile: "",
  addRoom: () => {},
  updateRoom: () => {},
  removeRoom: () => {},
  selectRoom: () => {},
  selectLayer: () => {},
  selectTile: () => {},
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
  const [selectedLayer, setSelectedLayer] = React.useState<TileLayer>("tiles");
  const [selectedTile, setSelectedTile] = React.useState<string>("");
  const [filter, setFilter] = React.useState<RoomType | "all">("all");

  /** Add a room */
  const addRoom = () => {
    const id = String(Date.now());
    setRooms((prev) => {
      const updatedRooms = [...prev];
      updatedRooms.push({
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

      localStorage.setItem("rooms", JSON.stringify(updatedRooms));

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

      localStorage.setItem("rooms", JSON.stringify(updatedRooms));

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

      localStorage.setItem("rooms", JSON.stringify(updatedRooms));

      return updatedRooms;
    });
  };

  /** Select a room */
  const selectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
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
  const loadRooms = (loadedRooms: RoomTemplate[]) => {
    setRooms(loadedRooms);
    setSelectedRoomId(null);
    setFilter("all");
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
    const saved = localStorage.getItem("rooms");
    let parsed;
    try {
      parsed = JSON.parse(saved) || [];
    } catch (error) {
      console.warn("Error loading rooms from local storage.");
      parsed = [];
    }

    loadRooms(parsed);
  }, []);

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
      selectedLayer,
      selectedTile,
      addRoom,
      updateRoom,
      removeRoom,
      selectRoom,
      selectLayer,
      selectTile,
      filterRooms,
      saveRooms,
      loadRooms,
    };
  }, [rooms, selectedRoomId, selectedLayer, selectedTile, filter]);

  return (
    <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
  );
}

export function useRooms(): RoomsValue {
  return React.useContext(RoomsContext);
}
