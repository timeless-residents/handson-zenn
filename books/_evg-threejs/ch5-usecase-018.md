---
title: Usecase-018 Night City Windows Effect
free: true
---
# Usecase-018: Night City Windows Effect

**本章では、`usecases/usecase-018` ディレクトリに格納されている「Night City Windows Effect」のコードを解説します。**  
このサンプルは、夜の都市の風景を模した建物群と、ランダムに点滅する窓の光を実装しています。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、発光マテリアルと透明度を活用した例となっています。

---

## 1. 夜の都市景観の表現

これまでのユースケースでは、様々な形状とアニメーション効果を扱ってきました。`usecase-018` では、夜の都市景観を表現するために、複数の建物と、それらの窓から漏れる光を表現しています。

このサンプルでは、暗い背景に対して、建物の窓から漏れる光をランダムに点滅させることで、生き生きとした夜の都市の雰囲気を作り出しています。窓の光は、色や明るさがランダムに変化し、実際の都市の窓の光のように見えます。

`usecase-018` では、以下の特徴を持つシーンを作成しています：

1. **複数の建物**: ランダムな高さと位置を持つ複数の建物
2. **窓の光**: 建物の各面にランダムに配置された窓の光
3. **点滅アニメーション**: ランダムに点滅する窓の光
4. **色の変化**: 窓の光の色がランダムに変化
5. **輝度の変化**: 窓の光の輝度が時間とともに変化
6. **建物の揺れ**: 建物がわずかに揺れるアニメーション

これらの効果を組み合わせることで、生き生きとした夜の都市景観を表現しています。

---

## 2. `usecase-018/index.js` コード詳細

それでは、実際の `usecase-018` のコードを詳しく見ていきましょう。

```js
// usecase-018/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase018 extends UseCaseBase {
  static metadata = {
    id: "018",
    title: "Night City Windows Effect",
    description:
      "Building with emissive lights resembling night cityscape windows",
    categories: ["Geometry", "Animation", "Lighting", "Cityscape"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
    this.windowLights = [];
  }

  static setupScene(scene) {
    // 背景を黒に設定
    scene.background = new THREE.Color(0x000000);

    // ライトの設定
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    // 月光のような青みがかった弱い指向性ライト
    const moonLight = new THREE.DirectionalLight(0x8888ff, 0.2);
    moonLight.position.set(10, 8, 5);
    scene.add(moonLight);

    const objects = [];
    const geometries = [];
    const windowLights = [];

    // 複数の建物を作成
    const buildingCount = 15;

    for (let i = 0; i < buildingCount; i++) {
      // 建物パラメータをランダム化
      const width = 0.4 + Math.random() * 0.6;
      const depth = 0.4 + Math.random() * 0.6;
      const height = 1 + Math.random() * 4;

      // グリッド位置を計算
      const col = i % Math.sqrt(buildingCount);
      const row = Math.floor(i / Math.sqrt(buildingCount));

      // グリッド内で位置をランダム化
      const x =
        (col - Math.sqrt(buildingCount) / 2) * 1.5 +
        (Math.random() * 0.5 - 0.25);
      const z =
        (row - Math.sqrt(buildingCount) / 2) * 1.5 +
        (Math.random() * 0.5 - 0.25);

      // 建物ジオメトリ作成
      const geometry = new THREE.BoxGeometry(width, height, depth);

      // 建物マテリアル作成 - 暗めの色
      const material = new THREE.MeshPhongMaterial({
        color: 0x222222,
        shininess: 0,
        specular: 0x000000,
      });

      const building = new THREE.Mesh(geometry, material);
      building.position.set(x, height / 2, z);

      scene.add(building);
      objects.push(building);
      geometries.push(geometry);

      // この建物の窓を生成
      const buildingWindows = createWindowsForBuilding(building, scene);
      windowLights.push(...buildingWindows);
    }

    // 地面を作成
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: 0x111111,
      shininess: 0,
      specular: 0x000000,
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);
    objects.push(ground);
    geometries.push(groundGeometry);

    return { objects, geometries, windowLights };
  }

  static updateObjects(objects, windowLights, time) {
    // 窓の点滅を更新
    if (windowLights && Array.isArray(windowLights)) {
      windowLights.forEach((windowLight, index) => {
        // ランダムに点滅
        if (Math.random() < 0.01) {
          // 現在の状態を反転
          if (windowLight.material.opacity > 0.5) {
            // 消灯
            windowLight.material.opacity = Math.random() * 0.2;
          } else {
            // 点灯
            windowLight.material.opacity = 0.5 + Math.random() * 0.5;

            // 色を時々変更
            if (Math.random() < 0.3) {
              const colorType = Math.random();
              if (colorType < 0.7) {
                // 暖色系
                windowLight.material.color.setHSL(0.1, 0.8, 0.6);
              } else if (colorType < 0.9) {
                // 青白色
                windowLight.material.color.setHSL(0.6, 0.8, 0.6);
              } else {
                // 特殊色（赤やアクセント）
                windowLight.material.color.setHSL(Math.random(), 0.9, 0.7);
              }
            }
          }
        }

        // 輝度を時間によって少し変動させる
        const pulseIntensity = 0.8 + Math.sin(time * 2 + index) * 0.2;
        // MeshBasicMaterialはemissiveIntensityプロパティを持たないので、
        // 代わりに不透明度を変えて明るさを変動させる
        const currentOpacity = windowLight.material.opacity;
        if (currentOpacity > 0.3) {
          // 点灯している窓のみ
          windowLight.material.opacity = currentOpacity * pulseIntensity;
        }
      });
    }

    // 建物をわずかに揺らす
    if (objects && Array.isArray(objects)) {
      objects.forEach((object, index) => {
        if (index < objects.length - 1) {
          // 地面は除外
          object.position.y += Math.sin(time * 0.5 + index) * 0.0005;
        }
      });
    }
  }

  async init() {
    const { objects, windowLights } = GeometryShowcase018.setupScene(
      this.scene
    );
    objects.forEach((obj) => this.objects.add(obj));
    this.windowLights = windowLights;
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase018.updateObjects(
      Array.from(this.objects),
      this.windowLights,
      this.time
    );
  }

  static getThumbnailCameraPosition() {
    return {
      position: [8, 5, 8],
      target: [0, 1, 0],
    };
  }

  // getThumbnailBlob と createPreview メソッドは省略
}

// 建物の窓を生成するヘルパー関数
function createWindowsForBuilding(building, scene) {
  const windowLights = [];
  const buildingSize = new THREE.Vector3();
  new THREE.Box3().setFromObject(building).getSize(buildingSize);

  // 窓の数を決定
  const windowColumns = Math.ceil(buildingSize.x * 10);
  const windowRows = Math.ceil(buildingSize.y * 5);
  const windowDepth = Math.ceil(buildingSize.z * 10);

  // 窓の配置用パラメータ
  const windowWidth = buildingSize.x * 0.1;
  const windowHeight = buildingSize.y * 0.05;
  const offsetX = buildingSize.x / 2 - windowWidth / 2;
  const offsetY = buildingSize.y / 2 - windowHeight / 2;
  const offsetZ = buildingSize.z / 2 - windowWidth / 2;

  // 窓のマテリアルを一度だけ作成（最適化のため）
  const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);

  // 4面分の窓を生成（前面、背面、左面、右面）
  const sides = [
    { axis: "z", sign: 1, rotate: [0, 0, 0] },
    { axis: "z", sign: -1, rotate: [0, Math.PI, 0] },
    { axis: "x", sign: 1, rotate: [0, Math.PI / 2, 0] },
    { axis: "x", sign: -1, rotate: [0, -Math.PI / 2, 0] },
  ];

  // 各面について窓を生成
  sides.forEach((side) => {
    const rows = side.axis === "z" ? windowRows : windowRows;
    const columns = side.axis === "z" ? windowColumns : windowDepth;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // 窓をランダムに配置（すべての可能な位置に窓があるわけではない）
        if (Math.random() < 0.4) {
          // 窓の輝度と不透明度
          const brightness = 0.5 + Math.random() * 0.5;
          const opacity =
            Math.random() < 0.7
              ? 0.8 + Math.random() * 0.2
              : 0.1 + Math.random() * 0.2;

          // 窓の色
          const colorType = Math.random();
          const hue =
            colorType < 0.7 ? 0.1 : colorType < 0.9 ? 0.6 : Math.random();
          const saturation = 0.8;
          const lightness = 0.6;

          // 発光マテリアル - MeshBasicMaterialを使用
          const windowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(hue, saturation, lightness),
            side: THREE.FrontSide,
            transparent: true,
            opacity: opacity,
          });

          const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);

          // 窓の位置を計算
          const x =
            side.axis === "z"
              ? (col / columns) * buildingSize.x - offsetX
              : side.sign * (buildingSize.z / 2 + 0.01);

          const y = (row / rows) * buildingSize.y - offsetY;

          const z =
            side.axis === "x"
              ? (col / columns) * buildingSize.z - offsetZ
              : side.sign * (buildingSize.x / 2 + 0.01);

          // 建物の位置を基準に窓の位置を設定
          windowMesh.position.set(
            building.position.x + x,
            building.position.y + y,
            building.position.z + z
          );

          // 面の方向に応じて回転
          windowMesh.rotation.set(
            side.rotate[0],
            side.rotate[1],
            side.rotate[2]
          );

          scene.add(windowMesh);
          windowLights.push(windowMesh);
        }
      }
    }
  });

  return windowLights;
}
```

### 2-1. `metadata`

```js
static metadata = {
  id: "018",
  title: "Night City Windows Effect",
  description:
    "Building with emissive lights resembling night cityscape windows",
  categories: ["Geometry", "Animation", "Lighting", "Cityscape"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `018`、 `title` は「Night City Windows Effect」など。
- `description` には、夜の都市景観の窓の光を模した効果について言及されています。
- `categories` に「Lighting」と「Cityscape」が追加されており、照明効果と都市景観を表現していることを示しています。

### 2-2. `constructor`

```js
constructor(scene) {
  super(scene);
  this.time = 0;
  this.windowLights = [];
}
```

コンストラクタでは、`windowLights` という新しいプロパティを追加しています。これは、建物の窓の光を表すオブジェクトを保存するための配列です。

### 2-3. `setupScene(scene)`

```js
static setupScene(scene) {
  // 背景を黒に設定
  scene.background = new THREE.Color(0x000000);

  // ライトの設定
  const ambientLight = new THREE.AmbientLight(0x222222);
  scene.add(ambientLight);

  // 月光のような青みがかった弱い指向性ライト
  const moonLight = new THREE.DirectionalLight(0x8888ff, 0.2);
  moonLight.position.set(10, 8, 5);
  scene.add(moonLight);

  const objects = [];
  const geometries = [];
  const windowLights = [];

  // 複数の建物を作成
  const buildingCount = 15;

  for (let i = 0; i < buildingCount; i++) {
    // 建物パラメータをランダム化
    const width = 0.4 + Math.random() * 0.6;
    const depth = 0.4 + Math.random() * 0.6;
    const height = 1 + Math.random() * 4;

    // グリッド位置を計算
    const col = i % Math.sqrt(buildingCount);
    const row = Math.floor(i / Math.sqrt(buildingCount));

    // グリッド内で位置をランダム化
    const x =
      (col - Math.sqrt(buildingCount) / 2) * 1.5 +
      (Math.random() * 0.5 - 0.25);
    const z =
      (row - Math.sqrt(buildingCount) / 2) * 1.5 +
      (Math.random() * 0.5 - 0.25);

    // 建物ジオメトリ作成
    const geometry = new THREE.BoxGeometry(width, height, depth);

    // 建物マテリアル作成 - 暗めの色
    const material = new THREE.MeshPhongMaterial({
      color: 0x222222,
      shininess: 0,
      specular: 0x000000,
    });

    const building = new THREE.Mesh(geometry, material);
    building.position.set(x, height / 2, z);

    scene.add(building);
    objects.push(building);
    geometries.push(geometry);

    // この建物の窓を生成
    const buildingWindows = createWindowsForBuilding(building, scene);
    windowLights.push(...buildingWindows);
  }

  // 地面を作成
  const groundGeometry = new THREE.PlaneGeometry(20, 20);
  const groundMaterial = new THREE.MeshPhongMaterial({
    color: 0x111111,
    shininess: 0,
    specular: 0x000000,
  });

  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  scene.add(ground);
  objects.push(ground);
  geometries.push(groundGeometry);

  return { objects, geometries, windowLights };
}
```

ここでは、夜の都市景観を表現するために、複数の建物と窓の光を作成しています。主な特徴は以下の通りです：

1. **背景と照明の設定**:
   ```js
   scene.background = new THREE.Color(0x000000);

   const ambientLight = new THREE.AmbientLight(0x222222);
   scene.add(ambientLight);

   const moonLight = new THREE.DirectionalLight(0x8888ff, 0.2);
   moonLight.position.set(10, 8, 5);
   scene.add(moonLight);
   ```
   
   背景を黒に設定し、暗い環境光と青みがかった弱い指向性ライト（月光）を追加しています。これにより、夜の雰囲気が作り出されています。

2. **建物の作成**:
   ```js
   const buildingCount = 15;

   for (let i = 0; i < buildingCount; i++) {
     // 建物パラメータをランダム化
     const width = 0.4 + Math.random() * 0.6;
     const depth = 0.4 + Math.random() * 0.6;
     const height = 1 + Math.random() * 4;

     // グリッド位置を計算
     const col = i % Math.sqrt(buildingCount);
     const row = Math.floor(i / Math.sqrt(buildingCount));

     // グリッド内で位置をランダム化
     const x =
       (col - Math.sqrt(buildingCount) / 2) * 1.5 +
       (Math.random() * 0.5 - 0.25);
     const z =
       (row - Math.sqrt(buildingCount) / 2) * 1.5 +
       (Math.random() * 0.5 - 0.25);

     // 建物ジオメトリ作成
     const geometry = new THREE.BoxGeometry(width, height, depth);

     // 建物マテリアル作成 - 暗めの色
     const material = new THREE.MeshPhongMaterial({
       color: 0x222222,
       shininess: 0,
       specular: 0x000000,
     });

     const building = new THREE.Mesh(geometry, material);
     building.position.set(x, height / 2, z);

     scene.add(building);
     objects.push(building);
     geometries.push(geometry);

     // この建物の窓を生成
     const buildingWindows = createWindowsForBuilding(building, scene);
     windowLights.push(...buildingWindows);
   }
   ```
   
   15個の建物を作成しています。各建物の特徴は以下の通りです：
   
   - **サイズ**: 幅、奥行き、高さがランダムに設定されています。
   - **位置**: グリッド状に配置され、さらに位置がランダムに調整されています。
   - **マテリアル**: 暗い色（`0x222222`）で、光沢がなく、反射もない設定になっています。
   - **窓**: 各建物に対して、`createWindowsForBuilding` 関数を使って窓を生成しています。

3. **地面の作成**:
   ```js
   const groundGeometry = new THREE.PlaneGeometry(20, 20);
   const groundMaterial = new THREE.MeshPhongMaterial({
     color: 0x111111,
     shininess: 0,
     specular: 0x000000,
   });

   const ground = new THREE.Mesh(groundGeometry, groundMaterial);
   ground.rotation.x = -Math.PI / 2;
   ground.position.y = 0;
   scene.add(ground);
   objects.push(ground);
   geometries.push(groundGeometry);
   ```
   
   地面を作成しています。地面は、暗い色（`0x111111`）で、光沢がなく、反射もない設定になっています。

### 2-4. `updateObjects(objects, windowLights, time)`

```js
static updateObjects(objects, windowLights, time) {
  // 窓の点滅を更新
  if (windowLights && Array.isArray(windowLights)) {
    windowLights.forEach((windowLight, index) => {
      // ランダムに点滅
      if (Math.random() < 0.01) {
        // 現在の状態を反転
        if (windowLight.material.opacity > 0.5) {
          // 消灯
          windowLight.material.opacity = Math.random() * 0.2;
        } else {
          // 点灯
          windowLight.material.opacity = 0.5 + Math.random() * 0.5;

          // 色を時々変更
          if (Math.random() < 0.3) {
            const colorType = Math.random();
            if (colorType < 0.7) {
              // 暖色系
              windowLight.material.color.setHSL(0.1, 0.8, 0.6);
            } else if (colorType < 0.9) {
              // 青白色
              windowLight.material.color.setHSL(0.6, 0.8, 0.6);
            } else {
              // 特殊色（赤やアクセント）
              windowLight.material.color.setHSL(Math.random(), 0.9, 0.7);
            }
          }
        }
      }

      // 輝度を時間によって少し変動させる
      const pulseIntensity = 0.8 + Math.sin(time * 2 + index) * 0.2;
      // MeshBasicMaterialはemissiveIntensityプロパティを持たないので、
      // 代わりに不透明度を変えて明るさを変動させる
      const currentOpacity = windowLight.material.opacity;
      if (currentOpacity > 0.3) {
        // 点灯している窓のみ
        windowLight.material.opacity = currentOpacity * pulseIntensity;
      }
    });
  }

  // 建物をわずかに揺らす
  if (objects && Array.isArray(objects)) {
    objects.forEach((object, index) => {
      if (index < objects.length - 1) {
        // 地面は除外
        object.position.y += Math.sin(time * 0.5 + index) * 0.0005;
      }
    });
  }
}
```

ここでは、窓の光と建物のアニメーションを更新しています。主な特徴は以下の通りです：

1. **窓の点滅アニメーション**:
   ```js
   // ランダムに点滅
   if (Math.random() < 0.01) {
     // 現在の状態を反転
     if (windowLight.material.opacity > 0.5) {
       // 消灯
       windowLight.material.opacity = Math.random() * 0.2;
     } else {
       // 点灯
       windowLight.material.opacity = 0.5 + Math.random() * 0.5;

       // 色を時々変更
       if (Math.random() < 0.3) {
         const colorType = Math.random();
         if (colorType < 0.7) {
           // 暖色系
           windowLight.material.color.setHSL(0.1, 0.8, 0.6);
         } else if (colorType < 0.9) {
           // 青白色
           windowLight.material.color.setHSL(0.6, 0.8, 0.6);
         } else {
           // 特殊色（赤やアクセント）
           windowLight.material.color.setHSL(Math.random(), 0.9, 0.7);
         }
       }
     }
   }
   ```
   
   各窓の光が1%の確率でランダムに点滅します。点灯状態と消灯状態を切り替え、点灯時には色も変化することがあります。色は、暖色系（黄色）、青白色、特殊色（ランダムな色）の3種類があります。

2. **輝度の変化**:
   ```js
   // 輝度を時間によって少し変動させる
   const pulseIntensity = 0.8 + Math.sin(time * 2 + index) * 0.2;
   // MeshBasicMaterialはemissiveIntensityプロパティを持たないので、
   // 代わりに不透明度を変えて明るさを変動させる
   const currentOpacity = windowLight.material.opacity;
   if (currentOpacity > 0.3) {
     // 点灯している窓のみ
     windowLight.material.opacity = currentOpacity * pulseIntensity;
   }
   ```
   
   点灯している窓の光の輝度が時間とともに変化します。これにより、窓の光がわずかに明滅しているように見えます。

3. **建物の揺れ**:
   ```js
   // 建物をわずかに揺らす
   if (objects && Array.isArray(objects)) {
     objects.forEach((object, index) => {
       if (index < objects.length - 1) {
         // 地面は除外
         object.position.y += Math.sin(time * 0.5 + index) * 0.0005;
       }
     });
   }
   ```
   
   各建物がわずかに上下に揺れます。揺れの振幅は非常に小さく（0.0005）、周波数も低い（0.5）ため、微妙な揺れになっています。これにより、建物が生き生きとしているように見えます。

### 2-5. `createWindowsForBuilding(building, scene)`

```js
function createWindowsForBuilding(building, scene) {
  const windowLights = [];
  const buildingSize = new THREE.Vector3();
  new THREE.Box3().setFromObject(building).getSize(buildingSize);

  // 窓の数を決定
  const windowColumns = Math.ceil(buildingSize.x * 10);
  const windowRows = Math.ceil(buildingSize.y * 5);
  const windowDepth = Math.ceil(buildingSize.z * 10);

  // 窓の配置用パラメータ
  const windowWidth = buildingSize.x * 0.1;
  const windowHeight = buildingSize.y * 0.05;
  const offsetX = buildingSize.x / 2 - windowWidth / 2;
  const offsetY = buildingSize.y / 2 - windowHeight / 2;
  const offsetZ = buildingSize.z / 2 - windowWidth / 2;

  // 窓のマテリアルを一度だけ作成（最適化のため）
  const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);

  // 4面分の窓を生成（前面、背面、左面、右面）
  const sides = [
    { axis: "z", sign: 1, rotate: [0, 0, 0] },
    { axis: "z", sign: -1, rotate: [0, Math.PI, 0] },
    { axis: "x", sign: 1, rotate: [0, Math.PI / 2, 0] },
    { axis: "x", sign: -1, rotate: [0, -Math.PI / 2, 0] },
  ];

  // 各面について窓を生成
  sides.forEach((side) => {
    const rows = side.axis === "z" ? windowRows : windowRows;
    const columns = side.axis === "z" ? windowColumns : windowDepth;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // 窓をランダムに配置（すべての可能な位置に窓があるわけではない）
        if (Math.random() < 0.4) {
          // 窓の輝度と不透明度
          const brightness = 0.5 + Math.random() * 0.5;
          const opacity =
            Math.random() < 0.7
              ? 0.8 + Math.random() * 0.2
              : 0.1 + Math.random() * 0.2;

          // 窓の色
          const colorType = Math.random();
          const hue =
            colorType < 0.7 ? 0.1 : colorType < 0.9 ? 0.6 : Math.random();
          const saturation = 0.8;
          const lightness = 0.6;

          // 発光マテリアル - MeshBasicMaterialを使用
          const windowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(hue, saturation, lightness),
            side: THREE.FrontSide,
            transparent: true,
            opacity: opacity,
          });

          const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);

          // 窓の位置を計算
          const x =
            side.axis === "z"
              ? (col / columns) * buildingSize.x - offsetX
              : side.sign * (buildingSize.z / 2 + 0.01);

          const y = (row / rows) * buildingSize.y - offsetY;

          const z =
            side.axis === "x"
              ? (col / columns) * buildingSize.z - offsetZ
              : side.sign * (buildingSize.x / 2 + 0.01);

          // 建物の位置を基準に窓の位置を設定
          windowMesh.position.set(
            building.position.x + x,
            building.position.y + y,
            building.position.z + z
          );

          // 面の方向に応じて回転
          windowMesh.rotation.set(
            side.rotate[0],
            side.rotate[1],
            side.rotate[2]
          );

          scene.add(windowMesh);
          windowLights.push(windowMesh);
        }
      }
    }
  });

  return windowLights;
}
```

この関数は、建物に窓の光を追加するためのヘルパー関数です。主な特徴は以下の通りです：

1. **建物のサイズを取得**:
   ```js
   const buildingSize = new THREE.Vector3();
   new THREE.Box3().setFromObject(building).getSize(buildingSize);
   ```
   
   建物のサイズを取得して、窓の配置に使用します。

2. **窓の数とサイズを決定**:
   ```js
   const windowColumns = Math.ceil(buildingSize.x * 10);
   const windowRows = Math.ceil(buildingSize.y * 5);
   const windowDepth = Math.ceil(buildingSize.z * 10);

   const windowWidth = buildingSize.x * 0.1;
   const windowHeight = buildingSize.y * 0.05;
   ```
   
   建物のサイズに基づいて、窓の数とサイズを決定します。

3. **4面分の窓を生成**:
   ```js
   const sides = [
     { axis: "z", sign: 1, rotate: [0, 0, 0] },
     { axis: "z", sign: -1, rotate: [0, Math.PI, 0] },
     { axis: "x", sign: 1, rotate: [0, Math.PI / 2, 0] },
     { axis: "x", sign: -1, rotate: [0, -Math.PI / 2, 0] },
   ];
   ```
   
   建物の4つの面（前面、背面、左面、右面）に窓を配置します。

4. **窓をランダムに配置**:
   ```js
   if (Math.random() < 0.4) {
     // ...
   }
   ```
   
   40%の確率で窓を配置します。これにより、すべての可能な位置に窓があるわけではなく、ランダムな配置になります。

5. **窓の色と輝度を設定**:
   ```js
   const colorType = Math.random();
   const hue =
     colorType < 0.7 ? 0.1 : colorType < 0.9 ? 0.6 : Math.random();
   const saturation = 0.8;
   const lightness = 0.6;
   ```
   
   窓の色をランダムに設定します。70%の確率で暖色系（黄色）、20%の確率で青白色、10%の確率で特殊色（ランダムな色）になります。

6. **発光マテリアルを使用**:
   ```js
   const windowMaterial = new THREE.MeshBasicMaterial({
     color: new THREE.Color().setHSL(hue, saturation, lightness),
     side: THREE.FrontSide,
     transparent: true,
     opacity: opacity,
   });
   ```
   
   `MeshBasicMaterial` を使用して、発光効果を表現しています。このマテリアルは、光源の影響を受けず、常に設定した色で表示されます。また、透明度を設定することで、窓の明るさを調整しています。

7. **窓の位置と回転を設定**:
   ```js
   const x =
     side.axis === "z"
       ? (col / columns) * buildingSize.x - offsetX
       : side.sign * (buildingSize.z / 2 + 0.01);

   const y = (row / rows) * buildingSize.y - offsetY;

   const z =
     side.axis === "x"
       ? (col / columns) * buildingSize.z - offsetZ
       : side.sign * (buildingSize.x / 2 + 0.01);

   windowMesh.position.set(
     building.position.x + x,
     building.position.y + y,
     building.position.z + z
   );

   windowMesh.rotation.set(
     side.rotate[0],
     side.rotate[1],
     side.rotate[2]
   );
   ```
   
   窓の位置と回転を、建物の面に合わせて設定しています。窓は建物の表面に少し浮かせて配置されています（`+ 0.01`）。

---

## 3. MeshBasicMaterialを使った発光効果

`usecase-018` では、`MeshBasicMaterial` を使って窓の光を表現しています。`MeshBasicMaterial` は、光源の影響を受けず、常に設定した色で表示されるマテリアルです。これにより、暗い環境でも明るく見える発光効果を表現することができます。

### 3-1. MeshBasicMaterialの特徴

```js
const windowMaterial = new THREE.MeshBasicMaterial({
  color: new THREE.Color().setHSL(hue, saturation, lightness),
  side: THREE.FrontSide,
  transparent: true,
  opacity: opacity,
});
```

`MeshBasicMaterial` の主な特徴は以下の通りです：

1. **光源の影響を受けない**: 光源の有無や位置に関係なく、常に設定した色で表示されます。
2. **シェーディングなし**: 表面の法線や光源の方向に基づくシェーディングが適用されません。
3. **発光効果**: 暗い環境でも明るく見えるため、発光効果を表現するのに適しています。
4. **透明度の設定**: `transparent` と `opacity` を設定することで、透明度を調整できます。

これらの特徴により、`MeshBasicMaterial` は、窓の光のような発光効果を表現するのに適しています。

### 3-2. 透明度を使った明るさの調整

```js
const opacity =
  Math.random() < 0.7
    ? 0.8 + Math.random() * 0.2
    : 0.1 + Math.random() * 0.2;
```

窓の光の明るさは、透明度（`opacity`）を使って調整しています。70%の確率で明るい窓（不透明度0.8～1.0）、30%の確率で暗い窓（不透明度0.1～0.3）になります。

また、アニメーション中にも透明度を変化させることで、窓の光の明るさを調整しています：

```js
const pulseIntensity = 0.8 + Math.sin(time * 2 + index) * 0.2;
const currentOpacity = windowLight.material.opacity;
if (currentOpacity > 0.3) {
  windowLight.material.opacity = currentOpacity * pulseIntensity;
}
```

これにより、窓の光がわずかに明滅しているように見えます。

### 3-3. HSL色空間を使った色の設定

```js
const colorType = Math.random();
const hue =
  colorType < 0.7 ? 0.1 : colorType < 0.9 ? 0.6 : Math.random();
const saturation = 0.8;
const lightness = 0.6;

windowMaterial.color.setHSL(hue, saturation, lightness);
```

窓の色は、HSL色空間を使って設定しています。HSL色空間は、色相（Hue）、彩度（Saturation）、明度（Lightness）の3つの要素で色を表現します。

- **色相（Hue）**: 0～1の範囲で、色相環上の位置を表します。0と1は赤、1/3は緑、2/3は青に対応します。
- **彩度（Saturation）**: 0～1の範囲で、色の鮮やかさを表します。0はグレー、1は鮮やかな色になります。
- **明度（Lightness）**: 0～1の範囲で、色の明るさを表します。0は黒、0.5は通常の明るさ、1は白になります。

`usecase-018` では、色相をランダムに変化させることで、様々な色の窓の光を表現しています。彩度と明度は固定値（彩度0.8、明度0.6）に設定されています。

---

## 4. ランダム性を活用した都市景観の表現

`usecase-018` では、ランダム性を活用して、より自然な都市景観を表現しています。

### 4-1. 建物のランダム化

```js
const width = 0.4 + Math.random() * 0.6;
const depth = 0.4 + Math.random() * 0.6;
const height = 1 + Math.random() * 4;

const x =
  (col - Math.sqrt(buildingCount) / 2) * 1.5 +
  (Math.random() * 0.5 - 0.25);
const z =
  (row - Math.sqrt(buildingCount) / 2) * 1.5 +
  (Math.random() * 0.5 - 0.25);
```

建物のサイズと位置をランダムに設定することで、より自然な都市景観を表現しています。

- **サイズのランダム化**: 幅、奥行き、高さがランダムに設定されています。特に高さは1～5の範囲で大きく変化します。
- **位置のランダム化**: グリッド状に配置された後、位置がランダムに調整されています。これにより、整然とした配置ではなく、より自然な配置になります。

### 4-2. 窓のランダム化

```js
if (Math.random() < 0.4) {
  // 窓の輝度と不透明度
  const brightness = 0.5 + Math.random() * 0.5;
  const opacity =
    Math.random() < 0.7
      ? 0.8 + Math.random() * 0.2
      : 0.1 + Math.random() * 0.2;

  // 窓の色
  const colorType = Math.random();
  const hue =
    colorType < 0.7 ? 0.1 : colorType < 0.9 ? 0.6 : Math.random();
}
```

窓の配置、明るさ、色をランダムに設定することで、より自然な窓の光を表現しています。

- **配置のランダム化**: 40%の確率で窓を配置します。これにより、すべての可能な位置に窓があるわけではなく、ランダムな配置になります。
- **明るさのランダム化**: 70%の確率で明るい窓、30%の確率で暗い窓になります。
- **色のランダム化**: 70%の確率で暖色系（黄色）、20%の確率で青白色、10%の確率で特殊色（ランダムな色）になります。

### 4-3. 点滅のランダム化

```js
if (Math.random() < 0.01) {
  // 現在の状態を反転
  if (windowLight.material.opacity > 0.5) {
    // 消灯
    windowLight.material.opacity = Math.random() * 0.2;
  } else {
    // 点灯
    windowLight.material.opacity = 0.5 + Math.random() * 0.5;

    // 色を時々変更
    if (Math.random() < 0.3) {
      const colorType = Math.random();
      if (colorType < 0.7) {
        // 暖色系
        windowLight.material.color.setHSL(0.1, 0.8, 0.6);
      } else if (colorType < 0.9) {
        // 青白色
        windowLight.material.color.setHSL(0.6, 0.8, 0.6);
      } else {
        // 特殊色（赤やアクセント）
        windowLight.material.color.setHSL(Math.random(), 0.9, 0.7);
      }
    }
  }
}
```

窓の光の点滅をランダムに設定することで、より自然な点滅を表現しています。

- **点滅確率のランダム化**: 1%の確率で点滅します。これにより、すべての窓が同時に点滅するわけではなく、ランダムな点滅になります。
- **点灯・消灯のランダム化**: 現在の状態に応じて、点灯または消灯します。
- **色変更のランダム化**: 点灯時に30%の確率で色が変化します。

これらのランダム性により、より自然で生き生きとした都市景観を表現しています。

---

## 5. 応用例：夜の都市景観の拡張

`usecase-018` のコードをベースに、以下のような拡張が考えられます：

### 5-1. 建物の種類を増やす

```js
const buildingTypes = [
  { width: 0.4, depth: 0.4, height: 1, windowDensity: 0.4 },
  { width: 0.6, depth: 0.6, height: 2, windowDensity: 0.5 },
  { width: 0.8, depth: 0.8, height: 3, windowDensity: 0.6 },
  { width: 1.0, depth: 1.0, height: 4, windowDensity: 0.7 },
  { width: 1.2, depth: 0.8, height: 5, windowDensity: 0.8 },
];

for (let i = 0; i < buildingCount; i++) {
  // 建物タイプをランダムに選択
  const typeIndex = Math.floor(Math.random() * buildingTypes.length);
  const type = buildingTypes[typeIndex];
  
  // 建物パラメータをタイプに基づいて設定
  const width = type.width + Math.random() * 0.2;
  const depth = type.depth + Math.random() * 0.2;
  const height = type.height + Math.random() * 1;
  const windowDensity = type.windowDensity;
  
  // ...
}
```

複数の建物タイプを定義し、それぞれ異なるサイズと窓の密度を持たせることで、より多様な都市景観を表現することができます。

### 5-2. 道路と街灯を追加する

```js
// 道路を作成
const roadGeometry = new THREE.PlaneGeometry(20, 2);
const roadMaterial = new THREE.MeshPhongMaterial({
  color: 0x333333,
  shininess: 10,
  specular: 0x111111,
});

const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.01; // 地面よりわずかに上
road.position.z = 0;
scene.add(road);
objects.push(road);

// 街灯を作成
const lampCount = 10;
for (let i = 0; i < lampCount; i++) {
  const x = (i - lampCount / 2) * 2 + 1;
  
  // 街灯の柱
  const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8);
  const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.set(x, 0.4, -0.9);
  scene.add(pole);
  objects.push(pole);
  
  // 街灯の光
  const lightGeometry = new THREE.SphereGeometry(0.1);
  const lightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffaa,
    transparent: true,
    opacity: 0.8,
  });
  const light = new THREE.Mesh(lightGeometry, lightMaterial);
  light.position.set(x, 0.8, -0.9);
  scene.add(light);
  objects.push(light);
  
  // 光源
  const pointLight = new THREE.PointLight(0xffffaa, 0.5, 3);
  pointLight.position.set(x, 0.8, -0.9);
  scene.add(pointLight);
  objects.push(pointLight);
}
```

道路と街灯を追加することで、より本格的な都市景観を表現することができます。

### 5-3. 車のライトを追加する

```js
// 車のライトを作成
const carCount = 5;
const carLights = [];

for (let i = 0; i < carCount; i++) {
  // 車のヘッドライト（白）
  const headlightGeometry = new THREE.PlaneGeometry(0.1, 0.05);
  const headlightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
  });
  const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  headlight.position.set(-10 + i * 2, 0.1, -0.8);
  headlight.rotation.y = Math.PI / 2;
  scene.add(headlight);
  carLights.push(headlight);
  
  // 車のテールライト（赤）
  const taillightGeometry = new THREE.PlaneGeometry(0.1, 0.05);
  const taillightMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.9,
  });
  const taillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
  taillight.position.set(10 - i * 2, 0.1, 0.8);
  taillight.rotation.y = -Math.PI / 2;
  scene.add(taillight);
  carLights.push(taillight);
}

// 車のライトのアニメーション
function updateCarLights(time) {
  carLights.forEach((light, index) => {
    // 車を移動
    light.position.x += (index % 2 === 0 ? 1 : -1) * 0.05;
    
    // 画面外に出たら反対側から再登場
    if (light.position.x > 10) {
      light.position.x = -10;
    } else if (light.position.x < -10) {
      light.position.x = 10;
    }
  });
}
```

車のヘッドライトとテールライトを追加し、それらを道路上で移動させることで、より動的な都市景観を表現することができます。

### 5-4. 天候効果を追加する

```js
// 雨粒を作成
const rainCount = 1000;
const rainGeometry = new THREE.BufferGeometry();
const rainPositions = new Float32Array(rainCount * 3);

for (let i = 0; i < rainCount; i++) {
  const x = (Math.random() - 0.5) * 20;
  const y = Math.random() * 10;
  const z = (Math.random() - 0.5) * 20;
  
  rainPositions[i * 3] = x;
  rainPositions[i * 3 + 1] = y;
  rainPositions[i * 3 + 2] = z;
}

rainGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(rainPositions, 3)
);

const rainMaterial = new THREE.PointsMaterial({
  color: 0xaaaaaa,
  size: 0.05,
  transparent: true,
  opacity: 0.6,
});

const rain = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rain);
objects.push(rain);

// 雨のアニメーション
function updateRain(time) {
  const positions = rain.geometry.attributes.position.array;
  
  for (let i = 0; i < rainCount; i++) {
    // 雨粒を下に移動
    positions[i * 3 + 1] -= 0.1;
    
    // 地面に着いたら上に戻す
    if (positions[i * 3 + 1] < 0) {
      positions[i * 3 + 1] = 10;
    }
  }
  
  rain.geometry.attributes.position.needsUpdate = true;
}
```

雨や雪などの天候効果を追加することで、より雰囲気のある都市景観を表現することができます。

---

## 6. まとめ

「**Usecase-018: Night City Windows Effect**」では、Three.jsで夜の都市景観を表現する方法を学びました。

主なポイントは以下の通りです：

1. **建物と窓の表現**: 複数の建物と、それらの窓から漏れる光を表現しました。
2. **発光効果**: `MeshBasicMaterial` を使って、窓の光の発光効果を表現しました。
3. **ランダム性の活用**: 建物のサイズや位置、窓の配置や色、点滅のタイミングなどをランダムに設定することで、より自然な都市景観を表現しました。
4. **アニメーション効果**: 窓の光の点滅や輝度の変化、建物の揺れなどのアニメーション効果を追加しました。
5. **拡張の可能性**: 道路や街灯、車のライト、天候効果などを追加することで、より本格的な都市景観を表現することができます。

これらの技術を組み合わせることで、生き生きとした夜の都市景観を表現することができます。また、これらの技術は、他の夜景や照明効果にも応用することができます。

次のユースケースでは、さらに複雑な形状や動きを持つ3Dシーンを探索していきます。
