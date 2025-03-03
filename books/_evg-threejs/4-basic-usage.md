---
title: 基本的な使い方
free: true
---
# Three.js Everyday Season 01 - Basic Usage

**「Three.js Everyday SEASON 01」** の第四章である本章「Basic Usage」では、前章（Basic Concepts）で学んだThree.jsの主要な概念を**実際にコードへ落とし込みながら** 使いこなしていく方法を、より具体的かつ実践的に解説します。これまでに

1. **Introduction**  
2. **Getting Started**  
3. **Basic Concepts**  

を通じて、「Three.jsがどんなライブラリなのか」「開発環境をどう整えるのか」「Three.jsの土台となるScene, Camera, Rendererなどの概念」を理解してきたはずです。  
本章では、**基本的なジオメトリやマテリアルを使ったオブジェクトの扱い方**、**ライトの配置**、**カメラ操作の実践**、**アニメーションやイベント処理**など、Three.jsを使った3Dシーンの「基本的な使い方」をさらに深掘りします。

全体を通して「**サンプルコードを動かしながら**」読み進めるのが理想です。開発環境には、CDNによる最小構成でも、Vite/Webpackなどのビルドツールを導入した環境でも構いません。学習効率を高めるために、ぜひサンプルをコピー＆ペーストしながら**動くものを作り、観察する**というフローを大切にしてください。

---

## 1. シーンの作成とオブジェクト追加の復習

### 1-1. まずは最小コードを再掲

ごくシンプルなThree.jsのコード例を再度確認しましょう。これから登場する要素を追加しやすくするため、今回は`OrbitControls`も導入してみます。

```js
import * as THREE from 'three';
// OrbitControlsの追加（npmでthreeをインストールしている場合）
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function init() {
  // シーンの作成
  const scene = new THREE.Scene();

  // カメラの作成
  const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
  );
  camera.position.set(0, 0, 5);

  // レンダラーの作成
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // OrbitControlsを有効化（マウスドラッグでカメラ操作ができる）
  const controls = new OrbitControls(camera, renderer.domElement);

  // ウィンドウリサイズへの対応
  window.addEventListener('resize', onWindowResize);
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // とりあえず立方体を一つ
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshNormalMaterial();
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // アニメーションループ
  function animate() {
    requestAnimationFrame(animate);

    // ここにアニメーション用の処理を書く
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

init();
```

- **OrbitControls**: カメラをインタラクティブに操作できる便利ツール。マウスドラッグでオービット（回転）でき、ホイールでズームイン・アウトが可能です。  
- **MeshNormalMaterial**: 法線ベクトルをRGBに割り当てて色を出すマテリアル。ライトを置かなくても、見た目の変化がわかりやすいのでデバッグや学習に便利。

「**Basic Usage**」では、このコードをベースに少しずつ機能を加えながら解説していきます。

---

## 2. ジオメトリとマテリアルの基本

Three.jsでは3Dオブジェクトを**ジオメトリ**と**マテリアル**の組み合わせで定義します。`THREE.Mesh(geometry, material)`を使うのが最も代表的な方法です。

### 2-1. 代表的なジオメトリ

1. **BoxGeometry**  
   立方体（直方体）を定義する最もシンプルなジオメトリ。  
   ```js
   const boxGeo = new THREE.BoxGeometry(1, 1, 1);
   ```
2. **SphereGeometry**  
   球体ジオメトリ。引数に半径、経度分割数、緯度分割数などを指定する。  
   ```js
   const sphereGeo = new THREE.SphereGeometry(1, 32, 16);
   ```
3. **PlaneGeometry**  
   2D平面を定義するジオメトリ。  
   ```js
   const planeGeo = new THREE.PlaneGeometry(5, 5);
   ```
4. **CylinderGeometry**  
   円柱ジオメトリ。  
   ```js
   const cylinderGeo = new THREE.CylinderGeometry(1, 1, 2, 32);
   ```
5. **TorusGeometry**  
   ドーナツ状ジオメトリ。  
   ```js
   const torusGeo = new THREE.TorusGeometry(1, 0.3, 16, 32);
   ```
6. **TorusKnotGeometry**  
   複雑な結び目の形状。派手な見栄えを試したいときに便利。  
   ```js
   const torusKnotGeo = new THREE.TorusKnotGeometry(0.8, 0.2, 100, 16);
   ```

#### 例：複数のジオメトリを並べてみる

```js
// シーンやカメラ、レンダラーなどの初期化は省略

const geometries = [
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.SphereGeometry(0.75, 32, 16),
  new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16),
  new THREE.TorusGeometry(0.6, 0.2, 16, 32),
  new THREE.TorusKnotGeometry(0.5, 0.15, 80, 16),
];

const material = new THREE.MeshNormalMaterial();

geometries.forEach((geo, index) => {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.x = (index - 2) * 2; // x方向にずらして配置
  scene.add(mesh);
});
```

### 2-2. 代表的なマテリアル

1. **MeshBasicMaterial**  
   ライティングの影響を受けない、ベタ塗りのマテリアル。学習やデバッグ、ポスター調の演出に使える。  
   ```js
   const basicMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
   ```
2. **MeshLambertMaterial**  
   ランバートシェーディングによる比較的軽量なマテリアル。ライトの影響を受ける。  
   ```js
   const lambertMat = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
   ```
3. **MeshPhongMaterial**  
   Phongシェーディングによるマテリアル。ハイライト（スペキュラ）や光沢を表現できる。  
   ```js
   const phongMat = new THREE.MeshPhongMaterial({
     color: 0x5555ff,
     shininess: 100,
     specular: 0x222222,
   });
   ```
4. **MeshStandardMaterial**  
   PBR（物理ベースレンダリング）に対応したスタンダードなマテリアル。メタリック度合いやラフネスを指定できる。  
   ```js
   const standardMat = new THREE.MeshStandardMaterial({
     color: 0xffffff,
     roughness: 0.5,
     metalness: 0.3,
   });
   ```
5. **MeshNormalMaterial**  
   前述の通り、頂点法線を色として可視化するマテリアル。デバッグ用途にも使われる。  
   ```js
   const normalMat = new THREE.MeshNormalMaterial();
   ```
6. **MeshPhysicalMaterial**  
   MeshStandardMaterialを拡張して、屈折率やクリアコートなど追加パラメータをサポート。ガラスや水の表現などにも。  
   ```js
   const physicalMat = new THREE.MeshPhysicalMaterial({
     transmission: 0.9,  // 透明度
     thickness: 1.0,
   });
   ```

#### テクスチャの設定

マテリアルには、`map`, `normalMap`, `roughnessMap` など、さまざまなテクスチャを適用可能です。簡単な例として、画像を使ったカラーのテクスチャを設定してみましょう。

```js
// テクスチャローダーの使用
const textureLoader = new THREE.TextureLoader();
const colorTexture = textureLoader.load('path/to/texture.jpg');

// スタンダードマテリアルでテクスチャを適用
const texturedMat = new THREE.MeshStandardMaterial({
  map: colorTexture,
});
```

**注意:** テクスチャ画像のパスやサイズによって、読み込みエラーやパフォーマンスへの影響が出る場合があるので注意してください。

---

## 3. ライト（照明）の基本

多くのマテリアル（**MeshLambertMaterial**や**MeshPhongMaterial**、**MeshStandardMaterial**など）は、シーン内にライトが存在しないと暗いままで何も見えません。逆に言えば、ライティングをコントロールすることで、シーンの雰囲気を大きく変えられます。

### 3-1. 代表的なライトの種類

1. **AmbientLight**  
   シーン全体を均一に照らすライト。強さを調整するだけで、全体の明るさをコントロール可能。  
   ```js
   const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // color, intensity
   scene.add(ambientLight);
   ```

2. **DirectionalLight**  
   ある方向からの平行光を照射するライト。太陽光のようなイメージ。影を落とす際に使用されることが多い。  
   ```js
   const dirLight = new THREE.DirectionalLight(0xffffff, 1);
   dirLight.position.set(5, 10, 7);
   scene.add(dirLight);
   // 影を落とす設定
   dirLight.castShadow = true;
   ```

3. **PointLight**  
   点光源。全方向に光を放つライト。電球のイメージ。  
   ```js
   const pointLight = new THREE.PointLight(0xff0000, 1, 100); // (color, intensity, distance)
   pointLight.position.set(2, 3, 1);
   scene.add(pointLight);
   ```

4. **SpotLight**  
   スポットライト。円錐形に光を照射し、特定の場所を強調したい場合に使用。  
   ```js
   const spotLight = new THREE.SpotLight(0xffffff, 1);
   spotLight.position.set(0, 5, 5);
   scene.add(spotLight);
   ```

5. **HemisphereLight**  
   上空からのライトと地面からの反射光を同時に表現するライト。空や地面の色を設定すると自然光っぽい雰囲気になる。  
   ```js
   const hemiLight = new THREE.HemisphereLight(0xaaaaaa, 0x444444, 1);
   scene.add(hemiLight);
   ```

### 3-2. ライトの配置例

```js
// アンビエントライト（全体の明るさ）
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// ディレクショナルライト（太陽光）
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// ライトヘルパーを使って可視化（debug）
const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 1);
scene.add(dirLightHelper);
```

上記のようにライトを追加した場合、`MeshLambertMaterial`や`MeshPhongMaterial`、`MeshStandardMaterial`などを使ったメッシュが、適切に照らされるようになります。

---

## 4. カメラ操作の具体例

### 4-1. 視点の移動や回転

`camera.position.set(x, y, z)`でカメラ位置を移動し、`camera.lookAt(target)`で注視点を指定できます。OrbitControlsを使わない場合は、自分でカメラ操作をコード化することが多いです。

```js
camera.position.set(0, 2, 5);
camera.lookAt(0, 0, 0);
```

また、カメラの回転角度を直接触るには、`camera.rotation.x`などを操作します。ただし、Three.jsではクォータニオンやオイラー角による回転が絡むため、トラブルが起きやすい分野でもあります。OrbitControlsのような既存のツールを使うのが無難です。

### 4-2. OrthographicCamera（正射影カメラ）の使い方

Three.jsでは、遠近感のある**PerspectiveCamera**だけでなく、**OrthographicCamera**も用意されています。CAD的な2Dライクな描画やUI用途などに便利です。

```js
const left = -10;
const right = 10;
const top = 10;
const bottom = -10;
const near = 0.1;
const far = 1000;

const orthoCamera = new THREE.OrthographicCamera(
  left, right, top, bottom, near, far
);

orthoCamera.position.set(0, 0, 10);
orthoCamera.lookAt(0, 0, 0);
```

ただし、オルソカメラでは`camera.aspect`を手動で合わせる必要があったりと、若干の取り扱いが違います。UI要素や2Dライクな描画に使う場合は、拡大縮小の挙動をどう制御するかを事前に決めておくとよいでしょう。

---

## 5. オブジェクトの座標変換と階層構造

### 5-1. 座標変換（position, rotation, scale）

`Mesh`などの3Dオブジェクトは、`position`, `rotation`, `scale`というプロパティを持っています。それぞれ以下のように操作可能です。

```js
cube.position.set(1, 2, -3);  // x=1, y=2, z=-3
cube.rotation.y = Math.PI / 4; // y軸回転を45°に
cube.scale.set(2, 1, 1);      // x方向に2倍拡大
```

`rotation`には**オイラー角**（`x`, `y`, `z`の順番で回転）や**クォータニオン**による回転も指定できますが、最初のうちはオイラー角を直接いじるのが分かりやすいです。

### 5-2. 階層構造（親子関係）

Three.jsでは、ある`Object3D`を他の`Object3D`の子にすることができます。親を移動・回転・拡大すると、子も同じ変換が適用されます。

```js
// グループを作成
const group = new THREE.Group();

// 子オブジェクトとして追加
group.add(cube);
group.add(sphere);

// グループ全体の座標を移動
group.position.set(0, 1, 0);

// シーンにグループを追加
scene.add(group);
```

この仕組みを使うと、たとえばロボットの腕やソーラーパネルなど、パーツごとに階層を作り、親を回転させると一緒に動く構造を表現できます。

---

## 6. アニメーションの作り方

### 6-1. requestAnimationFrameループ

前章（Basic Concepts）でも紹介したとおり、Three.jsのアニメーションは基本的に`requestAnimationFrame`を使って実装します。1フレームごとに**回転角度を変化**させたり、**移動座標を更新**したりしてから`renderer.render(scene, camera)`を呼び出す流れです。

```js
function animate() {
  requestAnimationFrame(animate);

  // アニメーションさせたい処理
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  controls.update(); // OrbitControlsの更新
  renderer.render(scene, camera);
}

animate();
```

### 6-2. 時間の管理（deltaTime）

フレームごとに同じ量を回転させると、フレームレートが低下したときにアニメーション速度が不安定になるという問題があります。そこで、経過時間（deltaTime）を考慮して一定速度を保つ方法がよく用いられます。

```js
let previousTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const currentTime = performance.now();
  const deltaTime = (currentTime - previousTime) / 1000; // 秒
  previousTime = currentTime;

  // 1秒で45度回転させる場合
  cube.rotation.y += (Math.PI / 4) * deltaTime;

  controls.update();
  renderer.render(scene, camera);
}
animate();
```

こうすることで、PCスペックやフレームレートに依存せず、一定速度のアニメーションが実現できます。

---

## 7. イベント処理とインタラクション

### 7-1. マウス操作（OrbitControlsなしの場合）

カメラ操作以外にも、Three.js上のイベントを扱うことは可能です。たとえば、`mousemove`や`click`イベントをJavaScript側で受け取り、`Raycaster`を使って3Dオブジェクトと衝突判定を行う手段が一般的です。

```js
// マウス位置の正規化座標を計算
const mouse = new THREE.Vector2();

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('mousemove', onMouseMove);
```

この`mouse`ベクトルを`Raycaster`に与え、3Dシーン上でヒットしているオブジェクトを取得します。

```js
const raycaster = new THREE.Raycaster();

function animate() {
  requestAnimationFrame(animate);

  // マウス座標をRayに変換
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  // 何かにヒットしていればハイライトなどの処理
  if (intersects.length > 0) {
    // 一番手前のオブジェクト
    const hit = intersects[0];
    hit.object.material.color.set(0xff0000);
  }

  renderer.render(scene, camera);
}
```

これでマウスが指し示すオブジェクトに対してリアクションを行うインタラクティブな体験を実装できます。

### 7-2. キーボード操作

普通のJavaScriptイベントリスナーを使ってキーボード操作も受け付けられます。プレイヤーの操作（WASDキーで移動など）を実装したい場合によく使います。

```js
window.addEventListener('keydown', onKeyDown);

function onKeyDown(e) {
  switch (e.code) {
    case 'KeyW':
      // 前進
      cube.position.z -= 0.1;
      break;
    case 'KeyS':
      // 後退
      cube.position.z += 0.1;
      break;
  }
}
```

---

## 8. パーティクル表現の基本

パーティクルは大量の小さな点やスプライトを描画することで、**煙や星空、花びらの舞**などを表現する手段です。Three.jsでは`Points`と`PointsMaterial`、あるいは`ShaderMaterial`を使って実装します。

### 8-1. Points + PointsMaterial

```js
// 頂点データをランダムに生成
const particleCount = 1000;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 20; // -10~10 の範囲
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// マテリアル作成
const material = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1,
});

// Pointsを作成
const particles = new THREE.Points(geometry, material);
scene.add(particles);
```

この場合、3D空間に1,000個のパーティクルがランダム配置されます。`PointsMaterial`の`size`パラメータでパーティクルの大きさを調整可能です。

### 8-2. テクスチャを使ったパーティクル

`PointsMaterial`に`map`を指定すれば、スプライトのようなテクスチャを適用できます。アルファチャンネルつきの画像を用意すれば、丸いパーティクルや花びらなど思い思いの形が表示できます。

```js
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load('textures/particle.png');

const material = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.2,
  map: particleTexture,
  transparent: true,
  alphaTest: 0.01,
});
```

**注意:** テクスチャにはパーティクル用に**プリマルチプライドアルファ**などの下準備が必要な場合があります。最初はシンプルなPNGを使えばOKです。

---

## 9. フォグ（霧）の導入

シーン全体に霧をかけることで、**遠方が白く/黒く/任意の色にかすむ**ような演出を加えられます。シンプルですが、世界観を演出するのに効果的です。

```js
// 白いフォグを追加（near=1, far=15）
scene.fog = new THREE.Fog(0xffffff, 1, 15);
```

`FogExp2`という指数関数的に霧がかかるフォグもあります。それぞれ表現が異なるので試してみましょう。

```js
scene.fog = new THREE.FogExp2(0xffffff, 0.05);
```

---

## 10. シャドウ（影）の設定

### 10-1. 基本的な影の有効化

1. レンダラーで**影のレンダリング**を有効化する
   ```js
   renderer.shadowMap.enabled = true;
   ```
2. ライト側で**影を落とす設定**を有効化する（DirectionalLightやSpotLightなど）
   ```js
   dirLight.castShadow = true;
   ```
3. 影を受けるメッシュ・影を落とすメッシュの設定
   ```js
   cube.castShadow = true;
   cube.receiveShadow = false;

   floor.castShadow = false;
   floor.receiveShadow = true;
   ```

### 10-2. サンプルコード

```js
// レンダラーの設定
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // シャドウのタイプ

// ライト設定
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(3, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);

// シャドウの細かい設定（カメラ範囲など）
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;

// メッシュの設定
const floorGeo = new THREE.PlaneGeometry(20, 20);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const boxMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const box = new THREE.Mesh(boxGeo, boxMat);
box.position.y = 1; 
box.castShadow = true;
scene.add(box);
```

このように設定すると、赤い立方体が床の上に置かれているシーンで、DirectionalLightによる影が落ちます。**影をうまく表示するにはカメラ範囲やマップサイズなど多くのパラメータを調整**する必要があるので、少し試行錯誤が必要になります。

---

## 11. Helper・デバッグ用ツールの活用

### 11-1. AxesHelper

シーンの原点に表示するXYZ軸。赤がX軸、緑がY軸、青がZ軸。座標系を視覚的に確認できます。

```js
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
```

### 11-2. GridHelper

地面に格子状のラインを表示。大きさや色を指定可能。

```js
const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);
```

### 11-3. CameraHelper, LightHelper

- **CameraHelper**  
  カメラの視錐台を可視化。特にOrthographicCameraやShadow Cameraのデバッグに有用。  
  ```js
  const cameraHelper = new THREE.CameraHelper(dirLight.shadow.camera);
  scene.add(cameraHelper);
  ```
- **LightHelper**  
  ライトの位置や方向を可視化。前述のDirectionalLightHelperなど。

---

## 12. リサイズやデバイスピクセル比への対応

### 12-1. リサイズイベントへの対応

すでに示したように、`window.addEventListener('resize', ...)`でリサイズ処理を行うのが基本です。**カメラのアスペクト比を更新**し、**rendererのサイズを再設定**するだけでOKです。

```js
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);
```

### 12-2. devicePixelRatioの考慮

ハイDPIディスプレイ（Retinaディスプレイなど）では、解像度が論理ピクセルと実ピクセルで異なるため、レンダリングがぼやける可能性があります。これを防ぐため、`renderer.setPixelRatio(window.devicePixelRatio)`を設定することが推奨されます。

```js
renderer.setPixelRatio(window.devicePixelRatio);
```

ただし、これを設定すると描画負荷が上がる場合もあるため、**パフォーマンスとのトレードオフ**です。

---

## 13. シーン内でのアニメーション制御例

### 13-1. 複数オブジェクトのアニメーション

```js
const cubes = [];
for (let i = 0; i < 10; i++) {
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), material);
  box.position.x = i - 4.5;
  scene.add(box);
  cubes.push(box);
}

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now() * 0.001;
  cubes.forEach((cube, index) => {
    // indexごとに位相をずらす
    cube.position.y = Math.sin(time + index) * 1;
  });

  renderer.render(scene, camera);
}
animate();
```

これは**サイン波**を使って上下移動させる例です。オブジェクト配列をループしながらアニメーション処理を行うパターンはよく使います。

### 13-2. Tweeningライブラリの活用

Three.jsそのものには、補間（イージング）機能は組み込まれていません。スムーズなアニメーションやトランジションを実装したい場合は、**GSAP**や**tween.js**などのライブラリを併用するのが一般的です。たとえばGSAPの場合、

```js
import { gsap } from "gsap";

gsap.to(cube.position, {
  x: 5,
  duration: 2,
  ease: "power2.inOut"
});
```

これだけで、`cube.position.x`が2秒かけて0→5に変化し、スムーズなイージングでアニメーションします。複雑なシーケンス管理も得意なので、自由度の高い表現が可能です。

---

## 14. 複数シーンや複数カメラのレンダリング

Three.jsでは**複数のシーンやカメラを独立にレンダリング**することができます。たとえば、メインシーンとは別にUI用のシーンを重ね描きしたり、VR用のステレオカメラを使ったりするケースが考えられます。

```js
renderer.autoClear = false; 
// 自動クリアをオフにし、手動で明示的にクリアする

function animate() {
  requestAnimationFrame(animate);
  renderer.clear(); // 最初にクリア

  // メインシーンの描画
  renderer.render(mainScene, mainCamera);

  // UIシーンの描画（手前に描くイメージ）
  renderer.clearDepth(); // 深度バッファだけクリア
  renderer.render(uiScene, uiCamera);
}
```

このように、描画順をコントロールしてシーンを重ねる手法は**HUD表示**（Heads-Up Display）や**ステレオ表示**などのカスタムな使い方を実現します。

---

## 15. 基本的なユースケース例

ここからは、**実際のユースケース**を踏まえたサンプルコードやアイデアをいくつか紹介します。

### 15-1. 3Dロゴの回転アニメーション

Webサイトのトップ画面などで、ロゴを3Dオブジェクトにして回転させる例。

1. **ロゴモデル（glTFなど）を読み込み**  
2. **少し浮かせて回転アニメーション**  
3. **マウスホバーで色を変える**などの演出

```js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('models/logo.glb', (gltf) => {
  const logo = gltf.scene;
  logo.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
    }
  });
  scene.add(logo);

  // アニメーションの一例
  function animateLogo() {
    logo.rotation.y += 0.01;
  }

  // メインループ内で呼び出す
  function animate() {
    requestAnimationFrame(animate);
    animateLogo();
    renderer.render(scene, camera);
  }
  animate();
});
```

### 15-2. シンプルなマップナビゲーション

室内や敷地の配置図を**PlaneGeometry**で用意し、カメラを俯瞰視点にして、クリックで各場所を選択して詳細表示するようなUIを作る例。

- カメラは正射影（OrthographicCamera）を利用して2Dライクな表示に。  
- `Raycaster`でクリックした場所を取得→ポップアップを表示。

### 15-3. 商品ビジュアライゼーション

**回転台のように商品を回しながら見る**、あるいは**カラーやテクスチャを切り替える**といった実装は、Three.jsで非常にポピュラーなユースケースです。ユーザーが**マウスドラッグ**で自由に商品を回転させられるようにするだけで、Web上での体験が大きく向上します。

---

## 16. パフォーマンスの注意点

### 16-1. 描画負荷を抑える工夫

- **ポリゴン数を減らす**: モデルのLOD（Level of Detail）を検討し、高精細すぎるメッシュを使わない。  
- **テクスチャサイズを調整**: 大きすぎるテクスチャを使わない（特にモバイル環境）。  
- **影の設定**: シャドウマップサイズを必要最小限にする。  
- **フレームレートの監視**: `stats.js`や`console.time`などを使ってパフォーマンスをモニターする。

### 16-2. インスタンシング

同じジオメトリを大量に表示する場合、**インスタンシング**によって描画負荷を大幅に削減できます。たとえば`THREE.InstancedMesh`は、一つのジオメトリとマテリアルを使い回して複数のメッシュを描画する仕組みです。パーティクルやタイル状のオブジェクトなどで威力を発揮します。

---

## 17. まとめ

「**Basic Usage**」では、Three.jsを使った3Dシーンの構築における基本的な活用法を網羅的に解説しました。特に重要なポイントを振り返ってみましょう。

1. **ジオメトリとマテリアル**  
   - Box, Sphere, Plane, TorusKnotなどさまざまな形状  
   - Basic/Lambert/Phong/Standardなどのマテリアルとライトの組み合わせ
2. **ライトの種類と照明効果**  
   - AmbientLight, DirectionalLight, PointLight, SpotLight, HemisphereLight  
   - シャドウマッピングを使う場合の`castShadow`や`receiveShadow`
3. **カメラ操作とOrbitControls**  
   - カメラ位置や回転を直接操作、またはOrbitControlsを使ってマウスで視点移動  
   - OrthographicCameraを使った正射影表示
4. **アニメーション**  
   - `requestAnimationFrame`でループを作る  
   - 経過時間（deltaTime）の活用、Tweenライブラリとの連携
5. **インタラクション**  
   - Raycasterを用いたクリック判定  
   - キーボードイベントやマウスイベントの監視
6. **パーティクルやフォグ**  
   - `Points`を使った軽量な表現  
   - シーンにフォグを適用して演出
7. **シャドウ設定とデバッグヘルパー**  
   - `renderer.shadowMap.enabled = true;`  
   - AxesHelper, GridHelper, CameraHelper, LightHelper
8. **リサイズ対応とdevicePixelRatio**  
   - ウィンドウサイズ変更時のカメラ更新  
   - 高DPI環境への対応
9. **パフォーマンス**  
   - モデルやテクスチャを最適化する  
   - 大量描画はインスタンシングやLODの検討

本章の内容をマスターすると、**小〜中規模のThree.jsプロジェクト**で必要となる機能の多くをカバーできるでしょう。次章「Usecase-001」では、さらに具体的なユースケースに沿ったデモやサンプルプロジェクトを組み立てながら、ここで学んだ知識を**本格的な応用**へとつなげていきます。

---

## 18. さらなるステップへのヒント

### 18-1. シェーダーのカスタマイズ

マテリアルの自由度を高めたいなら、**ShaderMaterial**や**RawShaderMaterial**を使って独自の頂点/フラグメントシェーダーを書く方法があります。ノイズ表現やグリッチエフェクト、複雑なアニメーションをマテリアルレベルで実装できるようになるため、表現の幅が一気に広がります。ただし、GLSLの知識が必要になるため、本格的に踏み込むにはもう少しThree.jsに慣れた後がいいでしょう。

### 18-2. モデル読み込みの最適化

- **glTF形式**を推奨（バイナリ形式の`.glb`）。  
- **DRACO圧縮**や**Meshopt**を使ってポリゴンデータを圧縮し、ロード時間を短縮。  
- **テクスチャの圧縮**や**WebP/AVIF**など新しいフォーマットの活用。

### 18-3. ポストプロセシング

Three.jsの拡張として、**EffectComposer**を使った**ポストプロセス**が挙げられます。Bloom、被写界深度(Depth of Field)、モーションブラー、SSAOなどの後処理エフェクトによって、フォトリアルな映像に近づけたり、アニメ調にしたりといった演出を追加できます。

### 18-4. WebXR・VR/AR

Three.jsは**WebXR**にも対応しており、VRヘッドセットを装着してThree.jsのシーンを体験できる仕組みがあります。メタバース的なプロジェクトを検討している場合、WebXRのAPIと組み合わせることでWeb上で没入型3D体験を構築可能です。

---

## 19. 次章予告：Usecase-001

次の章「**Usecase-001**」では、本章までに学んだ**基礎知識**を踏まえつつ、**具体的なユースケースに即したアプリケーション**を作ってみる予定です。たとえば：

- 複数オブジェクトとライトを組み合わせた小さなインタラクティブシーン  
- マウスまたはタッチ操作でオブジェクトを回転し、クリックすると情報が表示される仕組み  
- モデルを読み込んでアニメーションさせる簡易ビューワー

など、「どういう使い方を想定してThree.jsを組み込むか？」を考えながら、実践的にコードを書いていきます。ぜひ楽しみにお待ちください。

---

## 20. おわりに

ここまでで、Three.jsにおける**基本的な使い方**を解説してきました。  
以下の項目を繰り返し実践していただければ、確実にThree.jsの操作になじんでいくはずです。

1. **サンプルコードをどんどん動かす**  
   - ジオメトリ、マテリアル、ライト、カメラ、アニメーションなどを組み合わせて実験
2. **パラメータを変えてみる**  
   - 色を変えたり、マウスの反応を変えたり、回転軸を変えたりして遊ぶ
3. **エラーや真っ黒画面が出たら落ち着いて原因を探す**  
   - コンソールエラーを確認、ライトやカメラの設定を再チェック
4. **最初はシンプルなシーンから**  
   - 複雑な機能を一度に入れすぎず、一つずつ理解しながら追加

3D表現の世界は奥が深く、**どれだけ学んでも新しい発見がある**のが魅力でもあり、難しさでもあります。本章の内容を自分のプロジェクトや作品に応用しながら、Three.jsに慣れていってください。

次章「Usecase-000」では、**一歩進んだ実用例**を通じて、ここで紹介した技術をどのように組み合わせるかを実践的に見ていきます。モデリングデータやUIとの連携なども視野に入れながら、実際の開発の流れを体験してみましょう。それでは、次章でお会いしましょう！
