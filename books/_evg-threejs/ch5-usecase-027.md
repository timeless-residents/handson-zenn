---
title: Usecase-027 Motion Blur Monkey
---

# Usecase-027: Motion Blur Monkey

**本章では、`usecases/usecase-027` ディレクトリに格納されている「Motion Blur Monkey」のコードを解説します。**  
このサンプルは、モンキーモデルに対してモーションブラー効果を適用し、振動の錯覚を生み出す実装例です。複数のインスタンスを異なる透明度で重ね合わせることで、動きの残像効果を表現しています。

---

## 1. モーションブラー効果の実装

モーションブラー効果は、高速で動くオブジェクトの軌跡を表現するテクニックです。映画やゲームでは、動きの速さや激しさを強調するために広く使われています。

`usecase-027` では、以下のアプローチでモーションブラー効果を実現しています：

1. **複数インスタンスの重ね合わせ**: 同じモデルの複数のインスタンスを作成し、わずかに位置をずらして配置します。
2. **透明度の段階的変化**: 各インスタンスに異なる透明度を設定し、メインのモデルから離れるほど透明になるようにします。
3. **振動アニメーション**: 各インスタンスに微妙に異なる動きを与え、振動しているような錯覚を生み出します。

このテクニックにより、モデルが高速で振動しているような視覚効果が得られ、静止画でも動きの印象を与えることができます。

`usecase-027` の主な特徴は以下の通りです：

1. **カスタムモンキーモデル**: 基本的なThree.jsジオメトリを組み合わせて、シンプルなモンキーヘッドを作成。
2. **モーションブラー効果**: 複数のインスタンスと透明度を利用した残像表現。
3. **パラメータ化された振動**: 振動の速度や振幅を調整可能なパラメータ設計。
4. **リソース管理**: 使用後のジオメトリやマテリアルの破棄処理を実装。
5. **複雑な動きの表現**: 回転、バウンス、ランダムな揺れを組み合わせた自然な動き。

---

## 2. `usecase-027/index.js` コード詳細

以下、コード内の各主要部分について解説します。

### 2-1. `metadata`

```js
static metadata = {
  id: "027",
  title: "Motion Blur Monkey",
  description:
    "A monkey model with motion blur effect to create a vibration illusion",
  categories: ["Effects", "Animation", "Model"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` はユースケースの識別子、`title` はタイトル、`description` にはサンプルの特徴、`categories` でカテゴリが指定されています。

### 2-2. `constructor` と初期設定

```js
constructor(scene) {
  super(scene);
  this.time = 0;
  this.monkeyGroup = null;
  this.monkeyInstances = [];
  this.blurAmount = 8; // ブラーインスタンスの数（増加）
  this.vibrationSpeed = 8; // 振動の速度（遅めの動きのために減少）
  this.vibrationAmplitude = 0.15; // 振動の振幅（増加）

  // すべてのオブジェクトを格納するグループを作成
  this.objects = new THREE.Group();
  scene.add(this.objects);
}
```

- コンストラクタでは、基本クラスの初期化後に各種パラメータを設定しています。
- `this.blurAmount` はモーションブラー効果のために作成するインスタンスの数を指定します。
- `this.vibrationSpeed` と `this.vibrationAmplitude` は振動アニメーションの速度と振幅を制御します。
- `this.objects` はシーン内のすべてのオブジェクトを格納するためのグループです。

### 2-3. モンキーヘッドの作成: `createMonkeyHead`

```js
static createMonkeyHead(material) {
  // モンキーヘッドのパーツを格納するグループを作成
  const monkeyHead = new THREE.Group();
  monkeyHead.name = "monkeyHead";

  // メインの頭部形状（やや細長い球体）
  const headGeometry = new THREE.SphereGeometry(1, 32, 24);
  // 球体を楕円形に変形
  headGeometry.scale(1, 1.2, 1);
  const head = new THREE.Mesh(headGeometry, material);
  monkeyHead.add(head);

  // 口吻/鼻先
  const muzzleGeometry = new THREE.SphereGeometry(0.5, 32, 16);
  muzzleGeometry.scale(1, 0.8, 1.2);
  const muzzle = new THREE.Mesh(muzzleGeometry, material);
  muzzle.position.set(0, -0.3, 0.7);
  monkeyHead.add(muzzle);

  // 耳（扁平な球体）
  const earGeometry = new THREE.SphereGeometry(0.4, 16, 16);
  earGeometry.scale(1, 1, 0.3);

  const leftEar = new THREE.Mesh(earGeometry, material);
  leftEar.position.set(-0.8, 0.5, 0);
  leftEar.rotation.y = -Math.PI / 4;
  monkeyHead.add(leftEar);

  const rightEar = new THREE.Mesh(earGeometry, material);
  rightEar.position.set(0.8, 0.5, 0);
  rightEar.rotation.y = Math.PI / 4;
  monkeyHead.add(rightEar);

  // 目
  const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
  const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.35, 0.1, 0.8);
  monkeyHead.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.35, 0.1, 0.8);
  monkeyHead.add(rightEye);

  // 鼻
  const noseGeometry = new THREE.SphereGeometry(0.12, 16, 16);
  noseGeometry.scale(1.2, 0.7, 1);
  const noseMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.position.set(0, -0.2, 1.1);
  monkeyHead.add(nose);

  // 口（曲線）
  const mouthGeometry = new THREE.TorusGeometry(0.2, 0.03, 8, 12, Math.PI);
  const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
  const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
  mouth.position.set(0, -0.4, 1);
  mouth.rotation.x = Math.PI / 2;
  mouth.rotation.z = Math.PI;
  monkeyHead.add(mouth);

  // 後で破棄するためにすべてのジオメトリを収集
  const geometries = [
    headGeometry,
    muzzleGeometry,
    earGeometry,
    eyeGeometry,
    noseGeometry,
    mouthGeometry,
  ];

  return { monkeyHead, geometries };
}
```

- この関数では、基本的なThree.jsジオメトリを組み合わせて、シンプルなモンキーヘッドモデルを作成しています。
- 頭部、口吻、耳、目、鼻、口などの各パーツを作成し、適切な位置と回転を設定しています。
- 各パーツは親子関係を持つグループ構造になっており、後でアニメーションを適用しやすくなっています。
- 後でリソースを適切に破棄できるよう、使用したジオメトリのリストも返却しています。

### 2-4. モーションブラーインスタンスの作成: `createMotionBlurInstances`

```js
static createMotionBlurInstances(originalMonkey, blurAmount, material) {
  const instances = [];

  // オリジナルのインスタンス（完全に不透明）
  instances.push(originalMonkey);

  // 透明度が徐々に下がる追加インスタンスを作成
  for (let i = 1; i < blurAmount; i++) {
    // オリジナルのモンキーをクローン
    const clone = originalMonkey.clone();

    // 透明度を下げた新しいマテリアルを作成
    const opacity = 0.7 * (1 - i / blurAmount);
    const blurMaterial = material.clone();
    blurMaterial.transparent = true;
    blurMaterial.opacity = opacity;

    // すべての子要素にマテリアルを適用
    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        // 目、鼻、口の特別な処理
        if (
          child.material.color &&
          child.material.color.getHex() === 0x000000
        ) {
          const specialMaterial = child.material.clone();
          specialMaterial.transparent = true;
          specialMaterial.opacity = opacity;
          child.material = specialMaterial;
        } else {
          child.material = blurMaterial;
        }
      }
    });

    instances.push(clone);
  }

  return instances;
}
```

- この関数は、モーションブラー効果を作成するために、オリジナルのモンキーモデルの複数のインスタンスを生成します。
- 各インスタンスは、インデックスに基づいて徐々に透明度が増していきます。
- 目、鼻、口などの黒い部分（色が0x000000）には、特別な処理を行い、それぞれ独自の透明マテリアルを適用します。
- すべてのインスタンスは配列として返され、後でアニメーション処理に使用されます。

### 2-5. シーン構築: `setupScene`

```js
static setupScene(scene) {
  const objects = [];
  const geometries = [];

  // マテリアルの作成
  const monkeyMaterial = new THREE.MeshPhongMaterial({
    color: 0x8b4513, // モンキーの茶色
    shininess: 30,
  });

  // メインのモンキーヘッドを作成
  const { monkeyHead, geometries: monkeyGeometries } =
    this.createMonkeyHead(monkeyMaterial);
  geometries.push(...monkeyGeometries);

  // すべてのモンキーインスタンスを格納するグループを作成
  const monkeyGroup = new THREE.Group();
  monkeyGroup.name = "monkeyGroup";
  scene.add(monkeyGroup);

  // モーションブラーインスタンスを作成
  const blurAmount = 8; // より劇的な効果のために増加
  const monkeyInstances = this.createMotionBlurInstances(
    monkeyHead,
    blurAmount,
    monkeyMaterial
  );

  // すべてのインスタンスをグループに追加
  monkeyInstances.forEach((instance) => {
    monkeyGroup.add(instance);
    objects.push(instance);
  });

  // ライティングを追加
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(ambientLight, directionalLight);

  const lights = [ambientLight, directionalLight];
  objects.push(...lights);

  return {
    objects,
    geometries,
    lights,
    monkeyGroup,
    monkeyInstances,
    materials: [monkeyMaterial],
  };
}
```

- この関数では、シーン全体のセットアップを行います。
- モンキーヘッドの作成、モーションブラーインスタンスの生成、ライティングの設定などを行います。
- 後でリソースを適切に破棄できるよう、使用したオブジェクト、ジオメトリ、マテリアル、ライトなどの参照を返却します。

### 2-6. オブジェクトの更新: `updateObjects`

```js
static updateObjects(time, params = {}) {
  const {
    monkeyInstances,
    vibrationSpeed = 8,
    vibrationAmplitude = 0.15,
  } = params;

  if (!monkeyInstances || monkeyInstances.length === 0) return;

  // より劇的だがゆっくりとした回転でベースポジションを計算
  const baseRotationX = Math.sin(time * 0.4) * 0.3;
  const baseRotationY = time * 0.25;

  // バウンス効果を追加（ゆっくり）
  const bounceHeight = Math.abs(Math.sin(time * 0.6)) * 0.2;

  // より劇的なオフセットで各インスタンスを更新
  monkeyInstances.forEach((instance, index) => {
    // すべてのインスタンスにベース回転を設定
    instance.rotation.x = baseRotationX;
    instance.rotation.y = baseRotationY;

    // オリジナルのインスタンスにもランダムな揺れを追加してより振動感を出す
    if (index === 0) {
      // メインインスタンスの微妙な揺れ（ゆっくり）
      instance.position.x = Math.sin(time * 10) * 0.02;
      instance.position.y = Math.cos(time * 12) * 0.02 + bounceHeight;
      return;
    }

    // 時間とインスタンスインデックスに基づいて振動オフセットを計算
    // より混沌とした動きを作るためにXとYで異なる周波数を使用（ゆっくり）
    const offsetPhaseX =
      (time * vibrationSpeed + index * 0.5) % (Math.PI * 2);
    const offsetPhaseY =
      (time * (vibrationSpeed + 2) + index * 0.4) % (Math.PI * 2);

    // いくつかのランダム化を含むより劇的なオフセット
    const offsetX =
      Math.sin(offsetPhaseX) * vibrationAmplitude * (1 + index * 0.1);
    const offsetY =
      Math.cos(offsetPhaseY) * vibrationAmplitude * (1 + index * 0.08) +
      bounceHeight;

    // より3D効果を出すためにZ軸の動きを追加（ゆっくり）
    const offsetZ = Math.sin(time * 4 + index) * 0.05;

    // 位置にオフセットを適用
    instance.position.x = offsetX;
    instance.position.y = offsetY;
    instance.position.z = offsetZ;
  });
}
```

- この関数は、各フレームでモンキーインスタンスの位置と回転を更新し、モーションブラー効果を生み出します。
- 基本的な回転とバウンス効果をすべてのインスタンスに適用します。
- メインインスタンス（index=0）には微妙な揺れを追加します。
- 残りのインスタンスには、インデックスに基づいて計算された、より大きなオフセットを適用します。
- 異なる周波数と位相を使用することで、より自然で混沌とした動きを実現しています。

### 2-7. 初期化処理: `init`

```js
async init() {
  try {
    const { monkeyGroup, monkeyInstances, lights } =
      MotionBlurMonkey027.setupScene(this.scene);

    this.monkeyGroup = monkeyGroup;
    this.monkeyInstances = monkeyInstances;

    // オブジェクトグループに追加
    this.objects.add(monkeyGroup);
    lights.forEach((light) => this.objects.add(light));

    // カメラ位置の設定
    if (this.scene.userData.camera) {
      this.scene.userData.camera.position.set(0, 0, 5);
      this.scene.userData.camera.lookAt(0, 0, 0);
    }
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}
```

- この関数では、シーンの初期化を行います。
- `setupScene` を呼び出してモンキーモデルとライトを作成し、参照を保存します。
- カメラの初期位置を設定します。
- エラーハンドリングにより、初期化中の問題をコンソールに出力します。

### 2-8. フレーム更新処理: `update`

```js
update(deltaTime) {
  this.time += deltaTime;

  // モーションブラー効果を作成するためにモンキーインスタンスを更新
  MotionBlurMonkey027.updateObjects(this.time, {
    monkeyInstances: this.monkeyInstances,
    vibrationSpeed: this.vibrationSpeed,
    vibrationAmplitude: this.vibrationAmplitude,
  });
}
```

- この関数は、各フレームで呼び出され、経過時間を更新し、モンキーインスタンスのアニメーションを進行させます。
- `updateObjects` を呼び出し、現在の時間とパラメータを渡します。

### 2-9. サムネイル用カメラ位置: `getThumbnailCameraPosition`

```js
static getThumbnailCameraPosition() {
  return {
    position: [0, 0, 5],
    target: [0, 0, 0],
  };
}
```

- この関数は、サムネイル生成時のカメラ位置と注視点を返します。

### 2-10. プレビュー作成: `createPreview`

```js
static createPreview(container) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  const { monkeyInstances, geometries, materials, objects } =
    this.setupScene(scene);

  let time = 0;

  return {
    element: renderer.domElement,
    animate: () => {
      time += 0.016;
      this.updateObjects(time, {
        monkeyInstances,
        vibrationSpeed: 8,
        vibrationAmplitude: 0.15,
      });
      renderer.render(scene, camera);
    },
    dispose: () => {
      // ジオメトリの破棄
      geometries.forEach((g) => g.dispose());

      // マテリアルの破棄
      materials.forEach((m) => m.dispose());

      // オブジェクトの追加マテリアルの破棄
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

- この関数は、プレビュー用のレンダラー、シーン、カメラをセットアップします。
- アニメーション関数を提供し、シーンの動きを確認できるようにします。
- `dispose` 関数で使用済みのリソース（ジオメトリ、マテリアル、レンダラー）を破棄し、メモリリークを防止します。

### 2-11. サムネイル生成: `getThumbnailBlob`

```js
static getThumbnailBlob() {
  // モーションブラー効果のあるモンキーのシンプルなSVG表現
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#111111"/>
      
      <!-- モーションブラー効果（異なる透明度の複数の重なったモンキー） -->
      <g opacity="0.3" transform="translate(103, 100)">
        <!-- モンキーヘッドの輪郭 -->
        <ellipse cx="0" cy="0" rx="40" ry="45" fill="#8B4513"/>
        <ellipse cx="0" cy="10" rx="25" ry="20" fill="#8B4513"/>
        
        <!-- 耳 -->
        <ellipse cx="-35" cy="-10" rx="15" ry="20" fill="#8B4513"/>
        <ellipse cx="35" cy="-10" rx="15" ry="20" fill="#8B4513"/>
        
        <!-- 目 -->
        <circle cx="-15" cy="-5" r="5" fill="#000000"/>
        <circle cx="15" cy="-5" r="5" fill="#000000"/>
        
        <!-- 鼻 -->
        <ellipse cx="0" cy="15" rx="7" ry="5" fill="#000000"/>
        
        <!-- 口 -->
        <path d="M-15,25 Q0,35 15,25" stroke="#000000" stroke-width="3" fill="none"/>
      </g>
      
      <g opacity="0.5" transform="translate(101, 100)">
        <!-- モンキーヘッドの輪郭 -->
        <ellipse cx="0" cy="0" rx="40" ry="45" fill="#8B4513"/>
        <ellipse cx="0" cy="10" rx="25" ry="20" fill="#8B4513"/>
        
        <!-- 耳 -->
        <ellipse cx="-35" cy="-10" rx="15" ry="20" fill="#8B4513"/>
        <ellipse cx="35" cy="-10" rx="15" ry="20" fill="#8B4513"/>
        
        <!-- 目 -->
        <circle cx="-15" cy="-5" r="5" fill="#000000"/>
        <circle cx="15" cy="-5" r="5" fill="#000000"/>
        
        <!-- 鼻 -->
        <ellipse cx="0" cy="15" rx="7" ry="5" fill="#000000"/>
        
        <!-- 口 -->
        <path d="M-15,25 Q0,35 15,25" stroke="#000000" stroke-width="3" fill="none"/>
      </g>
      
      <g opacity="0.7" transform="translate(99, 100)">
        <!-- モンキーヘッドの輪郭 -->
        <ellipse cx="0" cy="0" rx="40" ry="45" fill="#8B4513"/>
        <ellipse cx="0" cy="10" rx="25" ry="20" fill="#8B4513"/>
        
        <!-- 耳 -->
        <ellipse cx="-35" cy="-10" rx="15" ry="20" fill="#8B4513"/>
        <ellipse cx="35" cy="-10" rx="15" ry="20" fill="#8B4513"/>
        
        <!-- 目 -->
        <circle cx="-15" cy="-5" r="5" fill="#000000"/>
        <circle cx="15" cy="-5" r="5" fill="#000000"/>
        
        <!-- 鼻 -->
        <ellipse cx="0" cy="15" rx="7" ry="5" fill="#000000"/>
        
        <!-- 口 -->
        <path d="M-15,25 Q0,35 15,25" stroke="#000000" stroke-width="3" fill="none"/>
      </g>
      
      <!-- メインのモンキー（完全に不透明） -->
      <g transform="translate(100, 100)">
        <!-- モンキーヘッドの輪郭 -->
        <ellipse cx="0" cy="0" rx="40" ry="45" fill="#8B4513"/>
        <ellipse cx="0" cy="10" rx="25" ry="20" fill="#8B4513"/>
        
        <!-- 耳 -->
        <ellipse cx="-35" cy="-10" rx="15" ry="20" fill="#8B4513"/>
        <ellipse cx="35" cy="-10" rx="15" ry="20" fill="#8B4513"/>
        
        <!-- 目 -->
        <circle cx="-15" cy="-5" r="5" fill="#000000"/>
        <circle cx="15" cy="-5" r="5" fill="#000000"/>
        
        <!-- 鼻 -->
        <ellipse cx="0" cy="15" rx="7" ry="5" fill="#000000"/>
        
        <!-- 口 -->
        <path d="M-15,25 Q0,35 15,25" stroke="#000000" stroke-width="3" fill="none"/>
      </g>
    </svg>
  `;

  const encodedSvg = unescape(encodeURIComponent(svgString));
  const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);
  return fetch(dataURL).then((res) => res.blob());
}
```

- この関数は、サムネイル用のSVG画像を生成し、Blobに変換して返します。
- モーションブラー効果を表現するために、異なる透明度と位置を持つ複数のモンキーを重ね合わせています。
- ギャラリー表示などに利用されます。

---

## 3. まとめ

本サンプルでは、基本的なThree.jsジオメトリを組み合わせてモンキーモデルを作成し、複数のインスタンスと透明度を利用したモーションブラー効果を実装しています。

モーションブラー効果は、以下の要素によって実現されています：

1. **複数インスタンスの作成**: オリジナルモデルの複数のコピーを作成し、それぞれに異なる透明度を設定。
2. **階層的な位置オフセット**: 各インスタンスに微妙に異なる位置オフセットを適用し、動きの軌跡を表現。
3. **複合的なアニメーション**: 回転、バウンス、ランダムな揺れを組み合わせて、より自然で複雑な動きを実現。

このテクニックは、高速で動くオブジェクトの表現や、振動、ぼかし効果など様々な視覚効果に応用できます。また、パラメータを調整することで、効果の強さや動きの特性を簡単に変更できる柔軟な設計となっています。

このコードを通じて、Three.jsにおけるモデリング、マテリアル操作、複数インスタンスの管理、アニメーション技術について理解を深めることができるでしょう。ぜひ、これらの技術を自身のプロジェクトに取り入れ、さらに高度な視覚効果の実装に挑戦してみてください。
