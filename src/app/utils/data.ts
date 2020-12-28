import { RoomTemplate } from "../../generate/types";
import RoomsJSON from "./default.json";

const ROOMS_DEFAULT: RoomTemplate[] = RoomsJSON as RoomTemplate[];

/**
 * Save a list of rooms to the local storage.
 */
export function saveRooms(rooms: RoomTemplate[]) {
  localStorage.setItem("rooms", JSON.stringify(rooms));
}

/**
 * Load a list of rooms from the local storage or default to a pre-made list.
 */
export function loadRooms(): RoomTemplate[] {
  let parsed: RoomTemplate[] = [];

  try {
    const saved = localStorage.getItem("rooms");

    // Firs time the page is loaded we return a default list
    if (!saved) {
      return ROOMS_DEFAULT;
    }

    parsed = JSON.parse(saved);
  } catch (error) {
    console.warn("Error loading rooms from local storage.");
  }

  return parsed;
}
