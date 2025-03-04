---
title: Usecase-010 Cube and Sphere Duo
free: true
---
# Usecase-010: Cube and Sphere Duo

**本章では、`usecases/usecase-010` ディレクトリに格納されている「Cube and Sphere Duo」のコードを解説します。**  
このサンプルは、赤いキューブと緑の球体が異なるアニメーションで動くシーンです。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、複数のオブジェクトを配置し、それぞれに異なるアニメーションを適用する方法を示しています。

---

## 1. 複数オブジェクトのアニメーション

これまでのユースケースでは、主に単一のオブジェクトにアニメーションを適用してきました。しかし実際のアプリケーションでは、複数のオブジェクトが同時に存在し、それぞれが異なる動きをすることが一般的です。

`usecase-010` では、以下の2つのオブジェクトを配置し、それぞれに異なるアニメーションを適用しています：

1. **赤いキューブ**: X軸とY軸の両方で回転するアニメーション
2. **緑の球体**: 上下に弾みながら、Z軸周りにゆっくりと回転するアニメーション

これにより、シーン内に複数の視覚的な焦点を作り出し、より豊かな表現を実現しています。

---

## 2. `usecase-010/index.js` コード詳細

それでは、実際の `usecase-010` のコードを詳しく見ていきましょう。

```js
// usecase-010/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase010 extends UseCaseBase {
  static metadata = {
    id: "010",
    title: "Cube and Sphere Duo",
    description: "A spinning cube and a bouncing sphere",
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

    const geometries = [
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.SphereGeometry(1, 32, 32),
    ];
    const materials = [
      new THREE.MeshPhongMaterial({ color: 0xff4444 }),
      new THREE.MeshPhongMaterial({ color: 0x44ff44 }),
    ];
    const positions = [
      [-2, 0, 0],
      [2, 0, 0],
    ];
    const objects = [];

    geometries.forEach((geometry, i) => {
      const mesh = new THREE.Mesh(geometry, materials[i]);
      mesh.position.set(...positions[i]);
      scene.add(mesh);
      objects.push(mesh);
    });

    return { objects, geometries };
  }

  static updateObjects(objects, time, deltaTime = 0.016) {
    objects[0].rotation.x += deltaTime;
    objects[0].rotation.y += deltaTime;
    objects[1].position.y = Math.sin(time * 2) * 0.5;
    objects[1].rotation.z += deltaTime * 0.5;
  }

  async init() {
    const { objects } = GeometryShowcase010.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase010.updateObjects(
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
  id: "010",
  title: "Cube and Sphere Duo",
  description: "A spinning cube and a bouncing sphere",
  categories: ["Geometry", "Animation"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `010`、 `title` は「Cube and Sphere Duo」など。
- `description` には、キューブが回転し、球体が弾むことについて言及されています。

### 2-2. `setupScene(scene)`

```js
static setupScene(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(ambientLight, directionalLight);

  const geometries = [
    new THREE.BoxGeometry(1.5, 1.5, 1.5),
    new THREE.SphereGeometry(1, 32, 32),
  ];
  const materials = [
    new THREE.MeshPhongMaterial({ color: 0xff4444 }),
    new THREE.MeshPhongMaterial({ color: 0x44ff44 }),
  ];
  const positions = [
    [-2, 0, 0],
    [2, 0, 0],
  ];
  const objects = [];

  geometries.forEach((geometry, i) => {
    const mesh = new THREE.Mesh(geometry, materials[i]);
    mesh.position.set(...positions[i]);
    scene.add(mesh);
    objects.push(mesh);
  });

  return { objects, geometries };
}
```

前章の `usecase-009` との主な違いは以下の点です：

1. **複数のジオメトリとマテリアル**:
   ```js
   const geometries = [
     new THREE.BoxGeometry(1.5, 1.5, 1.5),
     new THREE.SphereGeometry(1, 32, 32),
   ];
   const materials = [
     new THREE.MeshPhongMaterial({ color: 0xff4444 }),
     new THREE.MeshPhongMaterial({ color: 0x44ff44 }),
   ];
   ```
   
   2つのジオメトリ（キューブと球体）と2つのマテリアル（赤と緑）を配列として定義しています。

2. **位置の配列**:
   ```js
   const positions = [
     [-2, 0, 0],
     [2, 0, 0],
   ];
   ```
   
   2つのオブジェクトの位置を配列として定義しています。キューブはX座標が-2、球体はX座標が2に配置され、左右に並びます。

3. **ループを使ったオブジェクト生成**:
   ```js
   geometries.forEach((geometry, i) => {
     const mesh = new THREE.Mesh(geometry, materials[i]);
     mesh.position.set(...positions[i]);
     scene.add(mesh);
     objects.push(mesh);
   });
   ```
   
   `forEach` ループを使って、各ジオメトリとマテリアルからメッシュを作成し、指定した位置に配置しています。これにより、コードの冗長性を減らし、より多くのオブジェクトを簡潔に作成できます。

### 2-3. `updateObjects(objects, time, deltaTime)`

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].rotation.x += deltaTime;
  objects[0].rotation.y += deltaTime;
  objects[1].position.y = Math.sin(time * 2) * 0.5;
  objects[1].rotation.z += deltaTime * 0.5;
}
```

ここでの主な特徴は以下の点です：

1. **キューブのアニメーション**:
   ```js
   objects[0].rotation.x += deltaTime;
   objects[0].rotation.y += deltaTime;
   ```
   
   キューブ（`objects[0]`）はX軸とY軸の両方で回転します。両方の回転速度は同じ（`deltaTime`）です。

2. **球体のアニメーション**:
   ```js
   objects[1].position.y = Math.sin(time * 2) * 0.5;
   objects[1].rotation.z += deltaTime * 0.5;
   ```
   
   球体（`objects[1]`）は2つのアニメーションを組み合わせています：
   - Y座標が `Math.sin(time * 2) * 0.5` に基づいて変化し、上下に弾みます。
   - Z軸周りに回転しますが、速度はキューブの半分（`deltaTime * 0.5`）です。

この実装により、キューブが回転し、球体が上下に弾みながらゆっくりと回転するアニメーションが実現されています。2つのオブジェクトが異なる動きをすることで、シーンに視覚的な多様性が生まれます。

### 2-4. `getThumbnailBlob()`

```js
static getThumbnailBlob() {
  // Create a simple SVG representation of a red cube and green sphere
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#111111"/>
      
      <!-- Red cube -->
      <g transform="translate(70, 100)">
        <!-- Front face -->
        <polygon points="0,0 -30,-30 -30,-60 0,-30" fill="#ff4444" stroke="#ffffff" stroke-width="1"/>
        <!-- Right face -->
        <polygon points="0,0 0,-30 30,-60 30,-30" fill="#cc3333" stroke="#ffffff" stroke-width="1"/>
        <!-- Top face -->
        <polygon points="0,-30 -30,-60 30,-60 30,-30" fill="#aa2222" stroke="#ffffff" stroke-width="1"/>
      </g>
      
      <!-- Green sphere -->
      <circle cx="130" cy="100" r="30" fill="#44ff44" stroke="#ffffff" stroke-width="1"/>
      
      <!-- Sphere highlight -->
      <circle cx="120" cy="90" r="10" fill="#ffffff" opacity="0.3"/>
    </svg>
  `;

  // Unicode-safe encoding
  const encodedSvg = unescape(encodeURIComponent(svgString));
  const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

  // Convert to Blob
  return fetch(dataURL).then((res) => res.blob());
}
```

サムネイル生成用のSVGが、赤いキューブと緑の球体を表現するように変更されています。キューブは3つの面（前面、右面、上面）で表現され、球体は円で表現されています。また、それぞれに異なる色と影を付けて立体感を出しています。

---

## 3. 前章との比較

`usecase-010` は前章までと基本的な構造は同じですが、以下の点が異なります：

1. **複数オブジェクト**: 単一のオブジェクトから複数のオブジェクトに変更
2. **異なるジオメトリ**: 異なる種類のジオメトリ（キューブと球体）を組み合わせて使用
3. **異なるアニメーション**: 各オブジェクトに異なるアニメーションを適用
4. **配列とループ**: 配列と `forEach` ループを使ってオブジェクトを生成
5. **サムネイル**: 複数のオブジェクトを表現するSVGに変更

特に重要なのは、**複数のオブジェクトに異なるアニメーションを適用する方法**が導入された点です。これにより、より複雑で多様なシーンを作成することができます。

---

## 4. 複数オブジェクトの管理

`usecase-010` では、複数のオブジェクトを管理するために、配列とループを使用しています。これにより、コードの冗長性を減らし、より多くのオブジェクトを簡潔に管理することができます。

### 4-1. 配列を使ったオブジェクト管理

```js
const geometries = [
  new THREE.BoxGeometry(1.5, 1.5, 1.5),
  new THREE.SphereGeometry(1, 32, 32),
];
const materials = [
  new THREE.MeshPhongMaterial({ color: 0xff4444 }),
  new THREE.MeshPhongMaterial({ color: 0x44ff44 }),
];
const positions = [
  [-2, 0, 0],
  [2, 0, 0],
];
const objects = [];
```

ジオメトリ、マテリアル、位置をそれぞれ配列として定義することで、関連する情報をまとめて管理することができます。これにより、新しいオブジェクトを追加する際も、各配列に要素を追加するだけで済みます。

### 4-2. ループを使ったオブジェクト生成

```js
geometries.forEach((geometry, i) => {
  const mesh = new THREE.Mesh(geometry, materials[i]);
  mesh.position.set(...positions[i]);
  scene.add(mesh);
  objects.push(mesh);
});
```

`forEach` ループを使うことで、各ジオメトリとマテリアルからメッシュを作成し、指定した位置に配置する処理を簡潔に記述できます。これにより、オブジェクトの数が増えても、コードの量はほとんど増えません。

### 4-3. インデックスを使ったアクセス

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].rotation.x += deltaTime;
  objects[0].rotation.y += deltaTime;
  objects[1].position.y = Math.sin(time * 2) * 0.5;
  objects[1].rotation.z += deltaTime * 0.5;
}
```

`objects` 配列のインデックスを使って、各オブジェクトに個別にアクセスし、異なるアニメーションを適用しています。これにより、各オブジェクトの動きを細かく制御することができます。

---

## 5. 異なるアニメーションの組み合わせ

`usecase-010` では、2つのオブジェクトに異なるアニメーションを適用しています。これにより、シーンに視覚的な多様性が生まれます。

### 5-1. キューブのアニメーション

```js
objects[0].rotation.x += deltaTime;
objects[0].rotation.y += deltaTime;
```

キューブには、X軸とY軸の両方で回転するアニメーションを適用しています。両方の回転速度は同じ（`deltaTime`）です。これにより、キューブは対角線上の軸を中心に回転するように見えます。

### 5-2. 球体のアニメーション

```js
objects[1].position.y = Math.sin(time * 2) * 0.5;
objects[1].rotation.z += deltaTime * 0.5;
```

球体には、2つのアニメーションを組み合わせています：

1. **位置アニメーション**: Y座標が `Math.sin(time * 2) * 0.5` に基づいて変化し、上下に弾みます。
   - `time * 2` により、弾みの周期が速くなります。
   - `* 0.5` により、弾みの振幅が0.5になります。

2. **回転アニメーション**: Z軸周りに回転しますが、速度はキューブの半分（`deltaTime * 0.5`）です。
   - Z軸回転は、正面から見ると時計回りまたは反時計回りの回転に見えます。
   - 球体は回転しても見た目が変わらないように思えますが、テクスチャや光の反射により回転が分かります。

これらのアニメーションを組み合わせることで、球体が上下に弾みながらゆっくりと回転する動きが実現されています。

### 5-3. アニメーションの組み合わせ効果

2つのオブジェクトに異なるアニメーションを適用することで、以下のような効果が得られます：

1. **視覚的な多様性**: 異なる動きにより、シーンに視覚的な多様性が生まれます。
2. **注目点の分散**: 複数の動きにより、視聴者の注目点が分散され、シーン全体に目が向けられます。
3. **対比効果**: 異なる動きを対比させることで、それぞれの動きの特徴がより際立ちます。

---

## 6. 応用例：複数オブジェクトと異なるアニメーションの拡張

`usecase-010` のコードをベースに、以下のような拡張が考えられます：

### 6-1. より多くのオブジェクトを追加する

```js
const geometries = [
  new THREE.BoxGeometry(1.5, 1.5, 1.5),
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.ConeGeometry(1, 2, 32),
  new THREE.TorusGeometry(1, 0.4, 16, 100),
];
const materials = [
  new THREE.MeshPhongMaterial({ color: 0xff4444 }),
  new THREE.MeshPhongMaterial({ color: 0x44ff44 }),
  new THREE.MeshPhongMaterial({ color: 0x4444ff }),
  new THREE.MeshPhongMaterial({ color: 0xffff44 }),
];
const positions = [
  [-3, 0, 0],
  [-1, 0, 0],
  [1, 0, 0],
  [3, 0, 0],
];
```

### 6-2. より複雑なアニメーションを適用する

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  // キューブ: X軸とY軸で回転
  objects[0].rotation.x += deltaTime;
  objects[0].rotation.y += deltaTime;
  
  // 球体: 上下に弾みながらZ軸で回転
  objects[1].position.y = Math.sin(time * 2) * 0.5;
  objects[1].rotation.z += deltaTime * 0.5;
  
  // コーン: 円軌道上を移動しながらX軸で回転
  objects[2].position.x = Math.cos(time) * 0.5 + 1; // 中心点は x=1
  objects[2].position.z = Math.sin(time) * 0.5;
  objects[2].rotation.x += deltaTime * 2;
  
  // トーラス: 拡大縮小しながら3軸で回転
  const scale = 0.8 + Math.sin(time * 3) * 0.2;
  objects[3].scale.set(scale, scale, scale);
  objects[3].rotation.x += deltaTime * 0.3;
  objects[3].rotation.y += deltaTime * 0.6;
  objects[3].rotation.z += deltaTime * 0.9;
}
```

### 6-3. オブジェクト間のインタラクションを追加する

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  // キューブと球体の距離を計算
  const cube = objects[0];
  const sphere = objects[1];
  const distance = cube.position.distanceTo(sphere.position);
  
  // 距離に応じてアニメーションを変更
  if (distance < 3) {
    // 近づくと速度が上がる
    const speedFactor = 1 + (3 - distance) * 0.5;
    cube.rotation.x += deltaTime * speedFactor;
    cube.rotation.y += deltaTime * speedFactor;
    sphere.rotation.z += deltaTime * 0.5 * speedFactor;
  } else {
    // 通常の速度
    cube.rotation.x += deltaTime;
    cube.rotation.y += deltaTime;
    sphere.rotation.z += deltaTime * 0.5;
  }
  
  // 球体は常に上下に弾む
  sphere.position.y = Math.sin(time * 2) * 0.5;
  
  // キューブは球体に向かって少しずつ移動
  const direction = new THREE.Vector3().subVectors(sphere.position, cube.position).normalize();
  cube.position.add(direction.multiplyScalar(deltaTime * 0.1));
}
```

### 6-4. 時間経過とともに変化するマテリアルを適用する

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  // キューブのアニメーション
  objects[0].rotation.x += deltaTime;
  objects[0].rotation.y += deltaTime;
  
  // 球体のアニメーション
  objects[1].position.y = Math.sin(time * 2) * 0.5;
  objects[1].rotation.z += deltaTime * 0.5;
  
  // マテリアルの色を時間とともに変化
  objects[0].material.color.setHSL((time * 0.1) % 1, 0.7, 0.5);
  objects[1].material.color.setHSL(((time * 0.1) + 0.5) % 1, 0.7, 0.5); // 補色
}
```

---

## 7. 複数オブジェクトの配置パターン

複数のオブジェクトを配置する際には、様々なパターンが考えられます。以下に、一般的な配置パターンをいくつか紹介します。

### 7-1. 直線配置

```js
const positions = [];
for (let i = 0; i < count; i++) {
  positions.push([i * spacing - (count - 1) * spacing / 2, 0, 0]);
}
```

オブジェクトを一直線上に等間隔で配置します。中心を原点にするために、全体を左右にシフトしています。

### 7-2. 格子配置

```js
const positions = [];
const rows = 3;
const cols = 3;
for (let i = 0; i < rows; i++) {
  for (let j = 0; j < cols; j++) {
    positions.push([
      j * spacing - (cols - 1) * spacing / 2,
      0,
      i * spacing - (rows - 1) * spacing / 2
    ]);
  }
}
```

オブジェクトを格子状に配置します。行と列の数を指定し、それぞれの位置を計算します。

### 7-3. 円形配置

```js
const positions = [];
const count = 8;
const radius = 3;
for (let i = 0; i < count; i++) {
  const angle = (i / count) * Math.PI * 2;
  positions.push([
    Math.cos(angle) * radius,
    0,
    Math.sin(angle) * radius
  ]);
}
```

オブジェクトを円周上に等間隔で配置します。角度を計算し、三角関数を使って位置を決定します。

### 7-4. ランダム配置

```js
const positions = [];
const count = 20;
const range = 5;
for (let i = 0; i < count; i++) {
  positions.push([
    (Math.random() - 0.5) * range * 2,
    (Math.random() - 0.5) * range * 2,
    (Math.random() - 0.5) * range * 2
  ]);
}
```

オブジェクトをランダムな位置に配置します。指定した範囲内でランダムな座標を生成します。

---

## 8. まとめ

「**Usecase-010: Cube and Sphere Duo**」では、Three.jsで複数のオブジェクトを配置し、それぞれに異なるアニメーションを適用する方法を学びました。

主なポイントは以下の通りです：

1. **複数オブジェクトの管理**: 配列とループを使って、複数のオブジェクトを効率的に管理する方法を学びました。
2. **異なるアニメーションの適用**: 各オブジェクトに異なるアニメーションを適用し、視覚的な多様性を生み出す方法を学びました。
3. **位置と回転の組み合わせ**: 位置アニメーション（球体の弾み）と回転アニメーション（キューブの回転、球体の回転）を組み合わせる方法を学びました。
4. **サムネイル生成**: 複数のオブジェクトを表現するSVGを作成し、ギャラリー表示に対応しました。

このサンプルは、Three.jsでの複数オブジェクトの管理と異なるアニメーションの適用方法を示す良い例となっています。特に、配列とループを使ったオブジェクト管理の手法は、より複雑なシーンを作成する際に非常に有用です。

---

## 9. 次のステップ

`usecase-010` を理解したら、次のステップとして以下のような発展が考えられます：

1. **より多くのオブジェクト**: 3つ以上のオブジェクトを配置し、それぞれに異なるアニメーションを適用する。
2. **オブジェクト間のインタラクション**: オブジェクト同士の位置関係に基づいて、アニメーションを変化させる。
3. **動的なオブジェクト生成**: 時間経過とともに新しいオブジェクトを生成したり、既存のオブジェクトを削除したりする。
4. **ユーザーインタラクション**: マウスやキーボードの入力に応じて、オブジェクトの動きを変更する。

これらの発展は、今後のユースケースで順次紹介していく予定です。`usecase-010` で学んだ複数オブジェクトの管理と異なるアニメーションの適用の基本を応用することで、より高度な3D表現へと進んでいきましょう。
