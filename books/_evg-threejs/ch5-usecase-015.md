---
title: Usecase-015 Spiral Tower
---
# Usecase-015: Spiral Tower

**本章では、`usecases/usecase-015` ディレクトリに格納されている「Spiral Tower」のコードを解説します。**  
このサンプルは、螺旋状に配置された複数のオクタヘドロン（八面体）が、回転しながら上昇していくアニメーションを実装しています。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、螺旋状の配置と複合アニメーションを組み合わせた例となっています。

---

## 1. 螺旋状の配置と複合アニメーション

これまでのユースケースでは、グリッド状や直線状、同心円状など、様々な配置パターンを扱ってきました。`usecase-015` では、螺旋状という新しい配置パターンを導入しています。

螺旋状の配置は、中心軸を中心に回転しながら上昇（または下降）していく配置パターンです。これにより、立体的で動的な視覚効果を作り出すことができます。

`usecase-015` では、以下の特徴を持つシーンを作成しています：

1. **螺旋状の配置**: 異なる高さと角度を持つ15個のオクタヘドロンを螺旋状に配置
2. **回転アニメーション**: 各オブジェクトがX軸とY軸周りに回転
3. **垂直方向の振動**: 各オブジェクトが上下に振動
4. **螺旋の半径の変化**: 螺旋全体の半径が時間とともに拡大・縮小
5. **色の変化**: 時間とともに各オブジェクトの色が変化

これらのアニメーション効果を組み合わせることで、複雑で魅力的な視覚表現を実現しています。

---

## 2. `usecase-015/index.js` コード詳細

それでは、実際の `usecase-015` のコードを詳しく見ていきましょう。

```js
// usecase-015/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase015 extends UseCaseBase {
  static metadata = {
    id: "015",
    title: "Spiral Tower",
    description: "Animated spiral tower with rotating elements",
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

    // Create base geometry
    const geometry = new THREE.OctahedronGeometry(0.5);
    geometries.push(geometry);

    // Create spiral tower
    const numLevels = 15;
    const spiralRadius = 2;
    const heightStep = 0.5;

    for (let i = 0; i < numLevels; i++) {
      const angle = (i / numLevels) * Math.PI * 4; // 2 complete rotations
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / numLevels, 0.7, 0.5),
      });

      const shape = new THREE.Mesh(geometry, material);

      // Position in spiral pattern
      shape.position.x = Math.cos(angle) * spiralRadius;
      shape.position.z = Math.sin(angle) * spiralRadius;
      shape.position.y = i * heightStep;

      scene.add(shape);
      objects.push(shape);
    }

    return { objects, geometries };
  }

  static updateObjects(objects, time) {
    objects.forEach((shape, i) => {
      // Rotation animation
      shape.rotation.x = time * 2;
      shape.rotation.y = time * 1.5;

      // Vertical oscillation
      shape.position.y += Math.sin(time * 3 + i) * 0.02;

      // Spiral radius breathing
      const angle = (i / objects.length) * Math.PI * 4;
      const radiusScale = 1 + Math.sin(time * 2) * 0.2;
      shape.position.x = Math.cos(angle) * 2 * radiusScale;
      shape.position.z = Math.sin(angle) * 2 * radiusScale;

      // Color animation
      const hue = (time * 0.1 + i / objects.length) % 1;
      shape.material.color.setHSL(hue, 0.7, 0.5);
    });
  }

  async init() {
    const { objects } = GeometryShowcase015.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase015.updateObjects(Array.from(this.objects), this.time);
  }

  static getThumbnailCameraPosition() {
    return {
      position: [8, 10, 8],
      target: [0, 5, 0],
    };
  }

  // getThumbnailBlob と createPreview メソッドは省略
}
```

### 2-1. `metadata`

```js
static metadata = {
  id: "015",
  title: "Spiral Tower",
  description: "Animated spiral tower with rotating elements",
  categories: ["Geometry", "Animation", "Pattern"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `015`、 `title` は「Spiral Tower」など。
- `description` には、アニメーションする螺旋状の塔について言及されています。
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

  // Create base geometry
  const geometry = new THREE.OctahedronGeometry(0.5);
  geometries.push(geometry);

  // Create spiral tower
  const numLevels = 15;
  const spiralRadius = 2;
  const heightStep = 0.5;

  for (let i = 0; i < numLevels; i++) {
    const angle = (i / numLevels) * Math.PI * 4; // 2 complete rotations
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(i / numLevels, 0.7, 0.5),
    });

    const shape = new THREE.Mesh(geometry, material);

    // Position in spiral pattern
    shape.position.x = Math.cos(angle) * spiralRadius;
    shape.position.z = Math.sin(angle) * spiralRadius;
    shape.position.y = i * heightStep;

    scene.add(shape);
    objects.push(shape);
  }

  return { objects, geometries };
}
```

ここでは、螺旋状に配置された15個のオクタヘドロンを作成しています。主な特徴は以下の通りです：

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
   const geometry = new THREE.OctahedronGeometry(0.5);
   geometries.push(geometry);
   ```
   
   オクタヘドロン（八面体）ジオメトリを作成しています。半径は0.5です。

3. **螺旋塔のパラメータ**:
   ```js
   const numLevels = 15;
   const spiralRadius = 2;
   const heightStep = 0.5;
   ```
   
   - `numLevels`: 塔の階層数（オブジェクトの数）
   - `spiralRadius`: 螺旋の半径
   - `heightStep`: 各階層の高さの差

4. **オブジェクトの作成と配置**:
   ```js
   for (let i = 0; i < numLevels; i++) {
     const angle = (i / numLevels) * Math.PI * 4; // 2 complete rotations
     const material = new THREE.MeshPhongMaterial({
       color: new THREE.Color().setHSL(i / numLevels, 0.7, 0.5),
     });

     const shape = new THREE.Mesh(geometry, material);

     // Position in spiral pattern
     shape.position.x = Math.cos(angle) * spiralRadius;
     shape.position.z = Math.sin(angle) * spiralRadius;
     shape.position.y = i * heightStep;

     scene.add(shape);
     objects.push(shape);
   }
   ```
   
   ループを使って、15個のオクタヘドロンを作成しています。各オブジェクトの特徴は以下の通りです：
   
   - **角度**: `angle = (i / numLevels) * Math.PI * 4` により、螺旋状に2周分（4π）の角度を割り当てています。
   - **色**: HSL色空間を使用して、インデックス `i` に応じて色相が変化するようにしています。
   - **位置**: 
     - X座標: `Math.cos(angle) * spiralRadius`
     - Z座標: `Math.sin(angle) * spiralRadius`
     - Y座標: `i * heightStep`
   
   これにより、XZ平面上で円を描きながら、Y軸方向に上昇していく螺旋状の配置が実現されています。

### 2-3. `updateObjects(objects, time)`

```js
static updateObjects(objects, time) {
  objects.forEach((shape, i) => {
    // Rotation animation
    shape.rotation.x = time * 2;
    shape.rotation.y = time * 1.5;

    // Vertical oscillation
    shape.position.y += Math.sin(time * 3 + i) * 0.02;

    // Spiral radius breathing
    const angle = (i / objects.length) * Math.PI * 4;
    const radiusScale = 1 + Math.sin(time * 2) * 0.2;
    shape.position.x = Math.cos(angle) * 2 * radiusScale;
    shape.position.z = Math.sin(angle) * 2 * radiusScale;

    // Color animation
    const hue = (time * 0.1 + i / objects.length) % 1;
    shape.material.color.setHSL(hue, 0.7, 0.5);
  });
}
```

ここでは、各オブジェクトの回転、位置、色を更新しています。主な特徴は以下の通りです：

1. **回転アニメーション**:
   ```js
   shape.rotation.x = time * 2;
   shape.rotation.y = time * 1.5;
   ```
   
   各オブジェクトがX軸とY軸周りに回転します。X軸周りの回転速度は2、Y軸周りの回転速度は1.5です。

2. **垂直方向の振動**:
   ```js
   shape.position.y += Math.sin(time * 3 + i) * 0.02;
   ```
   
   各オブジェクトがY軸方向（垂直方向）に振動します。振動の振幅は0.02、周波数は3です。インデックス `i` を加えることで、各オブジェクトの振動のタイミングがずれます。

3. **螺旋の半径の変化**:
   ```js
   const angle = (i / objects.length) * Math.PI * 4;
   const radiusScale = 1 + Math.sin(time * 2) * 0.2;
   shape.position.x = Math.cos(angle) * 2 * radiusScale;
   shape.position.z = Math.sin(angle) * 2 * radiusScale;
   ```
   
   螺旋全体の半径が時間とともに拡大・縮小します。半径のスケールは0.8から1.2の範囲で変化します。これにより、螺旋全体が「呼吸」するような効果が生まれます。

4. **色のアニメーション**:
   ```js
   const hue = (time * 0.1 + i / objects.length) % 1;
   shape.material.color.setHSL(hue, 0.7, 0.5);
   ```
   
   各オブジェクトの色が時間とともに変化します。色相（Hue）は、時間とインデックス `i` に応じて変化します。`% 1` により、色相の値が0から1の範囲に収まります。

これらのアニメーション効果を組み合わせることで、複雑で魅力的な視覚表現を実現しています。

### 2-4. `getThumbnailCameraPosition()`

```js
static getThumbnailCameraPosition() {
  return {
    position: [8, 10, 8],
    target: [0, 5, 0],
  };
}
```

サムネイル用のカメラ位置が変更されています。螺旋塔全体を見渡せるように、カメラが斜め上から見下ろす位置に配置されています。また、注視点（target）のY座標が5に設定されており、塔の中央付近を見るようになっています。

---

## 3. 螺旋状の配置の数学的背景

螺旋状の配置は、以下のパラメトリック方程式で表されます：

x(t) = r * cos(t)
y(t) = h * t
z(t) = r * sin(t)

ここで、
- r: 螺旋の半径
- h: 螺旋のピッチ（1回転あたりの高さの増加量）
- t: パラメータ（角度）

`usecase-015` では、以下のように実装されています：

```js
const angle = (i / numLevels) * Math.PI * 4; // 2 complete rotations
shape.position.x = Math.cos(angle) * spiralRadius;
shape.position.z = Math.sin(angle) * spiralRadius;
shape.position.y = i * heightStep;
```

これは、上記のパラメトリック方程式を離散化したものと考えることができます。ここで、
- `spiralRadius` が r に対応
- `heightStep * numLevels / (Math.PI * 4)` が h に対応
- `angle` が t に対応

螺旋状の配置は、様々な自然現象や人工物に見られるパターンです。例えば、貝殻、DNA、階段、タワーなどがあります。このような配置は、空間を効率的に利用しながら、視覚的に魅力的なパターンを作り出すことができます。

---

## 4. OctahedronGeometryの詳細

`usecase-015` では、`THREE.OctahedronGeometry` を使って、オクタヘドロン（八面体）を作成しています。オクタヘドロンは、8つの面（三角形）、6つの頂点、12の辺を持つ正多面体です。

### 4-1. OctahedronGeometryのパラメータ

```js
const geometry = new THREE.OctahedronGeometry(0.5);
```

`THREE.OctahedronGeometry` のコンストラクタは、以下のパラメータを受け取ります：

1. **radius**: オクタヘドロンの半径（この場合は0.5）
2. **detail**: 細分化のレベル（省略された場合は0）

`usecase-015` では、半径0.5のオクタヘドロンを作成しています。細分化のレベルは省略されているため、0になります。

### 4-2. オクタヘドロンの数学的性質

オクタヘドロンは、以下の頂点を持ちます：

(±1, 0, 0), (0, ±1, 0), (0, 0, ±1)

これらの頂点を結ぶことで、8つの三角形の面が形成されます。オクタヘドロンは、立方体の双対多面体です。つまり、立方体の各面の中心を頂点とし、それらを結ぶことでオクタヘドロンが形成されます。

オクタヘドロンは、その対称性と幾何学的な美しさから、3Dグラフィックスでよく使用されるジオメトリの一つです。

---

## 5. 複合アニメーションの詳細

`usecase-015` では、複数のアニメーション効果を組み合わせています。これにより、より複雑で魅力的な視覚表現を実現しています。

### 5-1. 回転アニメーション

```js
shape.rotation.x = time * 2;
shape.rotation.y = time * 1.5;
```

各オブジェクトがX軸とY軸周りに回転します。X軸周りの回転速度は2、Y軸周りの回転速度は1.5です。これにより、各オブジェクトが複雑な軌道で回転します。

回転速度の比率が2:1.5 = 4:3であるため、4回X軸周りに回転する間に3回Y軸周りに回転します。これにより、回転のパターンが周期的に繰り返されます。

### 5-2. 垂直方向の振動

```js
shape.position.y += Math.sin(time * 3 + i) * 0.02;
```

各オブジェクトがY軸方向（垂直方向）に振動します。振動の振幅は0.02、周波数は3です。インデックス `i` を加えることで、各オブジェクトの振動のタイミングがずれます。

これにより、波のような効果が生まれます。下から上に向かって波が伝播しているように見えます。

### 5-3. 螺旋の半径の変化

```js
const angle = (i / objects.length) * Math.PI * 4;
const radiusScale = 1 + Math.sin(time * 2) * 0.2;
shape.position.x = Math.cos(angle) * 2 * radiusScale;
shape.position.z = Math.sin(angle) * 2 * radiusScale;
```

螺旋全体の半径が時間とともに拡大・縮小します。半径のスケールは0.8から1.2の範囲で変化します。これにより、螺旋全体が「呼吸」するような効果が生まれます。

周波数は2であるため、1秒間に約0.32回（2 / 2π）の呼吸を行います。

### 5-4. 色のアニメーション

```js
const hue = (time * 0.1 + i / objects.length) % 1;
shape.material.color.setHSL(hue, 0.7, 0.5);
```

各オブジェクトの色が時間とともに変化します。色相（Hue）は、時間とインデックス `i` に応じて変化します。`% 1` により、色相の値が0から1の範囲に収まります。

周波数は0.1であるため、1秒間に約0.016回（0.1 / 2π）の色相の変化を行います。つまり、約63秒で色相が一周します。

### 5-5. 複合効果

これらのアニメーション効果を組み合わせることで、以下のような視覚効果を生み出します：

1. **動的な立体感**: 回転により、オクタヘドロンの3次元的な形状が強調されます。
2. **リズミカルな動き**: 垂直方向の振動と螺旋の半径の変化により、リズミカルな動きが生まれます。
3. **色の変化**: 色の変化により、視覚的な興味が引き立てられます。
4. **複雑な動きのパターン**: 4つのアニメーション効果が組み合わさることで、複雑で予測しにくい動きのパターンが生まれます。

これらの効果により、見る人を惹きつける魅力的な視覚表現が実現されています。

---

## 6. 応用例：螺旋状の配置と複合アニメーションの拡張

`usecase-015` のコードをベースに、以下のような拡張が考えられます：

### 6-1. 異なるジオメトリを使用する

```js
const geometries = [
  new THREE.OctahedronGeometry(0.5),
  new THREE.TetrahedronGeometry(0.6),
  new THREE.IcosahedronGeometry(0.4),
  new THREE.DodecahedronGeometry(0.5)
];

for (let i = 0; i < numLevels; i++) {
  const geometryIndex = i % geometries.length;
  const geometry = geometries[geometryIndex];
  
  // ...
}
```

異なる種類のジオメトリを交互に使用することで、より変化に富んだ視覚表現を作ることができます。

### 6-2. 二重螺旋を作成する

```js
for (let i = 0; i < numLevels; i++) {
  const angle1 = (i / numLevels) * Math.PI * 4;
  const angle2 = angle1 + Math.PI; // 180度ずらす
  
  // 1つ目の螺旋
  const shape1 = new THREE.Mesh(geometry, material.clone());
  shape1.position.x = Math.cos(angle1) * spiralRadius;
  shape1.position.z = Math.sin(angle1) * spiralRadius;
  shape1.position.y = i * heightStep;
  scene.add(shape1);
  objects.push(shape1);
  
  // 2つ目の螺旋
  const shape2 = new THREE.Mesh(geometry, material.clone());
  shape2.position.x = Math.cos(angle2) * spiralRadius;
  shape2.position.z = Math.sin(angle2) * spiralRadius;
  shape2.position.y = i * heightStep;
  scene.add(shape2);
  objects.push(shape2);
}
```

2つの螺旋を180度ずらして配置することで、DNAのような二重螺旋構造を作ることができます。

### 6-3. 螺旋のピッチを変化させる

```js
for (let i = 0; i < numLevels; i++) {
  const t = i / numLevels;
  const angle = t * Math.PI * 4;
  const heightStep = 0.5 + Math.sin(t * Math.PI) * 0.3;
  
  shape.position.y = i * heightStep;
  // ...
}
```

螺旋のピッチ（高さの増加量）を変化させることで、より有機的な形状を作ることができます。

### 6-4. インタラクティブな要素を追加する

```js
// マウスの位置を追跡
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

static updateObjects(objects, time, mouse) {
  // マウスの位置に基づいて螺旋の半径を変化させる
  const radiusScale = 1 + mouse.x * 0.5;
  const rotationSpeed = 1 + mouse.y * 0.5;
  
  objects.forEach((shape, i) => {
    // 回転速度をマウスのY座標に基づいて変化させる
    shape.rotation.x = time * 2 * rotationSpeed;
    shape.rotation.y = time * 1.5 * rotationSpeed;
    
    // 螺旋の半径をマウスのX座標に基づいて変化させる
    const angle = (i / objects.length) * Math.PI * 4;
    shape.position.x = Math.cos(angle) * 2 * radiusScale;
    shape.position.z = Math.sin(angle) * 2 * radiusScale;
    
    // ...
  });
}
```

マウスの位置に基づいて、螺旋の半径や回転速度を変化させることで、インタラクティブな要素を追加することができます。

---

## 7. 螺旋状の配置の応用例

螺旋状の配置は、様々な視覚表現に応用することができます。以下に、螺旋状の配置の応用例をいくつか紹介します。

### 7-1. DNAモデル

```js
const numLevels = 20;
const spiralRadius = 2;
const heightStep = 0.5;
const angleOffset = Math.PI; // 180度

for (let i = 0; i < numLevels; i++) {
  const angle1 = (i / numLevels) * Math.PI * 4;
  const angle2 = angle1 + angleOffset;
  
  // 1つ目の螺旋
  const sphere1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.3),
    new THREE.MeshPhongMaterial({ color: 0xff0000 })
  );
  sphere1.position.x = Math.cos(angle1) * spiralRadius;
  sphere1.position.z = Math.sin(angle1) * spiralRadius;
  sphere1.position.y = i * heightStep;
  scene.add(sphere1);
  objects.push(sphere1);
  
  // 2つ目の螺旋
  const sphere2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.3),
    new THREE.MeshPhongMaterial({ color: 0x0000ff })
  );
  sphere2.position.x = Math.cos(angle2) * spiralRadius;
  sphere2.position.z = Math.sin(angle2) * spiralRadius;
  sphere2.position.y = i * heightStep;
  scene.add(sphere2);
  objects.push(sphere2);
  
  // 塩基対（2つの螺旋を結ぶ線）
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });
  const points = [
    new THREE.Vector3(sphere1.position.x, sphere1.position.y, sphere1.position.z),
    new THREE.Vector3(sphere2.position.x, sphere2.position.y, sphere2.position.z)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  scene.add(line);
  objects.push(line);
}
```

DNAの二重螺旋構造を表現することができます。2つの螺旋を180度ずらして配置し、それらを結ぶ線（塩基対）を追加します。

### 7-2. 螺旋階段

```js
const numSteps = 20;
const spiralRadius = 3;
const heightStep = 0.5;
const stepWidth = 2;
const stepDepth = 0.5;

for (let i = 0; i < numSteps; i++) {
  const angle = (i / numSteps) * Math.PI * 4;
  
  // 階段のステップ
  const stepGeometry = new THREE.BoxGeometry(stepWidth, 0.1, stepDepth);
  const stepMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
  const step = new THREE.Mesh(stepGeometry, stepMaterial);
  
  // ステップの位置と回転
  step.position.x = Math.cos(angle) * spiralRadius;
  step.position.z = Math.sin(angle) * spiralRadius;
  step.position.y = i * heightStep;
  step.rotation.y = angle + Math.PI / 2; // ステップを螺旋の接線方向に向ける
  
  scene.add(step);
  objects.push(step);
}
```

螺旋階段を表現することができます。各ステップを螺旋状に配置し、ステップの向きを螺旋の接線方向に合わせます。

### 7-3. 螺旋銀河

```js
const numStars = 1000;
const galaxyRadius = 10;
const galaxyHeight = 2;
const spiralTightness = 0.5;

for (let i = 0; i < numStars; i++) {
  // 銀河の中心からの距離（0〜galaxyRadius）
  const distance = Math.random() * galaxyRadius;
  
  // 螺旋の角度（距離に応じて増加）
  const angle = distance * spiralTightness;
  
  // 星の位置
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  const y = (Math.random() - 0.5) * galaxyHeight * (1 - distance / galaxyRadius);
  
  // 星の作成
  const starGeometry = new THREE.SphereGeometry(0.05);
  const brightness = 0.5 + Math.random() * 0.5;
  const starMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setHSL(0.6, 0.2, brightness),
    emissive: new THREE.Color().setHSL(0.6, 0.7, brightness)
  });
  const star = new THREE.Mesh(starGeometry, starMaterial);
  
  star.position.set(x, y, z);
  scene.add(star);
  objects.push(star);
}
```

螺旋銀河を表現することができます。多数の星を螺旋状に配置し、銀河の中心に近いほど密度が高くなるようにします。また、銀河の中心に近いほど垂直方向の広がりが大きくなるようにします。

---

## 8. まとめ

`usecase-015` では、螺旋状の配置と複合アニメーションを組み合わせた「Spiral Tower」を実装しました。螺旋状の配置は、中心軸を中心に回転しながら上昇（または下降）していく配置パターンで、立体的で動的な視覚効果を作り出すことができます。

複合アニメーションでは、回転、垂直方向の振動、螺旋の半径の変化、色の変化など、複数のアニメーション効果を組み合わせることで、複雑で魅力的な視覚表現を実現しています。

螺旋状の配置は、DNAモデル、螺旋階段、螺旋銀河など、様々な視覚表現に応用することができます。これらの応用例を通じて、Three.jsの表現力の豊かさを実感することができます。

次のユースケースでは、さらに複雑な形状や動きを持つ3Dシーンを探索していきます。
