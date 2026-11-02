import type {Brief} from "./gamecaptioner.ts";

type ClaimRule = { output:RegExp; evidence:RegExp; label:string };
const sharedRules:ClaimRule[]=[
 {output:/\b(?:audio cues?|sound cues?|footsteps?|hearing a breach)\b/i,evidence:/\b(?:audio|sound|footsteps?|hear|heard|listening|noise)\b/i,label:"audio information"},
 {output:/\b(?:callouts?|voice comms?|teammate comms?)\b/i,evidence:/\b(?:callouts?|teammate|comms?|communication)\b/i,label:"team communication"},
 {output:/\b(?:floor destruction|destructible floor|shot through the floor)\b/i,evidence:/\b(?:floor|ceiling|destroyed floor|destructible)\b/i,label:"floor destruction"},
 {output:/\b(?:vertical play|played vertically|vertical angle)\b/i,evidence:/\b(?:vertic|above|below|upstairs|downstairs|floor|ceiling|hatch)\w*/i,label:"vertical play"},
 {output:/\b(?:breaching tools?|breach charges?)\b/i,evidence:/\b(?:breaching tools?|breach charges?|hard breach|soft breach)\b/i,label:"breaching equipment"},
 {output:/\branked\b/i,evidence:/\b(?:ranked|ranking)\b/i,label:"ranked game"},
 {output:/\b(?:every single round|every round|all rounds)\b/i,evidence:/\b(?:every (?:single )?round|all rounds)\b/i,label:"all rounds"},
 {output:/\b(?:world record|personal best|new record|record time)\b/i,evidence:/\b(?:record|personal best|pb)\b/i,label:"record"},
 {output:/\b(?:flawless victory|perfect game|no damage taken)\b/i,evidence:/\b(?:flawless|perfect game|no damage|without taking damage)\b/i,label:"perfect result"},
 {output:/\b(?:won the match|secured the win|match victory|we won|I won|last.second victory|winning one|race victory|took the win|claimed victory|finished first|first.place finish)\b/i,evidence:/\b(?:won|win|victory|beat|defeated|finished first|won the race)\b/i,label:"victory"},
 {output:/\b(?:throttle control|throttle management|throttle inputs?)\b/i,evidence:/\b(?:throttle|accelerat|gas pedal|power control)\b/i,label:"throttle technique"},
 {output:/\b(?:runner.up finish|finished second|came second)\b/i,evidence:/\b(?:runner.up|finished second|came second|second.place finish)\b/i,label:"race finishing position"},
 {output:/\b(?:the final straight|last straight)\b/i,evidence:/\b(?:straight|straightaway)\b/i,label:"race straight"},
 {output:/\b(?:every single time|every time|always works|guaranteed (?:win|kill|result|success)|never fails|works every time)\b/i,evidence:/(?!)/,label:"unearned absolute"},
 {output:/\b(?:only way to|only possible way to)\b/i,evidence:/(?!)/,label:"unearned certainty"},
 {output:/\b(?:throttle discipline|throttle technique|throttle management|feather(?:ed|ing)? the throttle)\b/i,evidence:/\b(?:throttle|accelerat|gas pedal)\b/i,label:"throttle inputs"},
 {output:/\b(?:apex|corner exit|exit from the slide|racing line|line through the turn)\b/i,evidence:/\b(?:apex|corner exit|exit|racing line|line through|corner line)\b/i,label:"specific racing line"},
 {output:/\b(?:the opponent'?s|the leader'?s|an opponent'?s)\s+(?:tighter|wider|inside|outside|defensive|poor)\s+(?:racing )?line\b/i,evidence:/\b(?:opponent'?s|leader'?s|rival'?s)\s+(?:line|position|corner)\b/i,label:"opponent racing line"},
 {output:/\b(?:high.speed drift|technical closing sections|technical corners|tight corners)\b/i,evidence:/\b(?:high.speed|technical|tight corners?)\b/i,label:"race speed or technical section"},
 {output:/\b(?:timing line)\b/i,evidence:/(?!)/,label:"unfounded racing detail"},
 {output:/\b(?:clos(?:ing|e)(?:d)? the gap|carr(?:y|ies|ied|ying) momentum|maintain(?:s|ed|ing)? momentum|keep(?:s|ing)? (?:the )?momentum|momentum through the (?:turn|slide|corner|drift))\b/i,evidence:/\b(?:gap|momentum|carry speed|carried speed)\b/i,label:"inferred race movement"},
 {output:/\b(?:without losing control|without losing traction|without spinning out|without sliding off|kept the car under control|stayed under control)\b/i,evidence:/\b(?:control|traction|spin|spun|slid off|stable|stability)\b/i,label:"inferred vehicle control"},
 {output:/\b(?:tight sections?|tight corners?|technical sections?|technical corners?|high.speed sections?|difficult turns?)\b/i,evidence:/\b(?:tight|technical|high.speed|difficult turn)\b/i,label:"inferred track difficulty"},
 {output:/\b(?:reliable way to|guaranteed way to|always a good way to|repeatable way to|surefire way to|will reliably|typically (?:wins?|guarantees?|secures?))\b/i,evidence:/(?!)/,label:"unsupported general advice"},
 {output:/\b(?:proving that|proves that|proof that|shows that)\b.{0,55}\b(?:always|every time|every single time|guaranteed)\b/i,evidence:/(?!)/,label:"unsupported sweeping conclusion"},
 {output:/\b(?:waiting out the timer|wait out the timer|let the timer run|running down the clock)\b/i,evidence:/\b(?:timer|clock|last\s+\d+\s+seconds?|final seconds|time ran out)\b/i,label:"timer tactic"},
 {output:/\b(?:defensive and attacking scenarios|both attack and defense|on attack and defense)\b/i,evidence:/\b(?:both sides|attack and defense|defense and attack)\b/i,label:"both roles"},
 {output:/\b(?:without (?:ever )?exposing (?:myself|yourself)|without (?:a )?(?:direct )?gunfight)\b/i,evidence:/\b(?:without exposing|without (?:a )?gunfight|no gunfight|never saw)\b/i,label:"unseen engagement"},
];
const siegeTerms=["Mira","Deimos","Castle","Valkyrie","Chalet","Oregon","Clubhouse","Coastline","Kafe","Bank","Border","Kitchen","Master Bedroom"];
function siegeRules(b:Brief):ClaimRule[] {
 if(!/rainbow six|r6\b/i.test(b.game))return [];
 return siegeTerms.map(label=>({
   label:"specific operator/map "+label,
   output:new RegExp("\\b"+label.replace(/\s+/g,"\\s+")+"\\b","i"),
   evidence:new RegExp("\\b"+label.replace(/\s+/g,"\\s+")+"\\b","i"),
 }));
}
function killRule(text:string,evidence:string):string[] {
 const claimed=text.match(/\b(?:3|three|4|four|5|five|6|six)\s+(?:kills?|eliminations?)\b/gi)||[];
 const knownDouble=/\b(?:double|2 kills|two kills)\b/i.test(evidence);
 const knownRepeated=/\b(?:another round|again|twice|second round|different round|two rounds|later round)\b/i.test(evidence);
 const totalFour=knownDouble && knownRepeated;
 return claimed.filter(item=>{
   const count=item.match(/^(3|three|4|four|5|five|6|six)/i)?.[0].toLowerCase();
   if((count==="4"||count==="four") && totalFour)return false;
   const alternative=count==="4"?"four":count==="four"?"4":count==="3"?"three":count==="three"?"3":count;
   return !(new RegExp("\\b(?:"+count+"|"+alternative+")\\s+(?:kills?|eliminations?)\\b","i").test(evidence));
 }).map(()=> "unsupported kill total");
}
export function unsupportedClaims(text:string,b:Brief):string[] {
 const evidence=b.description+" "+b.notable;
 const rules=[...sharedRules,...siegeRules(b)];
 const warnings=rules.filter(item=>item.output.test(text) && !item.evidence.test(evidence)).map(item=>item.label);
 return [...new Set([...warnings,...killRule(text,evidence)])];
}
export function groundedSentences(text:string,b:Brief):string {
 return text.split(/\n\s*\n/).map(paragraph=>{
   const sentences=paragraph.split(/(?<=[.!?])\s+/);
   return sentences.filter(sentence=>unsupportedClaims(sentence,b).length===0).join(" ").trim();
 }).filter(Boolean).join("\n\n");
}
export function evidenceReminder(b:Brief):string {
 const source=b.description+" "+b.notable;
 const markers=[
  ["C4",/\b(?:c4|nitro cell)\b/i],
  ["multiple double kills",/\b(?:double|two kills|2 kills)\b/i],
  ["repeated round",/\b(?:another round|twice|second round|different round)\b/i],
  ["rappel",/\b(?:rappel|rappelling)\b/i],
  ["window",/\bwindow\b/i],
  ["sound/audio",/\b(?:sound|audio|hear|heard|footsteps?)\b/i],
  ["callouts",/\b(?:callouts?|comms?)\b/i],
  ["vertical play",/\bvertic\w*/i],
  ["floor destruction",/\b(?:floor|ceiling|destructible)\b/i],
  ["drifting",/\bdrift\w*/i],
  ["boss encounter",/\bboss\b/i],
  ["farming",/\b(?:farm|harvest|crops|greenhouse)\b/i],
  ["diplomacy",/\b(?:trade|diplomac|negotiat)\w*/i],
  ["ranked",/\branked\b/i],
 ];
 const present=markers.filter(([,regex])=>(regex as RegExp).test(source)).map(([name])=>name);
 return "Facts explicitly supported by the creator notes: "+(present.join(", ")||"Only the events in the source description")
  +". Do NOT add unmentioned audio cues, operators, maps, floor damage, comms, ranked status, opponent intentions, guaranteed outcomes or additional kills.";
}
