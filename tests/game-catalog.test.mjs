import test from "node:test";
import assert from "node:assert/strict";
import { GAME_GROUPS, GAME_CATALOG, FEATURED_GAMES, findGames, normalizeGameSearch } from "../lib/game-catalog.ts";
import { parseBrief } from "../lib/gamecaptioner.ts";

test("catalog has broad, unique coverage across gaming genres", () => {
  assert.equal(GAME_CATALOG.length,223);
  assert.equal(GAME_GROUPS.length,7);
  assert.equal(new Set(GAME_CATALOG.map(g=>g.title.toLowerCase())).size,GAME_CATALOG.length);
  for (const title of ["Fortnite","Counter-Strike 2","Rainbow Six Siege","Elden Ring","EA Sports FC 27","Minecraft","Stardew Valley","Final Fantasy XIV Online","Dead by Daylight","League of Legends","Pokémon GO","Hollow Knight: Silksong"]) {
    assert.ok(GAME_CATALOG.some(game=>game.title===title), title);
  }
  for (const title of FEATURED_GAMES) assert.ok(GAME_CATALOG.some(game=>game.title===title));
});
test("search is case-insensitive, ranked, accent-insensitive and accepts common aliases", () => {
  assert.equal(findGames("r6")[0]?.title,"Rainbow Six Siege");
  assert.equal(findGames("cs2")[0]?.title,"Counter-Strike 2");
  assert.equal(findGames("GTA 5")[0]?.title,"Grand Theft Auto V");
  assert.equal(findGames("  osrs ")[0]?.title,"Old School RuneScape");
  assert.equal(findGames("Pokemon unite")[0]?.title,"Pokémon UNITE");
  assert.equal(findGames("stardew")[0]?.title,"Stardew Valley");
  assert.ok(findGames("hollow knight").length>=2);
  assert.equal(normalizeGameSearch("Pokémon: GO"),"pokemon go");
  assert.equal(findGames("").length,12);
  assert.equal(findGames("___").length,0);
  assert.equal(findGames("call of duty",4).length,4);
});
test("unknown and indie titles remain valid in the content generation payload", () => {
  const custom = "My Unreleased Indie Game";
  assert.equal(findGames(custom).length,0);
  const brief = parseBrief({game:custom,description:"I made a quick dodge and completed the level with one health point."});
  assert.equal(brief.game,custom);
});
