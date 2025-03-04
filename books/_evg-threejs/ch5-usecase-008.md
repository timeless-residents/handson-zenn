---
title: Usecase-008 Rotating Dodecahedron
---
# Usecase-008: Rotating Dodecahedron

**本章では、`usecases/usecase-008` ディレクトリに格納されている「Rotating Dodecahedron」のコードを解説します。**  
このサンプルは、紫色の十二面体（Dodecahedron）がZ軸を中心に回転するシーンです。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、新たなジオメトリである十二面体と、異なる回転軸の組み合わせを使った例となっています。

---

## 1. Dodecahedronとは？

Dodecahedron（十二面体）は、12個の正五角形の面を持つ正多面体です。Three.jsでは `THREE.DodecahedronGeometry` クラスとして実装されており、以下のような特徴があります：

- 12個の正五角形の面
- 20個の頂点
- 30本の辺
- 各頂点から3つの辺が伸びる
- 正十二面体は、すべての面が合同な正五角形

`usecase-008` では、この十二面体を使って、Z軸とY軸の組み合わせで回転するアニメーションを実装しています。これは前章までの回転アニメーションに、異なる回転軸の組み合わせを加えたものです。

---

## 2. `usecase-008/index.js` コード詳細

それでは、実際の `usecase-008` のコードを詳しく見ていきましょう。

```js
// usecase-008/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase008 extends UseCaseBase {
  static metadata = {
    id: "008",
    title: "Rotating Dodecahedron",
    description: "A dodecahedron spinning on its Z-axis",
    categories: ["Geometry", "Animation"],
  };

  constructor(scene) {
    super(scene);
    this.objects = new Set();
    this.time = 0;
  }

  static setupScene(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    const geometry = new THREE.DodecahedronGeometry(1);
    const material = new THREE.MeshPhongMaterial({ color: 0x8800ff });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return { objects: [mesh], geometries: [geometry] };
  }

  static updateObjects(objects, time, deltaTime = 0.016) {
    objects[0].rotation.z += deltaTime;
    objects[0].rotation.y += deltaTime * 0.5;
  }

  async init() {
    const { objects } = GeometryShowcase008.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase008.updateObjects(
      Array.from(this.objects),
      this.time,
      deltaTime
    );
  }

  static getThumbnailCameraPosition() {
    return {
      position: [0, 2, 8],
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
  id: "008",
  title: "Rotating Dodecahedron",
  description: "A dodecahedron spinning on its Z-axis",
  categories: ["Geometry", "Animation"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `008`、 `title` は「Rotating Dodecahedron」など。
- `description` には、十二面体がZ軸周りに回転することについて言及されています。

### 2-2. `setupScene(scene)`

```js
static setupScene(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(ambientLight, directionalLight);

  const geometry = new THREE.DodecahedronGeometry(1);
  const material = new THREE.MeshPhongMaterial({ color: 0x8800ff });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return { objects: [mesh], geometries: [geometry] };
}
```

前章の `usecase-007` との主な違いは以下の点です：

1. **ジオメトリの変更**:
   ```js
   // usecase-007
   const geometry = new THREE.OctahedronGeometry(1);
   
   // usecase-008
   const geometry = new THREE.DodecahedronGeometry(1);
   ```
   
   `THREE.DodecahedronGeometry` は、十二面体を作成するためのジオメトリです。引数は以下の通りです：
   - 第1引数: 半径（この場合は1）
   - 第2引数: 詳細度（省略されているため、デフォルトの0）

2. **マテリアルの色**:
   ```js
   // usecase-007
   const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
   
   // usecase-008
   const material = new THREE.MeshPhongMaterial({ color: 0x8800ff });
   ```
   
   白色（`0xffffff`）から紫色（`0x8800ff`）に変更されています。

### 2-3. `updateObjects(objects, time, deltaTime)`

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].rotation.z += deltaTime;
  objects[0].rotation.y += deltaTime * 0.5;
}
```

ここでの主な特徴は以下の点です：

1. **Z軸回転**:
   ```js
   objects[0].rotation.z += deltaTime;
   ```
   
   Z軸周りの回転を標準速度（`deltaTime`）で行っています。これは前章までのX軸やY軸回転とは異なる回転軸です。

2. **Y軸回転の組み合わせ**:
   ```js
   objects[0].rotation.y += deltaTime * 0.5;
   ```
   
   Y軸周りの回転も同時に行っていますが、速度は半分（`deltaTime * 0.5`）に設定されています。

この実装により、十二面体がZ軸を中心に回転しながら、同時にY軸周りにもゆっくりと回転するアニメーションが実現されています。Z軸回転が主で、Y軸回転が従の関係になっています。

### 2-4. `getThumbnailBlob()`

```js
static getThumbnailBlob() {
  // Create a simple SVG representation of a purple dodecahedron
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#111111"/>
      
      <!-- Dodecahedron representation (simplified) -->
      <polygon points="100,60 130,80 120,120 80,120 70,80" fill="#8800ff" stroke="#ffffff" stroke-width="1"/>
      <polygon points="70,80 80,120 60,140 50,100" fill="#7700dd" stroke="#ffffff" stroke-width="1"/>
      <polygon points="130,80 150,100 140,140 120,120" fill="#6600bb" stroke="#ffffff" stroke-width="1"/>
      <polygon points="80,120 120,120 110,150 90,150" fill="#5500aa" stroke="#ffffff" stroke-width="1"/>
      
      <!-- Highlight -->
      <polygon points="100,60 110,70 90,70" fill="#ffffff" opacity="0.3"/>
    </svg>
  `;

  // Unicode-safe encoding
  const encodedSvg = unescape(encodeURIComponent(svgString));
  const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

  // Convert to Blob
  return fetch(dataURL).then((res) => res.blob());
}
```

サムネイル生成用のSVGが、十二面体を表現するように変更されています。実際の十二面体は12面ありますが、サムネイルでは簡略化して4つの多角形で表現しています。また、異なる色合いの紫色を使用して立体感を出しています。

---

## 3. 前章との比較

`usecase-008` は前章までと基本的な構造は同じですが、以下の点が異なります：

1. **ジオメトリ**: OctahedronGeometry から DodecahedronGeometry に変更
2. **色**: 虹色に変化する色から固定の紫色に変更
3. **アニメーション**: Y軸回転と色の変化から、Z軸とY軸の組み合わせ回転に変更
4. **サムネイル**: 八面体から十二面体を表現するSVGに変更

特に重要なのは、**Z軸を主回転軸として使用している点**です。これまでのユースケースでは主にX軸やY軸を回転軸として使用していましたが、Z軸を使うことで異なる視点からの回転を表現しています。

---

## 4. DodecahedronGeometryの詳細

`THREE.DodecahedronGeometry` は、正十二面体を作成するためのジオメトリです。内部的には、球体を20個の頂点で近似した形状として実装されています。

```js
// DodecahedronGeometryの基本的な使い方
const geometry = new THREE.DodecahedronGeometry(radius, detail);
```

- **radius**: 十二面体を内包する球の半径（デフォルト: 1）
- **detail**: 細分化レベル（デフォルト: 0）
  - 0: 基本的な十二面体（12面）
  - 1以上: 各面をさらに細分化し、より球体に近づく

`usecase-008` では以下のパラメータを使用しています：

```js
const geometry = new THREE.DodecahedronGeometry(1);
```

- 半径: 1
- 詳細度: 省略（デフォルトの0）

これにより、半径1の球に内接する基本的な十二面体が作成されます。

### 4-1. DodecahedronGeometryのバリエーション

```js
// 基本的な十二面体
const dodeca1 = new THREE.DodecahedronGeometry(1, 0);

// より大きな十二面体
const dodeca2 = new THREE.DodecahedronGeometry(2, 0);

// 細分化された十二面体（より球体に近い）
const dodeca3 = new THREE.DodecahedronGeometry(1, 1);

// さらに細分化された十二面体
const dodeca4 = new THREE.DodecahedronGeometry(1, 2);
```

詳細度を上げると、以下のような変化が起こります：

- **detail = 0**: 12個の正五角形の面を持つ基本的な十二面体
- **detail = 1**: 各面がさらに細分化され、より多くの面を持つ多面体に
- **detail = 2**: さらに細分化され、より球体に近い形状に

詳細度を上げるほど滑らかな見た目になりますが、その分処理負荷も高くなります。用途に応じて適切な詳細度を選ぶことが重要です。

---

## 5. Z軸回転の特徴

`usecase-008` の重要な特徴の一つは、Z軸を主回転軸として使用している点です。

```js
objects[0].rotation.z += deltaTime;
objects[0].rotation.y += deltaTime * 0.5;
```

### 5-1. 各回転軸の特徴

Three.jsの座標系では、各回転軸は以下のような特徴を持ちます：

1. **X軸回転**: 横軸（左右）を中心とした回転。オブジェクトは前後に転がるように回転します。
   ```js
   objects[0].rotation.x += deltaTime;
   ```

2. **Y軸回転**: 縦軸（上下）を中心とした回転。オブジェクトはその場で回転します（一般的な「回転」のイメージ）。
   ```js
   objects[0].rotation.y += deltaTime;
   ```

3. **Z軸回転**: 奥行き軸（前後）を中心とした回転。オブジェクトは時計回りまたは反時計回りに回転します。
   ```js
   objects[0].rotation.z += deltaTime;
   ```

Z軸回転は、2D平面上での回転に相当するため、平面的な回転の印象を与えます。これは、時計の針の動きや、車輪の回転などに似ています。

### 5-2. 複数軸の組み合わせ

`usecase-008` では、Z軸とY軸の回転を組み合わせています：

```js
objects[0].rotation.z += deltaTime;      // 主回転（標準速度）
objects[0].rotation.y += deltaTime * 0.5; // 副回転（半分の速度）
```

この組み合わせにより、以下のような効果が得られます：

1. **主回転と副回転**: Z軸回転が主で、Y軸回転が従の関係になっています。これにより、Z軸周りの回転が目立ちつつも、Y軸回転によって視点が変化し、より立体的な印象になります。

2. **異なる速度**: Z軸回転は標準速度、Y軸回転は半分の速度で行われています。これにより、回転に変化がつき、単調さを避けることができます。

3. **複雑な軌道**: 2つの回転軸を組み合わせることで、オブジェクトの各点は空間内で複雑な軌道を描きます。これにより、より豊かな視覚的表現が可能になります。

---

## 6. 応用例：DodecahedronGeometryと回転の拡張

`usecase-008` のコードをベースに、以下のような拡張が考えられます：

### 6-1. 十二面体のパラメータを変更する

```js
// より大きな十二面体
const geometry = new THREE.DodecahedronGeometry(1.5, 0);

// 細分化された十二面体
const geometry = new THREE.DodecahedronGeometry(1, 1);
```

### 6-2. 回転パターンを変更する

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  // 3軸すべてで回転
  objects[0].rotation.x += deltaTime * 0.3;
  objects[0].rotation.y += deltaTime * 0.5;
  objects[0].rotation.z += deltaTime * 1.0;
  
  // または、時間に応じて回転速度を変化
  const speedZ = 1 + Math.sin(time) * 0.5; // 0.5～1.5の間で変動
  objects[0].rotation.z += deltaTime * speedZ;
  objects[0].rotation.y += deltaTime * 0.5;
}
```

### 6-3. マテリアルを変更する

```js
// ワイヤーフレーム表示
const material = new THREE.MeshBasicMaterial({
  color: 0x8800ff,
  wireframe: true
});

// または、物理ベースのマテリアル
const material = new THREE.MeshStandardMaterial({
  color: 0x8800ff,
  metalness: 0.7,
  roughness: 0.2
});
```

### 6-4. 複数の十二面体を配置する

```js
static setupScene(scene) {
  // 複数の十二面体を作成
  const objects = [];
  const geometries = [];
  
  for (let i = 0; i < 3; i++) {
    const geometry = new THREE.DodecahedronGeometry(0.7, 0);
    geometries.push(geometry);
    
    const material = new THREE.MeshPhongMaterial({ color: 0x8800ff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = i * 2 - 2;
    scene.add(mesh);
    objects.push(mesh);
  }
  
  return { objects, geometries };
}

static updateObjects(objects, time, deltaTime = 0.016) {
  // 各十二面体に異なる回転を適用
  objects.forEach((obj, i) => {
    // 異なる軸を主回転軸として使用
    switch (i) {
      case 0:
        obj.rotation.x += deltaTime; // X軸主回転
        obj.rotation.y += deltaTime * 0.5;
        break;
      case 1:
        obj.rotation.y += deltaTime; // Y軸主回転
        obj.rotation.z += deltaTime * 0.5;
        break;
      case 2:
        obj.rotation.z += deltaTime; // Z軸主回転
        obj.rotation.x += deltaTime * 0.5;
        break;
    }
  });
}
```

---

## 7. 正多面体の完全系列

十二面体は、正多面体（プラトンの立体）と呼ばれる特別な多面体の一つです。Three.jsでは、5種類すべての正多面体がジオメトリとして実装されています：

1. **TetrahedronGeometry**: 四面体（4面、4頂点）
2. **HexahedronGeometry/BoxGeometry**: 六面体/立方体（6面、8頂点）
3. **OctahedronGeometry**: 八面体（8面、6頂点）
4. **DodecahedronGeometry**: 十二面体（12面、20頂点）
5. **IcosahedronGeometry**: 二十面体（20面、12頂点）

これらの正多面体は、それぞれ異なる対称性と特徴を持っています：

- **四面体**: 最も単純な正多面体で、4つの正三角形の面を持ちます。
- **六面体/立方体**: 6つの正方形の面を持ち、最も馴染みのある形状です。
- **八面体**: 8つの正三角形の面を持ち、立方体と双対の関係にあります。
- **十二面体**: 12の正五角形の面を持ち、より複雑な対称性を示します。
- **二十面体**: 20の正三角形の面を持ち、最も面の多い正多面体です。

これらの正多面体は、数学的に重要な性質を持ち、自然界にも見られる形状です。例えば、一部のウイルスは二十面体の形状を持っています。

---

## 8. まとめ

「**Usecase-008: Rotating Dodecahedron**」では、Three.jsの `DodecahedronGeometry` を使って、Z軸を中心に回転する十二面体を実装しました。

主なポイントは以下の通りです：

1. **DodecahedronGeometryの使用**: 十二面体を作成し、正多面体の一つである十二面体の表現方法を学びました。
2. **Z軸回転の使用**: Z軸を主回転軸として使用し、異なる視点からの回転を表現しました。
3. **複数軸の組み合わせ**: Z軸とY軸の回転を組み合わせることで、より複雑で立体的な動きを実現しました。
4. **サムネイル生成**: 十二面体を表現するSVGを作成し、ギャラリー表示に対応しました。

このサンプルは、Three.jsでの様々な回転軸の使い方と、正多面体の一つである十二面体の表現方法を示す良い例となっています。特に、Z軸回転を主軸とすることで、これまでとは異なる視点からの回転を表現できることを学びました。

---

## 9. 次のステップ

`usecase-008` を理解したら、次のステップとして以下のような発展が考えられます：

1. **他の正多面体を試す**: 残りの正多面体（四面体、六面体、八面体、二十面体）を使って同様のアニメーションを実装し、形状の違いによる視覚的効果の違いを比較する。
2. **回転軸の動的な変更**: 時間経過とともに主回転軸を変化させ、より複雑な動きを実現する。
3. **ユーザーインタラクション**: マウスやキーボードの入力に応じて、回転軸や回転速度を変更できるようにする。
4. **マテリアルの工夫**: 面ごとに異なる色や質感を適用し、回転によって見える面が変わることで色の変化を表現する。

これらの発展は、今後のユースケースで順次紹介していく予定です。`usecase-008` で学んだ十二面体と回転軸の組み合わせの基本を応用することで、より高度な3D表現へと進んでいきましょう。
