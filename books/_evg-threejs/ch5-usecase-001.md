---
title: Usecase-001 Animated Icosahedron
---
# Usecase-001: Animated Icosahedron

**本章では、`usecases/usecase-001` ディレクトリに格納されている「Animated Icosahedron」のコードを解説します。**  
このサンプルは、緑色の二十面体（Icosahedron）が回転するシンプルなシーンですが、前章の「Basic Cube Spin」から一歩進んだ形状を使用しています。Three.jsが提供する様々なジオメトリの一つを活用する方法を学ぶ良い例となっています。

---

## 1. Icosahedronとは？

Icosahedron（二十面体）は、20個の正三角形の面を持つ正多面体です。Three.jsでは `THREE.IcosahedronGeometry` クラスとして実装されており、球体に近い形状でありながら、はっきりとした面と角を持つ特徴があります。

このジオメトリは以下のような特性を持ちます：
- 20個の正三角形の面
- 12個の頂点
- 30本のエッジ
- 各頂点から5本のエッジが伸びる

`usecase-001` では、このIcosahedronを使って、前章のキューブよりも複雑な形状を持つオブジェクトのアニメーションを実装しています。

---

## 2. `usecase-001/index.js` コード詳細

それでは、実際の `usecase-001` のコードを詳しく見ていきましょう。

```js
// usecase-001/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase001 extends UseCaseBase {
  static metadata = {
    id: "001",
    title: "Animated Icosahedron",
    description: "A rotating icosahedron with sharp edges",
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

    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return { objects: [mesh], geometries: [geometry] };
  }

  static updateObjects(objects, time, deltaTime = 0.016) {
    objects[0].rotation.y += deltaTime * 1.5;
  }

  async init() {
    const { objects } = GeometryShowcase001.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase001.updateObjects(
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
    // Create a simple SVG representation of a green icosahedron
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#111111"/>
        
        <!-- Icosahedron faces (simplified representation) -->
        <polygon points="100,60 130,90 110,130 90,130 70,90" fill="#00ff00" stroke="#ffffff" stroke-width="1"/>
        <polygon points="100,60 70,90 50,70 80,50" fill="#00dd00" stroke="#ffffff" stroke-width="1"/>
        <polygon points="100,60 80,50 120,50" fill="#00cc00" stroke="#ffffff" stroke-width="1"/>
        <polygon points="100,60 120,50 150,70 130,90" fill="#00bb00" stroke="#ffffff" stroke-width="1"/>
        <polygon points="90,130 110,130 100,150" fill="#009900" stroke="#ffffff" stroke-width="1"/>
      </svg>
    `;

    // Unicode-safe encoding
    const encodedSvg = unescape(encodeURIComponent(svgString));
    const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

    // Convert to Blob
    return fetch(dataURL).then((res) => res.blob());
  }

  static createPreview(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const { objects, geometries } = this.setupScene(scene);
    let time = 0;

    return {
      element: renderer.domElement,
      animate: () => {
        time += 0.016;
        this.updateObjects(objects, time);
        renderer.render(scene, camera);
      },
      dispose: () => {
        geometries.forEach((g) => g.dispose());
        objects.forEach((obj) => obj.material.dispose());
        renderer.dispose();
      },
    };
  }
}
```

### 2-1. `metadata`

```js
static metadata = {
  id: "001",
  title: "Animated Icosahedron",
  description: "A rotating icosahedron with sharp edges",
  categories: ["Geometry", "Animation"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `001`、 `title` は「Animated Icosahedron」など。
- `categories` は前章と同じく「Geometry」と「Animation」を指定。

### 2-2. `setupScene(scene)`

```js
static setupScene(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(ambientLight, directionalLight);

  const geometry = new THREE.IcosahedronGeometry(1, 0);
  const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return { objects: [mesh], geometries: [geometry] };
}
```

ここで前章の `usecase-000` との主な違いは以下の点です：

1. **ジオメトリの変更**:
   ```js
   // usecase-000
   const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
   
   // usecase-001
   const geometry = new THREE.IcosahedronGeometry(1, 0);
   ```
   
   `THREE.IcosahedronGeometry` の引数は以下の通りです：
   - 第1引数: 半径（この場合は1）
   - 第2引数: 詳細度（0は基本的な二十面体、数値が大きくなるほど球体に近づく）

2. **マテリアルの色**:
   ```js
   // usecase-000
   const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
   
   // usecase-001
   const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
   ```
   
   赤色（`0xff0000`）から緑色（`0x00ff00`）に変更されています。

### 2-3. `updateObjects(objects, time, deltaTime)`

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].rotation.y += deltaTime * 1.5;
}
```

前章の `usecase-000` では、X軸とY軸の両方で回転していましたが、ここではY軸のみの回転に変更されています：

```js
// usecase-000
objects[0].rotation.x += deltaTime;
objects[0].rotation.y += deltaTime;

// usecase-001
objects[0].rotation.y += deltaTime * 1.5;
```

また、回転速度が1.5倍に増加しています（`deltaTime * 1.5`）。これにより、二十面体はキューブよりも少し速く回転します。

### 2-4. `getThumbnailBlob()`

```js
static getThumbnailBlob() {
  // Create a simple SVG representation of a green icosahedron
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#111111"/>
      
      <!-- Icosahedron faces (simplified representation) -->
      <polygon points="100,60 130,90 110,130 90,130 70,90" fill="#00ff00" stroke="#ffffff" stroke-width="1"/>
      <polygon points="100,60 70,90 50,70 80,50" fill="#00dd00" stroke="#ffffff" stroke-width="1"/>
      <polygon points="100,60 80,50 120,50" fill="#00cc00" stroke="#ffffff" stroke-width="1"/>
      <polygon points="100,60 120,50 150,70 130,90" fill="#00bb00" stroke="#ffffff" stroke-width="1"/>
      <polygon points="90,130 110,130 100,150" fill="#009900" stroke="#ffffff" stroke-width="1"/>
    </svg>
  `;

  // Unicode-safe encoding
  const encodedSvg = unescape(encodeURIComponent(svgString));
  const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

  // Convert to Blob
  return fetch(dataURL).then((res) => res.blob());
}
```

サムネイル生成用のSVGが、二十面体を表現するように変更されています。実際の二十面体は20面ありますが、サムネイルでは簡略化して5つの多角形で表現しています。また、面ごとに少しずつ色の濃さを変えることで、立体感を出しています。

---

## 3. `usecase-000` との比較

`usecase-001` は `usecase-000` と基本的な構造は同じですが、以下の点が異なります：

1. **ジオメトリ**: BoxGeometry から IcosahedronGeometry に変更
2. **色**: 赤色から緑色に変更
3. **回転**: X軸とY軸の両方から、Y軸のみの回転に変更
4. **回転速度**: 標準速度から1.5倍速に変更
5. **サムネイル**: キューブから二十面体を表現するSVGに変更

これらの変更は、Three.jsの様々なジオメトリを試す最初のステップとして適切です。同じ基本構造を保ちながら、異なるジオメトリを使用することで、Three.jsが提供する多様な3Dオブジェクトの表現力を理解することができます。

---

## 4. IcosahedronGeometryの詳細パラメータ

`THREE.IcosahedronGeometry` のコンストラクタは以下の形式を取ります：

```js
new THREE.IcosahedronGeometry(radius, detail);
```

- **radius**: オブジェクトの半径（デフォルト: 1）
- **detail**: 細分化レベル（デフォルト: 0）
  - 0: 基本的な二十面体（20面）
  - 1以上: 各面をさらに細分化し、より球体に近づく

詳細度を上げると、以下のような変化が起こります：

```js
// 基本的な二十面体（20面）
const geometry0 = new THREE.IcosahedronGeometry(1, 0);

// 細分化された二十面体（80面）
const geometry1 = new THREE.IcosahedronGeometry(1, 1);

// さらに細分化（320面）
const geometry2 = new THREE.IcosahedronGeometry(1, 2);
```

詳細度を上げるほど滑らかな見た目になりますが、その分処理負荷も高くなります。用途に応じて適切な詳細度を選ぶことが重要です。

---

## 5. 応用例：IcosahedronGeometryの拡張

`usecase-001` のコードをベースに、以下のような拡張が考えられます：

### 5-1. 詳細度を変更する

```js
// 詳細度を1に上げて、より滑らかな二十面体にする
const geometry = new THREE.IcosahedronGeometry(1, 1);
```

### 5-2. ワイヤーフレーム表示にする

```js
const material = new THREE.MeshPhongMaterial({ 
  color: 0x00ff00,
  wireframe: true 
});
```

これにより、面が塗りつぶされず、エッジのみが表示されるワイヤーフレームモデルになります。

### 5-3. 複数の回転軸を組み合わせる

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].rotation.x += deltaTime * 0.5;
  objects[0].rotation.y += deltaTime * 1.0;
  objects[0].rotation.z += deltaTime * 0.3;
}
```

X、Y、Z軸それぞれに異なる速度で回転を加えることで、より複雑な動きを実現できます。

### 5-4. サイズを脈動させる

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].rotation.y += deltaTime * 1.5;
  
  // サイズを時間に応じて変化させる
  const scale = 1 + Math.sin(time * 2) * 0.2; // 0.8～1.2の間で変動
  objects[0].scale.set(scale, scale, scale);
}
```

`Math.sin()` を使って周期的にサイズを変化させることで、脈動するような効果を追加できます。

---

## 6. Three.jsの他のジオメトリとの関係

Three.jsには多くの基本ジオメトリが用意されています。`usecase-000` の `BoxGeometry` と `usecase-001` の `IcosahedronGeometry` はその一部です。他にも以下のようなジオメトリがあります：

- **SphereGeometry**: 球体
- **CylinderGeometry**: 円柱
- **ConeGeometry**: 円錐
- **TorusGeometry**: ドーナツ形状
- **PlaneGeometry**: 平面
- **TetrahedronGeometry**: 四面体
- **OctahedronGeometry**: 八面体
- **DodecahedronGeometry**: 十二面体

これらのジオメトリを使い分けることで、様々な3Dオブジェクトを表現できます。`usecase-001` で学んだ手法は、これらの他のジオメトリにも同様に適用できます。

---

## 7. まとめ

「**Usecase-001: Animated Icosahedron**」では、Three.jsの `IcosahedronGeometry` を使って、前章の立方体よりも複雑な形状を持つオブジェクトのアニメーションを実装しました。

主なポイントは以下の通りです：

1. **IcosahedronGeometryの使用**: 二十面体を作成し、基本的な3Dオブジェクトの表現方法を学びました。
2. **回転アニメーション**: Y軸回りの回転を実装し、前章よりも速い回転速度を設定しました。
3. **色の変更**: 赤色から緑色に変更し、異なるビジュアル表現を実現しました。
4. **サムネイル生成**: 二十面体を表現するSVGを作成し、ギャラリー表示に対応しました。

このサンプルは、Three.jsの基本的なジオメトリを使いこなすための第一歩となります。今後のユースケースでは、より複雑な形状や、複数のオブジェクトの組み合わせ、インタラクティブな要素などを追加していくことで、Three.jsの表現力をさらに深く探求していきます。

---

## 8. 次のステップ

`usecase-001` を理解したら、次のステップとして以下のような発展が考えられます：

1. **複数のIcosahedronを配置**: 異なるサイズや色の二十面体を複数配置し、それぞれに異なる回転を適用する。
2. **マテリアルの変更**: `MeshPhongMaterial` から `MeshStandardMaterial` や `MeshToonMaterial` などに変更し、異なる表現を試す。
3. **テクスチャの適用**: 二十面体に画像テクスチャを適用し、より複雑な表面表現を実現する。
4. **ユーザーインタラクション**: マウス操作で回転速度や方向を変更できるようにする。

これらの発展は、今後のユースケースで順次紹介していく予定です。`usecase-001` で学んだ基本を応用することで、より高度な3D表現へと進んでいきましょう。
