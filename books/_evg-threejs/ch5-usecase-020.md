---
title: Usecase-020 Winter Snow Scene  
---

# Usecase-020: Winter Snow Scene

**概要:**  
本ユースケースでは、`usecases/usecase-020` ディレクトリ内の「Winter Snow Scene」サンプルコードを解説します。  
このサンプルは、雪が降り積もる冬の風景を表現しており、パーティクルシステムを利用して雪の降下、雪に覆われた地面、風に揺れる木々、そしてランダムな雪の丘など、複数の要素を組み合わせています。さらに、青みがかった背景やフォグ効果、風の影響によるアニメーションで、寒々しい冬らしい雰囲気を実現しています。

---

## 1. シーンの特徴とコンセプト

本シーンは以下の特徴を持ちます：

- **雪の粒子:**  
  空間内に5000個の雪の粒子をランダム配置。各粒子はサイズと落下速度がランダムに設定され、風の影響を受けながら落下します。

- **雪に覆われた地面:**  
  白い平面ジオメトリにより、広大な雪原を表現。

- **冬の木々:**  
  松をイメージした木々を15個ランダム配置。幹と葉に加え、各葉の上に雪が積もっている表現を追加し、風でわずかに揺れるアニメーションを実装。

- **雪の丘:**  
  半球形ジオメトリを用いて、10個の雪の丘をランダムな位置に配置。

- **風の効果:**  
  雪の粒子の落下や木々の揺れに風の影響（例：x軸0.2、z軸0.1）を加え、より自然な動きを表現。

- **青みがかった照明:**  
  薄い青色の背景色とフォグ、及び青みがかった環境光・太陽光により、冬の冷たさと幻想的な雰囲気を演出。

---

## 2. コード詳細解説 (`usecase-020/index.js`)

### 2-1. メタデータ (metadata)

シーンに関する基本情報を定義します。

```js
static metadata = {
  id: "020",
  title: "Winter Snow Scene",
  description:
    "雪が降り積もる冬の風景。パーティクルで表現された雪と青い雰囲気の冬シーン",
  categories: ["Particles", "Weather", "Seasonal", "Landscape"],
};
```

- **id:** シーンの識別子（"020"）
- **title:** タイトル（"Winter Snow Scene"）
- **description:** シーンの説明
- **categories:** 天候、季節、風景などの分類情報

---

### 2-2. コンストラクタ (constructor)

シーンの初期化に必要なプロパティを設定します。

```js
constructor(scene) {
  super(scene);
  this.time = 0;
  this.snowParticles = null;
  this.ground = null;
  this.trees = [];
  this.wind = { x: 0.2, z: 0.1 }; // 風の方向と強さ
}
```

- **time:** 経過時間（アニメーション用）
- **snowParticles:** 雪の粒子オブジェクト
- **ground:** 地面オブジェクト
- **trees:** 木々の配列
- **wind:** 風の影響を表すオブジェクト

---

### 2-3. シーンセットアップ (setupScene)

シーン全体のオブジェクト（背景、照明、地面、雪の粒子、木々、雪の丘）を生成・配置します。

```js
static setupScene(scene) {
  // 背景とフォグの設定（冬の空と霞み効果）
  scene.background = new THREE.Color(0xb0c4de);
  scene.fog = new THREE.FogExp2(0xb0c4de, 0.035);

  const objects = [];
  const geometries = [];

  // 環境光（青みがかった光）
  const ambientLight = new THREE.AmbientLight(0x8899bb, 0.5);
  scene.add(ambientLight);
  objects.push(ambientLight);

  // 太陽光とシャドウの設定
  const sunLight = new THREE.DirectionalLight(0xffffee, 0.8);
  sunLight.position.set(5, 8, 3);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 50;
  sunLight.shadow.camera.left = -15;
  sunLight.shadow.camera.right = 15;
  sunLight.shadow.camera.top = 15;
  sunLight.shadow.camera.bottom = -15;
  scene.add(sunLight);
  objects.push(sunLight);

  // 地面の作成（雪に覆われた平面）
  const groundGeometry = new THREE.PlaneGeometry(30, 30, 32, 32);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
    metalness: 0.1,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);
  objects.push(ground);
  geometries.push(groundGeometry);

  // 雪の粒子の作成
  const snowCount = 5000;
  const snowGeometry = new THREE.BufferGeometry();
  const snowPositions = new Float32Array(snowCount * 3);
  const snowSizes = new Float32Array(snowCount);
  const snowVelocities = [];

  // 各粒子の初期位置・サイズ・落下速度の設定
  for (let i = 0; i < snowCount; i++) {
    const x = (Math.random() - 0.5) * 30;
    const y = Math.random() * 20;
    const z = (Math.random() - 0.5) * 30;

    snowPositions[i * 3] = x;
    snowPositions[i * 3 + 1] = y;
    snowPositions[i * 3 + 2] = z;

    snowSizes[i] = 0.05 + Math.random() * 0.15;
    snowVelocities.push({
      y: -0.01 - Math.random() * 0.03 - snowSizes[i] * 0.1,
      x: (Math.random() - 0.5) * 0.01,
      z: (Math.random() - 0.5) * 0.01,
    });
  }

  snowGeometry.setAttribute("position", new THREE.BufferAttribute(snowPositions, 3));
  snowGeometry.setAttribute("size", new THREE.BufferAttribute(snowSizes, 1));

  // 雪の粒子テクスチャの生成（Canvasでグラデーションを描画）
  const snowCanvas = document.createElement("canvas");
  snowCanvas.width = 32;
  snowCanvas.height = 32;
  const snowContext = snowCanvas.getContext("2d");
  const gradient = snowContext.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.8)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  snowContext.fillStyle = gradient;
  snowContext.fillRect(0, 0, 32, 32);

  const snowTexture = new THREE.Texture(snowCanvas);
  snowTexture.needsUpdate = true;

  // 雪の粒子マテリアルの設定
  const snowMaterial = new THREE.PointsMaterial({
    size: 0.5,
    map: snowTexture,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const snowParticles = new THREE.Points(snowGeometry, snowMaterial);
  scene.add(snowParticles);
  objects.push(snowParticles);
  geometries.push(snowGeometry);

  // 木々の作成（15個の木をランダム配置）
  const trees = [];
  const treeCount = 15;
  for (let i = 0; i < treeCount; i++) {
    const tree = createTree();
    const x = (Math.random() - 0.5) * 25;
    const z = (Math.random() - 0.5) * 25;
    const scale = 0.5 + Math.random();
    tree.position.set(x, 0, z);
    tree.scale.set(scale, scale, scale);
    scene.add(tree);
    objects.push(tree);
    trees.push(tree);
  }

  // 雪の丘の作成（10個の半球形の丘をランダム配置）
  for (let i = 0; i < 10; i++) {
    const hillGeometry = new THREE.SphereGeometry(
      0.5 + Math.random() * 2,
      16,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
    const hillMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.1,
    });
    const hill = new THREE.Mesh(hillGeometry, hillMaterial);
    const x = (Math.random() - 0.5) * 25;
    const z = (Math.random() - 0.5) * 25;
    hill.position.set(x, 0, z);
    hill.castShadow = true;
    hill.receiveShadow = true;
    scene.add(hill);
    objects.push(hill);
    geometries.push(hillGeometry);
  }

  return {
    objects,
    geometries,
    snowParticles,
    snowVelocities,
    ground,
    trees,
  };
}
```

---

### 2-4. オブジェクト更新処理 (updateObjects)

アニメーションごとに雪の粒子の位置と木々の揺れを更新します。

```js
static updateObjects(objects, snowParticles, snowVelocities, ground, trees, time, wind = { x: 0.2, z: 0.1 }) {
  if (!snowParticles || !snowVelocities) return;

  const positions = snowParticles.geometry.attributes.position.array;

  for (let i = 0; i < positions.length / 3; i++) {
    // 現在の位置
    let x = positions[i * 3];
    let y = positions[i * 3 + 1];
    let z = positions[i * 3 + 2];

    // 風の影響を加味した速度
    const vx = snowVelocities[i].x + wind.x * 0.001 * Math.sin(time * 0.5 + i * 0.1);
    const vy = snowVelocities[i].y;
    const vz = snowVelocities[i].z + wind.z * 0.001 * Math.cos(time * 0.5 + i * 0.1);

    // 位置更新
    x += vx;
    y += vy;
    z += vz;

    // 地面に到達した場合、再度上部から降下させる
    if (y < 0.05) {
      y = 20;
      x = (Math.random() - 0.5) * 30;
      z = (Math.random() - 0.5) * 30;
    }

    // 画面外に出た場合は反対側から再登場
    if (x < -15) x = 15;
    if (x > 15) x = -15;
    if (z < -15) z = 15;
    if (z > 15) z = -15;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  // GPUへ更新情報を転送
  snowParticles.geometry.attributes.position.needsUpdate = true;

  // 木々のわずかな揺れ（風の影響）
  trees.forEach((tree, index) => {
    tree.rotation.z = Math.sin(time * 0.5 + index) * 0.03 * wind.x;
    tree.rotation.x = Math.cos(time * 0.5 + index) * 0.03 * wind.z;
  });
}
```

---

### 2-5. 木生成ヘルパー関数 (createTree)

木を構成する各パーツ（幹、葉、そして雪の積もり）を生成してグループ化します。

```js
function createTree() {
  const treeGroup = new THREE.Group();

  // 幹の作成
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.9,
  });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 0.75;
  trunk.castShadow = true;
  treeGroup.add(trunk);

  // 葉の作成（複数の円錐を重ねる）
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: 0x2f4f4f, // 冬の松をイメージした暗い緑
    roughness: 0.8,
  });

  // 一番下の葉
  const leafGeometry1 = new THREE.ConeGeometry(1, 1.5, 8);
  const leaf1 = new THREE.Mesh(leafGeometry1, leafMaterial);
  leaf1.position.y = 1.5;
  leaf1.castShadow = true;
  treeGroup.add(leaf1);

  // 中間の葉
  const leafGeometry2 = new THREE.ConeGeometry(0.8, 1.2, 8);
  const leaf2 = new THREE.Mesh(leafGeometry2, leafMaterial);
  leaf2.position.y = 2.3;
  leaf2.castShadow = true;
  treeGroup.add(leaf2);

  // 一番上の葉
  const leafGeometry3 = new THREE.ConeGeometry(0.6, 1, 8);
  const leaf3 = new THREE.Mesh(leafGeometry3, leafMaterial);
  leaf3.position.y = 3;
  leaf3.castShadow = true;
  treeGroup.add(leaf3);

  // 雪が積もる表現：各葉の上に白い円錐を配置
  const snowCapGeometry1 = new THREE.ConeGeometry(1.05, 0.2, 8);
  const snowCapMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
  });
  const snowCap1 = new THREE.Mesh(snowCapGeometry1, snowCapMaterial);
  snowCap1.position.y = 1.55;
  treeGroup.add(snowCap1);

  const snowCapGeometry2 = new THREE.ConeGeometry(0.85, 0.2, 8);
  const snowCap2 = new THREE.Mesh(snowCapGeometry2, snowCapMaterial);
  snowCap2.position.y = 2.35;
  treeGroup.add(snowCap2);

  const snowCapGeometry3 = new THREE.ConeGeometry(0.65, 0.2, 8);
  const snowCap3 = new THREE.Mesh(snowCapGeometry3, snowCapMaterial);
  snowCap3.position.y = 3.05;
  treeGroup.add(snowCap3);

  return treeGroup;
}
```

---

## 3. パーティクルシステムによる雪の表現

シーンでは `THREE.Points` を利用し、以下の流れで雪を表現しています：

1. **粒子の配置と速度設定:**  
   - 5000個の雪の粒子を空間内にランダム配置  
   - 各粒子はランダムなサイズ（0.05～0.2）と、サイズに応じた落下速度（小さい粒子はゆっくり、大きい粒子は速く）を持つ  
   - 水平方向にも微小なランダム速度を与え、風の影響をシミュレート

2. **テクスチャ生成:**  
   - Canvas を利用し、中心が白く外側へ向かって透明になるグラデーションを描画  
   - これにより、柔らかな雪粒子の表現を実現

3. **マテリアル設定:**  
   - `THREE.PointsMaterial` により、透明性（opacity 0.8）、深度書き込み無効（depthWrite: false）、加算合成（AdditiveBlending）を設定  
   - 粒子が重なると明るくなる効果を付与

4. **アニメーション更新:**  
   - 各フレームで粒子の位置を更新。風の影響やランダムな位相を加えることで、自然な雪の降下を再現  
   - 地面に達した粒子は再び上部から降下させ、画面外に出た粒子は反対側から再登場させる

---

## 4. 冬の風景を構成するその他の要素

本シーンは雪の粒子以外にも、以下の要素を組み合わせて冬の情景を構築しています。

### 4-1. 雪に覆われた地面

- **実装:**  
  平面ジオメトリ（30×30）と白いマテリアルで、雪原の質感を表現  
- **効果:**  
  地面が雪に覆われたように見せ、シーン全体の一体感を向上

### 4-2. 冬の木々

- **実装:**  
  `createTree()` 関数により、幹（円柱）、葉（複数の円錐）、雪の積もり（白い円錐）を組み合わせた木を生成  
- **配置:**  
  ランダムな位置・スケールで15本配置し、風による微妙な揺れも追加

---

## 5. 全体の動作フロー

1. **初期化 (`init` メソッド):**  
   - `setupScene` を呼び出し、背景、照明、地面、雪の粒子、木々、雪の丘などをシーンに追加  
   - 各オブジェクトを内部のコレクションに格納

2. **アニメーション更新 (`update` メソッド):**  
   - 経過時間に応じ、`updateObjects` を実行して雪の粒子と木々の位置・回転を更新  
   - これにより、風の影響で雪が降り続き、木々が揺れる自然な動きが実現

3. **カメラ位置:**  
   - サムネイル用のカメラ位置は `getThumbnailCameraPosition` で `[8, 5, 8]` から `[0, 0, 0]` を向くように設定

---

## まとめ

本サンプルでは、Three.js のパーティクルシステムと各種ジオメトリ、マテリアル、照明設定を組み合わせることで、冬の雪景色をリアルかつ動的に表現しています。雪の粒子、風の影響、雪に覆われた地面、そして雪の積もった木々など、各要素が互いに作用し合うことで、魅力的な冬のシーンが完成しています。

以上が、`usecase-020` の「Winter Snow Scene」の全体構成と詳細なコード解説になります。

---

このドキュメントは、コードの各部分の役割とシーン全体の構成を一目で把握できるように再構成したものです。