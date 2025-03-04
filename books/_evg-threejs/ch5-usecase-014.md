---
title: Usecase-014 Rotating Rings
---
# Usecase-014: Rotating Rings

**本章では、`usecases/usecase-014` ディレクトリに格納されている「Rotating Rings」のコードを解説します。**  
このサンプルは、異なる半径を持つ8つの同心円状のリング（トーラス）が、それぞれ異なる速度で回転し、色が変化するアニメーションを実装しています。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、同心円状の配置と複数のアニメーション効果を組み合わせた例となっています。

---

## 1. 同心円状のリングと複合アニメーション

これまでのユースケースでは、グリッド状や直線状など、様々な配置パターンを扱ってきました。`usecase-014` では、同心円状という新しい配置パターンを導入しています。

同心円状の配置は、中心を共有する複数の円（この場合はトーラス）を配置するパターンです。これにより、中心から外側に向かって広がる視覚的な効果を作り出すことができます。

`usecase-014` では、以下の特徴を持つシーンを作成しています：

1. **同心円状のリング**: 異なる半径を持つ8つのトーラスを同心円状に配置
2. **回転アニメーション**: 各リングが異なる速度でX軸とY軸周りに回転
3. **色の変化**: 時間とともに各リングの色が変化
4. **スケールの脈動**: 各リングのサイズが周期的に拡大・縮小

これらのアニメーション効果を組み合わせることで、複雑で魅力的な視覚表現を実現しています。

---

## 2. `usecase-014/index.js` コード詳細

それでは、実際の `usecase-014` のコードを詳しく見ていきましょう。

```js
// usecase-014/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase014 extends UseCaseBase {
  static metadata = {
    id: "014",
    title: "Rotating Rings",
    description: "Concentric rings rotating with dynamic colors",
    categories: ["Geometry", "Animation", "Rings"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
  }

  static setupScene(scene) {
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    const objects = [];
    const geometries = [];
    const numRings = 8;

    // Create rings with different radii
    for (let i = 0; i < numRings; i++) {
      const radius = 1 + i * 0.5;
      const tubeRadius = 0.1;
      const geometry = new THREE.TorusGeometry(radius, tubeRadius, 16, 100);
      geometries.push(geometry);

      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / numRings, 0.7, 0.5),
      });

      const ring = new THREE.Mesh(geometry, material);
      scene.add(ring);
      objects.push(ring);
    }

    return { objects, geometries };
  }

  static updateObjects(objects, time) {
    objects.forEach((ring, i) => {
      // Rotation animation
      ring.rotation.x = time * (0.2 + i * 0.1);
      ring.rotation.y = time * (0.3 + i * 0.1);

      // Color animation
      const hue = (time * 0.1 + i * 0.1) % 1;
      ring.material.color.setHSL(hue, 0.7, 0.5);

      // Scale pulsing
      const scale = 1 + Math.sin(time * 2 + i) * 0.1;
      ring.scale.set(scale, scale, scale);
    });
  }

  async init() {
    const { objects } = GeometryShowcase014.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase014.updateObjects(Array.from(this.objects), this.time);
  }

  static getThumbnailCameraPosition() {
    return {
      position: [8, 8, 8],
      target: [0, 0, 0],
    };
  }

  static getThumbnailBlob() {
    // サムネイル生成用のSVG（省略）
  }

  static createPreview(container) {
    // プレビュー生成用のコード（省略）
  }
}
```

### 2-1. `metadata`

```js
static metadata = {
  id: "014",
  title: "Rotating Rings",
  description: "Concentric rings rotating with dynamic colors",
  categories: ["Geometry", "Animation", "Rings"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `014`、 `title` は「Rotating Rings」など。
- `description` には、同心円状のリングが回転し、色が変化することについて言及されています。
- `categories` に新しく「Rings」が追加されています。

### 2-2. `setupScene(scene)`

```js
static setupScene(scene) {
  // Add lights
  const ambientLight = new THREE.AmbientLight(0x404040);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(ambientLight, directionalLight);

  const objects = [];
  const geometries = [];
  const numRings = 8;

  // Create rings with different radii
  for (let i = 0; i < numRings; i++) {
    const radius = 1 + i * 0.5;
    const tubeRadius = 0.1;
    const geometry = new THREE.TorusGeometry(radius, tubeRadius, 16, 100);
    geometries.push(geometry);

    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(i / numRings, 0.7, 0.5),
    });

    const ring = new THREE.Mesh(geometry, material);
    scene.add(ring);
    objects.push(ring);
  }

  return { objects, geometries };
}
```

ここでは、8つの同心円状のリングを作成しています。主な特徴は以下の通りです：

1. **ライトの設定**:
   ```js
   const ambientLight = new THREE.AmbientLight(0x404040);
   const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
   directionalLight.position.set(5, 5, 5);
   scene.add(ambientLight, directionalLight);
   ```
   
   環境光と平行光を設定しています。環境光の色は暗めのグレー（`0x404040`）で、平行光は白色（`0xffffff`）です。

2. **リングの数**:
   ```js
   const numRings = 8;
   ```
   
   作成するリングの数を定義しています。

3. **リングの作成**:
   ```js
   for (let i = 0; i < numRings; i++) {
     const radius = 1 + i * 0.5;
     const tubeRadius = 0.1;
     const geometry = new THREE.TorusGeometry(radius, tubeRadius, 16, 100);
     geometries.push(geometry);

     const material = new THREE.MeshPhongMaterial({
       color: new THREE.Color().setHSL(i / numRings, 0.7, 0.5),
     });

     const ring = new THREE.Mesh(geometry, material);
     scene.add(ring);
     objects.push(ring);
   }
   ```
   
   ループを使って、8つのリングを作成しています。各リングの特徴は以下の通りです：
   
   - **半径**: `radius = 1 + i * 0.5` により、内側から外側に向かって半径が大きくなります。最も内側のリングの半径は1、最も外側のリングの半径は4.5になります。
   - **チューブの半径**: `tubeRadius = 0.1` により、すべてのリングのチューブの太さが0.1になります。
   - **ジオメトリ**: `THREE.TorusGeometry` を使って、トーラス（ドーナツ形状）を作成しています。
   - **マテリアル**: `THREE.MeshPhongMaterial` を使って、光沢のあるマテリアルを作成しています。色は、インデックス `i` に応じて変化します。
   - **メッシュ**: ジオメトリとマテリアルからメッシュを作成し、シーンに追加しています。

### 2-3. `updateObjects(objects, time)`

```js
static updateObjects(objects, time) {
  objects.forEach((ring, i) => {
    // Rotation animation
    ring.rotation.x = time * (0.2 + i * 0.1);
    ring.rotation.y = time * (0.3 + i * 0.1);

    // Color animation
    const hue = (time * 0.1 + i * 0.1) % 1;
    ring.material.color.setHSL(hue, 0.7, 0.5);

    // Scale pulsing
    const scale = 1 + Math.sin(time * 2 + i) * 0.1;
    ring.scale.set(scale, scale, scale);
  });
}
```

ここでは、各リングの回転、色、スケールを更新しています。主な特徴は以下の通りです：

1. **回転アニメーション**:
   ```js
   ring.rotation.x = time * (0.2 + i * 0.1);
   ring.rotation.y = time * (0.3 + i * 0.1);
   ```
   
   各リングがX軸とY軸周りに回転します。回転速度は、インデックス `i` に応じて増加します。例えば：
   - リング0（最も内側）: X軸回転速度 = 0.2, Y軸回転速度 = 0.3
   - リング7（最も外側）: X軸回転速度 = 0.9, Y軸回転速度 = 1.0

2. **色のアニメーション**:
   ```js
   const hue = (time * 0.1 + i * 0.1) % 1;
   ring.material.color.setHSL(hue, 0.7, 0.5);
   ```
   
   各リングの色が時間とともに変化します。色相（Hue）は、時間とインデックス `i` に応じて変化します。`% 1` により、色相の値が0から1の範囲に収まります。

3. **スケールの脈動**:
   ```js
   const scale = 1 + Math.sin(time * 2 + i) * 0.1;
   ring.scale.set(scale, scale, scale);
   ```
   
   各リングのサイズが周期的に拡大・縮小します。スケールの値は、0.9から1.1の範囲で変化します。インデックス `i` を加えることで、各リングの脈動のタイミングがずれます。

これらのアニメーション効果を組み合わせることで、複雑で魅力的な視覚表現を実現しています。

### 2-4. `getThumbnailCameraPosition()`

```js
static getThumbnailCameraPosition() {
  return {
    position: [8, 8, 8],
    target: [0, 0, 0],
  };
}
```

サムネイル用のカメラ位置が変更されています。リング全体を見渡せるように、カメラが斜め上から見下ろす位置に配置されています。

---

## 3. 前章との比較

`usecase-014` は前章までと基本的な構造は同じですが、以下の点が異なります：

1. **同心円状の配置**: グリッド状や直線状ではなく、同心円状にオブジェクトを配置
2. **トーラスジオメトリ**: キューブや球体ではなく、トーラス（ドーナツ形状）を使用
3. **複合アニメーション**: 回転、色の変化、スケールの脈動という3つのアニメーション効果を組み合わせ
4. **インデックスに基づく段階的な変化**: インデックスに応じて、半径、回転速度、色、脈動のタイミングが段階的に変化

特に重要なのは、**同心円状の配置と複合アニメーション**が導入された点です。これにより、より複雑で魅力的な視覚表現を実現することができます。

---

## 4. TorusGeometryの詳細

`usecase-014` では、`THREE.TorusGeometry` を使って、トーラス（ドーナツ形状）を作成しています。トーラスは、円をある軸の周りに回転させて得られる立体です。

### 4-1. TorusGeometryのパラメータ

```js
const geometry = new THREE.TorusGeometry(radius, tubeRadius, 16, 100);
```

`THREE.TorusGeometry` のコンストラクタは、以下のパラメータを受け取ります：

1. **radius**: トーラスの中心から管の中心までの距離（全体の半径）
2. **tubeRadius**: 管自体の半径（管の太さ）
3. **radialSegments**: 管の断面の分割数（この場合は16）
4. **tubularSegments**: 管の中心線に沿った分割数（この場合は100）
5. **arc**: 中心角（省略された場合は2π、つまり完全な円）

`usecase-014` では、以下のパラメータを使用しています：

- **radius**: `1 + i * 0.5` により、内側から外側に向かって半径が大きくなります。
- **tubeRadius**: 0.1 で固定されています。
- **radialSegments**: 16 で固定されています。
- **tubularSegments**: 100 で固定されています。
- **arc**: 省略されているため、2π（完全な円）になります。

### 4-2. トーラスの数学的性質

トーラスは、以下のパラメトリック方程式で表されます：

x(u, v) = (R + r cos v) cos u
y(u, v) = (R + r cos v) sin u
z(u, v) = r sin v

ここで、
- R: トーラスの中心から管の中心までの距離（全体の半径）
- r: 管自体の半径（管の太さ）
- u: 0 から 2π までのパラメータ（管の中心線に沿った位置）
- v: 0 から 2π までのパラメータ（管の断面上の位置）

これらのパラメータは、`THREE.TorusGeometry` のコンストラクタのパラメータに対応しています。

---

## 5. 同心円状の配置とアニメーション

`usecase-014` では、同心円状の配置と複合アニメーションを組み合わせています。これにより、視覚的に魅力的な効果を生み出しています。

### 5-1. 同心円状の配置

```js
for (let i = 0; i < numRings; i++) {
  const radius = 1 + i * 0.5;
  // ...
}
```

同心円状の配置では、すべてのリングが同じ中心を共有し、半径だけが異なります。`usecase-014` では、最も内側のリングの半径が1、最も外側のリングの半径が4.5になるように設定しています。

同心円状の配置は、以下のような視覚効果を生み出します：

1. **中心からの広がり**: 中心から外側に向かって広がる視覚的な効果
2. **層状の構造**: 層状の構造により、奥行きと立体感を表現
3. **対称性**: 中心を軸とした対称性により、バランスの取れた構図

### 5-2. 複合アニメーション

```js
// Rotation animation
ring.rotation.x = time * (0.2 + i * 0.1);
ring.rotation.y = time * (0.3 + i * 0.1);

// Color animation
const hue = (time * 0.1 + i * 0.1) % 1;
ring.material.color.setHSL(hue, 0.7, 0.5);

// Scale pulsing
const scale = 1 + Math.sin(time * 2 + i) * 0.1;
ring.scale.set(scale, scale, scale);
```

`usecase-014` では、以下の3つのアニメーション効果を組み合わせています：

1. **回転アニメーション**: 各リングがX軸とY軸周りに回転します。回転速度は、インデックス `i` に応じて増加します。
2. **色のアニメーション**: 各リングの色が時間とともに変化します。色相（Hue）は、時間とインデックス `i` に応じて変化します。
3. **スケールの脈動**: 各リングのサイズが周期的に拡大・縮小します。脈動のタイミングは、インデックス `i` に応じてずれます。

これらのアニメーション効果を組み合わせることで、以下のような視覚効果を生み出します：

1. **動的な立体感**: 回転により、トーラスの3次元的な形状が強調されます。
2. **色の変化**: 色の変化により、視覚的な興味が引き立てられます。
3. **リズミカルな動き**: スケールの脈動により、リズミカルな動きが生まれます。
4. **複雑な動きのパターン**: 3つのアニメーション効果が組み合わさることで、複雑で予測しにくい動きのパターンが生まれます。

### 5-3. インデックスに基づく段階的な変化

```js
const radius = 1 + i * 0.5;
// ...
ring.rotation.x = time * (0.2 + i * 0.1);
ring.rotation.y = time * (0.3 + i * 0.1);
// ...
const hue = (time * 0.1 + i * 0.1) % 1;
// ...
const scale = 1 + Math.sin(time * 2 + i) * 0.1;
```

`usecase-014` では、インデックス `i` に基づいて、以下のパラメータが段階的に変化します：

1. **半径**: `radius = 1 + i * 0.5` により、内側から外側に向かって半径が大きくなります。
2. **回転速度**: `(0.2 + i * 0.1)` と `(0.3 + i * 0.1)` により、内側から外側に向かって回転速度が速くなります。
3. **色相のオフセット**: `i * 0.1` により、各リングの色相が少しずつずれます。
4. **脈動のタイミング**: `time * 2 + i` により、各リングの脈動のタイミングが少しずつずれます。

これらの段階的な変化により、以下のような視覚効果を生み出します：

1. **層状の動き**: 各層（リング）が異なる速度で動くことで、層状の動きが生まれます。
2. **波のような効果**: 脈動のタイミングがずれることで、波のような効果が生まれます。
3. **グラデーション効果**: 色相がずれることで、グラデーション効果が生まれます。

---

## 6. 応用例：同心円状の配置と複合アニメーションの拡張

`usecase-014` のコードをベースに、以下のような拡張が考えられます：

### 6-1. より多くのリングを追加する

```js
const numRings = 20;
const maxRadius = 10;

for (let i = 0; i < numRings; i++) {
  const radius = 1 + (i / numRings) * maxRadius;
  const tubeRadius = 0.05 + (i / numRings) * 0.1;
  // ...
}
```

リングの数を増やし、半径と管の太さを調整することで、より細かい層状の構造を作ることができます。

### 6-2. 異なる回転軸を使用する

```js
// Rotation animation
const angle = (i / numRings) * Math.PI * 2;
const rotationAxis = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).normalize();
ring.setRotationFromAxisAngle(rotationAxis, time * (0.2 + i * 0.1));
```

各リングが異なる軸周りに回転するようにすることで、より複雑な動きを作ることができます。

### 6-3. 波のようなアニメーションを追加する

```js
// Wave animation
const waveAmplitude = 0.5;
const waveFrequency = 2;
const wavePhase = i * 0.2;
const waveOffset = Math.sin(time * waveFrequency + wavePhase) * waveAmplitude;

ring.position.y = waveOffset;
```

各リングが上下に動くようにすることで、波のような効果を追加することができます。

### 6-4. インタラクティブな要素を追加する

```js
// マウスの位置を追跡
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

static updateObjects(objects, time, mouse) {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  
  objects.forEach((ring, i) => {
    // 基本的なアニメーション
    ring.rotation.x = time * (0.2 + i * 0.1);
    ring.rotation.y = time * (0.3 + i * 0.1);
    
    // マウスとの相互作用
    const intersects = raycaster.intersectObject(ring);
    if (intersects.length > 0) {
      // マウスが当たっているリングは大きく表示
      ring.scale.set(1.5, 1.5, 1.5);
      ring.material.color.setRGB(1, 1, 1); // 白色
    } else {
      // 通常のサイズと色
      const scale = 1 + Math.sin(time * 2 + i) * 0.1;
      ring.scale.set(scale, scale, scale);
      const hue = (time * 0.1 + i * 0.1) % 1;
      ring.material.color.setHSL(hue, 0.7, 0.5);
    }
  });
}
```

マウスとの相互作用を追加することで、ユーザーがリングと対話できるようにすることができます。

---

## 7. 同心円状の配置の応用例

同心円状の配置は、様々な視覚表現に応用することができます。以下に、同心円状の配置の応用例をいくつか紹介します。

### 7-1. 惑星の軌道

```js
const numPlanets = 8;

for (let i = 0; i < numPlanets; i++) {
  const orbitRadius = 1 + i * 1.5;
  const planetRadius = 0.1 + i * 0.05;
  
  // 軌道の作成
  const orbitGeometry = new THREE.TorusGeometry(orbitRadius, 0.02, 8, 100);
  const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
  const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2; // XZ平面に配置
  scene.add(orbit);
  
  // 惑星の作成
  const planetGeometry = new THREE.SphereGeometry(planetRadius, 32, 32);
  const planetMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL(i / numPlanets, 0.7, 0.5),
  });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  
  // 惑星の初期位置
  const angle = Math.random() * Math.PI * 2;
  planet.position.x = Math.cos(angle) * orbitRadius;
  planet.position.z = Math.sin(angle) * orbitRadius;
  
  scene.add(planet);
  objects.push({ planet, orbitRadius, angle });
}

// アニメーション
static updateObjects(objects, time) {
  objects.forEach((obj, i) => {
    // 惑星の公転
    const speed = 0.5 / (i + 1); // 内側ほど速く公転
    obj.angle += speed * 0.01;
    obj.planet.position.x = Math.cos(obj.angle) * obj.orbitRadius;
    obj.planet.position.z = Math.sin(obj.angle) * obj.orbitRadius;
    
    // 惑星の自転
    obj.planet.rotation.y += 0.02;
  });
}
```

### 7-2. 音楽の視覚化

```js
const numRings = 32;
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 64;
const dataArray = new Uint8Array(analyser.frequencyBinCount);

// オーディオの設定（省略）

for (let i = 0; i < numRings; i++) {
  const radius = 1 + i * 0.2;
  const tubeRadius = 0.05;
  const geometry = new THREE.TorusGeometry(radius, tubeRadius, 8, 50);
  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL(i / numRings, 0.7, 0.5),
  });
  const ring = new THREE.Mesh(geometry, material);
  scene.add(ring);
  objects.push(ring);
}

// アニメーション
static updateObjects(objects, time) {
  // オーディオデータの取得
  analyser.getByteFrequencyData(dataArray);
  
  objects.forEach((ring, i) => {
    // 周波数データに基づいてスケールを変更
    const value = dataArray[i] / 255; // 0から1の範囲に正規化
    const scale = 1 + value * 0.5;
    ring.scale.set(scale, scale, scale);
    
    // 回転
    ring.rotation.x = time * 0.2;
    ring.rotation.y = time * 0.3;
    
    // 色の変化
    const hue = (time * 0.1 + i * 0.1) % 1;
    const saturation = 0.5 + value * 0.5;
    const lightness = 0.3 + value * 0.4;
    ring.material.color.setHSL(hue, saturation, lightness);
  });
}
```

### 7-3. 時計

```js
const numHours = 12;
const numMinutes = 60;
const numSeconds = 60;

// 時計の文字盤
const clockRadius = 5;
const clockGeometry = new THREE.CylinderGeometry(clockRadius, clockRadius, 0.1, 60);
const clockMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const clock = new THREE.Mesh(clockGeometry, clockMaterial);
clock.rotation.x = Math.PI / 2; // XY平面に配置
scene.add(clock);

// 時間マーカー
for (let i = 0; i < numHours; i++) {
  const angle = (i / numHours) * Math.PI * 2;
  const markerRadius = clockRadius * 0.9;
  const x = Math.cos(angle) * markerRadius;
  const y = Math.sin(angle) * markerRadius;
  
  const markerGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.1);
  const markerMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);
  marker.position.set(x, y, 0.1);
  marker.rotation.z = angle;
  scene.add(marker);
}

// 針
const hourHandGeometry = new THREE.BoxGeometry(0.2, 2, 0.1);
const minuteHandGeometry = new THREE.BoxGeometry(0.1, 3, 0.1);
const secondHandGeometry = new THREE.BoxGeometry(0.05, 3.5, 0.1);

const hourHandMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
const minuteHandMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
const secondHandMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

const hourHand = new THREE.Mesh(hourHandGeometry, hourHandMaterial);
const minuteHand = new THREE.Mesh(minuteHandGeometry, minuteHandMaterial);
const secondHand = new THREE.Mesh(secondHandGeometry, secondHandMaterial);

hourHand.position.z = 0.3;
minuteHand.position.z = 0.4;
secondHand.position.z = 0.5;

scene.add(hourHand, minuteHand, secondHand);
objects.push({ hourHand, minuteHand, secondHand });

// アニメーション
static updateObjects(objects, time) {
  objects.forEach((obj) => {
    // 現在時刻の取得
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    
    // 針の角度の計算
    const hourAngle = ((hours + minutes / 60) / 12) * Math.PI * 2 - Math.PI / 2;
    const minuteAngle = ((minutes + seconds / 60) / 60) * Math.PI * 2 - Math.PI / 2;
    const secondAngle = ((seconds + milliseconds / 1000) / 60) * Math.PI * 2 - Math.PI / 2;
    
    // 針の回転
    obj.hourHand.rotation.z = hourAngle;
    obj.minuteHand.rotation.z = minuteAngle;
    obj.secondHand.rotation.z = secondAngle;
  });
}
```

---

## 8. まとめ

「**Usecase-014: Rotating Rings**」では、Three.jsで同心円状のリングを配置し、複合アニメーションを適用する方法を学びました。

主なポイントは以下の通りです：

1. **同心円状の配置**: 中心を共有する複数のリングを配置する方法を学びました。
2. **トーラスジオメトリ**: `THREE.TorusGeometry` を使って、トーラス（ドーナツ形状）を作成する方法を学びました。
3. **複合アニメーション**: 回転、色の変化、スケールの脈動という3つのアニメーション効果を組み合わせる方法を学びました。
4. **インデックスに基づく段階的な変化**: インデックスに応じて、半径、回転速度、色、脈動のタイミングを段階的に変化させる方法を学びました。

このサンプルは、Three.jsでの同心円状の配置と複合アニメーションの実装方法を示す良い例となっています。特に、複数のアニメーション効果を組み合わせることで、より複雑で魅力的な視覚表現を実現する手法は、様々な3Dアプリケーションで応用することができます。

---

## 9. 次のステップ

`usecase-014` を理解したら、次のステップとして以下のような発展が考えられます：

1. **より多くのリングを追加**: リングの数を増やし、より細かい層状の構造を作る。
2. **異なる回転軸を使用**: 各リングが異なる軸周りに回転するようにし、より複雑な動きを作る。
3. **波のようなアニメーションを追加**: リングが上下に動くようにし、波のような効果を追加する。
4. **インタラクティブな要素を追加**: マウスやキーボードの入力に応じて、リングの動きや色を変更する。
5. **異なるジオメトリを組み合わせる**: トーラスだけでなく、様々なジオメトリを組み合わせて使用する。

これらの発展は、今後のユースケースで順次紹介していく予定です。`usecase-014` で学んだ同心円状の配置と複合アニメーションの基本を応用することで、より高度な3D表現へと進んでいきましょう。
