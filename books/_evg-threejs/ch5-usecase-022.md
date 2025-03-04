---
title: Usecase-022 Curved Tunnel  
free: true
---

# Usecase-022: Curved Tunnel

**本章では、`usecases/usecase-022` ディレクトリに格納されている「Curved Tunnel」のコードを解説します。**  
このサンプルは、曲線に沿って配置された円柱でトンネルを作成し、カメラがその中を通過するアニメーションを実装しています。CatmullRomCurve3 を用いた螺旋状の曲線パスに沿って、複数の円柱を円形に配置することでトンネルを表現し、黄色い球体（マーカー）がトンネル内を移動、さらにそのマーカーに追従するカメラアニメーションを実現しています。

---

## 1. カーブしたトンネルとカメラアニメーションの概要

本サンプルでは以下の特徴があります：

1. **螺旋状のトンネル**  
   曲線パスに沿って配置された円柱を複数の輪として組み合わせ、トンネル状の構造を生成しています。

2. **カラフルな照明**  
   トンネル内に配置した複数の点光源が、異なる色と位置でシーンを照らし、視覚的なアクセントを付けています。

3. **マーカーオブジェクト**  
   黄色い球体がトンネル内を移動し、これによりカメラの追従対象となる動的なオブジェクトが実現されています。

4. **カメラアニメーション**  
   マーカーの進行方向に合わせてカメラが追従する仕組みになっており、マーカーの進行に合わせてカメラ位置と視線が更新されます。

5. **脈動するエフェクト**  
   時間とともに円柱のスケールや、光源の強度が変化することで、シーンに動的なリズムを与え、臨場感のあるトンネル通過体験を演出しています。

---

## 2. `usecase-022/index.js` コード詳細

以下、コードの主要部分ごとに解説します。

### 2-1. metadata

シーンの基本情報を定義しています。  
- **id:** "022"  
- **title:** "Curved Tunnel"  
- **description:** 円柱で作ったトンネルとカメラの通過アニメーションについて記述  
- **categories:** Geometry, Animation, Camera

```js
static metadata = {
  id: "022",
  title: "Curved Tunnel",
  description:
    "弧を描いたカーブに沿って配列した円柱でトンネルを作り、カメラを通過させる",
  categories: ["Geometry", "Animation", "Camera"],
};
```

---

### 2-2. constructor

シーンに必要な各オブジェクトやパラメータを初期化しています。

```js
constructor(scene) {
  super(scene);
  this.objects = new Set();
  this.time = 0;
  this.cameraPath = null;
  this.cameraPathLength = 0;
  this.cameraSpeed = 0.05; // カメラの移動速度（体験をゆっくりと楽しむため）
  this.markerProgress = 0; // マーカーの進行度（0～1）
  this.originalCameraPosition = null;
  this.originalCameraTarget = null;
  this.tunnelRadius = 1.5; // トンネルの半径
  this.tunnelSegments = 50; // トンネルのセグメント数
  this.cylinderHeight = 0.5; // 各円柱の高さ
  this.cylinderRadius = 0.2; // 各円柱の半径
  this.cylindersPerRing = 12; // 一つの輪を構成する円柱の数
  this.isAnimating = false; // アニメーション中かどうか
  this.lastReportedProgress = -1; // 進行状況の報告用
}
```

---

### 2-3. setupScene(scene)

シーンの初期設定と各オブジェクト（背景、照明、曲線パス、トンネル、マーカーなど）の生成を行います。

#### 背景と照明

- **背景:** 暗めの青（0x111122）  
- **環境光:** 0x666666（強さ1.5）  
- **点光源:** 異なる色（赤、緑、青、黄、マゼンタ）を持つ点光源を 5 つ配置し、トンネル内を照らす

```js
scene.background = new THREE.Color(0x111122);

const objects = [];
const geometries = [];

// 環境光の追加
const ambientLight = new THREE.AmbientLight(0x666666, 1.5);
scene.add(ambientLight);
objects.push(ambientLight);

// 点光源の追加
const pointLights = [];
const lightColors = [0xff5555, 0x55ff55, 0x5555ff, 0xffff55, 0xff55ff];

for (let i = 0; i < 5; i++) {
  const light = new THREE.PointLight(
    lightColors[i % lightColors.length],
    2,
    15
  );
  light.position.set(
    Math.sin(i * Math.PI * 0.4) * 3,
    Math.cos(i * Math.PI * 0.4) * 2,
    i * 5 - 10
  );
  scene.add(light);
  objects.push(light);
  pointLights.push(light);
}
```

#### カーブパスの作成

CatmullRomCurve3 を利用し、螺旋状のパスを作成します。パス上の各点は sin, cos を用いて計算され、z 座標は奥方向へ伸びるように設定しています。

```js
const curvePoints = [];
for (let i = 0; i <= 10; i++) {
  const t = i / 10;
  const x = Math.sin(t * Math.PI * 2) * 5;
  const y = Math.cos(t * Math.PI * 2) * 5;
  const z = -i * 5; // 奥に向かって伸びる
  curvePoints.push(new THREE.Vector3(x, y, z));
}
const curvePath = new THREE.CatmullRomCurve3(curvePoints);
```

#### トンネルの作成

作成した曲線パスに沿って、各セグメントごとに 12 本の円柱を円周上に配置してトンネルを構築します。各円柱の向きは、パスの中心点から外側に向かうように設定されています。

```js
// トンネルを構成する円柱ジオメトリの作成
const cylinderGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8);
geometries.push(cylinderGeometry);

// 複数のマテリアルを用意（明るい色とエミッシブ効果付き）
const materials = [
  new THREE.MeshStandardMaterial({
    color: 0x6666ff,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x222266,
  }),
  new THREE.MeshStandardMaterial({
    color: 0x66ff66,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x226622,
  }),
  new THREE.MeshStandardMaterial({
    color: 0xff6666,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x662222,
  }),
  new THREE.MeshStandardMaterial({
    color: 0x66ffff,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x226666,
  }),
];

const tunnelGroup = new THREE.Group();
scene.add(tunnelGroup);
objects.push(tunnelGroup);

// トンネルのセグメントごとに円柱の輪を作成
for (let i = 0; i < 50; i++) {
  const t = i / 49; // 0～1の範囲
  const position = curvePath.getPoint(t);

  // 次の点から方向を計算
  const nextT = Math.min(t + 0.01, 1);
  const nextPosition = curvePath.getPoint(nextT);
  const direction = new THREE.Vector3().subVectors(nextPosition, position).normalize();

  // 円柱を配置するための円周上の各位置を計算
  for (let j = 0; j < 12; j++) {
    const angle = (j / 12) * Math.PI * 2;

    // 方向ベクトルに垂直な平面上の点を求める
    const perpVector = new THREE.Vector3(0, 1, 0);
    if (Math.abs(direction.y) > 0.99) {
      perpVector.set(1, 0, 0);
    }

    // 垂直な2方向のベクトルを計算
    const sideVector = new THREE.Vector3().crossVectors(direction, perpVector).normalize();
    const upVector = new THREE.Vector3().crossVectors(sideVector, direction).normalize();

    // 円周上の位置（トンネルの半径 1.5）
    const ringPosition = new THREE.Vector3()
      .copy(position)
      .add(sideVector.clone().multiplyScalar(Math.cos(angle) * 1.5))
      .add(upVector.clone().multiplyScalar(Math.sin(angle) * 1.5));

    // 円柱オブジェクトの生成
    const cylinder = new THREE.Mesh(
      cylinderGeometry,
      materials[j % materials.length]
    );
    cylinder.position.copy(ringPosition);

    // 円柱の向きを、中心から外側へ向ける
    const cylinderDirection = new THREE.Vector3().subVectors(ringPosition, position).normalize();
    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cylinderDirection);

    tunnelGroup.add(cylinder);
  }
}
```

#### 曲線パスの可視化

デバッグやアニメーション確認のため、作成した曲線パスを白い線で可視化します。

```js
const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePath.getPoints(100));
const curveMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  opacity: 0.5,
  transparent: true,
});
const curveLine = new THREE.Line(curveGeometry, curveMaterial);
scene.add(curveLine);
objects.push(curveLine);
geometries.push(curveGeometry);
```

#### マーカー（黄色い球体）の作成

トンネル内を移動する対象として、黄色い球体を生成します。さらに、このマーカーには小さな点光源を付加し、周囲を照らすようにしています。

```js
const markerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
const markerMaterial = new THREE.MeshStandardMaterial({
  color: 0xffff00,
  emissive: 0x666600,
  emissiveIntensity: 0.5,
});
const marker = new THREE.Mesh(markerGeometry, markerMaterial);

// マーカーに光源を追加
const markerLight = new THREE.PointLight(0xffff00, 1, 5);
markerLight.position.set(0, 0, 0);
marker.add(markerLight);

scene.add(marker);
objects.push(marker);
geometries.push(markerGeometry);
```

最後、setupScene の戻り値として各主要オブジェクトを返します。

```js
return {
  objects,
  geometries,
  curvePath,
  tunnelGroup,
  pointLights,
  marker,
};
```

---

### 2-4. updateObjects

各フレームごとに、トンネルや光源、マーカーのアニメーション更新を行います。

- **トンネルの回転:** 時間に応じてトンネル全体をわずかに回転させる  
- **光源の移動:** 曲線パス上を光源が移動し、光の強度も時間で変化する  
- **円柱の脈動:** 各円柱がわずかにスケール変化し、脈動効果を演出  
- **マーカーの更新:** マーカーは曲線パス上を移動し、進行方向に合わせて回転する

```js
static updateObjects(objects, time = 0, mousePos = { x: 0, y: 0 }, params = {}) {
  const { tunnelGroup, pointLights, curvePath, marker, markerProgress } = params;
  if (!tunnelGroup || !pointLights || !curvePath) return;

  // トンネル全体を回転
  tunnelGroup.rotation.z = Math.sin(time * 0.2) * 0.05;

  // 光源の位置と強度の更新
  pointLights.forEach((light, i) => {
    const t = (time * 0.5 + i * 0.2) % 1;
    const position = curvePath.getPoint(t);
    light.position.copy(position);
    light.intensity = 2 + Math.sin(time * 2 + i) * 1.0;
  });

  // 各円柱に脈動エフェクトを適用
  if (tunnelGroup) {
    tunnelGroup.children.forEach((cylinder, i) => {
      const pulseFactor = Math.sin(time * 2 + i * 0.1) * 0.05 + 1;
      cylinder.scale.set(pulseFactor, 1, pulseFactor);
    });
  }

  // マーカーの位置と回転を更新
  if (marker && typeof markerProgress === "number") {
    const position = curvePath.getPoint(markerProgress || 0);
    marker.position.copy(position);

    // 進行方向を計算し、マーカーがその方向を向くように回転
    const lookAheadT = Math.min(markerProgress + 0.05, 0.99);
    const lookAtPoint = curvePath.getPoint(lookAheadT);
    const direction = new THREE.Vector3().subVectors(lookAtPoint, position).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const matrix = new THREE.Matrix4().lookAt(new THREE.Vector3(), direction, up);
    marker.quaternion.setFromRotationMatrix(matrix);
  }
}
```

---

### 2-5. init, getMainCamera, startAnimation, resetAnimation, update

#### init

シーンをセットアップし、main.js からカメラを取得。2秒後にアニメーション開始のタイマーを設定します。

```js
async init() {
  const { objects, curvePath, tunnelGroup, pointLights, marker } = GeometryShowcase022.setupScene(this.scene);
  objects.forEach((obj) => this.objects.add(obj));

  this.cameraPath = curvePath;
  this.tunnelGroup = tunnelGroup;
  this.pointLights = pointLights;
  this.marker = marker;

  // main.js からカメラを取得
  const mainCamera = this.getMainCamera();
  if (mainCamera) {
    console.log("カメラを取得しました:", mainCamera);
    this.originalCameraPosition = mainCamera.position.clone();
    this.originalCameraTarget = new THREE.Vector3(0, 0, 0);
  } else {
    console.warn("カメラが見つかりません");
  }

  // 2秒後にアニメーション開始
  setTimeout(() => {
    this.startAnimation();
  }, 2000);
}
```

#### getMainCamera

グローバルスコープから main.js のカメラを取得。見つからない場合はダミーカメラを生成します。

```js
getMainCamera() {
  if (!window.globalCamera) {
    try {
      const mainScript = document.querySelector('script[src*="main.js"]');
      if (mainScript) {
        console.log("main.jsスクリプトが見つかりました");
      }
      if (typeof camera !== "undefined") {
        console.log("グローバルcameraが見つかりました");
        window.globalCamera = camera.camera;
        return camera.camera;
      }
      if (window.camera && window.camera.camera) {
        console.log("window.cameraが見つかりました");
        window.globalCamera = window.camera.camera;
        return window.camera.camera;
      }
      console.warn("カメラが見つからないため、ダミーカメラを作成します");
      window.globalCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      return window.globalCamera;
    } catch (e) {
      console.error("カメラ参照エラー:", e);
      return null;
    }
  }
  return window.globalCamera;
}
```

#### startAnimation と resetAnimation

アニメーション開始時には、マーカーの初期位置設定とカメラの視野角変更を行い、リセット時には元のカメラ位置に戻します。

```js
startAnimation() {
  this.isAnimating = true;
  this.markerProgress = 0;

  if (this.marker && this.cameraPath) {
    const startPoint = this.cameraPath.getPoint(0);
    this.marker.position.copy(startPoint);
  }

  const mainCamera = this.getMainCamera();
  if (mainCamera) {
    mainCamera.fov = 80;
    mainCamera.updateProjectionMatrix();
  }

  console.log("アニメーション開始: 黄色い球体がトンネルを通過します");
}

resetAnimation() {
  this.isAnimating = false;
  const mainCamera = this.getMainCamera();
  if (mainCamera && this.originalCameraPosition) {
    mainCamera.position.copy(this.originalCameraPosition);
    mainCamera.lookAt(this.originalCameraTarget);
    mainCamera.fov = 60;
    mainCamera.updateProjectionMatrix();
  }
  console.log("アニメーション終了: 元の位置に戻りました");
}
```

#### update

毎フレームごとに、オブジェクトの更新およびカメラの追従処理を行います。マーカーの進行度を更新し、進行に合わせたカメラ位置も再計算します。

```js
update(deltaTime) {
  this.time += deltaTime;

  GeometryShowcase022.updateObjects(
    Array.from(this.objects),
    this.time,
    { x: 0, y: 0 },
    {
      tunnelGroup: this.tunnelGroup,
      pointLights: this.pointLights,
      curvePath: this.cameraPath,
      marker: this.marker,
      markerProgress: this.markerProgress,
    }
  );

  if (this.isAnimating && this.cameraPath) {
    this.markerProgress += deltaTime * this.cameraSpeed;
    if (this.markerProgress >= 1) {
      this.resetAnimation();
      setTimeout(() => {
        this.startAnimation();
      }, 3000);
      return;
    }

    const progressPercent = Math.floor(this.markerProgress * 100);
    if (progressPercent % 10 === 0 && progressPercent !== this.lastReportedProgress) {
      console.log(`進行状況: ${progressPercent}%`);
      this.lastReportedProgress = progressPercent;
    }

    const markerPosition = this.cameraPath.getPoint(this.markerProgress);
    this.marker.position.copy(markerPosition);

    try {
      const mainCamera = this.getMainCamera();
      if (mainCamera) {
        const lookAheadT = Math.min(this.markerProgress + 0.05, 0.99);
        const lookAtPoint = this.cameraPath.getPoint(lookAheadT);
        const direction = new THREE.Vector3().subVectors(lookAtPoint, markerPosition).normalize();

        const offsetDistance = 3;
        const verticalOffset = 0.5;
        const cameraOffset = direction.clone().multiplyScalar(-offsetDistance);
        cameraOffset.y += verticalOffset;

        mainCamera.position.copy(markerPosition).add(cameraOffset);
        mainCamera.lookAt(markerPosition);

        if (window.controls) {
          window.controls.enabled = false;
        }
        mainCamera.updateProjectionMatrix();
      } else {
        console.warn("カメラが見つからないため、マーカーの位置のみ更新します");
      }
    } catch (e) {
      console.error("カメラ更新エラー:", e);
    }
  }
}
```

---

### 2-6. getThumbnailCameraPosition

サムネイル用のカメラ位置を定義しています。

```js
static getThumbnailCameraPosition() {
  return {
    position: [8, 5, 5],
    target: [0, 0, -10],
  };
}
```

---

## 3. 曲線パスとカメラアニメーションの仕組み

### 3-1. 曲線パスの作成

CatmullRomCurve3 を使用して、螺旋状の曲線パスを作成。sin と cos を使い、x, y 座標を決定し、z 座標は奥へ伸びるように設定しています。

### 3-2. カメラの追従

マーカーの進行方向（曲線パス上の接線）に沿ってカメラを配置します。マーカーから少し先のポイントを取得し、その方向の逆方向に一定距離および垂直オフセットを加えた位置にカメラをセット。これにより、カメラは常にマーカーを注視するように更新されます。

---

## 4. トンネルの構造と照明

### 4-1. トンネルの構造

曲線パスに沿って、各セグメントで 12 本の円柱を配置。各円柱は、パスの中心点から外側に向けた方向に正しく回転させることで、円形の輪を形成しトンネル状の構造を作り出しています。

### 4-2. 照明

環境光および 5 つの点光源を追加し、各光源は曲線パス上を動くように更新されます。光源の色や強度の変化が、トンネル内にカラフルで動的な雰囲気を与えます。

---

## まとめ

本サンプル「Curved Tunnel」では、Three.js のジオメトリ、マテリアル、照明、カーブパス、そしてカメラアニメーション技術を組み合わせ、螺旋状のトンネル内をカメラが通過する没入感のある体験を実現しています。  
各オブジェクト（円柱、光源、マーカー）の動きや、カメラ追従処理、そしてパスに沿った配置処理が連動することで、ダイナミックなアニメーションが表現されています。

以上が、Usecase-022「Curved Tunnel」の全体構成とコード詳細の解説になります。
