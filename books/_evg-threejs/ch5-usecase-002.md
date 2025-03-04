---
title: Usecase-002 Bouncing Torus
---
# Usecase-002: Bouncing Torus

**本章では、`usecases/usecase-002` ディレクトリに格納されている「Bouncing Torus」のコードを解説します。**  
このサンプルは、青色のトーラス（ドーナツ形状）が上下に弾むアニメーションを実装しています。前章までの回転するキューブや二十面体から一歩進んで、位置の変化を伴うアニメーションを学ぶ良い例となっています。

---

## 1. Torusとは？

Torus（トーラス）は、ドーナツ状の3D形状です。Three.jsでは `THREE.TorusGeometry` クラスとして実装されており、以下のような特徴があります：

- 円環状の形状（ドーナツ形状）
- 中心に穴が空いている
- 2つの半径パラメータ（主半径と断面半径）で形状を定義
- 円周方向と断面方向の分割数を指定可能

`usecase-002` では、このTorusを使って、上下に弾むアニメーションを実装しています。これにより、オブジェクトの位置を時間の関数として変化させる方法を学ぶことができます。

---

## 2. `usecase-002/index.js` コード詳細

それでは、実際の `usecase-002` のコードを詳しく見ていきましょう。

```js
// usecase-002/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase002 extends UseCaseBase {
  static metadata = {
    id: "002",
    title: "Bouncing Torus",
    description: "A torus that bounces up and down",
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

    const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
    const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return { objects: [mesh], geometries: [geometry] };
  }

  static updateObjects(objects, time, deltaTime = 0.016) {
    objects[0].position.y = Math.sin(time * 2) * 0.5;
    objects[0].rotation.x += deltaTime * 0.5;
  }

  async init() {
    const { objects } = GeometryShowcase002.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase002.updateObjects(
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
    // Create a simple SVG representation of a blue torus
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111111"/>
        
        <!-- Torus representation -->
        <ellipse cx="100" cy="100" rx="60" ry="25" fill="none" stroke="#0000ff" stroke-width="20" />
        <ellipse cx="100" cy="100" rx="60" ry="25" fill="none" stroke="#0066ff" stroke-width="10" />
        <ellipse cx="100" cy="100" rx="60" ry="25" fill="none" stroke="#0099ff" stroke-width="5" />
        
        <!-- Highlight -->
        <ellipse cx="80" cy="85" rx="10" ry="5" fill="#ffffff" opacity="0.3" />
      </svg>
    `;

    // Unicode-safe encoding
    const encodedSvg = unescape(encodeURIComponent(svgString));
    const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

    // Convert to Blob
    return fetch(dataURL).then((res) => res.blob());
  }

  static createPreview(container) {
    // プレビュー生成用のコード（省略）
  }
}
```

### 2-1. `metadata`

```js
static metadata = {
  id: "002",
  title: "Bouncing Torus",
  description: "A torus that bounces up and down",
  categories: ["Geometry", "Animation"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `002`、 `title` は「Bouncing Torus」など。
- `categories` は前章と同じく「Geometry」と「Animation」を指定。

### 2-2. `setupScene(scene)`

```js
static setupScene(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(ambientLight, directionalLight);

  const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
  const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return { objects: [mesh], geometries: [geometry] };
}
```

前章の `usecase-001` との主な違いは以下の点です：

1. **ジオメトリの変更**:
   ```js
   // usecase-001
   const geometry = new THREE.IcosahedronGeometry(1, 0);
   
   // usecase-002
   const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
   ```
   
   `THREE.TorusGeometry` の引数は以下の通りです：
   - 第1引数: 主半径（トーラスの中心から断面の中心までの距離）
   - 第2引数: 断面半径（トーラスの断面の半径）
   - 第3引数: 断面の分割数（断面円周の分割数）
   - 第4引数: 主円周の分割数（トーラス全体の円周の分割数）

2. **マテリアルの色**:
   ```js
   // usecase-001
   const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
   
   // usecase-002
   const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
   ```
   
   緑色（`0x00ff00`）から青色（`0x0000ff`）に変更されています。

### 2-3. `updateObjects(objects, time, deltaTime)`

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].position.y = Math.sin(time * 2) * 0.5;
  objects[0].rotation.x += deltaTime * 0.5;
}
```

ここが前章までとの大きな違いです。`usecase-001` では回転のみでしたが、`usecase-002` では以下の2つのアニメーションを組み合わせています：

1. **位置の変化（弾むアニメーション）**:
   ```js
   objects[0].position.y = Math.sin(time * 2) * 0.5;
   ```
   
   `Math.sin()` 関数を使って、Y座標を時間の関数として変化させています。
   - `time * 2`: 時間の経過を2倍速にして、弾む周期を速くしています。
   - `* 0.5`: 振幅を0.5に設定し、上下の移動量を制限しています。

2. **回転**:
   ```js
   objects[0].rotation.x += deltaTime * 0.5;
   ```
   
   X軸周りの回転を加えていますが、回転速度は前章よりも遅く設定されています（`deltaTime * 0.5`）。

この組み合わせにより、トーラスが上下に弾みながら、ゆっくりと回転するアニメーションが実現されています。

### 2-4. `getThumbnailBlob()`

```js
static getThumbnailBlob() {
  // Create a simple SVG representation of a blue torus
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#111111"/>
      
      <!-- Torus representation -->
      <ellipse cx="100" cy="100" rx="60" ry="25" fill="none" stroke="#0000ff" stroke-width="20" />
      <ellipse cx="100" cy="100" rx="60" ry="25" fill="none" stroke="#0066ff" stroke-width="10" />
      <ellipse cx="100" cy="100" rx="60" ry="25" fill="none" stroke="#0099ff" stroke-width="5" />
      
      <!-- Highlight -->
      <ellipse cx="80" cy="85" rx="10" ry="5" fill="#ffffff" opacity="0.3" />
    </svg>
  `;

  // Unicode-safe encoding
  const encodedSvg = unescape(encodeURIComponent(svgString));
  const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

  // Convert to Blob
  return fetch(dataURL).then((res) => res.blob());
}
```

サムネイル生成用のSVGが、トーラスを表現するように変更されています。3つの楕円を重ねて描画し、異なる太さと色を適用することで、立体的なトーラスの表現を実現しています。

---

## 3. 前章との比較

`usecase-002` は前章までと基本的な構造は同じですが、以下の点が異なります：

1. **ジオメトリ**: IcosahedronGeometry から TorusGeometry に変更
2. **色**: 緑色から青色に変更
3. **アニメーション**: 単純な回転から、位置変化（弾み）と回転の組み合わせに変更
4. **サムネイル**: 二十面体からトーラスを表現するSVGに変更

特に重要なのは、**位置の変化を伴うアニメーション**が導入された点です。これにより、Three.jsでのアニメーション表現の幅が広がります。

---

## 4. TorusGeometryの詳細パラメータ

`THREE.TorusGeometry` のコンストラクタは以下の形式を取ります：

```js
new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments, arc);
```

- **radius**: トーラスの中心から断面の中心までの距離（主半径）
- **tube**: 断面の半径
- **radialSegments**: 断面円周の分割数
- **tubularSegments**: トーラス全体の円周の分割数
- **arc**: トーラスの円周方向の角度（デフォルトは2π＝360度）

`usecase-002` では以下のパラメータを使用しています：

```js
const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
```

- 主半径: 1
- 断面半径: 0.4
- 断面分割数: 16（断面の滑らかさ）
- 主円周分割数: 100（トーラス全体の滑らかさ）

分割数を増やすとより滑らかな見た目になりますが、処理負荷も高くなります。用途に応じて適切な分割数を選ぶことが重要です。

---

## 5. 数学関数を使ったアニメーション

`usecase-002` の最も重要な特徴は、`Math.sin()` 関数を使った周期的なアニメーションです。

```js
objects[0].position.y = Math.sin(time * 2) * 0.5;
```

この1行のコードで、トーラスが上下に弾むアニメーションが実現されています。

### 5-1. 正弦波アニメーションの仕組み

`Math.sin()` 関数は、入力値（ラジアン）に対して -1 から 1 の間の値を返します。これを利用して、以下のような周期的な動きを作ることができます：

- **周期**: `Math.sin(time)` の周期は2π（約6.28）秒です。`time * 2` とすることで、周期を約3.14秒に短縮しています。
- **振幅**: `* 0.5` を掛けることで、上下の移動量を0.5単位に制限しています。
- **中心位置**: デフォルトでは、振動の中心はY=0です。`+ 1` などを加えると、中心位置を上方向にシフトできます。

### 5-2. 他の数学関数を使ったバリエーション

`Math.sin()` 以外にも、様々な数学関数を使って異なるアニメーションパターンを作ることができます：

- **`Math.cos()`**: 正弦波と同様ですが、位相が90度異なります。
- **`Math.abs(Math.sin())`**: 0から1の間で弾むアニメーション（常に正の値）。
- **`Math.pow(Math.sin(), 2)`**: より滑らかな0から1の弾みアニメーション。
- **`Math.sin() * Math.cos()`**: より複雑な周期パターン。

---

## 6. 応用例：TorusGeometryとアニメーションの拡張

`usecase-002` のコードをベースに、以下のような拡張が考えられます：

### 6-1. トーラスのパラメータを変更する

```js
// より太いトーラス
const geometry = new THREE.TorusGeometry(1, 0.6, 16, 100);

// より細かい分割のトーラス
const geometry = new THREE.TorusGeometry(1, 0.4, 32, 200);

// 半円状のトーラス
const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100, Math.PI);
```

### 6-2. 複数の軸で弾むアニメーション

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].position.y = Math.sin(time * 2) * 0.5;
  objects[0].position.x = Math.cos(time * 1.5) * 0.3;
  objects[0].rotation.x += deltaTime * 0.5;
}
```

X軸とY軸の両方で異なる周期の弾みを加えることで、より複雑な動きを実現できます。

### 6-3. 回転と弾みの組み合わせを変える

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].position.y = Math.sin(time * 2) * 0.5;
  
  // 弾みに合わせて回転速度を変化させる
  const rotationSpeed = 0.3 + Math.abs(Math.sin(time * 2)) * 0.5;
  objects[0].rotation.x += deltaTime * rotationSpeed;
}
```

弾みの高さに応じて回転速度を変化させることで、より自然な動きを表現できます。

### 6-4. 色を時間とともに変化させる

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].position.y = Math.sin(time * 2) * 0.5;
  objects[0].rotation.x += deltaTime * 0.5;
  
  // 色を時間とともに変化させる
  const hue = (time * 0.1) % 1;
  objects[0].material.color.setHSL(hue, 0.7, 0.5);
}
```

HSL色空間を使って、時間とともに色相を変化させることで、虹色に変化するトーラスを表現できます。

---

## 7. 位置アニメーションの応用

`usecase-002` で学んだ位置アニメーションの手法は、様々な表現に応用できます：

### 7-1. 軌道運動

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  // 円軌道上を移動
  objects[0].position.x = Math.cos(time) * 2;
  objects[0].position.z = Math.sin(time) * 2;
  
  // 常に軌道の中心を向くように回転
  objects[0].lookAt(0, 0, 0);
}
```

### 7-2. バネのような動き

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  // 減衰する振動
  const amplitude = Math.exp(-time * 0.5) * Math.sin(time * 5);
  objects[0].position.y = amplitude;
}
```

### 7-3. 複数オブジェクトの波状の動き

```js
static setupScene(scene) {
  // 複数のトーラスを作成
  const objects = [];
  const geometries = [];
  
  for (let i = 0; i < 10; i++) {
    const geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 50);
    geometries.push(geometry);
    
    const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = i - 4.5;
    scene.add(mesh);
    objects.push(mesh);
  }
  
  return { objects, geometries };
}

static updateObjects(objects, time, deltaTime = 0.016) {
  // 波状の動き
  objects.forEach((obj, i) => {
    obj.position.y = Math.sin(time * 3 + i * 0.5) * 0.5;
    obj.rotation.x += deltaTime * 0.5;
  });
}
```

---

## 8. まとめ

「**Usecase-002: Bouncing Torus**」では、Three.jsの `TorusGeometry` を使って、上下に弾むアニメーションを実装しました。

主なポイントは以下の通りです：

1. **TorusGeometryの使用**: ドーナツ形状のトーラスを作成し、より複雑な3Dオブジェクトの表現方法を学びました。
2. **位置アニメーション**: `Math.sin()` 関数を使って、オブジェクトの位置を時間の関数として変化させる方法を学びました。
3. **複合アニメーション**: 位置の変化と回転を組み合わせることで、より豊かな動きを表現しました。
4. **サムネイル生成**: トーラスを表現するSVGを作成し、ギャラリー表示に対応しました。

このサンプルは、Three.jsでのアニメーション表現の幅を広げる重要な一歩となります。数学関数を活用した周期的なアニメーションは、様々な自然現象や物理的な動きを模倣するのに役立ちます。

---

## 9. 次のステップ

`usecase-002` を理解したら、次のステップとして以下のような発展が考えられます：

1. **複数のトーラスを組み合わせる**: 異なるサイズや色のトーラスを複数配置し、それぞれに異なるアニメーションを適用する。
2. **ユーザーインタラクション**: マウスの位置に応じてトーラスの弾み方や回転を変化させる。
3. **物理シミュレーション**: 重力や反発力を模倣した、よりリアルな弾みアニメーションを実装する。
4. **パーティクルとの連携**: トーラスの動きに合わせて、パーティクルを放出するエフェクトを追加する。

これらの発展は、今後のユースケースで順次紹介していく予定です。`usecase-002` で学んだ位置アニメーションの基本を応用することで、より高度な3D表現へと進んでいきましょう。
