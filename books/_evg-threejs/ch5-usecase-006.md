---
title: Usecase-006 Spinning Tetrahedron
---
# Usecase-006: Spinning Tetrahedron

**本章では、`usecases/usecase-006` ディレクトリに格納されている「Spinning Tetrahedron」のコードを解説します。**  
このサンプルは、ライトグリーン色の四面体（Tetrahedron）が高速に回転するシンプルなシーンです。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、新たなジオメトリである四面体と、複数軸での高速回転を組み合わせた例となっています。

---

## 1. Tetrahedronとは？

Tetrahedron（四面体）は、4つの三角形の面を持つ最も単純な多面体です。Three.jsでは `THREE.TetrahedronGeometry` クラスとして実装されており、以下のような特徴があります：

- 4つの正三角形の面
- 4つの頂点
- 6つの辺
- 各頂点から3つの辺が伸びる
- 正四面体は、すべての面が合同な正三角形

`usecase-006` では、この四面体を使って、複数の軸で高速に回転するアニメーションを実装しています。これは `usecase-001` の二十面体の回転と似ていますが、より単純な形状と、より複雑な回転パターンを組み合わせています。

---

## 2. `usecase-006/index.js` コード詳細

それでは、実際の `usecase-006` のコードを詳しく見ていきましょう。

```js
// usecase-006/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase006 extends UseCaseBase {
  static metadata = {
    id: "006",
    title: "Spinning Tetrahedron",
    description: "A tetrahedron spinning rapidly",
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

    const geometry = new THREE.TetrahedronGeometry(1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff88 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return { objects: [mesh], geometries: [geometry] };
  }

  static updateObjects(objects, time, deltaTime = 0.016) {
    objects[0].rotation.x += deltaTime * 2;
    objects[0].rotation.y += deltaTime * 2;
  }

  async init() {
    const { objects } = GeometryShowcase006.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase006.updateObjects(
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
  id: "006",
  title: "Spinning Tetrahedron",
  description: "A tetrahedron spinning rapidly",
  categories: ["Geometry", "Animation"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `006`、 `title` は「Spinning Tetrahedron」など。
- `description` には、四面体が高速に回転することについて言及されています。

### 2-2. `setupScene(scene)`

```js
static setupScene(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(ambientLight, directionalLight);

  const geometry = new THREE.TetrahedronGeometry(1);
  const material = new THREE.MeshPhongMaterial({ color: 0x00ff88 });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return { objects: [mesh], geometries: [geometry] };
}
```

前章の `usecase-005` との主な違いは以下の点です：

1. **ジオメトリの変更**:
   ```js
   // usecase-005
   const geometry = new THREE.ConeGeometry(1, 2, 32);
   
   // usecase-006
   const geometry = new THREE.TetrahedronGeometry(1);
   ```
   
   `THREE.TetrahedronGeometry` は、四面体を作成するためのジオメトリです。引数は以下の通りです：
   - 第1引数: 半径（この場合は1）
   - 第2引数: 詳細度（省略されているため、デフォルトの0）

2. **マテリアルの色**:
   ```js
   // usecase-005
   const material = new THREE.MeshPhongMaterial({ color: 0xff00ff });
   
   // usecase-006
   const material = new THREE.MeshPhongMaterial({ color: 0x00ff88 });
   ```
   
   マゼンタ色（`0xff00ff`）からライトグリーン色（`0x00ff88`）に変更されています。

### 2-3. `updateObjects(objects, time, deltaTime)`

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].rotation.x += deltaTime * 2;
  objects[0].rotation.y += deltaTime * 2;
}
```

ここでの主な特徴は以下の点です：

1. **複数軸での回転**:
   ```js
   objects[0].rotation.x += deltaTime * 2;
   objects[0].rotation.y += deltaTime * 2;
   ```
   
   X軸とY軸の両方で回転させています。これにより、より複雑で立体的な回転が実現されます。

2. **高速回転**:
   `deltaTime * 2` としているため、標準速度の2倍で回転します。これは前章までの回転速度よりも速く、より活発な動きを表現しています。

この実装により、四面体が複数の軸で高速に回転するアニメーションが実現されています。

### 2-4. `getThumbnailBlob()`

```js
static getThumbnailBlob() {
  // Create a simple SVG representation of a green tetrahedron
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#111111"/>
      
      <!-- Tetrahedron representation (simplified) -->
      <polygon points="100,60 140,140 60,140" fill="#00ff88" stroke="#ffffff" stroke-width="1"/>
      <polygon points="100,60 60,140 100,110" fill="#00cc66" stroke="#ffffff" stroke-width="1"/>
      <polygon points="100,60 100,110 140,140" fill="#00aa44" stroke="#ffffff" stroke-width="1"/>
      
      <!-- Highlight -->
      <polygon points="100,60 110,80 90,80" fill="#ffffff" opacity="0.3"/>
    </svg>
  `;

  // Unicode-safe encoding
  const encodedSvg = unescape(encodeURIComponent(svgString));
  const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

  // Convert to Blob
  return fetch(dataURL).then((res) => res.blob());
}
```

サムネイル生成用のSVGが、四面体を表現するように変更されています。3つの多角形を組み合わせて四面体を表現し、異なる色合いで立体感を出しています。

---

## 3. 前章との比較

`usecase-006` は前章までと基本的な構造は同じですが、以下の点が異なります：

1. **ジオメトリ**: ConeGeometry から TetrahedronGeometry に変更
2. **色**: マゼンタ色からライトグリーン色に変更
3. **アニメーション**: 位置変化から複数軸での高速回転に変更
4. **サムネイル**: コーンから四面体を表現するSVGに変更

特に重要なのは、**複数軸での高速回転**が導入された点です。これにより、より複雑で立体的な動きを表現することができます。

---

## 4. TetrahedronGeometryの詳細

`THREE.TetrahedronGeometry` は、正四面体を作成するためのジオメトリです。内部的には、球体を4つの頂点で近似した形状として実装されています。

```js
// TetrahedronGeometryの基本的な使い方
const geometry = new THREE.TetrahedronGeometry(radius, detail);
```

- **radius**: 四面体を内包する球の半径（デフォルト: 1）
- **detail**: 細分化レベル（デフォルト: 0）
  - 0: 基本的な四面体（4面）
  - 1以上: 各面をさらに細分化し、より球体に近づく

`usecase-006` では以下のパラメータを使用しています：

```js
const geometry = new THREE.TetrahedronGeometry(1);
```

- 半径: 1
- 詳細度: 省略（デフォルトの0）

これにより、半径1の球に内接する基本的な四面体が作成されます。

### 4-1. TetrahedronGeometryのバリエーション

```js
// 基本的な四面体
const tetra1 = new THREE.TetrahedronGeometry(1, 0);

// より大きな四面体
const tetra2 = new THREE.TetrahedronGeometry(2, 0);

// 細分化された四面体（より球体に近い）
const tetra3 = new THREE.TetrahedronGeometry(1, 1);

// さらに細分化された四面体
const tetra4 = new THREE.TetrahedronGeometry(1, 2);
```

詳細度を上げると、以下のような変化が起こります：

- **detail = 0**: 4つの三角形の面を持つ基本的な四面体
- **detail = 1**: 各面が4つの三角形に分割され、合計16面の多面体に
- **detail = 2**: さらに細分化され、より球体に近い形状に

詳細度を上げるほど滑らかな見た目になりますが、その分処理負荷も高くなります。用途に応じて適切な詳細度を選ぶことが重要です。

---

## 5. 複数軸での回転

`usecase-006` の重要な特徴の一つは、複数の軸で同時に回転させている点です。

```js
objects[0].rotation.x += deltaTime * 2;
objects[0].rotation.y += deltaTime * 2;
```

### 5-1. 単一軸回転と複数軸回転の違い

単一軸での回転と複数軸での回転では、見た目の印象が大きく異なります：

1. **単一軸回転**:
   ```js
   // X軸のみの回転
   objects[0].rotation.x += deltaTime;
   
   // または Y軸のみの回転
   objects[0].rotation.y += deltaTime;
   ```
   
   単一軸での回転は、予測可能で規則的な動きになります。例えば、Y軸のみの回転は、オブジェクトが水平面内で回転するように見えます。

2. **複数軸回転**:
   ```js
   // X軸とY軸の両方で回転
   objects[0].rotation.x += deltaTime;
   objects[0].rotation.y += deltaTime;
   ```
   
   複数軸での回転は、より複雑で予測しにくい動きになります。オブジェクトが様々な方向に傾きながら回転するように見え、より立体的な印象を与えます。

### 5-2. 回転速度の調整

回転速度を調整することで、動きの印象を変えることができます：

```js
// 標準速度
objects[0].rotation.x += deltaTime;
objects[0].rotation.y += deltaTime;

// 高速回転（usecase-006の実装）
objects[0].rotation.x += deltaTime * 2;
objects[0].rotation.y += deltaTime * 2;

// 異なる軸で異なる速度
objects[0].rotation.x += deltaTime * 0.5; // ゆっくり
objects[0].rotation.y += deltaTime * 2;   // 速く
```

異なる軸で異なる速度を設定すると、より複雑で不規則な動きになります。これは、オブジェクトに生命感や有機的な動きを与えたい場合に効果的です。

### 5-3. 回転の組み合わせ方

回転の組み合わせ方によって、様々な動きのパターンを作ることができます：

1. **同期回転**: 同じ速度で複数の軸を回転
   ```js
   objects[0].rotation.x += deltaTime;
   objects[0].rotation.y += deltaTime;
   ```

2. **非同期回転**: 異なる速度で複数の軸を回転
   ```js
   objects[0].rotation.x += deltaTime * 0.7;
   objects[0].rotation.y += deltaTime * 1.3;
   ```

3. **周期的な速度変化**: 時間に応じて回転速度を変化
   ```js
   const speedX = 1 + Math.sin(time) * 0.5; // 0.5～1.5の間で変動
   const speedY = 1 + Math.cos(time) * 0.5; // 0.5～1.5の間で変動
   objects[0].rotation.x += deltaTime * speedX;
   objects[0].rotation.y += deltaTime * speedY;
   ```

4. **3軸すべての回転**: X, Y, Z軸すべてで回転
   ```js
   objects[0].rotation.x += deltaTime * 0.7;
   objects[0].rotation.y += deltaTime * 1.0;
   objects[0].rotation.z += deltaTime * 1.3;
   ```

これらの組み合わせを工夫することで、様々な動きのパターンを表現することができます。

---

## 6. 応用例：TetrahedronGeometryと回転の拡張

`usecase-006` のコードをベースに、以下のような拡張が考えられます：

### 6-1. 四面体のパラメータを変更する

```js
// より大きな四面体
const geometry = new THREE.TetrahedronGeometry(1.5, 0);

// 細分化された四面体
const geometry = new THREE.TetrahedronGeometry(1, 1);
```

### 6-2. 回転パターンを変更する

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  // 3軸すべてで回転
  objects[0].rotation.x += deltaTime * 1.5;
  objects[0].rotation.y += deltaTime * 2.0;
  objects[0].rotation.z += deltaTime * 0.5;
  
  // または、時間に応じて回転速度を変化
  const speedFactor = 1 + Math.sin(time) * 0.5;
  objects[0].rotation.x += deltaTime * 2 * speedFactor;
  objects[0].rotation.y += deltaTime * 2 * speedFactor;
}
```

### 6-3. マテリアルを変更する

```js
// ワイヤーフレーム表示
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff88,
  wireframe: true
});

// または、物理ベースのマテリアル
const material = new THREE.MeshStandardMaterial({
  color: 0x00ff88,
  metalness: 0.5,
  roughness: 0.2
});
```

### 6-4. 複数の四面体を配置する

```js
static setupScene(scene) {
  // 複数の四面体を作成
  const objects = [];
  const geometries = [];
  
  for (let i = 0; i < 5; i++) {
    const geometry = new THREE.TetrahedronGeometry(0.5, 0);
    geometries.push(geometry);
    
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff88 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = i * 2 - 4;
    scene.add(mesh);
    objects.push(mesh);
  }
  
  return { objects, geometries };
}

static updateObjects(objects, time, deltaTime = 0.016) {
  // 各四面体に異なる回転を適用
  objects.forEach((obj, i) => {
    const factor = 1 + i * 0.2;
    obj.rotation.x += deltaTime * 2 * factor;
    obj.rotation.y += deltaTime * 2 / factor;
  });
}
```

---

## 7. 正多面体の系列

四面体は、正多面体（プラトンの立体）と呼ばれる特別な多面体の一つです。正多面体は、すべての面が合同な正多角形で、すべての頂点で同じ数の面が交わる多面体です。

Three.jsでは、以下の正多面体がジオメトリとして実装されています：

1. **TetrahedronGeometry**: 四面体（4面、4頂点）
2. **OctahedronGeometry**: 八面体（8面、6頂点）
3. **DodecahedronGeometry**: 十二面体（12面、20頂点）
4. **IcosahedronGeometry**: 二十面体（20面、12頂点）

これらに加えて、立方体（BoxGeometry、6面、8頂点）も正多面体の一つです。

これらの正多面体は、それぞれ異なる対称性と特徴を持っています。例えば：

- **四面体**: 最も単純な正多面体で、4つの正三角形の面を持ちます。
- **八面体**: 8つの正三角形の面を持ち、対称性が高い形状です。
- **十二面体**: 12の正五角形の面を持ち、より球体に近い形状です。
- **二十面体**: 20の正三角形の面を持ち、球体の近似としてよく使われます。

これらの正多面体を使い分けることで、様々な形状を表現することができます。また、詳細度パラメータを調整することで、より複雑な形状を作ることもできます。

---

## 8. まとめ

「**Usecase-006: Spinning Tetrahedron**」では、Three.jsの `TetrahedronGeometry` を使って、複数の軸で高速に回転する四面体を実装しました。

主なポイントは以下の通りです：

1. **TetrahedronGeometryの使用**: 四面体を作成し、最も単純な正多面体の表現方法を学びました。
2. **複数軸での回転**: X軸とY軸の両方で回転させることで、より複雑で立体的な動きを表現しました。
3. **高速回転**: 回転速度を2倍に設定することで、より活発な動きを表現しました。
4. **サムネイル生成**: 四面体を表現するSVGを作成し、ギャラリー表示に対応しました。

このサンプルは、Three.jsでの様々なジオメトリと回転アニメーションを組み合わせる方法を示す良い例となっています。特に、複数軸での回転によって、より複雑で立体的な動きを作り出せることを学びました。

---

## 9. 次のステップ

`usecase-006` を理解したら、次のステップとして以下のような発展が考えられます：

1. **他の正多面体を試す**: 八面体、十二面体、二十面体など、他の正多面体を使って同様のアニメーションを実装する。
2. **回転軸の動的な変更**: 時間経過とともに回転軸自体を変化させ、より複雑な動きを実現する。
3. **ユーザーインタラクション**: マウスやキーボードの入力に応じて、回転速度や方向を変更できるようにする。
4. **複数のオブジェクトの組み合わせ**: 異なる形状や色のオブジェクトを組み合わせて、より複雑なシーンを作成する。

これらの発展は、今後のユースケースで順次紹介していく予定です。`usecase-006` で学んだジオメトリと回転アニメーションの基本を応用することで、より高度な3D表現へと進んでいきましょう。
