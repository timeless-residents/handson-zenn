---
title: Usecase-012 Simple Shapes Animation
free: true
---
# Usecase-012: Simple Shapes Animation

**本章では、`usecases/usecase-012` ディレクトリに格納されている「Simple Shapes Animation」のコードを解説します。**  
このサンプルは、複数の幾何学的形状（キューブ、球体、トーラス）を配置し、それぞれに異なるアニメーションと色の変化を適用しています。前章までの様々なジオメトリとアニメーション技術を組み合わせ、より複雑で視覚的に魅力的なシーンを作成する方法を示しています。

---

## 1. 複数形状の組み合わせとアニメーション

これまでのユースケースでは、単一の形状や、同じ種類の複数の形状を扱ってきました。しかし実際のアプリケーションでは、異なる種類の形状を組み合わせて使用することが一般的です。

`usecase-012` では、以下の3つの異なる形状を配置し、それぞれに異なるアニメーションと色の変化を適用しています：

1. **キューブ（BoxGeometry）**: 左側に配置され、回転と上下の動きに加えて色が変化
2. **球体（SphereGeometry）**: 中央に配置され、回転と上下の動きに加えて色が変化
3. **トーラス（TorusGeometry）**: 右側に配置され、回転と上下の動きに加えて色が変化

これらの形状は、それぞれ異なる回転速度と位相で動き、色も異なるタイミングで変化します。これにより、視覚的に豊かで魅力的なシーンが作成されます。

---

## 2. `usecase-012/index.js` コード詳細

それでは、実際の `usecase-012` のコードを詳しく見ていきましょう。

```js
// usecase-012/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase012 extends UseCaseBase {
  static metadata = {
    id: "012",
    title: "Simple Shapes Animation",
    description: "Animated geometric shapes with color transitions",
    categories: ["Geometry", "Animation"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
  }

  static setupScene(scene) {
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    // Create geometries
    const geometries = [
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.TorusGeometry(1, 0.4, 16, 100),
    ];

    // Create materials with different colors
    const materials = [
      new THREE.MeshPhongMaterial({ color: 0x00ff00 }),
      new THREE.MeshPhongMaterial({ color: 0xff0000 }),
      new THREE.MeshPhongMaterial({ color: 0x0000ff }),
    ];

    // Create meshes and position them
    const meshes = geometries.map((geo, i) => {
      const mesh = new THREE.Mesh(geo, materials[i]);
      mesh.position.x = (i - 1) * 3; // Space them horizontally
      scene.add(mesh);
      return mesh;
    });

    return { objects: meshes, geometries };
  }

  static updateObjects(objects, time) {
    objects.forEach((mesh, i) => {
      // Unique rotation for each mesh
      mesh.rotation.x = time * (0.5 + i * 0.2);
      mesh.rotation.y = time * (0.3 + i * 0.2);

      // Add some bouncing motion
      mesh.position.y = Math.sin(time * 2 + i) * 0.5;

      // Update material color
      const hue = (time * 0.1 + i * 0.3) % 1;
      mesh.material.color.setHSL(hue, 0.7, 0.5);
    });
  }

  async init() {
    const { objects } = GeometryShowcase012.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase012.updateObjects(Array.from(this.objects), this.time);
  }

  static getThumbnailCameraPosition() {
    return {
      position: [0, 2, 12],
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
  id: "012",
  title: "Simple Shapes Animation",
  description: "Animated geometric shapes with color transitions",
  categories: ["Geometry", "Animation"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `012`、 `title` は「Simple Shapes Animation」など。
- `description` には、幾何学的形状のアニメーションと色の変化について言及されています。

### 2-2. `setupScene(scene)`

```js
static setupScene(scene) {
  // Add lights
  const ambientLight = new THREE.AmbientLight(0x404040);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(ambientLight, directionalLight);

  // Create geometries
  const geometries = [
    new THREE.BoxGeometry(1.5, 1.5, 1.5),
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.TorusGeometry(1, 0.4, 16, 100),
  ];

  // Create materials with different colors
  const materials = [
    new THREE.MeshPhongMaterial({ color: 0x00ff00 }),
    new THREE.MeshPhongMaterial({ color: 0xff0000 }),
    new THREE.MeshPhongMaterial({ color: 0x0000ff }),
  ];

  // Create meshes and position them
  const meshes = geometries.map((geo, i) => {
    const mesh = new THREE.Mesh(geo, materials[i]);
    mesh.position.x = (i - 1) * 3; // Space them horizontally
    scene.add(mesh);
    return mesh;
  });

  return { objects: meshes, geometries };
}
```

ここでは、3つの異なる形状を作成し、それぞれに異なる色のマテリアルを適用しています。主な特徴は以下の通りです：

1. **ライトの設定**:
   ```js
   const ambientLight = new THREE.AmbientLight(0x404040);
   const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
   directionalLight.position.set(5, 5, 5);
   scene.add(ambientLight, directionalLight);
   ```
   
   環境光と平行光を設定しています。環境光の色は暗めのグレー（`0x404040`）で、平行光は白色（`0xffffff`）です。

2. **ジオメトリの配列**:
   ```js
   const geometries = [
     new THREE.BoxGeometry(1.5, 1.5, 1.5),
     new THREE.SphereGeometry(1, 32, 32),
     new THREE.TorusGeometry(1, 0.4, 16, 100),
   ];
   ```
   
   3つの異なるジオメトリ（キューブ、球体、トーラス）を配列として定義しています。

3. **マテリアルの配列**:
   ```js
   const materials = [
     new THREE.MeshPhongMaterial({ color: 0x00ff00 }),
     new THREE.MeshPhongMaterial({ color: 0xff0000 }),
     new THREE.MeshPhongMaterial({ color: 0x0000ff }),
   ];
   ```
   
   3つの異なる色（緑、赤、青）のマテリアルを配列として定義しています。

4. **メッシュの作成と配置**:
   ```js
   const meshes = geometries.map((geo, i) => {
     const mesh = new THREE.Mesh(geo, materials[i]);
     mesh.position.x = (i - 1) * 3; // Space them horizontally
     scene.add(mesh);
     return mesh;
   });
   ```
   
   `map` メソッドを使って、各ジオメトリとマテリアルからメッシュを作成し、水平方向に等間隔で配置しています。`(i - 1) * 3` により、左から右に -3, 0, 3 の位置に配置されます。

### 2-3. `updateObjects(objects, time)`

```js
static updateObjects(objects, time) {
  objects.forEach((mesh, i) => {
    // Unique rotation for each mesh
    mesh.rotation.x = time * (0.5 + i * 0.2);
    mesh.rotation.y = time * (0.3 + i * 0.2);

    // Add some bouncing motion
    mesh.position.y = Math.sin(time * 2 + i) * 0.5;

    // Update material color
    const hue = (time * 0.1 + i * 0.3) % 1;
    mesh.material.color.setHSL(hue, 0.7, 0.5);
  });
}
```

ここでは、各メッシュの回転、位置、色を更新しています。主な特徴は以下の通りです：

1. **異なる回転速度**:
   ```js
   mesh.rotation.x = time * (0.5 + i * 0.2);
   mesh.rotation.y = time * (0.3 + i * 0.2);
   ```
   
   各メッシュに異なる回転速度を設定しています。`i` の値（0, 1, 2）に応じて、回転速度が増加します。例えば：
   - メッシュ0（キューブ）: X軸回転速度 = 0.5, Y軸回転速度 = 0.3
   - メッシュ1（球体）: X軸回転速度 = 0.7, Y軸回転速度 = 0.5
   - メッシュ2（トーラス）: X軸回転速度 = 0.9, Y軸回転速度 = 0.7

2. **上下の動き**:
   ```js
   mesh.position.y = Math.sin(time * 2 + i) * 0.5;
   ```
   
   各メッシュが上下に動くように設定しています。`i` の値に応じて、動きの位相がずれます。これにより、各メッシュが異なるタイミングで上下に動きます。

3. **色の変化**:
   ```js
   const hue = (time * 0.1 + i * 0.3) % 1;
   mesh.material.color.setHSL(hue, 0.7, 0.5);
   ```
   
   各メッシュの色を時間とともに変化させています。`i` の値に応じて、色の変化の位相がずれます。これにより、各メッシュの色が異なるタイミングで変化します。

この実装により、3つの異なる形状が、それぞれ異なる速度で回転し、異なるタイミングで上下に動き、異なるタイミングで色が変化するアニメーションが実現されています。

---

## 3. 前章との比較

`usecase-012` は前章までと基本的な構造は同じですが、以下の点が異なります：

1. **複数の異なる形状**: 単一の形状ではなく、3つの異なる形状（キューブ、球体、トーラス）を使用
2. **配列とループの活用**: 配列と `map`/`forEach` メソッドを使って、複数のオブジェクトを効率的に管理
3. **異なるアニメーションパラメータ**: 各オブジェクトに異なる回転速度と位相を設定
4. **色の変化**: HSL色空間を使って、各オブジェクトの色を時間とともに変化させる
5. **カメラの位置**: 複数のオブジェクトを見渡せるように、カメラの位置を調整

特に重要なのは、**複数の異なる形状に対して、インデックスに基づいて異なるアニメーションパラメータを設定する方法**が導入された点です。これにより、より複雑で視覚的に魅力的なシーンを作成することができます。

---

## 4. 配列とループを使った効率的なコード

`usecase-012` では、配列と `map`/`forEach` メソッドを使って、複数のオブジェクトを効率的に管理しています。これにより、コードの冗長性を減らし、より多くのオブジェクトを簡潔に管理することができます。

### 4-1. 配列を使ったオブジェクト管理

```js
const geometries = [
  new THREE.BoxGeometry(1.5, 1.5, 1.5),
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.TorusGeometry(1, 0.4, 16, 100),
];

const materials = [
  new THREE.MeshPhongMaterial({ color: 0x00ff00 }),
  new THREE.MeshPhongMaterial({ color: 0xff0000 }),
  new THREE.MeshPhongMaterial({ color: 0x0000ff }),
];
```

ジオメトリとマテリアルをそれぞれ配列として定義することで、関連する情報をまとめて管理することができます。これにより、新しいオブジェクトを追加する際も、各配列に要素を追加するだけで済みます。

### 4-2. `map` メソッドを使ったオブジェクト生成

```js
const meshes = geometries.map((geo, i) => {
  const mesh = new THREE.Mesh(geo, materials[i]);
  mesh.position.x = (i - 1) * 3; // Space them horizontally
  scene.add(mesh);
  return mesh;
});
```

`map` メソッドを使うことで、各ジオメトリとマテリアルからメッシュを作成し、指定した位置に配置する処理を簡潔に記述できます。これにより、オブジェクトの数が増えても、コードの量はほとんど増えません。

### 4-3. `forEach` メソッドを使ったオブジェクト更新

```js
objects.forEach((mesh, i) => {
  // Unique rotation for each mesh
  mesh.rotation.x = time * (0.5 + i * 0.2);
  mesh.rotation.y = time * (0.3 + i * 0.2);

  // Add some bouncing motion
  mesh.position.y = Math.sin(time * 2 + i) * 0.5;

  // Update material color
  const hue = (time * 0.1 + i * 0.3) % 1;
  mesh.material.color.setHSL(hue, 0.7, 0.5);
});
```

`forEach` メソッドを使うことで、各メッシュの回転、位置、色を更新する処理を簡潔に記述できます。また、インデックス `i` を使って、各メッシュに異なるパラメータを設定することができます。

---

## 5. インデックスに基づく異なるアニメーションパラメータ

`usecase-012` では、インデックス `i` を使って、各メッシュに異なるアニメーションパラメータを設定しています。これにより、各メッシュが異なる動きをするようになります。

### 5-1. 回転速度の変化

```js
mesh.rotation.x = time * (0.5 + i * 0.2);
mesh.rotation.y = time * (0.3 + i * 0.2);
```

インデックス `i` に応じて、回転速度が変化します。具体的には、以下のようになります：

- メッシュ0（キューブ）: X軸回転速度 = 0.5, Y軸回転速度 = 0.3
- メッシュ1（球体）: X軸回転速度 = 0.7, Y軸回転速度 = 0.5
- メッシュ2（トーラス）: X軸回転速度 = 0.9, Y軸回転速度 = 0.7

これにより、各メッシュが異なる速度で回転します。

### 5-2. 位相のずれ

```js
mesh.position.y = Math.sin(time * 2 + i) * 0.5;
```

インデックス `i` を `time` に加えることで、各メッシュの上下の動きの位相がずれます。具体的には、以下のようになります：

- メッシュ0（キューブ）: 位相 = 0
- メッシュ1（球体）: 位相 = 1
- メッシュ2（トーラス）: 位相 = 2

これにより、各メッシュが異なるタイミングで上下に動きます。

### 5-3. 色の変化の位相のずれ

```js
const hue = (time * 0.1 + i * 0.3) % 1;
mesh.material.color.setHSL(hue, 0.7, 0.5);
```

インデックス `i` に 0.3 を掛けて `time` に加えることで、各メッシュの色の変化の位相がずれます。具体的には、以下のようになります：

- メッシュ0（キューブ）: 位相 = 0
- メッシュ1（球体）: 位相 = 0.3
- メッシュ2（トーラス）: 位相 = 0.6

これにより、各メッシュの色が異なるタイミングで変化します。

---

## 6. 応用例：複数形状のアニメーションの拡張

`usecase-012` のコードをベースに、以下のような拡張が考えられます：

### 6-1. より多くの形状を追加する

```js
const geometries = [
  new THREE.BoxGeometry(1.5, 1.5, 1.5),
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.TorusGeometry(1, 0.4, 16, 100),
  new THREE.ConeGeometry(1, 2, 32),
  new THREE.CylinderGeometry(0.5, 0.5, 2, 32),
  new THREE.TetrahedronGeometry(1),
];

const materials = [
  new THREE.MeshPhongMaterial({ color: 0x00ff00 }),
  new THREE.MeshPhongMaterial({ color: 0xff0000 }),
  new THREE.MeshPhongMaterial({ color: 0x0000ff }),
  new THREE.MeshPhongMaterial({ color: 0xffff00 }),
  new THREE.MeshPhongMaterial({ color: 0xff00ff }),
  new THREE.MeshPhongMaterial({ color: 0x00ffff }),
];

// 2行3列のグリッドに配置
const meshes = geometries.map((geo, i) => {
  const mesh = new THREE.Mesh(geo, materials[i]);
  const row = Math.floor(i / 3);
  const col = i % 3;
  mesh.position.x = (col - 1) * 3;
  mesh.position.z = (row - 0.5) * 3;
  scene.add(mesh);
  return mesh;
});
```

### 6-2. より複雑なアニメーションを適用する

```js
objects.forEach((mesh, i) => {
  // 回転
  mesh.rotation.x = time * (0.5 + i * 0.1);
  mesh.rotation.y = time * (0.3 + i * 0.1);
  mesh.rotation.z = time * (0.1 + i * 0.1);
  
  // 上下の動き
  mesh.position.y = Math.sin(time * 2 + i) * 0.5;
  
  // 円軌道上の動き
  const radius = 1;
  const angle = time * 0.5 + i * Math.PI / 3;
  mesh.position.x += Math.cos(angle) * radius * 0.01;
  mesh.position.z += Math.sin(angle) * radius * 0.01;
  
  // スケールの変化
  const scale = 0.8 + Math.sin(time * 3 + i) * 0.2;
  mesh.scale.set(scale, scale, scale);
  
  // 色の変化
  const hue = (time * 0.1 + i * 0.3) % 1;
  const saturation = 0.5 + Math.sin(time + i) * 0.25;
  const lightness = 0.5 + Math.cos(time + i) * 0.25;
  mesh.material.color.setHSL(hue, saturation, lightness);
});
```

### 6-3. オブジェクト間のインタラクションを追加する

```js
objects.forEach((mesh, i) => {
  // 基本的なアニメーション
  mesh.rotation.x = time * (0.5 + i * 0.2);
  mesh.rotation.y = time * (0.3 + i * 0.2);
  
  // 他のオブジェクトとの距離に基づく動き
  objects.forEach((otherMesh, j) => {
    if (i !== j) {
      const distance = mesh.position.distanceTo(otherMesh.position);
      
      // 近づくと互いに引き寄せ合う
      if (distance < 3) {
        const direction = new THREE.Vector3().subVectors(otherMesh.position, mesh.position).normalize();
        mesh.position.add(direction.multiplyScalar(0.01));
      }
      
      // 近づくと色が変化する
      if (distance < 4) {
        const hue = (time * 0.1 + i * 0.3 + j * 0.1) % 1;
        mesh.material.color.setHSL(hue, 0.7, 0.5);
      }
    }
  });
  
  // 上下の動き
  mesh.position.y = Math.sin(time * 2 + i) * 0.5;
});
```

### 6-4. 異なるマテリアルを使用する

```js
const materials = [
  new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }),
  new THREE.MeshPhongMaterial({ color: 0xff0000, shininess: 100 }),
  new THREE.MeshStandardMaterial({ color: 0x0000ff, metalness: 0.5, roughness: 0.5 }),
  new THREE.MeshLambertMaterial({ color: 0xffff00 }),
  new THREE.MeshNormalMaterial(),
  new THREE.MeshDepthMaterial(),
];
```

---

## 7. 複数形状の配置パターン

複数の形状を配置する際には、様々なパターンが考えられます。以下に、一般的な配置パターンをいくつか紹介します。

### 7-1. 直線配置

```js
const meshes = geometries.map((geo, i) => {
  const mesh = new THREE.Mesh(geo, materials[i]);
  mesh.position.x = (i - (geometries.length - 1) / 2) * spacing;
  scene.add(mesh);
  return mesh;
});
```

オブジェクトを一直線上に等間隔で配置します。中心を原点にするために、全体を左右にシフトしています。

### 7-2. 格子配置

```js
const meshes = [];
const rows = 2;
const cols = 3;
let index = 0;

for (let i = 0; i < rows; i++) {
  for (let j = 0; j < cols; j++) {
    if (index < geometries.length) {
      const mesh = new THREE.Mesh(geometries[index], materials[index]);
      mesh.position.x = (j - (cols - 1) / 2) * spacing;
      mesh.position.z = (i - (rows - 1) / 2) * spacing;
      scene.add(mesh);
      meshes.push(mesh);
      index++;
    }
  }
}
```

オブジェクトを格子状に配置します。行と列の数を指定し、それぞれの位置を計算します。

### 7-3. 円形配置

```js
const meshes = geometries.map((geo, i) => {
  const mesh = new THREE.Mesh(geo, materials[i]);
  const angle = (i / geometries.length) * Math.PI * 2;
  mesh.position.x = Math.cos(angle) * radius;
  mesh.position.z = Math.sin(angle) * radius;
  scene.add(mesh);
  return mesh;
});
```

オブジェクトを円周上に等間隔で配置します。角度を計算し、三角関数を使って位置を決定します。

### 7-4. 螺旋配置

```js
const meshes = geometries.map((geo, i) => {
  const mesh = new THREE.Mesh(geo, materials[i]);
  const angle = (i / geometries.length) * Math.PI * 4; // 2周分
  const radius = 1 + i * 0.5; // 徐々に大きくなる半径
  mesh.position.x = Math.cos(angle) * radius;
  mesh.position.z = Math.sin(angle) * radius;
  mesh.position.y = i * 0.5; // 徐々に高くなる
  scene.add(mesh);
  return mesh;
});
```

オブジェクトを螺旋状に配置します。角度、半径、高さを計算し、位置を決定します。

---

## 8. まとめ

「**Usecase-012: Simple Shapes Animation**」では、Three.jsで複数の異なる形状を配置し、それぞれに異なるアニメーションと色の変化を適用する方法を学びました。

主なポイントは以下の通りです：

1. **複数の異なる形状の使用**: キューブ、球体、トーラスという3つの異なる形状を使用しました。
2. **配列とループの活用**: 配列と `map`/`forEach` メソッドを使って、複数のオブジェクトを効率的に管理しました。
3. **インデックスに基づく異なるアニメーションパラメータ**: インデックスを使って、各オブジェクトに異なる回転速度と位相を設定しました。
4. **HSL色空間を使った色の変化**: HSL色空間を使って、各オブジェクトの色を時間とともに変化させました。
5. **カメラの位置の調整**: 複数のオブジェクトを見渡せるように、カメラの位置を調整しました。

このサンプルは、Three.jsでの複数の異なる形状の管理と、異なるアニメーションパラメータの設定方法を示す良い例となっています。特に、配列とループを使ったオブジェクト管理の手法と、インデックスを使った異なるパラメータの設定方法は、より複雑なシーンを作成する際に非常に有用です。

---

## 9. 次のステップ

`usecase-012` を理解したら、次のステップとして以下のような発展が考えられます：

1. **より多くの形状**: 4つ以上の異なる形状を配置し、それぞれに異なるアニメーションを適用する。
2. **より複雑な配置**: 格子状や円形、螺旋状など、より複雑な配置パターンを試す。
3. **オブジェクト間のインタラクション**: オブジェクト同士の位置関係に基づいて、アニメーションを変化させる。
4. **異なるマテリアル**: 各オブジェクトに異なる種類のマテリアルを適用し、それぞれの特性を活かす。
5. **ユーザーインタラクション**: マウスやキーボードの入力に応じて、オブジェクトの動きを変更する。

これらの発展は、今後のユースケースで順次紹介していく予定です。`usecase-012` で学んだ複数の異なる形状の管理と、異なるアニメーションパラメータの設定の基本を応用することで、より高度な3D表現へと進んでいきましょう。
