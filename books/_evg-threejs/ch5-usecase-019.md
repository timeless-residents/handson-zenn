---
title: Usecase-019 Cosmic Nebula Effect
---
# Usecase-019: Cosmic Nebula Effect

**本章では、`usecases/usecase-019` ディレクトリに格納されている「Cosmic Nebula Effect」のコードを解説します。**  
このサンプルは、宇宙の星雲を模した粒子ベースのエフェクトを実装しています。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、粒子システムとインタラクティブな光線効果を組み合わせた例となっています。

---

## 1. 宇宙の星雲表現

これまでのユースケースでは、様々な形状とアニメーション効果を扱ってきました。`usecase-019` では、宇宙の星雲を表現するために、粒子システムと光線効果を組み合わせています。

このサンプルでは、暗い背景に対して、カラフルな粒子の集合体と星々、そして光線効果を組み合わせることで、神秘的な宇宙の星雲の雰囲気を作り出しています。また、マウスの動きに応じて光線の方向が変わるインタラクティブな要素も追加されています。

`usecase-019` では、以下の特徴を持つシーンを作成しています：

1. **星雲の粒子**: 球体状に配置された多数の粒子
2. **星空の背景**: 遠方に配置された星々
3. **光線効果**: 中心から放射される光線
4. **インタラクティブな動き**: マウスの位置に応じて変化する光線の方向
5. **アニメーション効果**: 回転、明滅、色の変化などの動的な効果

これらの効果を組み合わせることで、生き生きとした宇宙の星雲を表現しています。

---

## 2. `usecase-019/index.js` コード詳細

それでは、実際の `usecase-019` のコードを詳しく見ていきましょう。

```js
// usecase-019/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase019 extends UseCaseBase {
  static metadata = {
    id: "019",
    title: "Cosmic Nebula Effect",
    description:
      "Interactive particle-based nebula with cosmic dust and light rays",
    categories: ["Particles", "Animation", "Lighting", "Space"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
    this.particles = null;
    this.starField = null;
    this.rayLight = null;
    this.mouse = { x: 0, y: 0 };
  }

  static setupScene(scene) {
    // 背景を暗い青に設定
    scene.background = new THREE.Color(0x000510);

    const objects = [];
    const geometries = [];

    // 環境光を追加（非常に弱め）
    const ambientLight = new THREE.AmbientLight(0x111122, 0.2);
    scene.add(ambientLight);
    objects.push(ambientLight);

    // 星雲の粒子を作成
    const particleCount = 5000;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // 星雲の色のグラデーションを定義
    const colorPalette = [
      new THREE.Color(0x4455dd), // 青
      new THREE.Color(0x9955ff), // 紫
      new THREE.Color(0xff5566), // ピンク
      new THREE.Color(0x22aadd), // 水色
    ];

    // 粒子の形状は球体の中にランダムに配置
    const radius = 5;
    for (let i = 0; i < particleCount; i++) {
      // 極座標を使って球体内にランダムに配置
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      // 中心に近いほど密度が高くなるように
      const r = Math.pow(Math.random(), 1.5) * radius;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // 距離に基づいて色を選択
      const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
      const normalizedDistance = distanceFromCenter / radius;

      // 色をブレンド
      const colorIndex = Math.min(
        Math.floor(normalizedDistance * colorPalette.length),
        colorPalette.length - 1
      );
      const nextColorIndex = (colorIndex + 1) % colorPalette.length;
      const blendFactor = normalizedDistance * colorPalette.length - colorIndex;

      const color = new THREE.Color().copy(colorPalette[colorIndex]);
      color.lerp(colorPalette[nextColorIndex], blendFactor);

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // 粒子のサイズもランダム
      sizes[i] = 0.1 + Math.random() * 0.3;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );
    particleGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    // シェーダーマテリアルを作成
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    objects.push(particles);
    geometries.push(particleGeometry);

    // 星空の背景を作成
    const starCount = 2000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      // 星を球体の外側にランダムに配置
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * 2 + Math.random() * radius * 3;

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      // 星のサイズ
      starSizes[i] = 0.01 + Math.random() * 0.03;

      // 星の色（白～青～黄色）
      const starColor = new THREE.Color();
      const hue = Math.random() > 0.8 ? 0.15 : Math.random() > 0.7 ? 0.6 : 0;
      const saturation = Math.random() * 0.3;
      const lightness = 0.8 + Math.random() * 0.2;
      starColor.setHSL(hue, saturation, lightness);

      starColors[i * 3] = starColor.r;
      starColors[i * 3 + 1] = starColor.g;
      starColors[i * 3 + 2] = starColor.b;
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3)
    );
    starGeometry.setAttribute("size", new THREE.BufferAttribute(starSizes, 1));
    starGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(starColors, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
    objects.push(starField);
    geometries.push(starGeometry);

    // ライトレイ効果を追加
    const rayGeometry = new THREE.CylinderGeometry(0, 0.5, 5, 16, 1, true);
    const rayMaterial = new THREE.MeshBasicMaterial({
      color: 0x3366ff,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const rayLight = new THREE.Mesh(rayGeometry, rayMaterial);
    rayLight.position.set(0, 0, 0);
    rayLight.rotation.set(Math.PI / 2, 0, 0);
    rayLight.scale.set(1, 1, 1);
    scene.add(rayLight);
    objects.push(rayLight);
    geometries.push(rayGeometry);

    return {
      objects,
      geometries,
      particles,
      starField,
      rayLight,
    };
  }

  static updateObjects(
    objects,
    particles,
    starField,
    rayLight,
    time,
    mouse = { x: 0, y: 0 }
  ) {
    if (!particles || !starField || !rayLight) return;

    // 星雲の動き
    particles.rotation.y = time * 0.05;
    particles.rotation.z = time * 0.03;

    // 明滅効果
    const pulseIntensity = 0.7 + 0.3 * Math.sin(time * 0.5);
    particles.material.opacity = 0.7 * pulseIntensity;

    // 星の点滅
    starField.rotation.y = time * 0.02;

    // マウス位置に基づいてライトレイを動かす
    if (rayLight) {
      rayLight.rotation.x = Math.PI / 2 + mouse.y * 0.5;
      rayLight.rotation.z = mouse.x * 0.5;
      rayLight.material.opacity = 0.2 + 0.1 * Math.sin(time * 2);
    }
  }

  async init() {
    const { objects, particles, starField, rayLight } =
      GeometryShowcase019.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
    this.particles = particles;
    this.starField = starField;
    this.rayLight = rayLight;

    // マウスイベントを追加
    window.addEventListener("mousemove", this.handleMouseMove.bind(this));
  }

  handleMouseMove(event) {
    // 正規化されたマウス座標を計算 (-1 から 1 の範囲)
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase019.updateObjects(
      Array.from(this.objects),
      this.particles,
      this.starField,
      this.rayLight,
      this.time,
      this.mouse
    );
  }

  dispose() {
    super.dispose();
    // イベントリスナーを削除
    window.removeEventListener("mousemove", this.handleMouseMove.bind(this));
  }

  static getThumbnailCameraPosition() {
    return {
      position: [0, 0, 10],
      target: [0, 0, 0],
    };
  }

  // getThumbnailBlob と createPreview メソッドは省略
}
```

### 2-1. `metadata`

```js
static metadata = {
  id: "019",
  title: "Cosmic Nebula Effect",
  description:
    "Interactive particle-based nebula with cosmic dust and light rays",
  categories: ["Particles", "Animation", "Lighting", "Space"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `019`、 `title` は「Cosmic Nebula Effect」など。
- `description` には、インタラクティブな粒子ベースの星雲と宇宙塵、光線について言及されています。
- `categories` に「Particles」と「Space」が追加されており、粒子システムと宇宙をテーマにしていることを示しています。

### 2-2. `constructor`

```js
constructor(scene) {
  super(scene);
  this.time = 0;
  this.particles = null;
  this.starField = null;
  this.rayLight = null;
  this.mouse = { x: 0, y: 0 };
}
```

コンストラクタでは、いくつかの新しいプロパティを追加しています：
- `particles`: 星雲の粒子を表すオブジェクト
- `starField`: 星空の背景を表すオブジェクト
- `rayLight`: 光線効果を表すオブジェクト
- `mouse`: マウスの位置を保存するオブジェクト

### 2-3. `setupScene(scene)`

```js
static setupScene(scene) {
  // 背景を暗い青に設定
  scene.background = new THREE.Color(0x000510);

  const objects = [];
  const geometries = [];

  // 環境光を追加（非常に弱め）
  const ambientLight = new THREE.AmbientLight(0x111122, 0.2);
  scene.add(ambientLight);
  objects.push(ambientLight);

  // 星雲の粒子を作成
  const particleCount = 5000;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  // 星雲の色のグラデーションを定義
  const colorPalette = [
    new THREE.Color(0x4455dd), // 青
    new THREE.Color(0x9955ff), // 紫
    new THREE.Color(0xff5566), // ピンク
    new THREE.Color(0x22aadd), // 水色
  ];

  // 粒子の形状は球体の中にランダムに配置
  const radius = 5;
  for (let i = 0; i < particleCount; i++) {
    // 極座標を使って球体内にランダムに配置
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    // 中心に近いほど密度が高くなるように
    const r = Math.pow(Math.random(), 1.5) * radius;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // 距離に基づいて色を選択
    const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
    const normalizedDistance = distanceFromCenter / radius;

    // 色をブレンド
    const colorIndex = Math.min(
      Math.floor(normalizedDistance * colorPalette.length),
      colorPalette.length - 1
    );
    const nextColorIndex = (colorIndex + 1) % colorPalette.length;
    const blendFactor = normalizedDistance * colorPalette.length - colorIndex;

    const color = new THREE.Color().copy(colorPalette[colorIndex]);
    color.lerp(colorPalette[nextColorIndex], blendFactor);

    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    // 粒子のサイズもランダム
    sizes[i] = 0.1 + Math.random() * 0.3;
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  particleGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colors, 3)
  );
  particleGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  // シェーダーマテリアルを作成
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
  objects.push(particles);
  geometries.push(particleGeometry);

  // 星空の背景を作成
  const starCount = 2000;
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    // 星を球体の外側にランダムに配置
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * 2 + Math.random() * radius * 3;

    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = r * Math.cos(phi);

    // 星のサイズ
    starSizes[i] = 0.01 + Math.random() * 0.03;

    // 星の色（白～青～黄色）
    const starColor = new THREE.Color();
    const hue = Math.random() > 0.8 ? 0.15 : Math.random() > 0.7 ? 0.6 : 0;
    const saturation = Math.random() * 0.3;
    const lightness = 0.8 + Math.random() * 0.2;
    starColor.setHSL(hue, saturation, lightness);

    starColors[i * 3] = starColor.r;
    starColors[i * 3 + 1] = starColor.g;
    starColors[i * 3 + 2] = starColor.b;
  }

  starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(starPositions, 3)
  );
  starGeometry.setAttribute("size", new THREE.BufferAttribute(starSizes, 1));
  starGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(starColors, 3)
  );

  const starMaterial = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);
  objects.push(starField);
  geometries.push(starGeometry);

  // ライトレイ効果を追加
  const rayGeometry = new THREE.CylinderGeometry(0, 0.5, 5, 16, 1, true);
  const rayMaterial = new THREE.MeshBasicMaterial({
    color: 0x3366ff,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const rayLight = new THREE.Mesh(rayGeometry, rayMaterial);
  rayLight.position.set(0, 0, 0);
  rayLight.rotation.set(Math.PI / 2, 0, 0);
  rayLight.scale.set(1, 1, 1);
  scene.add(rayLight);
  objects.push(rayLight);
  geometries.push(rayGeometry);

  return {
    objects,
    geometries,
    particles,
    starField,
    rayLight,
  };
}
```

ここでは、宇宙の星雲を表現するために、3つの主要な要素を作成しています：

1. **背景と照明の設定**:
   ```js
   scene.background = new THREE.Color(0x000510);

   const ambientLight = new THREE.AmbientLight(0x111122, 0.2);
   scene.add(ambientLight);
   objects.push(ambientLight);
   ```
   
   背景を暗い青（`0x000510`）に設定し、非常に弱い環境光を追加しています。これにより、宇宙空間の雰囲気が作り出されています。

2. **星雲の粒子の作成**:
   ```js
   const particleCount = 5000;
   const particleGeometry = new THREE.BufferGeometry();
   const positions = new Float32Array(particleCount * 3);
   const colors = new Float32Array(particleCount * 3);
   const sizes = new Float32Array(particleCount);

   // 星雲の色のグラデーションを定義
   const colorPalette = [
     new THREE.Color(0x4455dd), // 青
     new THREE.Color(0x9955ff), // 紫
     new THREE.Color(0xff5566), // ピンク
     new THREE.Color(0x22aadd), // 水色
   ];

   // 粒子の形状は球体の中にランダムに配置
   const radius = 5;
   for (let i = 0; i < particleCount; i++) {
     // 極座標を使って球体内にランダムに配置
     const theta = Math.random() * Math.PI * 2;
     const phi = Math.acos(2 * Math.random() - 1);
     // 中心に近いほど密度が高くなるように
     const r = Math.pow(Math.random(), 1.5) * radius;

     const x = r * Math.sin(phi) * Math.cos(theta);
     const y = r * Math.sin(phi) * Math.sin(theta);
     const z = r * Math.cos(phi);

     positions[i * 3] = x;
     positions[i * 3 + 1] = y;
     positions[i * 3 + 2] = z;

     // 距離に基づいて色を選択
     const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
     const normalizedDistance = distanceFromCenter / radius;

     // 色をブレンド
     const colorIndex = Math.min(
       Math.floor(normalizedDistance * colorPalette.length),
       colorPalette.length - 1
     );
     const nextColorIndex = (colorIndex + 1) % colorPalette.length;
     const blendFactor = normalizedDistance * colorPalette.length - colorIndex;

     const color = new THREE.Color().copy(colorPalette[colorIndex]);
     color.lerp(colorPalette[nextColorIndex], blendFactor);

     colors[i * 3] = color.r;
     colors[i * 3 + 1] = color.g;
     colors[i * 3 + 2] = color.b;

     // 粒子のサイズもランダム
     sizes[i] = 0.1 + Math.random() * 0.3;
   }

   particleGeometry.setAttribute(
     "position",
     new THREE.BufferAttribute(positions, 3)
   );
   particleGeometry.setAttribute(
     "color",
     new THREE.BufferAttribute(colors, 3)
   );
   particleGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

   // シェーダーマテリアルを作成
   const particleMaterial = new THREE.PointsMaterial({
     size: 0.1,
     vertexColors: true,
     transparent: true,
     opacity: 0.8,
     blending: THREE.AdditiveBlending,
     depthWrite: false,
   });

   const particles = new THREE.Points(particleGeometry, particleMaterial);
   scene.add(particles);
   objects.push(particles);
   geometries.push(particleGeometry);
   ```
   
   5000個の粒子を使って星雲を表現しています。粒子は球体内にランダムに配置され、中心に近いほど密度が高くなるように設定されています。また、中心からの距離に応じて色が変化するようになっています。色は青、紫、ピンク、水色のグラデーションで表現されています。

   粒子のマテリアルには、`THREE.PointsMaterial` を使用し、加算合成（`THREE.AdditiveBlending`）を適用することで、光が重なると明るくなる効果を実現しています。

3. **星空の背景の作成**:
   ```js
   const starCount = 2000;
   const starGeometry = new THREE.BufferGeometry();
   const starPositions = new Float32Array(starCount * 3);
   const starSizes = new Float32Array(starCount);
   const starColors = new Float32Array(starCount * 3);

   for (let i = 0; i < starCount; i++) {
     // 星を球体の外側にランダムに配置
     const theta = Math.random() * Math.PI * 2;
     const phi = Math.acos(2 * Math.random() - 1);
     const r = radius * 2 + Math.random() * radius * 3;

     starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
     starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
     starPositions[i * 3 + 2] = r * Math.cos(phi);

     // 星のサイズ
     starSizes[i] = 0.01 + Math.random() * 0.03;

     // 星の色（白～青～黄色）
     const starColor = new THREE.Color();
     const hue = Math.random() > 0.8 ? 0.15 : Math.random() > 0.7 ? 0.6 : 0;
     const saturation = Math.random() * 0.3;
     const lightness = 0.8 + Math.random() * 0.2;
     starColor.setHSL(hue, saturation, lightness);

     starColors[i * 3] = starColor.r;
     starColors[i * 3 + 1] = starColor.g;
     starColors[i * 3 + 2] = starColor.b;
   }

   starGeometry.setAttribute(
     "position",
     new THREE.BufferAttribute(starPositions, 3)
   );
   starGeometry.setAttribute("size", new THREE.BufferAttribute(starSizes, 1));
   starGeometry.setAttribute(
     "color",
     new THREE.BufferAttribute(starColors, 3)
   );

   const starMaterial = new THREE.PointsMaterial({
     size: 0.05,
     vertexColors: true,
     transparent: true,
     opacity: 0.8,
     blending: THREE.AdditiveBlending,
     depthWrite: false,
   });

   const starField = new THREE.Points(starGeometry, starMaterial);
   scene.add(starField);
   objects.push(starField);
   geometries.push(starGeometry);
   ```
   
   2000個の粒子を使って星空の背景を表現しています。星は星雲の外側の球体上にランダムに配置されています。星の色は、白、青、黄色の3種類があり、それぞれの確率で出現するようになっています。

4. **光線効果の追加**:
   ```js
   const rayGeometry = new THREE.CylinderGeometry(0, 0.5, 5, 16, 1, true);
   const rayMaterial = new THREE.MeshBasicMaterial({
     color: 0x3366ff,
     transparent: true,
     opacity: 0.3,
     blending: THREE.AdditiveBlending,
     side: THREE.DoubleSide,
     depthWrite: false,
   });

   const rayLight = new THREE.Mesh(rayGeometry, rayMaterial);
   rayLight.position.set(0, 0, 0);
   rayLight.rotation.set(Math.PI / 2, 0, 0);
   rayLight.scale.set(1, 1, 1);
   scene.add(rayLight);
   objects.push(rayLight);
   geometries.push(rayGeometry);
   ```
   
   円錐形のジオメトリを使って光線効果を表現しています。円錐の先端が中心に来るように配置し、加算合成と透明度を適用することで、光が放射されているような効果を実現しています。

### 2-4. `updateObjects(objects, particles, starField, rayLight, time, mouse)`

```js
static updateObjects(
  objects,
  particles,
  starField,
  rayLight,
  time,
  mouse = { x: 0, y: 0 }
) {
  if (!particles || !starField || !rayLight) return;

  // 星雲の動き
  particles.rotation.y = time * 0.05;
  particles.rotation.z = time * 0.03;

  // 明滅効果
  const pulseIntensity = 0.7 + 0.3 * Math.sin(time * 0.5);
  particles.material.opacity = 0.7 * pulseIntensity;

  // 星の点滅
  starField.rotation.y = time * 0.02;

  // マウス位置に基づいてライトレイを動かす
  if (rayLight) {
    rayLight.rotation.x = Math.PI / 2 + mouse.y * 0.5;
    rayLight.rotation.z = mouse.x * 0.5;
    rayLight.material.opacity = 0.2 + 0.1 * Math.sin(time * 2);
  }
}
```

ここでは、星雲、星空、光線のアニメーションを更新しています。主な特徴は以下の通りです：

1. **星雲の動き**:
   ```js
   particles.rotation.y = time * 0.05;
   particles.rotation.z = time * 0.03;
   ```
   
   星雲全体がゆっくりと回転します。Y軸周りの回転速度は0.05、Z軸周りの回転速度は0.03です。これにより、星雲がゆっくりと動いているように見えます。

2. **明滅効果**:
   ```js
   const pulseIntensity = 0.7 + 0.3 * Math.sin(time * 0.5);
   particles.material.opacity = 0.7 * pulseIntensity;
   ```
   
   星雲の透明度が時間とともに変化します。透明度は0.49から0.91の範囲で変化します。これにより、星雲が明滅しているように見えます。

3. **星の点滅**:
   ```js
   starField.rotation.y = time * 0.02;
   ```
   
   星空全体がゆっくりと回転します。回転速度は0.02と非常に遅いため、ほとんど気づかないほどの動きになっています。

4. **光線の動き**:
   ```js
   rayLight.rotation.x = Math.PI / 2 + mouse.y * 0.5;
   rayLight.rotation.z = mouse.x * 0.5;
   rayLight.material.opacity = 0.2 + 0.1 * Math.sin(time * 2);
   ```
   
   光線の向きがマウスの位置に応じて変化します。また、光線の透明度も時間とともに変化します。これにより、光線が動いているように見えます。

### 2-5. `init()`

```js
async init() {
  const { objects, particles, starField, rayLight } =
    GeometryShowcase019.setupScene(this.scene);
  objects.forEach((obj) => this.objects.add(obj));
  this.particles = particles;
  this.starField = starField;
  this.rayLight = rayLight;

  // マウスイベントを追加
  window.addEventListener("mousemove", this.handleMouseMove.bind(this));
}
```

`init()` メソッドでは、シーンのセットアップ後に各オブジェクトを保存し、マウスイベントを追加しています。

### 2-6. `handleMouseMove(event)`

```js
handleMouseMove(event) {
  // 正規化されたマウス座標を計算 (-1 から 1 の範囲)
  this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
```

マウスの位置を正規化して保存しています。正規化された座標は、-1から1の範囲になります。

### 2-7. `dispose()`

```js
dispose() {
  super.dispose();
  // イベントリスナーを削除
  window.removeEventListener("mousemove", this.handleMouseMove.bind(this));
}
```

`dispose()` メソッドでは、イベントリスナーを削除しています。これにより、メモリリークを防ぐことができます。

---

## 3. 粒子システムの詳細

`usecase-019` では、`THREE.Points` を使って粒子システムを実装しています。粒子システムは、多数の小さな点を使って、煙、火、雲、星雲などの複雑な形状を表現するための手法です。

### 3-1. BufferGeometryを使った粒子の配置

```js
const particleCount = 5000;
const particleGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);

// 粒子の形状は球体の中にランダムに配置
const radius = 5;
for (let i = 0; i < particleCount; i++) {
  // 極座標を使って球体内にランダムに配置
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  // 中心に近いほど密度が高くなるように
  const r = Math.pow(Math.random(), 1.5) * radius;

  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);

  positions[i * 3] = x;
  positions[i * 3 + 1] = y;
  positions[i * 3 + 2] = z;
  
  // ...
}

particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
```

`THREE.BufferGeometry` を使って、粒子の位置を設定しています。粒子は球体内にランダムに配置されていますが、中心に近いほど密度が高くなるように設定されています。これは、`Math.pow(Math.random(), 1.5)` を使って実現しています。指数が1より大きいため、小さい値がより小さくなり、大きい値はあまり変化しません。これにより、中心に近い粒子が多くなります。

また、粒子の配置には極座標を使用しています。極座標は、3次元空間内の点を、原点からの距離（r）、xy平面からの角度（φ）、x軸からの角度（θ）で表現する座標系です。これを使うことで、球体内に均一にランダムな点を配置することができます。

### 3-2. 粒子の色と大きさの設定

```js
// 距離に基づいて色を選択
const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
const normalizedDistance = distanceFromCenter / radius;

// 色をブレンド
const colorIndex = Math.min(
  Math.floor(normalizedDistance * colorPalette.length),
  colorPalette.length - 1
);
const nextColorIndex = (colorIndex + 1) % colorPalette.length;
const blendFactor = normalizedDistance * colorPalette.length - colorIndex;

const color = new THREE.Color().copy(colorPalette[colorIndex]);
color.lerp(colorPalette[nextColorIndex], blendFactor);

colors[i * 3] = color.r;
colors[i * 3 + 1] = color.g;
colors[i * 3 + 2] = color.b;

// 粒子のサイズもランダム
sizes[i] = 0.1 + Math.random() * 0.3;
```

粒子の色は、中心からの距離に応じて変化するようになっています。色は、あらかじめ定義された色のパレット（青、紫、ピンク、水色）から選ばれ、隣接する色の間で線形補間（lerp）されます。これにより、滑らかな色のグラデーションが実現されています。

また、粒子のサイズもランダムに設定されています。サイズは0.1から0.4の範囲でランダムに設定されています。

### 3-3. PointsMaterialの設定

```js
const particleMaterial = new THREE.PointsMaterial({
  size: 0.1,
  vertexColors: true,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
```

`THREE.PointsMaterial` を使って、粒子のマテリアルを設定しています。主な特徴は以下の通りです：

1. **size**: 粒子の基本サイズを0.1に設定しています。
2. **vertexColors**: 頂点ごとに色を設定できるようにしています。
3. **transparent**: 透明度を有効にしています。
4. **opacity**: 透明度を0.8に設定しています。
5. **blending**: 加算合成（`THREE.AdditiveBlending`）を適用しています。これにより、粒子が重なると明るくなる効果が得られます。
6. **depthWrite**: 深度バッファへの書き込みを無効にしています。これにより、透明なオブジェクト同士の重なりが正しく表示されます。

これらの設定により、星雲のような柔らかく発光する効果が実現されています。

---

## 4. インタラクティブな光線効果

`usecase-019` では、マウスの位置に応じて光線の向きが変わるインタラクティブな効果を実装しています。

### 4-1. 円錐形ジオメトリを使った光線の表現

```js
const rayGeometry = new THREE.CylinderGeometry(0, 0.5, 5, 16, 1, true);
const rayMaterial = new THREE.MeshBasicMaterial({
  color: 0x3366ff,
  transparent: true,
  opacity: 0.3,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
  depthWrite: false,
});

const rayLight = new THREE.Mesh(rayGeometry, rayMaterial);
rayLight.position.set(0, 0, 0);
rayLight.rotation.set(Math.PI / 2, 0, 0);
rayLight.scale.set(1, 1, 1);
```

光線は、`THREE.CylinderGeometry` を使って表現されています。円柱の一方の端の半径を0にすることで、円錐形を作成しています。また、`openEnded` パラメータを `true` に設定することで、円錐の底面を開いた状態にしています。

マテリアルには、`THREE.MeshBasicMaterial` を使用し、加算合成と透明度を適用することで、光が放射されているような効果を実現しています。

### 4-2. マウス位置に応じた光線の向きの変更

```js
handleMouseMove(event) {
  // 正規化されたマウス座標を計算 (-1 から 1 の範囲)
  this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

static updateObjects(
  objects,
  particles,
  starField,
  rayLight,
  time,
  mouse = { x: 0, y: 0 }
) {
  // ...
  
  // マウス位置に基づいてライトレイを動かす
  if (rayLight) {
    rayLight.rotation.x = Math.PI / 2 + mouse.y * 0.5;
    rayLight.rotation.z = mouse.x * 0.5;
    rayLight.material.opacity = 0.2 + 0.1 * Math.sin(time * 2);
  }
}
```

マウスの位置を正規化して保存し、その値に基づいて光線の回転角度を変更しています。マウスのX座標は光線のZ軸周りの回転に、Y座標はX軸周りの回転に影響します。これにより、マウスを動かすと光線の向きが変わるインタラクティブな効果が実現されています。

また、光線の透明度も時間とともに変化するようになっています。これにより、光線が明滅しているように見えます。

### 4-3. イベントリスナーの管理

```js
async init() {
  // ...
  
  // マウスイベントを追加
  window.addEventListener("mousemove", this.handleMouseMove.bind(this));
}

dispose() {
  super.dispose();
  // イベントリスナーを削除
  window.removeEventListener("mousemove", this.handleMouseMove.bind(this));
}
```

`init()` メソッドでマウスイベントのリスナーを追加し、`dispose()` メソッドでリスナーを削除しています。これにより、メモリリークを防ぐことができます。

---

## 5. 応用例：宇宙の星雲表現の拡張

`usecase-019` のコードをベースに、以下のような拡張が考えられます：

### 5-1. 複数の星雲を作成する

```js
// 複数の星雲を作成
const nebulaCount = 3;
const nebulae = [];

for (let n = 0; n < nebulaCount; n++) {
  const particleCount = 2000;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  
  // 星雲の位置をランダムに設定
  const nebulaX = (Math.random() - 0.5) * 20;
  const nebulaY = (Math.random() - 0.5) * 20;
  const nebulaZ = (Math.random() - 0.5) * 20;
  
  // 星雲の色をランダムに設定
  const nebulaHue = Math.random();
  const colorPalette = [
    new THREE.Color().setHSL(nebulaHue, 0.7, 0.5),
    new THREE.Color().setHSL((nebulaHue + 0.1) % 1, 0.8, 0.6),
    new THREE.Color().setHSL((nebulaHue + 0.2) % 1, 0.9, 0.7),
    new THREE.Color().setHSL((nebulaHue + 0.3) % 1, 0.7, 0.5)
  ];
  
  // 粒子を配置
  const radius = 2 + Math.random() * 3;
  for (let i = 0; i < particleCount; i++) {
    // 極座標を使って球体内にランダムに配置
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.pow(Math.random(), 1.5) * radius;
    
    const x = r * Math.sin(phi) * Math.cos(theta) + nebulaX;
    const y = r * Math.sin(phi) * Math.sin(theta) + nebulaY;
    const z = r * Math.cos(phi) + nebulaZ;
    
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    
    // 色とサイズを設定
    // ...
  }
  
  // 属性を設定
  // ...
  
  // マテリアルを作成
  // ...
  
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
  objects.push(particles);
  nebulae.push(particles);
}
```

複数の星雲を作成し、それぞれ異なる位置と色を持たせることで、より複雑な宇宙空間を表現することができます。

### 5-2. 星雲の形状を変化させる

```js
// 星雲の形状を変化させる
const shapeType = Math.floor(Math.random() * 3);

for (let i = 0; i < particleCount; i++) {
  let x, y, z;
  
  if (shapeType === 0) {
    // 球体
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.pow(Math.random(), 1.5) * radius;
    
    x = r * Math.sin(phi) * Math.cos(theta);
    y = r * Math.sin(phi) * Math.sin(theta);
    z = r * Math.cos(phi);
  } else if (shapeType === 1) {
    // 円盤
    const theta = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * radius;
    
    x = r * Math.cos(theta);
    y = (Math.random() - 0.5) * radius * 0.2;
    z = r * Math.sin(theta);
  } else {
    // 渦巻き
    const theta = Math.random() * Math.PI * 10;
    const r = Math.sqrt(Math.random()) * radius;
    
    x = r * Math.cos(theta);
    y = (Math.random() - 0.5) * radius * 0.2;
    z = r * Math.sin(theta);
  }
  
  positions[i * 3] = x;
  positions[i * 3 + 1] = y;
  positions[i * 3 + 2] = z;
  
  // ...
}
```

星雲の形状を球体、円盤、渦巻きなど、異なる形状にすることで、より多様な宇宙の星雲を表現することができます。

### 5-3. 星雲の動きを複雑にする

```js
// 星雲の動きを更新
function updateNebulae(time) {
  nebulae.forEach((nebula, index) => {
    // 回転
    nebula.rotation.x = time * 0.02 * (index + 1);
    nebula.rotation.y = time * 0.03 * (index + 1);
    nebula.rotation.z = time * 0.01 * (index + 1);
    
    // 脈動
    const scale = 1 + 0.1 * Math.sin(time * 0.5 + index);
    nebula.scale.set(scale, scale, scale);
    
    // 明滅
    const opacity = 0.5 + 0.3 * Math.sin(time * 0.3 + index * 2);
    nebula.material.opacity = opacity;
  });
}
```

星雲の回転、スケール、透明度を時間とともに変化させることで、より動的な宇宙空間を表現することができます。

### 5-4. 惑星や小惑星を追加する

```js
// 惑星を追加
const planetCount = 3;
const planets = [];

for (let i = 0; i < planetCount; i++) {
  const radius = 0.5 + Math.random() * 1.5;
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  
  // テクスチャを選択
  const textureIndex = Math.floor(Math.random() * planetTextures.length);
  const texture = planetTextures[textureIndex];
  
  const material = new THREE.MeshPhongMaterial({
    map: texture,
    shininess: 10
  });
  
  const planet = new THREE.Mesh(geometry, material);
  
  // 惑星の位置をランダムに設定
  const distance = 10 + Math.random() * 20;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  
  planet.position.x = distance * Math.sin(phi) * Math.cos(theta);
  planet.position.y = distance * Math.sin(phi) * Math.sin(theta);
  planet.position.z = distance * Math.cos(phi);
  
  scene.add(planet);
  objects.push(planet);
  planets.push(planet);
}

// 小惑星帯を追加
const asteroidCount = 200;
const asteroids = [];

for (let i = 0; i < asteroidCount; i++) {
  const radius = 0.05 + Math.random() * 0.1;
  const geometry = new THREE.IcosahedronGeometry(radius, 0);
  const material = new THREE.MeshPhongMaterial({
    color: 0x888888,
    shininess: 0
  });
  
  const asteroid = new THREE.Mesh(geometry, material);
  
  // 小惑星の位置を円環状に設定
  const distance = 15 + Math.random() * 2;
  const theta = Math.random() * Math.PI * 2;
  
  asteroid.position.x = distance * Math.cos(theta);
  asteroid.position.y = (Math.random() - 0.5) * 2;
  asteroid.position.z = distance * Math.sin(theta);
  
  scene.add(asteroid);
  objects.push(asteroid);
  asteroids.push(asteroid);
}
```

惑星や小惑星を追加することで、より本格的な宇宙空間を表現することができます。

---

## 6. まとめ

「**Usecase-019: Cosmic Nebula Effect**」では、Three.jsで宇宙の星雲を表現する方法を学びました。

主なポイントは以下の通りです：

1. **粒子システム**: `THREE.Points` と `THREE.BufferGeometry` を使って、多数の粒子を配置し、星雲を表現しました。
2. **色のグラデーション**: 中心からの距離に応じて色が変化するグラデーションを実装しました。
3. **加算合成**: `THREE.AdditiveBlending` を使って、粒子が重なると明るくなる効果を実現しました。
4. **インタラクティブな光線効果**: マウスの位置に応じて光線の向きが変わるインタラクティブな効果を実装しました。
5. **アニメーション効果**: 回転、明滅、色の変化などの動的な効果を追加しました。

これらの技術を組み合わせることで、神秘的で美しい宇宙の星雲を表現することができます。また、これらの技術は、他の粒子ベースのエフェクト（煙、火、雲など）にも応用することができます。

次のユースケースでは、さらに複雑な形状や動きを持つ3Dシーンを探索していきます。
