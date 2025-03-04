---
title: Usecase-024 Cup-like Object
---
# Usecase-024: Cup-like Object

**本章では、`usecases/usecase-024` ディレクトリに格納されている「Cup-like Object」のコードを解説します。**  
このサンプルは、円柱ジオメトリを変形させてコップ風のオブジェクトを作成しています。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、ジオメトリの頂点を直接操作してカスタム形状を作成する例となっています。

---

## 1. コップ風オブジェクトの作成

これまでのユースケースでは、様々な形状とアニメーション効果を扱ってきました。`usecase-024` では、基本的な円柱ジオメトリを変形させて、コップのような形状を作成しています。

このサンプルでは、以下の手順でコップ風オブジェクトを作成しています：
1. 基本の円柱ジオメトリを作成（上下の蓋を開けた状態）
2. 上部の頂点を特定し、スケールダウンして口が狭くなるように変形
3. 底面と上面を別途作成し、メインの円柱と結合
4. 半透明のガラス風マテリアルを適用

これにより、シンプルながらも現実的なコップの形状を実現しています。

`usecase-024` では、以下の特徴を持つシーンを作成しています：

1. **カスタムジオメトリ**: 頂点を直接操作して作成したコップ形状
2. **ジオメトリの結合**: 複数のジオメトリを結合して一つのメッシュを作成
3. **ガラス風マテリアル**: 半透明で光沢のあるマテリアル
4. **アニメーション**: コップの回転と傾きのアニメーション

これらの技術を組み合わせることで、基本的なプリミティブから複雑な形状を作成する方法を示しています。

---

## 2. `usecase-024/index.js` コード詳細

それでは、実際の `usecase-024` のコードを詳しく見ていきましょう。

```js
// usecase-024/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase024 extends UseCaseBase {
  static metadata = {
    id: "024",
    title: "Cup-like Object",
    description:
      "円柱を作り、上端だけスケールダウンしてコップ風オブジェクトを作成",
    categories: ["Geometry", "Modification", "Custom"],
  };

  constructor(scene) {
    super(scene);
    this.objects = new Set();
    this.time = 0;
    this.rotationSpeed = 0.5;
  }

  static setupScene(scene) {
    // 背景色を設定
    scene.background = new THREE.Color(0x222222);

    const objects = [];
    const geometries = [];

    // 環境光を追加
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    objects.push(ambientLight);

    // メインの光源
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    objects.push(directionalLight);

    // 反対側からの光源
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-5, 3, -5);
    scene.add(backLight);
    objects.push(backLight);

    // コップのジオメトリを作成
    const cupGeometry = this.createCupGeometry(1, 2, 32);
    geometries.push(cupGeometry);

    // マテリアルを作成（半透明のガラス風）
    const cupMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      side: THREE.DoubleSide,
    });

    // コップのメッシュを作成
    const cup = new THREE.Mesh(cupGeometry, cupMaterial);
    cup.castShadow = true;
    cup.receiveShadow = true;
    scene.add(cup);
    objects.push(cup);

    // 床を追加
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    geometries.push(floorGeometry);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    scene.add(floor);
    objects.push(floor);

    return { objects, geometries, cup };
  }

  // コップ形状のカスタムジオメトリを作成するメソッド
  static createCupGeometry(radius, height, segments) {
    // 基本の円柱ジオメトリを作成
    const cylinderGeometry = new THREE.CylinderGeometry(
      radius, // 上部の半径
      radius, // 下部の半径
      height, // 高さ
      segments, // 円周の分割数
      1, // 高さ方向の分割数
      true // 上下の蓋を開ける
    );

    // 上部の頂点をスケールダウンするための係数
    const topScaleFactor = 0.7;

    // 頂点位置を取得
    const positions = cylinderGeometry.attributes.position.array;

    // 上部の頂点を特定してスケールダウン
    for (let i = 0; i < positions.length; i += 3) {
      // Y座標が上部（高さの半分）に近い頂点を特定
      if (positions[i + 1] > height / 2 - 0.01) {
        // X座標とZ座標をスケールダウン
        positions[i] *= topScaleFactor; // X
        positions[i + 2] *= topScaleFactor; // Z
      }
    }

    // 法線を再計算
    cylinderGeometry.computeVertexNormals();

    // 底面を追加
    const bottomGeometry = new THREE.CircleGeometry(radius, segments);
    bottomGeometry.rotateX(Math.PI / 2);
    bottomGeometry.translate(0, -height / 2, 0);

    // 上面を追加（スケールダウンした半径で）
    const topGeometry = new THREE.CircleGeometry(
      radius * topScaleFactor,
      segments
    );
    topGeometry.rotateX(-Math.PI / 2);
    topGeometry.translate(0, height / 2, 0);

    // ジオメトリをマージ
    const mergedGeometry = this.mergeGeometries([
      cylinderGeometry,
      bottomGeometry,
      topGeometry,
    ]);

    return mergedGeometry;
  }

  // ジオメトリをマージするヘルパーメソッド
  static mergeGeometries(geometries) {
    const mergedGeometry = new THREE.BufferGeometry();

    let vertexCount = 0;
    let indexCount = 0;

    // 頂点数とインデックス数を計算
    geometries.forEach((geometry) => {
      vertexCount += geometry.attributes.position.count;
      if (geometry.index) {
        indexCount += geometry.index.count;
      }
    });

    // 新しい配列を作成
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    let indices = null;

    if (indexCount > 0) {
      // インデックスの型を決定（頂点数に応じて）
      const indexType = vertexCount > 65535 ? Uint32Array : Uint16Array;
      indices = new indexType(indexCount);
    }

    let vertexOffset = 0;
    let indexOffset = 0;

    // 各ジオメトリのデータをマージ
    geometries.forEach((geometry) => {
      const positionAttr = geometry.attributes.position;
      const normalAttr = geometry.attributes.normal;
      const uvAttr = geometry.attributes.uv;
      const index = geometry.index;

      // 頂点位置をコピー
      for (let i = 0; i < positionAttr.count; i++) {
        positions[(vertexOffset + i) * 3] = positionAttr.array[i * 3];
        positions[(vertexOffset + i) * 3 + 1] = positionAttr.array[i * 3 + 1];
        positions[(vertexOffset + i) * 3 + 2] = positionAttr.array[i * 3 + 2];
      }

      // 法線をコピー
      if (normalAttr) {
        for (let i = 0; i < normalAttr.count; i++) {
          normals[(vertexOffset + i) * 3] = normalAttr.array[i * 3];
          normals[(vertexOffset + i) * 3 + 1] = normalAttr.array[i * 3 + 1];
          normals[(vertexOffset + i) * 3 + 2] = normalAttr.array[i * 3 + 2];
        }
      }

      // UVをコピー
      if (uvAttr) {
        for (let i = 0; i < uvAttr.count; i++) {
          uvs[(vertexOffset + i) * 2] = uvAttr.array[i * 2];
          uvs[(vertexOffset + i) * 2 + 1] = uvAttr.array[i * 2 + 1];
        }
      }

      // インデックスをコピー（頂点オフセットを加算）
      if (index) {
        for (let i = 0; i < index.count; i++) {
          indices[indexOffset + i] = index.array[i] + vertexOffset;
        }
        indexOffset += index.count;
      }

      vertexOffset += positionAttr.count;
    });

    // 属性を設定
    mergedGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    mergedGeometry.setAttribute(
      "normal",
      new THREE.BufferAttribute(normals, 3)
    );
    mergedGeometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    if (indices) {
      mergedGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
    }

    return mergedGeometry;
  }

  static updateObjects(
    objects,
    time = 0,
    mousePos = { x: 0, y: 0 },
    params = {}
  ) {
    const { cup } = params;

    if (cup) {
      // コップを回転
      cup.rotation.y = time * 0.5;

      // 少し傾ける
      cup.rotation.x = Math.sin(time * 0.3) * 0.2;
      cup.rotation.z = Math.cos(time * 0.2) * 0.1;
    }
  }

  async init() {
    const { objects, cup } = GeometryShowcase024.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
    this.cup = cup;
  }

  update(deltaTime) {
    this.time += deltaTime * this.rotationSpeed;

    GeometryShowcase024.updateObjects(
      Array.from(this.objects),
      this.time,
      { x: 0, y: 0 },
      { cup: this.cup }
    );
  }

  static getThumbnailCameraPosition() {
    return {
      position: [3, 2, 3],
      target: [0, 0, 0],
    };
  }

  // getThumbnailBlob と createPreview メソッドは省略
}
```

### 2-1. `metadata`

```js
static metadata = {
  id: "024",
  title: "Cup-like Object",
  description:
    "円柱を作り、上端だけスケールダウンしてコップ風オブジェクトを作成",
  categories: ["Geometry", "Modification", "Custom"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `024`、 `title` は「Cup-like Object」など。
- `description` には、円柱を作り、上端だけスケールダウンしてコップ風オブジェクトを作成することについて言及されています。
- `categories` に「Modification」と「Custom」が追加されており、ジオメトリの変形とカスタム形状の作成をテーマにしていることを示しています。

### 2-2. `setupScene(scene)`

```js
static setupScene(scene) {
  // 背景色を設定
  scene.background = new THREE.Color(0x222222);

  const objects = [];
  const geometries = [];

  // 環境光を追加
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  objects.push(ambientLight);

  // メインの光源
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  objects.push(directionalLight);

  // 反対側からの光源
  const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
  backLight.position.set(-5, 3, -5);
  scene.add(backLight);
  objects.push(backLight);

  // コップのジオメトリを作成
  const cupGeometry = this.createCupGeometry(1, 2, 32);
  geometries.push(cupGeometry);

  // マテリアルを作成（半透明のガラス風）
  const cupMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide,
  });

  // コップのメッシュを作成
  const cup = new THREE.Mesh(cupGeometry, cupMaterial);
  cup.castShadow = true;
  cup.receiveShadow = true;
  scene.add(cup);
  objects.push(cup);

  // 床を追加
  const floorGeometry = new THREE.PlaneGeometry(10, 10);
  geometries.push(floorGeometry);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.8,
    metalness: 0.2,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = Math.PI / 2;
  floor.position.y = -2;
  floor.receiveShadow = true;
  scene.add(floor);
  objects.push(floor);

  return { objects, geometries, cup };
}
```

ここでは、シーンのセットアップを行っています。主な特徴は以下の通りです：

1. **コップのジオメトリ作成**:
   ```js
   const cupGeometry = this.createCupGeometry(1, 2, 32);
   ```
   
   カスタムメソッド `createCupGeometry` を使用して、コップ形状のジオメトリを作成しています。パラメータは半径、高さ、分割数です。

2. **ガラス風マテリアル**:
   ```js
   const cupMaterial = new THREE.MeshPhysicalMaterial({
     color: 0x88ccff,
     transparent: true,
     opacity: 0.6,
     roughness: 0.1,
     metalness: 0.1,
     clearcoat: 1.0,
     clearcoatRoughness: 0.1,
     side: THREE.DoubleSide,
   });
   ```
   
   `MeshPhysicalMaterial` を使用して、半透明のガラス風マテリアルを作成しています。`clearcoat` パラメータを使用して、表面に光沢を追加しています。

### 2-3. `createCupGeometry(radius, height, segments)`

```js
static createCupGeometry(radius, height, segments) {
  // 基本の円柱ジオメトリを作成
  const cylinderGeometry = new THREE.CylinderGeometry(
    radius, // 上部の半径
    radius, // 下部の半径
    height, // 高さ
    segments, // 円周の分割数
    1, // 高さ方向の分割数
    true // 上下の蓋を開ける
  );

  // 上部の頂点をスケールダウンするための係数
  const topScaleFactor = 0.7;

  // 頂点位置を取得
  const positions = cylinderGeometry.attributes.position.array;

  // 上部の頂点を特定してスケールダウン
  for (let i = 0; i < positions.length; i += 3) {
    // Y座標が上部（高さの半分）に近い頂点を特定
    if (positions[i + 1] > height / 2 - 0.01) {
      // X座標とZ座標をスケールダウン
      positions[i] *= topScaleFactor; // X
      positions[i + 2] *= topScaleFactor; // Z
    }
  }

  // 法線を再計算
  cylinderGeometry.computeVertexNormals();

  // 底面を追加
  const bottomGeometry = new THREE.CircleGeometry(radius, segments);
  bottomGeometry.rotateX(Math.PI / 2);
  bottomGeometry.translate(0, -height / 2, 0);

  // 上面を追加（スケールダウンした半径で）
  const topGeometry = new THREE.CircleGeometry(
    radius * topScaleFactor,
    segments
  );
  topGeometry.rotateX(-Math.PI / 2);
  topGeometry.translate(0, height / 2, 0);

  // ジオメトリをマージ
  const mergedGeometry = this.mergeGeometries([
    cylinderGeometry,
    bottomGeometry,
    topGeometry,
  ]);

  return mergedGeometry;
}
```

このメソッドは、コップ形状のカスタムジオメトリを作成します。主な手順は以下の通りです：

1. **基本の円柱ジオメトリを作成**:
   ```js
   const cylinderGeometry = new THREE.CylinderGeometry(
     radius, // 上部の半径
     radius, // 下部の半径
     height, // 高さ
     segments, // 円周の分割数
     1, // 高さ方向の分割数
     true // 上下の蓋を開ける
   );
   ```
   
   まず、基本の円柱ジオメトリを作成します。上下の半径は同じで、上下の蓋は開けた状態（`true`）にしています。

2. **上部の頂点をスケールダウン**:
   ```js
   // 上部の頂点をスケールダウンするための係数
   const topScaleFactor = 0.7;

   // 頂点位置を取得
   const positions = cylinderGeometry.attributes.position.array;

   // 上部の頂点を特定してスケールダウン
   for (let i = 0; i < positions.length; i += 3) {
     // Y座標が上部（高さの半分）に近い頂点を特定
     if (positions[i + 1] > height / 2 - 0.01) {
       // X座標とZ座標をスケールダウン
       positions[i] *= topScaleFactor; // X
       positions[i + 2] *= topScaleFactor; // Z
     }
   }

   // 法線を再計算
   cylinderGeometry.computeVertexNormals();
   ```
   
   円柱の上部の頂点を特定し、X座標とZ座標をスケールダウンすることで、上部が狭くなるようにしています。頂点の位置を変更した後は、法線を再計算して正しい光の反射を確保しています。

3. **底面と上面を追加**:
   ```js
   // 底面を追加
   const bottomGeometry = new THREE.CircleGeometry(radius, segments);
   bottomGeometry.rotateX(Math.PI / 2);
   bottomGeometry.translate(0, -height / 2, 0);

   // 上面を追加（スケールダウンした半径で）
   const topGeometry = new THREE.CircleGeometry(
     radius * topScaleFactor,
     segments
   );
   topGeometry.rotateX(-Math.PI / 2);
   topGeometry.translate(0, height / 2, 0);
   ```
   
   円柱の上下の蓋を別途作成しています。底面は元の半径で、上面はスケールダウンした半径で作成しています。それぞれ適切な向きに回転させ、位置を調整しています。

4. **ジオメトリをマージ**:
   ```js
   // ジオメトリをマージ
   const mergedGeometry = this.mergeGeometries([
     cylinderGeometry,
     bottomGeometry,
     topGeometry,
   ]);
   ```
   
   最後に、円柱本体、底面、上面の3つのジオメトリをマージして、一つのジオメトリにしています。

### 2-4. `mergeGeometries(geometries)`

```js
static mergeGeometries(geometries) {
  const mergedGeometry = new THREE.BufferGeometry();

  let vertexCount = 0;
  let indexCount = 0;

  // 頂点数とインデックス数を計算
  geometries.forEach((geometry) => {
    vertexCount += geometry.attributes.position.count;
    if (geometry.index) {
      indexCount += geometry.index.count;
    }
  });

  // 新しい配列を作成
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  let indices = null;

  if (indexCount > 0) {
    // インデックスの型を決定（頂点数に応じて）
    const indexType = vertexCount > 65535 ? Uint32Array : Uint16Array;
    indices = new indexType(indexCount);
  }

  let vertexOffset = 0;
  let indexOffset = 0;

  // 各ジオメトリのデータをマージ
  geometries.forEach((geometry) => {
    const positionAttr = geometry.attributes.position;
    const normalAttr = geometry.attributes.normal;
    const uvAttr = geometry.attributes.uv;
    const index = geometry.index;

    // 頂点位置をコピー
    for (let i = 0; i < positionAttr.count; i++) {
      positions[(vertexOffset + i) * 3] = positionAttr.array[i * 3];
      positions[(vertexOffset + i) * 3 + 1] = positionAttr.array[i * 3 + 1];
      positions[(vertexOffset + i) * 3 + 2] = positionAttr.array[i * 3 + 2];
    }

    // 法線をコピー
    if (normalAttr) {
      for (let i = 0; i < normalAttr.count; i++) {
        normals[(vertexOffset + i) * 3] = normalAttr.array[i * 3];
        normals[(vertexOffset + i) * 3 + 1] = normalAttr.array[i * 3 + 1];
        normals[(vertexOffset + i) * 3 + 2] = normalAttr.array[i * 3 + 2];
      }
    }

    // UVをコピー
    if (uvAttr) {
      for (let i = 0; i < uvAttr.count; i++) {
        uvs[(vertexOffset + i) * 2] = uvAttr.array[i * 2];
        uvs[(vertexOffset + i) * 2 + 1] = uvAttr.array[i * 2 + 1];
      }
    }

    // インデックスをコピー（頂点オフセットを加算）
    if (index) {
      for (let i = 0; i < index.count; i++) {
        indices[indexOffset + i] = index.array[i] + vertexOffset;
      }
      indexOffset += index.count;
    }

    vertexOffset += positionAttr.count;
  });

  // 属性を設定
  mergedGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  mergedGeometry.setAttribute(
    "normal",
    new THREE.BufferAttribute(normals, 3)
  );
  mergedGeometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

  if (indices) {
    mergedGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
  }

  return mergedGeometry;
}
```

このメソッドは、複数のジオメトリを一つのジオメトリにマージするためのヘルパーメソッドです。主な手順は以下の通りです：

1. **頂点数とインデックス数の計算**:
   ```js
   let vertexCount = 0;
   let indexCount = 0;

   // 頂点数とインデックス数を計算
   geometries.forEach((geometry) => {
     vertexCount += geometry.attributes.position.count;
     if (geometry.index) {
       indexCount += geometry.index.count;
     }
   });
   ```
   
   まず、マージするジオメトリの総頂点数とインデックス数を計算します。

2. **新しい配列の作成**:
   ```js
   // 新しい配列を作成
   const positions = new Float32Array(vertexCount * 3);
   const normals = new Float32Array(vertexCount * 3);
   const uvs = new Float32Array(vertexCount * 2);
   let indices = null;

   if (indexCount > 0) {
     // インデックスの型を決定（頂点数に応じて）
     const indexType = vertexCount > 65535 ? Uint32Array : Uint16Array;
     indices = new indexType(indexCount);
   }
   ```
   
   マージされたジオメトリ用の新しい配列を作成します。頂点位置、法線、UV座標、インデックスのための配列を用意します。

3. **各ジオメトリのデータをマージ**:
   ```js
   let vertexOffset = 0;
   let indexOffset = 0;

   // 各ジオメトリのデータをマージ
   geometries.forEach((geometry) => {
     const positionAttr = geometry.attributes.position;
     const normalAttr = geometry.attributes.normal;
     const uvAttr = geometry.attributes.uv;
     const index = geometry.index;

     // 頂点位置をコピー
     // ...

     // 法線をコピー
     // ...

     // UVをコピー
     // ...

     // インデックスをコピー（頂点オフセットを加算）
     // ...

     vertexOffset += positionAttr.count;
   });
   ```
   
   各ジオメトリのデータを新しい配列にコピーします。インデックスをコピーする際は、頂点オフセットを加算して、正しい頂点を参照するようにします。

4. **属性の設定**:
   ```js
   // 属性を設定
   mergedGeometry.setAttribute(
     "position",
     new THREE.BufferAttribute(positions, 3)
   );
   mergedGeometry.setAttribute(
     "normal",
     new THREE.BufferAttribute(normals, 3)
   );
   mergedGeometry.setAttribute(
     "position",
     new THREE.BufferAttribute(positions, 3)
   );
   mergedGeometry.setAttribute(
     "normal",
     new THREE.BufferAttribute(normals, 3)
   );
   mergedGeometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

   if (indices) {
     mergedGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
   }

   return mergedGeometry;
}
```

このメソッドは、複数のジオメトリを一つのジオメトリにマージするためのヘルパーメソッドです。主な手順は以下の通りです：

1. **頂点数とインデックス数の計算**:
   ```js
   let vertexCount = 0;
   let indexCount = 0;

   // 頂点数とインデックス数を計算
   geometries.forEach((geometry) => {
     vertexCount += geometry.attributes.position.count;
     if (geometry.index) {
       indexCount += geometry.index.count;
     }
   });
   ```
   
   まず、マージするジオメトリの総頂点数とインデックス数を計算します。

2. **新しい配列の作成**:
   ```js
   // 新しい配列を作成
   const positions = new Float32Array(vertexCount * 3);
   const normals = new Float32Array(vertexCount * 3);
   const uvs = new Float32Array(vertexCount * 2);
   let indices = null;

   if (indexCount > 0) {
     // インデックスの型を決定（頂点数に応じて）
     const indexType = vertexCount > 65535 ? Uint32Array : Uint16Array;
     indices = new indexType(indexCount);
   }
   ```
   
   マージされたジオメトリ用の新しい配列を作成します。頂点位置、法線、UV座標、インデックスのための配列を用意します。

3. **各ジオメトリのデータをマージ**:
   ```js
   let vertexOffset = 0;
   let indexOffset = 0;

   // 各ジオメトリのデータをマージ
   geometries.forEach((geometry) => {
     const positionAttr = geometry.attributes.position;
     const normalAttr = geometry.attributes.normal;
     const uvAttr = geometry.attributes.uv;
     const index = geometry.index;

     // 頂点位置をコピー
     for (let i = 0; i < positionAttr.count; i++) {
       positions[(vertexOffset + i) * 3] = positionAttr.array[i * 3];
       positions[(vertexOffset + i) * 3 + 1] = positionAttr.array[i * 3 + 1];
       positions[(vertexOffset + i) * 3 + 2] = positionAttr.array[i * 3 + 2];
     }

     // 法線をコピー
     if (normalAttr) {
       for (let i = 0; i < normalAttr.count; i++) {
         normals[(vertexOffset + i) * 3] = normalAttr.array[i * 3];
         normals[(vertexOffset + i) * 3 + 1] = normalAttr.array[i * 3 + 1];
         normals[(vertexOffset + i) * 3 + 2] = normalAttr.array[i * 3 + 2];
       }
     }

     // UVをコピー
     if (uvAttr) {
       for (let i = 0; i < uvAttr.count; i++) {
         uvs[(vertexOffset + i) * 2] = uvAttr.array[i * 2];
         uvs[(vertexOffset + i) * 2 + 1] = uvAttr.array[i * 2 + 1];
       }
     }

     // インデックスをコピー（頂点オフセットを加算）
     if (index) {
       for (let i = 0; i < index.count; i++) {
         indices[indexOffset + i] = index.array[i] + vertexOffset;
       }
       indexOffset += index.count;
     }

     vertexOffset += positionAttr.count;
   });
   ```
   
   各ジオメトリのデータを新しい配列にコピーします。インデックスをコピーする際は、頂点オフセットを加算して、正しい頂点を参照するようにします。

4. **属性の設定**:
   ```js
   // 属性を設定
   mergedGeometry.setAttribute(
     "position",
     new THREE.BufferAttribute(positions, 3)
   );
   mergedGeometry.setAttribute(
     "normal",
     new THREE.BufferAttribute(normals, 3)
   );
   mergedGeometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

   if (indices) {
     mergedGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
   }
   ```
   
   マージされたデータを使用して、新しいジオメトリの属性を設定します。

### 2-5. `updateObjects(objects, time, mousePos, params)`

```js
static updateObjects(
  objects,
  time = 0,
  mousePos = { x: 0, y: 0 },
  params = {}
) {
  const { cup } = params;

  if (cup) {
    // コップを回転
    cup.rotation.y = time * 0.5;

    // 少し傾ける
    cup.rotation.x = Math.sin(time * 0.3) * 0.2;
    cup.rotation.z = Math.cos(time * 0.2) * 0.1;
  }
}
```

このメソッドでは、コップのアニメーションを更新しています。主な特徴は以下の通りです：

1. **コップの回転**:
   ```js
   cup.rotation.y = time * 0.5;
   ```
   
   コップをY軸周りに一定速度で回転させています。

2. **コップの傾き**:
   ```js
   cup.rotation.x = Math.sin(time * 0.3) * 0.2;
   cup.rotation.z = Math.cos(time * 0.2) * 0.1;
   ```
   
   正弦波と余弦波を使用して、コップをX軸とZ軸周りに微妙に傾けています。これにより、コップが揺れるような動きが生まれます。

### 2-6. `init()`

```js
async init() {
  const { objects, cup } = GeometryShowcase024.setupScene(this.scene);
  objects.forEach((obj) => this.objects.add(obj));
  this.cup = cup;
}
```

`init` メソッドでは、シーンのセットアップを行い、コップのオブジェクトを保存しています。

### 2-7. `update(deltaTime)`

```js
update(deltaTime) {
  this.time += deltaTime * this.rotationSpeed;

  GeometryShowcase024.updateObjects(
    Array.from(this.objects),
    this.time,
    { x: 0, y: 0 },
    { cup: this.cup }
  );
}
```

`update` メソッドでは、時間を更新し、`updateObjects` メソッドを呼び出してコップのアニメーションを更新しています。

---

## 3. カスタムジオメトリの作成

`usecase-024` では、基本的な円柱ジオメトリを変形させて、コップのような形状を作成しています。この手法は、Three.jsの基本的なプリミティブを使用して、より複雑な形状を作成する方法を示しています。

### 3-1. 頂点の直接操作

```js
// 上部の頂点をスケールダウンするための係数
const topScaleFactor = 0.7;

// 頂点位置を取得
const positions = cylinderGeometry.attributes.position.array;

// 上部の頂点を特定してスケールダウン
for (let i = 0; i < positions.length; i += 3) {
  // Y座標が上部（高さの半分）に近い頂点を特定
  if (positions[i + 1] > height / 2 - 0.01) {
    // X座標とZ座標をスケールダウン
    positions[i] *= topScaleFactor; // X
    positions[i + 2] *= topScaleFactor; // Z
  }
}

// 法線を再計算
cylinderGeometry.computeVertexNormals();
```

このコードでは、円柱の上部の頂点を特定し、X座標とZ座標をスケールダウンしています。これにより、上部が狭くなるコップのような形状が作成されます。頂点の位置を変更した後は、法線を再計算して正しい光の反射を確保しています。

### 3-2. 複数のジオメトリの結合

```js
// 底面を追加
const bottomGeometry = new THREE.CircleGeometry(radius, segments);
bottomGeometry.rotateX(Math.PI / 2);
bottomGeometry.translate(0, -height / 2, 0);

// 上面を追加（スケールダウンした半径で）
const topGeometry = new THREE.CircleGeometry(
  radius * topScaleFactor,
  segments
);
topGeometry.rotateX(-Math.PI / 2);
topGeometry.translate(0, height / 2, 0);

// ジオメトリをマージ
const mergedGeometry = this.mergeGeometries([
  cylinderGeometry,
  bottomGeometry,
  topGeometry,
]);
```

このコードでは、変形した円柱に加えて、底面と上面を別途作成し、それらをマージしています。底面は元の半径で、上面はスケールダウンした半径で作成されています。これにより、完全なコップの形状が作成されます。

### 3-3. ガラス風マテリアル

```js
// マテリアルを作成（半透明のガラス風）
const cupMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x88ccff,
  transparent: true,
  opacity: 0.6,
  roughness: 0.1,
  metalness: 0.1,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  side: THREE.DoubleSide,
});
```

このコードでは、`MeshPhysicalMaterial`を使用して、半透明のガラス風マテリアルを作成しています。主なパラメータは以下の通りです：

- `color: 0x88ccff`: 薄い青色
- `transparent: true, opacity: 0.6`: 半透明
- `roughness: 0.1, metalness: 0.1`: 滑らかで非金属的な表面
- `clearcoat: 1.0, clearcoatRoughness: 0.1`: 表面に光沢を追加
- `side: THREE.DoubleSide`: 両面を描画

これらのパラメータを組み合わせることで、ガラスのような質感を実現しています。

---

## 4. まとめ

「**Usecase-024: Cup-like Object**」では、Three.jsでカスタムジオメトリを作成する方法を学びました。

主なポイントは以下の通りです：

1. **頂点の直接操作**: 基本的なジオメトリの頂点を直接操作して、カスタム形状を作成する方法を学びました。
2. **複数のジオメトリの結合**: 複数のジオメトリを結合して、より複雑な形状を作成する方法を学びました。
3. **ガラス風マテリアル**: `MeshPhysicalMaterial`を使用して、半透明のガラス風マテリアルを作成する方法を学びました。
4. **アニメーション**: 正弦波と余弦波を使用して、自然な揺れるようなアニメーションを作成する方法を学びました。

これらの技術を組み合わせることで、基本的なプリミティブから複雑な形状を作成し、リアルな質感とアニメーションを追加することができます。

次のユースケースでは、さらに高度なシェーダーとアニメーション技術を探索していきます。
