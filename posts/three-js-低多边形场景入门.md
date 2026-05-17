---
title: "Three.js 低多边形场景入门"
date: 2026-05-08
tags: 技术,3D
summary: "用 Three.js 创建 Low Poly 3D 场景的入门教程。"
---

## 什么是 Low Poly
Low Poly 是一种用少量多边形建模的3D风格。

## 搭建场景

```
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,w/h,.1,1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
```

## 创建几何体

```
const geo = new THREE.IcosahedronGeometry(1,1);
const mat = new THREE.MeshPhongMaterial({color:0x00e89d,flatShading:true});
```
这就是低多边形的入门，后面会尝试更复杂的场景。
