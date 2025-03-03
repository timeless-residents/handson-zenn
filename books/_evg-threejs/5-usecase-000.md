---
title: Usecase-000 Basic Cube Spin
free: true
---
# Usecase-000: Basic Cube Spin

**本章では、`usecases/usecase-000` ディレクトリに格納されている「Basic Cube Spin」のコードを中心に、プロジェクト構成全体と関連クラスの仕組みを解説します。**  
このサンプルは、単純な赤い立方体（キューブ）が回転するだけのシーンですが、**本プロジェクトで採用している設計パターン**を把握するうえで最適な入門サンプルになっています。また、今後追加されるであろう `usecase-001` ～ `usecase-100` においても、基本的な流れやコード構成は同様のパターンを踏襲する予定ですので、ここでしっかり全体像を掴んでおくことが重要です。

本ドキュメントは大ボリュームで、コードの意図や拡張方法を細かく掘り下げて解説します。少々長く感じるかもしれませんが、**今後の実装を円滑に進めるため**にも、ぜひ一度通読いただくことをおすすめします。

---

## 1. プロジェクト全体構成と`usecase-000`の位置づけ

まずは、今回のプロジェクト全体のディレクトリ構造をざっと確認しましょう。すでに提示済みのツリーを再掲します（一部抜粋・要約を含みます）。

```
.
├── index.html
├── scene.html
├── src
│   ├── core
│   │   ├── Camera.js
│   │   ├── Renderer.js
│   │   ├── SceneManager.js
│   │   └── UseCaseBase.js
│   ├── gallery.js
│   ├── main.js
│   ├── thumbnailSystem
│   │   ├── index.js
│   │   ├── thumbnailQueue.js
│   │   └── thumbnailRenderer.js
│   └── usecases
│       ├── usecase-000
│       │   └── index.js
│       ├── usecase-001
│       │   └── index.js
│       ├── ...
│       └── usecase-024
│           └── index.js
├── vite.config.js
└── package.json
```

上記のように、`usecases` フォルダの中に `usecase-000` や `usecase-001` ～ `usecase-100` などが並ぶ想定です。各フォルダには最低限 `index.js` が配置されており、**そのユースケース特有のシーンやオブジェクトの挙動**を定義しています。

### 1-1. `usecase-000`とは？

`usecase-000` フォルダの `index.js` は、**最も基本的な回転キューブのデモ**を実装しているサンプルです。以下のような特徴があります。

- **赤いキューブ**が存在し、徐々に回転する。
- 照明として `AmbientLight` と `DirectionalLight` を1つずつ設置。
- `UseCaseBase` を継承したクラス `GeometryShowcase000` でシーンを構築。
- ユーザーが `scene.html?id=000` のようなパラメータでページを開くと、`SceneManager` 経由でこのユースケースが読み込まれ、回転キューブが表示される。

これだけを見ると単純ですが、**シンプルな実装の中に本プロジェクトの重要な設計思想が凝縮**されています。次のセクションでは、どのようにして `usecase-000` のコードが呼び出され、最終的にブラウザにキューブが描画されているのかを追っていきましょう。

---

## 2. シーンの読み込みの流れ

### 2-1. `index.html` と `scene.html`

本プロジェクトのエントリーポイントは **ギャラリー表示用**の `index.html` と、**実際にThree.jsのシーンを表示する** `scene.html` に分かれています。

1. **`index.html`**  
   - `gallery.js` を読み込み、各ユースケースの情報（タイトルやカテゴリなど）を一覧表示する。  
   - クリックされたシーンのIDをパラメータに付与して、 `scene.html?id=xxx` へ遷移する流れ。

2. **`scene.html`**  
   - `main.js` を読み込み、URLパラメータから `sceneId` を取得。  
   - `SceneManager` を初期化し、 `sceneId` に応じた `usecase-xxx` を動的に import & init する。

この仕組みにより、**ユーザーがギャラリー一覧からシーンカードをクリック→対象シーンのIDをもとに `scene.html` へ遷移→該当ユースケースのコードが実行される** という流れが実現します。

### 2-2. `main.js` の役割

```js
// main.js（抜粋）
import SceneManager from "./core/SceneManager";
import { Renderer } from "./core/Renderer";
import { Camera } from "./core/Camera";
import * as THREE from "three";

const manager = new SceneManager();
const renderer = new Renderer();
const camera = new Camera();
window.camera = camera; // グローバルアクセス用

const clock = new THREE.Clock();

// URLからシーンIDを取得
const params = new URLSearchParams(window.location.search);
const sceneId = params.get("id") || "000";

// 指定されたシーンを読み込み
manager.loadUseCase(sceneId);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  manager.update(clock.getDelta());
  renderer.render(manager.scene, camera.camera);
}

animate();
```

- `SceneManager` インスタンスを生成し、 `manager.loadUseCase(sceneId)` を呼び出す。  
- その後 `animate()` 関数の中で `manager.update(...)` と `renderer.render(...)` をループ実行。  
- `sceneId` により `usecase-000` など対象のモジュールが読み込まれ、初期化処理 (`init()`) が走る。

**ポイント**: `manager.update(clock.getDelta())` はフレーム毎に `usecase` 側の `update()` メソッドを呼び出します。これによって、キューブの回転アニメーションやその他のアニメーション処理が動くわけです。

### 2-3. `SceneManager` の動的 import と `loadUseCase()`

```js
// SceneManager.js（抜粋）
async loadUseCase(id) {
  if (this.isTransitioning) return;
  this.isTransitioning = true;

  try {
    const module = await import(`../usecases/usecase-${id.padStart(3, "0")}/index.js`);
    this.dispose();
    this.activeUseCase = new module.default(this.scene);
    await this.activeUseCase.init();
  } catch (error) {
    console.error(`Failed to load usecase ${id}:`, error);
  } finally {
    this.isTransitioning = false;
  }
}
```

- `id` から `usecase-${id}` のパスを組み立て、 `import(...)` により動的にコードを読み込む。
- 既に他のユースケースがアクティブなら `dispose()` でクリーンアップ。
- 新規にインスタンスを生成し、 `init()` メソッドを呼び出す。

このロジックにより、**数多くのユースケース**があっても、一度に全てを読み込む必要がなくなるので、**スケーラブルな構成**が実現しています。

---

## 3. `UseCaseBase` クラスの役割

`usecases/usecase-000/index.js` では、`UseCaseBase` というクラスを継承した `GeometryShowcase000` が定義されています。まずは `UseCaseBase.js` の概要を把握しましょう。

```js
// UseCaseBase.js（抜粋）
export class UseCaseBase {
  static metadata = { id: "", title: "", description: "", categories: [] };

  constructor(scene) {
    this.scene = scene;
    this.objects = new Set();
  }

  async init() {
    // Override in child class
  }

  update(deltaTime) {
    // Override in child class
  }

  dispose() {
    // Cleanup resources
    this.objects.forEach((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      this.scene.remove(obj);
    });
    this.objects.clear();
  }
  
  static setupDefaultLighting(scene) {
    // シンプルなライティング用のヘルパー
  }

  // サムネイル生成用の静的メソッドなど
}
```

- **共通プロパティ**: `scene` と `objects`。`scene` はThree.jsのシーン、 `objects` はシーン上に配置したメッシュやライトなどを保持するためのセット。
- **`init()`**: 子クラスがオーバーライドして実装する。ユースケースごとに**初期化処理**（ジオメトリ生成、ライト配置など）を行う想定。
- **`update(deltaTime)`**: 毎フレーム実行される。アニメーションやインタラクションをここで管理する想定。
- **`dispose()`**: ユースケース切り替えや終了時に呼ばれ、メッシュやマテリアルを破棄してメモリリークを防ぐ。

このように**継承ベース**で実装することで、共通の初期化フローやクリーンアップ処理を統一し、各ユースケースのコードをシンプルに保つことができます。

---

## 4. `usecase-000/index.js` コード詳細

それでは、実際の `usecase-000` のコードを細かく見ていきましょう。

```js
// usecase-000/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase000 extends UseCaseBase {
  static metadata = {
    id: "000",
    title: "Basic Cube Spin",
    description: "A simple spinning cube",
    categories: ["Geometry", "Animation"],
  };

  constructor(scene) {
    super(scene);
    this.objects = new Set();
    this.time = 0;
  }

  // --------------------------------------------------
  // 1) サムネイル生成などで使われる静的メソッド群
  // --------------------------------------------------
  static setupScene(scene) {
    // シーンに照明を追加
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    // キューブを一つ配置
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return { objects: [mesh], geometries: [geometry] };
  }

  static updateObjects(objects, time, deltaTime = 0.016) {
    objects[0].rotation.x += deltaTime;
    objects[0].rotation.y += deltaTime;
  }

  // --------------------------------------------------
  // 2) 本編で利用されるインスタンスメソッド群
  // --------------------------------------------------
  async init() {
    // setupScene()で生成したオブジェクトをシーンに追加
    const { objects } = GeometryShowcase000.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase000.updateObjects(
      Array.from(this.objects),
      this.time,
      deltaTime
    );
  }

  static createPreview(container) {
    // サムネイル生成用の処理（省略）
  }
}
```

### 4-1. `metadata`

```js
static metadata = {
  id: "000",
  title: "Basic Cube Spin",
  description: "A simple spinning cube",
  categories: ["Geometry", "Animation"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `000`、 `title` は「Basic Cube Spin」など。

**今後、`usecase-001` ～ `usecase-100` でも同様にメタデータを記述**し、タイトルやカテゴリを変えるだけでギャラリー画面に反映されます。

### 4-2. `setupScene(scene)`

```js
static setupScene(scene) {
  ...
  const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  ...
  return { objects: [mesh], geometries: [geometry] };
}
```

- `static` メソッドとして定義されており、サムネイル生成などでも再利用できる形になっています。
- `scene` に対してライトやメッシュを追加し、最後に `objects` と `geometries` をまとめて返す設計。

ここで返す `objects` 配列は、後から `updateObjects()` で回転処理を行う対象になります。

### 4-3. `updateObjects(objects, time, deltaTime)`

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].rotation.x += deltaTime;
  objects[0].rotation.y += deltaTime;
}
```

- `objects[0]` はキューブのみを想定。  
- `deltaTime` 分だけ回転量を増やす。  
- サムネイル生成時や実際のアニメーションループ時に呼び出すことで、**同じロジック**でキューブを回転させられます。

### 4-4. `init()` と `update(deltaTime)`

- `init()` では `setupScene()` を呼び出し、生成されたキューブを `this.objects` に登録。
- `update(deltaTime)` で `this.time += deltaTime;` を行い、 `updateObjects()` を呼び出して回転処理。

最終的に `SceneManager` や `main.js` から **毎フレーム `update()` が呼ばれる** ため、キューブは永続的に回転し続ける、という流れです。

---

## 5. どうやってサムネイルを生成しているのか？

ギャラリーで使用する**サムネイル画像**も同じコードを使い回しています。`setupScene()` と `updateObjects()` を呼び出し、**一瞬だけシーンをレンダリングして `canvas.toDataURL()`** を取得するという仕組みです。

`thumbnailSystem` 内にある `thumbnailRenderer.js` などがバックグラウンドでこれを行います。**ポイントは、ユースケース側でサムネイル用メソッドを特別に書かなくても、`setupScene()` と `updateObjects()` の再利用でサムネイルを自動生成**できるようにしているところにあります。

---

## 6. シンプルな回転キューブに見る拡張可能性

「Basic Cube Spin」はとてもシンプルですが、以下のようにして簡単に拡張できます。

1. **マテリアルの変更**: 
   ```js
   const material = new THREE.MeshStandardMaterial({
     color: 0x00ff00,
     metalness: 0.5,
     roughness: 0.3,
   });
   ```
   ライティングの見え方や質感が変化し、よりリアルな表現に。

2. **オブジェクトを増やす**: 
   ```js
   const sphereGeo = new THREE.SphereGeometry(1, 32, 16);
   const sphereMat = new THREE.MeshPhongMaterial({ color: 0x8888ff });
   const sphere = new THREE.Mesh(sphereGeo, sphereMat);
   sphere.position.x = 3;
   scene.add(sphere);
   objects.push(sphere);
   ```
   配列 `objects` に球体を追加し、同じ `updateObjects()` で回転させることも可能。

3. **カメラアングルを変更**: 
   `Camera.js` 側でデフォルト位置を変えたり、 `OrbitControls` 設定をカスタマイズすることで、カメラ周りを大きく変化させる。

これらの拡張を施すだけで、「Basic Cube Spin」から多様なシーンが生まれるはずです。

---

## 7. 今後のユースケース追加の流れ

`usecase-001` 以降も同じパターンに従って実装される想定です。たとえば、

- `usecase-001` : 複数キューブをランダムに配置 + ライトの色を変える
- `usecase-002` : テクスチャを貼り付けたメッシュを回転
- `usecase-003` : パーティクルシステム
- `usecase-010` : 簡単な物理演算デモ
- `usecase-050` : シェーダーを用いたカスタムマテリアル
- `usecase-100` : 大規模なシーン構築

など、**シーン固有の処理**は各 `usecase-xxx/index.js` に閉じ込められ、共通の初期化・描画・サムネイル生成は `UseCaseBase` や `SceneManager` によってハンドリングされます。

---

## 8. 各クラス解説：`Camera.js` と `Renderer.js`

### 8-1. `Camera.js`

```js
// Camera.js（抜粋）
export class Camera {
  constructor(options = {}) {
    // デフォルト値をセット
    const {
      fov = 75,
      aspect = window.innerWidth / window.innerHeight,
      near = 0.1,
      far = 1000,
      position = [0, 5, 10],
      target = [0, 0, 0],
    } = options;

    // PerspectiveCamera作成
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(...position);
    this.camera.lookAt(...target);

    this.controls = null;
  }

  setupControls(renderer) {
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    ...
  }

  update() {
    if (this.controls) {
      this.controls.update();
    }
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}
```

- **カメラ**を管理するクラスで、OrbitControlsのセットアップ等を簡単に行えるようにしている。
- デフォルトポジションを `[0, 5, 10]` に設定し、被写体を俯瞰気味に見る配置にしている。
- `useCase` 側では特にカメラを意識しなくても、 `Camera.js` 内でデフォルト設定が行われるため、開発者はシーン表現に注力できる。

### 8-2. `Renderer.js`

```js
// Renderer.js（抜粋）
export class Renderer {
  constructor(options = {}) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, ...options });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    window.addEventListener("resize", this.onResize.bind(this));
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);
  }
}
```

- **Three.jsのWebGLRenderer** を内包し、ウィンドウリサイズやシャドウマップの設定などを一括管理。
- **HTMLへのCanvas挿入**もこのクラスで行い、メインロジックでは `renderer.render(scene, camera);` と呼び出すだけで済む。

---

## 9. サムネイル生成用コード：`thumbnailSystem/`

### 9-1. サムネイル表示の仕組み

- `gallery.js` 内で各ユースケースのメタデータを読み込み、シーンIDとタイトルなどをカード形式で一覧表示。
- カードが画面内に入りそうになったタイミング (`IntersectionObserver`) で `loadThumbnail()` を呼び出す。
- `loadThumbnail()` は `ThumbnailManager` を通じてサムネイル生成を順番に実行し、完了次第 `Image` 要素を差し替える。

### 9-2. `usecase-000` サムネイルも同じコードを使う

`usecase-000/index.js` には `static setupScene()` と `static updateObjects()` があるため、サムネイル生成用の `thumbnailRenderer.js` 内では、それらを**一瞬だけ呼び出してカメラを固定**してレンダリング → `toDataURL()` の流れを取っています。  
このとき、`deltaTime` や `time` を少しだけ進めて回転させ、回転中のキューブのサムネイルを取得することも可能です。

---

## 10. 画面上のHTML要素との連携

### 10-1. `index.html` のギャラリー表示

```html
<main class="gallery">
  <!-- Scene cards will be dynamically generated here -->
</main>
<script type="module" src="./src/gallery.js"></script>
```

- `<main class="gallery">` の中にJavaScriptで動的にカードを挿入。
- `.scene-card` クラスをクリックすると `scene.html?id=xxx` に遷移。

### 10-2. `scene.html` のシーン表示

```html
<body>
    <div id="app"></div>
    <button id="back-button" onclick="window.location.href='./'">← Back to Gallery</button>
    <script type="module" src="./src/main.js"></script>
</body>
```

- `<button id="back-button">` でギャラリーへ戻るリンク。
- `main.js` を読み込むことで、**Three.jsの初期化～ユースケース読み込み～レンダリングループ**が実行される。

---

## 11. ランタイムでのアップデート確認

「Basic Cube Spin」が正しく動作しているか確認するには、ローカル開発サーバー（`npm run dev` など）を起動して `http://localhost:3000` (もしくは Vite が表示するポート) にアクセスし、次のステップを試します。

1. **ギャラリーページを開く**  
   - `index.html` が表示され、シーンのカードが並ぶ（現状「Basic Cube Spin」などが表示される）。
2. **「Basic Cube Spin」のカードをクリック**  
   - `scene.html?id=000` に移動し、黒背景の画面に赤いキューブが出現。  
   - キューブがゆっくり回転していれば成功です。

ブラウザのコンソール（DevTools）にエラーが無いことを確認しながら、コードを変更してリロードすると反映されます。

---

## 12. トラブルシューティング

### 12-1. 「画面が真っ黒で何も表示されない」

- `import` パスに誤りがあると、動的に `usecase-000` が読み込めずエラーになるケースが多い。
- `SceneManager` が読み込む `../usecases/usecase-${id.padStart(3, "0")}/index.js` というパスが正しいか確認。
- ライトが配置されていないと暗く見えるが、`usecase-000` では `AmbientLight` と `DirectionalLight` があるので、真っ暗になることは稀。

### 12-2. 「回転しない／止まったまま」

- `update(deltaTime)` 内で回転ロジックを呼び出しているか確認。  
- `SceneManager.update(clock.getDelta())` が呼ばれているか確認（`main.js` の `animate()` で呼んでいるか？）。

### 12-3. 「サムネイルが生成されない／読み込まれない」

- `thumbnailSystem` が正しく動いていない可能性がある。  
- `IntersectionObserver` でカードが画面内に入る前にブラウザを終了すると、生成されないままの状態になる。
- 開発環境によってはクロスオリジンの問題が発生するケースもあるので、ローカルサーバーを利用しているかチェック。

---

## 13. 今後の拡張：`usecase-001` 以降に向けた考え方

`usecase-000` がしっかり理解できると、以下のような発展型をスムーズに実装できるようになります。

- **複数のオブジェクトを管理する**: `this.objects` にキューブや球、トーラスなどを複数追加し、 `update()` でオブジェクトごとに動きを付ける。
- **パーティクルや特殊効果**: `Points` や `ShaderMaterial` を活用し、新たなレンダリング要素を追加する。
- **ユーザーインタラクション**: `Raycaster` を使ってクリックやホバーでキューブの色を変える、などの動的操作。
- **GUIでパラメータを変更**: dat.GUI や lil-gui を利用して、ライトの強度やオブジェクトのサイズをリアルタイムに調整する仕組みを組み込む。

このような拡張を、それぞれ `usecase-0XX` に閉じ込める形で実装していくと、ショールームのギャラリーがどんどんリッチになっていきます。

---

## 14. 大きな設計の要約

今回の `usecase-000` を例に、プロジェクトが採用している設計・構成を再まとめすると：

1. **SceneManager**  
   - シーンやレンダラーのライフサイクルを一元管理。
   - `loadUseCase()` でユースケースを動的に読み込み、切り替え時に古いユースケースを破棄。  
   - `update()` でアクティブなユースケースの `update(deltaTime)` を呼び出す。

2. **UseCaseBase**  
   - 個々のユースケースが継承し、 `init()`, `update()`, `dispose()` を実装する。  
   - メタ情報 `static metadata` でタイトルやカテゴリを定義。
   - `setupScene()` や `updateObjects()` のような静的メソッドで、サムネイル生成や再利用性を高める。

3. **Camera / Renderer**  
   - カメラやレンダラーの初期化処理をまとめたクラス。
   - `main.js` で単一インスタンスを生成し、実際の描画ループで使用。

4. **thumbnailSystem**  
   - 使いまわし可能なサムネイル生成仕組み。  
   - `import.meta.glob` で全ユースケースをスキャンし、 `metadata` を集める。
   - 必要に応じて `setupScene()` ＋ `updateObjects()` を用いてミニシーンをレンダリングし、画像キャプチャ。

5. **ギャラリー表示 (`gallery.js`)**  
   - シーン一覧をカードにして表示。  
   - カードクリックで `scene.html?id=xxx` へ遷移 → `main.js` が対応するユースケースをロード。

**これらが合わさって、拡張性・再利用性・スケーラビリティに優れた構成**を実現しています。

---

## 15. まとめと次のステップ

ここまでの解説で、**`usecase-000` で使われているコードの流れと仕組み**を一通り把握いただけたと思います。以下、改めて大事な点を振り返ります。

1. **`usecase-000/index.js` は `UseCaseBase` を継承した最小限の実装**  
   - キューブを作り、ライトを配置して回転させるだけ。  
   - コードの構造自体は汎用的で、 `setupScene()`, `updateObjects()`, `init()`, `update()` などを使い分ける。

2. **`SceneManager` と `main.js` が、ユースケースをロードし毎フレーム更新**  
   - ユーザーが `scene.html?id=000` を開く → `SceneManager` が `usecase-000` を動的に `import` し、`init()` 実行 → `animate()` ループで `update()` 呼び出し。

3. **サムネイル生成も同じコードを流用**  
   - `thumbnailSystem` が `setupScene()` と `updateObjects()` を使ってミニレンダリング → 画像取得 → ギャラリーのプレビューに表示。

4. **今後追加されるユースケース** (`usecase-001` ～ `usecase-100`)  
   - それぞれのシーンを同様の仕組みで記述すれば、ギャラリー側は自動的に新シーンを検出し、サムネイル生成やカード表示を行う。

### 今後の展開

- **`usecase-001`**: 複数オブジェクトやマウス操作、カメラパスアニメーションなどの追加を想定。  
- **`usecase-00X`**: マテリアルやライトのバリエーション、パーティクル、物理演算、シェーダーなど。  
- **`usecase-XYZ`**: 大規模なシーンや外部モデルの読み込みデモなど、自由に拡張可能。

いずれにしても、**「UseCaseBaseを継承して `init()` でシーン構築 → `update()` で動作 → `dispose()` でクリーンアップ」** という基本の型は変わりません。しばらくは、この枠組みを使いながら Three.js の表現力を存分に活用してみてください。

---

## 16. よくある質問（FAQ）

**Q1. `usecase-000` のようなシンプルなシーンに対して、`SceneManager` や `UseCaseBase` など大がかりな仕組みはオーバーエンジニアリングでは？**  
A1. 小さなサンプルだけ見ると大げさに感じるかもしれません。しかし、**多数のユースケースを並行して管理する**場面や、**サムネイル生成の自動化**、**ユースケース切り替え時のクリーンアップ**など、プロジェクト全体を考慮すると利点が大きい構成です。

**Q2. `update(deltaTime)` でオブジェクト回転以外に何をすればよい？**  
A2. たとえば、**キー入力**や**マウスイベント**、**オーディオ連動**などのロジックをここで処理できます。`Raycaster` を使ってカーソルが特定オブジェクトに当たったら色を変えるなど、リアルタイムなUI・UXを `update()` 内に組み込めます。

**Q3. ライト設定やカメラ位置など、すべてのユースケースで別々に書かなければならない？**  
A3. 大枠のデフォルトは `UseCaseBase` 側で `setupDefaultLighting()` を用意している通り、共通化できます。各ユースケースで個性を持たせたい場合のみ、独自のライトやカメラ挙動を上書きする流れが自然です。

---

## 17. コードの差分で学ぶカスタマイズ例

ここでは `usecase-000` をベースに簡単な改造をした例を紹介します。これにより、実際に**どうコードを修正すればシーンが変わるか**という感覚を掴んでください。

### 17-1. キューブの色をランダムにする

```js
// 変更前
const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });

// 変更後
const randomColor = Math.floor(Math.random() * 0xffffff);
const material = new THREE.MeshPhongMaterial({ color: randomColor });
```

毎回リロードするたびにキューブの色が変わるようになります。

### 17-2. 回転速度を上げる

```js
// 変更前
objects[0].rotation.x += deltaTime;
objects[0].rotation.y += deltaTime;

// 変更後
objects[0].rotation.x += deltaTime * 3; // 3倍速
objects[0].rotation.y += deltaTime * 3;
```

1秒間に3度の回転量を加算することになり、キューブの回転が素早くなります。

### 17-3. Cube GeometryをPlane Geometryに置き換える

```js
// 変更前
const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);

// 変更後
const geometry = new THREE.PlaneGeometry(2, 2);
```

回転する平面が表示されるようになります（ただし厚みはないので、角度によっては見えなくなる瞬間があります）。

---

## 18. 運用上の注意点

1. **ユースケース追加時のID重複**  
   - `metadata.id` が重複しないように注意。ユースケースが増えると衝突リスクも増える。
2. **大量のユースケース・読み込み時間**  
   - `import.meta.glob` で多数のファイルをスキャンしているため、**極端に多いとビルド時に時間がかかる**可能性がある。分割や非同期ロードの工夫が必要になるかもしれない。
3. **サムネイル生成のリソース負荷**  
   - 各ユースケースでのミニレンダリングが積み重なると、GPU/CPUに負荷が高まる。`thumbnailQueue.js` でキュー制御を導入しているが、大規模なギャラリーではさらに最適化が必要な場合も。

---

## 19. 今後の発展: 物理演算やシェーダーへの応用

`usecase-000` はあくまで**形状を回転させるだけ**の例ですが、今後以下のような高度な機能を扱う際も**同じフレームワーク**で対応可能です。

- **Ammo.js や Cannon.js** を使った物理演算  
- **GLTFLoader** で外部モデルを読み込み、アニメーション制御  
- **ShaderMaterial** を使ったカスタムシェーダー表現  
- **オブジェクトのドラッグ＆ドロップ、Raycasterとの連携**

いずれの場合も、`UseCaseBase` の `init()` で**リソースを読み込み**、 `update(deltaTime)` で**物理計算やシェーダーユニフォーム更新**を行う流れにすればOKです。サムネイル生成時にも同じコードが使えます。

---

## 20. まとめ

「**Usecase-000: Basic Cube Spin**」は、Three.js ショールームギャラリーの中で**最もシンプルなサンプル**でありながら、今後登場するユースケースの開発フローを学ぶうえで最適な教材となります。

- **ディレクトリ構成**: `usecases` 配下に各ユースケースを配置し、共通の `core/` や `thumbnailSystem/` を活用。
- **UseCaseBase**: `init()`, `update()`, `dispose()` の3つを基本とし、拡張可能な構造を採用。  
- **メタデータとサムネイル生成**: `metadata` と静的メソッド（`setupScene()`, `updateObjects()` など）を定義するだけで、自動的にギャラリーやサムネイルに対応。  
- **SceneManager**: ユースケース読み込みの動的 import や、シーン切り替え時のクリーンアップを担う。  
- **Camera, Renderer**: デフォルト設定やリサイズ処理を一本化し、ユースケース側の負担を軽減。

今後の `usecase-001` ～ `usecase-100` では、**この仕組みを土台**にして、実際に各種機能を実装していくことになるでしょう。まずは `usecase-000` の流れをよく理解したうえで、簡単な変更を加えてみたり、別のジオメトリを試したりして、**設計やフレームワークへの感覚を掴んでみてください**。

---

### 付録: さらに踏み込むためのヒント

1. **GUIの導入**  
   - `usecase-000` に dat.GUI などを追加し、回転速度やキューブのサイズをスライダーで操作するインターフェイスを作ると、よりインタラクティブなデモに発展させられます。

2. **OrbitControlsのカスタマイズ**  
   - `Camera.js` の `setupControls()` メソッド内でパラメータを変更し、回転の制限角度やズーム制限を調整できます。  
   - 例えば `controls.maxPolarAngle = Math.PI` とすると、カメラが真下まで回せるようになるなど。

3. **Post-Processingの導入**  
   - `Renderer.js` に `EffectComposer` を組み込み、**Bloom** や **DOF(Depth of Field)** などのエフェクトを適用することも可能。より幻想的なシーンが作れます。

4. **パフォーマンス最適化**  
   - 大量のオブジェクトや高解像度テクスチャを使うと、フレームレート低下やサムネイル生成の遅延が起こる場合があります。  
   - **インスタンシング** (`THREE.InstancedMesh`) や **LOD** を活用するとスムーズに動作する可能性が高まります。

---

これで **Usecase-000: Basic Cube Spin** の解説は終了です。  
このプロジェクトにおける**設計パターンやクラス構成**を理解するために、ぜひ本記事を参考にしてください。今後 `usecase-001` ～ `usecase-100` でも同様の手順で新しい機能や表現を追加していきますので、自分のアイデアをどんどん実験し、**ショールームギャラリーを充実させて**いきましょう。

以上が、本章「usecase-000」に関する詳細ドキュメントとなります。お疲れさまでした！