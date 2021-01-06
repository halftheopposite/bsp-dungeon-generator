import * as React from "react";
import { generate, DungeonArgs } from "../../../generate/dungeon";
import { SectionTitle, Separator, Spacer } from "../../components";
import { Data, Download } from "../../utils";
import { BACKGROUND_LIGHT, BORDER_COLOR, SIDEBAR_WIDTH } from "../../constants";
import { nanoid } from "nanoid";

import { DungeonDrawer } from "./DungeonDrawer";

export type GenerateArgs = Omit<DungeonArgs, "rooms"> & {
  tileWidth: number;
  debug: boolean;
};

export function Generate(props: {}): React.ReactElement {
  const canvasRef = React.useRef<HTMLDivElement>();
  const canvasDrawer = React.useRef<DungeonDrawer>();
  const [canvasWidth, setCanvasWidth] = React.useState(100);
  const [canvasHeight, setCanvasHeight] = React.useState(100);
  const [dungeon, setDungeon] = React.useState(null);
  const [error, setError] = React.useState(null);

  const onGenerate = (args: GenerateArgs) => {
    try {
      setError(null);

      const dungeon = generate({
        ...args,
        rooms: Data.loadRooms(),
      });

      setDungeon(dungeon);
      canvasDrawer.current.draw(dungeon, {
        debug: args.debug,
        unitWidthInPixels: args.tileWidth,
      });

      setCanvasWidth(args.mapWidth * args.tileWidth);
      setCanvasHeight(args.mapHeight * args.tileWidth);
    } catch (error) {
      setError(error.message);
      console.error(error.message);
      canvasDrawer.current.clear();
    }
  };

  const onDownload = () => {
    if (!dungeon) {
      return;
    }

    Download.downloadJSON(dungeon, "dungeon.json");
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
      <Sidebar onGenerate={onGenerate} onDownload={onDownload} />

      {/* Drawer */}
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
          overflow: "scroll",
        }}
      >
        {/* Canvas */}
        <div
          ref={canvasRef}
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            top: 0,
            right: 0,
            overflow: "scroll",
            width: canvasWidth,
            height: canvasHeight,
          }}
        />

        {error ? (
          <p style={{ zIndex: 1000, margin: 16, textAlign: "center" }}>
            Error rendering dungeon: {error}.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Sidebar(props: {
  onGenerate: (args: GenerateArgs) => void;
  onDownload: () => void;
}): React.ReactElement {
  const { onGenerate, onDownload } = props;
  const [mapWidth, setMapWidth] = React.useState(64);
  const [mapHeight, setMapHeight] = React.useState(48);
  const [mapGutterWidth, setMapGutterWidth] = React.useState(1);
  const [iterations, setIterations] = React.useState(4);
  const [containerMinimumSize, setContainerMinimumSize] = React.useState(4);
  const [containerMinimumRatio, setContainerSizeRatio] = React.useState(0.45);
  const [containerSplitRetries, setContainerSplitRetries] = React.useState(30);
  const [roomProbability, setRoomProbability] = React.useState(1);
  const [corridorWidth, setCorridorWidth] = React.useState(2);
  const [tileWidth, setTileWidth] = React.useState(16);
  const [manualSeed, setManualSeed] = React.useState(false);
  const [seed, setSeed] = React.useState(nanoid());
  const [debug, setDebug] = React.useState(true);

  const onGenerateClick = () => {
    const newSeed = manualSeed ? seed : nanoid();

    onGenerate({
      mapWidth,
      mapHeight,
      mapGutterWidth,
      iterations,
      containerMinimumSize,
      containerMinimumRatio,
      containerSplitRetries,
      roomProbability,
      corridorWidth,
      tileWidth,
      seed: newSeed,
      debug,
    });

    setSeed(newSeed);
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
        overflowY: "scroll",
      }}
    >
      {/* Params */}
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

        {/* Container split retries */}
        <p>Container split retries:</p>
        <input
          style={{ width: "100%" }}
          type="number"
          min={1}
          max={100}
          step={1}
          value={containerSplitRetries}
          onChange={(event) =>
            setContainerSplitRetries(Number.parseInt(event.target.value))
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
          value={containerMinimumRatio}
          onChange={(event) =>
            setContainerSizeRatio(Number.parseFloat(event.target.value))
          }
        />
        <Spacer size={16} />

        {/* Container minimum size */}
        <p>Container minimum size:</p>
        <input
          style={{ width: "100%" }}
          type="number"
          min={4}
          max={mapWidth}
          step={1}
          value={containerMinimumSize}
          onChange={(event) =>
            setContainerMinimumSize(Number.parseInt(event.target.value))
          }
        />
        <Spacer size={16} />

        {/* Room probability */}
        <p>Room probability:</p>
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

        {/* Tile width */}
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

        {/* Seed */}
        <Spacer size={8} />
        <label>
          <input
            type="checkbox"
            style={{ marginRight: 8 }}
            checked={manualSeed}
            onChange={(event) => setManualSeed(event.target.checked)}
          />
          Manual seed?
        </label>
        <Spacer size={8} />
        <input
          style={{ width: "100%" }}
          type="text"
          disabled={!manualSeed}
          value={seed}
          onChange={(event) => setSeed(event.target.value)}
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
      <Separator />

      {/* Result */}
      <div style={{ padding: 16 }}>
        <SectionTitle>Result</SectionTitle>
        <Spacer size={16} />

        <button style={{ width: "100%" }} onClick={onDownload}>
          Download dungeon JSON
        </button>
      </div>
      <Separator />
    </div>
  );
}
