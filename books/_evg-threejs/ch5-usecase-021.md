---
title: Usecase-021 Twisted Candy Stick
free: true
---
# Usecase-021: Twisted Candy Stick

**本章では、`usecases/usecase-021` ディレクトリに格納されている「Twisted Candy Stick」のコードを解説します。**  
このサンプルは、ねじれた円柱を使ってキャンディスティック（棒付きキャンディ）を表現しています。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、ジオメトリの変形技術を活用した例となっています。

---

## 1. ねじれたキャンディスティックの表現

これまでのユースケースでは、様々な形状とアニメーション効果を扱ってきました。`usecase-021` では、円柱ジオメトリの頂点を直接操作して、ねじれた形状を作り出しています。

このサンプルでは、円柱の頂点を回転させることでねじれを表現し、頂点カラーを使って縞模様を作り出しています。また、複数のキャンディスティックを円形に配置し、それぞれが揺れるアニメーションを適用することで、生き生きとした表現を実現しています。

`usecase-021` では、以下の特徴を持つシーンを作成しています：

1. **ねじれた円柱**: 頂点を直接操作してねじれを表現
2. **縞模様のテクスチャ**: 頂点カラーを使った縞模様
3. **複数のキャンディスティック**: 異なる色と大きさのキャンディスティック
4. **円形の配置**: 中央に大きなキャンディと周囲に小さなキャンディ
5. **揺れるアニメーション**: 各キャンディスティックが独立して揺れる動き

これらの効果を組み合わせることで、魅力的なキャンディスティックの表現を実現しています。

---

## 2. `usecase-021/index.js` コード詳細

それでは、実際の `usecase-021` のコードを詳しく見ていきましょう。

```js
// usecase-021/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

// ねじれたキャンディスティックを作成する関数（モジュールレベルで定義）
function createTwistedCandyStick(
  color1,
  color2,
  twistCount = 8,
  radius = 0.3,
  height = 4
) {
  const group = new THREE.Group();

  // 基本の円柱形状を作成（セグメント数を多めにして滑らかに）
  const geometry = new THREE.CylinderGeometry(
    radius, // 上部の半径
    radius, // 下部の半径
    height, // 高さ
    32, // 円周方向の分割数
    Math.max(64, twistCount * 8), // 高さ方向の分割数（ツイスト数に比例）
    false // 側面のみ（底面なし）
  );

  // 頂点位置を取得して変形を適用
  const positionAttribute = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  // 縞模様を作るために、各頂点に色を割り当てる
  const colors = [];

  for (let i = 0; i < positionAttribute.count; i++) {
    // 現在の頂点の座標を取得
    vertex.fromBufferAttribute(positionAttribute, i);

    // 頂点のY座標を正規化（-0.5から0.5の範囲に）
    const normalizedY = vertex.y / height;

    // ツイストの角度を計算（Y座標によって変わる）
    // 中央付近でよりねじれるようにする
    let twistFactor;
    if (normalizedY > 0.2 && normalizedY < 0.8) {
      // 中央部分は強くねじる
      twistFactor = Math.sin(normalizedY * Math.PI) * twistCount * Math.PI;
    } else {
      // 端の部分はあまりねじらない
      twistFactor = 0;
    }

    // ツイストを適用
    const x = vertex.x;
    const z = vertex.z;
    const cosTheta = Math.cos(twistFactor);
    const sinTheta = Math.sin(twistFactor);

    vertex.x = x * cosTheta - z * sinTheta;
    vertex.z = x * sinTheta + z * cosTheta;

    // 変形した座標を設定
    positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);

    // 縞模様のために色を決定（角度に基づく）
    const angle = Math.atan2(vertex.z, vertex.x);
    const normalizedAngle = (angle + Math.PI) / (Math.PI * 2); // 0～1に正規化

    // ツイストに合わせた縞模様
    const adjustedAngle = normalizedAngle + twistFactor / (Math.PI * 2);
    const colorIndex = Math.floor(adjustedAngle * 12) % 2; // 6分割して交互に色を変える

    // 色を設定
    if (colorIndex === 0) {
      colors.push(
        ((color1 >> 16) & 255) / 255,
        ((color1 >> 8) & 255) / 255,
        (color1 & 255) / 255
      );
    } else {
      colors.push(
        ((color2 >> 16) & 255) / 255,
        ((color2 >> 8) & 255) / 255,
        (color2 & 255) / 255
      );
    }
  }

  // BufferAttributeとして色を設定
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  // 法線を再計算
  geometry.computeVertexNormals();

  // 頂点カラーを使用するマテリアル
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.3,
    metalness: 0.3,
  });

  // メッシュを作成
  const candyStick = new THREE.Mesh(geometry, material);
  candyStick.castShadow = true;
  candyStick.receiveShadow = true;

  // 両端に半球を追加して丸くする
  const sphereGeometryTop = new THREE.SphereGeometry(
    radius,
    32,
    16,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  const sphereTop = new THREE.Mesh(sphereGeometryTop, material.clone());
  sphereTop.position.y = height / 2;
  sphereTop.rotation.x = Math.PI;

  const sphereGeometryBottom = new THREE.SphereGeometry(
    radius,
    32,
    16,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  const sphereBottom = new THREE.Mesh(sphereGeometryBottom, material.clone());
  sphereBottom.position.y = -height / 2;

  // グループに追加
  group.add(candyStick);
  group.add(sphereTop);
  group.add(sphereBottom);

  return group;
}

export default class GeometryShowcase021 extends UseCaseBase {
  static metadata = {
    id: "021",
    title: "Twisted Candy Stick",
    description:
      "部分的にTwist（シンプルデフォーム）でねじれた円柱を使ったキャンディスティック風オブジェクト",
    categories: ["Geometry", "Deformation", "Candy"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
    this.candySticks = [];
    this.rotationSpeed = 0.5;
  }

  static setupScene(scene) {
    // シーンの背景色を設定（明るい色）
    scene.background = new THREE.Color(0xf0f0f0);

    const objects = [];
    const geometries = [];

    // 環境光を追加
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    objects.push(ambientLight);

    // メインの光源
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);
    objects.push(mainLight);

    // サブライト（反対側からの光）
    const subLight = new THREE.DirectionalLight(0xffffff, 0.4);
    subLight.position.set(-5, 3, -5);
    scene.add(subLight);
    objects.push(subLight);

    // 複数のキャンディスティックを作成
    const candySticks = [];
    const colors = [
      [0xff0000, 0xffffff], // 赤と白
      [0x00ff00, 0xffffff], // 緑と白
      [0x0000ff, 0xffffff], // 青と白
      [0xff0000, 0x00ff00], // 赤と緑
      [0xff00ff, 0xffffff], // ピンクと白
    ];

    // 5本のキャンディスティックを作成し、円形に配置
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const radius = 3;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const candyStick = createTwistedCandyStick(
        colors[i][0],
        colors[i][1],
        8 + i
      );
      candyStick.position.set(x, 0, z);
      candyStick.rotation.x = Math.PI / 8; // 少し傾ける
      candyStick.rotation.y = angle + Math.PI / 2; // キャンディを外側に向ける

      scene.add(candyStick);
      objects.push(candyStick);
      candySticks.push(candyStick);
    }

    // 中央に特別な大きなキャンディを配置
    const centerCandy = createTwistedCandyStick(0xff4500, 0xffffff, 12, 0.8, 6);
    centerCandy.position.set(0, 0, 0);
    centerCandy.rotation.x = -Math.PI / 4; // 大きく傾ける
    scene.add(centerCandy);
    objects.push(centerCandy);
    candySticks.push(centerCandy);

    return {
      objects,
      geometries,
      candySticks,
    };
  }

  static updateObjects(objects, time = 0, mousePos = { x: 0, y: 0 }) {
    // objects配列から回転させたいオブジェクトを探す
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      if (!obj || !obj.rotation) continue;

      // キャンディスティックっぽいオブジェクトは回転させる
      if (obj.isMesh || obj.isGroup) {
        // 中央に近いオブジェクトは逆方向に回転
        if (Math.abs(obj.position.x) < 1 && Math.abs(obj.position.z) < 1) {
          obj.rotation.y -= 0.005;
        } else {
          // 外周のオブジェクトはゆらゆら揺れる
          const angle = Math.atan2(obj.position.z, obj.position.x);
          obj.rotation.y = angle + Math.PI / 2 + Math.sin(time * 0.3 + i) * 0.1;

          // 上下に揺らす
          obj.position.y = Math.sin(time * 0.5 + i * 0.7) * 0.2;
        }
      }
    }
  }

  async init() {
    const { objects, candySticks } = GeometryShowcase021.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
    this.candySticks = candySticks;
  }

  update(deltaTime) {
    this.time += deltaTime * this.rotationSpeed;
    GeometryShowcase021.updateObjects(Array.from(this.objects), this.time);
  }

  static getThumbnailCameraPosition() {
    return {
      position: [6, 4, 6],
      target: [0, 0, 0],
    };
  }

  // getThumbnailBlob と createPreview メソッドは省略
}
```

### 2-1. `metadata`

```js
static metadata = {
  id: "021",
  title: "Twisted Candy Stick",
  description:
    "部分的にTwist（シンプルデフォーム）でねじれた円柱を使ったキャンディスティック風オブジェクト",
  categories: ["Geometry", "Deformation", "Candy"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `021`、 `title` は「Twisted Candy Stick」など。
- `description` には、ねじれた円柱を使ったキャンディスティックについて言及されています。
- `categories` に「Deformation」と「Candy」が追加されており、変形技術とキャンディをテーマにしていることを示しています。

### 2-2. `createTwistedCandyStick` 関数

```js
function createTwistedCandyStick(
  color1,
  color2,
  twistCount = 8,
  radius = 0.3,
  height = 4
) {
  const group = new THREE.Group();

  // 基本の円柱形状を作成（セグメント数を多めにして滑らかに）
  const geometry = new THREE.CylinderGeometry(
    radius, // 上部の半径
    radius, // 下部の半径
    height, // 高さ
    32, // 円周方向の分割数
    Math.max(64, twistCount * 8), // 高さ方向の分割数（ツイスト数に比例）
    false // 側面のみ（底面なし）
  );

  // 頂点位置を取得して変形を適用
  const positionAttribute = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  // 縞模様を作るために、各頂点に色を割り当てる
  const colors = [];

  for (let i = 0; i < positionAttribute.count; i++) {
    // 現在の頂点の座標を取得
    vertex.fromBufferAttribute(positionAttribute, i);

    // 頂点のY座標を正規化（-0.5から0.5の範囲に）
    const normalizedY = vertex.y / height;

    // ツイストの角度を計算（Y座標によって変わる）
    // 中央付近でよりねじれるようにする
    let twistFactor;
    if (normalizedY > 0.2 && normalizedY < 0.8) {
      // 中央部分は強くねじる
      twistFactor = Math.sin(normalizedY * Math.PI) * twistCount * Math.PI;
    } else {
      // 端の部分はあまりねじらない
      twistFactor = 0;
    }

    // ツイストを適用
    const x = vertex.x;
    const z = vertex.z;
    const cosTheta = Math.cos(twistFactor);
    const sinTheta = Math.sin(twistFactor);

    vertex.x = x * cosTheta - z * sinTheta;
    vertex.z = x * sinTheta + z * cosTheta;

    // 変形した座標を設定
    positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);

    // 縞模様のために色を決定（角度に基づく）
    const angle = Math.atan2(vertex.z, vertex.x);
    const normalizedAngle = (angle + Math.PI) / (Math.PI * 2); // 0～1に正規化

    // ツイストに合わせた縞模様
    const adjustedAngle = normalizedAngle + twistFactor / (Math.PI * 2);
    const colorIndex = Math.floor(adjustedAngle * 12) % 2; // 6分割して交互に色を変える

    // 色を設定
    if (colorIndex === 0) {
      colors.push(
        ((color1 >> 16) & 255) / 255,
        ((color1 >> 8) & 255) / 255,
        (color1 & 255) / 255
      );
    } else {
      colors.push(
        ((color2 >> 16) & 255) / 255,
        ((color2 >> 8) & 255) / 255,
        (color2 & 255) / 255
      );
    }
  }

  // BufferAttributeとして色を設定
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  // 法線を再計算
  geometry.computeVertexNormals();

  // 頂点カラーを使用するマテリアル
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.3,
    metalness: 0.3,
  });

  // メッシュを作成
  const candyStick = new THREE.Mesh(geometry, material);
  candyStick.castShadow = true;
  candyStick.receiveShadow = true;

  // 両端に半球を追加して丸くする
  const sphereGeometryTop = new THREE.SphereGeometry(
    radius,
    32,
    16,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  const sphereTop = new THREE.Mesh(sphereGeometryTop, material.clone());
  sphereTop.position.y = height / 2;
  sphereTop.rotation.x = Math.PI;

  const sphereGeometryBottom = new THREE.SphereGeometry(
    radius,
    32,
    16,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  const sphereBottom = new THREE.Mesh(sphereGeometryBottom, material.clone());
  sphereBottom.position.y = -height / 2;

  // グループに追加
  group.add(candyStick);
  group.add(sphereTop);
  group.add(sphereBottom);

  return group;
}
```

この関数は、ねじれたキャンディスティックを作成するための関数です。主な特徴は以下の通りです：

1. **円柱ジオメトリの作成**:
   ```js
   const geometry = new THREE.CylinderGeometry(
     radius, // 上部の半径
     radius, // 下部の半径
     height, // 高さ
     32, // 円周方向の分割数
     Math.max(64, twistCount * 8), // 高さ方向の分割数（ツイスト数に比例）
     false // 側面のみ（底面なし）
   );
   ```
   
   基本となる円柱ジオメトリを作成しています。円周方向の分割数は32、高さ方向の分割数はツイスト数に比例して設定されています。これにより、ツイスト数が多いほど、より滑らかなねじれを表現できます。

2. **ねじれの適用**:
   ```js
   for (let i = 0; i < positionAttribute.count; i++) {
     // 現在の頂点の座標を取得
     vertex.fromBufferAttribute(positionAttribute, i);

     // 頂点のY座標を正規化（-0.5から0.5の範囲に）
     const normalizedY = vertex.y / height;

     // ツイストの角度を計算（Y座標によって変わる）
     // 中央付近でよりねじれるようにする
     let twistFactor;
     if (normalizedY > 0.2 && normalizedY < 0.8) {
       // 中央部分は強くねじる
       twistFactor = Math.sin(normalizedY * Math.PI) * twistCount * Math.PI;
     } else {
       // 端の部分はあまりねじらない
       twistFactor = 0;
     }

     // ツイストを適用
     const x = vertex.x;
     const z = vertex.z;
     const cosTheta = Math.cos(twistFactor);
     const sinTheta = Math.sin(twistFactor);

     vertex.x = x * cosTheta - z * sinTheta;
     vertex.z = x * sinTheta + z * cosTheta;

     // 変形した座標を設定
     positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
     
     // ...
   }
   ```
   
   各頂点に対して、Y座標に応じたねじれを適用しています。中央部分（Y座標が0.2から0.8の範囲）は強くねじれ、端の部分はあまりねじれないようになっています。ねじれは、X-Z平面上での回転として適用されています。

3. **縞模様の作成**:
   ```js
   // 縞模様のために色を決定（角度に基づく）
   const angle = Math.atan2(vertex.z, vertex.x);
   const normalizedAngle = (angle + Math.PI) / (Math.PI * 2); // 0～1に正規化

   // ツイストに合わせた縞模様
   const adjustedAngle = normalizedAngle + twistFactor / (Math.PI * 2);
   const colorIndex = Math.floor(adjustedAngle * 12) % 2; // 6分割して交互に色を変える

   // 色を設定
   if (colorIndex === 0) {
     colors.push(
       ((color1 >> 16) & 255) / 255,
       ((color1 >> 8) & 255) / 255,
       (color1 & 255) / 255
     );
   } else {
     colors.push(
       ((color2 >> 16) & 255) / 255,
       ((color2 >> 8) & 255) / 255,
       (color2 & 255) / 255
     );
   }
   ```
   
   各頂点の角度に基づいて、縞模様を作成しています。角度を0から1の範囲に正規化し、ツイストに合わせて調整した後、12分割して交互に色を変えています。これにより、ねじれに沿った縞模様が作成されます。

4. **両端の丸み**:
   ```js
   // 両端に半球を追加して丸くする
   const sphereGeometryTop = new THREE.SphereGeometry(
     radius,
     32,
     16,
     0,
     Math.PI * 2,
     0,
     Math.PI / 2
   );
   const sphereTop = new THREE.Mesh(sphereGeometryTop, material.clone());
   sphereTop.position.y = height / 2;
   sphereTop.rotation.x = Math.PI;

   const sphereGeometryBottom = new THREE.SphereGeometry(
     radius,
     32,
     16,
     0,
     Math.PI * 2,
     0,
     Math.PI / 2
   );
   const sphereBottom = new THREE.Mesh(sphereGeometryBottom, material.clone());
   sphereBottom.position.y = -height / 2;
   ```
   
   円柱の両端に半球を追加して、丸みを持たせています。これにより、より自然なキャンディスティックの形状になります。

### 2-3. `setupScene(scene)`

```js
static setupScene(scene) {
  // シーンの背景色を設定（明るい色）
  scene.background = new THREE.Color(0xf0f0f0);

  const objects = [];
  const geometries = [];

  // 環境光を追加
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  objects.push(ambientLight);

  // メインの光源
  const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
  mainLight.position.set(5, 5, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);
  objects.push(mainLight);

  // サブライト（反対側からの光）
  const subLight = new THREE.DirectionalLight(0xffffff, 0.4);
  subLight.position.set(-5, 3, -5);
  scene.add(subLight);
  objects.push(subLight);

  // 複数のキャンディスティックを作成
  const candySticks = [];
  const colors = [
    [0xff0000, 0xffffff], // 赤と白
    [0x00ff00, 0xffffff], // 緑と白
    [0x0000ff, 0xffffff], // 青と白
    [0xff0000, 0x00ff00], // 赤と緑
    [0xff00ff, 0xffffff], // ピンクと白
  ];

  // 5本のキャンディスティックを作成し、円形に配置
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const radius = 3;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const candyStick = createTwistedCandyStick(
      colors[i][0],
      colors[i][1],
      8 + i
    );
    candyStick.position.set(x, 0, z);
    candyStick.rotation.x = Math.PI / 8; // 少し傾ける
    candyStick.rotation.y = angle + Math.PI / 2; // キャンディを外側に向ける

    scene.add(candyStick);
    objects.push(candyStick);
    candySticks.push(candyStick);
  }

  // 中央に特別な大きなキャンディを配置
  const centerCandy = createTwistedCandyStick(0xff4500, 0xffffff, 12, 0.8, 6);
  centerCandy.position.set(0, 0, 0);
  centerCandy.rotation.x = -Math.PI / 4; // 大きく傾ける
  scene.add(centerCandy);
  objects.push(centerCandy);
  candySticks.push(centerCandy);

  return {
    objects,
    geometries,
    candySticks,
  };
}
```

ここでは、シーンのセットアップを行っています。主な特徴は以下の通りです：

1. **背景と照明の設定**:
   ```js
   scene.background = new THREE.Color(0xf0f0f0);

   const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
   scene.add(ambientLight);
   objects.push(ambientLight);

   const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
   mainLight.position.set(5, 5, 5);
   mainLight.castShadow = true;
   scene.add(mainLight);
   objects.push(mainLight);

   const subLight = new THREE.DirectionalLight(0xffffff, 0.4);
   subLight.position.set(-5, 3, -5);
   scene.add(subLight);
   objects.push(subLight);
   ```
   
   背景を明るい色（`0xf0f0f0`）に設定し、環境光とメインの光源、サブライトを追加しています。メインの光源は影を落とすように設定されています。

2. **キャンディスティックの配置**:
   ```js
   // 5本のキャンディスティックを作成し、円形に配置
   for (let i = 0; i < 5; i++) {
     const angle = (i / 5) * Math.PI * 2;
     const radius = 3;
     const x = Math.cos(angle) * radius;
     const z = Math.sin(angle) * radius;

     const candyStick = createTwistedCandyStick(
       colors[i][0],
       colors[i][1],
       8 + i
     );
     candyStick.position.set(x, 0, z);
     candyStick.rotation.x = Math.PI / 8; // 少し傾ける
     candyStick.rotation.y = angle + Math.PI / 2; // キャンディを外側に向ける

     scene.add(candyStick);
     objects.push(candyStick);
     candySticks.push(candyStick);
   }
   ```
   
   5本のキャンディスティックを円形に配置しています。各キャンディスティックは、異なる色と異なるねじれ数を持っています。また、少し傾けて、外側に向けるように回転させています。

3. **中央のキャンディスティック**:
   ```js
   // 中央に特別な大きなキャンディを配置
   const centerCandy = createTwistedCandyStick(0xff4500, 0xffffff, 12, 0.8, 6);
   centerCandy.position.set(0, 0, 0);
   centerCandy.rotation.x = -Math.PI / 4; // 大きく傾ける
   scene.add(centerCandy);
   objects.push(centerCandy);
   candySticks.push(centerCandy);
   ```
   
   中央に特別な大きなキャンディスティックを配置しています。このキャンディスティックは、オレンジ色と白色の縞模様で、より多くのねじれと大きなサイズを持っています。また、大きく傾けて配置されています。

### 2-4. `updateObjects(objects, time, mousePos)`

```js
static updateObjects(objects, time = 0, mousePos = { x: 0, y: 0 }) {
  // objects配列から回転させたいオブジェクトを探す
  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    if (!obj || !obj.rotation) continue;

    // キャンディスティックっぽいオブジェクトは回転させる
    if (obj.isMesh || obj.isGroup) {
      // 中央に近いオブジェクトは逆方向に回転
      if (Math.abs(obj.position.x) < 1 && Math.abs(obj.position.z) < 1) {
        obj.rotation.y -= 0.005;
      } else {
        // 外周のオブジェクトはゆらゆら揺れる
        const angle = Math.atan2(obj.position.z, obj.position.x);
        obj.rotation.y = angle + Math.PI / 2 + Math.sin(time * 0.3 + i) * 0.1;

        // 上下に揺らす
        obj.position.y = Math.sin(time * 0.5 + i * 0.7) * 0.2;
      }
    }
  }
}
```

ここでは、キャンディスティックのアニメーションを更新しています。主な特徴は以下の通りです：

1. **中央のキャンディスティックの回転**:
   ```js
   // 中央に近いオブジェクトは逆方向に回転
   if (Math.abs(obj.position.x) < 1 && Math.abs(obj.position.z) < 1) {
     obj.rotation.y -= 0.005;
   }
   ```
   
   中央に近いオブジェクト（中央のキャンディスティック）は、Y軸周りに逆方向にゆっくりと回転します。

2. **外周のキャンディスティックの揺れ**:
   ```js
   // 外周のオブジェクトはゆらゆら揺れる
   const angle = Math.atan2(obj.position.z, obj.position.x);
   obj.rotation.y = angle + Math.PI / 2 + Math.sin(time * 0.3 + i) * 0.1;

   // 上下に揺らす
   obj.position.y = Math.sin(time * 0.5 + i * 0.7) * 0.2;
   ```
   
   外周のオブジェクト（5本のキャンディスティック）は、Y軸周りにゆらゆらと揺れます。また、上下にも揺れるようになっています。各キャンディスティックの揺れのタイミングがずれるように、インデックスを位相差として使用しています。

---

## 3. ジオメトリの変形技術

`usecase-021` では、円柱ジオメトリの頂点を直接操作して、ねじれた形状を作り出しています。このような変形技術は、Three.jsで複雑な形状を作成する際に非常に有用です。

### 3-1. 頂点の直接操作

```js
// 頂点位置を取得して変形を適用
const positionAttribute = geometry.attributes.position;
const vertex = new THREE.Vector3();

for (let i = 0; i < positionAttribute.count; i++) {
  // 現在の頂点の座標を取得
  vertex.fromBufferAttribute(positionAttribute, i);

  // 頂点のY座標を正規化（-0.5から0.5の範囲に）
  const normalizedY = vertex.y / height;

  // ツイストの角度を計算（Y座標によって変わる）
  // 中央付近でよりねじれるようにする
  let twistFactor;
  if (normalizedY > 0.2 && normalizedY < 0.8) {
    // 中央部分は強くねじる
    twistFactor = Math.sin(normalizedY * Math.PI) * twistCount * Math.PI;
  } else {
    // 端の部分はあまりねじらない
    twistFactor = 0;
  }

  // ツイストを適用
  const x = vertex.x;
  const z = vertex.z;
  const cosTheta = Math.cos(twistFactor);
  const sinTheta = Math.sin(twistFactor);

  vertex.x = x * cosTheta - z * sinTheta;
  vertex.z = x * sinTheta + z * cosTheta;

  // 変形した座標を設定
  positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
}
```

ここでは、円柱ジオメトリの各頂点に対して、Y座標に応じたねじれを適用しています。主な手順は以下の通りです：

1. **頂点の取得**:
   ```js
   vertex.fromBufferAttribute(positionAttribute, i);
   ```
   
   `fromBufferAttribute` メソッドを使って、頂点の座標を取得しています。

2. **Y座標の正規化**:
   ```js
   const normalizedY = vertex.y / height;
   ```
   
   Y座標を高さで割ることで、-0.5から0.5の範囲に正規化しています。

3. **ねじれ角度の計算**:
   ```js
   let twistFactor;
   if (normalizedY > 0.2 && normalizedY < 0.8) {
     // 中央部分は強くねじる
     twistFactor = Math.sin(normalizedY * Math.PI) * twistCount * Math.PI;
   } else {
     // 端の部分はあまりねじらない
     twistFactor = 0;
   }
   ```
   
   Y座標に応じたねじれ角度を計算しています。中央部分（Y座標が0.2から0.8の範囲）は強くねじれ、端の部分はあまりねじれないようになっています。また、`Math.sin(normalizedY * Math.PI)` を使うことで、中央に向かってねじれが強くなり、端に向かってねじれが弱くなるようになっています。

4. **ねじれの適用**:
   ```js
   const x = vertex.x;
   const z = vertex.z;
   const cosTheta = Math.cos(twistFactor);
   const sinTheta = Math.sin(twistFactor);

   vertex.x = x * cosTheta - z * sinTheta;
   vertex.z = x * sinTheta + z * cosTheta;
   ```
   
   ねじれは、X-Z平面上での回転として適用されています。回転行列を使って、X座標とZ座標を変換しています。

5. **変形した座標の設定**:
   ```js
   positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
   ```
   
   `setXYZ` メソッドを使って、変形した座標を設定しています。

### 3-2. 法線の再計算

```js
// 法線を再計算
geometry.computeVertexNormals();
```

頂点の位置を変更した後は、法線を再計算する必要があります。法線は、ライティング計算に使用されるため、正しく設定されていないと、オブジェクトの見た目が不自然になります。

`computeVertexNormals` メソッドは、頂点の位置から法線を自動的に計算します。これにより、変形後のジオメトリに対して、正しいライティングが適用されます。

### 3-3. 頂点カラーの設定

```js
// 縞模様のために色を決定（角度に基づく）
const angle = Math.atan2(vertex.z, vertex.x);
const normalizedAngle = (angle + Math.PI) / (Math.PI * 2); // 0～1に正規化

// ツイストに合わせた縞模様
const adjustedAngle = normalizedAngle + twistFactor / (Math.PI * 2);
const colorIndex = Math.floor(adjustedAngle * 12) % 2; // 6分割して交互に色を変える

// 色を設定
if (colorIndex === 0) {
  colors.push(
    ((color1 >> 16) & 255) / 255,
    ((color1 >> 8) & 255) / 255,
    (color1 & 255) / 255
  );
} else {
  colors.push(
    ((color2 >> 16) & 255) / 255,
    ((color2 >> 8) & 255) / 255,
    (color2 & 255) / 255
  );
}
```

頂点カラーを使って、縞模様を作成しています。主な手順は以下の通りです：

1. **角度の計算**:
   ```js
   const angle = Math.atan2(vertex.z, vertex.x);
   const normalizedAngle = (angle + Math.PI) / (Math.PI * 2); // 0～1に正規化
   ```
   
   `Math.atan2` 関数を使って、X-Z平面上での角度を計算しています。この角度を0から1の範囲に正規化しています。

2. **ねじれに合わせた角度の調整**:
   ```js
   const adjustedAngle = normalizedAngle + twistFactor / (Math.PI * 2);
   ```
   
   ねじれに合わせて角度を調整しています。これにより、ねじれに沿った縞模様が作成されます。

3. **色の決定**:
   ```js
   const colorIndex = Math.floor(adjustedAngle * 12) % 2; // 6分割して交互に色を変える
   ```
   
   調整された角度を12分割し、偶数と奇数で異なる色を割り当てています。これにより、6本の縞模様が作成されます。

4. **色の設定**:
   ```js
   if (colorIndex === 0) {
     colors.push(
       ((color1 >> 16) & 255) / 255,
       ((color1 >> 8) & 255) / 255,
       (color1 & 255) / 255
     );
   } else {
     colors.push(
       ((color2 >> 16) & 255) / 255,
       ((color2 >> 8) & 255) / 255,
       (color2 & 255) / 255
     );
   }
   ```
   
   `colorIndex` に応じて、`color1` または `color2` を設定しています。色は、0から1の範囲のRGB値として設定されています。

---

## 4. 頂点カラーを使った縞模様の表現

`usecase-021` では、頂点カラーを使って縞模様を表現しています。頂点カラーは、各頂点に色を割り当てる方法で、テクスチャを使わずに色のパターンを作成することができます。

### 4-1. 頂点カラーの設定

```js
// BufferAttributeとして色を設定
geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
```

`setAttribute` メソッドを使って、頂点カラーを設定しています。`colors` 配列には、各頂点のRGB値が格納されています。

### 4-2. 頂点カラーを使用するマテリアル

```js
// 頂点カラーを使用するマテリアル
const material = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.3,
  metalness: 0.3,
});
```

`MeshStandardMaterial` の `vertexColors` プロパティを `true` に設定することで、頂点カラーを使用するようになります。これにより、各頂点に割り当てられた色が、ジオメトリ全体に補間されて表示されます。

### 4-3. 縞模様の作成

```js
// 縞模様のために色を決定（角度に基づく）
const angle = Math.atan2(vertex.z, vertex.x);
const normalizedAngle = (angle + Math.PI) / (Math.PI * 2); // 0～1に正規化

// ツイストに合わせた縞模様
const adjustedAngle = normalizedAngle + twistFactor / (Math.PI * 2);
const colorIndex = Math.floor(adjustedAngle * 12) % 2; // 6分割して交互に色を変える
```

角度に基づいて縞模様を作成しています。角度を12分割し、偶数と奇数で異なる色を割り当てることで、6本の縞模様が作成されます。また、ねじれに合わせて角度を調整することで、ねじれに沿った縞模様が作成されます。

---

## 5. 応用例：様々な変形技術

`usecase-021` で使用されているねじれの変形技術は、他の様々な変形にも応用することができます。以下に、いくつかの応用例を示します。

### 5-1. 波状の変形

```js
// 波状の変形を適用
for (let i = 0; i < positionAttribute.count; i++) {
  vertex.fromBufferAttribute(positionAttribute, i);
  
  // Y座標に応じた波状の変形
  const wave = Math.sin(vertex.y * 5) * 0.1;
  
  // X座標とZ座標に波状の変形を適用
  vertex.x += wave;
  vertex.z += wave;
  
  positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
}
```

Y座標に応じた波状の変形を適用することで、波打つような形状を作成することができます。

### 5-2. 膨張・収縮の変形

```js
// 膨張・収縮の変形を適用
for (let i = 0; i < positionAttribute.count; i++) {
  vertex.fromBufferAttribute(positionAttribute, i);
  
  // Y座標に応じた膨張・収縮
  const scale = 1 + Math.sin(vertex.y * 3) * 0.2;
  
  // 中心からの距離を計算
  const distance = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
  
  // 新しい距離を計算
  const newDistance = distance * scale;
  
  // スケーリング係数
  const factor = newDistance / distance;
  
  // X座標とZ座標をスケーリング
  vertex.x *= factor;
  vertex.z *= factor;
  
  positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
}
```

Y座標に応じた膨張・収縮を適用することで、太ったり細くなったりする形状を作成することができます。

### 5-3. ノイズを使った変形

```js
// ノイズを使った変形を適用
for (let i = 0; i < positionAttribute.count; i++) {
  vertex.fromBufferAttribute(positionAttribute, i);
  
  // ノイズ関数（簡易版）
  const noise = (x, y, z) => {
    return Math.sin(x * 10) * Math.sin(y * 10) * Math.sin(z * 10);
  };
  
  // ノイズを計算
  const noiseValue = noise(vertex.x, vertex.y, vertex.z) * 0.1;
  
  // 法線方向にノイズを適用
  vertex.x += noiseValue;
  vertex.y += noiseValue;
  vertex.z += noiseValue;
  
  positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
}
```

ノイズ関数を使った変形を適用することで、自然な凹凸を持つ形状を作成することができます。実際のノイズ関数としては、Perlin NoiseやSimplex Noiseなどがよく使用されます。

---

## 6. まとめ

「**Usecase-021: Twisted Candy Stick**」では、Three.jsでねじれたキャンディスティックを表現する方法を学びました。

主なポイントは以下の通りです：

1. **ジオメトリの変形**: 円柱ジオメトリの頂点を直接操作して、ねじれた形状を作成しました。
2. **頂点カラー**: 頂点カラーを使って、縞模様を表現しました。
3. **複数のオブジェクト**: 複数のキャンディスティックを円形に配置し、中央に特別な大きなキャンディスティックを配置しました。
4. **アニメーション**: 各キャンディスティックが独立して揺れるアニメーションを適用しました。
5. **応用例**: ねじれの変形技術は、波状の変形や膨張・収縮の変形、ノイズを使った変形など、様々な変形に応用することができます。

これらの技術を組み合わせることで、魅力的なキャンディスティックの表現を実現することができます。また、これらの技術は、他の様々な形状の表現にも応用することができます。

次のユースケースでは、さらに複雑な形状や動きを持つ3Dシーンを探索していきます。
