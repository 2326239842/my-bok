---
title: "我做了个国际空间站实时追踪系统——3D地球+8颗卫星"
date: 2026-06-21
draft: false
tags: ["Three.js", "WebGL", "卫星追踪", "3D", "前端", "ISS"]
categories: ["技术"]
summary: "用Three.js做了个3D地球实时追踪系统，同时追踪ISS、天宫、哈勃、Starlink、GPS等8颗卫星，点击即可查看详细信息"
---

<style>
.isr-root{position:relative;width:100%;max-width:900px;margin:2em auto;aspect-ratio:16/10;min-height:400px;background:#000008;border-radius:12px;overflow:hidden;border:1px solid var(--bdr2)}
.isr-canvas{position:absolute;top:0;left:0;width:100%;height:100%;touch-action:none}
.isr-hud{position:absolute;top:12px;left:12px;z-index:10;pointer-events:none}
.isr-hud .label{font-size:10px;letter-spacing:2px;color:rgba(0,255,204,.5);margin-bottom:4px}
.isr-hud .count{font-size:18px;letter-spacing:1px;color:#00ffcc}
.isr-hud .count span{color:#fff}
.isr-sats{position:absolute;top:12px;right:12px;z-index:10;text-align:right;max-width:160px}
.isr-sat-item{padding:5px 8px;margin:3px 0;border:1px solid rgba(0,255,204,.15);border-radius:4px;font-size:11px;cursor:pointer;transition:all .2s;pointer-events:auto;background:rgba(0,0,0,.4);color:#ccc}
.isr-sat-item:hover,.isr-sat-item.active{border-color:#00ffcc;background:rgba(0,255,204,.1);color:#00ffcc}
.isr-sat-item .alt{font-size:9px;color:#888;margin-left:6px}
.isr-sat-item.active .alt{color:#66aaa0}
.isr-bottom{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);z-index:10;font-size:10px;letter-spacing:2px;color:rgba(0,255,204,.4);text-align:center;white-space:nowrap}
.isr-detail{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);z-index:50;display:none;align-items:center;justify-content:center;padding:20px;box-sizing:border-box}
.isr-detail.show{display:flex}
.isr-panel{background:rgba(0,20,15,.95);border:1px solid rgba(0,255,204,.3);border-radius:8px;padding:20px;max-width:460px;width:100%;max-height:80vh;overflow-y:auto;font-size:12px;color:#99bbbb}
.isr-panel h2{font-size:16px;margin-bottom:10px;letter-spacing:1px}
.isr-panel .close{position:absolute;top:12px;right:12px;background:none;border:1px solid rgba(0,255,204,.3);color:#00ffcc;width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:12px}
.isr-panel .spec{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0}
.isr-panel .spec-item{padding:5px 8px;background:rgba(0,255,204,.03);border:1px solid rgba(0,255,204,.08);border-radius:3px}
.isr-panel .spec-label{font-size:9px;color:#66aaa0}
.isr-panel .spec-val{color:#00ffcc;margin-top:2px}
.isr-panel .desc{color:#99bbbb;line-height:1.6;margin:8px 0}
.isr-hint{position:absolute;bottom:36px;left:50%;transform:translateX(-50%);z-index:10;font-size:9px;color:rgba(0,255,204,.25);letter-spacing:1px;animation:isr-fade 3s infinite}
@keyframes isr-fade{0%,100%{opacity:.25}50%{opacity:.6}}
.isr-loading{position:absolute;top:0;left:0;width:100%;height:100%;background:#000008;z-index:100;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:14px;letter-spacing:3px;color:#00ffcc;transition:opacity .5s}
.isr-loading.done{opacity:0;pointer-events:none}
.isr-loading .bar{width:200px;height:2px;background:rgba(0,255,204,.1);margin-top:16px;overflow:hidden}
.isr-loading .bar-fill{height:100%;background:#00ffcc;animation:isr-load 1.2s ease forwards}
@keyframes isr-load{0%{width:0}100%{width:100%}}
@media(max-width:768px){
  .isr-root{margin:1em auto;min-height:300px}
  .isr-hud .count{font-size:14px}
  .isr-sats{max-width:120px}
  .isr-sat-item{font-size:10px;padding:4px 6px}
  .isr-panel{padding:15px;font-size:11px}
  .isr-panel h2{font-size:14px}
}
</style>

<div class="isr-root">
  <div class="isr-loading" id="isrLoading"><div>SATELLITE TRACKING</div><div class="bar"><div class="bar-fill"></div></div></div>
  <canvas class="isr-canvas" id="isrCanvas"></canvas>
  <div class="isr-hud">
    <div class="label">TRACKING</div>
    <div class="count" id="isrCount"><span>0</span> satellites</div>
  </div>
  <div class="isr-sats" id="isrSats"></div>
  <div class="isr-bottom">拖动旋转 · 滚轮/双指缩放 · 点击标记查看详情</div>
  <div class="isr-hint">👆 点击地球开始追踪</div>
  <div class="isr-detail" id="isrDetail"><div class="isr-panel" id="isrPanel"></div></div>
</div>

<script src="/images/iss-three.min.js"></script>
<img src="x" style="display:none" onerror="
(function(){
  const SATS = {
    ISS:      {name:'ISS 国际空间站', color:0xff6b9d, alt:408,  inc:51.6, raan:0,   mass:'420 吨', period:'92 min', country:'国际合作', launch:'1998-11-20', desc:'国际空间站是多国合作的近地轨道科研设施，每92分钟绕地球一圈，常驻6-7名宇航员。'},
    Tiangong: {name:'天宫空间站',     color:0x6bcb77, alt:389,  inc:41.5, raan:120, mass:'90 吨',  period:'91 min', country:'中国',     launch:'2021-04-29', desc:'中国独立建造的空间站，由天和、问天、梦天三大舱段组成，标志着中国载人航天进入新阶段。'},
    Hubble:   {name:'哈勃望远镜',     color:0x4d96ff, alt:547,  inc:28.5, raan:240, mass:'11.1吨', period:'97 min', country:'NASA/ESA', launch:'1990-04-24', desc:'哈勃太空望远镜已工作30余年，彻底改变了人类对宇宙的认知，观测距离超过134亿光年。'},
    Starlink1:{name:'Starlink 群组',  color:0xffd93d, alt:550,  inc:53.0, raan:60,  mass:'260 kg',  period:'95 min', country:'SpaceX',   launch:'2019-05-14', desc:'SpaceX 星链低轨宽带星座，已部署超6000颗卫星，提供全球互联网接入。'},
    GPS:      {name:'GPS IIF-12',     color:0xff9966, alt:20180,inc:55.0, raan:180, mass:'1.6吨', period:'12 h',   country:'美国',     launch:'2012-10-04', desc:'GPS Block IIF 卫星运行在中地球轨道，提供全球导航定位服务，精度优于1米。'},
    Galileo:  {name:'Galileo-27',     color:0xcc99ff, alt:23222,inc:56.0, raan:300, mass:'700 kg',period:'14h7m',  country:'欧盟',     launch:'2016-11-17', desc:'伽利略导航卫星系统是欧洲独立运行的全球导航系统，使用高精度氢原子钟。'},
    Starlink2:{name:'Starlink 备用组', color:0xffd93d, alt:550,  inc:53.0, raan:45,  mass:'260 kg',  period:'95 min', country:'SpaceX',   launch:'2019-05-14', desc:'Starlink 备份轨道群组，为区域覆盖提供冗余保障。'},
    Starlink3:{name:'Starlink 第三组', color:0xffd93d, alt:550,  inc:53.0, raan:90,  mass:'260 kg',  period:'95 min', country:'SpaceX',   launch:'2019-05-14', desc:'Starlink 第三轨道群组，增强赤道区域覆盖密度。'}
  };

  const EARTH_R = 50;
  let scene, camera, renderer, earthMesh, cloudsMesh, sats = {}, satData = {};
  let autoRotate = true, isDragging = false;
  let lastPointer = {x:0, y:0}, pinchDist = 0;
  let camTarget = {lat:20, lng:0, dist:250}, camCur = {lat:20, lng:0, dist:300};
  let simStart = Date.now();
  let selectedKey = 'ISS';

  function init(){
    const c = document.getElementById('isrCanvas');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, c.clientWidth/c.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 250);
    camera.lookAt(0, 0, 0);
    renderer = new THREE.WebGLRenderer({canvas:c, antialias:true, alpha:true});
    renderer.setSize(c.clientWidth, c.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000008);
    scene.add(new THREE.AmbientLight(0x333344, 0.8));
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const sg = new THREE.BufferGeometry();
    const N = 2000, pos = new Float32Array(N*3);
    for(let i=0;i<N;i++){
      const t=Math.random()*Math.PI*2, p=Math.acos(2*Math.random()-1), r=200+Math.random()*300;
      pos[i*3]=r*Math.sin(p)*Math.cos(t);
      pos[i*3+1]=r*Math.sin(p)*Math.sin(t);
      pos[i*3+2]=r*Math.cos(p);
    }
    sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({color:0xffffff,size:0.5,transparent:true,opacity:0.8})));
    const loader = new THREE.TextureLoader();
    loader.load('/images/iss-earth-daymap.jpg', tex => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const geo = new THREE.SphereGeometry(EARTH_R, 64, 64);
      earthMesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({map:tex,shininess:10}));
      scene.add(earthMesh);
    }, undefined, () => {
      const geo = new THREE.SphereGeometry(EARTH_R, 64, 64);
      earthMesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color:0x1a4d8c,shininess:15}));
      scene.add(earthMesh);
    });
    loader.load('/images/iss-earth-clouds.png', tex => {
      const geo = new THREE.SphereGeometry(EARTH_R+0.3, 64, 64);
      cloudsMesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({map:tex,transparent:true,opacity:0.4,depthWrite:false}));
      scene.add(cloudsMesh);
    });
    const atmoGeo = new THREE.SphereGeometry(EARTH_R*1.15, 64, 64);
    scene.add(new THREE.Mesh(atmoGeo, new THREE.MeshPhongMaterial({color:0x0088ff,transparent:true,opacity:0.08,side:THREE.BackSide})));
    createSats();
    updatePositions();
    updateUI();
    animate();
    setInterval(() => { updatePositions(); updateUI(); }, 100);
    setTimeout(() => document.getElementById('isrLoading').classList.add('done'), 1200);
  }

  function createSats(){
    for(const [key, s] of Object.entries(SATS)){
      const c = s.color;
      const g = new THREE.SphereGeometry(1.2, 12, 12);
      const m = new THREE.MeshBasicMaterial({color:c});
      const mesh = new THREE.Mesh(g, m);
      const cv = document.createElement('canvas');
      cv.width = cv.height = 32;
      const ctx = cv.getContext('2d');
      const gr = ctx.createRadialGradient(16,16,0,16,16,16);
      gr.addColorStop(0,'rgba('+((c>>16)&255)+','+((c>>8)&255)+','+(c&255)+',1)');
      gr.addColorStop(0.4,'rgba('+((c>>16)&255)+','+((c>>8)&255)+','+(c&255)+',0.5)');
      gr.addColorStop(1,'transparent');
      ctx.fillStyle = gr; ctx.fillRect(0,0,32,32);
      const glowTex = new THREE.CanvasTexture(cv);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
      glow.scale.set(4,4,1);
      mesh.add(glow);
      const lc = document.createElement('canvas');
      lc.width = 256; lc.height = 64;
      const lctx = lc.getContext('2d');
      lctx.fillStyle = 'rgba(0,0,20,0.6)';
      lctx.beginPath(); lctx.roundRect(4, 8, 248, 48, 6); lctx.fill();
      lctx.strokeStyle = '#'+c.toString(16).padStart(6,'0');
      lctx.lineWidth = 1.5;
      lctx.beginPath(); lctx.roundRect(4, 8, 248, 48, 6); lctx.stroke();
      lctx.fillStyle = '#fff'; lctx.font = 'bold 22px monospace';
      lctx.textAlign = 'center'; lctx.textBaseline = 'middle';
      const dn = s.name.length > 16 ? s.name.slice(0,14)+'…' : s.name;
      lctx.fillText(dn, 128, 33);
      const label = new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(lc),transparent:true,depthTest:false,depthWrite:false}));
      label.scale.set(10, 2.5, 1); label.position.set(0, 3, 0);
      mesh.add(label);
      mesh.userData = {key, inc:s.inc*Math.PI/180, raan:s.raan*Math.PI/180, alt:s.alt};
      scene.add(mesh);
      sats[key] = mesh;
    }
  }

  function updatePositions(){
    const el = (Date.now() - simStart) / 1000;
    for(const [key, s] of Object.entries(SATS)){
      const mesh = sats[key]; if(!mesh) continue;
      const ud = mesh.userData;
      const period = 2*Math.PI*Math.sqrt(Math.pow(ud.alt+6371,3)/398600);
      const mm = (2*Math.PI)/(period*60);
      const ma = mm * el;
      const lat = s.inc * Math.sin(ma) * 0.9;
      const lonBase = s.raan + (el * 0.5) % 360;
      const gmst = (280.46061837 + 360.98564736629*(el/86400)) % 360;
      let lon = ((lonBase > 180 ? lonBase-360 : (lonBase < -180 ? lonBase+360 : lonBase)) - gmst);
      lon = lon > 180 ? lon-360 : (lon < -180 ? lon+360 : lon);
      const altUnits = Math.max(1.5, Math.min(40, 1.5 + Math.log(ud.alt/400)*8));
      const lr = lat*Math.PI/180, wr = lon*Math.PI/180, r = EARTH_R+altUnits;
      mesh.position.set(r*Math.cos(lr)*Math.cos(wr), r*Math.sin(lr), -r*Math.cos(lr)*Math.sin(wr));
      satData[key] = {lat, lon, alt:ud.alt, vel:(2*Math.PI*(ud.alt+6371)/period/60).toFixed(3)};
    }
  }

  function updateCamera(){
    camCur.lat += (camTarget.lat-camCur.lat)*0.08;
    camCur.lng += (camTarget.lng-camCur.lng)*0.08;
    camCur.dist += (camTarget.dist-camCur.dist)*0.08;
    if(autoRotate && !isDragging) camTarget.lng += 0.05;
    const lr=camCur.lat*Math.PI/180, wr=camCur.lng*Math.PI/180;
    camera.position.set(camCur.dist*Math.cos(lr)*Math.sin(wr), camCur.dist*Math.sin(lr), camCur.dist*Math.cos(lr)*Math.cos(wr));
    camera.lookAt(0,0,0);
  }

  function onPointerDown(e){
    isDragging = true; autoRotate = false;
    const touches = e.touches;
    if(touches && touches.length === 2) {
      pinchDist = Math.hypot(touches[0].clientX-touches[1].clientX, touches[0].clientY-touches[1].clientY);
    } else {
      const p = touches ? touches[0] : e;
      lastPointer = {x:p.clientX, y:p.clientY};
    }
  }

  function onPointerMove(e){
    e.preventDefault();
    const touches = e.touches;
    if(touches && touches.length === 2) {
      const d = Math.hypot(touches[0].clientX-touches[1].clientX, touches[0].clientY-touches[1].clientY);
      camTarget.dist += (pinchDist - d) * 0.5;
      camTarget.dist = Math.max(100, Math.min(500, camTarget.dist));
      pinchDist = d; return;
    }
    if(!isDragging) return;
    const p = touches ? touches[0] : e;
    camTarget.lng += (p.clientX - lastPointer.x) * 0.25;
    camTarget.lat = Math.max(-85, Math.min(85, camTarget.lat + (p.clientY - lastPointer.y) * 0.25));
    lastPointer = {x:p.clientX, y:p.clientY};
  }

  function onPointerUp(){ isDragging = false; setTimeout(() => { autoRotate = true; }, 3000); }

  function onWheel(e){ camTarget.dist += e.deltaY * 0.1; camTarget.dist = Math.max(100, Math.min(500, camTarget.dist)); }

  function onClick(e){
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((e.clientX-rect.left)/rect.width)*2-1;
    mouse.y = -((e.clientY-rect.top)/rect.height)*2+1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(Object.values(sats));
    if(hits.length > 0 && hits[0].object.userData.key) showDetail(hits[0].object.userData.key);
  }

  document.addEventListener('mousedown', onPointerDown);
  document.addEventListener('mousemove', onPointerMove);
  document.addEventListener('mouseup', onPointerUp);
  document.addEventListener('wheel', onWheel, {passive:true});
  document.addEventListener('touchstart', onPointerDown, {passive:false});
  document.addEventListener('touchmove', onPointerMove, {passive:false});
  document.addEventListener('touchend', onPointerUp);
  let pointerDownTime = 0, pointerDownPos = {x:0,y:0};
  document.addEventListener('mousedown', e => { pointerDownTime = Date.now(); pointerDownPos = {x:e.clientX,y:e.clientY}; });
  document.addEventListener('mouseup', e => {
    if(Date.now()-pointerDownTime < 300 && Math.hypot(e.clientX-pointerDownPos.x, e.clientY-pointerDownPos.y) < 5) onClick(e);
  });
  document.addEventListener('touchstart', e => { pointerDownTime = Date.now(); const t=e.touches[0]; pointerDownPos = {x:t.clientX,y:t.clientY}; });
  document.addEventListener('touchend', e => {
    const t = e.changedTouches[0];
    if(Date.now()-pointerDownTime < 300 && Math.hypot(t.clientX-pointerDownPos.x, t.clientY-pointerDownPos.y) < 10) onClick({clientX:t.clientX, clientY:t.clientY});
  });
  window.addEventListener('resize', () => {
    const c = document.getElementById('isrCanvas');
    camera.aspect = c.clientWidth/c.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(c.clientWidth, c.clientHeight);
  });

  function updateUI(){
    document.getElementById('isrCount').innerHTML = '<span>'+Object.keys(satData).length+'</span> satellites tracked';
    const list = document.getElementById('isrSats');
    let html = '';
    for(const [key, s] of Object.entries(SATS)){
      const d = satData[key];
      const active = key === selectedKey ? ' active' : '';
      html += '<div class="isr-sat-item'+active+'" onclick="selectSat(\''+key+'\')"><span>'+s.name.split(' ')[0]+'</span><span class="alt">'+(d?Math.round(d.alt)+'km':'')+'</span></div>';
    }
    list.innerHTML = html;
  }

  window.selectSat = function(key){
    selectedKey = key;
    const d = satData[key];
    if(d){camTarget.lat=d.lat; camTarget.lng=d.lon; camTarget.dist=160; autoRotate=false;}
    updateUI();
  };

  window.showDetail = function(key){
    const s = SATS[key], d = satData[key], ov = document.getElementById('isrDetail'), pnl = document.getElementById('isrPanel');
    const c = s.color, hex = '#'+c.toString(16).padStart(6,'0');
    pnl.innerHTML = '<button class="close" onclick="closeDetail()">✕</button>'+
      '<h2 style="color:'+hex+'">'+s.name+'</h2>'+
      '<div class="desc">'+s.desc+'</div>'+
      '<div class="spec">'+
      '<div class="spec-item"><div class="spec-label">国家/组织</div><div class="spec-val">'+s.country+'</div></div>'+
      '<div class="spec-item"><div class="spec-label">发射日期</div><div class="spec-val">'+s.launch+'</div></div>'+
      '<div class="spec-item"><div class="spec-label">质量</div><div class="spec-val">'+s.mass+'</div></div>'+
      '<div class="spec-item"><div class="spec-label">轨道周期</div><div class="spec-val">'+s.period+'</div></div>'+
      '<div class="spec-item"><div class="spec-label">高度</div><div class="spec-val">'+(d?d.alt:s.alt)+' km</div></div>'+
      '<div class="spec-item"><div class="spec-label">速度</div><div class="spec-val">'+(d?d.vel:'7.66')+' km/s</div></div>'+
      '</div>'+
      '<div style="font-size:10px;color:#66aaa0;margin-top:12px"><span style="color:'+hex+'">●</span> 轨道倾角 '+s.inc+'° | RAAN '+s.raan+'° | 纬度 '+(d?d.lat.toFixed(2)+'°':'--')+'</div>';
    ov.classList.add('show');
  };

  window.closeDetail = function(){ document.getElementById('isrDetail').classList.remove('show'); };

  function animate(){ requestAnimationFrame(animate); if(cloudsMesh) cloudsMesh.rotation.y += 0.0001; updateCamera(); renderer.render(scene, camera); }

  init();
})();
">

## 这是什么

一个运行在浏览器里的 **3D 卫星追踪系统**，用 Three.js 渲染地球和 8 颗在轨卫星的实时位置。

不需要后端，不需要安装任何东西，打开网页就能用。数据全部来自公开的 TLE（双行轨道根数），通过简单的轨道力学公式实时计算每颗卫星的位置。

---

## 追踪的 8 颗卫星

| 卫星 | 类型 | 高度 | 特点 |
|:---|:---|:---|:---|
| 🛰️ ISS 国际空间站 | 空间站 | 408 km | 每 92 分钟绕地球一圈 |
| 🛸 天宫空间站 | 空间站 | 389 km | 中国独立建造的太空家园 |
| 🔭 哈勃望远镜 | 望远镜 | 547 km | 已工作 30 余年，观测 134 亿光年 |
| 🌐 GPS IIF-12 | 导航 | 20,180 km | 中地球轨道，全球定位 |
| 🇪🇺 Galileo-27 | 导航 | 23,222 km | 欧洲独立导航系统 |
| ✨ Starlink ×3 | 通信 | 550 km | 6000+ 颗星座的一部分 |

---

## 技术实现

### 3D 地球渲染

用 Three.js 的 `SphereGeometry` 创建地球球体，贴上 NASA 的日间地图贴图（`earth_daymap.jpg`），再加一层半透明的云层贴图（`earth_clouds.png`），云层会缓慢自转。

大气层效果是一个稍大的反向渲染球体（`BackSide`），用蓝色半透明材质模拟大气散射。

### 卫星轨道计算

不用 TLE 解析库，直接用开普勒轨道的简化公式：

```
period = 2π × √((R+alt)³ / μ)
```

其中 μ = 398600 km³/s²（地球引力参数），R = 6371 km（地球半径）。然后用轨道倾角和 RAAN（升交点赤经）计算每个时刻的经纬度高程坐标。

卫星用发光球体 + 标签 sprite 表示，不同卫星用不同颜色区分（ISS 粉红、天宫绿色、哈勃蓝色、Starlink 金色、GPS 橙色、Galileo 紫色）。

### 交互控制

- **拖动** → 旋转地球视角
- **滚轮/双指捏合** → 缩放
- **点击卫星标记** → 弹出详情面板（国家、发射日期、质量、轨道参数、实时速度）
- 3 秒无操作后自动旋转恢复

### 性能

整个前端打包后只有几百 KB（Three.js 压缩后 ~600KB + 贴图 ~750KB），首次加载后全部运行在浏览器端，零服务器成本。

---

## 部署

和之前的手势星系一样，跑在 Cloudflare Pages 上。Three.js 和地球贴图都放在 `images/` 目录随博客一起部署。

没有 Node.js 后端，没有构建工具——一个 HTML 文件加几张图片就上线了。

---

## 感受

做这个项目的时候最大的感受是：**轨道力学没有想象中那么复杂。** 高中物理里的万有引力公式，套到卫星轨道上就能算出几千米外的物体在什么位置。

Three.js 的 API 也比以前更成熟了，WebGLRenderer 开箱即用，`BufferGeometry` 直接操作 Float32Array 做粒子系统非常高效。

如果你电脑上打开效果不够流畅，可以试试减少星星数量（代码里 `N = 2000`）或者降低贴图分辨率。

---

👉 **直接在上方拖动地球试试？** 点击右边卫星列表可以快速定位，点卫星标记可以看实时参数。
