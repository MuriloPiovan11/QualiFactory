(()=>{
'use strict';
const $=i=>document.getElementById(i),cv=$('cv'),g=cv.getContext('2d'),W=960,H=540;
const BX0=24,BX1=790,BIN={x:822,y:150,w:126,h:200},MAXL=10,FONT='"Chakra Petch",sans-serif';
const TIPS=[
'5S: Seiri, Seiton, Seiso, Seiketsu e Shitsuke. Organização e disciplina sustentam a qualidade.',
'PDCA: Planejar, Fazer, Verificar e Agir. É o ciclo da melhoria contínua.',
'Poka-yoke: dispositivos à prova de erro impedem o defeito antes de ele acontecer.',
'Diagrama de Ishikawa: procure causas em Método, Máquina, Mão de obra, Material, Medida e Meio ambiente.',
'Pareto: cerca de 80% dos problemas vêm de 20% das causas. Ataque as principais.',
'ISO 9001: norma de gestão da qualidade focada no cliente e na melhoria contínua.',
'Kaizen: pequenas melhorias diárias, feitas por todos, geram grandes resultados.',
'Controle estatístico (CEP): gráficos de controle mostram desvios antes de virarem defeitos.',
'Rastreabilidade: saber lote, data e origem permite agir rápido em caso de recall.',
'Qualidade é prevenção: custa menos evitar o defeito do que corrigi-lo depois.'];
const DEF={
trinca:'Trinca no corpo: não conformidade visível. A inspeção na fonte evita que o defeito chegue ao cliente.',
incompleta:'Peça incompleta: defeito crítico. Segregue o item para não misturar com o lote bom.',
cor:'Cor fora do padrão: compare sempre com a amostra de referência da especificação.',
rotulo:'Sem etiqueta: falha de rastreabilidade. Todo lote precisa ser identificável.'};
const DK=Object.keys(DEF);
const DEFN={trinca:'Trinca',incompleta:'Peça incompleta',cor:'Cor fora do padrão',rotulo:'Sem etiqueta'};
const M6=['Método','Máquina','Mão de obra','Material','Medida','Meio ambiente'],S5=['Seiri','Seiton','Seiso','Seiketsu','Shitsuke'],PD=['Planejar','Fazer','Verificar','Agir'],MULT=[1,1.5,2,2.5,3,4];
/* Cada fase aplica um conceito do curso de Qualidade e muda esteira, pontuação ou tempo */
const RULES=[
{k:'5s',n:'5S',t:'Shitsuke (disciplina): acertos seguidos sobem o multiplicador pelos 5 S: Seiri x1,5, Seiton x2, Seiso x2,5, Seiketsu x3 e Shitsuke x4. Errar zera a sequência.'},
{k:'pdca',n:'PDCA',t:'O ciclo muda as regras a cada 12 s: Planejar (esteira lenta), Fazer (esteira rápida), Verificar (lupa automática, pontos x1,5) e Agir (pontos x2). Cada ciclo completo dá +4 s.'},
{k:'poka',n:'Poka-yoke',t:'O sensor do descarte recusa peça boa: não tira pontos, mas custa 3 s. Defeito vale 7 pontos e as esteiras andam 20% mais rápidas.',vm:1.2,ok:7},
{k:'ishi',n:'Ishikawa',t:'Os defeitos nascem de uma causa raiz (6M). Retire 5 defeitos da esteira marcada em vermelho para eliminá-la: +40 pontos e +5 s. Defeitos dela valem o dobro.'},
{k:'pareto',n:'Pareto',t:'80% dos defeitos são de um só tipo, a minoria vital. Ele vale 15 pontos e os demais, 5. O gráfico de Pareto aparece no final.'},
{k:'iso',n:'ISO 9001',t:'Foco no cliente: defeito expedido custa -12. A cada 40 s há auditoria: nenhum defeito expedido no período dá +40; 3 ou mais, -30.',esc:-12},
{k:'kaizen',n:'Kaizen',t:'Melhoria contínua: a cada 20 s chega uma pequena melhoria (operador mais rápido, recargas menores, alcance maior) e +3 s no relógio.'},
{k:'cep',n:'CEP',t:'Cada esteira tem um gráfico de controle. Quando a linha passa do limite vermelho, o processo desvia e surgem defeitos. Fique perto da esteira e aperte F para ajustar: +6 se o desvio já existe, -3 se o processo estava estável.'},
{k:'rastro',n:'Rastreabilidade',t:'Cada peça traz o lote da esteira de origem. No recall, todas as peças do lote chamado viram defeito por 14 s, mesmo as de aparência boa: retire (+12 e +2 s) ou perca -12.',esc:-12},
{k:'prev',n:'Prevenção',t:'Custo da falha: defeito expedido -25. Peça conforme expedida +1. O freio recarrega em 6 s, mas custa -3 pontos. Prevenir sai mais barato que corrigir.',esc:-25,ok:12,bad:-10,cdR:6}];
const rv=(n,d)=>S.r[n]!==undefined?S.r[n]:d,isBad=it=>it.bad||(S.rc&&it.lot===S.rc.lot),pdS=()=>S.r.k==='pdca'?Math.max(0,S.cyc)%4:-1;
/* Cada par de fases usa um cenário e um formato de esteiras diferente */
const LAYS=[
{n:'Galpão',ys:[130,230,330],h:28,d:[1,1,1],m:[1,1,1],floor:'#1c2733',tile:'#212e3c',wall:'#121a24',belt:'#2e3845',roll:'#3a4655'},
{n:'Doca de carga',ys:[118,205,292,379],h:26,d:[1,-1,1,-1],m:[1,1,1,1],floor:'#1b2b2c',tile:'#203334',wall:'#102021',belt:'#2b3d3e',roll:'#385052'},
{n:'Laboratório',ys:[130,230,330],h:28,d:[1,-1,1],m:[1,1.4,1],floor:'#1f2333',tile:'#262b40',wall:'#131627',belt:'#2d3250',roll:'#3b4266'},
{n:'Fábrica lotada',ys:[112,182,252,322,392],h:22,d:[1,-1,1,-1,1],m:[1,1,1,1,1],floor:'#2a2421',tile:'#322a26',wall:'#1b1614',belt:'#3b312b',roll:'#4b3e36'},
{n:'Linha crítica',ys:[112,182,252,322,392],h:22,d:[-1,1,-1,1,-1],m:[1,1.3,.8,1.5,1.1],floor:'#2a1b21',tile:'#33212a',wall:'#190f13',belt:'#40262d',roll:'#573540',alarm:1}];
const spd=L=>60+16*(L-1),gap=L=>Math.max(.9,3.5-.3*(L-1)),rate=L=>Math.min(.6,.3+.03*(L-1));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),fmt=t=>{t=Math.max(0,Math.ceil(t));return (t/60|0)+':'+String(t%60).padStart(2,'0')};
const keys={};let S,A,master,hum,humG,muted=false;

/* ---------- Progresso salvo ---------- */
const SKEY='linha_qualidade_v1';let SAVE={unlocked:1,best:{}};
try{Object.assign(SAVE,JSON.parse(localStorage.getItem(SKEY))||{})}catch(e){}
const save=()=>{try{localStorage.setItem(SKEY,JSON.stringify(SAVE))}catch(e){}};

/* ---------- Sons (Web Audio) ---------- */
function audio(){
  if(A){if(A.state==='suspended')A.resume();return}
  A=new (window.AudioContext||window.webkitAudioContext)();
  master=A.createGain();master.gain.value=muted?0:.5;master.connect(A.destination);
  hum=A.createOscillator();hum.type='sawtooth';hum.frequency.value=50;
  const f=A.createBiquadFilter();f.type='lowpass';f.frequency.value=160;
  humG=A.createGain();humG.gain.value=0;hum.connect(f);f.connect(humG);humG.connect(master);hum.start();
  music();
}
function tone(f,d,type='square',v=.14,to=null,when=0){
  if(!A||muted)return;const t=A.currentTime+when,o=A.createOscillator(),n=A.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);
  n.gain.setValueAtTime(v,t);n.gain.exponentialRampToValueAtTime(.001,t+d);
  o.connect(n);n.connect(master);o.start(t);o.stop(t+d+.02);
}
function hiss(d,v){
  if(!A||muted)return;const b=A.createBuffer(1,A.sampleRate*d,A.sampleRate),a=b.getChannelData(0);
  for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);
  const s=A.createBufferSource(),fl=A.createBiquadFilter(),n=A.createGain();
  fl.type='bandpass';fl.frequency.value=2500;n.gain.value=v;s.buffer=b;s.connect(fl);fl.connect(n);n.connect(master);s.start();
}
const SFX={
  grab:()=>tone(520,.08,'square',.12,800),
  put:()=>tone(400,.1,'triangle',.16,240),
  good:()=>{tone(660,.09,'square',.13);tone(990,.16,'square',.13,null,.08)},
  bad:()=>tone(170,.35,'sawtooth',.17,70),
  esc:()=>tone(230,.25,'sawtooth',.13,110),
  nope:()=>tone(130,.08,'square',.1),
  scan:()=>tone(300,.5,'sine',.2,1300),
  brake:()=>{hiss(.8,.25);tone(200,.5,'sawtooth',.08,40)},
  speed:()=>{tone(300,.12,'square',.12,600);tone(450,.15,'square',.12,900,.1)},
  tick:()=>tone(1000,.05,'square',.08),
  unlock:()=>[659,784,988,1318].forEach((f,i)=>tone(f,.12,'triangle',.14,null,i*.08)),
  start:()=>[392,523,659].forEach((f,i)=>tone(f,.15,'square',.12,null,i*.09)),
  win:()=>[523,659,784,1046].forEach((f,i)=>tone(f,.25,'square',.14,null,i*.12)),
  lose:()=>[392,330,262,196].forEach((f,i)=>tone(f,.3,'sawtooth',.14,null,i*.18))
};
const sfx=n=>SFX[n]&&SFX[n]();
const BASS=[0,0,3,0,5,3,2,-2],ARP=[12,15,19,15];
function music(){let i=0;(function step(){
  if(S&&S.mode==='play'&&!muted){
    tone(55*2**(BASS[i%8]/12),.2,'triangle',.17);
    if(i%2)tone(220*2**(ARP[(i>>1)%4]/12),.1,'square',.04);
  }
  i++;setTimeout(step,30000/(110+(S?S.L:1)*7));
})()}

/* ---------- Cenário (desenhado uma vez por fase) ---------- */
function hazard(c,x,y,w,h){
  c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.fillStyle='#f2b705';c.fillRect(x,y,w,h);c.fillStyle='#14191f';
  for(let i=-h;i<w+h;i+=24){c.beginPath();c.moveTo(x+i,y+h);c.lineTo(x+i+12,y+h);c.lineTo(x+i+12+h,y);c.lineTo(x+i+h,y);c.fill()}
  c.restore();
}
function rr(c,x,y,w,h,r,f){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);if(f){c.fillStyle=f;c.fill()}c.stroke()}
function crate(c,x,y,s){
  c.fillStyle='rgba(0,0,0,.3)';c.fillRect(x+4,y+s-3,s,8);
  c.fillStyle='#8a6137';c.fillRect(x,y,s,s);c.strokeStyle='#5b3f23';c.lineWidth=3;c.strokeRect(x+1.5,y+1.5,s-3,s-3);
  c.lineWidth=2;c.beginPath();c.moveTo(x,y+s/2);c.lineTo(x+s,y+s/2);c.moveTo(x+4,y+4);c.lineTo(x+s-4,y+s-4);c.stroke();
  c.fillStyle='rgba(255,255,255,.1)';c.fillRect(x+3,y+3,s-6,4);
}
function buildBG(L,ly){
  const b=document.createElement('canvas');b.width=W;b.height=H;const c=b.getContext('2d');
  c.fillStyle=ly.floor;c.fillRect(0,0,W,H);c.fillStyle=ly.tile;
  for(let j=0;j<10;j++)for(let i=0;i<20;i++)if((i+j)%2===0)c.fillRect(i*48,64+j*48,48,48);
  let gr=c.createLinearGradient(0,64,W,H);gr.addColorStop(0,'rgba(255,255,255,.06)');gr.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gr;c.fillRect(0,64,W,H);
  c.strokeStyle='rgba(242,183,5,.45)';c.lineWidth=3;c.setLineDash([18,12]);c.beginPath();c.moveTo(0,H-10);c.lineTo(W,H-10);c.stroke();c.setLineDash([]);
  /* parede */
  gr=c.createLinearGradient(0,0,0,58);gr.addColorStop(0,ly.wall);gr.addColorStop(1,'rgba(255,255,255,.08)');c.fillStyle=ly.wall;c.fillRect(0,0,W,58);c.fillStyle=gr;c.fillRect(0,0,W,58);
  c.strokeStyle='rgba(255,255,255,.06)';c.lineWidth=1;c.beginPath();for(let x=0;x<W;x+=80){c.moveTo(x,0);c.lineTo(x,58)}c.stroke();
  for(const x of [30,260,500]){
    const wg=c.createLinearGradient(0,8,0,42);wg.addColorStop(0,'#35597f');wg.addColorStop(1,'#0f1b2a');
    c.fillStyle=wg;c.fillRect(x,8,100,34);c.strokeStyle='#5b6b7d';c.lineWidth=3;c.strokeRect(x,8,100,34);
    c.beginPath();c.moveTo(x+50,8);c.lineTo(x+50,42);c.moveTo(x,25);c.lineTo(x+100,25);c.stroke();
  }
  c.strokeStyle='#4a5666';c.lineWidth=5;c.beginPath();c.moveTo(0,50);c.lineTo(W,50);c.stroke();
  c.fillStyle='#6b7a8b';for(let x=60;x<W;x+=130)c.fillRect(x,46,6,8);
  c.lineWidth=1.5;c.strokeStyle='#1b232d';
  rr(c,150,9,76,40,3,'#e8edf2');c.fillStyle='#d6212e';c.fillRect(150,9,76,10);
  c.fillStyle='#fff';c.font=`700 8px ${FONT}`;c.textAlign='center';c.fillText('Qualidade',188,17);
  c.fillStyle='#14191f';c.font=`700 20px ${FONT}`;c.fillText('5S',188,38);c.font=`500 6px ${FONT}`;c.fillText('Organizar e limpar',188,46);
  rr(c,390,9,76,40,3,'#e8edf2');
  [['P','#3d8fd1'],['D','#2fbf8a'],['C','#f2b705'],['A','#d6212e']].forEach(([t,k],i)=>{const x=396+(i%2)*34,y=13+(i>>1)*17;c.fillStyle=k;c.fillRect(x,y,30,15);c.fillStyle='#fff';c.font=`700 12px ${FONT}`;c.fillText(t,x+15,y+12)});
  rr(c,630,9,76,40,3,'#e8edf2');c.fillStyle='#14191f';c.font=`700 7px ${FONT}`;c.fillText('Pareto',668,19);
  [26,18,12,8,5].forEach((h,i)=>{c.fillStyle='#3d8fd1';c.fillRect(638+i*12,46-h,9,h)});
  rr(c,745,8,200,42,6,'#0b0f14');c.fillStyle='#f2b705';c.textAlign='left';c.font=`700 18px ${FONT}`;c.fillText('Fase '+L,758,28);
  c.fillStyle='#9fb3c4';c.font=`500 12px ${FONT}`;c.fillText(ly.n+' · '+ly.ys.length+' esteiras',758,43);
  hazard(c,0,58,W,6);
  /* esteiras */
  const lanes=ly.ys;
  lanes.forEach((y,i)=>{
    const d=ly.d[i],h=ly.h;
    c.fillStyle='rgba(0,0,0,.28)';c.fillRect(BX0,y+h+6,BX1-BX0,9);
    c.fillStyle='#232b35';for(let x=BX0+50;x<BX1;x+=170)c.fillRect(x,y+h+6,10,12);
    c.fillStyle=ly.belt;c.fillRect(BX0,y-h,BX1-BX0,2*h);
    hazard(c,BX0,y-h-6,BX1-BX0,6);hazard(c,BX0,y+h,BX1-BX0,6);
    const cx=d>0?BX1:0,hx=d>0?0:BX1;
    c.fillStyle='#1f7a5c';c.fillRect(cx,y-h-6,24,2*h+12);c.strokeStyle='#2fbf8a';c.lineWidth=2;c.strokeRect(cx+1,y-h-5,22,2*h+10);
    c.fillStyle='#d9fff0';c.beginPath();c.moveTo(cx+12+d*6,y);c.lineTo(cx+12-d*5,y-8);c.lineTo(cx+12-d*5,y+8);c.fill();
    c.fillStyle='#39414d';c.fillRect(hx,y-h-6,24,2*h+12);c.fillStyle='#f2b705';c.fillRect(hx,y-h-6,24,5);c.fillRect(hx,y+h+1,24,5);
    c.fillStyle='#14191f';c.fillRect(hx+(d>0?6:0),y-h+6,18,2*h-12);
  });
  /* lixeira de descarte */
  c.fillStyle='rgba(0,0,0,.3)';c.fillRect(BIN.x+6,BIN.y+BIN.h-4,BIN.w,12);
  c.fillStyle='#a31f28';c.fillRect(BIN.x,BIN.y+12,BIN.w,BIN.h-12);c.fillStyle='rgba(255,255,255,.1)';c.fillRect(BIN.x+8,BIN.y+16,10,BIN.h-24);
  hazard(c,BIN.x-4,BIN.y,BIN.w+8,10);
  c.fillStyle='#1c0709';c.fillRect(BIN.x+12,BIN.y+26,BIN.w-24,56);
  c.fillStyle='#fff';c.textAlign='center';c.font=`700 17px ${FONT}`;c.fillText('Descarte',BIN.x+BIN.w/2,BIN.y+130);
  c.font=`500 11px ${FONT}`;c.fillStyle='#ffd6d9';c.fillText('só defeituosos',BIN.x+BIN.w/2,BIN.y+150);
  /* decoração (sem função) */
  crate(c,40,470,46);crate(c,92,470,46);crate(c,66,424,46);
  c.fillStyle='rgba(0,0,0,.3)';c.fillRect(180,505,34,6);c.fillStyle='#2b6cb0';c.fillRect(178,462,34,46);c.fillStyle='#1d4f86';c.fillRect(178,470,34,4);c.fillRect(178,496,34,4);c.fillStyle='#f2b705';c.fillRect(190,480,10,10);
  c.fillStyle='#8a6137';c.fillRect(260,494,80,10);c.fillRect(260,510,80,6);c.fillStyle='#d8c39a';c.fillRect(268,462,30,32);c.fillRect(302,472,30,22);
  c.fillStyle='#d6212e';c.fillRect(402,458,16,46);c.fillStyle='#14191f';c.fillRect(406,452,8,6);c.fillStyle='#fff';c.fillRect(404,470,12,12);
  c.fillStyle='#7a5632';c.fillRect(520,470,180,10);c.fillRect(526,480,8,34);c.fillRect(686,480,8,34);
  c.fillStyle='#3d8fd1';c.fillRect(560,452,38,18);c.fillStyle='#14191f';c.fillRect(574,446,10,6);c.fillStyle='#9aa7b4';c.fillRect(630,458,8,12);c.fillRect(650,462,26,6);
  for(const x of [770,830]){c.fillStyle='#e8661c';c.beginPath();c.moveTo(x,462);c.lineTo(x+10,500);c.lineTo(x-10,500);c.fill();c.fillStyle='#fff';c.fillRect(x-6,480,12,5);c.fillStyle='#14191f';c.fillRect(x-13,500,26,5)}
  /* luz e vinheta */
  for(const [x,y] of [[240,230],[560,300],[780,230]]){const r=c.createRadialGradient(x,y,0,x,y,220);r.addColorStop(0,'rgba(255,240,200,.1)');r.addColorStop(1,'rgba(255,240,200,0)');c.fillStyle=r;c.fillRect(0,0,W,H)}
  const v=c.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,H*.95);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.4)');c.fillStyle=v;c.fillRect(0,0,W,H);
  return b;
}

/* ---------- Estado ---------- */
function reset(L){
  const ly=LAYS[Math.min(4,(L-1)>>1)],T=90,ez=L>=3?.385:1;
  S={mode:'menu',L,lay:ly,time:T,total:T,step:0,score:0,ez,bz:L>=3?.525:1,goal:Math.round((200+60*(L-1))*ez),items:[],fx:[],seen:{},
    lanes:ly.ys.map((y,i)=>({y,d:ly.d[i],m:ly.m[i],h:ly.h})),sp:ly.ys.map((_,i)=>.5+i*.8),bg:buildBG(L,ly),
    off:0,lupa:0,cdQ:0,cdR:0,stop:0,ok:0,wrong:0,esc:0,sg:0,lastSec:99,
    p:{x:420,y:430,carry:null,dir:'f',step:0,mv:0,walk:0}};
  Object.assign(S,{r:RULES[L-1],el:0,streak:0,cyc:-1,kz:0,pspd:1,cdm:1,reach:64,root:-1,rootN:0,rootT:2,aud:40,audE:0,rc:null,rcT:30,cnt:{},cdF:0,vital:DK[Math.random()*4|0]});
  S.tags=['ishi','cep','rastro'].includes(S.r.k);S.lanes.forEach(l=>{l.pv=.05;l.hist=[.05]});
}
const inBin=p=>p.x>BIN.x-30&&p.y>BIN.y-30&&p.y<BIN.y+BIN.h+30;
let tt;function toast(t){const e=$('toast');e.textContent=t;e.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('show'),4500)}
function fx(x,y,txt,c){S.fx.push({x,y,t:1,txt,c})}
function sparks(x,y,c){for(let i=0;i<12;i++){const a=Math.random()*6.28,s=60+Math.random()*120;S.fx.push({x,y,t:1,vx:Math.cos(a)*s,vy:Math.sin(a)*s-40,c})}}
function nearLane(p){let bi=-1,bd=1e9;S.lanes.forEach((l,i)=>{const d=Math.abs(p.y-l.y);if(d<l.h+16&&d<bd){bd=d;bi=i}});return bi}

function act(){
  const s=S,p=s.p;
  if(!p.carry){
    let best=null,bd=s.reach;
    for(const it of s.items){if(it.held)continue;const d=Math.hypot(it.x-p.x,it.y-p.y);if(d<bd){bd=d;best=it}}
    if(best){best.held=true;p.carry=best;sfx('grab')}else sfx('nope');
  }else if(inBin(p)){
    discard();
  }else{
    const i=nearLane(p);
    if(i>=0&&p.x>BX0&&p.x<BX1-10){const it=p.carry;it.held=false;it.x=p.x;it.y=s.lanes[i].y;it.lane=i;p.carry=null;sfx('put')}
    else{sfx('nope');toast('Leve o defeito até o descarte ou solte a peça sobre uma esteira.')}
  }
}

function pick(i){
  const s=S,k=s.r.k;let r=rate(s.L);
  if(k==='ishi')r=s.root===i?.65:.1;else if(k==='cep')r=.06+.6*s.lanes[i].pv;
  if(Math.random()>=r)return null;
  if(k==='pareto'&&Math.random()<.8)return s.vital;
  return DK[Math.random()*4|0];
}
function discard(){
  const s=S,p=s.p,it=p.carry,k=s.r.k,bad=isBad(it);
  if(!bad&&k==='poka'){s.time-=3;sfx('nope');fx(p.x,p.y-80,'-3 s','#f2b705');toast('Poka-yoke: o sensor recusou a peça boa e ela ficou com você. Custo: 3 s.');return}
  p.carry=null;s.items.splice(s.items.indexOf(it),1);
  if(bad){
    let pts=rv('ok',10);
    if(k==='5s'){pts*=MULT[Math.min(5,s.streak/3|0)];s.streak++;if(s.streak%3===0&&s.streak<=15)toast(S5[s.streak/3-1]+': multiplicador x'+MULT[s.streak/3]+'. Mantenha a disciplina!')}
    else if(k==='pdca')pts*=[1,1,1.5,2][pdS()];
    else if(k==='pareto')pts=it.bad===s.vital?15:5;
    else if(k==='rastro'&&!it.bad){pts=12;s.time+=2}
    else if(k==='ishi'&&it.bad&&it.src===s.root){pts*=2;if(++s.rootN>=5){s.score+=40;s.time+=5;s.root=-1;s.rootT=15;toast('Causa raiz eliminada ('+M6[it.src]+'): +40 pontos e +5 s. Ação corretiva na origem!');sfx('unlock')}}
    pts=Math.round(pts);s.score+=pts;s.ok++;
    if(it.bad)s.cnt[it.bad]=(s.cnt[it.bad]||0)+1;
    sfx('good');fx(p.x,p.y-80,'+'+pts,'#5be0a8');sparks(BIN.x+BIN.w/2,BIN.y+50,'#5be0a8');
    if(it.bad&&!s.seen[it.bad]){s.seen[it.bad]=1;toast(DEF[it.bad])}
  }else{
    const w=Math.round(rv('bad',-5)*s.ez);s.score+=w;s.wrong++;s.streak=0;sfx('bad');fx(p.x,p.y-80,''+w,'#ff5a5a');sparks(BIN.x+BIN.w/2,BIN.y+50,'#ff5a5a');
    toast('Peça boa descartada: isso é desperdício. Confirme o defeito antes de descartar.');
  }
}
function adjust(){
  const s=S,i=nearLane(s.p);
  if(i<0){sfx('nope');toast('Fique perto de uma esteira para ajustá-la.');return}
  const l=s.lanes[i];s.cdF=3;
  if(l.pv>=.35){s.score+=6;l.pv=.05;fx(s.p.x,s.p.y-80,'+6','#5be0a8');sfx('good');toast('Ajuste preventivo: o processo voltou ao centro antes de gerar mais defeitos.')}
  else{s.score-=3;fx(s.p.x,s.p.y-80,'-3','#ff5a5a');sfx('bad');toast('Processo estável: ajustar sem necessidade aumenta a variação.')}
}
function rules(dt){
  const s=S,k=s.r.k;
  if(k==='pdca'){const c=Math.floor(s.el/12);if(c!==s.cyc){if(c>0&&c%4===0){s.time+=4;toast('Ciclo PDCA completo: melhoria contínua, +4 s.')}else toast(['Planejar: esteira lenta, hora de se organizar.','Fazer: esteira rápida, execute o plano.','Verificar: lupa automática e pontos x1,5.','Agir: corrija e padronize, pontos x2.'][c%4]);s.cyc=c}}
  else if(k==='kaizen'&&Math.floor(s.el/20)>s.kz){s.kz++;const m=s.kz%3;s.time+=3;
    if(m===1){s.pspd*=1.1;toast('Kaizen: operador 10% mais rápido. +3 s')}else if(m===2){s.cdm*=.85;toast('Kaizen: recargas 15% menores. +3 s')}else{s.reach+=10;toast('Kaizen: alcance para pegar peças maior. +3 s')}}
  else if(k==='iso'){s.aud-=dt;if(s.aud<=0){s.aud=40;const e=s.audE;s.audE=0;
    if(e===0){s.score+=40;fx(480,120,'Auditoria: +40','#5be0a8');toast('Auditoria aprovada: nenhum defeito chegou ao cliente.');sfx('unlock')}
    else if(e>=3){s.score-=30;fx(480,120,'Auditoria: -30','#ff5a5a');toast('Auditoria reprovada: '+e+' defeitos chegaram ao cliente.');sfx('bad')}
    else toast('Auditoria: conformidade parcial ('+e+' defeito expedido).')}}
  else if(k==='ishi'&&s.root<0){s.rootT-=dt;if(s.rootT<=0){s.root=Math.random()*s.lanes.length|0;s.rootN=0;toast('Nova causa raiz: '+M6[s.root]+'. Retire os defeitos dessa esteira para eliminá-la.')}}
  else if(k==='cep')s.lanes.forEach(l=>{l.pv=clamp(l.pv+dt*.013+(Math.random()-.5)*dt*.4,0,1);l.ht=(l.ht||0)+dt;if(l.ht>1.2){l.ht=0;l.hist.push(l.pv);if(l.hist.length>24)l.hist.shift()}});
  else if(k==='rastro'){
    if(s.rc){s.rc.t-=dt;if(s.rc.t<=0){s.rc=null;toast('Recall encerrado.')}}
    else{s.rcT-=dt;if(s.rcT<=0){s.rcT=30;s.rc={lot:1+Math.random()*s.lanes.length|0,t:14};toast('RECALL do lote L'+s.rc.lot+': retire TODAS as peças desse lote, mesmo as de aparência boa!');sfx('esc')}}}
}
function update(dt){
  const s=S,L=s.L,p=s.p;
  s.time-=dt;s.el+=dt;rules(dt);
  for(const k of ['lupa','cdQ','cdR','stop','cdF'])s[k]=Math.max(0,s[k]-dt);
  const sec=Math.ceil(s.time);if(sec<=10&&sec>0&&sec!==s.lastSec)sfx('tick');s.lastSec=sec;
  const st=Math.floor(s.el/30);
  if(st>s.step&&s.time>0){s.step=st;sfx('speed');toast('As esteiras ficaram 15% mais rápidas!')}
  const v=s.stop>0?0:spd(L)*s.bz*Math.pow(1.15,s.step)*rv('vm',1)*(pdS()>=0?[.6,1.2,1,1][pdS()]:1);s.off+=v*dt;
  s.lanes.forEach((l,i)=>{
    if(s.time<3)return;s.sp[i]-=dt;
    if(s.sp[i]<=0){s.sp[i]=gap(L)*s.lanes.length/3*(.8+Math.random()*.5);
      s.items.push({x:l.d>0?BX0+4:BX1-4,y:l.y,lane:i,src:i,lot:i+1,held:false,bad:pick(i)})}
  });
  for(const it of s.items){
    if(it.held)continue;const l=s.lanes[it.lane];it.x+=v*l.m*l.d*dt;
    if(l.d>0?it.x>BX1+6:it.x<BX0-6){it.gone=1;if(isBad(it)){const e=Math.round(rv('esc',-8)*s.ez);s.score+=e;s.esc++;s.audE++;if(it.bad)s.cnt[it.bad]=(s.cnt[it.bad]||0)+1;fx(l.d>0?BX1-40:BX0+40,it.y-30,''+e,'#ff5a5a');sfx('esc')}else{s.sg++;if(s.r.k==='prev')s.score++}}
  }
  s.items=s.items.filter(i=>!i.gone);
  const dx=(keys.d?1:0)-(keys.a?1:0),dy=(keys.s?1:0)-(keys.w?1:0);
  p.mv=dx||dy?1:0;p.walk+=(p.mv-p.walk)*Math.min(1,dt*10);p.step+=dt*13*p.walk;
  if(p.mv){const m=Math.hypot(dx,dy);p.x+=dx/m*310*s.pspd*dt;p.y+=dy/m*310*s.pspd*dt;if(dx)p.dir=dx>0?'r':'l';else p.dir=dy>0?'f':'b'}
  p.x=clamp(p.x,22,W-22);p.y=clamp(p.y,86,H-34);
  for(const f of s.fx){f.t-=dt*(f.txt?1:1.6);if(f.txt)f.y-=40*dt;else{f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=300*dt}}
  s.fx=s.fx.filter(f=>f.t>0);
  if(s.time<=0)finish();
}

/* ---------- Telas ---------- */
function show(h,btn,cb,btn2,cb2){
  const o=$('overlay');
  $('card').innerHTML=h+`<div class="row">${btn?`<button class="btn" id="go">${btn}</button>`:''}${btn2?`<button class="btn alt" id="go2">${btn2}</button>`:''}</div>`;
  o.hidden=false;const b=$('go'),b2=$('go2');
  if(b){b.onclick=()=>{o.hidden=true;audio();cb()};b.focus()}
  if(b2)b2.onclick=()=>{o.hidden=true;audio();cb2()};
}
function title(){
  reset(1);
  show(`<h1>Linha de Qualidade</h1><p>Você é estudante do SENAI na inspeção da fábrica. Pegue as peças com defeito e leve ao descarte. Peças boas devem seguir pela esteira até a expedição.</p>
  <div class="keys"><span><kbd>W A S D</kbd> ou setas</span><span>Mover</span><span><kbd>E</kbd></span><span>Pegar a peça mais próxima, descartar ou soltar na esteira</span><span><kbd>Q</kbd></span><span>Lupa: destaca defeitos por 3 s (recarga 8 s)</span><span><kbd>R</kbd></span><span>Freio: para as esteiras por 3 s (recarga 20 s)</span><span><kbd>P</kbd> / <kbd>M</kbd></span><span>Pausar / ligar e desligar o som</span></div>
  <p>Defeito descartado: +10. Peça boa descartada: -5. Defeito expedido: -8. A cada 30 segundos, as esteiras ficam 15% mais rápidas. Cada fase aplica um conceito do curso de Qualidade que muda a esteira, a pontuação ou o tempo.</p>`,'Escolher fase',hub);
}
function hub(){
  reset(SAVE.unlocked);
  let b='';
  for(let L=1;L<=MAXL;L++){
    const ok=L<=SAVE.unlocked,bs=SAVE.best[L];
    b+=`<button class="lv${ok?'':' lock'}" data-l="${L}"${ok?'':' disabled'}><b>${L}</b><small>${ok?(bs!=null?'Melhor: '+bs:'Nova'):'Bloqueada'}</small></button>`;
  }
  show(`<h1>Escolha a fase</h1><p>Vença uma fase para liberar a próxima. Cada par de fases muda o cenário e o formato das esteiras.</p><div class="grid">${b}</div>`,null,null,'Apagar progresso',()=>{if(confirm('Apagar todo o progresso?')){SAVE={unlocked:1,best:{}};save()}hub()});
  document.querySelectorAll('.lv').forEach(e=>e.onclick=()=>{$('overlay').hidden=true;audio();intro(+e.dataset.l)});
  const f=document.querySelector(`.lv[data-l="${SAVE.unlocked}"]`);if(f)f.focus();
}
function intro(L){
  reset(L);
  show(`<h1>Fase ${L}: ${S.r.n}</h1><p class="tip">${S.r.t}${S.r.k==='pareto'?' Minoria vital desta rodada: <b>'+DEFN[S.vital]+'</b>.':''}</p><p>Cenário: <b>${S.lay.n}</b>, com ${S.lanes.length} esteiras.${S.lay.m.some(m=>m!==1)?' Algumas esteiras têm velocidade diferente das outras.':''}</p><p>Meta: <b>${S.goal} pontos</b> em <b>${fmt(S.time)}</b>.${L===MAXL?' Esta é a última fase e é quase impossível. Boa sorte!':''}</p>`,
    'Iniciar',()=>{S.mode='play';sfx('start')},'Fases',hub);
}
function finish(){
  const s=S,win=s.score>=s.goal,q=s.sg+s.esc?Math.round(100*s.sg/(s.sg+s.esc)):100;
  s.mode='end';sfx(win?'win':'lose');
  let extra='';
  if(win){
    if(SAVE.best[s.L]==null||s.score>SAVE.best[s.L])SAVE.best[s.L]=s.score;
    if(s.L<MAXL&&SAVE.unlocked<s.L+1){SAVE.unlocked=s.L+1;extra=`<p><b>Fase ${s.L+1} desbloqueada!</b></p>`;setTimeout(()=>sfx('unlock'),900)}
    save();
  }
  if(s.r.k==='pareto'){const ps=Object.entries(s.cnt).sort((a,b)=>b[1]-a[1]),mx=ps.length?ps[0][1]:1;if(ps.length)extra+='<p><b>Gráfico de Pareto</b>'+ps.map(([n,c])=>`<br>${DEFN[n]} <span style="display:inline-block;height:10px;width:${Math.round(150*c/mx)}px;background:#3d8fd1"></span> ${c}`).join('')+'</p>'}
  const st=`<p>Pontos: <b>${s.score}</b> de ${s.goal}<br>Defeitos retirados: ${s.ok}. Boas descartadas: ${s.wrong}. Defeitos expedidos: ${s.esc}.<br>Qualidade expedida: ${q}%</p>${extra}<p class="tip"><b>Dica de Qualidade.</b> ${TIPS[s.L-1]}</p>`;
  if(win&&s.L===MAXL)show(`<h1>Mestre da Qualidade!</h1><p>Você zerou a linha.</p>`+st,'Fases',hub);
  else if(win)show(`<h1>Fase ${s.L} concluída</h1>`+st,'Próxima fase',()=>intro(s.L+1),'Fases',hub);
  else show(`<h1>Meta não atingida</h1>`+st,'Tentar de novo',()=>intro(s.L),'Fases',hub);
}
function pause(){S.mode='pause';show('<h1>Pausado</h1>','Continuar',()=>{S.mode='play'},'Sair para as fases',hub)}

/* ---------- Desenho ---------- */
function item(it,x,y){
  const b=it.bad;g.save();g.translate(x,y);
  g.fillStyle='rgba(0,0,0,.3)';g.fillRect(-13,13,30,5);
  g.fillStyle=b==='cor'?'#3fc0a8':'#3d8fd1';g.fillRect(-15,-15,30,30);
  g.fillStyle='rgba(255,255,255,.18)';g.fillRect(-15,-15,30,5);
  g.strokeStyle='#1b4e7a';g.lineWidth=2;g.strokeRect(-15,-15,30,30);
  if(b!=='rotulo'){g.fillStyle='#fff';g.fillRect(-9,-4,18,10);g.fillStyle='#9fb3c4';g.fillRect(-7,-1,10,2);g.fillRect(-7,2,6,2)}
  g.fillStyle='#1b4e7a';g.beginPath();g.arc(0,-9,2.5,0,7);g.fill();
  if(b==='trinca'){g.strokeStyle='#0c1a26';g.beginPath();g.moveTo(-6,-15);g.lineTo(0,-6);g.lineTo(-5,0);g.lineTo(3,8);g.lineTo(-1,15);g.stroke()}
  if(b==='incompleta'){g.fillStyle=S.lay.belt;g.beginPath();g.moveTo(16,-16);g.lineTo(16,-2);g.lineTo(2,-16);g.fill()}
  if(S.r.k==='rastro'){
    if(b!=='rotulo'){g.fillStyle='#fff';g.fillRect(-9,-4,18,10);g.fillStyle='#14191f';g.font=`700 9px ${FONT}`;g.textAlign='center';g.fillText('L'+it.lot,0,4.5)}
    if(S.rc&&it.lot===S.rc.lot){g.strokeStyle='#ff8a1c';g.lineWidth=3;g.strokeRect(-18,-18,36,36)}
  }
  g.restore();
}
/* Estudante do SENAI: 4 direções (frente, costas, esquerda, direita) com animação de caminhada */
const SKIN='#f0c49b',SKIN2='#d9a47c',RED='#d6212e',RED2='#a8161f',WH='#f6f6f6',JE='#2f5aa8',JE2='#233f78',HAIR='#3a2616',O='#10151b';
function limb(x1,y1,x2,y2,w,c){g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()}
function arm(sx,sy,hx,hy,cs=RED,ck=SKIN){
  const mx=sx+(hx-sx)*.38,my=sy+(hy-sy)*.38;
  limb(sx,sy,hx,hy,9.5,O);limb(sx,sy,mx,my,7,cs);limb(mx,my,hx,hy,5.5,ck);
  g.fillStyle=ck;g.strokeStyle=O;g.lineWidth=1.8;g.beginPath();g.arc(hx,hy,4,0,7);g.fill();g.stroke();
}
function eye(x,y,rx,ry,lx){
  g.lineWidth=1.2;g.strokeStyle=O;g.fillStyle='#fff';g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill();g.stroke();
  g.fillStyle='#1b1b1b';g.beginPath();g.arc(x+lx,y+.5,1.5,0,7);g.fill();
}
function headF(){
  g.lineWidth=1.8;g.strokeStyle=O;rr(g,-4,-23,8,6,2,SKIN);
  g.fillStyle=SKIN;g.beginPath();g.arc(-10.5,-30,3,0,7);g.arc(10.5,-30,3,0,7);g.fill();g.stroke();
  g.beginPath();g.arc(0,-30,10.5,0,7);g.fill();g.stroke();
  g.fillStyle=HAIR;g.beginPath();g.moveTo(-11,-31);g.quadraticCurveTo(-12,-45,0,-44);g.quadraticCurveTo(12,-45,11,-31);g.quadraticCurveTo(6,-37,0,-36);g.quadraticCurveTo(-6,-37,-11,-31);g.fill();g.stroke();
  eye(-4,-29,2.6,3,0);eye(4,-29,2.6,3,0);
  g.lineWidth=1.2;g.beginPath();g.moveTo(-7,-34);g.lineTo(-2,-33.5);g.moveTo(2,-33.5);g.lineTo(7,-34);g.moveTo(-3,-24);g.quadraticCurveTo(0,-21.5,3,-24);g.stroke();
  g.fillStyle='rgba(255,90,90,.25)';g.beginPath();g.arc(-7,-25,2.2,0,7);g.arc(7,-25,2.2,0,7);g.fill();
}
function headB(){
  g.lineWidth=1.8;g.strokeStyle=O;rr(g,-4,-23,8,6,2,SKIN);
  g.fillStyle=SKIN;g.beginPath();g.arc(-10.5,-30,3,0,7);g.arc(10.5,-30,3,0,7);g.fill();g.stroke();
  g.beginPath();g.arc(0,-30,10.5,0,7);g.fill();g.stroke();
  g.fillStyle=HAIR;g.beginPath();g.ellipse(0,-32,11.3,11.8,0,0,7);g.fill();g.stroke();
  g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=1.5;g.beginPath();g.arc(0,-33,7,Math.PI*1.1,Math.PI*1.7);g.stroke();
}
function headS(){
  g.lineWidth=1.8;g.strokeStyle=O;rr(g,-4,-23,8,6,2,SKIN);
  g.fillStyle=SKIN;g.beginPath();g.arc(0,-30,10.5,0,7);g.fill();g.stroke();
  g.beginPath();g.arc(10.6,-27,2.2,0,7);g.fill();g.stroke();
  g.fillStyle=HAIR;g.beginPath();g.ellipse(-5,-32,7.5,10.5,0,0,7);g.fill();
  g.beginPath();g.moveTo(-10.8,-28);g.quadraticCurveTo(-13,-45,1,-44);g.quadraticCurveTo(11,-43,10.5,-34);g.quadraticCurveTo(5,-37,0,-35.5);g.lineTo(-3,-27);g.closePath();g.fill();g.stroke();
  g.fillStyle=SKIN2;g.beginPath();g.arc(-2,-28.5,3,0,7);g.fill();g.stroke();
  eye(5,-29,2.4,3,1);
  g.lineWidth=1.2;g.beginPath();g.moveTo(2,-34);g.lineTo(8,-34.4);g.moveTo(6,-23.5);g.lineTo(9,-23.8);g.stroke();
  g.fillStyle='rgba(255,90,90,.25)';g.beginPath();g.arc(5.5,-25.5,2.2,0,7);g.fill();
}
function bodyFB(back,ph,w,c){
  g.lineWidth=1.8;g.strokeStyle=O;
  const sw=Math.sin(ph)*5*w;
  for(const s of [-1,1].sort((a,b)=>a*sw-b*sw)){ /* a perna mais à frente é desenhada por último */
    const o=s*sw,x=s<0?-10:0,lift=Math.max(0,s*Math.cos(ph))*3.5*w;
    g.strokeStyle=O;g.lineWidth=1.8;rr(g,x,7,10,18+o-lift*.5,4,JE);
    g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=1;g.beginPath();g.moveTo(x+5,12);g.lineTo(x+5,22+o-lift*.5);g.stroke();
    g.strokeStyle=O;g.lineWidth=1.8;rr(g,x-.5,23+o-lift,11,9,4.5,WH);
    g.fillStyle='#14191f';g.fillRect(x,30.2+o-lift,10,2.2);g.fillStyle=RED;g.fillRect(x+1.5,26.5+o-lift,7,1.8);
  }
  rr(g,-12,-6,24,17,5,WH);g.fillStyle='rgba(0,0,0,.08)';g.fillRect(6,-4,5,13);
  rr(g,-12,-21,24,17,6,RED);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(6,-19,5,13);
  if(!back){
    g.fillStyle=WH;g.beginPath();g.moveTo(-5,-21);g.lineTo(5,-21);g.lineTo(0,-13);g.closePath();g.fill();g.stroke();
    g.strokeStyle='#fff';g.lineWidth=1;g.beginPath();g.moveTo(-4,-19);g.lineTo(3,-9);g.moveTo(4,-19);g.lineTo(3,-9);g.stroke();
    g.strokeStyle=O;g.lineWidth=1.8;rr(g,0,-9,7,9,1.5,'#fff');g.fillStyle='#1b6bd1';g.fillRect(1,-8,5,3);
  }
  for(const s of [-1,1]){
    if(c)arm(s*14,-16,s*15,-46);
    else arm(s*15,-15,s*17,2-s*sw*.5);
  }
  back?headB():headF();
}
function bodyS(ph,w,c){
  const leg=(a,lift,jc,sc)=>{
    const fx=a*10,fy=25-lift,ax=fx*.9,ay=fy-4,kx=ax*.5+lift*.9,ky=(9+ay)/2-lift*.5; /* joelho */
    for(const [lw,lc] of [[11,O],[8.2,jc]]){limb(0,9,kx,ky,lw,lc);limb(kx,ky,ax,ay,lw,lc)}
    g.lineWidth=1.8;g.strokeStyle=O;rr(g,fx-5.5,fy-3,16,9,4.5,sc);
    g.fillStyle='#14191f';g.fillRect(fx-5,fy+3.6,15,2.2);g.fillStyle=RED;g.fillRect(fx-1.5,fy,10,1.8);
  };
  const sn=Math.sin(ph),cs=Math.cos(ph),a1=sn*w+.3*(1-w),a2=-sn*w-.3*(1-w),l1=Math.max(0,cs)*3.5*w,l2=Math.max(0,-cs)*3.5*w,o=sn*8*w;
  leg(a2,l2,JE2,'#d3d9df');
  if(c)arm(-2,-15,-6,-46,RED2,SKIN2);else arm(0,-15,o*.9,1,RED2,SKIN2);
  leg(a1,l1,JE,WH);
  g.lineWidth=1.8;g.strokeStyle=O;
  rr(g,-8.5,-6,17,17,5,WH);rr(g,-8.5,-21,17,17,6,RED);g.fillStyle='rgba(0,0,0,.14)';g.fillRect(-7,-19,4,13);
  headS();
  if(c)arm(3,-15,7,-46);else arm(0,-15,-o*.9,1);
}
function person(p){
  const t=performance.now()/1000,w=p.walk,d=p.dir,c=!!p.carry,bob=-Math.abs(Math.sin(p.step))*2.2*w+Math.sin(t*2.2)*.8*(1-w);
  g.save();g.translate(p.x,p.y);
  g.fillStyle='rgba(0,0,0,.32)';g.beginPath();g.ellipse(0,33,18-Math.abs(bob)*.4,6,0,0,7);g.fill();
  g.translate(0,bob);g.lineJoin='round';g.lineCap='round';
  if(d==='l'||d==='r'){g.save();if(d==='l')g.scale(-1,1);bodyS(p.step,w,c);g.restore()}
  else bodyFB(d==='b',p.step,w,c);
  if(c)item(p.carry,0,-66);
  g.restore();g.lineCap='butt';
}
function draw(){
  const s=S,p=s.p,ly=s.lay;
  g.drawImage(s.bg,0,0);
  for(const l of s.lanes){
    g.save();g.beginPath();g.rect(BX0,l.y-l.h,BX1-BX0,2*l.h);g.clip();g.fillStyle=ly.roll;
    const o=(((s.off*l.m*l.d)%28)+28)%28;
    for(let x=BX0-28+o;x<BX1;x+=28)g.fillRect(x,l.y-l.h+4,12,2*l.h-8);
    g.restore();
  }
  if(s.tags)s.lanes.forEach((l,i)=>{
    const x=l.d>0?BX0+30:BX1-30-96,y=l.y-l.h-19,rc=s.r.k==='rastro'&&s.rc&&s.rc.lot===i+1,hot=rc||(s.r.k==='ishi'&&s.root===i);
    g.fillStyle=hot?(rc?'#c25a0e':'#a31f28'):'rgba(10,14,19,.88)';g.fillRect(x,y,96,13);
    g.fillStyle='#fff';g.font=`700 ${s.r.k==='cep'?8:9}px ${FONT}`;g.textAlign='left';
    g.fillText(s.r.k==='rastro'?'Lote L'+(i+1)+(rc?' RECALL':''):M6[i],x+3,y+10);
    if(s.r.k==='cep'){
      g.strokeStyle='#ff5a5a';g.lineWidth=1;g.setLineDash([2,2]);g.beginPath();g.moveTo(x+62,y+5.5);g.lineTo(x+94,y+5.5);g.stroke();g.setLineDash([]);
      g.strokeStyle=l.pv>.6?'#ff5a5a':'#5be0a8';g.beginPath();l.hist.forEach((v,j)=>{const px=x+62+j*32/23,py=y+12-v*11;j?g.lineTo(px,py):g.moveTo(px,py)});g.stroke();
    }
  });
  for(const it of s.items){
    if(it.held)continue;item(it,it.x,it.y);
    if((s.lupa>0||pdS()===2)&&it.bad){g.strokeStyle=`rgba(255,70,70,${.6+.4*Math.sin(performance.now()/90)})`;g.lineWidth=3;g.beginPath();g.arc(it.x,it.y,25,0,7);g.stroke()}
  }
  if(p.carry&&inBin(p)){g.strokeStyle='#fff';g.lineWidth=3;g.strokeRect(BIN.x-4,BIN.y-2,BIN.w+8,BIN.h+4)}
  person(p);
  g.textAlign='center';
  for(const f of s.fx){g.globalAlpha=Math.min(1,f.t);g.fillStyle=f.c;if(f.txt){g.font=`700 22px ${FONT}`;g.fillText(f.txt,f.x,f.y)}else g.fillRect(f.x,f.y,5,5)}
  g.globalAlpha=1;
  if(ly.alarm){g.fillStyle=`rgba(255,40,40,${.03+.03*Math.sin(performance.now()/300)})`;g.fillRect(0,0,W,H)}
  const q=s.sg+s.esc?Math.round(100*s.sg/(s.sg+s.esc)):100;
  $('hLevel').textContent=s.L;$('hTime').textContent=fmt(s.time);$('hTime').classList.toggle('warn',s.time<=10&&s.mode==='play');
  $('hSpd').textContent=Math.round(100*Math.pow(1.15,s.step))+'%';
  $('hScore').textContent=s.score;$('hGoal').textContent=s.goal;$('hQual').textContent=q+'%';
  $('sQ').style.setProperty('--cd',s.cdQ/(s.cdQm||8));$('sR').style.setProperty('--cd',s.cdR/(s.cdRm||20));
  $('sF').style.display=s.r.k==='cep'?'':'none';$('sF').style.setProperty('--cd',s.cdF/3);
  const kk=s.r.k;let hx=s.r.n;
  if(kk==='5s'){const m=Math.min(5,s.streak/3|0);hx=(m?S5[m-1]:'5S')+' x'+MULT[m]}
  else if(kk==='pdca')hx=PD[pdS()];else if(kk==='iso')hx='Auditoria em '+Math.ceil(s.aud)+'s';else if(kk==='kaizen')hx='Nível '+s.kz;
  else if(kk==='rastro')hx=s.rc?'RECALL L'+s.rc.lot+' '+Math.ceil(s.rc.t)+'s':'Sem recall';
  else if(kk==='ishi')hx=s.root>=0?'Causa: '+M6[s.root]:'Sem causa ativa';
  $('hX').textContent=hx;
  $('sQ').classList.toggle('on',s.lupa>0);$('sR').classList.toggle('on',s.stop>0);
}

/* ---------- Entrada e laço principal ---------- */
const MAP={arrowup:'w',arrowleft:'a',arrowdown:'s',arrowright:'d'};
addEventListener('keydown',e=>{
  let k=e.key.toLowerCase();k=MAP[k]||k;audio();
  if(S.mode==='play'&&['w','a','s','d','e','q','r','f',' ','p','escape'].includes(k))e.preventDefault();
  keys[k]=true;if(e.repeat)return;
  if(k==='m'){muted=!muted;if(master)master.gain.value=muted?0:.5;toast(muted?'Som desligado':'Som ligado');return}
  if(k==='p'||k==='escape'){if(S.mode==='play')pause();else if(S.mode==='pause')$('go').click();return}
  if(S.mode!=='play')return;
  if(k==='e'||k===' ')act();
  else if(k==='q'&&S.cdQ<=0){S.lupa=3;S.cdQ=S.cdQm=8*S.cdm;sfx('scan')}
  else if(k==='r'&&S.cdR<=0){S.stop=3;S.cdR=S.cdRm=rv('cdR',20)*S.cdm;sfx('brake');if(S.r.k==='prev'){S.score-=3;fx(S.p.x,S.p.y-80,'-3','#ff5a5a')}}
  else if(k==='f'&&S.r.k==='cep'&&S.cdF<=0)adjust();
});
addEventListener('keyup',e=>{let k=e.key.toLowerCase();keys[MAP[k]||k]=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;if(S.mode==='play')pause()});

let last=0;
function frame(t){
  const dt=Math.min(.05,(t-last)/1000||0);last=t;
  if(S.mode==='play')update(dt);
  draw();
  if(humG)humG.gain.setTargetAtTime(S.mode==='play'&&!muted&&S.stop<=0?.07:0,A.currentTime,.1);
  if(hum)hum.frequency.value=40+spd(S.L)*.25;
  requestAnimationFrame(frame);
}
title();
requestAnimationFrame(frame);
})();
