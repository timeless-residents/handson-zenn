---
title: Usecase-028 天井ライトと反射床
---

# Usecase-028: 天井ライトと反射床

**本章では、`usecases/usecase-028` ディレクトリに格納されている「天井ライトと反射床」のコードを解説します。**  
このサンプルは、天井に設置されたスポットライトと反射性のある床を持つシンプルな空間を実装した例です。物理ベースレンダリングによる光と反射を使ってリアルな空間表現を実現しています。

---

## 1. 反射床を持つ空間の実装

リアルな空間表現において、照明と反射は非常に重要な要素です。特に床の反射は空間に奥行きと質感を与え、シーンにリアリティをもたらします。

`usecase-028` では、以下のアプローチで反射のある室内空間を実現しています：

1. **物理ベースマテリアル**: `MeshStandardMaterial`を使用して、物理的な光の振る舞いを再現。
2. **反射性床**: 床の`roughness`と`metalness`を調整して、適度な反射効果を実現。
3. **天井スポットライト**: 天井に配置されたスポットライトが影を落とし、空間に奥行きと立体感を与える。
4. **影の有効化**: すべてのオブジェクトで影の投影と受け取りを有効にし、リアルな光と影の相互作用を実現。

このテクニックにより、3Dグラフィックスにおける基本的ながらも効果的な光と影、反射の表現方法を学ぶことができます。

`usecase-028` の主な特徴は以下の通りです：

1. **シンプルな室内空間**: 床、壁、天井からなる基本的な空間構造。
2. **物理ベースの反射床**: 適切なパラメータ設定による控えめな反射効果。
3. **天井スポットライト**: 位置、角度、減衰などの特性を調整できるスポットライト。
4. **動くオブジェクト**: 空間内で浮遊しながら回転する球体と立方体。
5. **リソース管理**: 使用後のジオメトリやマテリアルの破棄処理を実装。

---

## 2. `usecase-028/index.js` コード詳細

以下、コード内の各主要部分について解説します。

### 2-1. `metadata`

```js
static metadata = {
  id: "028",
  title: "天井ライトと反射床",
  description: "天井ライトだけある空間を作り、床に反射と小さめスペキュラを設定",
  categories: ["Lighting", "Materials", "Reflection"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` はユースケースの識別子、`title` はタイトル、`description` にはサンプルの特徴、`categories` でカテゴリが指定されています。

### 2-2. `constructor` と初期設定

```js
constructor(scene) {
  super(scene);
  this.time = 0;
  
  // Create a group to hold all objects
  this.objects = new THREE.Group();
  scene.add(this.objects);
}
```

- コンストラクタでは、基本クラスの初期化後に時間パラメータを設定しています。
- `this.objects` はシーン内のすべてのオブジェクトを格納するためのグループです。

### 2-3. 室内空間の作成: `createRoom`

```js
static createRoom(width = 10, height = 5, depth = 10) {
  const roomGroup = new THREE.Group();
  roomGroup.name = "room";
  
  const geometries = [];
  const materials = [];
  
  // Create reflective floor with subtle specular highlights
  const floorGeometry = new THREE.PlaneGeometry(width, depth);
  geometries.push(floorGeometry);
  
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.3,       // Lower roughness for more reflection
    metalness: 0.2,       // Some metalness for subtle reflections
    envMapIntensity: 1.0  // Intensity of reflection
  });
  materials.push(floorMaterial);
  
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
  floor.position.y = -height / 2;
  roomGroup.add(floor);
  
  // Create walls
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    roughness: 0.9,
    metalness: 0.0
  });
  materials.push(wallMaterial);
  
  // Back wall
  const backWallGeometry = new THREE.PlaneGeometry(width, height);
  geometries.push(backWallGeometry);
  const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
  backWall.position.z = -depth / 2;
  roomGroup.add(backWall);
  
  // Left wall
  const leftWallGeometry = new THREE.PlaneGeometry(depth, height);
  geometries.push(leftWallGeometry);
  const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.x = -width / 2;
  roomGroup.add(leftWall);
  
  // Right wall
  const rightWallGeometry = new THREE.PlaneGeometry(depth, height);
  geometries.push(rightWallGeometry);
  const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.x = width / 2;
  roomGroup.add(rightWall);
  
  // Ceiling (with hole for light)
  const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
  geometries.push(ceilingGeometry);
  const ceiling = new THREE.Mesh(ceilingGeometry, wallMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = height / 2;
  roomGroup.add(ceiling);
  
  // Simple ceiling light fixture
  const lightFixtureGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
  geometries.push(lightFixtureGeometry);
  
  const lightFixtureMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffcc,
    emissiveIntensity: 0.5
  });
  materials.push(lightFixtureMaterial);
  
  const lightFixture = new THREE.Mesh(lightFixtureGeometry, lightFixtureMaterial);
  lightFixture.position.y = height / 2 - 0.1;
  roomGroup.add(lightFixture);
  
  // Add some objects to show reflections
  const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  geometries.push(sphereGeometry);
  
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x6688cc,
    roughness: 0.2,
    metalness: 0.8
  });
  materials.push(sphereMaterial);
  
  // Create some spheres at different positions
  const sphere1 = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere1.position.set(-2, -height / 2 + 0.5, -1);
  roomGroup.add(sphere1);
  
  const sphere2 = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere2.position.set(1.5, -height / 2 + 0.5, 0);
  roomGroup.add(sphere2);
  
  // Create a cube
  const cubeGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  geometries.push(cubeGeometry);
  
  const cubeMaterial = new THREE.MeshStandardMaterial({
    color: 0xcc6644,
    roughness: 0.3,
    metalness: 0.5
  });
  materials.push(cubeMaterial);
  
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(0, -height / 2 + 0.4, -3);
  roomGroup.add(cube);
  
  return { 
    roomGroup, 
    geometries, 
    materials,
    objects: [floor, backWall, leftWall, rightWall, ceiling, lightFixture, sphere1, sphere2, cube] 
  };
}
```

- この関数では、床、壁、天井、照明器具、および反射を示すためのオブジェクトからなる室内空間を作成しています。
- 床には反射効果を生み出すために、低めの`roughness`（0.3）と少しの`metalness`（0.2）を設定しています。
- 壁と天井は反射が少ないよう高い`roughness`（0.9）を設定しています。
- 照明器具には`emissive`プロパティを設定し、自ら光を放つように見せています。
- 球体と立方体は、床の反射効果を視覚的に確認するために設置されています。
- 後でリソースを適切に破棄できるよう、使用したジオメトリとマテリアルのリストも返却しています。

### 2-4. シーン構築: `setupScene`

```js
static setupScene(scene) {
  const objects = [];
  const geometries = [];
  const materials = [];
  
  // Create the room
  const { roomGroup, geometries: roomGeometries, materials: roomMaterials, objects: roomObjects } = 
    this.createRoom();
  
  geometries.push(...roomGeometries);
  materials.push(...roomMaterials);
  objects.push(...roomObjects);
  
  // Add the room group to the scene
  scene.add(roomGroup);
  objects.push(roomGroup);
  
  // Add lighting - ceiling light (spotlight pointing down)
  const spotLight = new THREE.SpotLight(0xffffcc, 100);
  spotLight.position.set(0, 2.5, 0);
  spotLight.angle = Math.PI / 4;
  spotLight.penumbra = 0.5;
  spotLight.decay = 2;
  spotLight.distance = 10;
  spotLight.castShadow = true;
  
  // Optimize shadow map
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadow.camera.near = 0.5;
  spotLight.shadow.camera.far = 20;
  
  scene.add(spotLight);
  objects.push(spotLight);
  
  // Add very dim ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambientLight);
  objects.push(ambientLight);
  
  // Enable shadows for all objects
  roomObjects.forEach(obj => {
    obj.castShadow = true;
    obj.receiveShadow = true;
  });
  
  return {
    objects,
    geometries,
    materials,
    lights: [spotLight, ambientLight],
    roomGroup
  };
}
```

- この関数では、シーン全体のセットアップを行います。
- 室内空間の作成、ライティングの設定、影の有効化などを行います。
- スポットライトには以下のプロパティを設定しています：
  - `angle`: 光の広がり角度（π/4 = 45度）
  - `penumbra`: 光の端のぼかし度合い（0.5）
  - `decay`: 距離による光の減衰（2 = 物理的に正確な減衰）
  - `distance`: 光が届く最大距離（10）
  - `castShadow`: 影を投影するかどうか（true）
- 影のクオリティを向上させるために、影用のマップサイズを1024x1024に設定しています。
- 暗い部分が完全な黒にならないよう、非常に弱いアンビエントライト（0.1強度）を追加しています。
- すべてのオブジェクトで影の投影と受け取りを有効にしています。
- 後でリソースを適切に破棄できるよう、使用したオブジェクト、ジオメトリ、マテリアル、ライトなどの参照を返却します。

### 2-5. オブジェクトの更新: `updateObjects`

```js
static updateObjects(time, params = {}) {
  const { roomGroup } = params;
  
  if (!roomGroup) return;
  
  // Find and animate the spheres and cube
  roomGroup.children.forEach(child => {
    if (child.geometry && (
        child.geometry.type === 'SphereGeometry' || 
        child.geometry.type === 'BoxGeometry')) {
      
      // Make objects hover slightly
      const initialY = child.position.y;
      child.position.y = initialY + Math.sin(time * 0.5 + child.position.x) * 0.05;
      
      // And rotate slowly
      child.rotation.y = time * 0.3;
      child.rotation.x = time * 0.2;
    }
  });
}
```

- この関数は、各フレームで球体と立方体の位置と回転を更新します。
- `roomGroup`内の子オブジェクトをループで処理し、ジオメトリのタイプが`SphereGeometry`または`BoxGeometry`のオブジェクトを見つけます。
- 各オブジェクトに以下のアニメーションを適用します：
  - 時間とオブジェクトのx位置に基づいたサイン波を使用して、わずかに上下に浮遊させる。
  - 時間に基づいて、ゆっくりとY軸とX軸の周りを回転させる。
- この動きにより、床の反射効果をより視覚的に確認しやすくなります。

### 2-6. 初期化処理: `init`

```js
async init() {
  try {
    const { roomGroup, lights } = CeilingLightRoom028.setupScene(this.scene);
    
    this.roomGroup = roomGroup;
    
    // Add to objects group
    this.objects.add(roomGroup);
    lights.forEach(light => this.objects.add(light));
    
    // Set camera position
    if (this.scene.userData.camera) {
      this.scene.userData.camera.position.set(0, 0, 5);
      this.scene.userData.camera.lookAt(0, 0, 0);
    }
    
    // Enable shadows for renderer
    if (this.scene.userData.renderer) {
      this.scene.userData.renderer.shadowMap.enabled = true;
      this.scene.userData.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}
```

- この関数では、シーンの初期化を行います。
- `setupScene`を呼び出して室内空間とライトを作成し、参照を保存します。
- カメラの初期位置を設定します。
- レンダラーの影機能を有効にし、影のタイプを`PCFSoftShadowMap`（柔らかくリアルな影）に設定します。
- エラーハンドリングにより、初期化中の問題をコンソールに出力します。

### 2-7. フレーム更新処理: `update`

```js
update(deltaTime) {
  this.time += deltaTime;
  
  // Update animations
  CeilingLightRoom028.updateObjects(this.time, {
    roomGroup: this.roomGroup
  });
}
```

- この関数は、各フレームで呼び出され、経過時間を更新し、シーン内のオブジェクトのアニメーションを進行させます。
- `updateObjects`を呼び出し、現在の時間と室内空間のグループを渡します。

### 2-8. サムネイル用カメラ位置: `getThumbnailCameraPosition`

```js
static getThumbnailCameraPosition() {
  return {
    position: [4, 1, 4],
    target: [0, -1, -1],
  };
}
```

- この関数は、サムネイル生成時のカメラ位置と注視点を返します。
- 部屋の斜め上から見下ろす位置（[4, 1, 4]）に設定し、床と反射効果が見えるようにしています。

### 2-9. プレビュー作成: `createPreview`

```js
static createPreview(container) {
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.set(4, 1, 4);
  camera.lookAt(0, -1, -1);
  
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);
  
  const { roomGroup, geometries, materials, objects } = this.setupScene(scene);
  
  let time = 0;
  
  return {
    element: renderer.domElement,
    animate: () => {
      time += 0.016;
      this.updateObjects(time, { roomGroup });
      renderer.render(scene, camera);
    },
    dispose: () => {
      // Dispose geometries
      geometries.forEach(g => g.dispose());
      
      // Dispose materials
      materials.forEach(m => m.dispose());
      
      // Dispose any additional materials on objects
      objects.forEach(obj => {
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => mat.dispose());
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

- この関数は、プレビュー用のレンダラー、シーン、カメラをセットアップします。
- アニメーション関数を提供し、シーンの動きを確認できるようにします。
- `dispose`関数で使用済みのリソース（ジオメトリ、マテリアル、レンダラー）を破棄し、メモリリークを防止します。
- レンダラーのアンチエイリアスと影機能を有効にし、高品質なプレビューを提供します。

### 2-10. サムネイル生成: `getThumbnailBlob`

```js
static getThumbnailBlob() {
  // Simple SVG representation of a room with ceiling light and reflective floor
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#111111"/>
      
      <!-- Room outline -->
      <polygon points="40,60 40,160 160,160 160,60" fill="none" stroke="#555555" stroke-width="2"/>
      
      <!-- Floor with reflection -->
      <rect x="40" y="160" width="120" height="30" fill="#444444"/>
      <rect x="40" y="160" width="120" height="30" fill="url(#reflection)" opacity="0.3"/>
      
      <!-- Ceiling light -->
      <circle cx="100" cy="60" r="15" fill="#ffffcc" opacity="0.9"/>
      <circle cx="100" cy="60" r="10" fill="#ffffff"/>
      
      <!-- Light cone -->
      <polygon points="90,60 110,60 140,160 60,160" fill="#ffffcc" opacity="0.1"/>
      
      <!-- Objects casting reflections -->
      <circle cx="70" cy="150" r="10" fill="#6688cc"/>
      <rect x="95" cy="145" width="15" height="15" fill="#cc6644"/>
      <circle cx="130" cy="150" r="10" fill="#6688cc"/>
      
      <!-- Reflections -->
      <circle cx="70" cy="170" r="10" fill="#6688cc" opacity="0.3"/>
      <rect x="95" cy="165" width="15" height="15" fill="#cc6644" opacity="0.3" transform="scale(1,-0.5)"/>
      <circle cx="130" cy="170" r="10" fill="#6688cc" opacity="0.3"/>
      
      <!-- Reflection gradient -->
      <defs>
        <linearGradient id="reflection" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.2" />
          <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
        </linearGradient>
      </defs>
    </svg>
  `;
  
  const encodedSvg = unescape(encodeURIComponent(svgString));
  const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);
  return fetch(dataURL).then(res => res.blob());
}
```

- この関数は、サムネイル用のSVG画像を生成し、Blobに変換して返します。
- SVGでは以下の要素を表現しています：
  - 部屋の輪郭
  - 反射効果のある床（グラデーションとopacityで表現）
  - 天井のライト
  - 光の円錐
  - 反射を投げかけるオブジェクト（球体と立方体）
  - オブジェクトの床への反射
- ギャラリー表示などに利用されます。

---

## 3. まとめ

本サンプルでは、Three.jsの物理ベースレンダリング機能を使用して、天井スポットライトと反射床を持つシンプルな室内空間を実装しています。

反射床と照明の効果は、以下の要素によって実現されています：

1. **物理ベースマテリアル**: MeshStandardMaterialを使用して、現実世界の物理法則に基づいた光の反射を再現。
2. **マテリアルプロパティの調整**: roughness、metalness、emissiveなどのプロパティを調整して、様々な材質表現を実現。
3. **スポットライトのパラメータ設定**: 角度、減衰、ペナンブラなどのパラメータを調整して、自然な照明効果を表現。
4. **影の有効化と最適化**: 影のキャストと受け取りを有効にし、影マップのサイズを適切に設定。

このテクニックは、建築ビジュアライゼーション、バーチャルショールーム、ゲーム環境など、様々な用途に応用できます。パラメータを調整することで、異なる材質や照明条件を簡単に表現できる柔軟な設計となっています。

このコードを通じて、Three.jsにおける物理ベースレンダリング、マテリアル設定、ライティング技術について理解を深めることができるでしょう。これらの基本的な技術を組み合わせることで、リアルで魅力的な3D空間を作成する第一歩を踏み出すことができます。