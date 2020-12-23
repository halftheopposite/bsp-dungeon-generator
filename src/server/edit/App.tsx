import * as React from "react";
import { CollectionsProvider } from "./hooks/rooms";

import { Room } from "./Room";
import { Sidebar } from "./Sidebar";

export function App(props: {}): React.ReactElement {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <CollectionsProvider>
        <Sidebar />
        <Room />
      </CollectionsProvider>
    </div>
  );
}
