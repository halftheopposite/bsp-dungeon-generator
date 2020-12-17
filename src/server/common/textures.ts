import * as PIXI from "pixi.js";
import { MonsterType, PropType } from "../../generate/types";

export const textures = {
  // Tiles
  hole: PIXI.Texture.from("assets/tiles/hole.png"),
  edge: PIXI.Texture.from("assets/tiles/edge.png"),
  ground: PIXI.Texture.from("assets/tiles/ground.png"),
  n: PIXI.Texture.from("assets/tiles/n.png"),
  s: PIXI.Texture.from("assets/tiles/s.png"),
  e: PIXI.Texture.from("assets/tiles/e.png"),
  w: PIXI.Texture.from("assets/tiles/w.png"),
  ne: PIXI.Texture.from("assets/tiles/ne.png"),
  nw: PIXI.Texture.from("assets/tiles/nw.png"),
  "w-e": PIXI.Texture.from("assets/tiles/w-e.png"),
  "n-nw-w": PIXI.Texture.from("assets/tiles/n-nw-w.png"),
  "n-ne-e": PIXI.Texture.from("assets/tiles/n-ne-e.png"),
  all: PIXI.Texture.from("assets/tiles/all.png"),
  // Traps
  peak: PIXI.Texture.from("assets/props/peak.png"),
  // Decor
  bone: PIXI.Texture.from("assets/props/bone.png"),
  "crate-silver": PIXI.Texture.from("assets/props/crate-silver.png"),
  "crate-wood": PIXI.Texture.from("assets/props/crate-wood.png"),
  flag: PIXI.Texture.from("assets/props/flag.png"),
  "handcuff-1": PIXI.Texture.from("assets/props/handcuff-1.png"),
  "handcuff-2": PIXI.Texture.from("assets/props/handcuff-2.png"),
  lamp: PIXI.Texture.from("assets/props/lamp.png"),
  skull: PIXI.Texture.from("assets/props/skull.png"),
  "stones-large": PIXI.Texture.from("assets/props/stones-large.png"),
  "stones-small": PIXI.Texture.from("assets/props/stones-small.png"),
  torch: PIXI.Texture.from("assets/props/torch.png"),
  "web-left": PIXI.Texture.from("assets/props/web-left.png"),
  "web-right": PIXI.Texture.from("assets/props/web-right.png"),
  // Items
  "health-large": PIXI.Texture.from("assets/props/health-large.png"),
  "health-small": PIXI.Texture.from("assets/props/health-small.png"),
  "key-gold": PIXI.Texture.from("assets/props/key-gold.png"),
  "key-silver": PIXI.Texture.from("assets/props/key-silver.png"),
  "mana-large": PIXI.Texture.from("assets/props/mana-large.png"),
  "mana-small": PIXI.Texture.from("assets/props/mana-small.png"),
  // Spawns
  ladder: PIXI.Texture.from("assets/props/ladder.png"),
  // Monsters
  bandit: PIXI.Texture.from("assets/monsters/bandit.png"),
  mushroom: PIXI.Texture.from("assets/monsters/mushroom.png"),
  skeleton: PIXI.Texture.from("assets/monsters/skeleton.png"),
  troll: PIXI.Texture.from("assets/monsters/troll.png"),
};

export const tilesSprites = {
  "-2": textures["hole"],
  "-1": textures["edge"],
  0: textures["ground"],
  1: textures["s"],
  2: textures["s"],
  3: textures["s"],
  4: textures["s"],
  5: textures["s"],
  7: textures["s"],
  6: textures["s"],
  8: textures["s"],
  10: textures["s"],
  11: textures["s"],
  12: textures["s"],
  13: textures["w-e"],
  14: textures["w-e"],
  15: textures["w-e"],
  17: textures["w-e"],
  18: textures["w-e"],
  20: textures["w-e"],
  26: textures["n-ne-e"],
  27: textures["n-ne-e"],
  29: textures["n-ne-e"],
  28: textures["e"],
  33: textures["e"],
  34: textures["n-nw-w"],
  35: textures["n-nw-w"],
  36: textures["w"],
  37: textures["n-nw-w"],
  41: textures["w"],
  42: textures["n"],
  44: textures["ne"],
  45: textures["nw"],
  46: textures["all"],
};

export const propsSprites = {
  // Traps
  [`${PropType.Peak}`]: textures["peak"],
  // Decor
  [`${PropType.Bone}`]: textures["bone"],
  [`${PropType.Flag}`]: textures["flag"],
  [`${PropType.CrateSilver}`]: textures["crate-silver"],
  [`${PropType.CrateWood}`]: textures["crate-wood"],
  [`${PropType.Handcuff1}`]: textures["handcuff-1"],
  [`${PropType.Handcuff2}`]: textures["handcuff-2"],
  [`${PropType.Lamp}`]: textures["lamp"],
  [`${PropType.Skull}`]: textures["skull"],
  [`${PropType.StonesLarge}`]: textures["stones-large"],
  [`${PropType.StonesSmall}`]: textures["stones-small"],
  [`${PropType.Torch}`]: textures["torch"],
  [`${PropType.WebLeft}`]: textures["web-left"],
  [`${PropType.WebRight}`]: textures["web-right"],
  // Items
  [`${PropType.HealthLarge}`]: textures["health-large"],
  [`${PropType.HealthSmall}`]: textures["health-small"],
  [`${PropType.KeyGold}`]: textures["key-gold"],
  [`${PropType.KeySilver}`]: textures["key-silver"],
  [`${PropType.ManaLarge}`]: textures["mana-large"],
  [`${PropType.ManaSmall}`]: textures["mana-small"],
  // Spawns
  [`${PropType.Ladder}`]: textures["ladder"],
};

export const monstersSprites = {
  [`${MonsterType.Bandit}`]: textures["bandit"],
  [`${MonsterType.Mushroom}`]: textures["mushroom"],
  [`${MonsterType.Skeleton}`]: textures["skeleton"],
  [`${MonsterType.Troll}`]: textures["troll"],
};
