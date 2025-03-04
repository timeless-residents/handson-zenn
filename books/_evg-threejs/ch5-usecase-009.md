---
title: Usecase-009 Twisting Torus Knot
free: true
---
# Usecase-009: Twisting Torus Knot

**本章では、`usecases/usecase-009` ディレクトリに格納されている「Twisting Torus Knot」のコードを解説します。**  
このサンプルは、オレンジ色のトーラスノット（結び目のついたドーナツ形状）が複雑に回転するシーンです。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、より複雑な形状である `TorusKnotGeometry` と、3軸すべてでの回転を組み合わせた例となっています。

---

## 1. TorusKnotとは？

TorusKnot（トーラスノット）は、数学的には「結び目理論」に基づく形状で、トーラス（ドーナツ形状）の表面上に描かれた閉じた曲線が結び目を形成しています。Three.jsでは `THREE.TorusKnotGeometry` クラスとして実装されており、以下のような特徴があります：

- トーラス（ドーナツ形状）の表面上に結び目を形成
- 2つのパラメータ（p, q）で結び目のパターンを定義
- 管の半径と結び目の太さを個別に指定可能
- 円周方向と管の断面方向の分割数を指定可能

`usecase-009` では、このトーラスノットを使って、3軸すべてで回転するアニメーションを実装しています。これは前章までの回転アニメーションに、より複雑な形状と回転パターンを組み合わせたものです。

---

## 2. `usecase-009/index.js` コード詳細

それでは、実際の `usecase-009` のコードを詳しく見ていきましょう。

```js
// usecase-009/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase009 extends UseCaseBase {
  static metadata = {
    id: "009",
    title: "Twisting Torus Knot",
    description: "A torus knot with complex rotation",
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

    const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
    const material = new THREE.MeshPhongMaterial({ color: 0xff8800 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return { objects: [mesh], geometries: [geometry] };
  }

  static updateObjects(objects, time, deltaTime = 0.016) {
    objects[0].rotation.x += deltaTime;
    objects[0].rotation.y += deltaTime * 0.5;
    objects[0].rotation.z += deltaTime * 0.3;
  }

  async init() {
    const { objects } = GeometryShowcase009.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase009.updateObjects(
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
  id: "009",
  title: "Twisting Torus Knot",
  description: "A torus knot with complex rotation",
  categories: ["Geometry", "Animation"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `009`、 `title` は「Twisting Torus Knot」など。
- `description` には、トーラスノットが複雑に回転することについて言及されています。

### 2-2. `setupScene(scene)`

```js
static setupScene(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(ambientLight, directionalLight);

  const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
  const material = new THREE.MeshPhongMaterial({ color: 0xff8800 });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return { objects: [mesh], geometries: [geometry] };
}
```

前章の `usecase-008` との主な違いは以下の点です：

1. **ジオメトリの変更**:
   ```js
   // usecase-008
   const geometry = new THREE.DodecahedronGeometry(1);
   
   // usecase-009
   const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
   ```
   
   `THREE.TorusKnotGeometry` は、トーラスノットを作成するためのジオメトリです。引数は以下の通りです：
   - 第1引数: 全体の半径（この場合は1）
   - 第2引数: 管の半径（この場合は0.4）
   - 第3引数: 管の中心線に沿った分割数（この場合は100）
   - 第4引数: 管の断面の分割数（この場合は16）
   - 第5引数: p（省略されているため、デフォルトの2）
   - 第6引数: q（省略されているため、デフォルトの3）

2. **マテリアルの色**:
   ```js
   // usecase-008
   const material = new THREE.MeshPhongMaterial({ color: 0x8800ff });
   
   // usecase-009
   const material = new THREE.MeshPhongMaterial({ color: 0xff8800 });
   ```
   
   紫色（`0x8800ff`）からオレンジ色（`0xff8800`）に変更されています。

### 2-3. `updateObjects(objects, time, deltaTime)`

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].rotation.x += deltaTime;
  objects[0].rotation.y += deltaTime * 0.5;
  objects[0].rotation.z += deltaTime * 0.3;
}
```

ここでの主な特徴は以下の点です：

1. **3軸すべてでの回転**:
   ```js
   objects[0].rotation.x += deltaTime;
   objects[0].rotation.y += deltaTime * 0.5;
   objects[0].rotation.z += deltaTime * 0.3;
   ```
   
   X軸、Y軸、Z軸すべてで回転を行っています。これにより、より複雑で予測しにくい回転パターンが生まれます。

2. **異なる回転速度**:
   - X軸: 標準速度（`deltaTime`）
   - Y軸: 半分の速度（`deltaTime * 0.5`）
   - Z軸: 0.3倍の速度（`deltaTime * 0.3`）
   
   各軸で異なる回転速度を設定することで、回転パターンがより複雑になり、周期的な繰り返しが認識しにくくなります。

この実装により、トーラスノットが3軸すべてで異なる速度で回転するアニメーションが実現されています。複雑な形状と複雑な回転パターンの組み合わせにより、非常に動的で興味深い視覚効果が生まれます。

### 2-4. `getThumbnailBlob()`

```js
static getThumbnailBlob() {
  // Create a simple SVG representation of an orange torus knot
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#111111"/>
      
      <!-- Torus knot representation -->
      <path d="M60,100 C60,60 100,60 100,100 S140,140 140,100 S100,60 100,100 S60,140 60,100 Z" 
            fill="none" stroke="#ff8800" stroke-width="12" stroke-linecap="round"/>
      
      <path d="M60,100 C60,60 100,60 100,100 S140,140 140,100 S100,60 100,100 S60,140 60,100 Z" 
            fill="none" stroke="#ffaa00" stroke-width="6" stroke-linecap="round"/>
      
      <!-- Highlight -->
      <path d="M80,80 C90,70 100,70 110,80" 
            fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
    </svg>
  `;

  // Unicode-safe encoding
  const encodedSvg = unescape(encodeURIComponent(svgString));
  const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

  // Convert to Blob
  return fetch(dataURL).then((res) => res.blob());
}
```

サムネイル生成用のSVGが、トーラスノットを表現するように変更されています。実際のトーラスノットは非常に複雑な形状ですが、サムネイルではベジェ曲線を使って簡略化して表現しています。また、異なる太さと色合いのストロークを重ねることで立体感を出しています。

---

## 3. 前章との比較

`usecase-009` は前章までと基本的な構造は同じですが、以下の点が異なります：

1. **ジオメトリ**: DodecahedronGeometry から TorusKnotGeometry に変更
2. **色**: 紫色からオレンジ色に変更
3. **アニメーション**: Z軸とY軸の組み合わせ回転から、3軸すべてでの回転に変更
4. **サムネイル**: 十二面体からトーラスノットを表現するSVGに変更

特に重要なのは、**より複雑な形状（トーラスノット）と3軸すべてでの回転の組み合わせ**が導入された点です。これにより、より複雑で予測しにくい動きが実現され、視覚的な興味を引く効果が高まっています。

---

## 4. TorusKnotGeometryの詳細

`THREE.TorusKnotGeometry` は、トーラスノット（結び目のついたドーナツ形状）を作成するためのジオメトリです。数学的には、トーラス（ドーナツ形状）の表面上に描かれた閉じた曲線が結び目を形成しています。

```js
// TorusKnotGeometryの基本的な使い方
const geometry = new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q);
```

- **radius**: トーラスノットの中心から管の中心までの距離（全体の半径）
- **tube**: 管自体の半径（管の太さ）
- **tubularSegments**: 管の中心線に沿った分割数
- **radialSegments**: 管の断面の分割数
- **p**: 結び目のパターンを定義するパラメータ（デフォルト: 2）
- **q**: 結び目のパターンを定義するパラメータ（デフォルト: 3）

`usecase-009` では以下のパラメータを使用しています：

```js
const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
```

- 全体の半径: 1
- 管の半径: 0.4
- 管の中心線に沿った分割数: 100（滑らかさ）
- 管の断面の分割数: 16（滑らかさ）
- p: 省略（デフォルトの2）
- q: 省略（デフォルトの3）

これにより、(2,3)-トーラスノットと呼ばれる形状が作成されます。

### 4-1. pとqパラメータの意味

トーラスノットの形状は、主に `p` と `q` の2つのパラメータによって決定されます：

- **p**: トーラスの周りを何回巻くか
- **q**: トーラスの穴を何回通るか

`p` と `q` が互いに素（最大公約数が1）である場合、結び目は閉じた1つの曲線になります。そうでない場合、複数の独立した曲線（リンク）になります。

### 4-2. TorusKnotGeometryのバリエーション

```js
// 基本的な(2,3)-トーラスノット
const knot1 = new THREE.TorusKnotGeometry(1, 0.4, 100, 16, 2, 3);

// より複雑な(3,4)-トーラスノット
const knot2 = new THREE.TorusKnotGeometry(1, 0.4, 100, 16, 3, 4);

// より単純な(2,1)-トーラスノット
const knot3 = new THREE.TorusKnotGeometry(1, 0.4, 100, 16, 2, 1);

// より太い管
const knot4 = new THREE.TorusKnotGeometry(1, 0.6, 100, 16, 2, 3);

// より滑らかな表面
const knot5 = new THREE.TorusKnotGeometry(1, 0.4, 200, 32, 2, 3);
```

`p` と `q` の値を変更することで、様々な形状のトーラスノットを作成することができます。また、管の太さや分割数を調整することで、見た目の滑らかさや太さを変更することができます。

---

## 5. 3軸回転の特徴

`usecase-009` の重要な特徴の一つは、3軸すべてで回転している点です。

```js
objects[0].rotation.x += deltaTime;
objects[0].rotation.y += deltaTime * 0.5;
objects[0].rotation.z += deltaTime * 0.3;
```

### 5-1. 3軸回転の効果

3軸すべてで回転させることで、以下のような効果が得られます：

1. **複雑な動き**: 1軸や2軸での回転に比べて、はるかに複雑で予測しにくい動きになります。オブジェクトの各点は空間内で複雑な軌道を描きます。

2. **周期性の低下**: 異なる速度で3軸回転させると、同じ姿勢に戻るまでの時間が非常に長くなります。例えば、X軸が1倍速、Y軸が0.5倍速、Z軸が0.3倍速の場合、同じ姿勢に戻るには最小公倍数の時間がかかります。

3. **全方向からの観察**: 3軸回転により、オブジェクトのあらゆる面や角度が見えるようになります。これは特に複雑な形状のオブジェクトを展示する場合に有効です。

### 5-2. 異なる回転速度の効果

各軸で異なる回転速度を設定することで、さらに複雑な動きを実現できます：

```js
objects[0].rotation.x += deltaTime;      // 標準速度
objects[0].rotation.y += deltaTime * 0.5; // 半分の速度
objects[0].rotation.z += deltaTime * 0.3; // 0.3倍の速度
```

この設定では、X軸が最も速く回転し、次にY軸、最後にZ軸という順番になります。これにより、X軸回転が主体となりつつも、Y軸とZ軸の回転が加わることで複雑な動きになります。

異なる速度比を設定することで、様々な動きのパターンを作ることができます：

- **整数比**: 例えば、1:2:3の比率で回転させると、比較的短い周期で同じ姿勢に戻ります。
- **無理数比**: 例えば、1:√2:πの比率で回転させると、ほぼ永久に同じ姿勢に戻りません。
- **近い値**: 例えば、1:0.9:0.8の比率で回転させると、ゆっくりとした変化が生まれます。

---

## 6. 応用例：TorusKnotGeometryと3軸回転の拡張

`usecase-009` のコードをベースに、以下のような拡張が考えられます：

### 6-1. トーラスノットのパラメータを変更する

```js
// より複雑な結び目パターン
const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16, 3, 7);

// より太い管
const geometry = new THREE.TorusKnotGeometry(1, 0.6, 100, 16, 2, 3);

// より滑らかな表面
const geometry = new THREE.TorusKnotGeometry(1, 0.4, 200, 32, 2, 3);
```

### 6-2. 回転パターンを変更する

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  // 時間に応じて回転速度を変化させる
  const speedX = 1 + Math.sin(time) * 0.5;
  const speedY = 0.5 + Math.cos(time) * 0.3;
  const speedZ = 0.3 + Math.sin(time * 2) * 0.2;
  
  objects[0].rotation.x += deltaTime * speedX;
  objects[0].rotation.y += deltaTime * speedY;
  objects[0].rotation.z += deltaTime * speedZ;
}
```

### 6-3. マテリアルを変更する

```js
// ワイヤーフレーム表示
const material = new THREE.MeshBasicMaterial({
  color: 0xff8800,
  wireframe: true
});

// または、物理ベースのマテリアル
const material = new THREE.MeshStandardMaterial({
  color: 0xff8800,
  metalness: 0.7,
  roughness: 0.2
});

// または、色が変化するマテリアル
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].rotation.x += deltaTime;
  objects[0].rotation.y += deltaTime * 0.5;
  objects[0].rotation.z += deltaTime * 0.3;
  
  // 色相を時間とともに変化
  objects[0].material.color.setHSL(time % 1, 0.7, 0.5);
}
```

### 6-4. 複数のトーラスノットを配置する

```js
static setupScene(scene) {
  // 複数のトーラスノットを作成
  const objects = [];
  const geometries = [];
  
  for (let i = 0; i < 3; i++) {
    // 異なるp, qパラメータを持つトーラスノット
    const p = i + 2;
    const q = i + 3;
    const geometry = new THREE.TorusKnotGeometry(0.7, 0.3, 100, 16, p, q);
    geometries.push(geometry);
    
    const material = new THREE.MeshPhongMaterial({ color: 0xff8800 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = i * 2 - 2;
    scene.add(mesh);
    objects.push(mesh);
  }
  
  return { objects, geometries };
}

static updateObjects(objects, time, deltaTime = 0.016) {
  // 各トーラスノットに異なる回転を適用
  objects.forEach((obj, i) => {
    const factor = 1 + i * 0.2;
    obj.rotation.x += deltaTime * factor;
    obj.rotation.y += deltaTime * 0.5 / factor;
    obj.rotation.z += deltaTime * 0.3 * factor;
  });
}
```

---

## 7. 数学的な結び目理論とトーラスノット

トーラスノットは、数学的には「結び目理論」という分野で研究されています。結び目理論は、3次元空間内の閉じた曲線（結び目）の性質を研究する数学の一分野です。

### 7-1. (p,q)-トーラスノット

(p,q)-トーラスノットは、トーラス（ドーナツ形状）の表面上に描かれた閉じた曲線で、トーラスの周りを p 回巻き、トーラスの穴を q 回通ります。p と q が互いに素（最大公約数が1）である場合、結び目は閉じた1つの曲線になります。

例えば：
- (2,3)-トーラスノット: 「三つ葉結び目」と呼ばれる最も単純な非自明な結び目
- (3,4)-トーラスノット: より複雑な結び目
- (2,1)-トーラスノット: 「自明な結び目」（ほどける結び目）

### 7-2. 結び目の複雑さと視覚的効果

結び目の複雑さは、主に p と q の値によって決まります。一般に、p と q の値が大きいほど、結び目は複雑になります。複雑な結び目は、視覚的により興味深い形状になりますが、その分、形状を理解するのが難しくなります。

3軸回転と組み合わせることで、複雑な結び目の形状をあらゆる角度から観察することができ、その複雑さをより深く理解することができます。

---

## 8. まとめ

「**Usecase-009: Twisting Torus Knot**」では、Three.jsの `TorusKnotGeometry` を使って、3軸すべてで回転するトーラスノットを実装しました。

主なポイントは以下の通りです：

1. **TorusKnotGeometryの使用**: トーラスノットを作成し、結び目理論に基づく複雑な形状の表現方法を学びました。
2. **3軸回転の使用**: X軸、Y軸、Z軸すべてで異なる速度の回転を適用し、より複雑で予測しにくい動きを実現しました。
3. **複雑な形状と動きの組み合わせ**: 複雑な形状（トーラスノット）と複雑な動き（3軸回転）を組み合わせることで、より興味深い視覚効果を生み出しました。
4. **サムネイル生成**: トーラスノットを表現するSVGを作成し、ギャラリー表示に対応しました。

このサンプルは、Three.jsでの複雑な形状と複雑な回転パターンの組み合わせ方を示す良い例となっています。特に、3軸すべてで異なる速度の回転を適用することで、より動的で予測しにくい動きを実現できることを学びました。

---

## 9. 次のステップ

`usecase-009` を理解したら、次のステップとして以下のような発展が考えられます：

1. **異なるp, qパラメータの探索**: 様々なp, qパラメータを試して、異なる形状のトーラスノットを作成し、その視覚的効果を比較する。
2. **動的なパラメータ変更**: 時間経過とともにp, qパラメータを変化させ、形状自体が変化するアニメーションを実現する。
3. **マテリアルの工夫**: ワイヤーフレーム表示や色の変化を組み合わせて、トーラスノットの構造をより分かりやすく表現する。
4. **ユーザーインタラクション**: マウスやキーボードの入力に応じて、回転軸や回転速度、p, qパラメータを変更できるようにする。

これらの発展は、今後のユースケースで順次紹介していく予定です。`usecase-009` で学んだトーラスノットと3軸回転の基本を応用することで、より高度な3D表現へと進んでいきましょう。
