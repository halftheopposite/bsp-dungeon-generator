import * as React from "react";
import { BACKGROUND_LIGHT, BORDER_COLOR, SIDEBAR_WIDTH } from "../../constants";
import { useRooms } from "./hooks/rooms";

import { SectionTitle, Separator, Spacer } from "../../components";
import { RoomsList } from "./RoomsList";

export function Sidebar(props: {}): React.ReactElement {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        top: 0,
        width: SIDEBAR_WIDTH,
        cursor: "pointer",
        borderRight: `2px solid ${BORDER_COLOR}`,
        backgroundColor: BACKGROUND_LIGHT,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        overflowY: "scroll",
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
      <div style={{ display: "flex", flexDirection: "column", margin: 16 }}>
        <SectionTitle>Data</SectionTitle>
        <Spacer size={16} />

        {/* Load */}
        <p>Load:</p>
        <input type="file" accept="application/json" onChange={onFileChange} />
        <Spacer size={16} />

        {/* Save */}
        <p>Save:</p>
        <input type="button" value="Save file" onClick={saveRooms} />
      </div>
    </div>
  );
}
