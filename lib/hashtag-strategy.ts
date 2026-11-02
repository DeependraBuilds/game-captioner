import type {Brief,Platform} from "./gamecaptioner.ts";

const gameAliases:Record<string,string[]>={
  "rainbow six siege":["#RainbowSixSiege","#R6Siege"],
  "tom clancy's rainbow six siege":["#RainbowSixSiege","#R6Siege"],
  "forza horizon 5":["#ForzaHorizon5"],
  "elden ring":["#EldenRing"],
  "stardew valley":["#StardewValley"],
  "the sims 4":["#TheSims4"],
  "valorant":["#VALORANT"],
  "counter-strike 2":["#CS2"],
  "rocket league":["#RocketLeague"],
  "minecraft":["#Minecraft"],
  "hades":["#HadesGame"],
  "civilization vi":["#CivilizationVI"],
};
function gameTag(name:string):string {
  return "#"+name.normalize("NFKD").replace(/[^A-Za-z0-9]/g,"").slice(0,40);
}
function topicTags(b:Brief):string[] {
  const notes=(b.description+" "+b.notable).toLowerCase();
  const tags:string[]=[];
  const add=(test:RegExp,tag:string)=>{if(test.test(notes))tags.push(tag);};
  add(/\b(?:c4|nitro cell)\b.*\b(?:double|kills?|two|2)\b|\b(?:double|kills?|two|2)\b.*\b(?:c4|nitro cell)\b/,"#C4Kills");
  add(/\b(?:c4|nitro cell)\b/,"#NitroCell");
  add(/\b(?:clutch|comeback|1v[2-9])\b/,"#GamingClutch");
  add(/\b(?:drift|drifting)\b/,"#Drifting");
  add(/\b(?:racing|race|overtak|last corner)\b/,"#RacingGames");
  add(/\b(?:boss|bossfight)\b/,"#BossFight");
  add(/\b(?:greenhouse|harvest|farm|crops)\b/,"#FarmingSim");
  add(/\b(?:build|base|construction)\b/,"#GamingBuild");
  add(/\b(?:trade|diplomacy|negotiat)\b/,"#StrategyGaming");
  add(/\b(?:tutorial|tips|guide|how to)\b/,"#GamingTips");
  if(!tags.length && b.contentType==="tutorial")tags.push("#GamingTips");
  return tags;
}
export function relevantHashtags(b:Brief,p:Platform):string[] {
  const names=gameAliases[b.game.trim().toLowerCase()]||[gameTag(b.game)];
  const topics=topicTags(b);
  const end=p==="youtube"?"#Shorts":p==="instagram"||p==="facebook"?"#GamingReels":p==="tiktok"?"#GamingClips":null;
  // For YouTube, favor one game alias + verified moment over broad #Gaming/#Gameplay.
  // For X two compact tags preserve room for a complete caption.
  const max=p==="twitter"?2:4;
  const reserve=end?1:0;
  const output=[...new Set([...names,...topics])].filter(tag=>/^#[A-Za-z0-9_]+$/.test(tag));
  const core=output.slice(0,max-reserve);
  if(end)core.push(end);
  if(!core.length)core.push("#Gaming");
  return core.slice(0,max);
}
