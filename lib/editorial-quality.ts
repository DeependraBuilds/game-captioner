import type {Brief} from "./gamecaptioner.ts";

type ClaimEvidence={claim:RegExp;source:RegExp;reason:string};

// A bounded editorial check, not a semantic truth engine. Check concrete
// mechanics claimed by generated writing against the actual creator notes.
// Apply based on the CONTENT of a brief, never a hard-coded game name.
const farmingRules:ClaimEvidence[]=[
  {claim:/\b(?:crop tiles?|planting tiles?|seed tiles?|crop grid|planting grid)\b/i,
   source:/\b(?:tiles?|grid|plots?|squares?)\b/i,reason:"unsupported placement details"},
  {claim:/\b(?:planting zones?|planting areas?|crop zones?|production zones?)\b/i,
   source:/\b(?:zones?|areas?|sections?|planting beds?)\b/i,reason:"unsupported zones"},
  {claim:/\b(?:plant(?:ed|ing)?|sow(?:ed|ing)?|seed(?:ed|ing)?|harvest(?:ed|ing)?)\s+(?:new\s+|indoor\s+)?(?:crops?|seeds?|produce)\b/i,
   source:/\b(?:plant|planted|planting|sow|seed|harvest|crop|crops)\b/i,reason:"unsupported farming action"},
  {claim:/\b(?:crop(?:\s+tile)?\s+planning|crop\s+management|crop\s+production|crop\s+output|indoor\s+crop|planting\s+routine)\b/i,
   source:/\b(?:crops?|plant|seed|harvest|watering|production|yield)\b/i,reason:"unsupported crop management"},
  {claim:/\b(?:clear(?:ed|ing)?\s+(?:out\s+)?(?:space|land|plots?|trees?|rocks?|debris)|remov(?:e|ed|ing)\s+(?:obstacles?|rocks?|trees?|structures?))\b/i,
   source:/\b(?:clear|cleared|clearing|remove|removed|rocks?|trees?|debris|obstacles?)\b/i,reason:"unsupported clearing"},
  {claim:/\b(?:mov(?:e|ed|ing)|reposition(?:ed|ing)?|relocat(?:e|ed|ing)?)\s+(?:any\s+|the\s+|my\s+)?(?:buildings?|structures?|barns?|coops?|houses?|machines?)\b/i,
   source:/\b(?:buildings?|structures?|barns?|coops?|houses?|machines?)\b/i,reason:"unsupported structure movement"},
  {claim:/\b(?:increas(?:e|es|ed|ing)|maximiz(?:e|es|ed|ing)|optimiz(?:e|es|ed|ing)|boost(?:ed|ing)?)\s+(?:my\s+|the\s+|your\s+)?(?:farm|crop|indoor|greenhouse)?\s*(?:productivity|efficiency|output|profit|production|yield|returns?)\b/i,
   source:/\b(?:productivity|efficiency|output|profit|production|yield|returns?|maximiz|optimiz)\w*\b/i,reason:"unsupported efficiency benefit"},
  {claim:/\b(?:without wasting(?: valuable)? in.game days|saves? (?:time|days?)|daily crop management)\b/i,
   source:/\b(?:wast\w*|sav\w*|days?|daily|time)\b/i,reason:"unsupported time optimization"},
  {claim:/\b(?:efficient|optimized|optimal)\s+(?:operational\s+|farm\s+|greenhouse\s+|spatial\s+)?(?:layout|setup|design|organization)\b/i,
   source:/\b(?:efficien\w*|optimi\w*|productiv\w*)\b/i,reason:"unsupported efficiency benefit"},
  {claim:/\b(?:clearing\s+and\s+repositioning|reorganizing\s+structures?|repositioning\s+structures?)\b/i,
   source:/\b(?:clear\w*|structures?|buildings?|reposition\w*)\b/i,reason:"unsupported structure changes"},
];
const instructionRules:RegExp[]=[
  /\b(?:take the time to|make sure (?:you|to)|be sure to|start by|learn to|you should|you need to|remember to)\b/i,
  /\b(?:use this approach|apply (?:this|the same) (?:approach|technique)|try (?:this|the same) (?:setup|method|technique)|use these (?:tips|steps|methods))\b/i,
  /\b(?:maximize your|optimize your|organize your|clear out (?:your|the)|follow these steps|here'?s how to)\b/i,
];

function farmingContent(b:Brief):boolean{
  const notes=(b.game+" "+b.description+" "+b.notable).toLowerCase();
  return /\b(?:farm|farming|greenhouse|crops?|harvest|planting|garden|stardew|harvest moon|story of seasons)\b/.test(notes);
}

export function editorialWarnings(text:string,b:Brief):string[]{
  const original=b.description+" "+b.notable;
  const warnings:string[]=[];
  if(farmingContent(b)){
    for(const rule of farmingRules)
      if(rule.claim.test(text)&&!rule.source.test(original)) warnings.push(rule.reason);
  }
  // Do not convert a highlight/story into an unsolicited tutorial. Explicit
  // tutorial prompts can still contain properly grounded instructions.
  if(b.contentType==="highlight" || b.contentType==="story" || b.contentType==="montage"){
    if(instructionRules.some(rule=>rule.test(text)))warnings.push("unsolicited coaching");
  }
  return [...new Set(warnings)];
}

export function editorialCaptionIsGrounded(text:string,b:Brief):boolean{
  return editorialWarnings(text,b).length===0;
}

export function preserveGroundedParagraphs(text:string,b:Brief):string{
  return text.split(/\n\s*\n/).map(para=>{
    const sentences=para.split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(Boolean);
    return sentences.filter(sentence=>editorialWarnings(sentence,b).length===0).join(" ");
  }).filter(Boolean).join("\n\n");
}
