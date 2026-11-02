import test from 'node:test';
import assert from 'node:assert/strict';
import {parseBrief,createFallback,validContent} from '../lib/gamecaptioner.ts';
import {adequateYouTubeDescription} from '../lib/youtube-description.ts';
const b=parseBrief({game:'Rainbow Six Siege',description:'I got a double C4 kill at the window, then another double in a later round on Chalet with a Castle barricade.'});
test('YouTube gets substantial multi-paragraph description',()=>{const c=createFallback(b,'youtube').caption;assert.ok(adequateYouTubeDescription(c,b));assert.ok(c.split(/\n\n/).length>=3);});
test('short AI result cannot replace full YouTube description',()=>{const c=createFallback(b,'youtube');const r=validContent({...c,caption:'One C4. Two kills.'},b,'youtube');assert.ok(adequateYouTubeDescription(r.caption,b));});

test('unexpected Han or kana in an English AI title gets replaced',()=>{
 const raw=createFallback(b,'youtube');
 const foreign=String.fromCharCode(0x4e2d,0x6587);
 const input={...raw,titles:[foreign+' C4 double',raw.titles[1],raw.titles[2]],caption:foreign+' '+raw.caption};
 const fixed=validContent(input,b,'youtube');
 assert.ok(fixed);
 assert.ok(!fixed.titles.join(' ').includes(foreign));
 assert.ok(!fixed.caption.includes(foreign));
});
test('other platforms are allowed concise captions',()=>{
 const c=createFallback(b,'tiktok').caption;
 assert.ok(c.length<280);
});
