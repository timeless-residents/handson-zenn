---
title: Usecase-004 Rotating Cylinder with Marker
---
# Usecase-004: Rotating Cylinder with Marker

**本章では、`usecases/usecase-004` ディレクトリに格納されている「Rotating Cylinder with Marker」のコードを解説します。**  
このサンプルは、水色のシリンダー（円柱）がY軸を中心に回転し、その回転を視覚的に分かりやすくするために赤いマーカーが付いています。前章までの基本的なアニメーションに加えて、複数のオブジェクトをグループ化して扱う方法や、回転の視覚的な表現方法を学ぶ良い例となっています。

---

## 1. Cylinderとは？

Cylinder（円柱）は、円形の底面を持ち、その底面に垂直な側面で構成される3D形状です。Three.jsでは `THREE.CylinderGeometry` クラスとして実装されており、以下のような特徴があります：

- 上面と下面が円形
- 側面は円筒状
- 上面と下面の半径を別々に指定可能（円錐台も作成可能）
- 円周方向の分割数を指定可能

`usecase-004` では、このシリンダーを使って、Y軸周りの回転アニメーションを実装しています。また、回転を視覚的に分かりやすくするために、シリンダーの側面に小さな赤い立方体（マーカー）を配置しています。

---

## 2. `usecase-004/index.js` コード詳細

それでは、実際の `usecase-004` のコードを詳しく見ていきましょう。

```js
// usecase-004/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase004 extends UseCaseBase {
  static metadata = {
    id: "004",
    title: "Rotating Cylinder with Marker",
    description:
      "A cylinder spinning around its Y-axis with a marker to show rotation clearly",
    categories: ["Geometry", "Animation"],
  };

  constructor(scene) {
    super(scene);
    this.objects = new Set();
    this.time = 0;
  }

  static setupScene(scene) {
    // 環境光と平行光源を追加
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    // グリッドヘルパーを追加して回転が分かりやすくする
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // シリンダーとマーカーをまとめるグループを作成
    const group = new THREE.Group();

    // シリンダーの作成
    const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
    const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    group.add(cylinder);

    // マーカーとして、シリンダーの端に配置する赤い小箱を作成
    const markerGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const markerMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    // シリンダーの半径が1なので、少し外側に配置（x軸方向）
    marker.position.set(1.1, 0, 0);
    group.add(marker);

    scene.add(group);

    return { objects: [group], geometries: [cylinderGeometry, markerGeometry] };
  }

  static updateObjects(objects, time, deltaTime = 0.016) {
    // グループ全体をY軸回転させる
    objects[0].rotation.y += deltaTime * 2;
  }

  async init() {
    const { objects } = GeometryShowcase004.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase004.updateObjects(
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
  id: "004",
  title: "Rotating Cylinder with Marker",
  description:
    "A cylinder spinning around its Y-axis with a marker to show rotation clearly",
  categories: ["Geometry", "Animation"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `004`、 `title` は「Rotating Cylinder with Marker」など。
- `description` には、回転を視覚的に分かりやすくするためのマーカーについても言及されています。

### 2-2. `setupScene(scene)`

```js
static setupScene(scene) {
  // 環境光と平行光源を追加
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(ambientLight, directionalLight);

  // グリッドヘルパーを追加して回転が分かりやすくする
  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);

  // シリンダーとマーカーをまとめるグループを作成
  const group = new THREE.Group();

  // シリンダーの作成
  const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
  const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff });
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  group.add(cylinder);

  // マーカーとして、シリンダーの端に配置する赤い小箱を作成
  const markerGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const markerMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);
  // シリンダーの半径が1なので、少し外側に配置（x軸方向）
  marker.position.set(1.1, 0, 0);
  group.add(marker);

  scene.add(group);

  return { objects: [group], geometries: [cylinderGeometry, markerGeometry] };
}
```

前章までとの主な違いは以下の点です：

1. **グリッドヘルパーの追加**:
   ```js
   const gridHelper = new THREE.GridHelper(10, 10);
   scene.add(gridHelper);
   ```
   
   `THREE.GridHelper` を使って、床面にグリッドを表示しています。これにより、回転の様子がより分かりやすくなります。

2. **グループの使用**:
   ```js
   const group = new THREE.Group();
   // ...
   group.add(cylinder);
   // ...
   group.add(marker);
   scene.add(group);
   ```
   
   `THREE.Group` を使って、シリンダーとマーカーをグループ化しています。これにより、複数のオブジェクトをまとめて操作（回転など）できます。

3. **複数のジオメトリの使用**:
   ```js
   const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
   // ...
   const markerGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
   ```
   
   シリンダー（`CylinderGeometry`）と立方体（`BoxGeometry`）の2種類のジオメトリを使用しています。

4. **マーカーの配置**:
   ```js
   marker.position.set(1.1, 0, 0);
   ```
   
   マーカー（赤い立方体）をシリンダーの側面に配置しています。シリンダーの半径が1なので、少し外側（1.1）に配置することで、シリンダーの表面から少し浮き出た状態になります。

### 2-3. `updateObjects(objects, time, deltaTime)`

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  // グループ全体をY軸回転させる
  objects[0].rotation.y += deltaTime * 2;
}
```

前章までと同様に回転アニメーションを実装していますが、ここでの違いは以下の点です：

1. **グループの回転**:
   `objects[0]` はグループ（`THREE.Group`）を参照しています。グループを回転させることで、グループに含まれるすべてのオブジェクト（シリンダーとマーカー）が一緒に回転します。

2. **回転速度**:
   `deltaTime * 2` としているため、標準速度の2倍で回転します。

この実装により、シリンダーとマーカーが一体となって回転し、マーカーの動きによって回転の様子が視覚的に分かりやすくなっています。

### 2-4. `getThumbnailBlob()`

```js
static getThumbnailBlob() {
  // Create a simple SVG representation of a cyan cylinder with a red marker
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#111111"/>
      
      <!-- Grid representation -->
      <line x1="50" y1="150" x2="150" y2="150" stroke="#444444" stroke-width="1"/>
      <line x1="70" y1="150" x2="70" y2="140" stroke="#444444" stroke-width="1"/>
      <line x1="90" y1="150" x2="90" y2="140" stroke="#444444" stroke-width="1"/>
      <line x1="110" y1="150" x2="110" y2="140" stroke="#444444" stroke-width="1"/>
      <line x1="130" y1="150" x2="130" y2="140" stroke="#444444" stroke-width="1"/>
      
      <!-- Cylinder representation -->
      <ellipse cx="100" cy="70" rx="40" ry="15" fill="#00ffff" opacity="0.8"/>
      <rect x="60" y="70" width="80" height="60" fill="#00ffff"/>
      <ellipse cx="100" cy="130" rx="40" ry="15" fill="#00cccc"/>
      
      <!-- Red marker -->
      <rect x="135" y="95" width="10" height="10" fill="#ff0000"/>
      
      <!-- Highlight on cylinder -->
      <ellipse cx="85" cy="70" rx="10" ry="5" fill="#ffffff" opacity="0.3"/>
    </svg>
  `;

  // Unicode-safe encoding
  const encodedSvg = unescape(encodeURIComponent(svgString));
  const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

  // Convert to Blob
  return fetch(dataURL).then((res) => res.blob());
}
```

サムネイル生成用のSVGが、シリンダーとマーカーを表現するように変更されています。また、グリッドも簡略化して表現されています。

---

## 3. 前章との比較

`usecase-004` は前章までと基本的な構造は同じですが、以下の点が異なります：

1. **ジオメトリ**: SphereGeometry から CylinderGeometry に変更
2. **色**: 黄色から水色に変更
3. **複数オブジェクト**: 単一のオブジェクトから、シリンダーとマーカーの組み合わせに変更
4. **グループの使用**: 複数のオブジェクトをグループ化して扱う方法を導入
5. **グリッドヘルパー**: 床面にグリッドを表示して、空間認識を助ける
6. **サムネイル**: 球体からシリンダーとマーカーを表現するSVGに変更

特に重要なのは、**複数のオブジェクトをグループ化して扱う方法**が導入された点です。これにより、複雑なシーンを構築する際の基本的な手法を学ぶことができます。

---

## 4. CylinderGeometryの詳細パラメータ

`THREE.CylinderGeometry` のコンストラクタは以下の形式を取ります：

```js
new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);
```

- **radiusTop**: 上面の半径
- **radiusBottom**: 下面の半径
- **height**: 高さ
- **radialSegments**: 円周方向の分割数
- **heightSegments**: 高さ方向の分割数（デフォルトは1）
- **openEnded**: 上面と下面を開くかどうか（デフォルトはfalse）
- **thetaStart**: 円周の開始角度（デフォルトは0）
- **thetaLength**: 円周の角度の大きさ（デフォルトは2π＝360度）

`usecase-004` では以下のパラメータを使用しています：

```js
const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
```

- 上面の半径: 1
- 下面の半径: 1（上面と同じなので完全な円柱）
- 高さ: 2
- 円周方向の分割数: 32（円周の滑らかさ）

`radiusTop` と `radiusBottom` に異なる値を設定すると、円錐台（上下の半径が異なる円柱）を作ることができます：

```js
// 円錐（上面の半径が0）
const coneGeometry = new THREE.CylinderGeometry(0, 1, 2, 32);

// 円錐台（上面の半径が下面の半分）
const frustumGeometry = new THREE.CylinderGeometry(0.5, 1, 2, 32);
```

---

## 5. THREE.Groupの使い方

`usecase-004` の重要な特徴の一つは、`THREE.Group` を使って複数のオブジェクトをグループ化している点です。

```js
const group = new THREE.Group();
group.add(cylinder);
group.add(marker);
scene.add(group);
```

### 5-1. グループの基本

`THREE.Group` は、複数の3Dオブジェクトをまとめて扱うためのコンテナです。グループ自体も3Dオブジェクトなので、位置、回転、スケールなどのプロパティを持ちます。

グループに対する変換（移動、回転、拡大縮小）は、グループ内のすべてのオブジェクトに適用されます。これにより、複数のオブジェクトを一度に操作することができます。

### 5-2. グループの利点

グループを使用する主な利点は以下の通りです：

1. **一括操作**: 複数のオブジェクトを一度に移動、回転、拡大縮小できる。
2. **階層構造**: 親子関係を作り、相対的な位置関係を維持できる。
3. **整理整頓**: 関連するオブジェクトをグループ化することで、シーンの構造を整理できる。

### 5-3. グループの階層構造

グループは入れ子にすることもできます：

```js
const parentGroup = new THREE.Group();
const childGroup1 = new THREE.Group();
const childGroup2 = new THREE.Group();

childGroup1.add(object1);
childGroup1.add(object2);

childGroup2.add(object3);
childGroup2.add(object4);

parentGroup.add(childGroup1);
parentGroup.add(childGroup2);

scene.add(parentGroup);
```

このような階層構造を使うことで、複雑なシーンを論理的に整理することができます。

---

## 6. 回転の視覚化テクニック

`usecase-004` では、回転を視覚的に分かりやすくするために、以下の2つの手法を使用しています：

### 6-1. マーカーの使用

```js
const markerGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const markerMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const marker = new THREE.Mesh(markerGeometry, markerMaterial);
marker.position.set(1.1, 0, 0);
group.add(marker);
```

シリンダーの側面に小さな赤い立方体（マーカー）を配置することで、回転の様子が視覚的に分かりやすくなっています。マーカーは以下の特徴を持っています：

- **目立つ色**: 赤色（`0xff0000`）を使用して、シリンダー（水色）との対比を強調。
- **適切な配置**: シリンダーの側面から少し浮き出た位置に配置することで、回転時の軌道が明確に。
- **適切なサイズ**: シリンダーに対して十分小さいサイズにすることで、主役（シリンダー）を邪魔しない。

### 6-2. グリッドヘルパーの使用

```js
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);
```

床面にグリッドを表示することで、空間認識を助けています。グリッドは以下の役割を果たします：

- **基準面の提供**: XZ平面（床面）の位置を明確に示す。
- **距離感の提供**: グリッドの間隔により、オブジェクトのサイズや移動距離の目安になる。
- **回転の参照点**: 静止したグリッドに対して、オブジェクトがどのように回転しているかが分かりやすくなる。

これらの視覚化テクニックは、3Dシーンを作成する際に非常に役立ちます。特に、アニメーションやインタラクションを実装する場合、ユーザーが空間を理解しやすくするための工夫が重要です。

---

## 7. 応用例：CylinderGeometryとグループの拡張

`usecase-004` のコードをベースに、以下のような拡張が考えられます：

### 7-1. 円錐や円錐台への変更

```js
// 円錐
const coneGeometry = new THREE.CylinderGeometry(0, 1, 2, 32);
const coneMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff });
const cone = new THREE.Mesh(coneGeometry, coneMaterial);
group.add(cone);

// または円錐台
const frustumGeometry = new THREE.CylinderGeometry(0.5, 1, 2, 32);
const frustumMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff });
const frustum = new THREE.Mesh(frustumGeometry, frustumMaterial);
group.add(frustum);
```

### 7-2. 複数のマーカーを追加

```js
// 複数のマーカーを円周上に配置
const numMarkers = 4;
for (let i = 0; i < numMarkers; i++) {
  const angle = (i / numMarkers) * Math.PI * 2;
  const markerGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const markerMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);
  
  // 円周上に配置
  marker.position.set(
    Math.cos(angle) * 1.1, // X座標
    0,                     // Y座標
    Math.sin(angle) * 1.1  // Z座標
  );
  
  group.add(marker);
}
```

### 7-3. 異なる回転軸の使用

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  // X軸周りの回転
  objects[0].rotation.x += deltaTime * 2;
  
  // または斜め軸周りの回転
  objects[0].rotation.x += deltaTime;
  objects[0].rotation.y += deltaTime * 2;
  objects[0].rotation.z += deltaTime * 0.5;
}
```

### 7-4. 入れ子のグループ構造

```js
// 親グループ
const parentGroup = new THREE.Group();

// シリンダーとそのマーカーのグループ
const cylinderGroup = new THREE.Group();
cylinderGroup.add(cylinder);
cylinderGroup.add(marker);

// 別のオブジェクトのグループ
const otherGroup = new THREE.Group();
otherGroup.add(otherObject);

// グループを階層化
parentGroup.add(cylinderGroup);
parentGroup.add(otherGroup);
scene.add(parentGroup);

// 親グループ全体を回転
parentGroup.rotation.y += deltaTime;

// 子グループも独自に回転
cylinderGroup.rotation.x += deltaTime * 2;
```

---

## 8. THREE.GridHelperの詳細

`usecase-004` では、`THREE.GridHelper` を使って床面にグリッドを表示しています。このヘルパーについて詳しく見ていきましょう。

### 8-1. GridHelperの基本

```js
const gridHelper = new THREE.GridHelper(size, divisions, colorCenterLine, colorGrid);
```

- **size**: グリッドの一辺の長さ
- **divisions**: グリッドの分割数
- **colorCenterLine**: 中心線の色（オプション）
- **colorGrid**: グリッド線の色（オプション）

`usecase-004` では以下のように使用しています：

```js
const gridHelper = new THREE.GridHelper(10, 10);
```

これにより、10×10の大きさのグリッドが、10×10のマス目に分割されて表示されます。

### 8-2. GridHelperのカスタマイズ

```js
// 色を指定したグリッド
const gridHelper = new THREE.GridHelper(
  10,
  10,
  0xff0000, // 中心線の色（赤）
  0x00ff00  // グリッド線の色（緑）
);

// 位置を変更したグリッド
const gridHelper = new THREE.GridHelper(10, 10);
gridHelper.position.y = -1; // 床面を下げる

// 回転したグリッド（壁面などに）
const gridHelper = new THREE.GridHelper(10, 10);
gridHelper.rotation.x = Math.PI / 2; // 90度回転してXZ平面からXY平面に
```

### 8-3. 他のヘルパー

Three.jsには、`GridHelper` 以外にも様々なヘルパーが用意されています：

- **AxesHelper**: 座標軸を表示するヘルパー
- **BoxHelper**: オブジェクトのバウンディングボックスを表示するヘルパー
- **CameraHelper**: カメラの視錐台を表示するヘルパー
- **DirectionalLightHelper**: 平行光源の方向を表示するヘルパー

これらのヘルパーを組み合わせることで、3Dシーンの開発やデバッグを効率的に行うことができます。

---

## 9. まとめ

「**Usecase-004: Rotating Cylinder with Marker**」では、Three.jsの `CylinderGeometry` を使って、Y軸周りに回転するシリンダーを実装しました。また、回転を視覚的に分かりやすくするために、マーカーとグリッドヘルパーを追加しました。

主なポイントは以下の通りです：

1. **CylinderGeometryの使用**: 円柱を作成し、上面と下面の半径を同じに設定することで完全な円柱を表現しました。
2. **THREE.Groupの使用**: シリンダーとマーカーをグループ化することで、複数のオブジェクトを一括して回転させる方法を学びました。
3. **回転の視覚化**: マーカーとグリッドヘルパーを使って、回転を視覚的に分かりやすくする手法を学びました。
4. **サムネイル生成**: シリンダーとマーカーを表現するSVGを作成し、ギャラリー表示に対応しました。

このサンプルは、Three.jsでの複数オブジェクトの扱い方や、視覚的な工夫の重要性を示す良い例となっています。グループ化や視覚化テクニックは、より複雑な3Dシーンを構築する際の基礎となる重要な概念です。

---

## 10. 次のステップ

`usecase-004` を理解したら、次のステップとして以下のような発展が考えられます：

1. **複雑なグループ構造**: 入れ子のグループを使って、より複雑なオブジェクト階層を作成する。
2. **異なる回転軸**: X軸やZ軸、あるいは任意の軸周りの回転を試す。
3. **インタラクティブな回転**: マウスやキーボードの入力に応じて、回転速度や方向を変更できるようにする。
4. **物理ベースのマテリアル**: `MeshStandardMaterial` を使って、より現実的な表現を試す。

これらの発展は、今後のユースケースで順次紹介していく予定です。`usecase-004` で学んだグループ化や視覚化テクニックの基本を応用することで、より高度な3D表現へと進んでいきましょう。
