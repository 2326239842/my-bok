/**
 * 🐱 Desktop Pet Cat — 网页桌宠猫咪 v2
 * 自包含单文件，一个 <script> 标签即可嵌入
 * 支持：待机、眨眼、呼吸、走路、点击反应、拖拽、移动端触控
 * 不干扰阅读：小尺寸、右下角、可隐藏
 */
(function(){
  'use strict';
  if(window._dpCatLoaded) return; window._dpCatLoaded=true;

  /* ── 配置 ── */
  const CFG={
    size:70,            // 桌面尺寸
    mobileSize:48,      // 移动端尺寸
    bottom:16,
    right:16,
    mobileBottom:12,
    mobileRight:8,
    dragThreshold:5,
    idleTimeout:10000,
    walkRange:100,
  };

  const isMobile=()=>window.innerWidth<768||'ontouchstart' in window;
  const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sz=()=>isMobile()?CFG.mobileSize:CFG.size;

  /* ── CSS ── */
  const CSS=`
#dp-wrap{position:fixed;z-index:9998;pointer-events:none;font-style:normal;font-variant:normal;line-height:0;text-align:left;direction:ltr;bottom:${CFG.bottom}px;right:${CFG.right}px;will-change:transform}
#dp-wrap *{box-sizing:border-box!important;margin:0!important;padding:0!important;border:none!important;background:none!important;box-shadow:none!important;text-shadow:none!important;filter:none!important;opacity:1!important;transform-origin:center bottom!important;animation-play-state:running!important;pointer-events:auto!important;transition:none!important}
#dp-wrap .dp-no-events{pointer-events:none!important}
#dp-cat{position:relative;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:none;transform-origin:center bottom}
#dp-cat:hover{filter:drop-shadow(0 0 8px rgba(245,166,35,.35))!important}
#dp-cat.dp-dragging{cursor:grabbing!important}
#dp-shadow{position:absolute;bottom:-3px;left:50%;transform:translateX(-50%)!important;width:36px;height:5px;background:rgba(0,0,0,.12)!important;border-radius:50%!important}
#dp-body{width:42px;height:30px;background:#f5a623!important;border-radius:21px 21px 12px 12px!important;position:relative;z-index:1;animation:dp-breathe 3s ease-in-out infinite!important}
#dp-body::after{content:''!important;position:absolute!important;bottom:-5px!important;left:6px!important;width:30px;height:10px;background:#f5a623!important;border-radius:0 0 10px 10px!important}
#dp-head{width:38px;height:34px;background:#f5a623!important;border-radius:50% 50% 42% 42%!important;position:absolute!important;top:-18px!important;left:2px!important;z-index:2}
.dp-ear{position:absolute!important;top:-7px!important;width:0!important;height:0!important;border-left:6px solid transparent!important;border-right:6px solid transparent!important;border-bottom:11px solid #f5a623!important;z-index:1}
.dp-ear.dp-l{left:1px!important;transform:rotate(-10deg)!important}
.dp-ear.dp-r{right:1px!important;transform:rotate(10deg)!important}
.dp-ei{position:absolute!important;top:-5px!important;width:0!important;height:0!important;border-left:3.5px solid transparent!important;border-right:3.5px solid transparent!important;border-bottom:7px solid #ffb6c1!important;z-index:2}
.dp-ei.dp-l{left:4.5px!important;transform:rotate(-10deg)!important}
.dp-ei.dp-r{right:4.5px!important;transform:rotate(10deg)!important}
#dp-eyes{position:absolute!important;top:12px!important;left:50%!important;transform:translateX(-50%)!important;display:flex!important;gap:10px!important;z-index:3}
.dp-eye{width:7px;height:7px;background:#333!important;border-radius:50%!important;position:relative;animation:dp-blink 4s infinite!important}
.dp-eye::after{content:''!important;position:absolute!important;top:1px!important;left:1.5px!important;width:2.5px;height:2.5px;background:#fff!important;border-radius:50%!important}
.dp-eye-shut{height:1.5px!important;border-radius:1px!important;animation:none!important}
.dp-eye-shut::after{display:none!important}
#dp-nose{position:absolute!important;top:19px!important;left:50%!important;transform:translateX(-50%)!important;width:4px;height:2.5px;background:#ffb6c1!important;border-radius:50%!important;z-index:3}
#dp-mouth{position:absolute!important;top:21px!important;left:50%!important;transform:translateX(-50%)!important;width:8px;height:3px;z-index:3}
#dp-mouth::before,#dp-mouth::after{content:''!important;position:absolute!important;top:0!important;width:5px;height:3px;border-bottom:1.5px solid #333!important;border-radius:0 0 50% 50%!important}
#dp-mouth::before{left:0!important}
#dp-mouth::after{right:0!important}
#dp-wh{position:absolute!important;top:18px!important;left:50%!important;transform:translateX(-50%)!important;width:36px;z-index:3}
.dp-w{position:absolute!important;width:11px!important;height:1px!important;background:#666!important;border-radius:1px!important}
.dp-w.dp-l1{left:0!important;top:0!important;transform:rotate(-8deg)!important}
.dp-w.dp-l2{left:0!important;top:4px!important;transform:rotate(5deg)!important}
.dp-w.dp-r1{right:0!important;top:0!important;transform:rotate(8deg)!important}
.dp-w.dp-r2{right:0!important;top:4px!important;transform:rotate(-5deg)!important}
#dp-paws{position:absolute!important;bottom:-4px!important;left:50%!important;transform:translateX(-50%)!important;display:flex!important;gap:14px!important;z-index:2}
.dp-pw{width:10px;height:6px;background:#e8941a!important;border-radius:0 0 5px 5px!important;animation:dp-pawL 1.5s ease-in-out infinite!important}
.dp-pw.dp-r{animation-name:dp-pawR!important}
#dp-tail{position:absolute!important;bottom:9px!important;right:-12px!important;width:24px;height:7px;background:#f5a623!important;border-radius:4px!important;transform-origin:left center!important;animation:dp-tailWag 2s ease-in-out infinite!important;z-index:0}
.dp-mood{position:absolute!important;top:-24px!important;left:50%!important;transform:translateX(-50%)!important;font-size:13px!important;pointer-events:none!important;opacity:0!important;transition:opacity .3s!important;z-index:10}
.dp-mood-show{opacity:1!important;animation:dp-moodPop .5s ease-out!important}
.dp-zzz{display:none!important;position:absolute!important;top:-28px!important;right:-14px!important;font-size:9px!important;color:#00e89d!important;pointer-events:none!important;z-index:10}
.dp-zzz-show{display:block!important;animation:dp-zzz 2s ease-in-out infinite!important}
.dp-food{display:none!important;position:absolute!important;bottom:-2px!important;left:50%!important;transform:translateX(-50%)!important;font-size:11px!important;pointer-events:none!important;z-index:10}
.dp-food-show{display:block!important;animation:dp-foodBounce 1s ease-in-out infinite!important}
.dp-angry{display:none!important;position:absolute!important;top:-26px!important;right:-6px!important;font-size:11px!important;pointer-events:none!important;z-index:10}
.dp-angry-show{display:block!important}
#dp-close{position:absolute!important;top:-6px!important;left:-6px!important;width:14px!important;height:14px!important;border-radius:50%!important;background:#333!important;color:#999!important;font-size:8px!important;cursor:pointer!important;display:flex!important;align-items:center!important;justify-content:center!important;opacity:0!important;transition:opacity .2s!important;z-index:20!important;line-height:1!important}
#dp-wrap:hover #dp-close{opacity:1!important}
#dp-close:hover{background:#f44!important;color:#fff!important}
#dp-restore{position:fixed!important;z-index:9998!important;border-radius:50%!important;background:rgba(0,0,0,.45)!important;color:#aaa!important;font-size:16px!important;cursor:pointer!important;display:none!important;align-items:center!important;justify-content:center!important;transition:.2s!important;bottom:${CFG.bottom}px!important;right:${CFG.right}px!important}
#dp-restore:hover{background:rgba(0,232,157,.2)!important;color:#00e89d!important}
@keyframes dp-blink{0%,90%,100%{transform:scaleY(1)!important}95%{transform:scaleY(.1)!important}}
@keyframes dp-breathe{0%,100%{transform:scaleY(1)!important}50%{transform:scaleY(1.03)!important}}
@keyframes dp-tailWag{0%,100%{transform:rotate(-15deg)!important}50%{transform:rotate(15deg)!important}}
@keyframes dp-tailFast{0%,100%{transform:rotate(-25deg)!important}50%{transform:rotate(25deg)!important}}
@keyframes dp-tailAngry{0%,100%{transform:rotate(-30deg)!important}50%{transform:rotate(30deg)!important}}
@keyframes dp-pawL{0%,100%{transform:translateY(0)!important}50%{transform:translateY(-2px)!important}}
@keyframes dp-pawR{0%,100%{transform:translateY(-2px)!important}50%{transform:translateY(0)!important}}
@keyframes dp-moodPop{0%{transform:translateX(-50%) scale(0)!important}60%{transform:translateX(-50%) scale(1.3)!important}100%{transform:translateX(-50%) scale(1)!important}}
@keyframes dp-zzz{0%{opacity:0;transform:translateY(0) scale(.8)!important}50%{opacity:1;transform:translateY(-6px) scale(1)!important}100%{opacity:0;transform:translateY(-12px) scale(.6)!important}}
@keyframes dp-foodBounce{0%,100%{transform:translateX(-50%) translateY(0)!important}50%{transform:translateX(-50%) translateY(-3px)!important}}
@keyframes dp-walkBob{0%,100%{transform:translateY(0)!important}25%{transform:translateY(-2px)!important}75%{transform:translateY(-1px)!important}}
@keyframes dp-sleepBreathe{0%,100%{transform:scaleY(1)!important}50%{transform:scaleY(1.05)!important}}
@keyframes dp-chew{0%,100%{transform:translateY(0)!important}50%{transform:translateY(1px)!important}}
@media(prefers-reduced-motion:reduce){#dp-body,#dp-tail,.dp-eye,.dp-pw{animation:none!important}}
`;

  /* ── 注入 CSS ── */
  const style=document.createElement('style');
  style.textContent=CSS;
  document.head.appendChild(style);

  /* ── 创建 DOM ── */
  const wrap=document.createElement('div');
  wrap.id='dp-wrap';
  wrap.innerHTML=`
    <div id="dp-close" title="隐藏桌宠">×</div>
    <div class="dp-mood dp-no-events" id="dp-mood"></div>
    <div class="dp-zzz dp-no-events" id="dp-zzz">💤</div>
    <div class="dp-angry dp-no-events" id="dp-angry">💢</div>
    <div class="dp-food dp-no-events" id="dp-food">🐟</div>
    <div class="dp-no-events" id="dp-shadow"></div>
    <div id="dp-cat">
      <div id="dp-head">
        <div class="dp-ear dp-l"></div><div class="dp-ear dp-r"></div>
        <div class="dp-ei dp-l"></div><div class="dp-ei dp-r"></div>
        <div id="dp-eyes"><div class="dp-eye" id="dp-el"></div><div class="dp-eye" id="dp-er"></div></div>
        <div id="dp-nose"></div>
        <div id="dp-mouth"></div>
        <div id="dp-wh">
          <div class="dp-w dp-l1"></div><div class="dp-w dp-l2"></div>
          <div class="dp-w dp-r1"></div><div class="dp-w dp-r2"></div>
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

  /* ── DOM 引用 ── */
  const $=id=>document.getElementById(id);
  const cat=$('dp-cat');

  /* ── 状态 ── */
  let state='idle';
  let moodTimer=null;
  let idleTimer=null;
  let walkRAF=null;
  let isDragging=false;
  let dragSX=0,dragSY=0,startL=0,startT=0;
  let walkDir=1;

  /* ── 尾巴动画 ── */
  function setTail(s){
    const t=$('dp-tail');
    t.style.animation='none';
    void t.offsetHeight;
    t.style.animation=s==='fast'?'dp-tailFast .4s ease-in-out infinite':s==='angry'?'dp-tailAngry .3s ease-in-out infinite':'dp-tailWag 2s ease-in-out infinite';
  }

  /* ── 表情 ── */
  function showMood(e,d){
    const m=$('dp-mood');
    m.textContent=e;
    m.className='dp-mood dp-no-events dp-mood-show';
    clearTimeout(moodTimer);
    moodTimer=setTimeout(()=>{m.className='dp-mood dp-no-events'},d||1500);
  }

  /* ── 隐藏所有状态元素 ── */
  function resetAll(){
    $('dp-el').className='dp-eye';
    $('dp-er').className='dp-eye';
    $('dp-body').style.animation='';
    $('dp-el').style.transform='';
    $('dp-er').style.transform='';
    setTail('normal');
    $('dp-mood').className='dp-mood dp-no-events';
    $('dp-zzz').className='dp-zzz dp-no-events';
    $('dp-angry').className='dp-angry dp-no-events';
    $('dp-food').className='dp-food dp-no-events';
    cat.style.animation='';
    // 恢复耳朵
    const ears=wrap.querySelectorAll('.dp-ear');
    ears[0].style.transform='rotate(-10deg)';
    ears[1].style.transform='rotate(10deg)';
  }

  /* ── 状态切换 ── */
  function setState(s){
    if(state===s)return;
    state=s;
    resetAll();
    clearTimeout(idleTimer);
    cancelAnimationFrame(walkRAF);

    if(s==='happy'){
      $('dp-el').className='dp-eye dp-eye-shut';
      $('dp-er').className='dp-eye dp-eye-shut';
      setTail('fast');
      showMood('😻');
    }else if(s==='sleep'){
      $('dp-el').className='dp-eye dp-eye-shut';
      $('dp-er').className='dp-eye dp-eye-shut';
      $('dp-body').style.animation='dp-sleepBreathe 4s ease-in-out infinite';
      setTail('slow');
      $('dp-zzz').className='dp-zzz dp-no-events dp-zzz-show';
    }else if(s==='angry'){
      $('dp-el').style.transform='translateY(-1px)';
      $('dp-er').style.transform='translateY(-1px)';
      wrap.querySelectorAll('.dp-ear')[0].style.transform='rotate(-20deg)';
      wrap.querySelectorAll('.dp-ear')[1].style.transform='rotate(20deg)';
      setTail('angry');
      $('dp-angry').className='dp-angry dp-no-events dp-angry-show';
      showMood('💢');
    }else if(s==='eat'){
      $('dp-body').style.animation='dp-chew .3s ease-in-out infinite';
      $('dp-food').className='dp-food dp-no-events dp-food-show';
      showMood('😋');
    }else if(s==='walk'){
      cat.style.animation='dp-walkBob .6s ease-in-out infinite';
      setTail('fast');
      startWalking();
    }else{
      scheduleIdle();
    }
  }

  /* ── 随机闲置 ── */
  function scheduleIdle(){
    clearTimeout(idleTimer);
    idleTimer=setTimeout(()=>{
      if(state!=='idle')return;
      const r=Math.random();
      if(r<.3){showMood('😺');setState('happy');setTimeout(()=>setState('idle'),2000)}
      else if(r<.5){showMood('🐟');setState('eat');setTimeout(()=>setState('idle'),2500)}
      else scheduleIdle();
    },CFG.idleTimeout+Math.random()*5000);
  }

  /* ── 走路 ── */
  function startWalking(){
    if(state!=='walk')return;
    let curRight=parseInt(wrap.style.right)||CFG.right;
    curRight-=walkDir*1.5;
    if(curRight>CFG.right+CFG.walkRange)walkDir=-1;
    if(curRight<CFG.right-CFG.walkRange)walkDir=1;
    curRight=Math.max(4,curRight);
    wrap.style.right=curRight+'px';
    wrap.style.left='auto';
    cat.style.transform=walkDir<0?'scaleX(-1)':'scaleX(1)';
    walkRAF=requestAnimationFrame(()=>setTimeout(startWalking,30));
  }

  /* ── 拖拽 ── */
  function onDown(e){
    if(e.target.id==='dp-close')return;
    isDragging=false;
    dragSX=e.clientX||(e.touches&&e.touches[0].clientX)||0;
    dragSY=e.clientY||(e.touches&&e.touches[0].clientY)||0;
    const r=wrap.getBoundingClientRect();
    startL=r.left;startT=r.top;
    cat.classList.add('dp-dragging');
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
    cat.classList.remove('dp-dragging');
    document.removeEventListener('pointermove',onMove);
    document.removeEventListener('pointerup',onUp);
    if(isDragging){showMood('😠');setTimeout(()=>setState('idle'),1500)}
  }

  /* ── 点击 ── */
  let clickLock=false;
  cat.addEventListener('click',e=>{
    if(isDragging||clickLock)return;
    e.stopPropagation();
    clickLock=true;
    setTimeout(()=>clickLock=false,300);
    const fns=[
      ()=>{setState('happy');setTimeout(()=>setState('idle'),2000)},
      ()=>{setState('eat');setTimeout(()=>setState('idle'),2500)},
      ()=>{setState('angry');setTimeout(()=>setState('idle'),1800)},
      ()=>{showMood('❤️');setState('happy');setTimeout(()=>setState('idle'),2000)},
    ];
    fns[Math.floor(Math.random()*fns.length)]();
  });

  /* ── 隐藏/显示 ── */
  $('dp-close').addEventListener('click',e=>{
    e.stopPropagation();
    wrap.style.display='none';
    restore.style.display='flex';
  });
  restore.addEventListener('click',()=>{
    wrap.style.display='';
    restore.style.display='none';
    setState('idle');
  });

  /* ── 绑定 ── */
  cat.addEventListener('pointerdown',onDown);

  /* ── 响应式 ── */
  function onResize(){
    const s=sz();
    wrap.style.fontSize=s+'px';
    const br=isMobile()?CFG.mobileBottom:CFG.bottom;
    const rr=isMobile()?CFG.mobileRight:CFG.right;
    restore.style.bottom=br+'px';
    restore.style.right=rr+'px';
    if(!isDragging){wrap.style.right=rr+'px';wrap.style.left='auto';wrap.style.bottom=br+'px';wrap.style.top='auto'}
  }
  window.addEventListener('resize',onResize);
  onResize();

  /* ── 阅读时自动缩小 ── */
  let scrollTimer;
  window.addEventListener('scroll',()=>{
    clearTimeout(scrollTimer);
    const y=scrollY;
    if(y>300){
      wrap.style.transform='scale(.7)';
      wrap.style.opacity='.6';
      wrap.style.transition='transform .3s,opacity .3s';
    }else{
      wrap.style.transform='';
      wrap.style.opacity='';
    }
  },{passive:true});

  /* ── 启动 ── */
  scheduleIdle();

  /* ── API ── */
  window.DesktopCat={setState,show:()=>{wrap.style.display='';restore.style.display='none';setState('idle')},hide:()=>{wrap.style.display='none';restore.style.display='flex'},getState:()=>state};
})();
