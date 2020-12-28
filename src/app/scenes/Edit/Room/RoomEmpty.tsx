import * as React from "react";
import { SIDEBAR_WIDTH } from "../../../constants";

/**
 * A placeholder when no room is selected.
 */
export function RoomEmpty(): React.ReactElement {
  return (
    <div
      style={{
        position: "absolute",
        left: SIDEBAR_WIDTH,
        bottom: 0,
        top: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      Select an existing room or create a new one.
    </div>
  );
}
