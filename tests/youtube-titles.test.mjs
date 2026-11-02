import test from "node:test";
import assert from "node:assert/strict";
import { parseBrief, createFallback } from "../lib/gamecaptioner.ts";

const cases = [
 {game:"Rainbow Six Siege",description:"I have the clips where i get the double C4 kills with Mira first as I read the rappel on the window as they break the Castle barricade and get 2 kills, then in another round I time the C4 in the map which is Chalet and get another double.",expect:["C4","C4","Rappel"]},
 {game:"Forza Horizon 5",description:"I held a drift through the last corner and passed the leader before the finish.",expect:["overtake","corner","drift"]},
 {game:"Elden Ring",description:"I dodged the boss at one hit point and survived to finish the fight.",expect:["dodge","hit","finish"]},
 {game:"Stardew Valley",description:"I finally finished my greenhouse after working the farm.",expect:["greenhouse","farm","greenhouse"]},
 {game:"The Sims 4",description:"My character tried cooking dinner and burned down the kitchen with a fire.",expect:["kitchen","meal","cooking"]},
 {game:"Civilization VI",description:"I negotiated a trade and avoided a war with another civilization.",expect:["diplomacy","war","trade"]},
 {game:"Valorant",description:"I clutched a 1v3 using sound and teammate callouts.",expect:["1v3","clutch","information"]},
];
test("three YouTube title angles are distinct, grounded and within 100 characters",()=>{
 for(const sample of cases){
  const brief=parseBrief({...sample,platform:"youtube"});
  const titles=createFallback(brief,"youtube").titles;
  assert.equal(titles.length,3);
  assert.equal(new Set(titles).size,3,sample.game);
  for(let i=0;i<3;i++){
    assert.ok(titles[i].length<=100,sample.game+" too long");
    assert.ok(titles[i].endsWith(sample.game==="Rainbow Six Siege"?"R6 Siege":sample.game),titles[i]);
    assert.ok(titles[i].toLowerCase().includes(sample.expect[i].toLowerCase()),sample.game+": "+titles[i]);
    assert.ok(!/^(The detail that changed|What made this moment work)/i.test(titles[i]));
  }
 }
});
test("YouTube headline rewrite varies language rather than only rotating same three titles",()=>{
 const base={game:"Rainbow Six Siege",description:"I read the window rappel and got a double C4, then in another round did the same for two more kills."};
 const first=createFallback(parseBrief({...base,variant:0}),"youtube").titles;
 const next=createFallback(parseBrief({...base,variant:1}),"youtube").titles;
 assert.notDeepEqual(first,next);
 assert.notEqual(first[0],next[0]);
});
test("long custom game names never break the YouTube title limit",()=>{
 const game="Super Ultra International Multiplayer Ultimate Chronicles Custom Game";
 const result=createFallback(parseBrief({game,description:"I completed a level after a surprising win."}),"youtube");
 assert.ok(result.titles.every(t=>t.length<=100));
});
