import * as React from "react";
import { RouteComponentProps } from "@reach/router";
import { generate } from "../../../../generate/dungeon";

import { DungeonDrawer } from "./DungeonDrawer";

export function Generate(props: RouteComponentProps): React.ReactElement {
  const canvasRef = React.useRef<HTMLDivElement>();
  const canvasDrawer = React.useRef<DungeonDrawer>();

  React.useEffect(() => {
    canvasDrawer.current = new DungeonDrawer(canvasRef.current);
    const dungeon = generate({
      mapWidth: 96,
      mapHeight: 56,
      mapGutterWidth: 1,
      iterations: 5,
      containerSizeRatio: 0.45,
      roomSpawnChance: 0.9,
      corridorWidth: 2,
      corridorTrapChance: 0.5,
    });

    canvasDrawer.current.draw(dungeon, {
      debug: true,
      unitWidthInPixels: 16,
    });
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        top: 0,
        right: 0,
      }}
    >
      <div
        ref={canvasRef}
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          top: 0,
          right: 0,
        }}
      />
    </div>
  );
}
