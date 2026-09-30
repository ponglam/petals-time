"use strict";
/* UI for the unchanged 0.6.0 renderer. Canonical age is never rescaled. */

const $=id=>document.getElementById(id);
const TUNE_DEF=[["fibre","Fibre"],["vein","Veins"],["dissolve","Dissolution"],["ink","Ink pooling"],["chroma","Chromatic time"],["exposure","Temporal exposure"],["memory","Memory"],["blur","Optical softness"],["grain","Grain"]];
const state={seed:"A73291",family:2,age:NOW_DAY,playing:false,pace:12,birth:null,tune:Object.fromEntries(TUNE_DEF.map(([k])=>[k,1]))};
let genome=null, dirty=true, acc=0, last=0;
let windowYears=5;
const windowMin=()=>NOW_DAY-windowYears*365, windowMax=()=>NOW_DAY+windowYears*365;
function ensureWindow(){ if(state.age<windowMin()||state.age>windowMax()){windowYears=20;buildTicks();} }
function failRenderer(message){ state.playing=false; $('loading').hidden=true; $('err').hidden=false; $('err').textContent=message; document.querySelector('.art').setAttribute('aria-busy','false'); document.querySelectorAll('#play,#back,#fwd,#savePng,#saveJson').forEach(b=>b.disabled=true); }


function randomSeed(){const b=new Uint8Array(3);crypto.getRandomValues(b);return[...b].map(x=>x.toString(16).padStart(2,"0")).join("").toUpperCase();}
function readHash(){try{const h=new URLSearchParams(location.hash.slice(1));
  windowYears=h.get("window")==="20"?20:5;
  if(h.get("seed"))state.seed=h.get("seed").slice(0,24);
  const a=parseFloat(h.get("age"));if(isFinite(a))state.age=clamp(Math.round(a*1e6)/1e6,1,MAX_DAY);
  if(h.has("family")){const f=parseInt(h.get("family"),10);state.family=ARCH[f]?f:-1;}
  const bd=h.get("birth");if(!h.get("seed")&&bd)state.birth=bd;if(bd&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(bd))state.birth=bd;
  const v=h.get("v");if(v&&v!==RENDERER_VERSION)say(`This link was made with renderer ${v}. It is shown with ${RENDERER_VERSION}, so it may look different.`);
  return !!h.get("seed");}catch(e){return false;}}
let hashT=0;
function writeHash(){clearTimeout(hashT);hashT=setTimeout(()=>{try{
  const p=new URLSearchParams({seed:state.seed,age:String(Math.round(state.age*1e6)/1e6),v:RENDERER_VERSION});
  p.set("family",String(state.family));p.set("ui","geo");p.set("window",String(windowYears));
  if(state.birth)p.set("birth",state.birth);history.replaceState(null,"","#"+p.toString());}catch(e){}},250);}
function say(t){$("status").textContent=t;}

function relLabel(age){const off=Math.round(age)-NOW_DAY;if(off===0)return"Now";
  const a=Math.abs(off),y=Math.floor(a/365),d=a%365,s=off>0?"+":"\u2212";
  const parts=[];if(y)parts.push(y+(y===1?" year":" years"));if(d||!y)parts.push(d+(d===1?" day":" days"));
  return s+parts.join(", ");}
function calLabel(age){ if(!state.birth)return`Day ${Math.round(age).toLocaleString("en-GB")} of ${MAX_DAY.toLocaleString("en-GB")}`;
  const[dt,tm]=state.birth.split("T"),[Y,M,D]=dt.split("-").map(Number),[hh,mm]=tm.split(":").map(Number);
  const ms=Date.UTC(Y,M-1,D,hh,mm)+(Math.round(age)-NOW_DAY)*864e5, x=new Date(ms);
  return x.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"})+", "+x.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:"UTC"});}

function applyAtmosphere(){
  const p=genome.pal, a=mixc(mixc(p.bgA,p.bgB,.35),[1,1,1],.18), deep=mixc(p.bgA,[.05,.05,.06],.86);
  const r=document.documentElement.style; r.setProperty("--atmo",toHex(a)); r.setProperty("--atmo-deep",toHex(deep));
  const inkc=mixc(a,[.06,.05,.08],.90);
  r.setProperty("--tint-ink",toHex(inkc));r.setProperty("--tint-muted",toHex(mixc(inkc,a,.20)));r.setProperty("--tint-line",toHex(mixc(inkc,a,.78)));
  $('character').textContent=genome.arch[0];$('edition-seed').textContent=state.seed;
  $('art-edition').textContent=state.seed+' / PETALS';
  $('swatches').replaceChildren(...['root','mid','tip','accent','stem'].map(k=>{const s=document.createElement('span');s.style.background=toHex(p[k]);s.title=k+' · '+toHex(p[k]);return s;}));
  $("archNote").textContent=`This organism leans ${Math.round((1-genome.arch[2])*100)}% ${genome.arch[0]}, ${Math.round(genome.arch[2]*100)}% ${genome.arch[1]}. Tuning is for study only and is not part of its identity.`;
}
function setSeed(s){state.seed=(s||"").trim().slice(0,24)||randomSeed();$("seed").value=state.seed;genome=buildGenome(state.seed,state.family);applyAtmosphere();dirty=true;writeHash();}

/* timeline */
const track=$("track");
function buildTicks(){
  track.querySelectorAll('.tick,.tlabel').forEach(e=>e.remove());
  track.setAttribute('aria-valuemin',String(windowMin()));track.setAttribute('aria-valuemax',String(windowMax()));
  $('time-window').value=String(windowYears);
  [[`−${windowYears}y`,0],['Now',.5],[`+${windowYears}y`,1]].forEach(([t,p])=>{
    const k=document.createElement('div');k.className='tick'+(p===.5?' now':'');k.style.left=(p*100)+'%';k.setAttribute('aria-hidden','true');
    const l=document.createElement('div');l.className='tlabel'+(p===.5?' now':'');l.textContent=t;l.style.left=(p*100)+'%';l.setAttribute('aria-hidden','true');
    if(p===0)l.style.transform='none';if(p===1)l.style.transform='translateX(-100%)';track.append(k,l);
  });
}
buildTicks();
$('time-window').onchange=()=>{state.playing=false;windowYears=Number($('time-window').value);state.age=clamp(state.age,windowMin(),windowMax());buildTicks();setAge(state.age);};
function syncUI(){
  const original=new URLSearchParams({seed:state.seed,age:String(state.age),family:String(state.family),v:RENDERER_VERSION});if(state.birth)original.set('birth',state.birth);
  $('original-studio').href='../versions/0.6.0/index.html#'+original;
  ensureWindow();
  const p=(state.age-windowMin())/(windowMax()-windowMin());
  $("handle").style.left=(p*100)+"%";
  const f=$("fill"),n=.5;f.style.left=(Math.min(p,n)*100)+"%";f.style.width=(Math.abs(p-n)*100)+"%";
  $("rel").textContent=relLabel(state.age);$("cal").textContent=calLabel(state.age);
  track.setAttribute("aria-valuenow",String(Math.round(state.age)));track.setAttribute("aria-valuetext",relLabel(state.age));
  $("playIcon").setAttribute("d",state.playing?"M3 1.5h3v11H3zM8 1.5h3v11H8z":(state.age>=windowMax()?"M7 2a5 5 0 1 1-4.6 3M2 1.5v4h4":"M3 1.5v11l9-5.5z"));
  $("playIcon").setAttribute("fill",state.age>=windowMax()&&!state.playing?"none":"currentColor");
  $("playIcon").setAttribute("stroke",state.age>=windowMax()&&!state.playing?"currentColor":"none");
  $("play").setAttribute("aria-label",state.playing?"Pause":(state.age>=windowMax()?"Replay visible passage":"Play"));
  $('play-label').textContent=state.playing?'Pause passage':state.age>=windowMax()?'Replay passage':'Play passage';
  $('play').setAttribute('aria-pressed',String(state.playing));
  $('back').disabled=state.age<=windowMin();$('fwd').disabled=state.age>=windowMax();
  document.querySelectorAll(".pace").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.p===state.pace)));
}
function setAge(a,{pause=true}={}){if(pause)state.playing=false;state.age=clamp(Math.round(a*1e6)/1e6,1,MAX_DAY);dirty=true;writeHash();syncUI();}
let dragging=false;
function ageFromX(x){const r=track.getBoundingClientRect();return windowMin()+clamp01((x-r.left)/r.width)*(windowMax()-windowMin());}
track.addEventListener("pointerdown",e=>{dragging=true;track.setPointerCapture(e.pointerId);setAge(ageFromX(e.clientX));});
track.addEventListener("pointermove",e=>{if(dragging)setAge(ageFromX(e.clientX));});
track.addEventListener("pointerup",()=>{dragging=false;});
track.addEventListener("pointercancel",()=>{dragging=false;});
track.addEventListener("lostpointercapture",()=>{dragging=false;});
track.addEventListener("keydown",e=>{const st=e.shiftKey?365:1;
  if(e.key==="ArrowRight"||e.key==="ArrowUp"){setAge(Math.min(windowMax(),Math.round(state.age)+st));e.preventDefault();}
  else if(e.key==="ArrowLeft"||e.key==="ArrowDown"){setAge(Math.max(windowMin(),Math.round(state.age)-st));e.preventDefault();}
  else if(e.key==="Home"){setAge(windowMin());e.preventDefault();}else if(e.key==="End"){setAge(windowMax());e.preventDefault();}});

$("play").onclick=()=>{if(state.playing){state.playing=false;}else{if(state.age>=windowMax())state.age=windowMin();state.playing=true;acc=0;last=performance.now();}dirty=true;syncUI();};
$("back").onclick=()=>setAge(Math.max(windowMin(),Math.ceil(state.age)-1));
$("fwd").onclick=()=>setAge(Math.min(windowMax(),Math.floor(state.age)+1));
$("nowBtn").onclick=()=>setAge(NOW_DAY);
document.querySelectorAll(".pace").forEach(b=>b.onclick=()=>{state.pace=+b.dataset.p;syncUI();});
$("seed").addEventListener("change",e=>{const v=e.target.value.trim().toUpperCase(),b=seedToBirth(v);
  if(b){state.birth=b;syncBirthInputs();setSeed(v);setAge(NOW_DAY);}else setSeed(e.target.value);syncBirthNote();});
(function buildFamily(){const sel=$("family");FAMILIES.forEach(([n,v])=>{const o=document.createElement("option");o.value=v;o.textContent=n;sel.appendChild(o);});
  sel.value=String(state.family);sel.addEventListener("change",()=>{state.family=+sel.value;setSeed(state.seed);});})();
$("newSeed").onclick=()=>{state.birth=null;$("bd").value="";$("bt").value="";setSeed(randomSeed());syncBirthNote();syncUI();};
function syncBirthInputs(){$("bd").value="";$("bt").value="";if(state.birth){const[d,t]=state.birth.split("T");$("bd").value=d;$("bt").value=t;}}
function syncBirthNote(){const n=$("bdNote");
  if(!state.birth){n.textContent="Enter both to grow the organism that belongs to that minute. The birthday also marks Now on the timeline.";return;}
  const bs=birthToSeed(state.birth);
  n.textContent=bs===state.seed?`Seed ${bs} belongs to this minute. Anyone entering the same birthday and time grows the same organism.`
    :`The seed was changed by hand, so this organism no longer comes from the birthday. Re-enter the time to return to ${bs}.`;}
function readBirth(){const d=$("bd").value,t=$("bt").value;
  state.playing=false;
  if(!$('bd').checkValidity()||!$('bt').checkValidity()){say('Enter a valid birthday and birth time.');syncUI();return;}
  if(!d){state.birth=null;writeHash();syncBirthNote();syncUI();return;}
  state.birth=d+"T"+(t||"00:00");
  if(!t){$("bdNote").textContent="Add the birth time too. Until then the seed uses midnight.";}
  const bs=birthToSeed(state.birth);if(bs){setSeed(bs);setAge(NOW_DAY);}
  if(t)syncBirthNote();syncUI();}
$('birth-form').addEventListener('submit',e=>{e.preventDefault();readBirth();say('Your botanical portrait is ready. Explore its passage through time.');});
$('bd').addEventListener('change',()=>{if($('bd').value&&$('bt').value)readBirth();});
$('bt').addEventListener('change',()=>{if($('bd').value&&$('bt').value)readBirth();});
$("randBd").onclick=()=>{const u=new Uint32Array(2);crypto.getRandomValues(u);
  const lo=Date.UTC(1940,0,1),hi=Date.UTC(2025,11,31),ms=lo+(u[0]/4294967296)*(hi-lo),x=new Date(ms),mins=u[1]%1440;
  state.birth=x.toISOString().slice(0,10)+"T"+String(Math.floor(mins/60)).padStart(2,"0")+":"+String(mins%60).padStart(2,"0");
  syncBirthInputs();setSeed(birthToSeed(state.birth));setAge(NOW_DAY);syncBirthNote();};

/* tuning panel */
(function buildTune(){const box=$("tune");TUNE_DEF.forEach(([k,label])=>{
  const l=document.createElement("label");l.innerHTML=`<span>${label}</span><input type="range" min="0" max="2" step="0.05" value="1"><output>1.00</output>`;
  const inp=l.querySelector("input"),out=l.querySelector("output");
  inp.addEventListener("input",()=>{state.tune[k]=+inp.value;out.textContent=(+inp.value).toFixed(2);dirty=true;});box.appendChild(l);});
  const rs=document.createElement("button");rs.className="btn";rs.textContent="Reset tuning";rs.style.alignSelf="flex-start";
  rs.onclick=()=>{box.querySelectorAll("input[type=range]").forEach((i,n)=>{i.value=1;i.nextElementSibling.textContent="1.00";state.tune[TUNE_DEF[n][0]]=1;});dirty=true;};box.appendChild(rs);})();
function toggleTune(){const o=$("tune").classList.toggle("open");$("tuneBtn").setAttribute("aria-expanded",String(o));$('tuneBtn').querySelector('.disclosure-mark').textContent=o?'−':'+';}
$("tuneBtn").onclick=toggleTune;
document.addEventListener("keydown",e=>{if(e.target.closest("input,button,select,textarea,a,.track"))return;
  if(e.key===" "){$("play").click();e.preventDefault();}else if(e.key==="d"||e.key==="D")toggleTune();});

/* saving */
let downloads;
async function initDownloads(){
  if(window.claude&&typeof window.claude.use==="function"){try{downloads=await window.claude.use("downloads");}catch(e){downloads=null;}
    if(!downloads){$("savePng").hidden=true;$("saveJson").hidden=true;}}
  else downloads="anchor";
}
async function offer(filename,data){
  if(downloads==="anchor"){const url=URL.createObjectURL(data instanceof Blob?data:new Blob([data]));const a=document.createElement("a");a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);say("Saved "+filename+".");return;}
  if(!downloads){say("Saving is not available in this view.");return;}
  try{await downloads.save({filename,data});say("Saved "+filename+".");}
  catch(e){const c=e&&e.code;
    if(c==="declined")say("Save cancelled.");else if(c==="rate_limited")say("A save prompt is already open. Finish it, then try again.");
    else{say("Saving is not available in this view.");$("savePng").hidden=true;$("saveJson").hidden=true;}}
}
function identity(){const id={artwork:"PETALS",family:state.family>=0?ARCH[state.family].name:"mixed",seed:state.seed,ageDays:Math.round(state.age*1e6)/1e6,offsetDays:Math.round(state.age)-NOW_DAY,
  offsetLabel:relLabel(state.age),rendererVersion:RENDERER_VERSION,resolution:[RES_W,RES_H],birth:state.birth,calendar:state.birth?calLabel(state.age):null,
  style:{between:genome.arch.slice(0,2),blend:+genome.arch[2].toFixed(3)}};
  const t=Object.entries(state.tune).filter(([,v])=>v!==1);if(t.length)id.studyTuning=Object.fromEntries(t);return id;}
const fname=ext=>`petals-${state.seed}-${(Math.round(state.age)-NOW_DAY)>=0?"p":"m"}${Math.abs(Math.round(state.age)-NOW_DAY)}d.${ext}`;
$('savePng').onclick=async()=>{
  state.playing=false;syncUI();const button=$('savePng');button.disabled=true;button.setAttribute('aria-busy','true');say('Preparing your impression…');
  const filename=fname('png');
  try{renderGPU(genome,state.age,state.tune);const blob=await new Promise(resolve=>cv.toBlob(resolve,'image/png'));if(!blob)throw Error('Image export failed. Please try again.');await offer(filename,blob);}
  catch(e){say(e.message);}finally{button.disabled=false;button.removeAttribute('aria-busy');}
};
$("saveJson").onclick=()=>{state.playing=false;syncUI();offer(fname("json"),JSON.stringify(identity(),null,2));};

/* loop: one rendered playback step = one virtual day, never catch up */
function frame(t){
  if(state.playing&&!document.hidden){const dt=(t-last)/1000;last=t;acc+=Math.min(dt,.1);
    if(acc>=1/state.pace){acc=0;state.age=Math.floor(state.age)+1;
      if(state.age>=windowMax()){state.age=windowMax();state.playing=false;}dirty=true;writeHash();syncUI();}}
  else last=t;
  if(dirty&&GPU){dirty=false;try{renderGPU(genome,state.age,state.tune);$('loading').hidden=true;document.querySelector('.art').setAttribute('aria-busy','false');}catch(e){failRenderer(e.message);}}
  requestAnimationFrame(frame);
}
document.addEventListener("visibilitychange",()=>{last=performance.now();acc=0;});

/* boot */
(function boot(){
  let had=readHash();
  if(!had&&state.birth){state.seed=birthToSeed(state.birth)||randomSeed();had=true;}
  else if(!had)state.seed=randomSeed();
  if(!state.birth){const b=seedToBirth(state.seed);if(b)state.birth=b;}
  setSeed(state.seed);$("family").value=String(state.family);syncBirthInputs();syncBirthNote();
  if(!gl){failRenderer('This artwork needs WebGL2. Open it in a current browser.');return;}
  try{GPU=initGPU();}catch(e){failRenderer("The renderer could not start: "+e.message);console.error(e);return;}
  state.playing=!matchMedia("(prefers-reduced-motion:reduce)").matches&&!had;
  buildTicks();syncUI();initDownloads();requestAnimationFrame(frame);
  window.__petals={state,birthToSeed,seedToBirth,render:()=>renderGPU(genome,state.age,state.tune),setSeed,setAge,get genome(){return genome;}};
})();

/* Appearance changes the studio only, never the pigment/renderer state. */
function setTheme(value){document.documentElement.dataset.theme=value;$('theme').value=value;try{localStorage.setItem('petals-studio-theme',value);}catch(e){}}
try{const saved=localStorage.getItem('petals-studio-theme');if(['paper','tint','dark','system'].includes(saved))setTheme(saved);}catch(e){}
$('theme').onchange=e=>setTheme(e.target.value);
cv.addEventListener('webglcontextlost',e=>{e.preventDefault();GPU=null;failRenderer('Graphics were interrupted. Reload to restore this saved moment.');});

window.addEventListener('hashchange',()=>{
  state.playing=false;state.age=NOW_DAY;state.family=2;state.birth=null;
  const had=readHash();if(!had)state.seed=state.birth?birthToSeed(state.birth)||randomSeed():randomSeed();
  if(!state.birth)state.birth=seedToBirth(state.seed);
  setSeed(state.seed);$('family').value=String(state.family);syncBirthInputs();syncBirthNote();buildTicks();syncUI();
});
