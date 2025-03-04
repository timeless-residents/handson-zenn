---
title: Usecase-003 Pulsing Sphere
---
# Usecase-003: Pulsing Sphere

**本章では、`usecases/usecase-003` ディレクトリに格納されている「Pulsing Sphere」のコードを解説します。**  
このサンプルは、黄色の球体（Sphere）がサイズを周期的に変化させる「脈動」アニメーションを実装しています。前章までの回転や位置変化に加えて、スケール（拡大縮小）を使ったアニメーション表現を学ぶ良い例となっています。

---

## 1. Sphereとは？

Sphere（球体）は、3D空間において中心点から一定の距離にある点の集合で形成される形状です。Three.jsでは `THREE.SphereGeometry` クラスとして実装されており、以下のような特徴があります：

- 完全に対称的な形状
- 中心から表面までの距離（半径）が一定
- 緯度方向と経度方向の分割数を指定可能
- 滑らかな曲面を持つ

`usecase-003` では、この球体を使って、サイズが周期的に変化する「脈動」アニメーションを実装しています。これにより、オブジェクトのスケールを時間の関数として変化させる方法を学ぶことができます。

---

## 2. `usecase-003/index.js` コード詳細

それでは、実際の `usecase-003` のコードを詳しく見ていきましょう。

```js
// usecase-003/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase003 extends UseCaseBase {
  static metadata = {
    id: "003",
    title: "Pulsing Sphere",
    description: "A sphere that pulses in size",
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

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return { objects: [mesh], geometries: [geometry] };
  }

  static updateObjects(objects, time, deltaTime = 0.016) {
    const scale = 1 + Math.sin(time) * 0.2;
    objects[0].scale.set(scale, scale, scale);
    objects[0].rotation.y += deltaTime;
  }

  async init() {
    const { objects } = GeometryShowcase003.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase003.updateObjects(
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
    // Create a simple SVG representation of a yellow sphere
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111111"/>
        
        <!-- Sphere representation -->
        <circle cx="100" cy="100" r="60" fill="#ffff00" />
        
        <!-- Shading to give 3D effect -->
        <circle cx="100" cy="100" r="60" fill="url(#sphere-gradient)" />
        
        <!-- Highlight -->
        <circle cx="80" cy="80" r="15" fill="#ffffff" opacity="0.3" />
        
        <!-- Gradient definition -->
        <defs>
          <radialGradient id="sphere-gradient" cx="40%" cy="40%" r="60%" fx="40%" fy="40%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0.5"/>
          </radialGradient>
        </defs>
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
  id: "003",
  title: "Pulsing Sphere",
  description: "A sphere that pulses in size",
  categories: ["Geometry", "Animation"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `003`、 `title` は「Pulsing Sphere」など。
- `categories` は前章と同じく「Geometry」と「Animation」を指定。

### 2-2. `setupScene(scene)`

```js
static setupScene(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(ambientLight, directionalLight);

  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return { objects: [mesh], geometries: [geometry] };
}
```

前章の `usecase-002` との主な違いは以下の点です：

1. **ジオメトリの変更**:
   ```js
   // usecase-002
   const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
   
   // usecase-003
   const geometry = new THREE.SphereGeometry(1, 32, 32);
   ```
   
   `THREE.SphereGeometry` の引数は以下の通りです：
   - 第1引数: 球体の半径（この場合は1）
   - 第2引数: 水平方向の分割数（経度方向、この場合は32）
   - 第3引数: 垂直方向の分割数（緯度方向、この場合は32）

2. **マテリアルの色**:
   ```js
   // usecase-002
   const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
   
   // usecase-003
   const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
   ```
   
   青色（`0x0000ff`）から黄色（`0xffff00`）に変更されています。

### 2-3. `updateObjects(objects, time, deltaTime)`

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  const scale = 1 + Math.sin(time) * 0.2;
  objects[0].scale.set(scale, scale, scale);
  objects[0].rotation.y += deltaTime;
}
```

ここが前章までとの大きな違いです。`usecase-002` では位置の変化（弾み）と回転を組み合わせていましたが、`usecase-003` では以下の2つのアニメーションを組み合わせています：

1. **スケールの変化（脈動アニメーション）**:
   ```js
   const scale = 1 + Math.sin(time) * 0.2;
   objects[0].scale.set(scale, scale, scale);
   ```
   
   `Math.sin()` 関数を使って、スケール（拡大縮小率）を時間の関数として変化させています。
   - `1 +`: 基準となるスケールを1（元のサイズ）に設定。
   - `Math.sin(time) * 0.2`: -0.2から0.2の間で変動する値を加算。
   - 結果として、スケールは0.8から1.2の間で周期的に変化。
   - `scale.set(scale, scale, scale)`: X, Y, Z軸すべて同じスケールを適用し、均等に拡大縮小。

2. **回転**:
   ```js
   objects[0].rotation.y += deltaTime;
   ```
   
   Y軸周りの回転を加えています。回転速度は標準速度（`deltaTime`）に設定されています。

この組み合わせにより、球体が脈動しながら回転するアニメーションが実現されています。

### 2-4. `getThumbnailBlob()`

```js
static getThumbnailBlob() {
  // Create a simple SVG representation of a yellow sphere
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#111111"/>
      
      <!-- Sphere representation -->
      <circle cx="100" cy="100" r="60" fill="#ffff00" />
      
      <!-- Shading to give 3D effect -->
      <circle cx="100" cy="100" r="60" fill="url(#sphere-gradient)" />
      
      <!-- Highlight -->
      <circle cx="80" cy="80" r="15" fill="#ffffff" opacity="0.3" />
      
      <!-- Gradient definition -->
      <defs>
        <radialGradient id="sphere-gradient" cx="40%" cy="40%" r="60%" fx="40%" fy="40%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.5"/>
        </radialGradient>
      </defs>
    </svg>
  `;

  // Unicode-safe encoding
  const encodedSvg = unescape(encodeURIComponent(svgString));
  const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

  // Convert to Blob
  return fetch(dataURL).then((res) => res.blob());
}
```

サムネイル生成用のSVGが、球体を表現するように変更されています。円形の要素に放射状のグラデーションを適用することで、立体的な球体の表現を実現しています。

---

## 3. 前章との比較

`usecase-003` は前章までと基本的な構造は同じですが、以下の点が異なります：

1. **ジオメトリ**: TorusGeometry から SphereGeometry に変更
2. **色**: 青色から黄色に変更
3. **アニメーション**: 位置変化（弾み）から、スケール変化（脈動）に変更
4. **サムネイル**: トーラスから球体を表現するSVGに変更

特に重要なのは、**スケールの変化を伴うアニメーション**が導入された点です。これにより、Three.jsでのアニメーション表現の幅がさらに広がります。

---

## 4. SphereGeometryの詳細パラメータ

`THREE.SphereGeometry` のコンストラクタは以下の形式を取ります：

```js
new THREE.SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength);
```

- **radius**: 球体の半径
- **widthSegments**: 水平方向の分割数（経度方向）
- **heightSegments**: 垂直方向の分割数（緯度方向）
- **phiStart**: 水平方向の開始角度（デフォルトは0）
- **phiLength**: 水平方向の角度の大きさ（デフォルトは2π＝360度）
- **thetaStart**: 垂直方向の開始角度（デフォルトは0）
- **thetaLength**: 垂直方向の角度の大きさ（デフォルトはπ＝180度）

`usecase-003` では以下のパラメータを使用しています：

```js
const geometry = new THREE.SphereGeometry(1, 32, 32);
```

- 半径: 1
- 水平分割数: 32（経度方向の滑らかさ）
- 垂直分割数: 32（緯度方向の滑らかさ）

分割数を増やすとより滑らかな見た目になりますが、処理負荷も高くなります。用途に応じて適切な分割数を選ぶことが重要です。

---

## 5. スケールアニメーションの仕組み

`usecase-003` の最も重要な特徴は、`scale` プロパティを使ったサイズの変化です。

```js
const scale = 1 + Math.sin(time) * 0.2;
objects[0].scale.set(scale, scale, scale);
```

この2行のコードで、球体が脈動するアニメーションが実現されています。

### 5-1. スケールの基本

Three.jsでは、オブジェクトの `scale` プロパティを変更することで、そのサイズを変更できます。`scale` は3次元ベクトル（Vector3）で、X, Y, Z軸それぞれの拡大縮小率を指定します：

- **scale.x**: X軸方向の拡大縮小率
- **scale.y**: Y軸方向の拡大縮小率
- **scale.z**: Z軸方向の拡大縮小率

`scale.set(x, y, z)` メソッドを使うと、3つの軸のスケールを一度に設定できます。

### 5-2. 均等なスケール変化

`usecase-003` では、3つの軸すべてに同じスケール値を設定しています：

```js
objects[0].scale.set(scale, scale, scale);
```

これにより、オブジェクトは均等に拡大縮小され、形状の比率が保たれます。もし異なる値を設定すると、オブジェクトは歪んで見えます：

```js
// X軸方向のみ拡大縮小する例
objects[0].scale.set(scale, 1, 1);

// X, Y軸は拡大、Z軸は縮小する例
objects[0].scale.set(1.2, 1.2, 0.8);
```

### 5-3. 正弦波を使ったスケール変化

`Math.sin()` 関数は、入力値（ラジアン）に対して -1 から 1 の間の値を返します。これを利用して、以下のような周期的なスケール変化を作ることができます：

- **基準スケール**: `1 +` で、基準となるスケールを1（元のサイズ）に設定。
- **変動幅**: `* 0.2` で、スケールの変動幅を0.2に制限。
- **結果**: スケールは0.8（1-0.2）から1.2（1+0.2）の間で周期的に変化。

### 5-4. スケール変化の周期

`Math.sin(time)` の周期は2π（約6.28）秒です。これを変更するには、時間の係数を調整します：

```js
// 2倍速の脈動
const scale = 1 + Math.sin(time * 2) * 0.2;

// 0.5倍速（ゆっくりした）脈動
const scale = 1 + Math.sin(time * 0.5) * 0.2;
```

---

## 6. 応用例：SphereGeometryとスケールアニメーションの拡張

`usecase-003` のコードをベースに、以下のような拡張が考えられます：

### 6-1. 球体のパラメータを変更する

```js
// より滑らかな球体
const geometry = new THREE.SphereGeometry(1, 64, 64);

// 半球
const geometry = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
```

### 6-2. 非均等なスケール変化

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  // X, Y軸は拡大、Z軸は縮小する脈動
  const scaleXY = 1 + Math.sin(time) * 0.2;
  const scaleZ = 1 - Math.sin(time) * 0.2;
  objects[0].scale.set(scaleXY, scaleXY, scaleZ);
  objects[0].rotation.y += deltaTime;
}
```

これにより、球体が呼吸するように前後に伸縮するアニメーションが実現できます。

### 6-3. 複数の周期を組み合わせる

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  // 2つの異なる周期の正弦波を組み合わせる
  const scale1 = Math.sin(time);
  const scale2 = Math.sin(time * 2.5);
  const scale = 1 + (scale1 + scale2) * 0.1;
  objects[0].scale.set(scale, scale, scale);
  objects[0].rotation.y += deltaTime;
}
```

複数の周期の正弦波を組み合わせることで、より複雑で自然な脈動パターンを作ることができます。

### 6-4. 色とスケールの連動

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  const scale = 1 + Math.sin(time) * 0.2;
  objects[0].scale.set(scale, scale, scale);
  
  // スケールに応じて色を変化させる
  const hue = 0.16 + (scale - 1) * 0.5; // 黄色から赤～緑の間で変化
  objects[0].material.color.setHSL(hue, 0.7, 0.5);
  
  objects[0].rotation.y += deltaTime;
}
```

スケールの値に応じて色相（hue）を変化させることで、拡大時と縮小時で色が変わる効果を追加できます。

---

## 7. スケールアニメーションの応用

`usecase-003` で学んだスケールアニメーションの手法は、様々な表現に応用できます：

### 7-1. 心臓の鼓動

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  // 鼓動のような不規則な脈動
  const beat = Math.pow(Math.sin(time * 1.5) * 0.5 + 0.5, 3);
  const scale = 1 + beat * 0.3;
  objects[0].scale.set(scale, scale, scale);
}
```

`Math.pow()` を使って正弦波を変形し、より鋭いピークを持つ脈動パターンを作ることで、心臓の鼓動のような効果を表現できます。

### 7-2. 呼吸するような動き

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  // 呼吸のようなゆっくりとした脈動
  const breath = Math.sin(time * 0.5) * 0.5 + 0.5;
  const scaleXZ = 1 + breath * 0.1;
  const scaleY = 1 - breath * 0.05;
  objects[0].scale.set(scaleXZ, scaleY, scaleXZ);
}
```

横方向に膨らみ、縦方向に縮むパターンで、生物の呼吸のような動きを表現できます。

### 7-3. 複数オブジェクトの連鎖的な脈動

```js
static setupScene(scene) {
  // 複数の球体を作成
  const objects = [];
  const geometries = [];
  
  for (let i = 0; i < 5; i++) {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    geometries.push(geometry);
    
    const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = i * 2 - 4;
    scene.add(mesh);
    objects.push(mesh);
  }
  
  return { objects, geometries };
}

static updateObjects(objects, time, deltaTime = 0.016) {
  // 連鎖的な脈動
  objects.forEach((obj, i) => {
    const offset = i * 0.5;
    const scale = 1 + Math.sin(time + offset) * 0.2;
    obj.scale.set(scale, scale, scale);
  });
}
```

複数のオブジェクトに時間差（オフセット）を付けた脈動を適用することで、波のように連鎖的に脈動するアニメーションを作ることができます。

---

## 8. まとめ

「**Usecase-003: Pulsing Sphere**」では、Three.jsの `SphereGeometry` を使って、サイズが周期的に変化する「脈動」アニメーションを実装しました。

主なポイントは以下の通りです：

1. **SphereGeometryの使用**: 球体を作成し、滑らかな曲面を持つ3Dオブジェクトの表現方法を学びました。
2. **スケールアニメーション**: `scale` プロパティと `Math.sin()` 関数を使って、オブジェクトのサイズを時間の関数として変化させる方法を学びました。
3. **均等なスケール変化**: X, Y, Z軸すべてに同じスケール値を適用することで、形状の比率を保ったまま拡大縮小する方法を学びました。
4. **サムネイル生成**: 球体を表現するSVGを作成し、ギャラリー表示に対応しました。

このサンプルは、Three.jsでのアニメーション表現の幅をさらに広げる重要な一歩となります。スケールアニメーションは、呼吸や鼓動、膨張や収縮など、様々な自然現象や物理的な動きを模倣するのに役立ちます。

---

## 9. 次のステップ

`usecase-003` を理解したら、次のステップとして以下のような発展が考えられます：

1. **複数のアニメーションを組み合わせる**: 位置、回転、スケールの変化を組み合わせて、より複雑なアニメーションを作成する。
2. **マテリアルの変更**: `MeshPhongMaterial` から `MeshStandardMaterial` や `MeshToonMaterial` などに変更し、異なる表現を試す。
3. **テクスチャの適用**: 球体に地球や惑星のテクスチャを適用し、より現実的な表現を実現する。
4. **ユーザーインタラクション**: マウスの位置や操作に応じて、脈動の速度や大きさを変化させる。

これらの発展は、今後のユースケースで順次紹介していく予定です。`usecase-003` で学んだスケールアニメーションの基本を応用することで、より高度な3D表現へと進んでいきましょう。
