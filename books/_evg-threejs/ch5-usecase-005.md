---
title: Usecase-005 Bouncing Cone
---
# Usecase-005: Bouncing Cone

**本章では、`usecases/usecase-005` ディレクトリに格納されている「Bouncing Cone」のコードを解説します。**  
このサンプルは、マゼンタ色のコーン（円錐）が上下に弾むアニメーションを実装しています。前章までの様々なジオメトリとアニメーション技術を組み合わせた例となっており、特に `ConeGeometry` の使い方と位置アニメーションの応用を学ぶことができます。

---

## 1. Coneとは？

Cone（円錐）は、円形の底面と頂点を持つ3D形状です。Three.jsでは `THREE.ConeGeometry` クラスとして実装されていますが、実際には `THREE.CylinderGeometry` の特殊なケース（上面の半径が0）として扱われています。円錐は以下のような特徴があります：

- 円形の底面と一点の頂点
- 側面は円錐面
- 底面の半径と高さを指定可能
- 円周方向の分割数を指定可能

`usecase-005` では、このコーンを使って、上下に弾むアニメーションを実装しています。これは `usecase-002` のトーラスの弾みと似ていますが、異なるジオメトリと動きのパターンを使用しています。

---

## 2. `usecase-005/index.js` コード詳細

それでは、実際の `usecase-005` のコードを詳しく見ていきましょう。

```js
// usecase-005/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase005 extends UseCaseBase {
  static metadata = {
    id: "005",
    title: "Bouncing Cone",
    description: "A cone that bounces up and down",
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

    const geometry = new THREE.ConeGeometry(1, 2, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0xff00ff });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return { objects: [mesh], geometries: [geometry] };
  }

  static updateObjects(objects, time, deltaTime = 0.016) {
    objects[0].position.y = Math.cos(time) * 0.5;
    objects[0].rotation.x += deltaTime * 0.5;
  }

  async init() {
    const { objects } = GeometryShowcase005.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase005.updateObjects(
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
  id: "005",
  title: "Bouncing Cone",
  description: "A cone that bounces up and down",
  categories: ["Geometry", "Animation"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `005`、 `title` は「Bouncing Cone」など。
- `description` には、コーンが上下に弾む動きについて言及されています。

### 2-2. `setupScene(scene)`

```js
static setupScene(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(ambientLight, directionalLight);

  const geometry = new THREE.ConeGeometry(1, 2, 32);
  const material = new THREE.MeshPhongMaterial({ color: 0xff00ff });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return { objects: [mesh], geometries: [geometry] };
}
```

前章の `usecase-004` との主な違いは以下の点です：

1. **ジオメトリの変更**:
   ```js
   // usecase-004
   const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
   
   // usecase-005
   const geometry = new THREE.ConeGeometry(1, 2, 32);
   ```
   
   `THREE.ConeGeometry` は、実際には `THREE.CylinderGeometry` の特殊なケースで、上面の半径が0に設定されています。引数は以下の通りです：
   - 第1引数: 底面の半径（この場合は1）
   - 第2引数: 高さ（この場合は2）
   - 第3引数: 円周方向の分割数（この場合は32）

2. **マテリアルの色**:
   ```js
   // usecase-004
   const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff });
   
   // usecase-005
   const material = new THREE.MeshPhongMaterial({ color: 0xff00ff });
   ```
   
   水色（`0x00ffff`）からマゼンタ色（`0xff00ff`）に変更されています。

3. **グループとマーカーの削除**:
   `usecase-004` で使用していたグループとマーカー、グリッドヘルパーが削除され、シンプルな単一オブジェクトの構成に戻っています。

### 2-3. `updateObjects(objects, time, deltaTime)`

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].position.y = Math.cos(time) * 0.5;
  objects[0].rotation.x += deltaTime * 0.5;
}
```

ここでの主な特徴は以下の点です：

1. **位置の変化（弾むアニメーション）**:
   ```js
   objects[0].position.y = Math.cos(time) * 0.5;
   ```
   
   `Math.cos()` 関数を使って、Y座標を時間の関数として変化させています。これは `usecase-002` の弾みアニメーションと似ていますが、以下の違いがあります：
   - `Math.sin()` の代わりに `Math.cos()` を使用（位相が90度異なる）
   - 結果として、初期位置が最高点になる（`Math.cos(0) = 1`）

2. **回転**:
   ```js
   objects[0].rotation.x += deltaTime * 0.5;
   ```
   
   X軸周りの回転を加えています。回転速度は `deltaTime * 0.5` で、ゆっくりとした回転になっています。

この組み合わせにより、コーンが上下に弾みながら、ゆっくりと回転するアニメーションが実現されています。

### 2-4. `getThumbnailBlob()`

```js
static getThumbnailBlob() {
  // Create a simple SVG representation of a magenta cone
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#111111"/>
      
      <!-- Cone representation -->
      <polygon points="100,60 140,140 60,140" fill="#ff00ff" />
      <ellipse cx="100" cy="140" rx="40" ry="10" fill="#cc00cc" />
      
      <!-- Highlight -->
      <polygon points="100,60 120,100 80,100" fill="#ffffff" opacity="0.3" />
      
      <!-- Shadow -->
      <ellipse cx="100" cy="160" rx="30" ry="5" fill="#000000" opacity="0.3" />
    </svg>
  `;

  // Unicode-safe encoding
  const encodedSvg = unescape(encodeURIComponent(svgString));
  const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

  // Convert to Blob
  return fetch(dataURL).then((res) => res.blob());
}
```

サムネイル生成用のSVGが、コーンを表現するように変更されています。三角形と楕円を組み合わせて円錐を表現し、ハイライトと影を追加して立体感を出しています。

---

## 3. 前章との比較

`usecase-005` は前章までと基本的な構造は同じですが、以下の点が異なります：

1. **ジオメトリ**: CylinderGeometry から ConeGeometry に変更
2. **色**: 水色からマゼンタ色に変更
3. **アニメーション関数**: `Math.sin()` から `Math.cos()` に変更
4. **構成**: グループとマーカー、グリッドヘルパーを削除し、シンプルな構成に戻す
5. **サムネイル**: シリンダーからコーンを表現するSVGに変更

特に重要なのは、**異なる周期関数（`Math.cos()`）を使った位置アニメーション**が導入された点です。これにより、初期位置や動きのパターンを変えることができることを示しています。

---

## 4. ConeGeometryの詳細

`THREE.ConeGeometry` は、実際には `THREE.CylinderGeometry` の特殊なケースとして実装されています。内部的には、上面の半径を0に設定した円柱として扱われます。

```js
// ConeGeometryの定義（Three.jsのソースコードから抜粋）
class ConeGeometry extends CylinderGeometry {
  constructor(
    radius = 1,
    height = 1,
    radialSegments = 8,
    heightSegments = 1,
    openEnded = false,
    thetaStart = 0,
    thetaLength = Math.PI * 2
  ) {
    super(
      0,                // radiusTop = 0 (円錐の頂点)
      radius,           // radiusBottom (円錐の底面半径)
      height,           // height (円錐の高さ)
      radialSegments,   // radialSegments (円周方向の分割数)
      heightSegments,   // heightSegments (高さ方向の分割数)
      openEnded,        // openEnded (底面を開くかどうか)
      thetaStart,       // thetaStart (円周の開始角度)
      thetaLength       // thetaLength (円周の角度の大きさ)
    );

    this.type = 'ConeGeometry';
  }
}
```

`usecase-005` では以下のパラメータを使用しています：

```js
const geometry = new THREE.ConeGeometry(1, 2, 32);
```

- 底面の半径: 1
- 高さ: 2
- 円周方向の分割数: 32（円周の滑らかさ）

これにより、底面の直径が2、高さが2の円錐が作成されます。

### 4-1. ConeGeometryのバリエーション

```js
// 基本的な円錐
const cone1 = new THREE.ConeGeometry(1, 2, 32);

// より尖った円錐
const cone2 = new THREE.ConeGeometry(1, 4, 32);

// より平たい円錐
const cone3 = new THREE.ConeGeometry(2, 1, 32);

// 底面が開いた円錐（底面が表示されない）
const cone4 = new THREE.ConeGeometry(1, 2, 32, 1, true);

// 部分的な円錐（180度分のみ）
const cone5 = new THREE.ConeGeometry(1, 2, 32, 1, false, 0, Math.PI);
```

これらのバリエーションを使うことで、様々な形状の円錐を作成することができます。

---

## 5. 周期関数の使い分け

`usecase-005` では、`Math.cos()` 関数を使って位置アニメーションを実装しています。これは `usecase-002` で使用した `Math.sin()` とは異なる動きを生み出します。

### 5-1. Math.sin() と Math.cos() の違い

```js
// Math.sin() を使った位置アニメーション（usecase-002）
objects[0].position.y = Math.sin(time * 2) * 0.5;

// Math.cos() を使った位置アニメーション（usecase-005）
objects[0].position.y = Math.cos(time) * 0.5;
```

これらの関数の主な違いは以下の通りです：

- **位相**: `Math.cos()` は `Math.sin()` に対して位相が90度（π/2ラジアン）進んでいます。
- **初期値**: `Math.sin(0) = 0` に対して、`Math.cos(0) = 1` です。
- **動きのパターン**: `Math.sin()` は0から始まり、上昇→下降→上昇と動きますが、`Math.cos()` は最高点から始まり、下降→上昇→下降と動きます。

### 5-2. 周期関数の組み合わせ

周期関数を組み合わせることで、より複雑な動きを作ることができます：

```js
// 複数の周期の組み合わせ
const y = Math.sin(time) * 0.3 + Math.cos(time * 2) * 0.2;

// 減衰する振動
const y = Math.exp(-time * 0.5) * Math.sin(time * 3);

// バウンド効果（床で跳ね返る）
const y = Math.abs(Math.sin(time));

// ノコギリ波（急上昇、緩やかな下降）
const y = ((time % 1) * 2) - 1;
```

これらの関数を使い分けることで、様々な動きのパターンを表現することができます。

---

## 6. 応用例：ConeGeometryとアニメーションの拡張

`usecase-005` のコードをベースに、以下のような拡張が考えられます：

### 6-1. コーンのパラメータを変更する

```js
// より尖ったコーン
const geometry = new THREE.ConeGeometry(0.5, 3, 32);

// 多角形の底面を持つコーン
const geometry = new THREE.ConeGeometry(1, 2, 6); // 6角形の底面
```

### 6-2. 複数のコーンを配置する

```js
static setupScene(scene) {
  // 複数のコーンを作成
  const objects = [];
  const geometries = [];
  
  for (let i = 0; i < 5; i++) {
    const geometry = new THREE.ConeGeometry(0.5, 1, 32);
    geometries.push(geometry);
    
    const material = new THREE.MeshPhongMaterial({ color: 0xff00ff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = i * 2 - 4;
    scene.add(mesh);
    objects.push(mesh);
  }
  
  return { objects, geometries };
}

static updateObjects(objects, time, deltaTime = 0.016) {
  // 各コーンに異なる位相のアニメーションを適用
  objects.forEach((obj, i) => {
    obj.position.y = Math.cos(time + i * 0.5) * 0.5;
    obj.rotation.x += deltaTime * 0.5;
  });
}
```

### 6-3. 複雑な動きのパターン

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  // 上下の弾みに加えて、円軌道上の動きを追加
  objects[0].position.y = Math.cos(time) * 0.5;
  objects[0].position.x = Math.sin(time * 0.5) * 1.0;
  objects[0].position.z = Math.cos(time * 0.5) * 1.0;
  
  // 回転も複数の軸で
  objects[0].rotation.x += deltaTime * 0.5;
  objects[0].rotation.y += deltaTime * 0.3;
}
```

### 6-4. マテリアルの変更

```js
// 物理ベースのマテリアルを使用
const material = new THREE.MeshStandardMaterial({
  color: 0xff00ff,
  metalness: 0.5,
  roughness: 0.2,
  emissive: 0x330033,
  emissiveIntensity: 0.2
});

// または、ワイヤーフレーム表示
const material = new THREE.MeshBasicMaterial({
  color: 0xff00ff,
  wireframe: true
});
```

---

## 7. 位置と回転の組み合わせ

`usecase-005` では、位置の変化（弾み）と回転を組み合わせています。これらを組み合わせることで、より豊かな動きを表現することができます。

### 7-1. 位置と回転の関係

位置と回転を組み合わせる際には、以下のような関係性を考慮すると、より自然な動きになります：

1. **独立した動き**: 位置と回転が互いに影響しない（`usecase-005` の実装）
   ```js
   objects[0].position.y = Math.cos(time) * 0.5;
   objects[0].rotation.x += deltaTime * 0.5;
   ```

2. **連動した動き**: 位置に応じて回転が変化する
   ```js
   const posY = Math.cos(time) * 0.5;
   objects[0].position.y = posY;
   // 位置が高いほど速く回転
   objects[0].rotation.x += deltaTime * (0.5 + Math.abs(posY) * 0.5);
   ```

3. **物理的な動き**: 重力や慣性を模倣した動き
   ```js
   // 重力加速度を模倣
   this.velocity = this.velocity || 0;
   this.velocity -= deltaTime * 9.8; // 重力加速度
   objects[0].position.y += this.velocity * deltaTime;
   
   // 床との衝突判定
   if (objects[0].position.y < -2) {
     objects[0].position.y = -2;
     this.velocity = -this.velocity * 0.8; // 反発係数
   }
   
   // 回転も速度に応じて変化
   objects[0].rotation.x += this.velocity * deltaTime * 0.1;
   ```

### 7-2. 回転軸の選択

回転軸の選択によっても、見た目の印象が大きく変わります：

```js
// X軸回転（前後に転がる）
objects[0].rotation.x += deltaTime * 0.5;

// Y軸回転（その場で回転）
objects[0].rotation.y += deltaTime * 0.5;

// Z軸回転（左右に転がる）
objects[0].rotation.z += deltaTime * 0.5;

// 複数の軸での回転（複雑な動き）
objects[0].rotation.x += deltaTime * 0.3;
objects[0].rotation.y += deltaTime * 0.5;
objects[0].rotation.z += deltaTime * 0.1;
```

特に円錐のような非対称な形状では、回転軸によって見た目の変化が大きくなります。

---

## 8. まとめ

「**Usecase-005: Bouncing Cone**」では、Three.jsの `ConeGeometry` を使って、上下に弾むコーンを実装しました。また、`Math.cos()` 関数を使って、前章とは異なる動きのパターンを表現しました。

主なポイントは以下の通りです：

1. **ConeGeometryの使用**: 円錐を作成し、底面の半径と高さを指定することで形状を定義しました。
2. **Math.cos()を使った位置アニメーション**: 余弦関数を使って、初期位置が最高点になる弾みアニメーションを実装しました。
3. **位置と回転の組み合わせ**: 上下の弾みとX軸周りの回転を組み合わせることで、より豊かな動きを表現しました。
4. **サムネイル生成**: コーンを表現するSVGを作成し、ギャラリー表示に対応しました。

このサンプルは、Three.jsでの様々なジオメトリとアニメーション技術を組み合わせる方法を示す良い例となっています。特に、周期関数の使い分けによって、異なる動きのパターンを作り出せることを学びました。

---

## 9. 次のステップ

`usecase-005` を理解したら、次のステップとして以下のような発展が考えられます：

1. **複数のコーンを配置**: 異なるサイズや色のコーンを複数配置し、それぞれに異なるアニメーションを適用する。
2. **物理シミュレーション**: 重力や反発力を模倣した、よりリアルな弾みアニメーションを実装する。
3. **ユーザーインタラクション**: マウスやキーボードの入力に応じて、コーンの動きや色を変化させる。
4. **パーティクルエフェクト**: コーンの動きに合わせて、パーティクルを放出するエフェクトを追加する。

これらの発展は、今後のユースケースで順次紹介していく予定です。`usecase-005` で学んだジオメトリとアニメーションの基本を応用することで、より高度な3D表現へと進んでいきましょう。
