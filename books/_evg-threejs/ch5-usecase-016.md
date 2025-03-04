---
title: Usecase-016 Crystal Formation
free: true
---
# Usecase-016: Crystal Formation

**本章では、`usecases/usecase-016` ディレクトリに格納されている「Crystal Formation」のコードを解説します。**  
このサンプルは、四面体（テトラヘドロン）を使用して結晶構造を表現し、それらを線で接続したアニメーションを実装しています。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、結晶のような構造と接続線を組み合わせた例となっています。

---

## 1. 結晶構造と接続線

これまでのユースケースでは、様々な配置パターンとアニメーション効果を扱ってきました。`usecase-016` では、結晶のような構造を表現するために、中心から放射状に配置された四面体と、それらを接続する線を組み合わせています。

結晶構造は、規則的な幾何学的パターンを持つ原子や分子の配列です。このサンプルでは、四面体（テトラヘドロン）を使用して結晶の「ノード」を表現し、それらを線で接続することで結晶の「結合」を表現しています。

`usecase-016` では、以下の特徴を持つシーンを作成しています：

1. **結晶ノード**: 中心と8つの頂点に配置された9つの四面体
2. **接続線**: 中心から各頂点への線
3. **回転アニメーション**: 各結晶が回転
4. **スケールの脈動**: 各結晶のサイズが周期的に拡大・縮小
5. **色の変化**: 時間とともに各結晶の色が変化
6. **線の透明度の変化**: 接続線の透明度が周期的に変化

これらのアニメーション効果を組み合わせることで、成長し、脈動する結晶構造のような視覚表現を実現しています。

---

## 2. `usecase-016/index.js` コード詳細

それでは、実際の `usecase-016` のコードを詳しく見ていきましょう。

```js
// usecase-016/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase016 extends UseCaseBase {
  static metadata = {
    id: "016",
    title: "Crystal Formation",
    description: "Growing and connecting crystal structures",
    categories: ["Geometry", "Animation", "Pattern"],
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

    // Create crystal elements
    const baseGeometry = new THREE.TetrahedronGeometry(0.5);
    geometries.push(baseGeometry);

    const positions = [
      [0, 0, 0], // Center
      [1, 1, 1], // Top right front
      [-1, 1, 1], // Top left front
      [1, 1, -1], // Top right back
      [-1, 1, -1], // Top left back
      [1, -1, 1], // Bottom right front
      [-1, -1, 1], // Bottom left front
      [1, -1, -1], // Bottom right back
      [-1, -1, -1], // Bottom left back
    ];

    positions.forEach((pos, i) => {
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / positions.length, 0.7, 0.5),
        shininess: 100,
        transparent: true,
        opacity: 0.8,
      });

      const crystal = new THREE.Mesh(baseGeometry, material);
      crystal.position.set(...pos);
      scene.add(crystal);
      objects.push(crystal);
    });

    // Create connecting lines
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
    });

    positions.slice(1).forEach((pos) => {
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...pos)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      scene.add(line);
      objects.push(line);
      geometries.push(geometry);
    });

    return { objects, geometries };
  }

  static updateObjects(objects, time) {
    const numCrystals = 9; // Number of crystal meshes

    // Update crystals
    for (let i = 0; i < numCrystals; i++) {
      const crystal = objects[i];
      // Rotation
      crystal.rotation.x = time + i * 0.1;
      crystal.rotation.y = time * 0.5 + i * 0.1;

      // Pulsing scale
      const scale = 1 + Math.sin(time * 2 + i) * 0.2;
      crystal.scale.set(scale, scale, scale);

      // Color animation
      const hue = (time * 0.1 + i / numCrystals) % 1;
      crystal.material.color.setHSL(hue, 0.7, 0.5);
    }

    // Update connecting lines
    for (let i = numCrystals; i < objects.length; i++) {
      const line = objects[i];
      line.material.opacity = 0.3 + Math.sin(time * 3) * 0.2;
    }
  }

  async init() {
    const { objects } = GeometryShowcase016.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase016.updateObjects(Array.from(this.objects), this.time);
  }

  static getThumbnailCameraPosition() {
    return {
      position: [4, 4, 4],
      target: [0, 0, 0],
    };
  }

  // getThumbnailBlob と createPreview メソッドは省略
}
```

### 2-1. `metadata`

```js
static metadata = {
  id: "016",
  title: "Crystal Formation",
  description: "Growing and connecting crystal structures",
  categories: ["Geometry", "Animation", "Pattern"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `016`、 `title` は「Crystal Formation」など。
- `description` には、成長し接続する結晶構造について言及されています。
- `categories` に「Pattern」が含まれており、規則的なパターンを持つ配置であることを示しています。

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

  // Create crystal elements
  const baseGeometry = new THREE.TetrahedronGeometry(0.5);
  geometries.push(baseGeometry);

  const positions = [
    [0, 0, 0], // Center
    [1, 1, 1], // Top right front
    [-1, 1, 1], // Top left front
    [1, 1, -1], // Top right back
    [-1, 1, -1], // Top left back
    [1, -1, 1], // Bottom right front
    [-1, -1, 1], // Bottom left front
    [1, -1, -1], // Bottom right back
    [-1, -1, -1], // Bottom left back
  ];

  positions.forEach((pos, i) => {
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(i / positions.length, 0.7, 0.5),
      shininess: 100,
      transparent: true,
      opacity: 0.8,
    });

    const crystal = new THREE.Mesh(baseGeometry, material);
    crystal.position.set(...pos);
    scene.add(crystal);
    objects.push(crystal);
  });

  // Create connecting lines
  const lineGeometry = new THREE.BufferGeometry();
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
  });

  positions.slice(1).forEach((pos) => {
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...pos)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lineMaterial);
    scene.add(line);
    objects.push(line);
    geometries.push(geometry);
  });

  return { objects, geometries };
}
```

ここでは、結晶構造を表現するために、中心と8つの頂点に四面体を配置し、それらを線で接続しています。主な特徴は以下の通りです：

1. **ライトの設定**:
   ```js
   const ambientLight = new THREE.AmbientLight(0x404040);
   const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
   directionalLight.position.set(5, 5, 5);
   scene.add(ambientLight, directionalLight);
   ```
   
   環境光と平行光を設定しています。環境光の色は暗めのグレー（`0x404040`）で、平行光は白色（`0xffffff`）です。

2. **基本ジオメトリの作成**:
   ```js
   const baseGeometry = new THREE.TetrahedronGeometry(0.5);
   geometries.push(baseGeometry);
   ```
   
   テトラヘドロン（四面体）ジオメトリを作成しています。半径は0.5です。

3. **結晶の位置の定義**:
   ```js
   const positions = [
     [0, 0, 0], // Center
     [1, 1, 1], // Top right front
     [-1, 1, 1], // Top left front
     [1, 1, -1], // Top right back
     [-1, 1, -1], // Top left back
     [1, -1, 1], // Bottom right front
     [-1, -1, 1], // Bottom left front
     [1, -1, -1], // Bottom right back
     [-1, -1, -1], // Bottom left back
   ];
   ```
   
   9つの位置を定義しています。中心（`[0, 0, 0]`）と、立方体の8つの頂点に対応する位置です。

4. **結晶の作成と配置**:
   ```js
   positions.forEach((pos, i) => {
     const material = new THREE.MeshPhongMaterial({
       color: new THREE.Color().setHSL(i / positions.length, 0.7, 0.5),
       shininess: 100,
       transparent: true,
       opacity: 0.8,
     });

     const crystal = new THREE.Mesh(baseGeometry, material);
     crystal.position.set(...pos);
     scene.add(crystal);
     objects.push(crystal);
   });
   ```
   
   各位置に四面体を配置しています。マテリアルは、インデックス `i` に応じて色相が変化するように設定されています。また、`shininess` を100に設定することで、光沢のある見た目になっています。`transparent` と `opacity` を設定することで、半透明になっています。

5. **接続線の作成**:
   ```js
   const lineMaterial = new THREE.LineBasicMaterial({
     color: 0xffffff,
     transparent: true,
     opacity: 0.3,
   });

   positions.slice(1).forEach((pos) => {
     const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...pos)];
     const geometry = new THREE.BufferGeometry().setFromPoints(points);
     const line = new THREE.Line(geometry, lineMaterial);
     scene.add(line);
     objects.push(line);
     geometries.push(geometry);
   });
   ```
   
   中心から各頂点への線を作成しています。`positions.slice(1)` により、中心を除いた8つの位置に対して線を作成しています。各線は、中心（`[0, 0, 0]`）から対応する頂点への線分です。線のマテリアルは白色で、透明度は0.3に設定されています。

### 2-3. `updateObjects(objects, time)`

```js
static updateObjects(objects, time) {
  const numCrystals = 9; // Number of crystal meshes

  // Update crystals
  for (let i = 0; i < numCrystals; i++) {
    const crystal = objects[i];
    // Rotation
    crystal.rotation.x = time + i * 0.1;
    crystal.rotation.y = time * 0.5 + i * 0.1;

    // Pulsing scale
    const scale = 1 + Math.sin(time * 2 + i) * 0.2;
    crystal.scale.set(scale, scale, scale);

    // Color animation
    const hue = (time * 0.1 + i / numCrystals) % 1;
    crystal.material.color.setHSL(hue, 0.7, 0.5);
  }

  // Update connecting lines
  for (let i = numCrystals; i < objects.length; i++) {
    const line = objects[i];
    line.material.opacity = 0.3 + Math.sin(time * 3) * 0.2;
  }
}
```

ここでは、結晶と接続線のアニメーションを更新しています。主な特徴は以下の通りです：

1. **結晶の更新**:
   ```js
   for (let i = 0; i < numCrystals; i++) {
     const crystal = objects[i];
     // Rotation
     crystal.rotation.x = time + i * 0.1;
     crystal.rotation.y = time * 0.5 + i * 0.1;

     // Pulsing scale
     const scale = 1 + Math.sin(time * 2 + i) * 0.2;
     crystal.scale.set(scale, scale, scale);

     // Color animation
     const hue = (time * 0.1 + i / numCrystals) % 1;
     crystal.material.color.setHSL(hue, 0.7, 0.5);
   }
   ```
   
   各結晶に対して、以下の3つのアニメーション効果を適用しています：
   
   - **回転**: X軸周りの回転速度は1、Y軸周りの回転速度は0.5です。インデックス `i` に応じて、回転の初期位相がずれます。
   - **スケールの脈動**: 各結晶のサイズが周期的に拡大・縮小します。スケールの値は0.8から1.2の範囲で変化します。インデックス `i` に応じて、脈動のタイミングがずれます。
   - **色の変化**: 各結晶の色が時間とともに変化します。色相（Hue）は、時間とインデックス `i` に応じて変化します。

2. **接続線の更新**:
   ```js
   for (let i = numCrystals; i < objects.length; i++) {
     const line = objects[i];
     line.material.opacity = 0.3 + Math.sin(time * 3) * 0.2;
   }
   ```
   
   各接続線の透明度が周期的に変化します。透明度の値は0.1から0.5の範囲で変化します。周波数は3であるため、1秒間に約0.48回（3 / 2π）の透明度の変化を行います。

### 2-4. `getThumbnailCameraPosition()`

```js
static getThumbnailCameraPosition() {
  return {
    position: [4, 4, 4],
    target: [0, 0, 0],
  };
}
```

サムネイル用のカメラ位置が設定されています。カメラは斜め上から結晶構造全体を見下ろす位置に配置されています。

---

## 3. TetrahedronGeometryの詳細

`usecase-016` では、`THREE.TetrahedronGeometry` を使って、テトラヘドロン（四面体）を作成しています。テトラヘドロンは、4つの面（三角形）、4つの頂点、6つの辺を持つ正多面体です。

### 3-1. TetrahedronGeometryのパラメータ

```js
const baseGeometry = new THREE.TetrahedronGeometry(0.5);
```

`THREE.TetrahedronGeometry` のコンストラクタは、以下のパラメータを受け取ります：

1. **radius**: テトラヘドロンの半径（この場合は0.5）
2. **detail**: 細分化のレベル（省略された場合は0）

`usecase-016` では、半径0.5のテトラヘドロンを作成しています。細分化のレベルは省略されているため、0になります。

### 3-2. テトラヘドロンの数学的性質

テトラヘドロンは、以下の頂点を持ちます：

(1, 1, 1), (1, -1, -1), (-1, 1, -1), (-1, -1, 1)

これらの頂点を結ぶことで、4つの三角形の面が形成されます。テトラヘドロンは、最も単純な正多面体であり、3次元空間で最も少ない頂点数で閉じた立体を形成することができます。

テトラヘドロンは、その単純さと幾何学的な美しさから、3Dグラフィックスでよく使用されるジオメトリの一つです。また、結晶構造や分子構造の表現にも適しています。

---

## 4. 結晶構造の表現

`usecase-016` では、テトラヘドロンと線を使って結晶構造を表現しています。結晶構造は、原子や分子が規則的に配列した構造です。

### 4-1. 結晶ノードの配置

```js
const positions = [
  [0, 0, 0], // Center
  [1, 1, 1], // Top right front
  [-1, 1, 1], // Top left front
  [1, 1, -1], // Top right back
  [-1, 1, -1], // Top left back
  [1, -1, 1], // Bottom right front
  [-1, -1, 1], // Bottom left front
  [1, -1, -1], // Bottom right back
  [-1, -1, -1], // Bottom left back
];
```

結晶ノードの配置は、立方体の頂点と中心に対応しています。中心に1つ、8つの頂点にそれぞれ1つずつ、合計9つのノードが配置されています。

この配置は、立方体格子（cubic lattice）と呼ばれる結晶構造に似ています。立方体格子は、多くの金属や無機化合物に見られる結晶構造です。

### 4-2. 結晶ノードの表現

```js
const material = new THREE.MeshPhongMaterial({
  color: new THREE.Color().setHSL(i / positions.length, 0.7, 0.5),
  shininess: 100,
  transparent: true,
  opacity: 0.8,
});

const crystal = new THREE.Mesh(baseGeometry, material);
```

各結晶ノードは、テトラヘドロンで表現されています。マテリアルは、光沢があり半透明に設定されています。これにより、結晶のような見た目になっています。

色相（Hue）は、インデックス `i` に応じて変化するように設定されています。これにより、各ノードが異なる色を持ち、視覚的に区別しやすくなっています。

### 4-3. 結晶結合の表現

```js
const lineMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.3,
});

positions.slice(1).forEach((pos) => {
  const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...pos)];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, lineMaterial);
  scene.add(line);
  objects.push(line);
  geometries.push(geometry);
});
```

結晶結合は、中心から各頂点への線で表現されています。線のマテリアルは白色で、透明度は0.3に設定されています。これにより、結合が目立ちすぎず、全体の視覚的なバランスが取れています。

この表現は、中心原子と周囲の原子の結合を示す分子モデルに似ています。例えば、メタンガス（CH₄）の分子モデルでは、中心の炭素原子と4つの水素原子が結合しています。

---

## 5. 複合アニメーションの詳細

`usecase-016` では、複数のアニメーション効果を組み合わせています。これにより、より複雑で魅力的な視覚表現を実現しています。

### 5-1. 結晶の回転

```js
crystal.rotation.x = time + i * 0.1;
crystal.rotation.y = time * 0.5 + i * 0.1;
```

各結晶がX軸とY軸周りに回転します。X軸周りの回転速度は1、Y軸周りの回転速度は0.5です。インデックス `i` に応じて、回転の初期位相がずれます。

これにより、各結晶が異なるタイミングで回転し、全体として複雑な動きのパターンが生まれます。

### 5-2. 結晶のスケールの脈動

```js
const scale = 1 + Math.sin(time * 2 + i) * 0.2;
crystal.scale.set(scale, scale, scale);
```

各結晶のサイズが周期的に拡大・縮小します。スケールの値は0.8から1.2の範囲で変化します。インデックス `i` に応じて、脈動のタイミングがずれます。

これにより、結晶が「呼吸」しているような効果が生まれます。また、各結晶の脈動のタイミングがずれることで、波のような効果も生まれます。

### 5-3. 結晶の色の変化

```js
const hue = (time * 0.1 + i / numCrystals) % 1;
crystal.material.color.setHSL(hue, 0.7, 0.5);
```

各結晶の色が時間とともに変化します。色相（Hue）は、時間とインデックス `i` に応じて変化します。`% 1` により、色相の値が0から1の範囲に収まります。

周波数は0.1であるため、1秒間に約0.016回（0.1 / 2π）の色相の変化を行います。つまり、約63秒で色相が一周します。

### 5-4. 接続線の透明度の変化

```js
line.material.opacity = 0.3 + Math.sin(time * 3) * 0.2;
```

各接続線の透明度が周期的に変化します。透明度の値は0.1から0.5の範囲で変化します。周波数は3であるため、1秒間に約0.48回（3 / 2π）の透明度の変化を行います。

これにより、接続線が「脈動」しているような効果が生まれます。

### 5-5. 複合効果

これらのアニメーション効果を組み合わせることで、以下のような視覚効果を生み出します：

1. **動的な立体感**: 回転により、テトラヘドロンの3次元的な形状が強調されます。
2. **リズミカルな動き**: スケールの脈動と透明度の変化により、リズミカルな動きが生まれます。
3. **色の変化**: 色の変化により、視覚的な興味が引き立てられます。
4. **複雑な動きのパターン**: 4つのアニメーション効果が組み合わさることで、複雑で予測しにくい動きのパターンが生まれます。

これらの効果により、見る人を惹きつける魅力的な視覚表現が実現されています。

---

## 6. 応用例：結晶構造と接続線の拡張

`usecase-016` のコードをベースに、以下のような拡張が考えられます：

### 6-1. より複雑な結晶構造を作成する

```js
// 正二十面体の頂点を使用
const icosahedronVertices = [
  [0, 0, 1.176],
  [1.051, 0, 0.526],
  [0.324, 1.0, 0.525],
  [-0.851, 0.618, 0.526],
  [-0.851, -0.618, 0.526],
  [0.325, -1.0, 0.526],
  [0.851, 0.618, -0.526],
  [0.851, -0.618, -0.526],
  [-0.325, 1.0, -0.526],
  [-1.051, 0, -0.526],
  [-0.325, -1.0, -0.526],
  [0, 0, -1.176]
];

// 中心を追加
const positions = [[0, 0, 0], ...icosahedronVertices];
```

正二十面体の頂点を使用することで、より複雑な結晶構造を作成することができます。

### 6-2. 異なるジオメトリを使用する

```js
const geometries = [
  new THREE.TetrahedronGeometry(0.3),
  new THREE.OctahedronGeometry(0.3),
  new THREE.IcosahedronGeometry(0.3)
];

positions.forEach((pos, i) => {
  const geometryIndex = i % geometries.length;
  const geometry = geometries[geometryIndex];
  
  // ...
}
```

異なる種類のジオメトリを交互に使用することで、より変化に富んだ視覚表現を作ることができます。

### 6-3. 接続線のパターンを変更する

```js
// 全ての頂点間を接続
for (let i = 0; i < positions.length; i++) {
  for (let j = i + 1; j < positions.length; j++) {
    const points = [
      new THREE.Vector3(...positions[i]),
      new THREE.Vector3(...positions[j])
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lineMaterial);
    scene.add(line);
    objects.push(line);
    geometries.push(geometry);
  }
}
```

全ての頂点間を接続することで、より複雑なネットワーク構造を作ることができます。

### 6-4. インタラクティブな要素を追加する

```js
// マウスの位置を追跡
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

static updateObjects(objects, time, mouse) {
  const numCrystals = 9;
  
  // マウスの位置に基づいて回転速度を変化させる
  const rotationSpeed = 1 + mouse.x * 0.5;
  
  // マウスの位置に基づいて脈動の振幅を変化させる
  const pulseAmplitude = 0.2 + mouse.y * 0.3;
  
  for (let i = 0; i < numCrystals; i++) {
    const crystal = objects[i];
    
    // 回転速度をマウスのX座標に基づいて変化させる
    crystal.rotation.x = time * rotationSpeed + i * 0.1;
    crystal.rotation.y = time * 0.5 * rotationSpeed + i * 0.1;
    
    // 脈動の振幅をマウスのY座標に基づいて変化させる
    const scale = 1 + Math.sin(time * 2 + i) * pulseAmplitude;
    crystal.scale.set(scale, scale, scale);
    
    // 色のアニメーションは変更なし
    const hue = (time * 0.1 + i / numCrystals) % 1;
    crystal.material.color.setHSL(hue, 0.7, 0.5);
  }
  
  // 接続線の更新も変更なし
  for (let i = numCrystals; i < objects.length; i++) {
    const line = objects[i];
    line.material.opacity = 0.3 + Math.sin(time * 3) * 0.2;
  }
}
```

マウスの位置に基づいて、回転速度や脈動の振幅を変化させることで、インタラクティブな要素を追加することができます。

---

## 7. 結晶構造の応用例

結晶構造は、様々な視覚表現に応用することができます。以下に、結晶構造の応用例をいくつか紹介します。

### 7-1. 分子モデル

```js
// 水分子（H2O）のモデル
const positions = [
  [0, 0, 0],      // 酸素原子（中心）
  [0.8, 0.6, 0],  // 水素原子1
  [-0.8, 0.6, 0]  // 水素原子2
];

// 原子の種類に応じて異なるサイズと色を設定
const atomTypes = [
  { element: 'O', radius: 0.6, color: 0xff0000 }, // 酸素は赤色で大きめ
  { element: 'H', radius: 0.3, color: 0xffffff }, // 水素は白色で小さめ
  { element: 'H', radius: 0.3, color: 0xffffff }
];

positions.forEach((pos, i) => {
  const { element, radius, color } = atomTypes[i];
  const geometry = new THREE.SphereGeometry(radius, 32, 16);
  const material = new THREE.MeshPhongMaterial({ color });
  
  const atom = new THREE.Mesh(geometry, material);
  atom.position.set(...pos);
  scene.add(atom);
  objects.push(atom);
});

// 結合を作成（酸素と各水素の間）
const bondMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });

for (let i = 1; i < positions.length; i++) {
  const start = new THREE.Vector3(...positions[0]);
  const end = new THREE.Vector3(...positions[i]);
  
  // 結合の中点と方向を計算
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const direction = new THREE.Vector3().subVectors(end, start).normalize();
  
  // 結合の長さを計算
  const length = start.distanceTo(end);
  
  // 円柱を作成
  const bondGeometry = new THREE.CylinderGeometry(0.1, 0.1, length, 8);
  const bond = new THREE.Mesh(bondGeometry, bondMaterial);
  
  // 円柱を配置
  bond.position.copy(mid);
  bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  
  scene.add(bond);
  objects.push(bond);
}
```

分子モデルを表現することができます。原子を球で表現し、結合を円柱で表現します。原子の種類に応じて、サイズや色を変えることで、分子の構造を視覚的に理解しやすくします。

### 7-2. 結晶格子

```js
// 単純立方格子（Simple Cubic）
const gridSize = 3; // 3x3x3の格子
const latticeConstant = 2; // 格子定数

const positions = [];

for (let x = 0; x < gridSize; x++) {
  for (let y = 0; y < gridSize; y++) {
    for (let z = 0; z < gridSize; z++) {
      positions.push([
        (x - (gridSize - 1) / 2) * latticeConstant,
        (y - (gridSize - 1) / 2) * latticeConstant,
        (z - (gridSize - 1) / 2) * latticeConstant
      ]);
    }
  }
}

// 原子を作成
positions.forEach((pos, i) => {
  const geometry = new THREE.SphereGeometry(0.3, 32, 16);
  const material = new THREE.MeshPhongMaterial({
    color: 0x88aaff,
    shininess: 100
  });
  
  const atom = new THREE.Mesh(geometry, material);
  atom.position.set(...pos);
  scene.add(atom);
  objects.push(atom);
});

// 最近接原子間の結合を作成
const bondMaterial = new THREE.LineBasicMaterial({
  color: 0xcccccc,
  transparent: true,
  opacity: 0.5
});

for (let i = 0; i < positions.length; i++) {
  for (let j = i + 1; j < positions.length; j++) {
    const pos1 = positions[i];
    const pos2 = positions[j];
    
    // 2点間の距離を計算
    const dx = pos1[0] - pos2[0];
    const dy = pos1[1] - pos2[1];
    const dz = pos1[2] - pos2[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // 最近接原子間の距離（格子定数に等しい）
    if (Math.abs(distance - latticeConstant) < 0.1) {
      const points = [
        new THREE.Vector3(...pos1),
        new THREE.Vector3(...pos2)
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, bondMaterial);
      scene.add(line);
      objects.push(line);
    }
  }
}
```

結晶格子を表現することができます。この例では、単純立方格子（Simple Cubic）を作成しています。原子を球で表現し、最近接原子間の結合を線で表現します。

### 7-3. ネットワーク可視化

```js
// ノードの位置をランダムに生成
const numNodes = 20;
const positions = [];

for (let i = 0; i < numNodes; i++) {
  positions.push([
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10
  ]);
}

// ノードを作成
positions.forEach((pos, i) => {
  const geometry = new THREE.SphereGeometry(0.3, 32, 16);
  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL(i / numNodes, 0.7, 0.5),
    shininess: 100
  });
  
  const node = new THREE.Mesh(geometry, material);
  node.position.set(...pos);
  scene.add(node);
  objects.push(node);
});

// エッジを作成（距離が近いノード間のみ）
const edgeMaterial = new THREE.LineBasicMaterial({
  color: 0xcccccc,
  transparent: true,
  opacity: 0.3
});

const maxDistance = 5; // 接続する最大距離

for (let i = 0; i < positions.length; i++) {
  for (let j = i + 1; j < positions.length; j++) {
    const pos1 = positions[i];
    const pos2 = positions[j];
    
    // 2点間の距離を計算
    const dx = pos1[0] - pos2[0];
    const dy = pos1[1] - pos2[1];
    const dz = pos1[2] - pos2[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // 距離が近いノード間のみエッジを作成
    if (distance < maxDistance) {
      const points = [
        new THREE.Vector3(...pos1),
        new THREE.Vector3(...pos2)
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, edgeMaterial);
      scene.add(line);
      objects.push(line);
    }
  }
}
```

ネットワーク構造を可視化することができます。ノードを球で表現し、エッジを線で表現します。距離が近いノード間のみエッジを作成することで、自然なネットワーク構造を表現します。

---

## 8. まとめ

`usecase-016` では、結晶構造と接続線を組み合わせた「Crystal Formation」を実装しました。テトラヘドロン（四面体）を使用して結晶ノードを表現し、それらを線で接続することで、結晶構造のような視覚表現を実現しています。

複合アニメーションでは、回転、スケールの脈動、色の変化、透明度の変化など、複数のアニメーション効果を組み合わせることで、複雑で魅力的な視覚表現を実現しています。

結晶構造は、分子モデル、結晶格子、ネットワーク可視化など、様々な視覚表現に応用することができます。これらの応用例を通じて、Three.jsの表現力の豊かさを実感することができます。

次のユースケースでは、さらに複雑な形状や動きを持つ3Dシーンを探索していきます。
