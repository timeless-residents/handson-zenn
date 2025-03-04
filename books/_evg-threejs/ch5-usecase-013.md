---
title: Usecase-013 Wave Animation Grid
free: true
---
# Usecase-013: Wave Animation Grid

**本章では、`usecases/usecase-013` ディレクトリに格納されている「Wave Animation Grid」のコードを解説します。**  
このサンプルは、10×10のグリッド状に配置された立方体（キューブ）が波のように上下に動くアニメーションを実装しています。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、グリッド配置と波のようなアニメーションパターンという新しい要素を導入しています。

---

## 1. グリッド配置と波アニメーション

これまでのユースケースでは、単一のオブジェクトや、少数のオブジェクトを扱ってきました。しかし実際のアプリケーションでは、多数のオブジェクトを規則的に配置することが一般的です。

`usecase-013` では、以下の特徴を持つシーンを作成しています：

1. **グリッド配置**: 10×10の格子状に100個のキューブを配置
2. **波アニメーション**: 中心からの距離に応じて位相がずれる波のようなアニメーション
3. **色の変化**: 位置や時間に応じて色が変化
4. **回転**: 波の動きに合わせて各キューブが回転

これにより、視覚的に魅力的で、有機的な動きを持つシーンが作成されます。波のアニメーションは、自然現象や水面の揺らぎなどを表現する際によく使用される技法です。

---

## 2. `usecase-013/index.js` コード詳細

それでは、実際の `usecase-013` のコードを詳しく見ていきましょう。

```js
// usecase-013/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase013 extends UseCaseBase {
  static metadata = {
    id: "013",
    title: "Wave Animation Grid",
    description: "Grid of cubes animating in a wave pattern",
    categories: ["Geometry", "Animation", "Grid"],
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
    const gridSize = 10;
    const spacing = 1.2;

    // Create cube geometry (reused for all cubes)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    geometries.push(geometry);

    // Create grid of cubes
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(x / gridSize, 0.7, 0.5),
        });

        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = (x - gridSize / 2) * spacing;
        cube.position.z = (z - gridSize / 2) * spacing;
        scene.add(cube);
        objects.push(cube);
      }
    }

    return { objects, geometries };
  }

  static updateObjects(objects, time) {
    const gridSize = Math.sqrt(objects.length);
    objects.forEach((cube, index) => {
      const x = Math.floor(index / gridSize);
      const z = index % gridSize;

      // Wave animation
      const distance = Math.sqrt(x * x + z * z);
      const offset = distance * 0.5;
      cube.position.y = Math.sin(time * 2 + offset) * 0.5;

      // Rotation
      cube.rotation.x = Math.sin(time + offset) * 0.3;
      cube.rotation.z = Math.cos(time + offset) * 0.3;

      // Color animation
      cube.material.color.setHSL((Math.sin(time + offset) + 1) * 0.5, 0.7, 0.5);
    });
  }

  async init() {
    const { objects } = GeometryShowcase013.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase013.updateObjects(Array.from(this.objects), this.time);
  }

  static getThumbnailCameraPosition() {
    return {
      position: [10, 10, 10],
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
  id: "013",
  title: "Wave Animation Grid",
  description: "Grid of cubes animating in a wave pattern",
  categories: ["Geometry", "Animation", "Grid"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `013`、 `title` は「Wave Animation Grid」など。
- `description` には、キューブのグリッドが波のようなパターンでアニメーションすることについて言及されています。
- `categories` に新しく「Grid」が追加されています。

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
  const gridSize = 10;
  const spacing = 1.2;

  // Create cube geometry (reused for all cubes)
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  geometries.push(geometry);

  // Create grid of cubes
  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(x / gridSize, 0.7, 0.5),
      });

      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = (x - gridSize / 2) * spacing;
      cube.position.z = (z - gridSize / 2) * spacing;
      scene.add(cube);
      objects.push(cube);
    }
  }

  return { objects, geometries };
}
```

ここでは、10×10のグリッド状にキューブを配置しています。主な特徴は以下の通りです：

1. **ライトの設定**:
   ```js
   const ambientLight = new THREE.AmbientLight(0x404040);
   const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
   directionalLight.position.set(5, 5, 5);
   scene.add(ambientLight, directionalLight);
   ```
   
   環境光と平行光を設定しています。環境光の色は暗めのグレー（`0x404040`）で、平行光は白色（`0xffffff`）です。

2. **グリッドのパラメータ**:
   ```js
   const gridSize = 10;
   const spacing = 1.2;
   ```
   
   グリッドのサイズ（10×10）と、キューブ間の間隔（1.2）を定義しています。

3. **ジオメトリの再利用**:
   ```js
   const geometry = new THREE.BoxGeometry(1, 1, 1);
   geometries.push(geometry);
   ```
   
   すべてのキューブで同じジオメトリを再利用しています。これにより、メモリ使用量を削減し、パフォーマンスを向上させることができます。

4. **グリッド状にキューブを配置**:
   ```js
   for (let x = 0; x < gridSize; x++) {
     for (let z = 0; z < gridSize; z++) {
       const material = new THREE.MeshPhongMaterial({
         color: new THREE.Color().setHSL(x / gridSize, 0.7, 0.5),
       });

       const cube = new THREE.Mesh(geometry, material);
       cube.position.x = (x - gridSize / 2) * spacing;
       cube.position.z = (z - gridSize / 2) * spacing;
       scene.add(cube);
       objects.push(cube);
     }
   }
   ```
   
   二重ループを使って、X軸とZ軸方向にキューブを配置しています。各キューブの位置は、グリッド内のインデックス（x, z）に基づいて計算されます。また、X座標に応じて色相（Hue）が変化するように設定しています。

### 2-3. `updateObjects(objects, time)`

```js
static updateObjects(objects, time) {
  const gridSize = Math.sqrt(objects.length);
  objects.forEach((cube, index) => {
    const x = Math.floor(index / gridSize);
    const z = index % gridSize;

    // Wave animation
    const distance = Math.sqrt(x * x + z * z);
    const offset = distance * 0.5;
    cube.position.y = Math.sin(time * 2 + offset) * 0.5;

    // Rotation
    cube.rotation.x = Math.sin(time + offset) * 0.3;
    cube.rotation.z = Math.cos(time + offset) * 0.3;

    // Color animation
    cube.material.color.setHSL((Math.sin(time + offset) + 1) * 0.5, 0.7, 0.5);
  });
}
```

ここでは、各キューブの位置、回転、色を更新しています。主な特徴は以下の通りです：

1. **グリッド座標の計算**:
   ```js
   const gridSize = Math.sqrt(objects.length);
   objects.forEach((cube, index) => {
     const x = Math.floor(index / gridSize);
     const z = index % gridSize;
     // ...
   });
   ```
   
   配列のインデックスからグリッド座標（x, z）を計算しています。これにより、各キューブの位置を特定することができます。

2. **波アニメーション**:
   ```js
   const distance = Math.sqrt(x * x + z * z);
   const offset = distance * 0.5;
   cube.position.y = Math.sin(time * 2 + offset) * 0.5;
   ```
   
   中心（0, 0）からの距離に基づいて、各キューブのY座標を計算しています。距離が大きいほど位相のずれ（`offset`）が大きくなり、波が中心から外側に広がるような効果が生まれます。

3. **回転アニメーション**:
   ```js
   cube.rotation.x = Math.sin(time + offset) * 0.3;
   cube.rotation.z = Math.cos(time + offset) * 0.3;
   ```
   
   各キューブの回転も、中心からの距離に応じて位相がずれるように設定しています。X軸とZ軸の回転を組み合わせることで、より複雑な動きが生まれます。

4. **色のアニメーション**:
   ```js
   cube.material.color.setHSL((Math.sin(time + offset) + 1) * 0.5, 0.7, 0.5);
   ```
   
   各キューブの色も、時間と中心からの距離に応じて変化するように設定しています。`Math.sin(time + offset)` の値は -1 から 1 の範囲で変化するため、`(Math.sin(time + offset) + 1) * 0.5` の値は 0 から 1 の範囲で変化します。これを色相（Hue）として使用することで、色が滑らかに変化します。

### 2-4. `getThumbnailCameraPosition()`

```js
static getThumbnailCameraPosition() {
  return {
    position: [10, 10, 10],
    target: [0, 0, 0],
  };
}
```

サムネイル用のカメラ位置が変更されています。グリッド全体を見渡せるように、カメラが斜め上から見下ろす位置に配置されています。

---

## 3. 前章との比較

`usecase-013` は前章までと基本的な構造は同じですが、以下の点が大きく異なります：

1. **多数のオブジェクト**: 少数のオブジェクトではなく、100個（10×10）のキューブを使用
2. **グリッド配置**: 二重ループを使って、規則的なグリッド状にオブジェクトを配置
3. **波アニメーション**: 中心からの距離に応じて位相がずれる波のようなアニメーションを実装
4. **ジオメトリの再利用**: 同じジオメトリを複数のメッシュで再利用し、メモリ使用量を削減
5. **カメラの位置**: グリッド全体を見渡せるように、カメラの位置を調整

特に重要なのは、**多数のオブジェクトをグリッド状に配置し、中心からの距離に応じて位相がずれるアニメーションを適用する方法**が導入された点です。これにより、より複雑で視覚的に魅力的なシーンを作成することができます。

---

## 4. グリッド配置の実装

`usecase-013` では、二重ループを使って、グリッド状にキューブを配置しています。この手法は、多数のオブジェクトを規則的に配置する際によく使用されます。

### 4-1. 二重ループによるグリッド配置

```js
for (let x = 0; x < gridSize; x++) {
  for (let z = 0; z < gridSize; z++) {
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(x / gridSize, 0.7, 0.5),
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = (x - gridSize / 2) * spacing;
    cube.position.z = (z - gridSize / 2) * spacing;
    scene.add(cube);
    objects.push(cube);
  }
}
```

この二重ループでは、以下の処理を行っています：

1. **外側のループ**: X座標（横方向）を 0 から `gridSize - 1` まで変化させる
2. **内側のループ**: Z座標（奥行き方向）を 0 から `gridSize - 1` まで変化させる
3. **マテリアルの作成**: X座標に応じて色相が変化するマテリアルを作成
4. **キューブの作成**: ジオメトリとマテリアルからキューブを作成
5. **位置の設定**: グリッド内の位置（x, z）に基づいて、キューブの位置を設定
6. **シーンへの追加**: キューブをシーンに追加
7. **配列への追加**: キューブを配列に追加

### 4-2. 中心を原点にするための調整

```js
cube.position.x = (x - gridSize / 2) * spacing;
cube.position.z = (z - gridSize / 2) * spacing;
```

グリッドの中心を原点（0, 0, 0）に合わせるために、位置を調整しています。具体的には、以下の計算を行っています：

- X座標: `(x - gridSize / 2) * spacing`
- Z座標: `(z - gridSize / 2) * spacing`

例えば、`gridSize = 10` の場合、X座標と Z座標は以下の範囲になります：

- x = 0 のとき: `(0 - 5) * 1.2 = -6`
- x = 9 のとき: `(9 - 5) * 1.2 = 4.8`

これにより、グリッドの中心が原点に位置するようになります。

### 4-3. 配列インデックスとグリッド座標の変換

```js
const gridSize = Math.sqrt(objects.length);
objects.forEach((cube, index) => {
  const x = Math.floor(index / gridSize);
  const z = index % gridSize;
  // ...
});
```

`updateObjects` メソッドでは、配列のインデックスからグリッド座標（x, z）を計算しています。具体的には、以下の計算を行っています：

- X座標: `Math.floor(index / gridSize)`
- Z座標: `index % gridSize`

例えば、`gridSize = 10` の場合、以下のようになります：

- index = 0 のとき: x = 0, z = 0
- index = 10 のとき: x = 1, z = 0
- index = 11 のとき: x = 1, z = 1
- index = 99 のとき: x = 9, z = 9

これにより、1次元の配列を2次元のグリッドとして扱うことができます。

---

## 5. 波アニメーションの実装

`usecase-013` では、中心からの距離に応じて位相がずれる波のようなアニメーションを実装しています。この手法は、水面の揺らぎや波紋などを表現する際によく使用されます。

### 5-1. 中心からの距離の計算

```js
const distance = Math.sqrt(x * x + z * z);
```

中心（0, 0）からの距離を計算しています。これは、2次元平面上の2点間の距離を計算する公式（ユークリッド距離）を使用しています：

距離 = √((x₂ - x₁)² + (z₂ - z₁)²)

ここでは、中心が（0, 0）なので、距離 = √(x² + z²) となります。

### 5-2. 位相のずれの計算

```js
const offset = distance * 0.5;
```

中心からの距離に比例して、位相のずれ（`offset`）を計算しています。距離が大きいほど、位相のずれも大きくなります。係数 0.5 は、位相のずれの大きさを調整するためのパラメータです。

### 5-3. 波アニメーションの適用

```js
cube.position.y = Math.sin(time * 2 + offset) * 0.5;
```

正弦関数（`Math.sin`）を使って、Y座標を計算しています。引数 `time * 2 + offset` は、時間と位相のずれを組み合わせたものです。係数 0.5 は、波の振幅（高さ）を調整するためのパラメータです。

この実装により、以下のような効果が得られます：

1. **時間経過による変化**: `time` の値が増加するにつれて、波が時間とともに変化します。
2. **中心からの波紋**: 中心からの距離に応じて位相がずれるため、波が中心から外側に広がるような効果が生まれます。
3. **周期的な上下運動**: 正弦関数により、各キューブが周期的に上下に動きます。

### 5-4. 回転と色の変化

```js
cube.rotation.x = Math.sin(time + offset) * 0.3;
cube.rotation.z = Math.cos(time + offset) * 0.3;

cube.material.color.setHSL((Math.sin(time + offset) + 1) * 0.5, 0.7, 0.5);
```

波アニメーションと同様に、回転と色の変化にも位相のずれを適用しています。これにより、波の動きに合わせて回転と色も変化します。

回転では、X軸とZ軸の両方を使用し、正弦関数と余弦関数を組み合わせることで、より複雑な動きを実現しています。

色の変化では、正弦関数の値（-1 から 1 の範囲）を 0 から 1 の範囲に変換し、色相（Hue）として使用しています。これにより、色が滑らかに変化します。

---

## 6. 応用例：グリッド配置と波アニメーションの拡張

`usecase-013` のコードをベースに、以下のような拡張が考えられます：

### 6-1. 3次元グリッドに拡張する

```js
const gridSize = 5; // 5x5x5のグリッド
const spacing = 1.5;

for (let x = 0; x < gridSize; x++) {
  for (let y = 0; y < gridSize; y++) {
    for (let z = 0; z < gridSize; z++) {
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(x / gridSize, y / gridSize, z / gridSize),
      });

      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = (x - gridSize / 2) * spacing;
      cube.position.y = (y - gridSize / 2) * spacing;
      cube.position.z = (z - gridSize / 2) * spacing;
      scene.add(cube);
      objects.push(cube);
    }
  }
}
```

### 6-2. 異なる波のパターンを適用する

```js
static updateObjects(objects, time) {
  const gridSize = Math.cbrt(objects.length); // 3次元グリッドの場合
  objects.forEach((cube, index) => {
    const x = Math.floor(index / (gridSize * gridSize));
    const y = Math.floor((index % (gridSize * gridSize)) / gridSize);
    const z = index % gridSize;

    // 3次元の距離を計算
    const distance = Math.sqrt(x * x + y * y + z * z);
    const offset = distance * 0.5;

    // 異なる波のパターン
    const pattern = Math.floor(time / 10) % 4; // 10秒ごとにパターンを切り替え

    switch (pattern) {
      case 0: // 中心から外側に広がる波
        cube.position.y += Math.sin(time * 2 + offset) * 0.2;
        break;
      case 1: // X軸方向に進む波
        cube.position.y += Math.sin(time * 2 + x) * 0.2;
        break;
      case 2: // 同心円状の波
        const distanceXZ = Math.sqrt(x * x + z * z);
        cube.position.y += Math.sin(time * 2 + distanceXZ) * 0.2;
        break;
      case 3: // 螺旋状の波
        const angle = Math.atan2(z, x);
        cube.position.y += Math.sin(time * 2 + angle * 3 + distance) * 0.2;
        break;
    }

    // 回転と色の変化
    cube.rotation.x = Math.sin(time + offset) * 0.3;
    cube.rotation.z = Math.cos(time + offset) * 0.3;
    cube.material.color.setHSL((Math.sin(time + offset) + 1) * 0.5, 0.7, 0.5);
  });
}
```

### 6-3. 異なる形状を組み合わせる

```js
const geometries = [
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.SphereGeometry(0.6, 16, 16),
  new THREE.ConeGeometry(0.6, 1.2, 16),
  new THREE.TorusGeometry(0.5, 0.2, 16, 32),
];

for (let x = 0; x < gridSize; x++) {
  for (let z = 0; z < gridSize; z++) {
    const geometryIndex = (x + z) % geometries.length;
    const geometry = geometries[geometryIndex];
    
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(x / gridSize, 0.7, 0.5),
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = (x - gridSize / 2) * spacing;
    mesh.position.z = (z - gridSize / 2) * spacing;
    scene.add(mesh);
    objects.push(mesh);
  }
}
```

### 6-4. インタラクティブな要素を追加する

```js
// マウスの位置を追跡
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

static updateObjects(objects, time, mouse) {
  const gridSize = Math.sqrt(objects.length);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  
  objects.forEach((cube, index) => {
    const x = Math.floor(index / gridSize);
    const z = index % gridSize;

    // 基本的な波アニメーション
    const distance = Math.sqrt(x * x + z * z);
    const offset = distance * 0.5;
    cube.position.y = Math.sin(time * 2 + offset) * 0.5;

    // マウスとの相互作用
    const intersects = raycaster.intersectObject(cube);
    if (intersects.length > 0) {
      // マウスが当たっているキューブは大きく表示
      cube.scale.set(1.5, 1.5, 1.5);
      cube.material.color.setRGB(1, 1, 1); // 白色
    } else {
      // 通常のサイズと色
      cube.scale.set(1, 1, 1);
      cube.material.color.setHSL((Math.sin(time + offset) + 1) * 0.5, 0.7, 0.5);
    }

    // 回転
    cube.rotation.x = Math.sin(time + offset) * 0.3;
    cube.rotation.z = Math.cos(time + offset) * 0.3;
  });
}
```

---

## 7. グリッド配置の応用例

グリッド配置は、多数のオブジェクトを規則的に配置する際によく使用される手法です。以下に、グリッド配置の応用例をいくつか紹介します。

### 7-1. 六角形グリッド

```js
const gridSize = 10;
const spacing = 1.2;
const hexHeight = spacing * Math.sqrt(3) / 2;

for (let q = -gridSize; q <= gridSize; q++) {
  for (let r = -gridSize; r <= gridSize; r++) {
    if (Math.abs(q + r) <= gridSize) {
      const x = spacing * (q + r / 2);
      const z = hexHeight * r;
      
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL((q + gridSize) / (2 * gridSize), 0.7, 0.5),
      });

      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = x;
      cube.position.z = z;
      scene.add(cube);
      objects.push(cube);
    }
  }
}
```

### 7-2. 同心円状のグリッド

```js
const rings = 5;
const objectsPerRing = 12;
const spacing = 1.2;

// 中心のオブジェクト
const centerMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const centerCube = new THREE.Mesh(geometry, centerMaterial);
scene.add(centerCube);
objects.push(centerCube);

// 同心円状にオブジェクトを配置
for (let r = 1; r <= rings; r++) {
  for (let i = 0; i < objectsPerRing; i++) {
    const angle = (i / objectsPerRing) * Math.PI * 2;
    const radius = r * spacing;
    
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(i / objectsPerRing, 0.7, r / rings),
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = x;
    cube.position.z = z;
    scene.add(cube);
    objects.push(cube);
  }
}
```

### 7-3. フラクタル配置

```js
function placeCubes(x, z, size, depth, maxDepth) {
  if (depth >= maxDepth) return;
  
  // 現在の位置にキューブを配置
  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL(depth / maxDepth, 0.7, 0.5),
  });
  
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = x;
  cube.position.z = z;
  cube.scale.set(size, size, size);
  scene.add(cube);
  objects.push(cube);
  
  // 4つの方向に小さいキューブを配置
  const newSize = size * 0.5;
  const offset = size + newSize;
  
  placeCubes(x + offset, z, newSize, depth + 1, maxDepth);
  placeCubes(x - offset, z, newSize, depth + 1, maxDepth);
  placeCubes(x, z + offset, newSize, depth + 1, maxDepth);
  placeCubes(x, z - offset, newSize, depth + 1, maxDepth);
}

// 中心から開始
placeCubes(0, 0, 1, 0, 3);
```

---

## 8. まとめ

「**Usecase-013: Wave Animation Grid**」では、Three.jsで多数のオブジェクトをグリッド状に配置し、波のようなアニメーションを適用する方法を学びました。

主なポイントは以下の通りです：

1. **グリッド配置**: 二重ループを使って、10×10のグリッド状に100個のキューブを配置する方法を学びました。
2. **ジオメトリの再利用**: 同じジオメトリを複数のメッシュで再利用し、メモリ使用量を削減する方法を学びました。
3. **波アニメーション**: 中心からの距離に応じて位相がずれる波のようなアニメーションを実装する方法を学びました。
4. **回転と色の変化**: 波の動きに合わせて回転と色も変化させる方法を学びました。
5. **配列インデックスとグリッド座標の変換**: 1次元の配列を2次元のグリッドとして扱う方法を学びました。

このサンプルは、Three.jsでの多数のオブジェクトの管理と、波のようなアニメーションの実装方法を示す良い例となっています。特に、中心からの距離に応じて位相がずれるアニメーションの手法は、様々な視覚効果を実現する際に非常に有用です。

---

## 9. 次のステップ

`usecase-013` を理解したら、次のステップとして以下のような発展が考えられます：

1. **3次元グリッド**: 2次元のグリッドを3次元に拡張し、立体的な波のアニメーションを実現する。
2. **異なる波のパターン**: 中心から外側に広がる波だけでなく、様々な波のパターンを実装する。
3. **異なる形状の組み合わせ**: キューブだけでなく、様々な形状を組み合わせて使用する。
4. **インタラクティブな要素**: マウスやキーボードの入力に応じて、波のパターンや色を変更する。
5. **物理シミュレーション**: 単純な正弦波ではなく、物理法則に基づいた波のシミュレーションを実装する。

これらの発展は、今後のユースケースで順次紹介していく予定です。`usecase-013` で学んだグリッド配置と波アニメーションの基本を応用することで、より高度な3D表現へと進んでいきましょう。
