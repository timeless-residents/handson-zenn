---
title: Usecase-025 Wipe Transition Sequencer
---
# Usecase-025: Wipe Transition Sequencer

**本章では、`usecases/usecase-025` ディレクトリに格納されている「Wipe Transition Sequencer」のコードを解説します。**  
このサンプルは、複数の画像間でワイプトランジション効果を実装しています。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、シェーダーを使った画像トランジション効果を実現した例となっています。

---

## 1. ワイプトランジション効果

これまでのユースケースでは、様々な形状とアニメーション効果を扱ってきました。`usecase-025` では、カスタムシェーダーを使用して、複数の画像間でワイプトランジション効果を実装しています。

ワイプトランジションとは、一方の画像が他方の画像を徐々に「拭き取る」ように置き換えていく効果です。このサンプルでは、シェーダーを使用して、トランジションの進行度と方向を制御しています。また、シーケンサーを実装して、複数の画像を順番に表示し、それぞれの間にランダムな方向のワイプトランジションを適用しています。

`usecase-025` では、以下の特徴を持つシーンを作成しています：

1. **シェーダーベースのトランジション**: カスタムシェーダーを使用したワイプトランジション効果
2. **複数画像のシーケンス**: 複数の画像を順番に表示するシーケンサー
3. **ランダムな方向**: トランジションごとにランダムな方向を設定
4. **タイミング制御**: 画像の表示時間とトランジションの持続時間を制御
5. **アニメーション効果**: 表示平面に微妙な浮遊感と回転を追加

これらの効果を組み合わせることで、視覚的に興味深い画像トランジション効果を実現しています。

---

## 2. `usecase-025/index.js` コード詳細

それでは、実際の `usecase-025` のコードを詳しく見ていきましょう。

```js
// usecase-025/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase025 extends UseCaseBase {
  static metadata = {
    id: "025",
    title: "Wipe Transition Sequencer",
    description:
      "A wipe transition effect between multiple images using a sequencer",
    categories: ["Shader", "Transition", "Image"],
  };

  constructor(scene) {
    super(scene);
    this.time = 0;
    this.currentImageIndex = 0;
    this.nextImageIndex = 1;
    this.transitionProgress = 0;
    this.isTransitioning = false;
    this.transitionDuration = 1.0; // seconds
    this.imageDuration = 3.0; // seconds to display each image before transition
    this.lastTransitionTime = 0;
  }

  static setupScene(scene) {
    // Create a plane to display the images
    const geometry = new THREE.PlaneGeometry(16, 9);

    // Create shader material for the wipe transition
    const material = new THREE.ShaderMaterial({
      uniforms: {
        textureA: { value: null },
        textureB: { value: null },
        progress: { value: 0.0 },
        direction: { value: new THREE.Vector2(1.0, 0.0) }, // Direction of the wipe (horizontal)
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D textureA;
        uniform sampler2D textureB;
        uniform float progress;
        uniform vec2 direction;
        
        varying vec2 vUv;
        
        void main() {
          // Calculate the wipe effect
          float prog = dot(vUv - 0.5, normalize(direction)) + 0.5;
          vec4 colorA = texture2D(textureA, vUv);
          vec4 colorB = texture2D(textureB, vUv);
          
          // Apply the wipe transition
          gl_FragColor = mix(colorA, colorB, step(prog, progress));
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Add lights
    const lights = UseCaseBase.setupDefaultLighting(scene);

    return {
      objects: [mesh, ...lights],
      geometries: [geometry],
      material: material,
      mesh: mesh, // Add mesh to the return object for easy access
    };
  }

  async loadImages() {
    const imageUrls = [
      "https://picsum.photos/id/10/1600/900", // Nature
      "https://picsum.photos/id/20/1600/900", // Architecture
      "https://picsum.photos/id/30/1600/900", // People
      "https://picsum.photos/id/40/1600/900", // Objects
      "https://picsum.photos/id/50/1600/900", // Animals
    ];

    const textureLoader = new THREE.TextureLoader();

    // Load all textures
    this.textures = await Promise.all(
      imageUrls.map((url) => {
        return new Promise((resolve, reject) => {
          textureLoader.load(
            url,
            (texture) => {
              texture.minFilter = THREE.LinearFilter;
              texture.magFilter = THREE.LinearFilter;
              resolve(texture);
            },
            undefined,
            reject
          );
        });
      })
    );

    // 修正：this.material を直接利用してテクスチャを設定する
    this.material.uniforms.textureA.value = this.textures[0];
    this.material.uniforms.textureB.value = this.textures[1];
  }

  async init() {
    const { objects, material, mesh } = GeometryShowcase025.setupScene(
      this.scene
    );
    objects.forEach((obj) => this.objects.add(obj));

    this.material = material;
    this.mesh = mesh; // Store mesh reference for animation
    await this.loadImages();

    // Position the camera to see the plane
    if (this.scene.userData.camera) {
      this.scene.userData.camera.position.set(0, 0, 15);
      this.scene.userData.camera.lookAt(0, 0, 0);
    }
  }

  // Static method to update objects - can be used by both update() and createPreview()
  static updateObjects(objects, time, mousePos = { x: 0, y: 0 }, params = {}) {
    const {
      material,
      mesh,
      textures,
      currentImageIndex = 0,
      nextImageIndex = 1,
      isTransitioning = false,
      transitionProgress = 0,
      lastTransitionTime = 0,
      transitionDuration = 1.0,
      imageDuration = 3.0,
    } = params;

    // Add gentle floating movement to the plane
    if (mesh) {
      // Gentle rotation
      mesh.rotation.x = Math.sin(time * 0.2) * 0.05;
      mesh.rotation.y = Math.sin(time * 0.3) * 0.05;

      // Subtle floating motion
      mesh.position.y = Math.sin(time * 0.5) * 0.2;
    }

    // If we don't have textures or material, we can't do transitions
    if (!textures || !material || textures.length < 2) {
      return {
        currentImageIndex,
        nextImageIndex,
        isTransitioning,
        transitionProgress,
        lastTransitionTime,
      };
    }

    let newIsTransitioning = isTransitioning;
    let newTransitionProgress = transitionProgress;
    let newLastTransitionTime = lastTransitionTime;
    let newCurrentImageIndex = currentImageIndex;
    let newNextImageIndex = nextImageIndex;

    // Check if we need to start a new transition
    if (!isTransitioning && time - lastTransitionTime > imageDuration) {
      newIsTransitioning = true;
      newTransitionProgress = 0;

      // Update indices for next transition
      newCurrentImageIndex = nextImageIndex;
      newNextImageIndex = (nextImageIndex + 1) % textures.length;

      // Update textures
      material.uniforms.textureA.value = textures[newCurrentImageIndex];
      material.uniforms.textureB.value = textures[newNextImageIndex];

      // Randomize wipe direction
      const angle = Math.random() * Math.PI * 2;
      material.uniforms.direction.value.set(Math.cos(angle), Math.sin(angle));
    }

    // Update transition progress
    if (isTransitioning) {
      newTransitionProgress += 0.016 / transitionDuration; // Use fixed deltaTime for consistency

      if (newTransitionProgress >= 1.0) {
        newTransitionProgress = 0;
        newIsTransitioning = false;
        newLastTransitionTime = time;

        // Swap current texture to be the completed transition
        newCurrentImageIndex = nextImageIndex;
        material.uniforms.textureA.value = textures[newCurrentImageIndex];
      }

      // Update shader uniform
      material.uniforms.progress.value = newTransitionProgress;
    }

    return {
      currentImageIndex: newCurrentImageIndex,
      nextImageIndex: newNextImageIndex,
      isTransitioning: newIsTransitioning,
      transitionProgress: newTransitionProgress,
      lastTransitionTime: newLastTransitionTime,
    };
  }

  update(deltaTime) {
    this.time += deltaTime;

    // Use the static updateObjects method
    const result = GeometryShowcase025.updateObjects(
      Array.from(this.objects),
      this.time,
      { x: 0, y: 0 },
      {
        material: this.material,
        mesh: this.mesh,
        textures: this.textures,
        currentImageIndex: this.currentImageIndex,
        nextImageIndex: this.nextImageIndex,
        isTransitioning: this.isTransitioning,
        transitionProgress: this.transitionProgress,
        lastTransitionTime: this.lastTransitionTime,
        transitionDuration: this.transitionDuration,
        imageDuration: this.imageDuration,
      }
    );

    // Update instance variables with the result
    this.currentImageIndex = result.currentImageIndex;
    this.nextImageIndex = result.nextImageIndex;
    this.isTransitioning = result.isTransitioning;
    this.transitionProgress = result.transitionProgress;
    this.lastTransitionTime = result.lastTransitionTime;
  }

  dispose() {
    super.dispose();

    // Dispose textures
    if (this.textures) {
      this.textures.forEach((texture) => texture.dispose());
    }
  }

  static getThumbnailCameraPosition() {
    return {
      position: [0, 0, 15],
      target: [0, 0, 0],
    };
  }

  // createPreview と getThumbnailBlob メソッドは省略
}
```

### 2-1. `metadata`

```js
static metadata = {
  id: "025",
  title: "Wipe Transition Sequencer",
  description:
    "A wipe transition effect between multiple images using a sequencer",
  categories: ["Shader", "Transition", "Image"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `025`、 `title` は「Wipe Transition Sequencer」など。
- `description` には、シーケンサーを使用した複数画像間のワイプトランジション効果について言及されています。
- `categories` に「Shader」、「Transition」、「Image」が追加されており、シェーダーを使った画像トランジションをテーマにしていることを示しています。

### 2-2. `constructor`

```js
constructor(scene) {
  super(scene);
  this.time = 0;
  this.currentImageIndex = 0;
  this.nextImageIndex = 1;
  this.transitionProgress = 0;
  this.isTransitioning = false;
  this.transitionDuration = 1.0; // seconds
  this.imageDuration = 3.0; // seconds to display each image before transition
  this.lastTransitionTime = 0;
}
```

コンストラクタでは、トランジションとシーケンスに関連するプロパティを初期化しています：
- `currentImageIndex`と`nextImageIndex`: 現在表示中の画像と次に表示する画像のインデックス
- `transitionProgress`: トランジションの進行度（0～1）
- `isTransitioning`: トランジション中かどうかのフラグ
- `transitionDuration`: トランジションの持続時間（秒）
- `imageDuration`: 各画像の表示時間（秒）
- `lastTransitionTime`: 最後にトランジションが完了した時間

### 2-3. `setupScene(scene)`

```js
static setupScene(scene) {
  // Create a plane to display the images
  const geometry = new THREE.PlaneGeometry(16, 9);

  // Create shader material for the wipe transition
  const material = new THREE.ShaderMaterial({
    uniforms: {
      textureA: { value: null },
      textureB: { value: null },
      progress: { value: 0.0 },
      direction: { value: new THREE.Vector2(1.0, 0.0) }, // Direction of the wipe (horizontal)
    },
    vertexShader: `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D textureA;
      uniform sampler2D textureB;
      uniform float progress;
      uniform vec2 direction;
      
      varying vec2 vUv;
      
      void main() {
        // Calculate the wipe effect
        float prog = dot(vUv - 0.5, normalize(direction)) + 0.5;
        vec4 colorA = texture2D(textureA, vUv);
        vec4 colorB = texture2D(textureB, vUv);
        
        // Apply the wipe transition
        gl_FragColor = mix(colorA, colorB, step(prog, progress));
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Add lights
  const lights = UseCaseBase.setupDefaultLighting(scene);

  return {
    objects: [mesh, ...lights],
    geometries: [geometry],
    material: material,
    mesh: mesh, // Add mesh to the return object for easy access
  };
}
```

ここでは、シーンのセットアップを行っています。主な特徴は以下の通りです：

1. **平面ジオメトリの作成**:
   ```js
   const geometry = new THREE.PlaneGeometry(16, 9);
   ```
   
   16:9のアスペクト比を持つ平面ジオメトリを作成しています。これは標準的な画像やビデオのアスペクト比に合わせています。

2. **シェーダーマテリアルの作成**:
   ```js
   const material = new THREE.ShaderMaterial({
     uniforms: {
       textureA: { value: null },
       textureB: { value: null },
       progress: { value: 0.0 },
       direction: { value: new THREE.Vector2(1.0, 0.0) }, // Direction of the wipe (horizontal)
     },
     vertexShader: `...`,
     fragmentShader: `...`,
   });
   ```
   
   ワイプトランジション効果を実現するためのカスタムシェーダーマテリアルを作成しています。このシェーダーは以下のuniformを使用します：
   - `textureA`: 現在表示中の画像のテクスチャ
   - `textureB`: 次に表示する画像のテクスチャ
   - `progress`: トランジションの進行度（0～1）
   - `direction`: ワイプの方向を示すベクトル

3. **フラグメントシェーダー**:
   ```js
   fragmentShader: `
     uniform sampler2D textureA;
     uniform sampler2D textureB;
     uniform float progress;
     uniform vec2 direction;
     
     varying vec2 vUv;
     
     void main() {
       // Calculate the wipe effect
       float prog = dot(vUv - 0.5, normalize(direction)) + 0.5;
       vec4 colorA = texture2D(textureA, vUv);
       vec4 colorB = texture2D(textureB, vUv);
       
       // Apply the wipe transition
       gl_FragColor = mix(colorA, colorB, step(prog, progress));
     }
   `,
   ```
   
   フラグメントシェーダーでは、ワイプトランジション効果を計算しています。主なロジックは以下の通りです：
   - `float prog = dot(vUv - 0.5, normalize(direction)) + 0.5;`: 各ピクセルの位置と方向ベクトルの内積を計算し、0～1の範囲に正規化します。これにより、方向に沿った位置が決まります。
   - `gl_FragColor = mix(colorA, colorB, step(prog, progress));`: `step`関数を使用して、`prog`が`progress`より小さい場合は`colorB`を、そうでない場合は`colorA`を表示します。これにより、`progress`の値が増加するにつれて、`direction`の方向に沿って`textureB`が`textureA`を置き換えていきます。

### 2-4. `loadImages()`

```js
async loadImages() {
  const imageUrls = [
    "https://picsum.photos/id/10/1600/900", // Nature
    "https://picsum.photos/id/20/1600/900", // Architecture
    "https://picsum.photos/id/30/1600/900", // People
    "https://picsum.photos/id/40/1600/900", // Objects
    "https://picsum.photos/id/50/1600/900", // Animals
  ];

  const textureLoader = new THREE.TextureLoader();

  // Load all textures
  this.textures = await Promise.all(
    imageUrls.map((url) => {
      return new Promise((resolve, reject) => {
        textureLoader.load(
          url,
          (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            resolve(texture);
          },
          undefined,
          reject
        );
      });
    })
  );

  // 修正：this.material を直接利用してテクスチャを設定する
  this.material.uniforms.textureA.value = this.textures[0];
  this.material.uniforms.textureB.value = this.textures[1];
}
```

このメソッドでは、トランジションに使用する画像を非同期で読み込んでいます。主な特徴は以下の通りです：

1. **画像URLの定義**:
   ```js
   const imageUrls = [
     "https://picsum.photos/id/10/1600/900", // Nature
     "https://picsum.photos/id/20/1600/900", // Architecture
     "https://picsum.photos/id/30/1600/900", // People
     "https://picsum.photos/id/40/1600/900", // Objects
     "https://picsum.photos/id/50/1600/900", // Animals
   ];
   ```
   
   Lorem Picsum APIを使用して、様々なカテゴリの画像を取得しています。

2. **テクスチャの非同期読み込み**:
   ```js
   this.textures = await Promise.all(
     imageUrls.map((url) => {
       return new Promise((resolve, reject) => {
         textureLoader.load(
           url,
           (texture) => {
             texture.minFilter = THREE.LinearFilter;
             texture.magFilter = THREE.LinearFilter;
             resolve(texture);
           },
           undefined,
           reject
         );
       });
     })
   );
   ```
   
   `Promise.all`を使用して、すべての画像を並行して読み込んでいます。各テクスチャには`LinearFilter`を適用して、画像の拡大縮小時に滑らかに表示されるようにしています。

3. **初期テクスチャの設定**:
   ```js
   this.material.uniforms.textureA.value = this.textures[0];
   this.material.uniforms.textureB.value = this.textures[1];
   ```
   
   読み込んだテクスチャの最初の2つをシェーダーのuniformに設定しています。

### 2-5. `updateObjects(objects, time, mousePos, params)`

```js
static updateObjects(objects, time, mousePos = { x: 0, y: 0 }, params = {}) {
  const {
    material,
    mesh,
    textures,
    currentImageIndex = 0,
    nextImageIndex = 1,
    isTransitioning = false,
    transitionProgress = 0,
    lastTransitionTime = 0,
    transitionDuration = 1.0,
    imageDuration = 3.0,
  } = params;

  // Add gentle floating movement to the plane
  if (mesh) {
    // Gentle rotation
    mesh.rotation.x = Math.sin(time * 0.2) * 0.05;
    mesh.rotation.y = Math.sin(time * 0.3) * 0.05;

    // Subtle floating motion
    mesh.position.y = Math.sin(time * 0.5) * 0.2;
  }

  // If we don't have textures or material, we can't do transitions
  if (!textures || !material || textures.length < 2) {
    return {
      currentImageIndex,
      nextImageIndex,
      isTransitioning,
      transitionProgress,
      lastTransitionTime,
    };
  }

  let newIsTransitioning = isTransitioning;
  let newTransitionProgress = transitionProgress;
  let newLastTransitionTime = lastTransitionTime;
  let newCurrentImageIndex = currentImageIndex;
  let newNextImageIndex = nextImageIndex;

  // Check if we need to start a new transition
  if (!isTransitioning && time - lastTransitionTime > imageDuration) {
    newIsTransitioning = true;
    newTransitionProgress = 0;

    // Update indices for next transition
    newCurrentImageIndex = nextImageIndex;
    newNextImageIndex = (nextImageIndex + 1) % textures.length;

    // Update textures
    material.uniforms.textureA.value = textures[newCurrentImageIndex];
    material.uniforms.textureB.value = textures[newNextImageIndex];

    // Randomize wipe direction
    const angle = Math.random() * Math.PI * 2;
    material.uniforms.direction.value.set(Math.cos(angle), Math.sin(angle));
  }

  // Update transition progress
  if (isTransitioning) {
    newTransitionProgress += 0.016 / transitionDuration; // Use fixed deltaTime for consistency

    if (newTransitionProgress >= 1.0) {
      newTransitionProgress = 0;
      newIsTransitioning = false;
      newLastTransitionTime = time;

      // Swap current texture to be the completed transition
      newCurrentImageIndex = nextImageIndex;
      material.uniforms.textureA.value = textures[newCurrentImageIndex];
    }

    // Update shader uniform
    material.uniforms.progress.value = newTransitionProgress;
  }

  return {
    currentImageIndex: newCurrentImageIndex,
    nextImageIndex: newNextImageIndex,
    isTransitioning: newIsTransitioning,
    transitionProgress: newTransitionProgress,
    lastTransitionTime: newLastTransitionTime,
  };
}
```

このメソッドでは、オブジェクトの更新とトランジションの制御を行っています。主な特徴は以下の通りです：

1. **平面の浮遊感のあるアニメーション**:
   ```js
   if (mesh) {
     // Gentle rotation
     mesh.rotation.x = Math.sin(time * 0.2) * 0.05;
     mesh.rotation.y = Math.sin(time * 0.3) * 0.05;

     // Subtle floating motion
     mesh.position.y = Math.sin(time * 0.5) * 0.2;
   }
   ```
   
   平面に微妙な回転と上下の動きを追加して、浮遊感のあるアニメーションを実現しています。

2. **新しいトランジションの開始**:
   ```js
   if (!isTransitioning && time - lastTransitionTime > imageDuration) {
     newIsTransitioning = true;
     newTransitionProgress = 0;

     // Update indices for next transition
     newCurrentImageIndex = nextImageIndex;
     newNextImageIndex = (nextImageIndex + 1) % textures.length;

     // Update textures
     material.uniforms.textureA.value = textures[newCurrentImageIndex];
     material.uniforms.textureB.value = textures[newNextImageIndex];

     // Randomize wipe direction
     const angle = Math.random() * Math.PI * 2;
     material.uniforms.direction.value.set(Math.cos(angle), Math.sin(angle));
   }
   ```
   
   一定時間（`imageDuration`）が経過したら、新しいトランジションを開始します。このとき、以下の処理を行います：
   - 現在の画像と次の画像のインデックスを更新
   - シェーダーのテクスチャを更新
   - ランダムな角度を生成し、ワイプの方向を設定

3. **トランジションの進行**:
   ```js
   if (isTransitioning) {
     newTransitionProgress += 0.016 / transitionDuration; // Use fixed deltaTime for consistency

     if (newTransitionProgress >= 1.0) {
       newTransitionProgress = 0;
       newIsTransitioning = false;
       newLastTransitionTime = time;

       // Swap current texture to be the completed transition
       newCurrentImageIndex = nextImageIndex;
       material.uniforms.textureA.value = textures[newCurrentImageIndex];
     }

     // Update shader uniform
     material.uniforms.progress.value = newTransitionProgress;
   }
   ```
   
   トランジション中は、進行度を徐々に増加させ、シェーダーのuniformを更新します。トランジションが完了したら、状態をリセットし、次の画像を現在の画像として設定します。

### 2-6. `update(deltaTime)`

```js
update(deltaTime) {
  this.time += deltaTime;

  // Use the static updateObjects method
  const result = GeometryShowcase025.updateObjects(
    Array.from(this.objects),
    this.time,
    { x: 0, y: 0 },
    {
      material: this.material,
      mesh: this.mesh,
      textures: this.textures,
      currentImageIndex: this.currentImageIndex,
      nextImageIndex: this.nextImageIndex,
      isTransitioning: this.isTransitioning,
      transitionProgress: this.transitionProgress,
      lastTransitionTime: this.lastTransitionTime,
      transitionDuration: this.transitionDuration,
      imageDuration: this.imageDuration,
    }
  );

  // Update instance variables with the result
  this.currentImageIndex = result.currentImageIndex;
  this.nextImageIndex = result.nextImageIndex;
  this.isTransitioning = result.isTransitioning;
  this.transitionProgress = result.transitionProgress;
  this.lastTransitionTime = result.lastTransitionTime;
}
```

このメソッドでは、静的な`updateObjects`メソッドを呼び出し、その結果でインスタンス変数を更新しています。これにより、`updateObjects`メソッドを`update`メソッドと`createPreview`メソッドの両方で再利用できるようになっています。

### 2-7. `dispose()`

```js
dispose() {
  super.dispose();

  // Dispose textures
  if (this.textures) {
    this.textures.forEach((texture) => texture.dispose());
  }
}
```

このメソッドでは、テクスチャのメモリを解放しています。これは、メモリリークを防ぐために重要です。

## 3. シェーダーによるワイプトランジション

このサンプルの中心となるのは、シェーダーを使用したワイプトランジション効果です。フラグメントシェーダーの核心部分を詳しく見てみましょう：

```glsl
// Calculate the wipe effect
float prog = dot(vUv - 0.5, normalize(direction)) + 0.5;
vec4 colorA = texture2D(textureA, vUv);
vec4 colorB = texture2D(textureB, vUv);

// Apply the wipe transition
gl_FragColor = mix(colorA, colorB, step(prog, progress));
```

このコードでは、以下の手順でワイプトランジション効果を実現しています：

1. **方向ベクトルに沿った位置の計算**:
   ```glsl
   float prog = dot(vUv - 0.5, normalize(direction)) + 0.5;
   ```
   
   各ピクセルの位置（`vUv`）から中心（0.5, 0.5）を引いて、方向ベクトル（`direction`）との内積を計算しています。これにより、方向ベクトルに沿った位置が-0.5～0.5の範囲で得られます。そこに0.5を加えることで、0～1の範囲に正規化しています。

2. **ステップ関数によるトランジション**:
   ```glsl
   gl_FragColor = mix(colorA, colorB, step(prog, progress));
   ```
   
   `step(prog, progress)`は、`prog`が`progress`より小さい場合は1、そうでない場合は0を返します。これを`mix`関数の補間係数として使用することで、`progress`の値が増加するにつれて、`direction`の方向に沿って`textureB`が`textureA`を置き換えていきます。

このシェーダーの特徴は、方向ベクトル（`direction`）を変更することで、ワイプの方向を自由に制御できる点です。例えば、`direction`を(1, 0)に設定すると左から右へのワイプ、(0, 1)に設定すると下から上へのワイプになります。また、斜めの方向ベクトルを設定することで、斜めのワイプも実現できます。

## 4. シーケンサーの実装

このサンプルでは、複数の画像を順番に表示するシーケンサーを実装しています。シーケンサーの主な機能は以下の通りです：

1. **画像の表示時間の制御**:
   ```js
   if (!isTransitioning && time - lastTransitionTime > imageDuration) {
     // 新しいトランジションを開始
     // ...
   }
   ```
   
   各画像は一定時間（`imageDuration`）表示された後、次の画像へのトランジションが開始されます。

2. **トランジションの進行度の制御**:
   ```js
   if (isTransitioning) {
     newTransitionProgress += 0.016 / transitionDuration; // Use fixed deltaTime for consistency

     if (newTransitionProgress >= 1.0) {
       // トランジション完了
       // ...
     }

     // Update shader uniform
     material.uniforms.progress.value = newTransitionProgress;
   }
   ```
   
   トランジション中は、進行度（`transitionProgress`）を徐々に増加させ、シェーダーのuniformを更新します。トランジションが完了したら、状態をリセットし、次の画像を現在の画像として設定します。

3. **ランダムな方向の設定**:
   ```js
   // Randomize wipe direction
   const angle = Math.random() * Math.PI * 2;
   material.uniforms.direction.value.set(Math.cos(angle), Math.sin(angle));
   ```
   
   各トランジションごとに、ランダムな角度を生成し、ワイプの方向を設定しています。これにより、毎回異なる方向からのワイプトランジションが実現されます。

## 5. まとめ

「**Usecase-025: Wipe Transition Sequencer**」では、Three.jsでシェーダーを使った画像トランジション効果を実装する方法を学びました。

主なポイントは以下の通りです：

1. **シェーダーベースのトランジション**: カスタムシェーダーを使用して、ワイプトランジション効果を実装しました。
2. **シーケンサーの実装**: 複数の画像を順番に表示し、それぞれの間にトランジションを適用するシーケンサーを実装しました。
3. **ランダムな方向**: トランジションごとにランダムな方向を設定することで、視覚的な変化を追加しました。
4. **タイミング制御**: 画像の表示時間とトランジションの持続時間を制御することで、滑らかなシーケンスを実現しました。

これらの技術を組み合わせることで、視覚的に興味深い画像トランジション効果を実現することができます。また、これらの技術は、ウェブサイトやプレゼンテーション、ゲームなど、様々なアプリケーションに応用することができます。

次のユースケースでは、さらに高度なシェーダーとアニメーション技術を探索していきます。
