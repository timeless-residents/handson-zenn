---
title: Usecase-026 Minimal Robot Model
---

# Usecase-026: Minimal Robot Model

**本章では、`usecases/usecase-026` ディレクトリに格納されている「Minimal Robot Model」のコードを解説します。**  
このサンプルは、プリミティブな形状を組み合わせてロボットモデルを作成し、階層構造を活用したアニメーションを実装しています。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、より構造化されたモデリングとアニメーション手法を示した例となっています。

---

## 1. 階層構造を活用したロボットモデル

これまでのユースケースでは、様々な形状とアニメーション効果を扱ってきました。`usecase-026` では、単純な立方体（BoxGeometry）を組み合わせてロボットモデルを作成し、Three.jsの階層構造（親子関係）を活用したアニメーションを実装しています。

階層構造を利用することで、例えば「肩を回転させると腕全体が動く」「上腕を動かすと肘から先が連動して動く」といった自然な関節の動きを簡単に実現できます。また、各パーツの作成や配置、アニメーションの更新処理が関数としてモジュール化されているため、メンテナンス性の高い実装となっています。

`usecase-026` の主な特徴は以下の通りです：

1. **階層構造によるモデリング**: 親子関係を活用し、各パーツの動作を連動させる。
2. **モジュール化されたコード**: 各パーツ生成やアニメーション更新の処理を関数化し、再利用性を向上。
3. **パラメータ化されたアニメーション**: 振幅や速度などのアニメーションパラメータを定数で管理し、簡単に調整可能。
4. **リソース管理**: 使用後のジオメトリやマテリアルの破棄処理を実装し、メモリリークを防止。
5. **歩行アニメーション**: 腕と脚が協調して動くことで、自然な歩行動作を表現。

---

## 2. `usecase-026/index.js` コード詳細

以下、コード内の各主要部分について解説します。

### 2-1. `metadata`

```js
static metadata = {
  id: "026",
  title: "Minimal Robot Model",
  description:
    "A minimal robot model created by combining prisms with improved hierarchy, modularity, and resource management",
  categories: ["Geometry", "Animation", "Model"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` はユースケースの識別子、`title` はタイトル、`description` にはサンプルの特徴、`categories` でカテゴリが指定されています。

### 2-2. `constructor` と `animationParams`

```js
constructor(scene) {
  super(scene);
  this.time = 0;
  this.robotParts = {};
  // すべてのオブジェクトを格納するグループを作成してシーンに追加
  this.objects = new THREE.Group();
  scene.add(this.objects);
}
```

- コンストラクタでは、基本クラスの初期化後にシーンへ追加するグループ（`this.objects`）を作成。
- `this.robotParts` は各パーツの参照を保持するためのオブジェクトで、後のアニメーション更新に利用されます。
- `this.time` はアニメーションの進行時間を管理します。

```js
static animationParams = {
  bodyRotationSpeed: 0.5,
  bodyRotationAmplitude: 0.2,
  headRotationSpeed: 0.7,
  headRotationAmplitude: 0.3,
  headBobSpeed: 1.5,
  headBobAmplitude: 0.05,
  armSwingSpeed: 1.2,
  armSwingAmplitudeUpper: 0.4,
  armSwingAmplitudeLower: 0.3,
  legSwingSpeed: 1.2,
  legSwingAmplitudeUpper: 0.3,
  legSwingAmplitudeLower: 0.3,
};
```

- アニメーションに使用する各種パラメータを定数として定義しています。  
  これにより、胴体の回転、頭の動作、腕や脚の振れ幅などを一元管理・調整可能です。

### 2-3. パーツ生成用のヘルパー関数

- **`createMesh`**  
  各パーツを生成する際に共通して利用する関数で、ジオメトリとマテリアル、位置情報からメッシュを生成します。

  ```js
  static createMesh(geometry, material, position) {
    const mesh = new THREE.Mesh(geometry, material);
    if (position) {
      mesh.position.copy(position);
    }
    return mesh;
  }
  ```

- **各パーツ作成関数**  
  `createBody`、`createHead`、`createEye`、`createShoulder`、`createUpperArm`、`createElbow`、`createLowerArm`、`createHip`、`createUpperLeg`、`createKnee`、`createLowerLeg`、`createFoot`  
  これらはそれぞれ、特定のパーツを生成し、名前や初期位置を設定しています。名前は後のアニメーション制御で利用されます。

### 2-4. シーン構築：`setupScene`

```js
static setupScene(scene) {
  const parts = {};
  const geometries = [];
  const objects = [];

  // マテリアル定義
  const materials = {
    body: new THREE.MeshPhongMaterial({ color: 0x5555ff }),
    limb: new THREE.MeshPhongMaterial({ color: 0x3333cc }),
    head: new THREE.MeshPhongMaterial({ color: 0x7777ff }),
    eye: new THREE.MeshPhongMaterial({ color: 0xff0000 }),
    joint: new THREE.MeshPhongMaterial({ color: 0x222222 }),
  };

  // ロボット全体のグループを作成してシーンに追加
  const robotGroup = new THREE.Group();
  robotGroup.name = "robotGroup";
  scene.add(robotGroup);

  // ── Body (胴体) ──
  const { mesh: body, geometry: bodyGeom } = this.createBody(materials.body);
  geometries.push(bodyGeom);
  parts.body = body;
  robotGroup.add(body);
  objects.push(body);

  // ── Head (頭) ──
  const { mesh: head, geometry: headGeom } = this.createHead(materials.head);
  head.position.set(0, 1.6, 0);
  geometries.push(headGeom);
  parts.head = head;
  body.add(head);
  objects.push(head);

  // ── Eyes (目) ──（head の子として追加）
  const { mesh: leftEye, geometry: leftEyeGeom } = this.createEye(materials.eye, -0.3);
  leftEye.position.set(-0.3, 0.2, 0.6);
  geometries.push(leftEyeGeom);
  parts.leftEye = leftEye;
  head.add(leftEye);
  objects.push(leftEye);

  const { mesh: rightEye, geometry: rightEyeGeom } = this.createEye(materials.eye, 0.3);
  rightEye.position.set(0.3, 0.2, 0.6);
  geometries.push(rightEyeGeom);
  parts.rightEye = rightEye;
  head.add(rightEye);
  objects.push(rightEye);

  // ── Arms (腕) ──
  // armGroup 内に肩、上腕、肘、下腕の各パーツを階層的に配置
  const createArm = (side) => {
    const xOffset = side === "left" ? -1 : 1;
    const armGroup = new THREE.Group();
    armGroup.name = side + "ArmGroup";

    // 肩（joint）
    const { mesh: shoulder, geometry: shoulderGeom } = this.createShoulder(materials.joint, xOffset);
    geometries.push(shoulderGeom);
    parts[side + "Shoulder"] = shoulder;
    armGroup.add(shoulder);

    // 上腕
    const { mesh: upperArm, geometry: upperArmGeom } = this.createUpperArm(materials.limb, xOffset);
    upperArm.position.set(0, -0.6, 0);
    geometries.push(upperArmGeom);
    parts[side + "UpperArm"] = upperArm;
    shoulder.add(upperArm);

    // 肘（joint）
    const { mesh: elbow, geometry: elbowGeom } = this.createElbow(materials.joint, xOffset);
    elbow.position.set(0, -0.9, 0);
    geometries.push(elbowGeom);
    parts[side + "Elbow"] = elbow;
    upperArm.add(elbow);

    // 下腕
    const { mesh: lowerArm, geometry: lowerArmGeom } = this.createLowerArm(materials.limb, xOffset);
    lowerArm.position.set(0, -0.8, 0);
    geometries.push(lowerArmGeom);
    parts[side + "LowerArm"] = lowerArm;
    elbow.add(lowerArm);

    return armGroup;
  };

  const leftArmGroup = createArm("left");
  leftArmGroup.position.set(-0.95, 1.9, 0); // body からのオフセット
  parts.leftArmGroup = leftArmGroup;
  body.add(leftArmGroup);
  objects.push(leftArmGroup);

  const rightArmGroup = createArm("right");
  rightArmGroup.position.set(0.95, 1.9, 0);
  parts.rightArmGroup = rightArmGroup;
  body.add(rightArmGroup);
  objects.push(rightArmGroup);

  // ── Legs (脚) ──
  // legGroup 内に股関節、上腿、膝、下腿、足を階層的に配置
  const createLeg = (side) => {
    const xOffset = side === "left" ? -0.5 : 0.5;
    const legGroup = new THREE.Group();
    legGroup.name = side + "LegGroup";

    // 股関節（joint）
    const { mesh: hip, geometry: hipGeom } = this.createHip(materials.joint, xOffset);
    geometries.push(hipGeom);
    parts[side + "Hip"] = hip;
    legGroup.add(hip);

    // 上腿
    const { mesh: upperLeg, geometry: upperLegGeom } = this.createUpperLeg(materials.limb, xOffset);
    upperLeg.position.set(0, -0.8, 0);
    geometries.push(upperLegGeom);
    parts[side + "UpperLeg"] = upperLeg;
    hip.add(upperLeg);

    // 膝（joint）
    const { mesh: knee, geometry: kneeGeom } = this.createKnee(materials.joint, xOffset);
    knee.position.set(0, -1.0, 0);
    geometries.push(kneeGeom);
    parts[side + "Knee"] = knee;
    upperLeg.add(knee);

    // 下腿
    const { mesh: lowerLeg, geometry: lowerLegGeom } = this.createLowerLeg(materials.limb, xOffset);
    lowerLeg.position.set(0, -0.9, 0);
    geometries.push(lowerLegGeom);
    parts[side + "LowerLeg"] = lowerLeg;
    knee.add(lowerLeg);

    // 足（joint）
    const { mesh: foot, geometry: footGeom } = this.createFoot(materials.joint, xOffset);
    foot.position.set(0, -0.45, 0.2);
    geometries.push(footGeom);
    parts[side + "Foot"] = foot;
    lowerLeg.add(foot);

    return legGroup;
  };

  const leftLegGroup = createLeg("left");
  leftLegGroup.position.set(-0.5, 0, 0);
  parts.leftLegGroup = leftLegGroup;
  body.add(leftLegGroup);
  objects.push(leftLegGroup);

  const rightLegGroup = createLeg("right");
  rightLegGroup.position.set(0.5, 0, 0);
  parts.rightLegGroup = rightLegGroup;
  body.add(rightLegGroup);
  objects.push(rightLegGroup);

  // ── ライトの追加 ──
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(ambientLight, directionalLight);

  const lights = [ambientLight, directionalLight];

  return { objects, parts, geometries, lights, robotGroup };
}
```

- この関数では、各パーツの生成と配置、親子関係の設定、そしてシーンへ追加する処理をまとめています。  
- また、後でリソースの破棄処理を行うために、使用したジオメトリやオブジェクトのリストも返却しています。

### 2-5. アニメーション更新：`updateObjects`

```js
static updateObjects(time, params = {}) {
  const { parts } = params;
  if (!parts || !parts.body) return;
  const a = this.animationParams;

  // 胴体の回転（全体の基準となる動き）
  parts.body.rotation.y = Math.sin(time * a.bodyRotationSpeed) * a.bodyRotationAmplitude;

  // 頭部：回転と僅かな上下移動（body の子として相対的に動作）
  parts.head.rotation.y = Math.sin(time * a.headRotationSpeed) * a.headRotationAmplitude;
  parts.head.position.y = 1.6 + Math.sin(time * a.headBobSpeed) * a.headBobAmplitude;

  // 腕の動き
  const armSwing = Math.sin(time * a.armSwingSpeed);
  // 左腕
  if (parts.leftShoulder) {
    parts.leftShoulder.rotation.x = armSwing * a.armSwingAmplitudeUpper;
  }
  if (parts.leftUpperArm) {
    parts.leftUpperArm.rotation.x = armSwing * a.armSwingAmplitudeUpper;
  }
  if (parts.leftElbow) {
    parts.leftElbow.rotation.x = Math.sin(time * a.armSwingSpeed + 0.5) * a.armSwingAmplitudeLower;
  }
  if (parts.leftLowerArm) {
    parts.leftLowerArm.rotation.x = Math.sin(time * a.armSwingSpeed + 0.5) * a.armSwingAmplitudeLower;
  }
  // 右腕（位相をπずらす）
  const armSwingRight = Math.sin(time * a.armSwingSpeed + Math.PI);
  if (parts.rightShoulder) {
    parts.rightShoulder.rotation.x = armSwingRight * a.armSwingAmplitudeUpper;
  }
  if (parts.rightUpperArm) {
    parts.rightUpperArm.rotation.x = armSwingRight * a.armSwingAmplitudeUpper;
  }
  if (parts.rightElbow) {
    parts.rightElbow.rotation.x = Math.sin(time * a.armSwingSpeed + Math.PI + 0.5) * a.armSwingAmplitudeLower;
  }
  if (parts.rightLowerArm) {
    parts.rightLowerArm.rotation.x = Math.sin(time * a.armSwingSpeed + Math.PI + 0.5) * a.armSwingAmplitudeLower;
  }

  // 脚の動き
  const legSwing = Math.sin(time * a.legSwingSpeed);
  // 左脚
  if (parts.leftHip) {
    parts.leftHip.rotation.x = legSwing * a.legSwingAmplitudeUpper;
  }
  if (parts.leftUpperLeg) {
    parts.leftUpperLeg.rotation.x = legSwing * a.legSwingAmplitudeUpper;
  }
  if (parts.leftKnee) {
    parts.leftKnee.rotation.x = Math.abs(Math.sin(time * a.legSwingSpeed + 0.5)) * a.legSwingAmplitudeLower;
  }
  if (parts.leftLowerLeg) {
    parts.leftLowerLeg.rotation.x = Math.abs(Math.sin(time * a.legSwingSpeed + 0.5)) * a.legSwingAmplitudeLower;
  }
  // 右脚
  const legSwingRight = Math.sin(time * a.legSwingSpeed + Math.PI);
  if (parts.rightHip) {
    parts.rightHip.rotation.x = legSwingRight * a.legSwingAmplitudeUpper;
  }
  if (parts.rightUpperLeg) {
    parts.rightUpperLeg.rotation.x = legSwingRight * a.legSwingAmplitudeUpper;
  }
  if (parts.rightKnee) {
    parts.rightKnee.rotation.x = Math.abs(Math.sin(time * a.legSwingSpeed + Math.PI + 0.5)) * a.legSwingAmplitudeLower;
  }
  if (parts.rightLowerLeg) {
    parts.rightLowerLeg.rotation.x = Math.abs(Math.sin(time * a.legSwingSpeed + Math.PI + 0.5)) * a.legSwingAmplitudeLower;
  }
}
```

- 各パーツのローカルな回転や位置の更新を行うことで、親子関係に基づいた自然な動作を実現しています。  
- サイン波を利用して滑らかなアニメーションを生成しています。

### 2-6. 初期化処理：`init`

```js
async init() {
  try {
    const { parts, lights, robotGroup } = GeometryShowcase026.setupScene(this.scene);
    this.robotParts = parts;
    // robotGroup を this.objects に直接追加
    this.objects.add(robotGroup);

    // カメラの初期位置設定（scene.userData.camera が設定されている前提）
    if (this.scene.userData.camera) {
      this.scene.userData.camera.position.set(0, 0, 10);
      this.scene.userData.camera.lookAt(0, 0, 0);
    }
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}
```

- シーンにロボットモデルとライトを追加し、カメラの初期位置を設定します。  
- エラーハンドリングにより、初期化中の問題をコンソールに出力しています。

### 2-7. フレーム更新処理：`update`

```js
update(deltaTime) {
  this.time += deltaTime;
  // 初期化完了前は更新処理を行わない
  if (!this.robotParts || !this.robotParts.body) return;
  GeometryShowcase026.updateObjects(this.time, { parts: this.robotParts });
}
```

- フレーム毎に経過時間を更新し、アニメーションを進行させるために `updateObjects` を呼び出しています。

### 2-8. プレビューとリソース管理：`createPreview`

```js
static createPreview(container) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  const { objects, parts, geometries } = this.setupScene(scene);
  let time = 0;

  return {
    element: renderer.domElement,
    animate: () => {
      time += 0.016;
      this.updateObjects(time, { parts });
      renderer.render(scene, camera);
    },
    dispose: () => {
      // 使用したジオメトリの破棄
      geometries.forEach((g) => g.dispose());
      // 各オブジェクトのマテリアルを破棄（配列の場合も考慮）
      objects.forEach((obj) => {
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
    },
  };
}
```

- プレビュー用のレンダラー、シーン、カメラをセットアップし、簡単にシーンのアニメーションを確認できるようにしています。  
- また、`dispose` 関数で使用済みのリソース（ジオメトリ、マテリアル、レンダラー）を破棄し、メモリリークを防止します。

### 2-9. サムネイル生成：`getThumbnailBlob`

```js
static getThumbnailBlob() {
  // シンプルなSVGでロボットを表現
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#111111"/>
      
      <!-- Robot body -->
      <rect x="75" y="60" width="50" height="70" fill="#5555ff" stroke="#444444" stroke-width="1"/>
      
      <!-- Head -->
      <rect x="80" y="30" width="40" height="40" fill="#7777ff" stroke="#444444" stroke-width="1"/>
      
      <!-- Eyes -->
      <rect x="90" y="40" width="10" height="10" fill="#ff0000"/>
      <rect x="110" y="40" width="10" height="10" fill="#ff0000"/>
      
      <!-- Arms -->
      <rect x="55" y="70" width="20" height="60" fill="#3333cc" stroke="#444444" stroke-width="1"/>
      <rect x="125" y="70" width="20" height="60" fill="#3333cc" stroke="#444444" stroke-width="1"/>
      
      <!-- Legs -->
      <rect x="75" y="130" width="20" height="60" fill="#3333cc" stroke="#444444" stroke-width="1"/>
      <rect x="105" y="130" width="20" height="60" fill="#3333cc" stroke="#444444" stroke-width="1"/>
      
      <!-- Joints -->
      <rect x="55" y="70" width="20" height="10" fill="#222222"/>
      <rect x="125" y="70" width="20" height="10" fill="#222222"/>
      <rect x="75" y="130" width="20" height="10" fill="#222222"/>
      <rect x="105" y="130" width="20" height="10" fill="#222222"/>
      
      <!-- Feet -->
      <rect x="70" y="190" width="30" height="10" fill="#222222"/>
      <rect x="100" y="190" width="30" height="10" fill="#222222"/>
    </svg>
  `;

  const encodedSvg = unescape(encodeURIComponent(svgString));
  const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);
  return fetch(dataURL).then((res) => res.blob());
}
```

- この関数は、サムネイル用のSVG画像を生成し、Blobに変換して返します。  
- シンプルなデザインでロボットのイメージを表現しており、ギャラリー表示などに利用されます。

---

## 3. まとめ

本サンプルでは、Three.jsの基本ジオメトリ（BoxGeometry）を組み合わせ、階層構造を活用したロボットモデルを構築しています。  
各パーツの生成、配置、アニメーション更新が関数として整理されているため、コードの再利用性や拡張性が高い設計となっています。また、プレビュー用のセットアップやリソース管理の実装により、効率的な開発が可能となっています。

このコードを通じて、Three.jsにおける階層構造の利用やアニメーションパラメータの管理、リソース破棄の重要性について理解を深めることができるでしょう。ぜひ、これらの技術を自身のプロジェクトに取り入れ、さらに高度な表現や動作の実装に挑戦してみてください。
