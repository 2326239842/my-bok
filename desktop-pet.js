/**
 * 🐱 Desktop Pet Cat v3 — 月光蓝猫
 * 灵感自月光下的蓝猫设计，纯CSS动画
 * 支持：待机、眨眼、呼吸、走路、点击反应、拖拽、移动端触控、文字气泡
 */
(function(){
  'use strict';
  if(window._dpCatLoaded)return;window._dpCatLoaded=true;

  const CFG={size:80,mobileSize:52,bottom:16,right:16,mobileBottom:12,mobileRight:8,dragThreshold:5,idleTimeout:10000,walkRange:100};
  const isMobile=()=>window.innerWidth<768||'ontouchstart' in window;
  const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 月光蓝猫配色 ── */
  const C={
    body:'#8b95a8',bodyLight:'#a8b2c2',bodyDark:'#6e7a8f',
    chest:'#e4e8ef',earInner:'#e2c4c6',nose:'#e8b4b8',
    eyeIris:'#8db89a',eyeIrisLight:'#b5d4be',eyePupil:'#2a332e',
    mouth:'#5a5055',
  };

  /* ── CSS ── */
  const CSS=`
#dp-wrap{position:fixed;z-index:9998;pointer-events:none;font-style:normal;line-height:0;text-align:left;direction:ltr;bottom:${CFG.bottom}px;right:${CFG.right}px;will-change:transform}
#dp-wrap *{box-sizing:border-box!important;margin:0!important;padding:0!important;border:none!important;background:none!important;box-shadow:none!important;text-shadow:none!important;animation-play-state:running!important;pointer-events:auto!important;transition:none!important}
#dp-wrap .dp-ne{pointer-events:none!important}
#dp-cat{position:relative;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:none;transform-origin:center bottom}
#dp-cat:hover{filter:drop-shadow(0 0 8px rgba(141,184,154,.3))!important}
#dp-cat.dp-drag{cursor:grabbing!important}
#dp-shadow{position:absolute;bottom:0;left:50%;transform:translateX(-50%)!important;width:40px;height:5px;background:rgba(0,0,0,.1)!important;border-radius:50%!important;pointer-events:none}

/* ── 身体 ── */
#dp-body{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);width:34px;height:28px;background:linear-gradient(175deg,${C.bodyLight} 0%,${C.body} 30%,#7d8a9c 60%,${C.bodyDark} 100%)!important;border-radius:50% 50% 42% 42%/55% 55% 38% 38%!important;z-index:2;box-shadow:inset 0 3px 8px rgba(255,255,255,.07),0 3px 10px rgba(0,0,0,.2)!important;animation:dp-breathe 4s ease-in-out infinite!important}
#dp-body::after{content:''!important;position:absolute!important;bottom:4px!important;left:50%!important;transform:translateX(-50%)!important;width:18px;height:16px;background:linear-gradient(180deg,rgba(228,232,239,.6),${C.chest},rgba(200,208,218,.4))!important;border-radius:45% 45% 40% 40%/50% 50% 35% 35%!important;z-index:3;box-shadow:inset 0 1px 4px rgba(255,255,255,.4)!important}

/* ── 尾巴 ── */
#dp-tail{position:absolute;bottom:18px;right:-10px;width:20px;height:26px;z-index:1;transform-origin:4px 24px;animation:dp-tailSway 4s ease-in-out infinite!important}
#dp-tail::before{content:''!important;position:absolute!important;bottom:0!important;left:0!important;width:100%!important;height:100%!important;border-radius:50% 50% 35% 35%/60% 55% 30% 35%!important;background:linear-gradient(175deg,${C.bodyLight},${C.body} 30%,${C.bodyDark} 65%,#5c6878)!important;clip-path:ellipse(55% 48% at 30% 55%)!important;box-shadow:2px 3px 8px rgba(0,0,0,.15)!important}

/* ── 头 ── */
#dp-head{position:absolute;top:0;left:50%;transform:translateX(-50%);width:36px;height:32px;z-index:4}
#dp-head-base{position:absolute;top:4px;left:50%;transform:translateX(-50%);width:32px;height:28px;background:linear-gradient(175deg,${C.bodyLight} 0%,${C.body} 40%,#7d8a9c 70%,${C.bodyDark} 100%)!important;border-radius:48% 48% 44% 44%/50% 50% 42% 42%!important;box-shadow:inset 0 2px 6px rgba(255,255,255,.06),inset 0 -2px 6px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.15)!important}

/* ── 耳朵 ── */
.dp-ear{position:absolute;top:-6px;width:12px;height:16px;z-index:3}
.dp-ear.dp-l{left:2px}.dp-ear.dp-r{right:2px}
.dp-ear::before{content:''!important;position:absolute!important;width:100%!important;height:100%!important;background:linear-gradient(170deg,${C.bodyLight},${C.body} 50%,${C.bodyDark})!important;clip-path:polygon(50% 0%,8% 100%,92% 100%)!important;border-radius:2px 2px 0 0!important;z-index:1}
.dp-ear::after{content:''!important;position:absolute!important;top:3px!important;left:50%!important;transform:translateX(-50%)!important;width:8px;height:10px;background:linear-gradient(180deg,#ecd5d6,${C.earInner} 40%,#d4b0b3)!important;clip-path:polygon(50% 0%,15% 92%,85% 92%)!important;z-index:2;box-shadow:inset 0 1px 3px rgba(255,220,220,.4)!important}
.dp-ear{animation:dp-earTwitch 7s ease-in-out infinite!important}
.dp-ear.dp-r{animation-delay:3.5s!important}

/* ── 脸部白区 ── */
.dp-face-white{position:absolute;top:12px;left:50%;transform:translateX(-50%);width:16px;height:12px;background:rgba(228,232,239,.4)!important;border-radius:40% 40% 35% 35%!important;z-index:5;filter:blur(2px)!important;pointer-events:none}

/* ── 眼睛 ── */
.dp-eyes{position:absolute;top:10px;left:50%;transform:translateX(-50%);width:24px;display:flex;justify-content:space-between;z-index:6}
.dp-eye-w{position:relative;width:10px;height:11px;border-radius:50% 50% 45% 45%/55% 55% 42% 42%!important;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,.15),0 1px 3px rgba(0,0,0,.08)!important}
.dp-eye-w .ew{position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(ellipse at 50% 45%,#f8f9fb,#eef1f5 50%,#dde2ea)!important;border-radius:inherit;z-index:1}
.dp-eye-w .iris{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:8px;height:9px;border-radius:50%!important;background:radial-gradient(circle at 45% 40%,${C.eyeIrisLight},${C.eyeIris} 35%,#6a9e78 70%,#4a7055)!important;z-index:2;box-shadow:inset 0 1px 2px rgba(0,0,0,.25)!important}
.dp-eye-w .pupil{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:3px;height:5px;border-radius:50%!important;background:${C.eyePupil}!important;z-index:3}
.dp-eye-w .hl{position:absolute;top:28%;left:32%;width:2.5px;height:2.5px;border-radius:50%!important;background:rgba(255,255,255,.9)!important;z-index:4;box-shadow:0 0 2px rgba(255,255,255,.6)!important}
.dp-eye-w .hl2{position:absolute;top:42%;left:52%;width:1.5px;height:1.5px;border-radius:50%!important;background:rgba(255,255,255,.6)!important;z-index:4}
/* 眨眼眼睑 */
.dp-eye-w .lid{position:absolute;top:-105%;left:-1px;width:calc(100% + 2px);height:105%;background:linear-gradient(180deg,#7d8a9c,${C.body} 40%,${C.bodyDark})!important;z-index:5;border-radius:0 0 35% 35%!important;box-shadow:0 1px 3px rgba(0,0,0,.1)!important;animation:dp-softBlink 5s ease-in-out infinite!important}
.dp-eye-w.dp-r .lid{animation-delay:.2s!important}

/* ── 鼻子 ── */
#dp-nose{position:absolute;top:18px;left:50%;transform:translateX(-50%);width:5px;height:4px;background:linear-gradient(180deg,#f0c4c8,${C.nose} 40%,#d49a9f)!important;clip-path:polygon(50% 0%,0% 65%,15% 100%,85% 100%,100% 65%)!important;z-index:7;box-shadow:inset 0 1px 2px rgba(255,200,200,.4),0 1px 2px rgba(0,0,0,.1)!important}
#dp-nose::after{content:''!important;position:absolute!important;top:0.5px!important;left:1px!important;width:1.5px;height:1px;background:rgba(255,255,255,.4)!important;border-radius:50%!important}

/* ── 嘴巴 ── */
#dp-mouth{position:absolute;top:22px;left:50%;transform:translateX(-50%);width:8px;height:5px;z-index:7}
#dp-mouth::before,#dp-mouth::after{content:''!important;position:absolute!important;top:0!important;width:4px;height:4px;border-bottom:1.5px solid rgba(90,80,85,.45)!important;border-radius:0 0 50% 50%!important}
#dp-mouth::before{left:-0.5px!important;border-right:1px solid rgba(90,80,85,.35)!important;transform:rotate(8deg)!important}
#dp-mouth::after{right:-0.5px!important;border-left:1px solid rgba(90,80,85,.35)!important;transform:rotate(-8deg)!important}

/* ── 胡须 ── */
#dp-wh{position:absolute;top:18px;left:50%;transform:translateX(-50%);width:44px;height:14px;z-index:6;pointer-events:none}
.dp-w{position:absolute;height:1px;background:rgba(200,195,205,.5)!important;border-radius:1px!important}
.dp-w.dp-l1{left:0;top:1px;width:16px;transform:rotate(-10deg);animation:dp-w1 5s ease-in-out infinite!important}
.dp-w.dp-l2{left:1px;top:6px;width:17px;transform:rotate(2deg);animation:dp-w2 5.5s ease-in-out infinite!important}
.dp-w.dp-r1{right:0;top:1px;width:16px;transform:rotate(10deg);animation:dp-w3 5s ease-in-out infinite!important}
.dp-w.dp-r2{right:1px;top:6px;width:17px;transform:rotate(-2deg);animation:dp-w4 5.5s ease-in-out infinite!important}

/* ── 爪子 ── */
#dp-paws{position:absolute;bottom:6px;left:50%;transform:translateX(-50%);display:flex;gap:10px;z-index:3}
.dp-pw{width:8px;height:6px;background:linear-gradient(180deg,${C.bodyLight},${C.body} 50%,#6e7a8f)!important;border-radius:45% 45% 40% 40%!important;box-shadow:inset 0 1px 2px rgba(255,255,255,.08),0 2px 4px rgba(0,0,0,.15)!important;animation:dp-pawL 1.5s ease-in-out infinite!important}
.dp-pw.dp-r{animation-name:dp-pawR!important}

/* ── 浮动表情 ── */
.dp-mood{position:absolute;top:-20px;left:50%;transform:translateX(-50%);font-size:14px;pointer-events:none;opacity:0;transition:opacity .3s;z-index:10}
.dp-mood.dp-on{opacity:1;animation:dp-moodPop .5s ease-out}

/* ── 睡觉 Zzz ── */
.dp-zzz{display:none;position:absolute;top:-22px;right:-10px;font-size:9px;color:#8db89a;pointer-events:none;z-index:10}
.dp-zzz.dp-on{display:block;animation:dp-zzzFloat 2s ease-in-out infinite}

/* ── 生气 ── */
.dp-angry{display:none;position:absolute;top:-20px;right:-4px;font-size:10px;pointer-events:none;z-index:10}
.dp-angry.dp-on{display:block}

/* ── 吃东西 ── */
.dp-food{display:none;position:absolute;bottom:4px;left:50%;transform:translateX(-50%);font-size:10px;pointer-events:none;z-index:10}
.dp-food.dp-on{display:block;animation:dp-foodBounce 1s ease-in-out infinite}

/* ── 文字气泡 ── */
.dp-bubble{position:absolute;top:-36px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,.92)!important;color:#333!important;font-size:9px!important;font-family:-apple-system,sans-serif!important;padding:3px 8px!important;border-radius:10px!important;white-space:nowrap;pointer-events:none;opacity:0;z-index:11;box-shadow:0 1px 4px rgba(0,0,0,.1)!important;border:1px solid rgba(0,0,0,.06)!important;transition:opacity .2s,transform .2s}
.dp-bubble::after{content:''!important;position:absolute!important;bottom:-4px!important;left:50%!important;transform:translateX(-50%)!important;width:0!important;height:0!important;border-left:4px solid transparent!important;border-right:4px solid transparent!important;border-top:4px solid rgba(255,255,255,.92)!important}
.dp-bubble.dp-on{opacity:1;transform:translateX(-50%) translateY(-4px)}

/* ── 关闭按钮 ── */
#dp-close{position:absolute;top:-5px;left:-5px;width:12px;height:12px;border-radius:50%!important;background:rgba(0,0,0,.4)!important;color:#999!important;font-size:7px!important;cursor:pointer!important;display:flex!important;align-items:center!important;justify-content:center!important;opacity:0;transition:opacity .2s;z-index:20;line-height:1!important}
#dp-wrap:hover #dp-close{opacity:1!important}
#dp-close:hover{background:#f44!important;color:#fff!important}
/* ── 恢复按钮 ── */
#dp-restore{position:fixed!important;z-index:9998!important;border-radius:50%!important;background:rgba(0,0,0,.4)!important;color:#aaa!important;font-size:16px!important;cursor:pointer!important;display:none!important;align-items:center!important;justify-content:center!important;transition:.2s!important;bottom:${CFG.bottom}px!important;right:${CFG.right}px!important;width:28px!important;height:28px!important}
#dp-restore:hover{background:rgba(141,184,154,.25)!important;color:#8db89a!important}

/* ── Keyframes ── */
@keyframes dp-breathe{0%,100%{transform:translateX(-50%) scaleY(1)!important}50%{transform:translateX(-50%) scaleY(1.02)!important}}
@keyframes dp-tailSway{0%,100%{transform:rotate(-6deg)!important}25%{transform:rotate(4deg)!important}50%{transform:rotate(-3deg)!important}75%{transform:rotate(5deg)!important}}
@keyframes dp-tailFast{0%,100%{transform:rotate(-12deg)!important}50%{transform:rotate(12deg)!important}}
@keyframes dp-tailAngry{0%,100%{transform:rotate(-20deg)!important}50%{transform:rotate(20deg)!important}}
@keyframes dp-earTwitch{0%,45%,100%{transform:rotate(0deg)!important}48%{transform:rotate(-4deg)!important}52%{transform:rotate(3deg)!important}56%{transform:rotate(-1deg)!important}60%{transform:rotate(0deg)!important}}
@keyframes dp-softBlink{0%,85%,100%{top:-105%!important}90%{top:0!important}95%{top:0!important}}
@keyframes dp-pawL{0%,100%{transform:translateY(0)!important}50%{transform:translateY(-1.5px)!important}}
@keyframes dp-pawR{0%,100%{transform:translateY(-1.5px)!important}50%{transform:translateY(0)!important}}
@keyframes dp-moodPop{0%{transform:translateX(-50%) scale(0)!important}60%{transform:translateX(-50%) scale(1.3)!important}100%{transform:translateX(-50%) scale(1)!important}}
@keyframes dp-zzzFloat{0%{opacity:0;transform:translateY(0) scale(.8)!important}50%{opacity:1;transform:translateY(-5px) scale(1)!important}100%{opacity:0;transform:translateY(-10px) scale(.6)!important}}
@keyframes dp-foodBounce{0%,100%{transform:translateX(-50%) translateY(0)!important}50%{transform:translateX(-50%) translateY(-3px)!important}}
@keyframes dp-walkBob{0%,100%{transform:translateY(0)!important}25%{transform:translateY(-2px)!important}75%{transform:translateY(-1px)!important}}
@keyframes dp-sleepBreathe{0%,100%{transform:scaleY(1)!important}50%{transform:scaleY(1.04)!important}}
@keyframes dp-chew{0%,100%{transform:translateY(0)!important}50%{transform:translateY(.5px)!important}}
@keyframes dp-w1{0%,100%{transform:rotate(-10deg);opacity:.5}25%{transform:rotate(-9deg);opacity:.65}50%{transform:rotate(-11deg);opacity:.45}75%{transform:rotate(-9.5deg);opacity:.6}}
@keyframes dp-w2{0%,100%{transform:rotate(2deg);opacity:.5}50%{transform:rotate(1deg);opacity:.6}}
@keyframes dp-w3{0%,100%{transform:rotate(10deg);opacity:.5}25%{transform:rotate(11deg);opacity:.65}50%{transform:rotate(9deg);opacity:.45}75%{transform:rotate(10.5deg);opacity:.6}}
@keyframes dp-w4{0%,100%{transform:rotate(-2deg);opacity:.5}50%{transform:rotate(-3deg);opacity:.6}}
@media(prefers-reduced-motion:reduce){#dp-body,#dp-tail,.dp-pw,.dp-ear,.dp-eye-w .lid,.dp-w{animation:none!important}}
`;

  /* ── 注入 ── */
  const style=document.createElement('style');
  style.textContent=CSS;
  document.head.appendChild(style);

  const wrap=document.createElement('div');
  wrap.id='dp-wrap';
  wrap.innerHTML=`
    <div id="dp-close" title="隐藏">×</div>
    <div class="dp-mood dp-ne" id="dp-mood"></div>
    <div class="dp-zzz dp-ne" id="dp-zzz">💤</div>
    <div class="dp-angry dp-ne" id="dp-angry">💢</div>
    <div class="dp-food dp-ne" id="dp-food">🐟</div>
    <div class="dp-bubble dp-ne" id="dp-bubble"></div>
    <div class="dp-ne" id="dp-shadow"></div>
    <div id="dp-cat">
      <div id="dp-head">
        <div class="dp-ear dp-l"></div><div class="dp-ear dp-r"></div>
        <div id="dp-head-base">
          <div class="dp-face-white"></div>
          <div class="dp-eyes">
            <div class="dp-eye-w" id="dp-el">
              <div class="ew"></div><div class="iris"><div class="pupil"></div></div>
              <div class="hl"></div><div class="hl2"></div><div class="lid"></div>
            </div>
            <div class="dp-eye-w dp-r" id="dp-er">
              <div class="ew"></div><div class="iris"><div class="pupil"></div></div>
              <div class="hl"></div><div class="hl2"></div><div class="lid"></div>
            </div>
          </div>
          <div id="dp-nose"></div>
          <div id="dp-mouth"></div>
          <div id="dp-wh">
            <div class="dp-w dp-l1"></div><div class="dp-w dp-l2"></div>
            <div class="dp-w dp-r1"></div><div class="dp-w dp-r2"></div>
          </div>
        </div>
      </div>
      <div id="dp-body">
        <div id="dp-paws"><div class="dp-pw" id="dp-pl"></div><div class="dp-pw dp-r" id="dp-pr"></div></div>
      </div>
      <div id="dp-tail"></div>
    </div>`;
  document.body.appendChild(wrap);

  const restore=document.createElement('div');
  restore.id='dp-restore';
  restore.textContent='🐱';
  restore.title='显示桌宠';
  document.body.appendChild(restore);

  /* ── DOM ── */
  const $=id=>document.getElementById(id);
  const cat=$('dp-cat');

  /* ── 状态 ── */
  let state='idle',moodTimer=null,idleTimer=null,walkRAF=null,bubbleTimer=null;
  let isDragging=false,dragSX=0,dragSY=0,startL=0,startT=0,walkDir=1;

  /* ── 尾巴 ── */
  function setTail(s){
    const t=$('dp-tail');
    t.style.animation='none';void t.offsetHeight;
    t.style.animation=s==='fast'?'dp-tailFast .4s ease-in-out infinite':s==='angry'?'dp-tailAngry .3s ease-in-out infinite':'dp-tailSway 4s ease-in-out infinite';
  }

  /* ── 文字气泡 ── */
  function showBubble(text,dur){
    const b=$('dp-bubble');
    b.textContent=text;b.className='dp-bubble dp-ne dp-on';
    clearTimeout(bubbleTimer);
    bubbleTimer=setTimeout(()=>{b.className='dp-bubble dp-ne'},dur||2000);
  }

  /* ── 表情 ── */
  function showMood(e,d){
    const m=$('dp-mood');m.textContent=e;m.className='dp-mood dp-ne dp-on';
    clearTimeout(moodTimer);moodTimer=setTimeout(()=>{m.className='dp-mood dp-ne'},d||1500);
  }

  /* ── 重置 ── */
  function resetAll(){
    $('dp-mood').className='dp-mood dp-ne';
    $('dp-zzz').className='dp-zzz dp-ne';
    $('dp-angry').className='dp-angry dp-ne';
    $('dp-food').className='dp-food dp-ne';
    $('dp-bubble').className='dp-bubble dp-ne';
    setTail('normal');
    cat.style.animation='';
  }

  /* ── 说话文字库 ── */
  const SPEECH={
    happy:['喵~开心！','嘿嘿~','好舒服呀~','(◕ᴗ◕✿)'],
    angry:['哼！','别烦我！','喵呜！','(╯°□°)╯'],
    eat:['好吃！','鱼鱼~','喵呜喵呜','嗷呜~'],
    idle:['...','zzZ','喵？','(..•́_•̀..)'],
    drag:['放我下来！','救命！','头晕...','哇啊啊！'],
    click:['干嘛~','摸摸我~','嘻嘻','❤️','别戳！','再戳生气了哦'],
  };
  function randSpeech(arr){return arr[Math.floor(Math.random()*arr.length)]}

  /* ── 状态切换 ── */
  function setState(s){
    if(state===s)return;
    state=s;resetAll();
    clearTimeout(idleTimer);cancelAnimationFrame(walkRAF);

    if(s==='happy'){
      setTail('fast');showMood('😻');showBubble(randSpeech(SPEECH.happy));
    }else if(s==='sleep'){
      setTail('slow');$('dp-zzz').className='dp-zzz dp-ne dp-on';
      $('dp-body').style.animation='dp-sleepBreathe 4s ease-in-out infinite';
    }else if(s==='angry'){
      setTail('angry');showMood('💢');showBubble(randSpeech(SPEECH.angry));
    }else if(s==='eat'){
      $('dp-body').style.animation='dp-chew .3s ease-in-out infinite';
      $('dp-food').className='dp-food dp-ne dp-on';showMood('😋');showBubble(randSpeech(SPEECH.eat));
    }else if(s==='walk'){
      cat.style.animation='dp-walkBob .6s ease-in-out infinite';
      setTail('fast');startWalking();
    }else{scheduleIdle()}
  }

  /* ── 闲置 ── */
  function scheduleIdle(){
    clearTimeout(idleTimer);
    idleTimer=setTimeout(()=>{
      if(state!=='idle')return;
      const r=Math.random();
      if(r<.25){showBubble(randSpeech(SPEECH.idle))}
      if(r<.3){setState('happy');setTimeout(()=>setState('idle'),2000)}
      else if(r<.5){setState('eat');setTimeout(()=>setState('idle'),2500)}
      else scheduleIdle();
    },CFG.idleTimeout+Math.random()*5000);
  }

  /* ── 走路 ── */
  function startWalking(){
    if(state!=='walk')return;
    let cur=parseInt(wrap.style.right)||CFG.right;
    cur-=walkDir*1.5;
    if(cur>CFG.right+CFG.walkRange)walkDir=-1;
    if(cur<CFG.right-CFG.walkRange)walkDir=1;
    cur=Math.max(4,cur);
    wrap.style.right=cur+'px';wrap.style.left='auto';
    cat.style.transform=walkDir<0?'scaleX(-1)':'scaleX(1)';
    walkRAF=requestAnimationFrame(()=>setTimeout(startWalking,30));
  }

  /* ── 拖拽 ── */
  function onDown(e){
    if(e.target.id==='dp-close')return;
    isDragging=false;
    dragSX=e.clientX||(e.touches&&e.touches[0].clientX)||0;
    dragSY=e.clientY||(e.touches&&e.touches[0].clientY)||0;
    const r=wrap.getBoundingClientRect();startL=r.left;startT=r.top;
    cat.classList.add('dp-drag');
    document.addEventListener('pointermove',onMove);
    document.addEventListener('pointerup',onUp);
  }
  function onMove(e){
    const cx=e.clientX||(e.touches&&e.touches[0].clientX)||0;
    const cy=e.clientY||(e.touches&&e.touches[0].clientY)||0;
    if(!isDragging&&(Math.abs(cx-dragSX)>CFG.dragThreshold||Math.abs(cy-dragSY)>CFG.dragThreshold))isDragging=true;
    if(!isDragging)return;
    e.preventDefault();
    wrap.style.left=Math.max(0,Math.min(window.innerWidth-wrap.offsetWidth,startL+(cx-dragSX)))+'px';
    wrap.style.top=Math.max(0,Math.min(window.innerHeight-wrap.offsetHeight,startT+(cy-dragSY)))+'px';
    wrap.style.right='auto';
  }
  function onUp(){
    cat.classList.remove('dp-drag');
    document.removeEventListener('pointermove',onMove);
    document.removeEventListener('pointerup',onUp);
    if(isDragging){showMood('😠');showBubble(randSpeech(SPEECH.drag));setTimeout(()=>setState('idle'),1500)}
  }

  /* ── 点击 ── */
  let clickLock=false;
  cat.addEventListener('click',e=>{
    if(isDragging||clickLock)return;
    e.stopPropagation();clickLock=true;setTimeout(()=>clickLock=false,300);
    showBubble(randSpeech(SPEECH.click));
    const fns=[
      ()=>{setState('happy');setTimeout(()=>setState('idle'),2000)},
      ()=>{setState('eat');setTimeout(()=>setState('idle'),2500)},
      ()=>{setState('angry');setTimeout(()=>setState('idle'),1800)},
      ()=>{showMood('❤️');showBubble('❤️');setState('happy');setTimeout(()=>setState('idle'),2000)},
    ];
    fns[Math.floor(Math.random()*fns.length)]();
  });

  /* ── 隐藏/显示 ── */
  $('dp-close').addEventListener('click',e=>{
    e.stopPropagation();wrap.style.display='none';restore.style.display='flex';
  });
  restore.addEventListener('click',()=>{
    wrap.style.display='';restore.style.display='none';setState('idle');
  });

  /* ── 绑定 ── */
  cat.addEventListener('pointerdown',onDown);

  /* ── 响应式 ── */
  function onResize(){
    const br=isMobile()?CFG.mobileBottom:CFG.bottom;
    const rr=isMobile()?CFG.mobileRight:CFG.right;
    restore.style.bottom=br+'px';restore.style.right=rr+'px';
    if(!isDragging){wrap.style.right=rr+'px';wrap.style.left='auto';wrap.style.bottom=br+'px';wrap.style.top='auto'}
  }
  window.addEventListener('resize',onResize);onResize();

  /* ── 阅读时缩小 ── */
  window.addEventListener('scroll',()=>{
    if(scrollY>300){wrap.style.transform='scale(.7)';wrap.style.opacity='.55';wrap.style.transition='transform .3s,opacity .3s'}
    else{wrap.style.transform='';wrap.style.opacity='';wrap.style.transition='transform .3s,opacity .3s'}
  },{passive:true});

  /* ── 启动 ── */
  scheduleIdle();

  window.DesktopCat={setState,show:()=>{wrap.style.display='';restore.style.display='none';setState('idle')},hide:()=>{wrap.style.display='none';restore.style.display='flex'},getState:()=>state};
})();
