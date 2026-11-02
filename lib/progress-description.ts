import type {Brief} from "./gamecaptioner.ts";

// The same project-completion pattern works for farming, building, management
// and other games. Do not infer crop mechanics, structures, rewards or bonuses.
export function completedProjectDescription(b:Brief):string|null {
  const text=(b.description+" "+b.notable).trim();
  const effort=text.match(/\b(?:spending|spent)\s+(?:the\s+)?(?:whole|entire|full)\s+(season|week|month|day|year)\s+([^,.;!?]{3,90})/i);
  const goal=text.match(/\b(?:finally\s+)?(?:completed|finished)\s+(?:the|my|a|an)\s+([^,.;!?]{3,80})/i);
  if(!effort || !goal)return null;
  const period=effort[1].toLowerCase();
  const effortAction=effort[2].trim().replace(/\s+$/,"");
  const project=goal[1].trim();
  // Never invent a goal or a step when extraction is ambiguous.
  if(!/ing\b/i.test(effortAction.split(" ")[0]) || !project || project.split(/\s+/).length>8) return null;
  const game=b.game;
  const clauses:Record<Brief["tone"],[string,string]>={
    hype:[
      "A whole "+period+" of "+effortAction+", and the "+project+" is FINALLY finished in "+game+". That is the payoff I was working toward.",
      "After that much time on one project, seeing the finished "+project+" is the moment worth sharing. The work took the season; the result made the clip.",
    ],
    funny:[
      "Apparently I made "+effortAction+" my full-"+period+" side quest in "+game+". The reward? A completed "+project+".",
      "That's a lot of work for one completed project. At least there is finally something to show for a full "+period+" of effort.",
    ],
    competitive:[
      "In "+game+", I spent a whole "+period+" "+effortAction+" before completing the "+project+". The goal was the finished setup.",
      "The progress came through a longer project rather than one fast move. Getting the "+project+" finished is the result of that sustained effort.",
    ],
    tactical:[
      "In "+game+", I spent a whole "+period+" "+effortAction+" and finally completed the "+project+". This clip captures the result of that work.",
      "The work happened over the "+period+", with the completion coming after all those changes. The finished "+project+" is the result I wanted to capture.",
    ],
    casual:[
      "I spent the whole "+period+" "+effortAction+" in "+game+", and the "+project+" is finally done. That was a longer project than one quick session.",
      "It feels good having the setup finished after working on it for so long. That completed project is the moment I wanted to share.",
    ],
    cinematic:[
      "An entire "+period+" of "+effortAction+" in "+game+". After all of that, the "+project+" was finally complete.",
      "The work stretched across the "+period+", but this is the finished result. One project came together, and that is the moment this clip captures.",
    ],
  };
  // Do not expose source notes or mechanical claims in the publication-ready copy.
  return clauses[b.tone].map(p=>p.trim()).join("\n\n");
}
