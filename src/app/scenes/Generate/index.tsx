import * as React from "react";
import { generate, DungeonArgs } from "../../../generate/dungeon";
import { SectionTitle, Spacer } from "../../components";
import { Data } from "../../utils";
import { BACKGROUND_LIGHT, BORDER_COLOR, SIDEBAR_WIDTH } from "../../constants";

import { DungeonDrawer } from "./DungeonDrawer";

export type GenerateArgs = Omit<DungeonArgs, "rooms"> & {
  tileWidth: number;
  debug: boolean;
};

export function Generate(props: {}): React.ReactElement {
  const canvasRef = React.useRef<HTMLDivElement>();
  const canvasDrawer = React.useRef<DungeonDrawer>();

  const onGenerate = (args: GenerateArgs) => {
    const dungeon = generate({
      ...args,
      rooms: Data.loadRooms(),
    });

    canvasDrawer.current.draw(dungeon, {
      debug: args.debug,
      unitWidthInPixels: args.tileWidth,
    });
  };

  React.useEffect(() => {
    canvasDrawer.current = new DungeonDrawer(canvasRef.current);
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
      <Sidebar onGenerate={onGenerate} />
      <div
        ref={canvasRef}
        style={{
          position: "absolute",
          left: SIDEBAR_WIDTH,
          bottom: 0,
          top: 0,
          right: 0,
        }}
      />
    </div>
  );
}

export function Sidebar(props: {
  onGenerate: (args: GenerateArgs) => void;
}): React.ReactElement {
  const { onGenerate } = props;
  const [mapWidth, setMapWidth] = React.useState(48);
  const [mapHeight, setMapHeight] = React.useState(48);
  const [mapGutterWidth, setMapGutterWidth] = React.useState(1);
  const [iterations, setIterations] = React.useState(4);
  const [containerSizeRatio, setContainerSizeRatio] = React.useState(0.45);
  const [roomProbability, setRoomProbability] = React.useState(0.9);
  const [corridorWidth, setCorridorWidth] = React.useState(2);
  const [corridorTrapProbability, setCorridorTrapProbability] = React.useState(
    0.9
  );
  const [tileWidth, setTileWidth] = React.useState(16);
  const [debug, setDebug] = React.useState(false);

  const onGenerateClick = () => {
    onGenerate({
      mapWidth,
      mapHeight,
      mapGutterWidth,
      iterations,
      containerSizeRatio,
      roomProbability,
      corridorWidth,
      corridorTrapProbability,
      tileWidth,
      debug,
    });
  };

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
      }}
    >
      <div style={{ padding: 16 }}>
        <SectionTitle>Params</SectionTitle>
        <Spacer size={16} />

        {/* Width */}
        <p>Map width:</p>
        <input
          style={{ width: "100%" }}
          type="number"
          step={1}
          value={mapWidth}
          onChange={(event) => setMapWidth(Number.parseInt(event.target.value))}
        />
        <Spacer size={16} />

        {/* Height */}
        <p>Map height:</p>
        <input
          style={{ width: "100%" }}
          type="number"
          step={1}
          value={mapHeight}
          onChange={(event) =>
            setMapHeight(Number.parseInt(event.target.value))
          }
        />
        <Spacer size={16} />

        {/* Gutter */}
        <p>Map gutter width:</p>
        <input
          style={{ width: "100%" }}
          type="number"
          min={0}
          step={1}
          value={mapGutterWidth}
          onChange={(event) =>
            setMapGutterWidth(Number.parseInt(event.target.value))
          }
        />
        <Spacer size={16} />

        {/* Iterations */}
        <p>Iterations:</p>
        <input
          style={{ width: "100%" }}
          type="number"
          min={1}
          step={1}
          value={iterations}
          onChange={(event) =>
            setIterations(Number.parseInt(event.target.value))
          }
        />
        <Spacer size={16} />

        {/* Container size ratio */}
        <p>Container size ratio:</p>
        <input
          style={{ width: "100%" }}
          type="number"
          min={0}
          max={1}
          step={0.05}
          value={containerSizeRatio}
          onChange={(event) =>
            setContainerSizeRatio(Number.parseFloat(event.target.value))
          }
        />
        <Spacer size={16} />

        {/* Room spawn */}
        <p>Room spawn:</p>
        <input
          style={{ width: "100%" }}
          type="number"
          min={0}
          max={1}
          step={0.05}
          value={roomProbability}
          onChange={(event) =>
            setRoomProbability(Number.parseFloat(event.target.value))
          }
        />
        <Spacer size={16} />

        {/* Corridor width */}
        <p>Corridor width:</p>
        <input
          style={{ width: "100%" }}
          type="number"
          min={1}
          step={1}
          value={corridorWidth}
          onChange={(event) =>
            setCorridorWidth(Number.parseInt(event.target.value))
          }
        />
        <Spacer size={16} />

        {/* Corridor trap probability */}
        <p>Corridor trap probability:</p>
        <input
          style={{ width: "100%" }}
          type="number"
          min={0}
          max={1}
          step={0.1}
          value={corridorTrapProbability}
          onChange={(event) =>
            setCorridorTrapProbability(Number.parseFloat(event.target.value))
          }
        />
        <Spacer size={16} />

        {/* Corridor trap probability */}
        <p>Tile width:</p>
        <input
          style={{ width: "100%" }}
          type="number"
          min={8}
          step={1}
          value={tileWidth}
          onChange={(event) =>
            setTileWidth(Number.parseFloat(event.target.value))
          }
        />
        <Spacer size={16} />

        {/* Debug */}
        <label>
          <input
            type="checkbox"
            style={{ marginRight: 8 }}
            checked={debug}
            onChange={(event) => setDebug(event.target.checked)}
          />
          Debug
        </label>
        <Spacer size={16} />

        {/* Button */}
        <button
          style={{ width: "100%" }}
          type="button"
          onClick={onGenerateClick}
        >
          Generate
        </button>
      </div>
    </div>
  );
}
