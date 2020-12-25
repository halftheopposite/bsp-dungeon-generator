# dungeon

A configurable dungeon generator using Binary-Space Partitioning and hand-made rooms.

## Running

If you want to get the development mode running to generate dungeons or edit rooms:

```
yarn
yarn start
```

This will launch the development server (using `express.js`):

- Edit rooms at http://localhost:3000/edit/
- Generate dungeons at http://localhost:3000/generate/

## Edit

When using the **edit** mode you can create, edit, or remove the rooms that are used for generating dungeons. The current editing session is saved to the local storage which makes it possible to continue editing later on.

- You can **load** a `rooms.json` file to start with.
- You can **save** the current editing session to a `rooms.json` file inside the `/src/generate/` folder to use it when generating dungeons.

## Want to use the dungeon generation algorithm in you project?

You can copy the content of the `/src/generate/` folder into your project and call it like so:

```typescript
import { generate } from "./dungeon";

const dungeon = generate({
  mapWidth: 96, // Width of the dungeon in tiles
  mapHeight: 56, // Height of the dungeon in tiles
  mapGutterWidth: 1, // Gutter width of the dungeon
  iterations: 5, // Number of subdivision of the BSP tree
  containerSizeRatio: 0.45, // Minimum ratio of a container (under which it's retried)
  roomSpawnChance: 0.9, // Probability of a room being spawned
  corridorWidth: 2, // Width of the corridors joining containers
  corridorTrapChance: 0.5, // Probability of a trap spawning into a corridor
});
```
