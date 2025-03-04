---
title: Usecase-023 Glass Silhouette Effect
free: true
---
# Usecase-023: Glass Silhouette Effect

**本章では、`usecases/usecase-023` ディレクトリに格納されている「Glass Silhouette Effect」のコードを解説します。**  
このサンプルは、透明なガラス球の中に配置されたオブジェクトが黒いシルエットとして見える効果を実装しています。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、カスタムシェーダーを使った特殊な視覚効果を実現した例となっています。

---

## 1. ガラスシルエット効果

これまでのユースケースでは、様々な形状とアニメーション効果を扱ってきました。`usecase-023` では、カスタムシェーダーを使用して、透明なガラス球の中に配置されたオブジェクトが黒いシルエットとして見える効果を実装しています。

このサンプルでは、2つの主要なシェーダーを使用しています：
1. ガラス球用の透明シェーダー：フレネル効果を使って、視線の角度によって透明度や反射の強さが変化するガラスの質感を表現
2. 内部オブジェクト用のシルエットシェーダー：視線と法線の関係によって、オブジェクトの背面（内側から見たとき）を黒く、前面を通常の色で表示

これらのシェーダーを組み合わせることで、ガラス越しに見る黒いシルエット効果を実現しています。

`usecase-023` では、以下の特徴を持つシーンを作成しています：

1. **透明なガラス球**: フレネル効果を使った透明なガラス質感
2. **内部オブジェクト**: 様々な形状のオブジェクトがガラス球の中に配置
3. **シルエット効果**: 内部オブジェクトが黒いシルエットとして見える効果
4. **アニメーション**: ガラス球と内部オブジェクトの回転や動き

これらの効果を組み合わせることで、視覚的に興味深いガラスシルエット効果を実現しています。

---

## 2. `usecase-023/index.js` コード詳細

それでは、実際の `usecase-023` のコードを詳しく見ていきましょう。

```js
// usecase-023/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase023 extends UseCaseBase {
  static metadata = {
    id: "023",
    title: "Glass Silhouette Effect",
    description:
      "透明シェーダ＋背面を黒くするノードで、ガラス越しに見る黒シルエット効果",
    categories: ["Shader", "Material", "Glass", "Silhouette"],
  };

  constructor(scene) {
    super(scene);
    this.objects = new Set();
    this.time = 0;
    this.rotationSpeed = 0.2;
    this.glassSphere = null;
    this.innerObjects = [];
  }

  static setupScene(scene) {
    // シーンの背景色を設定（明るい色）
    scene.background = new THREE.Color(0xf5f5f5);

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
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);
    objects.push(mainLight);

    // サブライト（反対側からの光）
    const subLight = new THREE.DirectionalLight(0xffffff, 0.4);
    subLight.position.set(-5, 3, -5);
    scene.add(subLight);
    objects.push(subLight);

    // ガラス球の作成
    const glassGeometry = new THREE.SphereGeometry(2, 64, 64);
    geometries.push(glassGeometry);

    // ガラスマテリアル
    const glassMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        refractionRatio: { value: 0.98 },
        fresnelBias: { value: 0.1 },
        fresnelScale: { value: 1.0 },
        fresnelPower: { value: 2.0 },
        opacity: { value: 0.6 },
        envMap: { value: null },
      },
      vertexShader: `
        uniform float time;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float refractionRatio;
        uniform float fresnelBias;
        uniform float fresnelScale;
        uniform float fresnelPower;
        uniform float opacity;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDirection = normalize(vViewPosition);
          
          // フレネル効果の計算
          float fresnel = fresnelBias + fresnelScale * pow(1.0 + dot(viewDirection, normal), fresnelPower);
          
          // 基本的なガラスの色（薄い青）
          vec3 glassColor = vec3(0.8, 0.9, 1.0);
          
          // フレネル効果を適用
          vec3 finalColor = mix(glassColor, vec3(1.0), fresnel);
          
          gl_FragColor = vec4(finalColor, opacity);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
    });

    const glassSphere = new THREE.Mesh(glassGeometry, glassMaterial);
    glassSphere.castShadow = true;
    glassSphere.receiveShadow = true;
    scene.add(glassSphere);
    objects.push(glassSphere);

    // 内部オブジェクト用のグループ
    const innerGroup = new THREE.Group();
    scene.add(innerGroup);
    objects.push(innerGroup);

    // 内部オブジェクトの作成（シルエットとして見えるオブジェクト）
    const innerObjects = [];

    // 様々な形状のオブジェクトを作成
    const shapes = [
      new THREE.TorusKnotGeometry(0.5, 0.2, 64, 16),
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      new THREE.ConeGeometry(0.5, 1, 16),
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.TetrahedronGeometry(0.5),
    ];
    geometries.push(...shapes);

    // シルエットマテリアル（背面を黒く、前面を通常の色で表示）
    const silhouetteMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0x444444) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDirection = normalize(vViewPosition);
          
          // 視線と法線の内積で前面/背面を判定
          float facing = dot(normal, viewDirection);
          
          // 背面（内側から見たとき）は黒、前面は指定色
          vec3 finalColor = facing > 0.0 ? color : vec3(0.0);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });

    // 内部オブジェクトを配置
    for (let i = 0; i < 5; i++) {
      const geometry = shapes[i];
      const material = silhouetteMaterial.clone();
      material.uniforms.color.value = new THREE.Color(
        Math.random() * 0.5 + 0.3,
        Math.random() * 0.5 + 0.3,
        Math.random() * 0.5 + 0.3
      );

      const mesh = new THREE.Mesh(geometry, material);

      // オブジェクトをランダムに配置
      const radius = Math.random() * 0.8 + 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      mesh.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      innerGroup.add(mesh);
      innerObjects.push(mesh);
    }

    // 床を追加
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -3;
    floor.receiveShadow = true;
    scene.add(floor);
    objects.push(floor);
    geometries.push(floorGeometry);

    return {
      objects,
      geometries,
      glassSphere,
      innerObjects,
      innerGroup,
    };
  }

  static updateObjects(
    objects,
    time = 0,
    mousePos = { x: 0, y: 0 },
    params = {}
  ) {
    const { glassSphere, innerObjects, innerGroup } = params;

    if (!glassSphere || !innerObjects || !innerGroup) return;

    // ガラス球の回転
    glassSphere.rotation.y = time * 0.1;
    glassSphere.rotation.x = Math.sin(time * 0.2) * 0.2;

    // ガラスのシェーダーパラメータを更新
    if (glassSphere.material.uniforms) {
      glassSphere.material.uniforms.time.value = time;
      // 時間によって屈折率を微妙に変化させる
      glassSphere.material.uniforms.refractionRatio.value =
        0.98 + Math.sin(time * 0.5) * 0.01;
    }

    // 内部オブジェクトの回転
    innerGroup.rotation.y = time * 0.2;
    innerGroup.rotation.x = Math.sin(time * 0.3) * 0.3;

    // 個々の内部オブジェクトのアニメーション
    innerObjects.forEach((obj, i) => {
      // 個別に回転
      obj.rotation.x += Math.sin(time * 0.2 + i) * 0.01;
      obj.rotation.y += Math.cos(time * 0.3 + i) * 0.01;

      // 位置を微妙に変化させる
      const radius = 0.8 + Math.sin(time * 0.5 + i * 0.7) * 0.2;
      const theta = obj.userData.initialTheta + time * (0.1 + i * 0.05);
      const phi = obj.userData.initialPhi + Math.sin(time * 0.3 + i) * 0.2;

      obj.position.x = radius * Math.sin(phi) * Math.cos(theta);
      obj.position.y = radius * Math.cos(phi);
      obj.position.z = radius * Math.sin(phi) * Math.sin(theta);
    });
  }

  async init() {
    const { objects, glassSphere, innerObjects, innerGroup } =
      GeometryShowcase023.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));

    this.glassSphere = glassSphere;
    this.innerObjects = innerObjects;
    this.innerGroup = innerGroup;

    // 内部オブジェクトの初期角度を保存
    this.innerObjects.forEach((obj, i) => {
      obj.userData.initialTheta = Math.random() * Math.PI * 2;
      obj.userData.initialPhi = Math.random() * Math.PI;
    });
  }

  update(deltaTime) {
    this.time += deltaTime * this.rotationSpeed;

    GeometryShowcase023.updateObjects(
      Array.from(this.objects),
      this.time,
      { x: 0, y: 0 },
      {
        glassSphere: this.glassSphere,
        innerObjects: this.innerObjects,
        innerGroup: this.innerGroup,
      }
    );
  }

  static getThumbnailCameraPosition() {
    return {
      position: [4, 3, 4],
      target: [0, 0, 0],
    };
  }

  // getThumbnailBlob と createPreview メソッドは省略
}
```

### 2-1. `metadata`

```js
static metadata = {
  id: "023",
  title: "Glass Silhouette Effect",
  description:
    "透明シェーダ＋背面を黒くするノードで、ガラス越しに見る黒シルエット効果",
  categories: ["Shader", "Material", "Glass", "Silhouette"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `023`、 `title` は「Glass Silhouette Effect」など。
- `description` には、透明シェーダーと背面を黒くするノードを使って、ガラス越しに見る黒シルエット効果について言及されています。
- `categories` に「Shader」、「Material」、「Glass」、「Silhouette」が追加されており、シェーダーとマテリアルを使った特殊な視覚効果をテーマにしていることを示しています。

### 2-2. `constructor`

```js
constructor(scene) {
  super(scene);
  this.objects = new Set();
  this.time = 0;
  this.rotationSpeed = 0.2;
  this.glassSphere = null;
  this.innerObjects = [];
}
```

コンストラクタでは、いくつかのプロパティを初期化しています：
- `rotationSpeed`: 回転速度
- `glassSphere`: ガラス球オブジェクト
- `innerObjects`: 内部オブジェクトの配列

### 2-3. `setupScene(scene)`

```js
static setupScene(scene) {
  // シーンの背景色を設定（明るい色）
  scene.background = new THREE.Color(0xf5f5f5);

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
  mainLight.shadow.mapSize.width = 1024;
  mainLight.shadow.mapSize.height = 1024;
  scene.add(mainLight);
  objects.push(mainLight);

  // サブライト（反対側からの光）
  const subLight = new THREE.DirectionalLight(0xffffff, 0.4);
  subLight.position.set(-5, 3, -5);
  scene.add(subLight);
  objects.push(subLight);

  // ガラス球の作成
  const glassGeometry = new THREE.SphereGeometry(2, 64, 64);
  geometries.push(glassGeometry);

  // ガラスマテリアル
  const glassMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      refractionRatio: { value: 0.98 },
      fresnelBias: { value: 0.1 },
      fresnelScale: { value: 1.0 },
      fresnelPower: { value: 2.0 },
      opacity: { value: 0.6 },
      envMap: { value: null },
    },
    vertexShader: `
      uniform float time;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      
      void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float refractionRatio;
      uniform float fresnelBias;
      uniform float fresnelScale;
      uniform float fresnelPower;
      uniform float opacity;
      
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDirection = normalize(vViewPosition);
        
        // フレネル効果の計算
        float fresnel = fresnelBias + fresnelScale * pow(1.0 + dot(viewDirection, normal), fresnelPower);
        
        // 基本的なガラスの色（薄い青）
        vec3 glassColor = vec3(0.8, 0.9, 1.0);
        
        // フレネル効果を適用
        vec3 finalColor = mix(glassColor, vec3(1.0), fresnel);
        
        gl_FragColor = vec4(finalColor, opacity);
      }
    `,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
  });

  const glassSphere = new THREE.Mesh(glassGeometry, glassMaterial);
  glassSphere.castShadow = true;
  glassSphere.receiveShadow = true;
  scene.add(glassSphere);
  objects.push(glassSphere);

  // 内部オブジェクト用のグループ
  const innerGroup = new THREE.Group();
  scene.add(innerGroup);
  objects.push(innerGroup);

  // 内部オブジェクトの作成（シルエットとして見えるオブジェクト）
  const innerObjects = [];

  // 様々な形状のオブジェクトを作成
  const shapes = [
    new THREE.TorusKnotGeometry(0.5, 0.2, 64, 16),
    new THREE.BoxGeometry(0.6, 0.6, 0.6),
    new THREE.ConeGeometry(0.5, 1, 16),
    new THREE.SphereGeometry(0.4, 32, 32),
    new THREE.TetrahedronGeometry(0.5),
  ];
  geometries.push(...shapes);

  // シルエットマテリアル（背面を黒く、前面を通常の色で表示）
  const silhouetteMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0x444444) },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDirection = normalize(vViewPosition);
        
        // 視線と法線の内積で前面/背面を判定
        float facing = dot(normal, viewDirection);
        
        // 背面（内側から見たとき）は黒、前面は指定色
        vec3 finalColor = facing > 0.0 ? color : vec3(0.0);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    side: THREE.DoubleSide,
  });

  // 内部オブジェクトを配置
  for (let i = 0; i < 5; i++) {
    const geometry = shapes[i];
    const material = silhouetteMaterial.clone();
    material.uniforms.color.value = new THREE.Color(
      Math.random() * 0.5 + 0.3,
      Math.random() * 0.5 + 0.3,
      Math.random() * 0.5 + 0.3
    );

    const mesh = new THREE.Mesh(geometry, material);

    // オブジェクトをランダムに配置
    const radius = Math.random() * 0.8 + 0.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    mesh.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );

    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    innerGroup.add(mesh);
    innerObjects.push(mesh);
  }

  // 床を追加
  const floorGeometry = new THREE.PlaneGeometry(10, 10);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    roughness: 0.8,
    metalness: 0.2,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = Math.PI / 2;
  floor.position.y = -3;
  floor.receiveShadow = true;
  scene.add(floor);
  objects.push(floor);
  geometries.push(floorGeometry);

  return {
    objects,
    geometries,
    glassSphere,
    innerObjects,
    innerGroup,
  };
}
```

ここでは、シーンのセットアップを行っています。主な特徴は以下の通りです：

1. **ガラス球の作成**:
   ```js
   // ガラス球の作成
   const glassGeometry = new THREE.SphereGeometry(2, 64, 64);
   geometries.push(glassGeometry);

   // ガラスマテリアル
   const glassMaterial = new THREE.ShaderMaterial({
     uniforms: {
       time: { value: 0 },
       refractionRatio: { value: 0.98 },
       fresnelBias: { value: 0.1 },
       fresnelScale: { value: 1.0 },
       fresnelPower: { value: 2.0 },
       opacity: { value: 0.6 },
       envMap: { value: null },
     },
     vertexShader: `
       // 頂点シェーダーコード
     `,
     fragmentShader: `
       // フラグメントシェーダーコード
     `,
     transparent: true,
     side: THREE.FrontSide,
     depthWrite: false,
   });

   const glassSphere = new THREE.Mesh(glassGeometry, glassMaterial);
   glassSphere.castShadow = true;
   glassSphere.receiveShadow = true;
   scene.add(glassSphere);
   objects.push(glassSphere);
   ```
   
   ガラス球用のカスタムシェーダーマテリアルを作成しています。このシェーダーでは、フレネル効果を使って視線の角度によって透明度や反射の強さが変化するガラスの質感を表現しています。`transparent: true` と `depthWrite: false` の設定により、透明なオブジェクトとして正しく描画されます。

2. **内部オブジェクトの作成**:
   ```js
   // 内部オブジェクト用のグループ
   const innerGroup = new THREE.Group();
   scene.add(innerGroup);
   objects.push(innerGroup);

   // 内部オブジェクトの作成（シルエットとして見えるオブジェクト）
   const innerObjects = [];

   // 様々な形状のオブジェクトを作成
   const shapes = [
     new THREE.TorusKnotGeometry(0.5, 0.2, 64, 16),
     new THREE.BoxGeometry(0.6, 0.6, 0.6),
     new THREE.ConeGeometry(0.5, 1, 16),
     new THREE.SphereGeometry(0.4, 32, 32),
     new THREE.TetrahedronGeometry(0.5),
   ];
   geometries.push(...shapes);

   // シルエットマテリアル（背面を黒く、前面を通常の色で表示）
   const silhouetteMaterial = new THREE.ShaderMaterial({
     uniforms: {
       color: { value: new THREE.Color(0x444444) },
     },
     vertexShader: `
       // 頂点シェーダーコード
     `,
     fragmentShader: `
       // フラグメントシェーダーコード
     `,
     side: THREE.DoubleSide,
   });
   ```
   
   内部オブジェクト用のカスタムシェーダーマテリアルを作成しています。このシェーダーでは、視線と法線の内積を使って前面と背面を判定し、背面（内側から見たとき）を黒く、前面を通常の色で表示しています。これにより、ガラス越しに見る黒いシルエット効果が実現されています。

3. **内部オブジェクトの配置**:
   ```js
   // 内部オブジェクトを配置
   for (let i = 0; i < 5; i++) {
     const geometry = shapes[i];
     const material = silhouetteMaterial.clone();
     material.uniforms.color.value = new THREE.Color(
       Math.random() * 0.5 + 0.3,
       Math.random() * 0.5 + 0.3,
       Math.random() * 0.5 + 0.3
     );

     const mesh = new THREE.Mesh(geometry, material);

     // オブジェクトをランダムに配置
     const radius = Math.random() * 0.8 + 0.5;
     const theta = Math.random() * Math.PI * 2;
     const phi = Math.random() * Math.PI;

     mesh.position.set(
       radius * Math.sin(phi) * Math.cos(theta),
       radius * Math.cos(phi),
       radius * Math.sin(phi) * Math.sin(theta)
     );

     mesh.rotation.set(
       Math.random() * Math.PI,
       Math.random() * Math.PI,
       Math.random() * Math.PI
     );

     innerGroup.add(mesh);
     innerObjects.push(mesh);
   }
   ```
   
   5つの異なる形状のオブジェクトを作成し、ガラス球の内部にランダムに配置しています。各オブジェクトには、シルエットマテリアルのクローンを適用し、ランダムな色を設定しています。

### 2-4. `updateObjects(objects, time, mousePos, params)`

```js
static updateObjects(
  objects,
  time = 0,
  mousePos = { x: 0, y: 0 },
  params = {}
) {
  const { glassSphere, innerObjects, innerGroup } = params;

  if (!glassSphere || !innerObjects || !innerGroup) return;

  // ガラス球の回転
  glassSphere.rotation.y = time * 0.1;
  glassSphere.rotation.x = Math.sin(time * 0.2) * 0.2;

  // ガラスのシェーダーパラメータを更新
  if (glassSphere.material.uniforms) {
    glassSphere.material.uniforms.time.value = time;
    // 時間によって屈折率を微妙に変化させる
    glassSphere.material.uniforms.refractionRatio.value =
      0.98 + Math.sin(time * 0.5) * 0.01;
  }

  // 内部オブジェクトの回転
  innerGroup.rotation.y = time * 0.2;
  innerGroup.rotation.x = Math.sin(time * 0.3) * 0.3;

  // 個々の内部オブジェクトのアニメーション
  innerObjects.forEach((obj, i) => {
    // 個別に回転
    obj.rotation.x += Math.sin(time * 0.2 + i) * 0.01;
    obj.rotation.y += Math.cos(time * 0.3 + i) * 0.01;

    // 位置を微妙に変化させる
    const radius = 0.8 + Math.sin(time * 0.5 + i * 0.7) * 0.2;
    const theta = obj.userData.initialTheta + time * (0.1 + i * 0.05);
    const phi = obj.userData.initialPhi + Math.sin(time * 0.3 + i) * 0.2;

    obj.position.x = radius * Math.sin(phi) * Math.cos(theta);
    obj.position.y = radius * Math.cos(phi);
    obj.position.z = radius * Math.sin(phi) * Math.sin(theta);
  });
}
```

ここでは、オブジェクトのアニメーションを更新しています。主な特徴は以下の通りです：

1. **ガラス球の回転**:
   ```js
   // ガラス球の回転
   glassSphere.rotation.y = time * 0.1;
   glassSphere.rotation.x = Math.sin(time * 0.2) * 0.2;
   ```
   
   ガラス球をゆっくりと回転させています。Y軸周りに一定速度で回転し、X軸周りには正弦波を使って揺れるような動きをさせています。

2. **シェーダーパラメータの更新**:
   ```js
   // ガラスのシェーダーパラメータを更新
   if (glassSphere.material.uniforms) {
     glassSphere.material.uniforms.time.value = time;
     // 時間によって屈折率を微妙に変化させる
     glassSphere.material.uniforms.refractionRatio.value =
       0.98 + Math.sin(time * 0.5) * 0.01;
   }
   ```
   
   ガラス球のシェーダーパラメータを更新しています。時間の経過とともに屈折率を微妙に変化させることで、ガラスの質感に変化を与えています。

3. **内部オブジェクトのアニメーション**:
   ```js
   // 内部オブジェクトの回転
   innerGroup.rotation.y = time * 0.2;
   innerGroup.rotation.x = Math.sin(time * 0.3) * 0.3;

   // 個々の内部オブジェクトのアニメーション
   innerObjects.forEach((obj, i) => {
     // 個別に回転
     obj.rotation.x += Math.sin(time * 0.2 + i) * 0.01;
     obj.rotation.y += Math.cos(time * 0.3 + i) * 0.01;

     // 位置を微妙に変化させる
     const radius = 0.8 + Math.sin(time * 0.5 + i * 0.7) * 0.2;
     const theta = obj.userData.initialTheta + time * (0.1 + i * 0.05);
     const phi = obj.userData.initialPhi + Math.sin(time * 0.3 + i) * 0.2;

     obj.position.x = radius * Math.sin(phi) * Math.cos(theta);
     obj.position.y = radius * Math.cos(phi);
     obj.position.z = radius * Math.sin(phi) * Math.sin(theta);
   });
   ```
   
   内部オブジェクトのグループ全体を回転させるとともに、個々のオブジェクトも独自に回転させています。また、各オブジェクトの位置も時間とともに変化させることで、より複雑な動きを実現しています。球面座標系（radius, theta, phi）を使って、オブジェクトが球の内部を動き回るようにしています。

### 2-5. `init()`

```js
async init() {
  const { objects, glassSphere, innerObjects, innerGroup } =
    GeometryShowcase023.setupScene(this.scene);
  objects.forEach((obj) => this.objects.add(obj));

  this.glassSphere = glassSphere;
  this.innerObjects = innerObjects;
  this.innerGroup = innerGroup;

  // 内部オブジェクトの初期角度を保存
  this.innerObjects.forEach((obj, i) => {
    obj.userData.initialTheta = Math.random() * Math.PI * 2;
    obj.userData.initialPhi = Math.random() * Math.PI;
  });
}
```

`init` メソッドでは、シーンのセットアップを行い、内部オブジェクトの初期角度を保存しています。これらの初期角度は、`updateObjects` メソッドでオブジェクトの位置を計算する際に使用されます。

### 2-6. `update(deltaTime)`

```js
update(deltaTime) {
  this.time += deltaTime * this.rotationSpeed;

  GeometryShowcase023.updateObjects(
    Array.from(this.objects),
    this.time,
    { x: 0, y: 0 },
    {
      glassSphere: this.glassSphere,
      innerObjects: this.innerObjects,
      innerGroup: this.innerGroup,
    }
  );
}
```

`update` メソッドでは、時間を更新し、`updateObjects` メソッドを呼び出してオブジェクトのアニメーションを更新しています。

---

## 3. カスタムシェーダーによる視覚効果

`usecase-023` では、2つの主要なカスタムシェーダーを使用して、ガラスシルエット効果を実現しています。

### 3-1. ガラス球用の透明シェーダー

```js
// ガラスマテリアル
const glassMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    refractionRatio: { value: 0.98 },
    fresnelBias: { value: 0.1 },
    fresnelScale: { value: 1.0 },
    fresnelPower: { value: 2.0 },
    opacity: { value: 0.6 },
    envMap: { value: null },
  },
  vertexShader: `
    uniform float time;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform float refractionRatio;
    uniform float fresnelBias;
    uniform float fresnelScale;
    uniform float fresnelPower;
    uniform float opacity;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDirection = normalize(vViewPosition);
      
      // フレネル効果の計算
      float fresnel = fresnelBias + fresnelScale * pow(1.0 + dot(viewDirection, normal), fresnelPower);
      
      // 基本的なガラスの色（薄い青）
      vec3 glassColor = vec3(0.8, 0.9, 1.0);
      
      // フレネル効果を適用
      vec3 finalColor = mix(glassColor, vec3(1.0), fresnel);
      
      gl_FragColor = vec4(finalColor, opacity);
    }
  `,
  transparent: true,
  side: THREE.FrontSide,
  depthWrite: false,
});
```

このシェーダーでは、フレネル効果を使って視線の角度によって透明度や反射の強さが変化するガラスの質感を表現しています。主な特徴は以下の通りです：

1. **頂点シェーダー**:
   ```glsl
   uniform float time;
   varying vec3 vPosition;
   varying vec3 vNormal;
   varying vec3 vViewPosition;
   
   void main() {
     vPosition = position;
     vNormal = normalize(normalMatrix * normal);
     
     vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
     vViewPosition = -mvPosition.xyz;
     
     gl_Position = projectionMatrix * mvPosition;
   }
   ```
   
   頂点シェーダーでは、頂点の位置、法線、視点からの方向をフラグメントシェーダーに渡すための変数を計算しています。

2. **フラグメントシェーダー**:
   ```glsl
   uniform float time;
   uniform float refractionRatio;
   uniform float fresnelBias;
   uniform float fresnelScale;
   uniform float fresnelPower;
   uniform float opacity;
   
   varying vec3 vPosition;
   varying vec3 vNormal;
   varying vec3 vViewPosition;
   
   void main() {
     vec3 normal = normalize(vNormal);
     vec3 viewDirection = normalize(vViewPosition);
     
     // フレネル効果の計算
     float fresnel = fresnelBias + fresnelScale * pow(1.0 + dot(viewDirection, normal), fresnelPower);
     
     // 基本的なガラスの色（薄い青）
     vec3 glassColor = vec3(0.8, 0.9, 1.0);
     
     // フレネル効果を適用
     vec3 finalColor = mix(glassColor, vec3(1.0), fresnel);
     
     gl_FragColor = vec4(finalColor, opacity);
   }
   ```
   
   フラグメントシェーダーでは、フレネル効果を計算しています。フレネル効果は、視線と法線の角度によって反射率が変化する現象で、これを使うことでガラスの質感をリアルに表現しています。視線と法線が平行に近いほど（つまり、ガラスの端に近いほど）反射が強くなり、垂直に近いほど（つまり、ガラスの中心に近いほど）透明になります。

### 3-2. 内部オブジェクト用のシルエットシェーダー

```js
// シルエットマテリアル（背面を黒く、前面を通常の色で表示）
const silhouetteMaterial = new THREE.ShaderMaterial({
  uniforms: {
    color: { value: new THREE.Color(0x444444) },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDirection = normalize(vViewPosition);
      
      // 視線と法線の内積で前面/背面を判定
      float facing = dot(normal, viewDirection);
      
      // 背面（内側から見たとき）は黒、前面は指定色
      vec3 finalColor = facing > 0.0 ? color : vec3(0.0);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
  side: THREE.DoubleSide,
});
```

このシェーダーでは、視線と法線の内積を使って前面と背面を判定し、背面（内側から見たとき）を黒く、前面を通常の色で表示しています。主な特徴は以下の通りです：

1. **頂点シェーダー**:
   ```glsl
   varying vec3 vNormal;
   varying vec3 vViewPosition;
   
   void main() {
     vNormal = normalize(normalMatrix * normal);
     
     vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
     vViewPosition = -mvPosition.xyz;
     
     gl_Position = projectionMatrix * mvPosition;
   }
   ```
   
   頂点シェーダーでは、法線と視点からの方向をフラグメントシェーダーに渡すための変数を計算しています。

2. **フラグメントシェーダー**:
   ```glsl
   uniform vec3 color;
   varying vec3 vNormal;
   varying vec3 vViewPosition;
   
   void main() {
     vec3 normal = normalize(vNormal);
     vec3 viewDirection = normalize(vViewPosition);
     
     // 視線と法線の内積で前面/背面を判定
     float facing = dot(normal, viewDirection);
     
     // 背面（内側から見たとき）は黒、前面は指定色
     vec3 finalColor = facing > 0.0 ? color : vec3(0.0);
     
     gl_FragColor = vec4(finalColor, 1.0);
   }
   ```
   
   フラグメントシェーダーでは、視線と法線の内積を計算して、前面と背面を判定しています。内積が正の場合（つまり、法線が視線と同じ方向を向いている場合）は前面、負の場合（つまり、法線が視線と反対方向を向いている場合）は背面と判定します。前面は指定された色で、背面は黒で描画されます。

   `side: THREE.DoubleSide` の設定により、オブジェクトの両面が描画されるようになっています。これにより、オブジェクトの内側から見たときも正しく描画されます。

---

## 4. フレネル効果とシルエット表現

`usecase-023` では、フレネル効果とシルエット表現を組み合わせて、ガラス越しに見る黒いシルエット効果を実現しています。

### 4-1. フレネル効果

フレネル効果は、視線と法線の角度によって反射率が変化する現象です。この効果は、ガラスや水などの透明な物体の質感を表現するのに非常に有効です。

```glsl
// フレネル効果の計算
float fresnel = fresnelBias + fresnelScale * pow(1.0 + dot(viewDirection, normal), fresnelPower);
```

フレネル効果の計算では、視線と法線の内積を使用しています。内積が1に近いほど（つまり、視線と法線が平行に近いほど）、フレネル効果が弱くなります。内積が0に近いほど（つまり、視線と法線が垂直に近いほど）、フレネル効果が強くなります。

`fresnelBias`、`fresnelScale`、`fresnelPower` のパラメータを調整することで、フレネル効果の強さや特性を変更することができます。

### 4-2. シルエット表現

シルエット表現は、オブジェクトの背面を黒く、前面を通常の色で表示することで実現されています。

```glsl
// 視線と法線の内積で前面/背面を判定
float facing = dot(normal, viewDirection);

// 背面（内側から見たとき）は黒、前面は指定色
vec3 finalColor = facing > 0.0 ? color : vec3(0.0);
```

視線と法線の内積を使って、前面と背面を判定しています。内積が正の場合（つまり、法線が視線と同じ方向を向いている場合）は前面、負の場合（つまり、法線が視線と反対方向を向いている場合）は背面と判定します。

前面は指定された色で、背面は黒で描画されます。これにより、オブジェクトの背面が黒いシルエットとして見えるようになります。

### 4-3. 組み合わせ効果

ガラス球と内部オブジェクトを組み合わせることで、ガラス越しに見る黒いシルエット効果が実現されています。ガラス球は透明で、内部オブジェクトは背面が黒く、前面が通常の色で表示されます。

視点がガラス球の外側にあるとき、内部オブジェクトの背面（内側から見たとき）が黒いシルエットとして見えます。これは、ガラス球を通して内部オブジェクトを見るとき、内部オブジェクトの法線が視線と反対方向を向いているためです。

また、ガラス球自体もフレネル効果によって、視線の角度によって透明度や反射の強さが変化します。これにより、ガラス球の端に近いほど反射が強くなり、中心に近いほど透明になります。

---

## 5. まとめ

「**Usecase-023: Glass Silhouette Effect**」では、Three.jsでガラスシルエット効果を表現する方法を学びました。

主なポイントは以下の通りです：

1. **カスタムシェーダー**: ガラス球用の透明シェーダーと内部オブジェクト用のシルエットシェーダーを作成しました。
2. **フレネル効果**: 視線と法線の角度によって反射率が変化するフレネル効果を使って、ガラスの質感を表現しました。
3. **シルエット表現**: 視線と法線の内積を使って前面と背面を判定し、背面を黒く、前面を通常の色で表示することで、シルエット効果を実現しました。
4. **アニメーション**: ガラス球と内部オブジェクトを回転させることで、より複雑で魅力的な視覚効果を作り出しました。

これらの技術を組み合わせることで、ガラス越しに見る黒いシルエット効果を実現することができます。また、これらの技術は、他の様々な視覚効果にも応用することができます。

次のユースケースでは、さらに複雑なシェーダーとマテリアルを使った視覚効果を探索していきます。
