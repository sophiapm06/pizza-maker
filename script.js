
// Sophia's Pizzariea — Customer Queue + TTS Voice Controls + Cutscene

// Toppings
const toppings=[
 {key:'cheese',name:'Cheese',emoji:'\uD83E\uDDC0',min:1,max:3},
 {key:'pepperoni',name:'Pepperoni',emoji:'\uD83C\uDF56',min:0,max:5},
 {key:'mushroom',name:'Mushroom',emoji:'\uD83C\uDF44',min:0,max:4},
 {key:'pepper',name:'Bell Pepper',emoji:'\uD83E\uDED1',min:0,max:4},
 {key:'onion',name:'Onion',emoji:'\uD83E\uDDC5',min:0,max:3},
 {key:'olive',name:'Olive',emoji:'\uD83E\uDED2',min:0,max:6},
 {key:'pineapple',name:'Pineapple',emoji:'\uD83C\uDF4D',min:0,max:3}
];

// State
let required={};
let placed=[];
let score=0;
let streak=0;
let timeLeft=60;
let timerId=null;

// Elements
const startScreen=document.getElementById('startScreen');
const btnPlay=document.getElementById('btnPlay');
const hud=document.getElementById('hud');
const timeEl=document.getElementById('time');
const scoreEl=document.getElementById('score');
const streakEl=document.getElementById('streak');
const gameEl=document.getElementById('game');
const orderList=document.getElementById('orderList');
const orderNotes=document.getElementById('orderNotes');
const pizzaArea=document.getElementById('pizzaArea');
const toppingListEl=document.getElementById('toppingList');
const feedbackEl=document.getElementById('feedback');
const btnUndo=document.getElementById('btnUndo');
const btnBake=document.getElementById('btnBake');
const btnClear=document.getElementById('btnClear');
const endScreen=document.getElementById('endScreen');
const finalScoreEl=document.getElementById('finalScore');
const btnRestart=document.getElementById('btnRestart');

// Customer UI
const customerCard=document.getElementById('customerCard');
const customerFigure=document.getElementById('customerFigure');
const orderBubble=document.getElementById('orderBubble');
const voiceSelect=document.getElementById('voiceSelect');
const voiceRate=document.getElementById('voiceRate');
const voicePitch=document.getElementById('voicePitch');
const btnSpeak=document.getElementById('btnSpeak');

// Customer queue (ACUs, PTs, Dress Blues)
const customers=[
 {uniform:'acu',name:'Cadet'},
 {uniform:'pt', name:'PT Soldier'},
 {uniform:'dress',name:'Officer'},
 {uniform:'acu',name:'Sergeant'},
 {uniform:'pt', name:'Runner'},
 {uniform:'dress',name:'Honor Guard'}
];
let customerIndex=0;

// Utils
const rand=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
const pick=(arr)=>arr[Math.floor(Math.random()*arr.length)];

function makeOrder(){
 const req={}; toppings.forEach(t=>req[t.key]=0);
 req.cheese=rand(1,3);
 const others=toppings.filter(t=>t.key!=='cheese');
 const howMany=rand(3,5);
 const chosen=others.slice().sort(()=>Math.random()-0.5).slice(0,howMany);
 chosen.forEach(t=>{ req[t.key]=rand(t.min,t.max); });
 const notes=['Make it snappy!','Extra tasty please.','For a hungry cadet.','Keep it balanced.','No burnt crust!'];
 return {req,note:pick(notes)};
}

function orderToText(req){
 const bits=[];
 Object.keys(req).forEach(k=>{ const c=req[k]; if(c>0){ const name=toppings.find(t=>t.key===k).name; bits.push(name+' x'+c); }});
 return (bits.length?bits.join(', '):'Cheese only');
}

// Inject SVG per uniform
function svgForUniform(type){
 if(type==='pt'){
   return `
   <svg viewBox="0 0 220 220">
     <circle cx="110" cy="110" r="105" fill="#ffdbe9" />
     <circle cx="110" cy="80" r="30" fill="#c48a60" stroke="#a56f47" stroke-width="2" />
     <circle cx="100" cy="78" r="4.5" fill="#3a2a1e" />
     <circle cx="120" cy="78" r="4.5" fill="#3a2a1e" />
     <rect id="custMouth" x="104" y="92" width="12" height="4" rx="2" fill="#6e472b" />
     <!-- PT gray tee -->
     <rect x="80" y="110" width="60" height="40" rx="10" fill="#b7b7b7" />
     <!-- PT black shorts -->
     <rect x="88" y="150" width="44" height="24" rx="6" fill="#242424" />
     <!-- salute arm -->
     <g class="salute-arm" transform="translate(138,116)">
       <rect x="0" y="0" width="14" height="28" rx="7" fill="#b7b7b7" />
       <rect x="8" y="-2" width="12" height="32" rx="6" fill="#b7b7b7" transform="rotate(-35)" />
     </g>
     <rect x="72" y="116" width="14" height="40" rx="7" fill="#b7b7b7" />
   </svg>`;
 }
 if(type==='dress'){
   return `
   <svg viewBox="0 0 220 220">
     <circle cx="110" cy="110" r="105" fill="#ffdbe9" />
     <circle cx="110" cy="80" r="30" fill="#c48a60" stroke="#a56f47" stroke-width="2" />
     <circle cx="100" cy="78" r="4.5" fill="#3a2a1e" />
     <circle cx="120" cy="78" r="4.5" fill="#3a2a1e" />
     <rect id="custMouth" x="104" y="92" width="12" height="4" rx="2" fill="#6e472b" />
     <!-- Dress blues jacket -->
     <rect x="78" y="110" width="64" height="60" rx="12" fill="#1c2740" />
     <!-- Gold buttons/trim -->
     <circle cx="92" cy="140" r="3" fill="#d4af37" />
     <circle cx="110" cy="140" r="3" fill="#d4af37" />
     <circle cx="128" cy="140" r="3" fill="#d4af37" />
     <rect x="78" y="126" width="64" height="6" fill="#d4af37" opacity="0.8" />
     <!-- salute arm -->
     <g class="salute-arm" transform="translate(138,116)">
       <rect x="0" y="0" width="14" height="28" rx="7" fill="#1c2740" />
       <rect x="8" y="-2" width="12" height="32" rx="6" fill="#1c2740" transform="rotate(-35)" />
     </g>
     <rect x="72" y="116" width="14" height="40" rx="7" fill="#1c2740" />
   </svg>`;
 }
 // default ACUs
 return `
 <svg viewBox="0 0 220 220">
   <circle cx="110" cy="110" r="105" fill="#ffdbe9" />
   <circle cx="110" cy="80" r="30" fill="#c48a60" stroke="#a56f47" stroke-width="2" />
   <circle cx="100" cy="78" r="4.5" fill="#3a2a1e" />
   <circle cx="120" cy="78" r="4.5" fill="#3a2a1e" />
   <rect id="custMouth" x="104" y="92" width="12" height="4" rx="2" fill="#6e472b" />
   <rect x="80" y="110" width="60" height="60" rx="12" fill="#7a8b7c" />
   <rect x="86" y="118" width="24" height="8" fill="#a6b3a8" opacity="0.85" />
   <rect x="110" y="130" width="26" height="8" fill="#626c61" opacity="0.85" />
   <rect x="92" y="142" width="34" height="8" fill="#9aa69a" opacity="0.85" />
   <rect x="120" y="122" width="22" height="8" fill="#6c786d" opacity="0.85" />
   <g class="salute-arm" transform="translate(138,116)">
     <rect x="0" y="0" width="14" height="28" rx="7" fill="#7a8b7c" />
     <rect x="8" y="-2" width="12" height="32" rx="6" fill="#7a8b7c" transform="rotate(-35)" />
   </g>
   <rect x="72" y="116" width="14" height="40" rx="7" fill="#7a8b7c" />
 </svg>`;
}

function showCustomerCutscene(newUniform){
 // fade out current figure, then swap, then fade in
 customerFigure.classList.remove('customer-enter');
 customerFigure.classList.add('customer-leave');
 const afterLeave=()=>{
   customerFigure.removeEventListener('animationend',afterLeave);
   customerFigure.innerHTML=svgForUniform(newUniform);
   customerFigure.classList.remove('customer-leave');
   customerFigure.classList.add('customer-enter');
 };
 customerFigure.addEventListener('animationend',afterLeave);
 if(!customerFigure.classList.contains('customer-leave')) afterLeave();
}

function renderCustomerText(text){
 orderBubble.textContent='Request: '+text;
 // talking mouth animation briefly
 customerCard.classList.add('talking');
 setTimeout(()=>customerCard.classList.remove('talking'),1800);
}

function renderOrder(){
 orderList.innerHTML='';
 Object.keys(required).forEach(key=>{
   const count=required[key];
   const t=toppings.find(x=>x.key===key);
   const li=document.createElement('li');
   li.innerHTML='<span class="emoji">'+t.emoji+'</span> <span class="name">'+t.name+'</span> <span class="count">x '+count+'</span>';
   orderList.appendChild(li);
 });
}

function renderPalette(){
 toppingListEl.innerHTML='';
 toppings.forEach(t=>{
   const div=document.createElement('div');
   div.className='topping';
   div.draggable=true; div.dataset.key=t.key;
   div.innerHTML='<span class="emoji">'+t.emoji+'</span><span class="name">'+t.name+'</span>';
   div.addEventListener('dragstart',ev=>{ev.dataTransfer.setData('text/plain',t.key);});
   div.addEventListener('click',()=>{
     const rect=pizzaArea.getBoundingClientRect();
     const x=rand(40,rect.width-40); const y=rand(40,rect.height-40);
     placeTopping(t.key,x,y);
   });
   toppingListEl.appendChild(div);
 });
}

function placeTopping(key,x,y){
 const rot=rand(-35,35);
 const span=document.createElement('span');
 span.className='topping-placed';
 span.textContent=toppings.find(t=>t.key===key).emoji;
 span.style.left=x+'px'; span.style.top=y+'px'; span.style.transform='rotate('+rot+'deg)';
 span.dataset.key=key; pizzaArea.appendChild(span);
 placed.push({key,x,y,rot,el:span});
 beep(660,50,'square',0.03);
}

pizzaArea.addEventListener('dragover',ev=>ev.preventDefault());
pizzaArea.addEventListener('drop',ev=>{ev.preventDefault(); const key=ev.dataTransfer.getData('text/plain'); const rect=pizzaArea.getBoundingClientRect(); placeTopping(key,ev.clientX-rect.left,ev.clientY-rect.top);});

function clearPizza(){ placed.forEach(p=>p.el.remove()); placed=[]; }
function undoLast(){ const last=placed.pop(); if(last&&last.el) last.el.remove(); }

function countsByKey(arr){ const map={}; toppings.forEach(t=>map[t.key]=0); arr.forEach(p=>{ map[p.key]=(map[p.key]||0)+1; }); return map; }

function evaluateOrder(){
 const have=countsByKey(placed);
 let perfect=true; const diffs=[];
 Object.keys(required).forEach(k=>{ const need=required[k]; const got=have[k]||0; if(need!==got){ perfect=false; const d=got-need; if(d>0) diffs.push('-'+d+' '+k); else if(d<0) diffs.push('+'+Math.abs(d)+' '+k); }});
 if(perfect){
   const bonus=100+streak*25+Math.max(0,timeLeft-40);
   score+=bonus; streak+=1; scoreEl.textContent=score; streakEl.textContent=streak; feedbackEl.textContent='Perfect! +'+bonus+' points';
   confettiBurst(); nextOrder();
 } else {
   const penalty=30; streak=0; score=Math.max(0,score-penalty);
   scoreEl.textContent=score; streakEl.textContent=streak; feedbackEl.textContent='Not quite: '+diffs.join(', ')+' (−'+penalty+')';
 }
}

function nextCustomer(){
 customerIndex=(customerIndex+1)%customers.length;
 const c=customers[customerIndex];
 showCustomerCutscene(c.uniform);
 return c;
}

function nextOrder(){
 clearPizza();
 const o=makeOrder(); required=o.req; renderOrder(); orderNotes.textContent=o.note;
 const c=nextCustomer();
 const text=orderToText(required);
 renderCustomerText(text);
}

function startGame(){
 startScreen.classList.add('hidden'); hud.classList.remove('hidden'); gameEl.classList.remove('hidden');
 score=0; streak=0; timeLeft=60; placed=[]; scoreEl.textContent=score; streakEl.textContent=streak; timeEl.textContent=timeLeft;
 renderPalette(); customerFigure.innerHTML=svgForUniform(customers[customerIndex].uniform);
 nextOrder(); if(timerId) clearInterval(timerId);
 timerId=setInterval(()=>{ timeLeft-=1; timeEl.textContent=timeLeft; if(timeLeft<=0) endGame(); },1000);
}

function endGame(){ if(timerId) clearInterval(timerId); hud.classList.add('hidden'); gameEl.classList.add('hidden'); endScreen.classList.remove('hidden'); finalScoreEl.textContent=score; }

btnPlay.addEventListener('click',startGame);
btnBake.addEventListener('click',evaluateOrder);
btnClear.addEventListener('click',()=>{ clearPizza(); feedbackEl.textContent='Cleared.'; });
btnUndo.addEventListener('click',()=>{ undoLast(); feedbackEl.textContent='Undid last topping.'; });
btnRestart.addEventListener('click',()=>{ endScreen.classList.add('hidden'); startGame(); });

// TTS Voices
let voices=[];
function populateVoices(){
 try{
   voices=window.speechSynthesis.getVoices()||[];
   voiceSelect.innerHTML='';
   voices.forEach((v,i)=>{
     const opt=document.createElement('option');
     opt.value=i; opt.textContent=(v.name||'voice')+' ('+(v.lang||'')+')';
     voiceSelect.appendChild(opt);
   });
   if(voiceSelect.options.length===0){ const opt=document.createElement('option'); opt.value=''; opt.textContent='(no voices)'; voiceSelect.appendChild(opt); }
 }catch(e){ voiceSelect.innerHTML='<option>(not supported)</option>'; }
}
populateVoices();
if('speechSynthesis' in window){ window.speechSynthesis.onvoiceschanged=populateVoices; }

btnSpeak.addEventListener('click',()=>{
 const text='Request: '+orderToText(required);
 try{
   const u=new SpeechSynthesisUtterance(text);
   u.rate=parseFloat(voiceRate.value)||1.0; u.pitch=parseFloat(voicePitch.value)||1.0;
   const idx=parseInt(voiceSelect.value,10); if(voices[idx]) u.voice=voices[idx];
   speechSynthesis.speak(u);
   customerCard.classList.add('talking');
   setTimeout(()=>customerCard.classList.remove('talking'), Math.min(4000, Math.max(1500, text.length*40)));
 }catch(e){ orderBubble.textContent=text+' (🔈 not supported)'; }
});

// Confetti + beeps
let audioCtx=null; function ensureAudio(){ if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)(); }
function beep(freq=880,ms=80,type='sine',vol=0.05){ ensureAudio(); const o=audioCtx.createOscillator(); const g=audioCtx.createGain(); o.type=type; o.frequency.value=freq; g.gain.value=vol; o.connect(g); g.connect(audioCtx.destination); o.start(); setTimeout(()=>{ o.stop(); },ms); }
function confettiBurst(){ const colors=['#ff4d8d','#ff85b3','#8bd4a6','#f4a261','#e9c46a']; const rect=pizzaArea.getBoundingClientRect(); for(let i=0;i<24;i++){ const c=document.createElement('div'); c.className='confetti'; c.style.left=Math.floor(Math.random()*rect.width)+'px'; c.style.top=Math.floor(Math.random()*40)+'px'; c.style.background=colors[Math.floor(Math.random()*colors.length)]; c.style.transform='translateY(-20px) rotate('+ (Math.floor(Math.random()*180)-90) +'deg)'; pizzaArea.appendChild(c); setTimeout(()=>c.remove(),1000);} beep(880,120,'triangle',0.05); setTimeout(()=>beep(1200,140,'triangle',0.05),120); }

// Keyboard quick add
pizzaArea.tabIndex=0;
pizzaArea.addEventListener('keydown',ev=>{ const keys={'1':'cheese','2':'pepperoni','3':'mushroom','4':'pepper','5':'onion','6':'olive','7':'pineapple'}; if(keys[ev.key]){ const rect=pizzaArea.getBoundingClientRect(); placeTopping(keys[ev.key],Math.floor(Math.random()*(rect.width-80))+40,Math.floor(Math.random()*(rect.height-80))+40); }});
