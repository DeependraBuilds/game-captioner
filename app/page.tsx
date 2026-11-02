"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { GameSelector } from "@/components/game-selector";
import {
  PLATFORMS, PLATFORM_NAMES, TONES, CONTENT_TYPES, publishText, captionWithoutDuplicateTags,
  type Platform, type Content, type Section, type Adjustment,
  type GenerateResponse, type Tone, type ContentType,
} from "@/lib/gamecaptioner";

type Drafts = Partial<Record<Platform, Content>>;
const toneHelp: Record<Tone,string> = {
  hype:"Energetic, payoff-first, with excitement earned by the clip.",
  funny:"Light situational humor without inventing events.",
  competitive:"Confident, skill-focused writing without unsupported win claims.",
  tactical:"Explain the read, positioning and timing from the supplied facts.",
  casual:"Conversational and natural, like talking to a teammate.",
  cinematic:"Measured tension and pacing, grounded in what happened.",
};
const toneLabels: Record<Tone,string> = {
  hype: "⚡ Hype", funny: "☻ Funny", competitive: "◎ Competitive",
  tactical: "⌖ Tactical", casual: "◌ Casual", cinematic: "✧ Cinematic",
};
const examples = [
  { game:"Hades", description:"I dodged the boss's last attack with barely any health and escaped the room on the next strike.", tone:"cinematic" as Tone },
  { game:"Forza Horizon 5", description:"I entered the last corner in second, held the drift and overtook the leader right before the finish.", tone:"hype" as Tone },
  { game:"Stardew Valley", description:"After spending the whole season rearranging the farm, I finally completed the greenhouse setup.", tone:"casual" as Tone },
];
const sectionLabels: Record<Section,string> = {
  titles:"Titles & hooks", caption:"Caption", hashtags:"Hashtags", voiceover:"Voiceover",
  onscreen:"On-screen text", cta:"Optional CTA", carousel:"Carousel outline",
};
const sections: Section[] = ["titles","caption","hashtags","voiceover","onscreen","cta","carousel"];
const lineSections = new Set<Section>(["titles","hashtags","onscreen","carousel"]);
function safeCell(value: string): string {
  const text = /^[\s]*[=+\-@\t\r]/.test(value) ? "'" + value : value;
  return text;
}
function buildExport(drafts: Drafts, game: string, separator: "," | "\t"): string {
  const rows: string[][] = [[
    "Platform", "Game", "Title 1", "Title 2", "Title 3", "Caption", "Hashtags",
    "Voiceover", "On-screen text", "CTA", "Carousel",
  ]];
  for (const platform of PLATFORMS) {
    const item = drafts[platform];
    if (!item) continue;
    rows.push([
      PLATFORM_NAMES[platform], game, ...[0,1,2].map(i => item.titles[i] || ""),
      captionWithoutDuplicateTags(item.caption,item.hashtags), item.hashtags.join(" "), item.voiceover,
      item.onscreen.join(" | "), item.cta, item.carousel.join(" | "),
    ]);
  }
  return rows.map(row => row.map(cell => {
    const escaped = safeCell(cell).replace(/"/g, '""');
    return '"' + escaped + '"';
  }).join(separator)).join("\r\n");
}
function DownloadButtons({drafts, game}: {drafts:Drafts; game:string}) {
  const download = (separator:"," | "\t") => {
    const value = buildExport(drafts,game,separator);
    const blob = new Blob(["\uFEFF" + value], {type:separator === "," ? "text/csv;charset=utf-8" : "text/tab-separated-values;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "gamecaptioner-export." + (separator === "," ? "csv" : "tsv");
    a.click(); URL.revokeObjectURL(url);
  };
  return <div className="export-actions">
    <button className="button button-ghost button-small" type="button" onClick={() => download(",")}>Export CSV ↗</button>
    <button className="button button-ghost button-small" type="button" onClick={() => download("\t")}>Sheets TSV ↗</button>
  </div>;
}
function platformShort(p:Platform) {
  return p === "youtube" ? "YouTube" : p === "twitter" ? "X" : PLATFORM_NAMES[p];
}
export default function Home() {
  const [game,setGame] = useState("");
  const [description,setDescription] = useState("");
  const [notable,setNotable] = useState("");
  const [audience,setAudience] = useState("");
  const [tone,setTone] = useState<Tone>("casual");
  const [draftTone,setDraftTone] = useState<Tone | null>(null);
  const [contentType,setContentType] = useState<ContentType>("highlight");
  const [duration,setDuration] = useState<10|20|30>(20);
  const [platforms,setPlatforms] = useState<Platform[]>(["youtube"]);
  const [includeCTA,setIncludeCTA] = useState(false);
  const [includeCarousel,setIncludeCarousel] = useState(false);
  const [drafts,setDrafts] = useState<Drafts>({});
  const [active,setActive] = useState<Platform>("youtube");
  const [busy,setBusy] = useState(false);
  const [refining,setRefining] = useState("");
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const [mode,setMode] = useState<"offline"|"creative">("offline");
  const [captionSources,setCaptionSources] = useState<Partial<Record<Platform,"ai"|"grounded">>>({});
  const [variant,setVariant] = useState(0);
  const selectedResults = PLATFORMS.filter(p => Boolean(drafts[p]));
  const hasResults = selectedResults.length > 0;

  const payload = (selected:Platform[], nextVariant:number) => ({
    game,description,notable,audience,tone,contentType,duration,
    platforms:selected,includeCTA,includeCarousel,variant:nextVariant % 100,
  });
  const togglePlatform = (p:Platform) => {
    setPlatforms(current => current.includes(p)
      ? current.length === 1 ? current : current.filter(x => x !== p)
      : PLATFORMS.filter(x => current.includes(x) || x === p));
  };
  const generate = async (all:boolean) => {
    if (!game.trim() || description.trim().length < 12) {
      setError("Add a game and at least 12 characters describing your gameplay moment.");
      return;
    }
    const wanted = all ? [...PLATFORMS] : platforms;
    setError(""); setNotice(""); setBusy(true);
    try {
      const response = await fetch(all ? "/api/generate-all" : "/api/generate", {
        method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload(wanted,variant)),
      });
      const data = await response.json() as GenerateResponse & { error?:string };
      if (!response.ok || !data.results) throw new Error(data.error || "Generation failed.");
      setDrafts(data.results);setActive(wanted[0]);setMode(data.mode);setDraftTone(tone);setCaptionSources(data.captionSources||{});
      setNotice(data.mode === "creative" ? "AI-assisted draft ready. Some sections may use grounded copy when AI adds unsupported details. Review before posting." : (data.warning || "Basic mode: editorial AI was unavailable."));
      setVariant(v => (v + 1) % 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate content.");
    } finally { setBusy(false); }
  };
  const update = (p:Platform, section:Section, text:string) => {
    setDrafts(current => {
      const existing = current[p];
      if (!existing) return current;
      const value = lineSections.has(section) ? text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean) : text;
      return { ...current, [p]:{...existing,[section]:value} };
    });
  };
  const copy = async (value:string,label:string) => {
    try { await navigator.clipboard.writeText(value);setNotice(label+" copied to clipboard.");setError(""); }
    catch { setError("Clipboard access was blocked. Select the text and copy manually."); }
  };
  const refine = async (p:Platform,section:Section,adjustment:Adjustment) => {
    const current = drafts[p];
    if (!current) return;
    if (adjustment === "remove-cta") { update(p,"cta","");return; }
    setError("");setNotice("");setRefining(p + section);
    try {
      const response = await fetch("/api/generate", {
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...payload([p],(variant + 1)%100),section,adjustment,existingText:Array.isArray(current[section])?current[section].join("\n"):current[section]}),
      });
      const data = await response.json() as GenerateResponse & {error?:string};
      if (!response.ok || !data.results?.[p]) throw new Error(data.error || "Couldn't revise that section.");
      const updated = data.results[p]!;
      setDrafts(prev => prev[p] ? {...prev,[p]:{...prev[p], [section]:updated[section]}} : prev);
      setVariant(v => (v+1)%100);
      setNotice(sectionLabels[section] + (data.mode === "creative" ? " creatively rewritten." : " revised with basic rules. More natural rewrites require AI mode."));
    } catch (e) { setError(e instanceof Error ? e.message : "Couldn't revise that section."); }
    finally {setRefining("");}
  };
  return <div className="app-shell">
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/" aria-label="GameCaptioner home">
          <Image src="/gamecaptioner-mark.svg" width={44} height={44} alt="" priority />
          <span>Game<span className="brand-accent">Captioner</span><small>CREATOR WORKSPACE</small></span>
        </Link>
        <div className="header-right">
          <span className="header-pill"><span className="live-dot" /> Free-first · No account</span>
          <a href="https://github.com/DeependraBuilds/game-captioner" target="_blank" rel="noreferrer" className="header-link">View on GitHub ↗</a>
        </div>
      </div>
    </header>
    <main className="main-wrap">
      <section className="intro">
        <div className="eyebrow"><span className="small-square" /> GAMEPLAY IN. GREAT COPY OUT.</div>
        <h1>Every clip has a story.<br/><em>Find the words.</em></h1>
        <p>Turn your gameplay description into social-ready captions, hooks and voiceovers. Made for gaming creators, whatever you play.</p>
        <div className="intro-stats"><span>05 platforms</span><span>06 writing tones</span><span>01 streamlined workflow</span></div>
      </section>
      <div className="workspace">
        <section className="panel input-panel" aria-labelledby="brief-title">
          <div className="panel-heading">
            <div><span className="section-kicker">01 / YOUR CLIP</span><h2 id="brief-title">Build your brief</h2></div>
            <span className="step-chip">INPUT</span>
          </div>
          <form onSubmit={e => {e.preventDefault();void generate(false);}}>
            <label className="field-label" htmlFor="game">Game title <span className="required">*</span></label>
            <GameSelector value={game} onChange={setGame} />
            <label className="field-label" htmlFor="description">Describe the gameplay <span className="required">*</span></label>
            <textarea id="description" rows={5} maxLength={1800} value={description} onChange={e=>setDescription(e.target.value)} placeholder="What happened in the clip? Tell it like you'd tell a teammate or friend." />
            <div className="input-hint"><span>Natural language works best. No keywords needed.</span><span>{description.length}/1800</span></div>
            <div className="field-pair">
              <div><label className="field-label" htmlFor="notable">Key moment <span className="optional">optional</span></label>
                <textarea id="notable" rows={2} maxLength={500} value={notable} onChange={e=>setNotable(e.target.value)} placeholder="A twist, decision or payoff" /></div>
              <div><label className="field-label" htmlFor="audience">Audience <span className="optional">optional</span></label>
                <textarea id="audience" rows={2} maxLength={120} value={audience} onChange={e=>setAudience(e.target.value)} placeholder="Casual players, ranked grinders…" /></div>
            </div>
            <div className="field-pair">
              <div><label className="field-label" htmlFor="content-type">Content type</label>
                <select id="content-type" value={contentType} onChange={e=>setContentType(e.target.value as ContentType)}>
                  {CONTENT_TYPES.map(type=><option key={type} value={type}>{type.charAt(0).toUpperCase()+type.slice(1)}</option>)}
                </select></div>
              <div><label className="field-label" htmlFor="duration">Voiceover target</label>
                <select id="duration" value={duration} onChange={e=>setDuration(Number(e.target.value) as 10|20|30)}>
                  <option value={10}>10 seconds</option><option value={20}>20 seconds</option><option value={30}>30 seconds</option>
                </select></div>
            </div>
            <fieldset className="tone-field"><legend className="field-label">Writing tone</legend>
              <div className="tone-grid">{TONES.map(t=>
                <button type="button" key={t} className={"tone-button" + (tone===t?" is-selected":"")} aria-pressed={tone===t} onClick={()=>{setTone(t);if(hasResults)setNotice("Writing tone changed. Generate again to apply it across the titles, captions, voiceovers and overlays.");}}>{toneLabels[t]}</button>
              )}</div>
              <p className="tone-hint" aria-live="polite"><strong>Selected: {tone.charAt(0).toUpperCase()+tone.slice(1)}.</strong> {toneHelp[tone]} Applies to titles, descriptions, voiceovers and overlays after generation.</p>
            </fieldset>
            {hasResults && draftTone && draftTone !== tone && <p className="tone-change-notice" role="status">These drafts use <strong>{draftTone}</strong> tone. Select Generate again to apply <strong>{tone}</strong> tone to the output.</p>}
            <fieldset className="platform-field"><legend className="field-label">Where are you posting?</legend>
              <div className="platform-choices">{PLATFORMS.map(p=>
                <button type="button" key={p} aria-pressed={platforms.includes(p)} className={"platform-choice"+(platforms.includes(p)?" is-selected":"")} onClick={()=>togglePlatform(p)}>
                  <span className="platform-check">{platforms.includes(p)?"✓":"+"}</span>{platformShort(p)}
                </button>)}</div>
              <div className="selection-controls"><span>{platforms.length} selected</span><button type="button" onClick={()=>setPlatforms([...PLATFORMS])}>Select all</button></div>
            </fieldset>
            <div className="option-row">
              <label><input type="checkbox" checked={includeCTA} onChange={e=>setIncludeCTA(e.target.checked)}/> Include a CTA</label>
              <label><input type="checkbox" checked={includeCarousel} onChange={e=>setIncludeCarousel(e.target.checked)}/> Carousel outline</label>
            </div>
            <div className="generate-actions">
              <button type="submit" disabled={busy} className="button button-primary">{busy?"Generating…":"✦ Generate selected"}</button>
              <button type="button" disabled={busy} className="button button-secondary" onClick={()=>void generate(true)}>All 5 platforms</button>
            </div>
            <p className="small-print">No auto-posting. Your drafts stay editable. Review facts before publishing.</p>
          </form>
        </section>
        <section className="panel output-panel" aria-labelledby="output-title">
          <div className="panel-heading output-heading">
            <div><span className="section-kicker">02 / YOUR CONTENT</span><h2 id="output-title">The output studio</h2></div>
            <span className="step-chip step-chip-orange">DRAFTS</span>
          </div>
          {error && <div className="alert error" role="alert">{error}</div>}
          {notice && <div className="alert success" role="status">{notice}</div>}
          {!hasResults ? <div className="empty-state">
            <div className="empty-symbol">GC<span>✦</span></div>
            <h3>Waiting on your next moment.</h3>
            <p>Describe what happened, pick your platforms and generate your first draft.</p>
            <div className="examples">
              <span>TRY AN EXAMPLE</span>
              {examples.map(sample=><button type="button" key={sample.game} onClick={()=>{
                setGame(sample.game);setDescription(sample.description);setNotable("");setAudience("");setTone(sample.tone);
                setNotice("Example loaded. Generate when ready.");
              }}>{sample.game} ↗</button>)}
            </div>
          </div> : <>
            <div className="results-toolbar">
              <div className="result-meta"><span className="live-dot"/>{selectedResults.length} platform draft{selectedResults.length===1?"":"s"}
                <span className="mode-label">{mode==="creative"?"AI-assisted":"Basic mode"}</span><span className="draft-tone">Draft tone: {draftTone ? draftTone.charAt(0).toUpperCase()+draftTone.slice(1) : "Unknown"}</span><span className="draft-tone">Description: {captionSources[active]==="ai"?"AI-written":"Grounded fallback"}</span></div>
              <DownloadButtons drafts={drafts} game={game}/>
            </div>
            <div className="result-tabs" role="tablist" aria-label="Generated platforms">
              {selectedResults.map(p=><button role="tab" aria-selected={active===p} key={p} className={"result-tab"+(active===p?" current":"")} onClick={()=>setActive(p)}>{platformShort(p)}</button>)}
            </div>
            {selectedResults.filter(p=>p===active).map(p => {
              const item = drafts[p]!;
              return <div key={p} className="result-content">
                <div className="result-summary"><div><span className="section-kicker">PLATFORM DRAFT</span><h3>{PLATFORM_NAMES[p]}</h3></div>
                  {p==="twitter" ? <span className={"counter"+(publishText(item).length>280?" over":"")}>{publishText(item).length}/280 chars incl. tags</span> : p==="youtube" ? <span className="counter">Titles: max 100 characters</span> : <span className="counter">Edit every section below</span>}
                </div>
                {sections.filter(s => (s!=="cta"||includeCTA||item.cta) && (s!=="carousel"||includeCarousel||item.carousel.length)).map(s => {
                  const value = item[s];
                  const text = Array.isArray(value) ? value.join("\n") : value;
                  const uid = p+"-"+s;
                  return <div className="editor" key={s}>
                    <div className="editor-head"><label htmlFor={uid}>{s==="caption" && p==="youtube"?"YouTube description":sectionLabels[s]}</label>
                      <div className="editor-tools">
                        <button type="button" onClick={()=>void copy(text,sectionLabels[s])} title={"Copy "+s}>Copy</button>
                        <button type="button" disabled={Boolean(refining)} onClick={()=>void refine(p,s,"regenerate")} title={"Regenerate "+s}>{refining===uid?"Working…":"↻ Rewrite"}</button>
                      </div></div>
                    <textarea id={uid} rows={s==="caption"?(p==="youtube"?9:5):s==="voiceover"?4:s==="carousel"?5:lineSections.has(s)?3:2} value={text} onChange={e=>update(p,s,e.target.value)} />
                    <div className="editor-bottom"><span>{s==="titles"?(p==="youtube"?"In order: Search • Curiosity • Skill (100-character maximum)":"One title per line"):s==="hashtags"?"One hashtag per line":s==="onscreen"?"One overlay per line":s==="voiceover"?"Approx. "+duration+" sec target":text.length+" characters"}</span>
                      {(s==="caption"||s==="voiceover"||s==="titles") && <div className="quick-actions">
                        <button type="button" disabled={Boolean(refining)} onClick={()=>void refine(p,s,"shorter")}>Shorter</button>
                        <button type="button" disabled={Boolean(refining)||mode==="offline"} title={mode==="offline"?"Available with Creative AI mode":undefined} onClick={()=>void refine(p,s,"natural")}>More natural (AI)</button>
                        <button type="button" disabled={Boolean(refining)||mode==="offline"} title={mode==="offline"?"Available with Creative AI mode":undefined} onClick={()=>void refine(p,s,"funnier")}>Funnier (AI)</button>
                      </div>}
                      {s==="cta" && <button className="text-action" type="button" onClick={()=>void refine(p,s,"remove-cta")}>Remove CTA</button>}
                    </div>
                  </div>;
                })}
                <div className="publish-preview">
                  <div className="editor-head"><h4>Caption + hashtags</h4><button type="button" onClick={()=>void copy(publishText(item),"Full post")}>Copy full post</button></div>
                  <p>{publishText(item)}</p>
                </div>
              </div>;
            })}
          </>}
        </section>
      </div>
      <footer className="site-footer"><div><strong>GameCaptioner</strong><span>Built by <a href="https://github.com/DeependraBuilds" target="_blank" rel="noreferrer">Deependra Builds ↗</a></span></div>
        <p>A focused writing tool for gaming creators. No accounts. No auto-publishing. No unnecessary complexity.</p></footer>
    </main>
  </div>;
}
