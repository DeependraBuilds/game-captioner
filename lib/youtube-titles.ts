import type { Brief } from "./gamecaptioner.ts";

type EditorialAngle = { hook: string; setup: string; payoff: string };
const names: Readonly<Record<string,string>> = {
  "Rainbow Six Siege":"R6 Siege",
  "Counter-Strike 2":"CS2",
  "Grand Theft Auto V":"GTA 5",
  "EA Sports FC 26":"FC 26",
  "EA Sports FC 27":"FC 27",
  "Call of Duty: Warzone":"Warzone",
};
function formatTitle(lead: string, game: string): string {
  const name = names[game] || game;
  const suffix = " | " + name;
  const space = Math.max(12, 100 - suffix.length);
  const core = lead.length > space ? lead.slice(0,space).replace(/\s+\S*$/, "").replace(/[|:;,\s]+$/,"") : lead;
  return (core + suffix).slice(0,100);
}
export function youtubeTitles(b: Brief, angle: EditorialAngle): [string,string,string] {
  const src = (b.description + " " + b.notable).toLowerCase();
  const has=(r:RegExp)=>r.test(src);
  const repeat=has(/\b(?:again|another round|twice|second round|two rounds|different rounds|4 kills|four kills)\b/);
  const alt=b.variant%2===1;
  let searchable="", curiosity="", skill="";
  if(has(/\b(?:c4|nitro cell)\b/) && has(/\b(?:double|2 kills|two kills)\b/)) {
    const place=b.description.match(/\bmap (?:which is|called|named)\s+([A-Z][A-Za-z0-9-]+)/)?.[1];
    const map=place ? " on "+place : "";
    const rappels=has(/\b(?:rappel|rappelling)\b/);
    if(repeat) {
      searchable=alt ? "Two DOUBLE C4s. Four Kills"+map : "How I Timed 4 C4 Kills Across Two Rounds"+map;
      curiosity=alt ? "4 C4 Kills from Two Separate Reads" : "Two C4 Doubles. Different Rounds. Same Read";
      skill=rappels ? (alt ? "Reading the Rappel Before the Double C4" : "The Rappel Read Behind Four C4 Kills")
        : "Why the C4 Timing Made All the Difference";
    } else {
      searchable=alt ? "The Timing Behind This Double C4" : "How I Timed a Double C4"+map;
      curiosity=alt ? "Two Kills from One C4. Here Is the Setup" : "A Double C4 That Started with the Read";
      skill=rappels ? "Reading the Rappel Before the Double C4" : "The Setup That Made This C4 Double Work";
    }
  } else if(has(/\b(?:drift|overtak|last corner|finish line|passed the leader)\b/)) {
    const overtake=has(/\b(?:overtak|pass(?:ed|ing)? the leader|passed the leader)\b/);
    const drift=has(/\bdrift\b/);
    searchable=overtake ? "How I Took the Lead in the Final Corner" : "The Final Corner Made the Race";
    curiosity=alt ? "Everything Changed in the Last Corner" : "One Corner Changed This Race";
    skill=drift ? (overtake ? "The Drift That Secured the Overtake" : "Why I Held the Drift Through the Corner")
      : "The Line That Made the Final Corner Count";
  } else if(has(/\bboss\b/) && has(/\b(?:dodg\w*|surviv\w*|escap\w*|one hit|1 hp|barely any health|low health)\b/)) {
    const dodge=has(/\b(?:dodg\w*|evad\w*|avoid\w*)\b/);
    const low=has(/\b(?:1 hp|one hp|one hit point|one hit|barely any health|low health)\b/);
    const oneHit=has(/\b(?:1 hp|one hp|one hit point|one hit away)\b/);
    const escaped=has(/\b(?:escap\w*|surviv\w*|made it out)\b/);
    const defeated=has(/\b(?:defeat\w*|beat the boss|finished the fight|killed the boss)\b/);
    searchable=dodge ? (alt?"I Dodged the Boss Attack":escaped?"One Dodge Let Me Escape the Boss Fight":"One Dodge Changed This Boss Encounter")
      : "I Survived This Boss Encounter";
    curiosity=oneHit?"One Hit Away from Losing This Boss Fight":
      low?"Barely Any Health Left Against the Boss":"This Boss Fight Came Down to One Move";
    skill=dodge&&escaped?"The Dodge That Let Me Escape the Boss":
      dodge&&defeated?"The Dodge Before I Finished the Boss":
      dodge?"The Boss Dodge That Made the Difference":"I Made It Through the Boss Encounter";
  } else if(has(/\b(?:fire|flames|burning|burned)\b/) && has(/\b(?:kitchen|cooking|dinner)\b/)) {
    searchable=alt?"Dinner Was a Disaster in the Kitchen":"I Tried Cooking Dinner. The Kitchen Caught Fire";
    curiosity="One Meal Turned into Total Chaos";
    skill="The Cooking Mistake That Changed Everything";
  } else if(has(/\b(?:farm|greenhouse|harvest|planting|crops)\b/)) {
    const greenhouse=has(/\bgreenhouse\b/);
    searchable=greenhouse?"I Finally Finished the Greenhouse":"The Farm Grind Finally Paid Off";
    curiosity=alt?"This Farm Progress Took Some Patience":"The Little Farm Improvements Added Up";
    skill=greenhouse?"Why Finishing the Greenhouse Felt So Good":"How I Made Progress on the Farm";
  } else if(has(/\b(?:diplomac|trade|traded|negotiat)\b/)) {
    const avoided=has(/\b(?:prevent|avoid|avoided|prevented)\b.{0,35}\bwar\b/);
    searchable=avoided?"How I Used Diplomacy to Avoid a War":"How I Played the Diplomatic Game";
    curiosity=avoided?"No War Needed. Just the Right Negotiation":"The Smartest Move Wasn't a Battle";
    skill=has(/\btrad/) ? "The Trade Decision That Changed My Strategy":"Why I Chose Negotiation Over Combat";
  } else if(has(/\b(?:clutch|comeback|1v[2-9])\b/)) {
    const match=src.match(/\b1v[2-9]\b/);
    const information=has(/\b(?:callout|comms|information|camera|sound|position)\b/);
    const context=match ? match[0].toUpperCase()+" " : "";
    searchable=alt?"Breaking Down This "+context+"Clutch":"How This "+context+"Clutch Played Out";
    curiosity="The Clutch Was Decided Before the Final Moment";
    skill=information?"The Information Behind This "+context+"Clutch":"How Staying Composed Made This Clutch Possible";
  } else if(has(/\b(?:design|layout|build|built|construction|base)\b/)) {
    searchable=alt?"The Changes That Made This Build Work":"How This Build Came Together";
    curiosity="The Final Result Was Worth the Effort";
    skill="The Small Build Decisions That Paid Off";
  } else if(has(/\b(?:timing|waited|positioning|rotation|predict|bait|read the)\b/)) {
    searchable=alt?"Why This Play Needed Patience":"How I Read the Play Before Acting";
    curiosity="The Best Part Happened Before the Finish";
    skill="The Timing and Positioning Behind This Play";
  } else if(has(/\b(?:accident|unexpected|went wrong|unplanned|chaos)\b/)) {
    searchable=alt?"How This Gaming Moment Went Wrong":"The Unexpected Moment That Changed the Plan";
    curiosity="That Was Definitely Not the Plan";
    skill="When a Simple Decision Goes Sideways";
  } else {
    const description = b.description.replace(/^(?:I have (?:a |the |some |these )?(?:clips?|videos?) (?:where|showing)|this (?:clip|video) shows?)\s+/i,"").trim();
    const words=description.replace(/[.!?].*$/,"").split(/\s+/).slice(0,9).join(" ");
    const detail=words.length>4 ? words[0].toUpperCase()+words.slice(1) : angle.hook;
    searchable=detail;
    curiosity=angle.payoff==="The moment makes more sense when you watch how it unfolds." ? "A Moment That Deserves a Second Look" : angle.payoff;
    skill=angle.setup.length<65 ? angle.setup : angle.hook;
  }
  // Always retain a recognizable game identifier and return three meaningfully different angles.
  return [formatTitle(searchable,b.game),formatTitle(curiosity,b.game),formatTitle(skill,b.game)];
}
