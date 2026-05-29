/**
 * 🐱 Desktop Pet Cat v4 — 月光蓝猫 (clean)
 * 单文件嵌入，不污染博客样式
 */
(function(){
  'use strict';
  if(window._dpCatLoaded)return;window._dpCatLoaded=true;

  const MOBILE=window.innerWidth<768||'ontouchstart' in window;
  const PRM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const SZ=MOBILE?48:72;

  /* ── 注入样式（所有选择器严格限定在 #dp 下） ── */
  const S=document.createElement('style');
  S.textContent=`
/* ===== 桌宠容器 ===== */
#dp{position:fixed!important;z-index:9998!important;bottom:14px!important;right:14px!important;pointer-events:none;font:0/0 sans-serif}
#dp *{box-sizing:border-box}

/* ===== 猫咪 ===== */
.dp-c{position:relative;width:${SZ}px;height:${SZ}px;pointer-events:all;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:none;filter:drop-shadow(0 2px 4px rgba(0,0,0,.15));transition:filter .3s}
.dp-c:hover{filter:drop-shadow(0 2px 8px rgba(141,184,154,.35))}
.dp-c.drag{cursor:grabbing!important;transition:none}

/* 身体 */
.dp-bd{position:absolute;bottom:${SZ*.12}px;left:50%;width:${SZ*.44}px;height:${SZ*.38}px;transform:translateX(-50%);background:linear-gradient(175deg,#a8b2c2 0%,#8b95a8 30%,#7d8a9c 60%,#6e7a8f 100%);border-radius:50% 50% 42% 42%/55% 55% 38% 38%;animation:dpBr 4s ease-in-out infinite}
/* 胸部 */
.dp-bd::after{content:'';position:absolute;bottom:15%;left:50%;width:50%;height:55%;transform:translateX(-50%);background:linear-gradient(180deg,rgba(228,232,239,.65),#e4e8ef 50%,rgba(200,208,218,.4));border-radius:45% 45% 40% 40%/50% 50% 35% 35%}
/* 爪子 */
.dp-pw{position:absolute;bottom:${SZ*.05}px;left:50%;width:${SZ*.13}px;height:${SZ*.09}px;transform:translateX(-50%);background:linear-gradient(180deg,#a8b2c2,#8b95a8 50%,#6e7a8f);border-radius:45% 45% 40% 40%;box-shadow:0 2px 4px rgba(0,0,0,.12)}
.dp-pw.l{margin-left:-${SZ*.09}px}
.dp-pw.r{margin-left:${SZ*.09}px}

/* 头 */
.dp-hd{position:absolute;top:0;left:50%;width:${SZ*.48}px;height:${SZ*.42}px;transform:translateX(-50%);background:linear-gradient(175deg,#a8b2c2 0%,#8b95a8 40%,#7d8a9c 70%,#6e7a8f 100%);border-radius:48% 48% 44% 44%/50% 50% 42% 42%}
/* 脸白区 */
.dp-hd::after{content:'';position:absolute;top:45%;left:50%;width:38%;height:28%;transform:translate(-50%,-50%);background:rgba(228,232,239,.35);border-radius:40%;filter:blur(3px)}

/* 耳朵 */
.dp-ear{position:absolute;top:${SZ*.08*-1}px;width:${SZ*.17}px;height:${SZ*.22}px;z-index:1}
.dp-ear.l{left:0}.dp-ear.r{right:0}
.dp-ear::before{content:'';display:block;width:100%;height:100%;background:linear-gradient(170deg,#a8b2c2,#8b95a8 50%,#6e7a8f);clip-path:polygon(50% 0%,8% 100%,92% 100%)}
.dp-ear::after{content:'';position:absolute;top:22%;left:50%;width:50%;height:55%;transform:translateX(-50%);background:linear-gradient(180deg,#ecd5d6,#e2c4c6 40%,#d4b0b3);clip-path:polygon(50% 0%,15% 92%,85% 92%)}
.dp-ear{animation:dpEar 7s ease-in-out infinite}
.dp-ear.r{animation-delay:3.5s}

/* 眼睛 */
.dp-ey{position:absolute;top:${SZ*.32}px;left:50%;width:${SZ*.36}px;transform:translateX(-50%);display:flex;justify-content:space-between}
.dp-ew{position:relative;width:${SZ*.14}px;height:${SZ*.15}px;background:radial-gradient(ellipse at 50% 45%,#f8f9fb,#eef1f5 50%,#dde2ea);border-radius:50% 50% 45% 45%/55% 55% 42% 42%;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06)}
.dp-ir{position:absolute;top:50%;left:50%;width:${SZ*.11}px;height:${SZ*.12}px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle at 45% 40%,#b5d4be,#8db89a 35%,#6a9e78 70%,#4a7055);box-shadow:inset 0 1px 2px rgba(0,0,0,.2)}
.dp-pu{position:absolute;top:50%;left:50%;width:${SZ*.04}px;height:${SZ*.07}px;transform:translate(-50%,-50%);border-radius:50%;background:#2a332e}
.dp-hl{position:absolute;top:25%;left:30%;width:${SZ*.035}px;height:${SZ*.035}px;background:#fff;border-radius:50%;box-shadow:0 0 2px rgba(255,255,255,.5)}
.dp-hl2{position:absolute;top:45%;left:55%;width:${SZ*.02}px;height:${SZ*.02}px;background:rgba(255,255,255,.55);border-radius:50%}
/* 眼睑眨眼 */
.dp-lid{position:absolute;top:-105%;left:-1px;width:calc(100% + 2px);height:105%;background:linear-gradient(180deg,#7d8a9c,#8b95a8 40%,#6e7a8f);border-radius:0 0 35% 35%;animation:dpBlink 5s ease-in-out infinite}
.dp-ew.r .dp-lid{animation-delay:.2s}

/* 鼻子 */
.dp-no{position:absolute;top:${SZ*.5}px;left:50%;width:${SZ*.07}px;height:${SZ*.05}px;transform:translateX(-50%);background:linear-gradient(180deg,#f0c4c8,#e8b4b8 40%,#d49a9f);clip-path:polygon(50% 0%,0% 65%,15% 100%,85% 100%,100% 65%)}
.dp-no::after{content:'';position:absolute;top:1px;left:25%;width:30%;height:30%;background:rgba(255,255,255,.35);border-radius:50%}

/* 嘴巴 */
.dp-mo{position:absolute;top:${SZ*.57}px;left:50%;width:${SZ*.11}px;height:${SZ*.07}px;transform:translateX(-50%)}
.dp-mo::before,.dp-mo::after{content:'';position:absolute;top:0;width:50%;height:100%;border-bottom:1.5px solid rgba(90,80,85,.4);border-radius:0 0 50% 50%}
.dp-mo::before{left:0;border-right:1px solid rgba(90,80,85,.3);transform:rotate(8deg)}
.dp-mo::after{right:0;border-left:1px solid rgba(90,80,85,.3);transform:rotate(-8deg)}

/* 胡须 */
.dp-wh{position:absolute;top:${SZ*.5}px;left:50%;width:${SZ*.55}px;height:${SZ*.18}px;transform:translateX(-50%);pointer-events:none}
.dp-w{position:absolute;width:${SZ*.2}px;height:1px;background:rgba(200,195,205,.45);border-radius:1px}
.dp-w.a{top:15%;left:0;transform:rotate(-10deg);animation:dw1 5s ease-in-out infinite}
.dp-w.b{top:55%;left:2%;transform:rotate(2deg);animation:dw2 5.5s ease-in-out infinite}
.dp-w.c{top:15%;right:0;transform:rotate(10deg);animation:dw3 5s ease-in-out infinite}
.dp-w.d{top:55%;right:2%;transform:rotate(-2deg);animation:dw4 5.5s ease-in-out infinite}

/* 尾巴 */
.dp-tl{position:absolute;bottom:${SZ*.22}px;right:${SZ*-0.05}px;width:${SZ*.28}px;height:${SZ*.36}px;transform-origin:4px 90%;animation:dpTail 4s ease-in-out infinite}
.dp-tl::before{content:'';display:block;width:100%;height:100%;background:linear-gradient(175deg,#a8b2c2,#8b95a8 30%,#6e7a8f 65%,#5c6878);border-radius:50% 50% 35% 35%/60% 55% 30% 35%;clip-path:ellipse(55% 48% at 30% 55%)}

/* 影子 */
.dp-sh{position:absolute;bottom:${SZ*.02}px;left:50%;width:${SZ*.5}px;height:${SZ*.07}px;transform:translateX(-50%);background:rgba(0,0,0,.1);border-radius:50%}

/* ===== 气泡 ===== */
.dp-bub{position:absolute;top:-${SZ*.42}px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,.92);color:#444;font:${MOBILE?'7':'8'}px/-apple-system,sans-serif;padding:3px 8px;border-radius:10px;white-space:nowrap;pointer-events:none;opacity:0;z-index:11;box-shadow:0 1px 4px rgba(0,0,0,.08);border:1px solid rgba(0,0,0,.04);transition:opacity .2s,transform .2s}
.dp-bub::after{content:'';position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);border-left:4px solid transparent;border-right:4px solid transparent;border-top:4px solid rgba(255,255,255,.92)}
.dp-bub.on{opacity:1;transform:translateX(-50%) translateY(-3px)}

/* ===== 表情/状态 ===== */
.dp-mood{position:absolute;top:-${SZ*.3}px;left:50%;transform:translateX(-50%);font-size:${SZ*.18}px;pointer-events:none;opacity:0;transition:opacity .3s;z-index:10}
.dp-mood.on{opacity:1;animation:dpPop .5s ease-out}
.dp-zzz{display:none;position:absolute;top:-${SZ*.3}px;right:${SZ*-0.12}px;font-size:${SZ*.12}px;color:#8db89a;pointer-events:none;z-index:10}
.dp-zzz.on{display:block;animation:dpZzz 2s ease-in-out infinite}
.dp-angry{display:none;position:absolute;top:-${SZ*.28}px;right:${SZ*-0.05}px;font-size:${SZ*.14}px;pointer-events:none;z-index:10}
.dp-angry.on{display:block}
.dp-food{display:none;position:absolute;bottom:${SZ*.05}px;left:50%;transform:translateX(-50%);font-size:${SZ*.14}px;pointer-events:none;z-index:10}
.dp-food.on{display:block;animation:dpFood 1s ease-in-out infinite}

/* ===== 关闭/恢复 ===== */
.dp-x{position:absolute;top:-4px;left:-4px;width:${MOBILE?10:12}px;height:${MOBILE?10:12}px;border-radius:50%;background:rgba(0,0,0,.35);color:#999;font-size:${MOBILE?6:8}px;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;z-index:20;line-height:1}
#dp:hover .dp-x{opacity:1}
.dp-x:hover{background:#f44;color:#fff}
#dp-r{position:fixed;z-index:9998;border-radius:50%;background:rgba(0,0,0,.4);color:#aaa;font-size:14px;cursor:pointer;display:none;align-items:center;justify-content:center;bottom:14px;right:14px;width:24px;height:24px;transition:.2s}
#dp-r:hover{background:rgba(141,184,154,.25);color:#8db89a}

/* ===== Keyframes ===== */
@keyframes dpBr{0%,100%{transform:translateX(-50%) scaleY(1)}50%{transform:translateX(-50%) scaleY(1.02)}}
@keyframes dpTail{0%,100%{transform:rotate(-6deg)}25%{transform:rotate(4deg)}50%{transform:rotate(-3deg)}75%{transform:rotate(5deg)}}
@keyframes dpTailF{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(12deg)}}
@keyframes dpTailA{0%,100%{transform:rotate(-20deg)}50%{transform:rotate(20deg)}}
@keyframes dpEar{0%,45%,100%{transform:rotate(0)}48%{transform:rotate(-4deg)}52%{transform:rotate(3deg)}56%{transform:rotate(-1deg)}60%{transform:rotate(0)}}
@keyframes dpBlink{0%,85%,100%{top:-105%}90%{top:0}95%{top:0}}
@keyframes dpPop{0%{transform:translateX(-50%) scale(0)}60%{transform:translateX(-50%) scale(1.3)}100%{transform:translateX(-50%) scale(1)}}
@keyframes dpZzz{0%{opacity:0;transform:translateY(0) scale(.8)}50%{opacity:1;transform:translateY(-5px) scale(1)}100%{opacity:0;transform:translateY(-10px) scale(.6)}}
@keyframes dpFood{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-3px)}}
@keyframes dpWalk{0%,100%{transform:translateY(0)}25%{transform:translateY(-2px)}75%{transform:translateY(-1px)}}
@keyframes dpSlp{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.04)}}
@keyframes dw1{0%,100%{transform:rotate(-10deg);opacity:.45}50%{transform:rotate(-11deg);opacity:.6}}
@keyframes dw2{0%,100%{transform:rotate(2deg);opacity:.45}50%{transform:rotate(1deg);opacity:.55}}
@keyframes dw3{0%,100%{transform:rotate(10deg);opacity:.45}50%{transform:rotate(9deg);opacity:.6}}
@keyframes dw4{0%,100%{transform:rotate(-2deg);opacity:.45}50%{transform:rotate(-3deg);opacity:.55}}
@media(prefers-reduced-motion:reduce){.dp-bd,.dp-tl,.dp-lid,.dp-ear,.dp-w{animation:none!important}}
`;
  document.head.appendChild(S);

  /* ── 创建 DOM ── */
  const W=document.createElement('div');W.id='dp';
  W.innerHTML=`
    <div class="dp-x" id="dp-x">×</div>
    <div class="dp-mood" id="dp-mo"></div>
    <div class="dp-zzz" id="dp-zz">💤</div>
    <div class="dp-angry" id="dp-ag">💢</div>
    <div class="dp-food" id="dp-fd">🐟</div>
    <div class="dp-bub" id="dp-bub"></div>
    <div class="dp-sh"></div>
    <div class="dp-c" id="dp-c">
      <div class="dp-tl"></div>
      <div class="dp-bd"></div>
      <div class="dp-pw l"></div><div class="dp-pw r"></div>
      <div class="dp-hd">
        <div class="dp-ear l"></div><div class="dp-ear r"></div>
        <div class="dp-ey">
          <div class="dp-ew" id="dp-el"><div class="dp-ir"><div class="dp-pu"></div></div><div class="dp-hl"></div><div class="dp-hl2"></div><div class="dp-lid"></div></div>
          <div class="dp-ew r" id="dp-er"><div class="dp-ir"><div class="dp-pu"></div></div><div class="dp-hl"></div><div class="dp-hl2"></div><div class="dp-lid"></div></div>
        </div>
        <div class="dp-no"></div>
        <div class="dp-mo"></div>
        <div class="dp-wh"><div class="dp-w a"></div><div class="dp-w b"></div><div class="dp-w c"></div><div class="dp-w d"></div></div>
      </div>
    </div>`;
  document.body.appendChild(W);

  const R=document.createElement('div');R.id='dp-r';R.textContent='🐱';R.title='显示桌宠';
  document.body.appendChild(R);

  /* ── 状态 ── */
  const C=document.getElementById('dp-c');
  let st='idle',mt=null,it=null,wf=null,bt=null,drag=false,sx=0,sy=0,sl=0,st2=0,wd=1;

  function tail(s){const t=C.querySelector('.dp-tl');t.style.animation='none';void t.offsetHeight;t.style.animation=s==='f'?'dpTailF .4s ease-in-out infinite':s==='a'?'dpTailA .3s ease-in-out infinite':'dpTail 4s ease-in-out infinite'}
  function mood(e,d){const m=document.getElementById('dp-mo');m.textContent=e;m.className='dp-mood on';clearTimeout(mt);mt=setTimeout(()=>m.className='dp-mood',d||1500)}
  function bub(t,d){const b=document.getElementById('dp-bub');b.textContent=t;b.className='dp-bub on';clearTimeout(bt);bt=setTimeout(()=>b.className='dp-bub',d||2000)}
  function reset(){['dp-mo','dp-zz','dp-ag','dp-fd','dp-bub'].forEach(id=>{const e=document.getElementById(id);e.className=e.className.replace(' on','')});tail('n');C.style.animation=''}

  const SP={happy:['喵~开心！','嘿嘿~','好舒服呀~','(◕ᴗ◕✿)'],angry:['哼！','别烦我！','喵呜！','(╯°□°)╯'],eat:['好吃！','鱼鱼~','喵呜喵呜','嗷呜~'],idle:['...','zzZ','喵？','(..•́_•̀..)'],drag:['放我下来！','救命！','头晕...','哇啊啊！'],click:['干嘛~','摸摸我~','嘻嘻','❤️','别戳！','再戳生气了哦']};
  function pick(a){return a[Math.floor(Math.random()*a.length)]}

  function setState(s){
    if(st===s)return;st=s;reset();clearTimeout(it);cancelAnimationFrame(wf);
    if(s==='happy'){tail('f');mood('😻');bub(pick(SP.happy))}
    else if(s==='sleep'){tail('s');document.getElementById('dp-zz').className='dp-zzz on';C.querySelector('.dp-bd').style.animation='dpSlp 4s ease-in-out infinite'}
    else if(s==='angry'){tail('a');mood('💢');bub(pick(SP.angry))}
    else if(s==='eat'){C.querySelector('.dp-bd').style.animation='none';void C.offsetHeight;document.getElementById('dp-fd').className='dp-food on';mood('😋');bub(pick(SP.eat))}
    else if(s==='walk'){C.style.animation='dpWalk .6s ease-in-out infinite';tail('f');go()}
    else sched();
  }

  function sched(){clearTimeout(it);it=setTimeout(()=>{if(st!=='idle')return;const r=Math.random();if(r<.25)bub(pick(SP.idle));if(r<.3){setState('happy');setTimeout(()=>setState('idle'),2000)}else if(r<.5){setState('eat');setTimeout(()=>setState('idle'),2500)}else sched()},10000+Math.random()*5000)}

  function go(){if(st!=='walk')return;let c=parseInt(W.style.right)||14;c-=wd*1.5;if(c>114)wd=-1;if(c<14)wd=1;c=Math.max(4,c);W.style.right=c+'px';W.style.left='auto';C.style.transform=wd<0?'scaleX(-1)':'scaleX(1)';wf=requestAnimationFrame(()=>setTimeout(go,30))}

  function onD(e){if(e.target.id==='dp-x')return;drag=false;sx=e.clientX||(e.touches&&e.touches[0].clientX)||0;sy=e.clientY||(e.touches&&e.touches[0].clientY)||0;const r=W.getBoundingClientRect();sl=r.left;st2=r.top;C.classList.add('drag');document.addEventListener('pointermove',onM);document.addEventListener('pointerup',onU)}
  function onM(e){const cx=e.clientX||(e.touches&&e.touches[0].clientX)||0,cy=e.clientY||(e.touches&&e.touches[0].clientY)||0;if(!drag&&(Math.abs(cx-sx)>5||Math.abs(cy-sy)>5))drag=true;if(!drag)return;e.preventDefault();W.style.left=Math.max(0,Math.min(window.innerWidth-W.offsetWidth,sl+(cx-sx)))+'px';W.style.top=Math.max(0,Math.min(window.innerHeight-W.offsetHeight,st2+(cy-sy)))+'px';W.style.right='auto'}
  function onU(){C.classList.remove('drag');document.removeEventListener('pointermove',onM);document.removeEventListener('pointerup',onU);if(drag){mood('😠');bub(pick(SP.drag));setTimeout(()=>setState('idle'),1500)}}

  let cl=false;
  C.addEventListener('click',e=>{if(drag||cl)return;e.stopPropagation();cl=true;setTimeout(()=>cl=false,300);bub(pick(SP.click));const f=[()=>{setState('happy');setTimeout(()=>setState('idle'),2000)},()=>{setState('eat');setTimeout(()=>setState('idle'),2500)},()=>{setState('angry');setTimeout(()=>setState('idle'),1800)},()=>{mood('❤️');bub('❤️');setState('happy');setTimeout(()=>setState('idle'),2000)}];f[Math.floor(Math.random()*f.length)]()});

  document.getElementById('dp-x').addEventListener('click',e=>{e.stopPropagation();W.style.display='none';R.style.display='flex'});
  R.addEventListener('click',()=>{W.style.display='';R.style.display='none';setState('idle')});
  C.addEventListener('pointerdown',onD);

  /* 阅读缩小 */
  window.addEventListener('scroll',()=>{if(scrollY>300){W.style.transform='scale(.7)';W.style.opacity='.55';W.style.transition='transform .3s,opacity .3s'}else{W.style.transform='';W.style.opacity='';W.style.transition='transform .3s,opacity .3s'}},{passive:true});

  sched();
  window.DesktopCat={setState,show:()=>{W.style.display='';R.style.display='none';setState('idle')},hide:()=>{W.style.display='none';R.style.display='flex'},getState:()=>st};
})();
