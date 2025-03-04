---
title: Usecase-017 Ring-Cut Cylinder Pattern
free: true
---
# Usecase-017: Ring-Cut Cylinder Pattern

**本章では、`usecases/usecase-017` ディレクトリに格納されている「Ring-Cut Cylinder Pattern」のコードを解説します。**  
このサンプルは、円筒形の表面に複数のリング状の切り込みを入れ、それらが上下にスライドするアニメーションを実装しています。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、円筒形とトーラスを組み合わせた例となっています。

---

## 1. リング状の切り込みを持つ円筒形

これまでのユースケースでは、様々な形状とアニメーション効果を扱ってきました。`usecase-017` では、円筒形の表面に複数のリング状の切り込みを入れ、それらが上下にスライドするアニメーションを実装しています。

このサンプルでは、円筒形を複数の短い円筒形に分割し、その間にトーラス（ドーナツ形状）を配置することで、リング状の切り込みを表現しています。各セグメントが独立して動くことで、動的なパターンを作り出しています。

`usecase-017` では、以下の特徴を持つシーンを作成しています：

1. **分割された円筒形**: 8つの短い円筒形セグメント
2. **リング状の切り込み**: 各セグメント間に配置されたトーラス
3. **上下のスライドアニメーション**: 各セグメントとリングが上下にスライド
4. **回転アニメーション**: 各セグメントとリングがY軸周りに回転
5. **色の変化**: 時間とともに各セグメントとリングの色が変化

これらのアニメーション効果を組み合わせることで、複雑で魅力的な視覚表現を実現しています。

---

## 2. `usecase-017/index.js` コード詳細

それでは、実際の `usecase-017` のコードを詳しく見ていきましょう。

```js
// usecase-017/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase017 extends UseCaseBase {
  static metadata = {
    id: "017",
    title: "Ring-Cut Cylinder Pattern",
    description:
      "Cylinder with ring cuts that slide up and down to create dynamic patterns",
    categories: ["Geometry", "Animation", "Pattern", "Interactive"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
    this.initialPositions = [];
  }

  static setupScene(scene) {
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    const objects = [];
    const geometries = [];

    const ringCount = 8;
    const radialSegments = 32;
    const radius = 1;
    const height = 4;
    const ringHeight = 0.2;
    const ringDepth = 0.2;

    for (let i = 0; i < ringCount; i++) {
      const yPos = -height / 2 + (height * (i + 0.5)) / ringCount;
      const segmentHeight = height / ringCount;

      const topGeometry = new THREE.CylinderGeometry(
        radius,
        radius,
        segmentHeight - ringHeight,
        radialSegments
      );
      const topMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / ringCount, 0.7, 0.5),
        shininess: 100,
      });
      const topCylinder = new THREE.Mesh(topGeometry, topMaterial);
      topCylinder.position.y = yPos + (segmentHeight - ringHeight) / 2;
      scene.add(topCylinder);
      objects.push(topCylinder);
      geometries.push(topGeometry);

      const ringGeometry = new THREE.TorusGeometry(
        radius - ringDepth / 2,
        ringDepth,
        16,
        radialSegments
      );
      const ringMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL((i + 0.5) / ringCount, 0.9, 0.3),
        shininess: 120,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = yPos;
      scene.add(ring);
      objects.push(ring);
      geometries.push(ringGeometry);
    }

    return { objects, geometries };
  }

  static updateObjects(objects, time, initialPositions) {
    const ringCount = 8;

    // If initialPositions is not provided, calculate them based on current positions
    const positions = initialPositions || objects.map((obj) => obj.position.y);

    for (let i = 0; i < ringCount; i++) {
      const index = i * 2;
      const topCylinder = objects[index];
      const ring = objects[index + 1];

      const slideFactor = 0.3;
      const phaseOffset = i * (Math.PI / 4);
      const slideY = Math.sin(time * 2 + phaseOffset) * slideFactor;

      topCylinder.position.y = positions[index] + slideY;
      ring.position.y = positions[index + 1] + slideY;

      topCylinder.rotation.y = time * 0.5 + i * 0.1;
      ring.rotation.y = time * 0.5 + i * 0.1;

      const hue = (time * 0.1 + i / ringCount) % 1;
      topCylinder.material.color.setHSL(hue, 0.7, 0.5);
      ring.material.color.setHSL((hue + 0.5) % 1, 0.9, 0.3);
    }
  }

  async init() {
    const { objects } = GeometryShowcase017.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
    this.initialPositions = objects.map((obj) => obj.position.y);
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase017.updateObjects(
      Array.from(this.objects),
      this.time,
      this.initialPositions
    );
  }

  static getThumbnailCameraPosition() {
    return {
      position: [4, 2, 4],
      target: [0, 0, 0],
    };
  }

  // getThumbnailBlob と createPreview メソッドは省略
}
```

### 2-1. `metadata`

```js
static metadata = {
  id: "017",
  title: "Ring-Cut Cylinder Pattern",
  description:
    "Cylinder with ring cuts that slide up and down to create dynamic patterns",
  categories: ["Geometry", "Animation", "Pattern", "Interactive"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `017`、 `title` は「Ring-Cut Cylinder Pattern」など。
- `description` には、上下にスライドするリング状の切り込みを持つ円筒形について言及されています。
- `categories` に「Interactive」が追加されており、インタラクティブな要素を持つことを示しています。

### 2-2. `constructor`

```js
constructor(scene) {
  super(scene);
  this.time = 0;
  this.initialPositions = [];
}
```

コンストラクタでは、`initialPositions` という新しいプロパティを追加しています。これは、各オブジェクトの初期位置を保存するための配列です。アニメーション中に、オブジェクトを初期位置から相対的に移動させるために使用されます。

### 2-3. `setupScene(scene)`

```js
static setupScene(scene) {
  const ambientLight = new THREE.AmbientLight(0x404040);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(ambientLight, directionalLight);

  const objects = [];
  const geometries = [];

  const ringCount = 8;
  const radialSegments = 32;
  const radius = 1;
  const height = 4;
  const ringHeight = 0.2;
  const ringDepth = 0.2;

  for (let i = 0; i < ringCount; i++) {
    const yPos = -height / 2 + (height * (i + 0.5)) / ringCount;
    const segmentHeight = height / ringCount;

    const topGeometry = new THREE.CylinderGeometry(
      radius,
      radius,
      segmentHeight - ringHeight,
      radialSegments
    );
    const topMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(i / ringCount, 0.7, 0.5),
      shininess: 100,
    });
    const topCylinder = new THREE.Mesh(topGeometry, topMaterial);
    topCylinder.position.y = yPos + (segmentHeight - ringHeight) / 2;
    scene.add(topCylinder);
    objects.push(topCylinder);
    geometries.push(topGeometry);

    const ringGeometry = new THREE.TorusGeometry(
      radius - ringDepth / 2,
      ringDepth,
      16,
      radialSegments
    );
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL((i + 0.5) / ringCount, 0.9, 0.3),
      shininess: 120,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = yPos;
    scene.add(ring);
    objects.push(ring);
    geometries.push(ringGeometry);
  }

  return { objects, geometries };
}
```

ここでは、リング状の切り込みを持つ円筒形を作成しています。主な特徴は以下の通りです：

1. **ライトの設定**:
   ```js
   const ambientLight = new THREE.AmbientLight(0x404040);
   const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
   directionalLight.position.set(5, 5, 5);
   scene.add(ambientLight, directionalLight);
   ```
   
   環境光と平行光を設定しています。環境光の色は暗めのグレー（`0x404040`）で、平行光は白色（`0xffffff`）です。

2. **パラメータの設定**:
   ```js
   const ringCount = 8;
   const radialSegments = 32;
   const radius = 1;
   const height = 4;
   const ringHeight = 0.2;
   const ringDepth = 0.2;
   ```
   
   - `ringCount`: リングの数（8個）
   - `radialSegments`: 円周方向の分割数（32）
   - `radius`: 円筒形の半径（1）
   - `height`: 円筒形の高さ（4）
   - `ringHeight`: リングの高さ（0.2）
   - `ringDepth`: リングの厚さ（0.2）

3. **円筒形セグメントとリングの作成**:
   ```js
   for (let i = 0; i < ringCount; i++) {
     const yPos = -height / 2 + (height * (i + 0.5)) / ringCount;
     const segmentHeight = height / ringCount;

     // 円筒形セグメントの作成
     const topGeometry = new THREE.CylinderGeometry(
       radius,
       radius,
       segmentHeight - ringHeight,
       radialSegments
     );
     const topMaterial = new THREE.MeshPhongMaterial({
       color: new THREE.Color().setHSL(i / ringCount, 0.7, 0.5),
       shininess: 100,
     });
     const topCylinder = new THREE.Mesh(topGeometry, topMaterial);
     topCylinder.position.y = yPos + (segmentHeight - ringHeight) / 2;
     scene.add(topCylinder);
     objects.push(topCylinder);
     geometries.push(topGeometry);

     // リングの作成
     const ringGeometry = new THREE.TorusGeometry(
       radius - ringDepth / 2,
       ringDepth,
       16,
       radialSegments
     );
     const ringMaterial = new THREE.MeshPhongMaterial({
       color: new THREE.Color().setHSL((i + 0.5) / ringCount, 0.9, 0.3),
       shininess: 120,
     });
     const ring = new THREE.Mesh(ringGeometry, ringMaterial);
     ring.rotation.x = Math.PI / 2;
     ring.position.y = yPos;
     scene.add(ring);
     objects.push(ring);
     geometries.push(ringGeometry);
   }
   ```
   
   ループを使って、8つの円筒形セグメントとリングを作成しています。各セグメントとリングの特徴は以下の通りです：
   
   - **円筒形セグメント**:
     - ジオメトリ: `THREE.CylinderGeometry` を使用して、円筒形を作成しています。高さは `segmentHeight - ringHeight` で、リングの高さを考慮しています。
     - マテリアル: `THREE.MeshPhongMaterial` を使用して、光沢のあるマテリアルを作成しています。色は、インデックス `i` に応じて変化します。
     - 位置: Y座標は、リングの位置から少し上にずらしています。
   
   - **リング**:
     - ジオメトリ: `THREE.TorusGeometry` を使用して、トーラス（ドーナツ形状）を作成しています。半径は円筒形の半径より少し小さく設定しています。
     - マテリアル: `THREE.MeshPhongMaterial` を使用して、光沢のあるマテリアルを作成しています。色は、円筒形セグメントの色と少し異なるように設定しています。
     - 回転: X軸周りに90度回転させて、トーラスを水平に配置しています。
     - 位置: Y座標は、円筒形の高さに応じて均等に配置しています。

### 2-4. `updateObjects(objects, time, initialPositions)`

```js
static updateObjects(objects, time, initialPositions) {
  const ringCount = 8;

  // If initialPositions is not provided, calculate them based on current positions
  const positions = initialPositions || objects.map((obj) => obj.position.y);

  for (let i = 0; i < ringCount; i++) {
    const index = i * 2;
    const topCylinder = objects[index];
    const ring = objects[index + 1];

    const slideFactor = 0.3;
    const phaseOffset = i * (Math.PI / 4);
    const slideY = Math.sin(time * 2 + phaseOffset) * slideFactor;

    topCylinder.position.y = positions[index] + slideY;
    ring.position.y = positions[index + 1] + slideY;

    topCylinder.rotation.y = time * 0.5 + i * 0.1;
    ring.rotation.y = time * 0.5 + i * 0.1;

    const hue = (time * 0.1 + i / ringCount) % 1;
    topCylinder.material.color.setHSL(hue, 0.7, 0.5);
    ring.material.color.setHSL((hue + 0.5) % 1, 0.9, 0.3);
  }
}
```

ここでは、円筒形セグメントとリングのアニメーションを更新しています。主な特徴は以下の通りです：

1. **初期位置の取得**:
   ```js
   const positions = initialPositions || objects.map((obj) => obj.position.y);
   ```
   
   `initialPositions` が提供されていない場合は、現在の位置を使用します。これにより、アニメーションの開始位置が一貫して保たれます。

2. **上下のスライドアニメーション**:
   ```js
   const slideFactor = 0.3;
   const phaseOffset = i * (Math.PI / 4);
   const slideY = Math.sin(time * 2 + phaseOffset) * slideFactor;

   topCylinder.position.y = positions[index] + slideY;
   ring.position.y = positions[index + 1] + slideY;
   ```
   
   各セグメントとリングが上下にスライドします。スライドの振幅は0.3、周波数は2です。`phaseOffset` により、各セグメントとリングのスライドのタイミングがずれます。これにより、波のような効果が生まれます。

3. **回転アニメーション**:
   ```js
   topCylinder.rotation.y = time * 0.5 + i * 0.1;
   ring.rotation.y = time * 0.5 + i * 0.1;
   ```
   
   各セグメントとリングがY軸周りに回転します。回転速度は0.5で、インデックス `i` に応じて初期位相がずれます。

4. **色の変化**:
   ```js
   const hue = (time * 0.1 + i / ringCount) % 1;
   topCylinder.material.color.setHSL(hue, 0.7, 0.5);
   ring.material.color.setHSL((hue + 0.5) % 1, 0.9, 0.3);
   ```
   
   各セグメントとリングの色が時間とともに変化します。色相（Hue）は、時間とインデックス `i` に応じて変化します。リングの色は、セグメントの色と補色の関係になるように設定されています（色相に0.5を加えることで、色相環の反対側の色になります）。

### 2-5. `init()`

```js
async init() {
  const { objects } = GeometryShowcase017.setupScene(this.scene);
  objects.forEach((obj) => this.objects.add(obj));
  this.initialPositions = objects.map((obj) => obj.position.y);
}
```

`init()` メソッドでは、シーンのセットアップ後に各オブジェクトの初期位置を保存しています。これにより、アニメーション中にオブジェクトを初期位置から相対的に移動させることができます。

### 2-6. `update(deltaTime)`

```js
update(deltaTime) {
  this.time += deltaTime;
  GeometryShowcase017.updateObjects(
    Array.from(this.objects),
    this.time,
    this.initialPositions
  );
}
```

`update()` メソッドでは、`updateObjects()` メソッドに `initialPositions` を渡しています。これにより、アニメーションの開始位置が一貫して保たれます。

### 2-7. `getThumbnailCameraPosition()`

```js
static getThumbnailCameraPosition() {
  return {
    position: [4, 2, 4],
    target: [0, 0, 0],
  };
}
```

サムネイル用のカメラ位置が設定されています。カメラは斜め上から円筒形全体を見下ろす位置に配置されています。

---

## 3. CylinderGeometryとTorusGeometryの組み合わせ

`usecase-017` では、`THREE.CylinderGeometry` と `THREE.TorusGeometry` を組み合わせて、リング状の切り込みを持つ円筒形を表現しています。

### 3-1. CylinderGeometryのパラメータ

```js
const topGeometry = new THREE.CylinderGeometry(
  radius,
  radius,
  segmentHeight - ringHeight,
  radialSegments
);
```

`THREE.CylinderGeometry` のコンストラクタは、以下のパラメータを受け取ります：

1. **radiusTop**: 上部の半径（この場合は `radius`）
2. **radiusBottom**: 下部の半径（この場合は `radius`）
3. **height**: 高さ（この場合は `segmentHeight - ringHeight`）
4. **radialSegments**: 円周方向の分割数（この場合は `radialSegments`）
5. **heightSegments**: 高さ方向の分割数（省略された場合は1）
6. **openEnded**: 上下の蓋を開けるかどうか（省略された場合は `false`）
7. **thetaStart**: 開始角度（省略された場合は0）
8. **thetaLength**: 角度の長さ（省略された場合は2π）

`usecase-017` では、上部と下部の半径が同じ円筒形を作成しています。高さは、セグメントの高さからリングの高さを引いた値に設定されています。これにより、リングの高さ分だけ短い円筒形が作成されます。

### 3-2. TorusGeometryのパラメータ

```js
const ringGeometry = new THREE.TorusGeometry(
  radius - ringDepth / 2,
  ringDepth,
  16,
  radialSegments
);
```

`THREE.TorusGeometry` のコンストラクタは、以下のパラメータを受け取ります：

1. **radius**: トーラスの中心から管の中心までの距離（この場合は `radius - ringDepth / 2`）
2. **tube**: 管自体の半径（この場合は `ringDepth`）
3. **radialSegments**: 管の断面の分割数（この場合は16）
4. **tubularSegments**: 管の中心線に沿った分割数（この場合は `radialSegments`）
5. **arc**: 中心角（省略された場合は2π）

`usecase-017` では、円筒形の半径より少し小さい半径のトーラスを作成しています。これにより、トーラスが円筒形の表面に沿うように配置されます。

### 3-3. 組み合わせの効果

円筒形とトーラスを組み合わせることで、リング状の切り込みを持つ円筒形を表現しています。円筒形は本体を、トーラスは切り込みを表現しています。

この組み合わせにより、以下のような視覚効果を生み出しています：

1. **立体感**: 円筒形とトーラスの組み合わせにより、立体的な形状が強調されます。
2. **コントラスト**: 円筒形とトーラスの色を異なる設定にすることで、視覚的なコントラストが生まれます。
3. **動的なパターン**: 各セグメントとリングが独立して動くことで、動的なパターンが生まれます。

---

## 4. 波状のアニメーション

`usecase-017` では、各セグメントとリングが上下にスライドするアニメーションを実装しています。このアニメーションは、波のような効果を生み出しています。

### 4-1. 位相差を持つ正弦波

```js
const phaseOffset = i * (Math.PI / 4);
const slideY = Math.sin(time * 2 + phaseOffset) * slideFactor;
```

各セグメントとリングのスライド量は、正弦波によって計算されています。重要なのは、`phaseOffset` によって各セグメントとリングのスライドのタイミングがずれていることです。

`phaseOffset` は、インデックス `i` に応じて増加します。具体的には、`i * (Math.PI / 4)` という計算式が使用されています。これにより、隣接するセグメントとリングの間の位相差は π/4（45度）になります。

この位相差により、波が上から下へ、または下から上へ伝播しているように見えます。

### 4-2. 波の伝播速度

波の伝播速度は、位相差と時間の関係によって決まります。`usecase-017` では、時間の係数が2であるため、1秒間に約0.32回（2 / 2π）の波が伝播します。

位相差が π/4 であるため、8つのセグメントで1つの完全な波（2π）を形成します。つまり、波が1つのセグメントから次のセグメントに移動するのにかかる時間は、約0.04秒（0.32 / 8）です。

### 4-3. 波の振幅

波の振幅は、`slideFactor` によって決まります。`usecase-017` では、`slideFactor` が0.3に設定されています。これにより、各セグメントとリングは、初期位置から上下に0.3単位の範囲で移動します。

この振幅は、視覚的に適切な値に設定されています。振幅が大きすぎると、セグメント間に大きな隙間が生じてしまいます。振幅が小さすぎると、波の効果が目立たなくなります。

---

## 5. 応用例：リング状の切り込みを持つ円筒形の拡張

`usecase-017` のコードをベースに、以下のような拡張が考えられます：

### 5-1. より複雑な波のパターンを作成する

```js
// 複数の波を重ね合わせる
const wave1 = Math.sin(time * 2 + phaseOffset) * 0.2;
const wave2 = Math.sin(time * 3 + phaseOffset * 2) * 0.1;
const slideY = wave1 + wave2;
```

複数の波を重ね合わせることで、より複雑な波のパターンを作成することができます。

### 5-2. リングの回転速度を変化させる

```js
// リングの回転速度を変化させる
const rotationSpeed = 0.5 + Math.sin(time + i) * 0.3;
topCylinder.rotation.y = time * rotationSpeed;
ring.rotation.y = time * rotationSpeed;
```

リングの回転速度を時間とともに変化させることで、より動的な効果を作ることができます。

### 5-3. リングの半径を変化させる

```js
// リングの半径を変化させる
const radiusScale = 1 + Math.sin(time * 1.5 + i) * 0.1;
ring.scale.x = radiusScale;
ring.scale.z = radiusScale;
```

リングの半径を時間とともに変化させることで、脈動するような効果を作ることができます。

### 5-4. インタラクティブな要素を追加する

```js
// マウスの位置を追跡
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

static updateObjects(objects, time, initialPositions, mouse) {
  // マウスの位置に基づいて波の振幅を変化させる
  const slideFactor = 0.3 + mouse.x * 0.2;
  
  // マウスの位置に基づいて波の周波数を変化させる
  const frequency = 2 + mouse.y * 1;
  
  // ...
  
  const slideY = Math.sin(time * frequency + phaseOffset) * slideFactor;
  
  // ...
}
```

マウスの位置に基づいて、波の振幅や周波数を変化させることで、インタラクティブな要素を追加することができます。

---

## 6. まとめ

「**Usecase-017: Ring-Cut Cylinder Pattern**」では、Three.jsでリング状の切り込みを持つ円筒形を作成し、波状のアニメーションを適用する方法を学びました。

主なポイントは以下の通りです：

1. **円筒形とトーラスの組み合わせ**: `THREE.CylinderGeometry` と `THREE.TorusGeometry` を組み合わせることで、リング状の切り込みを持つ円筒形を表現しました。
2. **波状のアニメーション**: 位相差を持つ正弦波を使用して、各セグメントとリングが上下にスライドするアニメーションを実装しました。
3. **回転アニメーション**: 各セグメントとリングがY軸周りに回転するアニメーションを追加しました。
4. **色の変化**: 時間とともに各セグメントとリングの色が変化するアニメーションを実装しました。
5. **初期位置の保存**: 各オブジェクトの初期位置を保存し、アニメーション中にオブジェクトを初期位置から相対的に移動させる方法を学びました。

これらの技術を組み合わせることで、複雑で魅力的な視覚表現を実現することができます。また、これらの技術は、他の形状やアニメーションにも応用することができます。

次のユースケースでは、さらに複雑な形状や動きを持つ3Dシーンを探索していきます。
