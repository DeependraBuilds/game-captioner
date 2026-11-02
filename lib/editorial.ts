import type { Brief, Content, Platform } from "./gamecaptioner.ts";
import { youtubeTitles } from "./youtube-titles.ts";
import { basicYouTubeDescription } from "./youtube-description.ts";
import { toneNarrative, toneTitle, toneVoice } from "./tone-guide.ts";

type Angle = { hook: string; setup: string; payoff: string; overlay: string; extra?: string };
function period(s:string):string { return /[.!?]$/.test(s) ? s : s + "."; }
function trimIntro(s:string):string {
  return s.trim().replace(/^(?:so |basically |okay,? )?(?:i (?:have|got|made|recorded) (?:some |the |these |a |my )?(?:clips?|videos?|footage) (?:where |showing |of )?|(?:this|the) (?:clip|video) (?:shows?|is about) )/i,"").trim();
}
function fact(s:string):string {
  const phrase = trimIntro(s).split(/(?:[.!?;]|\b(?:and then|then|later in another round)\b)/i)[0].trim();
  const words=phrase.split(/\s+/);
  const excerpt=(words.length>19?words.slice(0,19).join(" ")+"…":phrase).replace(/[,:;\s]+$/,"");
  return period(excerpt.charAt(0).toUpperCase()+excerpt.slice(1));
}
function chooseAngle(b:Brief):Angle {
  const src=(b.description+" "+b.notable).toLowerCase();
  const has=(r:RegExp)=>r.test(src);
  const repeated=has(/\b(?:again|another round|two rounds|second round|twice|another time)\b/);
  if(has(/\b(?:c4|nitro cell)\b/) && has(/\b(?:double|two kills|2 kills)\b/)) {
    const name=b.description.match(/\bmap (?:which is|called|named)\s+([A-Z][A-Za-z0-9-]+)/)?.[1];
    const place=name ? " on "+name : "";
    const window=has(/\b(?:rappel|rappelling|window)\b/);
    return {
      hook:repeated ? "Two C4 doubles"+place+". Both came down to timing." : "A C4 double built on reading the play.",
      setup:window ? "Reading the rappel revealed where the attackers would be." : "The setup mattered before the detonation ever happened.",
      extra:has(/\bcastle\b/) && has(/\bbarricade\b/) ? "The first detonation was timed around the Castle barricade." : undefined,
      payoff:repeated ? "Different rounds, same idea: make the read, then time the C4." : "The explosion was the payoff. The read created it.",
      overlay:"READ • WAIT • DETONATE",
    };
  }
  if(has(/\b(?:drift|overtak|last corner|finish line|passed the leader)\b/)) return {
    hook:"The race came down to the final stretch.",
    setup:has(/\bdrift\b/)?"Holding the drift through the corner made the difference.":"The choice of line made all the difference.",
    payoff:has(/\b(?:overtak|pass(?:ed)? the leader)\b/)?"That last move took the lead.":"The finish made every second count.",
    overlay:"FINAL CORNER",
  };
  if(has(/\bboss\b/) && has(/\b(?:dodg|surviv|one hit|1 hp|barely any health|low health)\b/)) return {
    hook:"One mistake away from losing the run.",
    setup:"The boss fight hinged on a last-second decision.",
    payoff:has(/\b(?:escape|finish|defeat|won)\b/)?"Surviving opened the chance to finish it.":"That close call was the moment worth saving.",
    overlay:"ONE MORE DODGE",
  };
  if(has(/\b(?:fire|flames|burning|burned)\b/) && has(/\b(?:kitchen|cooking|dinner)\b/)) return {
    hook:"Dinner went completely off-script.",setup:"What started as cooking turned into chaos.",
    payoff:"The kitchen had other plans.",overlay:"DINNER DISASTER",
  };
  if(has(/\b(?:farm|greenhouse|harvest|planting|crops)\b/)) return {
    hook:"That slow grind finally paid off.",
    setup:has(/\bgreenhouse\b/)?"Finishing the greenhouse took patience.":"The small decisions finally added up.",
    payoff:"Not every satisfying moment needs a boss fight.",overlay:"THE PAYOFF",
  };
  if(has(/\b(?:diplomac|trade|traded|negotiat)\b/)) return {
    hook:"The smartest move wasn't a fight.",
    setup:"A decision at the negotiating table changed the situation.",
    payoff:has(/\b(?:prevent|avoid)\b.{0,30}\bwar\b/)?"The war never had to happen.":"Sometimes keeping your options open is the win.",
    overlay:"THE SMARTER MOVE",
  };
  if(has(/\b(?:clutch|comeback|1v[2-9])\b/)) return {
    hook:"The clutch wasn't only about the finish.",
    setup:has(/\b(?:callout|comms?|information|camera|position|sound)\b/)?"The information before the play shaped every decision.":"The pressure made each decision matter.",
    payoff:"The turning point was how the pressure got handled.",overlay:"UNDER PRESSURE",
  };
  if(has(/\b(?:design|layout|build|built|construction|base)\b/)) return {
    hook:"The finished build was worth the effort.",
    setup:"The process behind the result is part of the story.",
    payoff:"The little choices made the final result work.",overlay:"BUILD • ADJUST • FINISH",
  };
  if(has(/\b(?:timing|waited|positioning|rotation|predict|bait|read the)\b/)) return {
    hook:"The play was decided before the big moment.",
    setup:"Timing and reading the situation made the difference.",
    payoff:"The execution worked because of the setup.",overlay:"TIMING MATTERS",
  };
  if(has(/\b(?:accident|unexpected|went wrong|unplanned|chaos)\b/)) return {
    hook:"That did not go according to plan.",
    setup:"The moment took an unexpected turn.",
    payoff:"Sometimes the surprise is the best part.",overlay:"WELL, THAT HAPPENED",
  };
  // Without an LLM, unknown descriptions cannot reliably be transformed into original copy.
  // A short factual excerpt is deliberately safer than inventing mechanics or achievements.
  return {hook:"A moment worth a second look.",setup:fact(b.description),
    payoff:"The moment makes more sense when you watch how it unfolds.",overlay:"THE MOMENT"};
}
function cut(s:string,length:number):string {
  if(s.length<=length)return s;
  const short=s.slice(0,length-1);const i=short.lastIndexOf(" ");
  return (i>length*.6?short.slice(0,i):short).replace(/[ ,:;]+$/,"")+"…";
}
export function writeBasicDraft(b:Brief,p:Platform,baseTags:string[]):Content {
  const a=toneNarrative(b,chooseAngle(b));
  const hooks=[a.hook.replace(/[.!?]+$/,"")+" | "+b.game,
    "The detail that changed this play", "What made this moment work"];
  if(b.tone==="funny"){hooks[1]="That definitely was not the plan";hooks[2]="Well, this escalated";}
  if(b.tone==="cinematic"){hooks[1]="Everything came down to this";hooks[2]="One moment. One decision.";}
  if(b.tone==="hype"){hooks[1]="Wait for the payoff";hooks[2]="The moment everything changed";}
  const titles=p==="youtube" ? youtubeTitles(b,a).map((title,i)=>toneTitle(title,b,i)) : [0,1,2].map((_,i)=>cut(hooks[(i+b.variant)%3],110));
  const first=b.variant%3===0?a.hook:b.variant%3===1?a.payoff:a.setup;
  const ending=b.variant%3===0?a.payoff:b.variant%3===1?a.hook:a.payoff;
  const middle=[a.setup,a.extra].filter(Boolean).join(" ");
  const captions:Record<Platform,string>={
    youtube:basicYouTubeDescription(b,a),
    tiktok:first+" "+(b.variant%3===0?a.payoff:a.setup)+"\n"+b.game+".",
    instagram:first+"\n\n"+middle+"\n"+ending+"\n\n"+b.game+".",
    facebook:"A "+b.game+" moment that stood out: "+first+"\n\n"+a.setup+" "+ending,
    twitter:cut(b.game+": "+first+" "+ending,210),
  };
  // Target is approximate. Do not invent facts or pad scripts to fill 30 seconds.
  const ordered=toneVoice(b,a);
  const voiceOrder=b.variant%3===0?ordered:b.variant%3===1?[ordered[1],ordered[0],...ordered.slice(2)]:[...ordered.slice(1),ordered[0]];
  const voiceLines=voiceOrder.filter((s):s is string=>Boolean(s));
  const voiceMax=Math.round(b.duration*2.4);
  const vo:string[]=[];let words=0;
  for(const line of voiceLines){const count=line.split(/\s+/).length;if(!vo.length||words+count<=voiceMax+3){vo.push(line);words+=count;}}
  const titleOnScreen=cut(a.hook.replace(/[.!?]+$/,""),40);
  const carousel=b.includeCarousel?[titles[0],"The setup: "+a.setup,"The key moment: "+(a.extra||a.payoff),"The takeaway: "+a.payoff]:[];
  const ctaByTone={
    hype:"More "+b.game+" moments? Check out the channel.",
    funny:"More "+b.game+" moments like this? Stick around.",
    competitive:"Follow for more "+b.game+" decisions and highlights.",
    tactical:"More "+b.game+" reads and gameplay on the channel.",
    casual:"More "+b.game+" clips on the channel.",
    cinematic:"More "+b.game+" stories on the channel.",
  };
  return {
    titles,caption:captions[p],hashtags:baseTags,
    voiceover:vo.join(" "),onscreen:[titleOnScreen,a.overlay,cut(a.payoff,45)],
    cta:!b.includeCTA?"":p==="twitter"?"Follow for more "+b.game+".":ctaByTone[b.tone],
    carousel,
  };
}
