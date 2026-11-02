import type {Brief} from "./gamecaptioner.ts";
export function bossDescription(b:Brief):string|null {
 const text=b.description+" "+b.notable;
 if(!/\bboss\b/i.test(text))return null;
 const dodge=/\b(?:dodg\w*|evad\w*|avoided)\b/i.test(text);
 const escape=/\b(?:escap\w*|surviv\w*|made it out)\b/i.test(text);
 const finish=/\b(?:defeat\w*|finished the fight|beat the boss)\b/i.test(text);
 if(!dodge&&!escape&&!finish)return null;
 const low=/\b(?:1 hp|one hp|low health|barely any health|one hit)\b/i.test(text);
 const pressure=low?"With almost no health left, ":"";
 const event=dodge?"I dodged the boss attack":escape?"I survived the boss encounter":"I finished the boss fight";
 const outcome=escape && finish?"I finished the fight and made it out.":escape?"I made it out.":finish?"I finished the fight.":"That dodge was the key moment.";
 const pairs:Record<Brief["tone"],[string,string]>={
 hype:["That boss encounter in "+b.game+" got intense. "+pressure+event+".",outcome+" The moment came down to one decision, and that's the highlight."],
 funny:["Apparently the boss in "+b.game+" had other plans. "+pressure+event+".","At least the decision to "+(dodge?"move out of the way":"keep going")+" worked out. "+outcome],
 tactical:["In "+b.game+", "+(low?"I had barely any health left when ":"")+event+".",(dodge?"The dodge was the key decision":"Getting through the encounter was the key moment")+(low?" with little health left to spare":"")+". "+(escape?"I escaped after that attack, and that is the result this clip captures.":finish?"The fight ended afterward, with that response shaping the exchange.":"The clip focuses on my response to the boss attack.")],
 competitive:["In "+b.game+", "+(low?"I had barely any health left when ":"")+event+".","The response to the boss was the turning point. "+outcome+" This is the result of that decision."],
 casual:["I had a close boss moment in "+b.game+". "+pressure+event+".","That was the part I wanted to share. "+outcome+" It made for a good clip."],
 cinematic:["One boss encounter in "+b.game+" came down to this. "+pressure+event+".","The moment changed with that response. "+outcome+" That's where the clip ends."]
 };
 const closing:Record<Brief["tone"],string>={
 hype:"The boss attack created the pressure, and the response is what made the moment count.",
 funny:"The boss made its move, and for once I had an answer that actually worked.",
 tactical:"The immediate sequence was an incoming attack, my response, and the outcome of that exchange.",
 competitive:"The moment was defined by how I responded to the boss encounter rather than a new attack.",
 casual:"That's the kind of boss moment I like saving, "+(low?"especially with barely any health left.":"even when the fight wasn't over yet."),
 cinematic:"The boss encounter reached its turning point in that response, with the result coming right after."
 };
 return [pairs[b.tone][0],pairs[b.tone][1]+" "+closing[b.tone]].join("\n\n");
}
