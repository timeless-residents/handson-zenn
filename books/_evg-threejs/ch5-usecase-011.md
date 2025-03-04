---
title: Usecase-011 Interactive Particle System
---
# Usecase-011: Interactive Particle System

**本章では、`usecases/usecase-011` ディレクトリに格納されている「Interactive Particle System」のコードを解説します。**  
このサンプルは、マウスの動きに反応する動的なパーティクルシステムを実装しています。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、パーティクルシステムとユーザーインタラクションという新しい要素を導入しています。

---

## 1. パーティクルシステムとは？

パーティクルシステムは、多数の小さな粒子（パーティクル）を使って、煙、火、雨、雪、星、魔法のエフェクトなど、様々な視覚効果を表現するための技術です。Three.jsでは、`THREE.Points` クラスを使ってパーティクルシステムを実装することができます。

パーティクルシステムの主な特徴は以下の通りです：

- 多数の小さな粒子で構成される
- 各粒子は独立して動く
- 粒子の位置、色、サイズなどを個別に制御できる
- 効率的なレンダリングが可能（多数の粒子を扱える）
- 複雑な視覚効果を比較的簡単に実現できる

`usecase-011` では、1000個のパーティクルからなるシステムを作成し、各パーティクルがマウスの動きに反応するようにしています。これにより、ユーザーとのインタラクティブな体験を実現しています。

---

## 2. `usecase-011/index.js` コード詳細

それでは、実際の `usecase-011` のコードを詳しく見ていきましょう。

```js
// usecase-011/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase011 extends UseCaseBase {
  static metadata = {
    id: "011",
    title: "Interactive Particle System",
    description: "A dynamic particle system that responds to mouse movement",
    categories: ["Particles", "Interactive"],
  };

  constructor(scene) {
    super(scene);
    this.particles = null;
    this.particleCount = 1000;
    this.mouse = new THREE.Vector2();
    this.time = 0;
  }

  static setupScene(scene) {
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(1000 * 3);
    const colors = new Float32Array(1000 * 3);

    for (let i = 0; i < 1000 * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;

      colors[i] = Math.random();
      colors[i + 1] = Math.random();
      colors[i + 2] = Math.random();
    }

    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particles.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const points = new THREE.Points(particles, material);
    scene.add(points);

    return { objects: [points], geometries: [particles] };
  }

  static updateObjects(objects, time, mouse = { x: 0, y: 0 }) {
    const positions = objects[0].geometry.attributes.position.array;
    const colors = objects[0].geometry.attributes.color.array;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += Math.sin(time + i) * 0.01;
      positions[i + 1] += Math.cos(time + i) * 0.01;

      const distance = Math.sqrt(
        Math.pow(positions[i] - mouse.x, 2) +
          Math.pow(positions[i + 1] - mouse.y, 2)
      );

      if (distance < 2) {
        positions[i] += (mouse.x - positions[i]) * 0.02;
        positions[i + 1] += (mouse.y - positions[i + 1]) * 0.02;
      }
    }

    objects[0].geometry.attributes.position.needsUpdate = true;
    objects[0].geometry.attributes.color.needsUpdate = true;
  }

  async init() {
    const { objects } = GeometryShowcase011.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));

    window.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase011.updateObjects(
      Array.from(this.objects),
      this.time,
      this.mouse
    );
  }

  static getThumbnailCameraPosition() {
    return {
      position: [0, 2, 8],
      target: [0, 0, 0],
    };
  }

  static getThumbnailBlob() {
    // サムネイル生成用のSVG（省略）
  }

  static createPreview(container) {
    // プレビュー生成用のコード（省略）
  }
}
```

### 2-1. `metadata`

```js
static metadata = {
  id: "011",
  title: "Interactive Particle System",
  description: "A dynamic particle system that responds to mouse movement",
  categories: ["Particles", "Interactive"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `011`、 `title` は「Interactive Particle System」など。
- `description` には、パーティクルシステムがマウスの動きに反応することについて言及されています。
- `categories` に新しく「Particles」と「Interactive」が追加されています。

### 2-2. `constructor`

```js
constructor(scene) {
  super(scene);
  this.particles = null;
  this.particleCount = 1000;
  this.mouse = new THREE.Vector2();
  this.time = 0;
}
```

前章までと比べて、以下の新しいプロパティが追加されています：

- `this.particles`: パーティクルシステムを格納するプロパティ
- `this.particleCount`: パーティクルの数（1000個）
- `this.mouse`: マウスの位置を格納する2次元ベクトル

### 2-3. `setupScene(scene)`

```js
static setupScene(scene) {
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(1000 * 3);
  const colors = new Float32Array(1000 * 3);

  for (let i = 0; i < 1000 * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 10;
    positions[i + 1] = (Math.random() - 0.5) * 10;
    positions[i + 2] = (Math.random() - 0.5) * 10;

    colors[i] = Math.random();
    colors[i + 1] = Math.random();
    colors[i + 2] = Math.random();
  }

  particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particles.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  });

  const points = new THREE.Points(particles, material);
  scene.add(points);

  return { objects: [points], geometries: [particles] };
}
```

ここでは、パーティクルシステムを作成しています。主な特徴は以下の通りです：

1. **BufferGeometryの作成**:
   ```js
   const particles = new THREE.BufferGeometry();
   ```
   
   `BufferGeometry` は、頂点データを効率的に格納するためのクラスです。パーティクルシステムでは、各パーティクルの位置と色を頂点データとして格納します。

2. **位置と色の配列**:
   ```js
   const positions = new Float32Array(1000 * 3);
   const colors = new Float32Array(1000 * 3);
   ```
   
   1000個のパーティクルの位置（x, y, z）と色（r, g, b）を格納するための配列を作成します。各パーティクルは3つの値（x, y, z または r, g, b）を持つため、配列のサイズは `1000 * 3` になります。

3. **ランダムな位置と色の設定**:
   ```js
   for (let i = 0; i < 1000 * 3; i += 3) {
     positions[i] = (Math.random() - 0.5) * 10;
     positions[i + 1] = (Math.random() - 0.5) * 10;
     positions[i + 2] = (Math.random() - 0.5) * 10;

     colors[i] = Math.random();
     colors[i + 1] = Math.random();
     colors[i + 2] = Math.random();
   }
   ```
   
   各パーティクルの位置をランダムに設定します。`(Math.random() - 0.5) * 10` により、-5から5の範囲のランダムな値が生成されます。また、各パーティクルの色もランダムに設定します。`Math.random()` により、0から1の範囲のランダムな値が生成されます。

4. **属性の設定**:
   ```js
   particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
   particles.setAttribute("color", new THREE.BufferAttribute(colors, 3));
   ```
   
   位置と色の配列を `BufferGeometry` の属性として設定します。第2引数の `3` は、各頂点が3つの値（x, y, z または r, g, b）を持つことを示しています。

5. **マテリアルの作成**:
   ```js
   const material = new THREE.PointsMaterial({
     size: 0.1,
     vertexColors: true,
     transparent: true,
     opacity: 0.8,
   });
   ```
   
   パーティクル用のマテリアルを作成します。主なパラメータは以下の通りです：
   - `size`: パーティクルのサイズ（0.1）
   - `vertexColors`: 頂点ごとに色を設定するかどうか（true）
   - `transparent`: 透明度を有効にするかどうか（true）
   - `opacity`: 不透明度（0.8）

6. **Pointsオブジェクトの作成**:
   ```js
   const points = new THREE.Points(particles, material);
   scene.add(points);
   ```
   
   `BufferGeometry` と `PointsMaterial` を使って `Points` オブジェクトを作成し、シーンに追加します。`Points` は、多数の点を効率的にレンダリングするためのクラスです。

### 2-4. `updateObjects(objects, time, mouse)`

```js
static updateObjects(objects, time, mouse = { x: 0, y: 0 }) {
  const positions = objects[0].geometry.attributes.position.array;
  const colors = objects[0].geometry.attributes.color.array;

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += Math.sin(time + i) * 0.01;
    positions[i + 1] += Math.cos(time + i) * 0.01;

    const distance = Math.sqrt(
      Math.pow(positions[i] - mouse.x, 2) +
        Math.pow(positions[i + 1] - mouse.y, 2)
    );

    if (distance < 2) {
      positions[i] += (mouse.x - positions[i]) * 0.02;
      positions[i + 1] += (mouse.y - positions[i + 1]) * 0.02;
    }
  }

  objects[0].geometry.attributes.position.needsUpdate = true;
  objects[0].geometry.attributes.color.needsUpdate = true;
}
```

ここでは、パーティクルの位置を更新しています。主な特徴は以下の通りです：

1. **位置と色の配列の取得**:
   ```js
   const positions = objects[0].geometry.attributes.position.array;
   const colors = objects[0].geometry.attributes.color.array;
   ```
   
   パーティクルの位置と色の配列を取得します。

2. **パーティクルの位置の更新**:
   ```js
   for (let i = 0; i < positions.length; i += 3) {
     positions[i] += Math.sin(time + i) * 0.01;
     positions[i + 1] += Math.cos(time + i) * 0.01;
     // ...
   }
   ```
   
   各パーティクルの位置を時間に応じて更新します。`Math.sin(time + i) * 0.01` と `Math.cos(time + i) * 0.01` により、各パーティクルが微小な円運動をします。`i` を加えることで、各パーティクルが異なるタイミングで動くようになります。

3. **マウスとの距離の計算**:
   ```js
   const distance = Math.sqrt(
     Math.pow(positions[i] - mouse.x, 2) +
       Math.pow(positions[i + 1] - mouse.y, 2)
   );
   ```
   
   各パーティクルとマウスの位置との距離を計算します。これは2次元のユークリッド距離（√((x₂-x₁)² + (y₂-y₁)²)）です。

4. **マウスに近いパーティクルの位置の更新**:
   ```js
   if (distance < 2) {
     positions[i] += (mouse.x - positions[i]) * 0.02;
     positions[i + 1] += (mouse.y - positions[i + 1]) * 0.02;
   }
   ```
   
   マウスとの距離が2未満のパーティクルは、マウスの方向に少し移動します。`(mouse.x - positions[i]) * 0.02` は、マウスの位置とパーティクルの位置の差の2%をパーティクルの位置に加えることを意味します。これにより、パーティクルがマウスに引き寄せられるような効果が生まれます。

5. **属性の更新フラグの設定**:
   ```js
   objects[0].geometry.attributes.position.needsUpdate = true;
   objects[0].geometry.attributes.color.needsUpdate = true;
   ```
   
   位置と色の属性が更新されたことをThree.jsに通知します。これにより、次のレンダリング時に更新された位置と色が反映されます。

### 2-5. `init()`

```js
async init() {
  const { objects } = GeometryShowcase011.setupScene(this.scene);
  objects.forEach((obj) => this.objects.add(obj));

  window.addEventListener("mousemove", (event) => {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });
}
```

ここでは、シーンの初期化とマウスイベントの設定を行っています。主な特徴は以下の通りです：

1. **シーンの初期化**:
   ```js
   const { objects } = GeometryShowcase011.setupScene(this.scene);
   objects.forEach((obj) => this.objects.add(obj));
   ```
   
   `setupScene` メソッドを呼び出してシーンを初期化し、返されたオブジェクトを `this.objects` に追加します。

2. **マウスイベントの設定**:
   ```js
   window.addEventListener("mousemove", (event) => {
     this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
     this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
   });
   ```
   
   `mousemove` イベントのリスナーを設定します。マウスが動くたびに、マウスの位置を正規化された座標系（-1から1の範囲）に変換して `this.mouse` に格納します。Y座標は上下が反転しているため、符号を反転させています。

### 2-6. `update(deltaTime)`

```js
update(deltaTime) {
  this.time += deltaTime;
  GeometryShowcase011.updateObjects(
    Array.from(this.objects),
    this.time,
    this.mouse
  );
}
```

ここでは、時間の更新とオブジェクトの更新を行っています。主な特徴は以下の通りです：

1. **時間の更新**:
   ```js
   this.time += deltaTime;
   ```
   
   時間を更新します。

2. **オブジェクトの更新**:
   ```js
   GeometryShowcase011.updateObjects(
     Array.from(this.objects),
     this.time,
     this.mouse
   );
   ```
   
   `updateObjects` メソッドを呼び出してオブジェクトを更新します。引数として、オブジェクトの配列、時間、マウスの位置を渡しています。

---

## 3. 前章との比較

`usecase-011` は前章までと基本的な構造は同じですが、以下の点が大きく異なります：

1. **パーティクルシステム**: 従来のメッシュオブジェクトではなく、多数のパーティクルからなるシステムを使用
2. **BufferGeometry**: 効率的なデータ構造を使用して多数のパーティクルを管理
3. **ユーザーインタラクション**: マウスの動きに反応するインタラクティブな要素を導入
4. **動的な更新**: パーティクルの位置をフレームごとに更新
5. **カテゴリ**: 「Particles」と「Interactive」という新しいカテゴリを導入

特に重要なのは、**パーティクルシステムとユーザーインタラクション**が導入された点です。これにより、より動的で魅力的な視覚効果を実現することができます。

---

## 4. BufferGeometryとパーティクルシステム

`usecase-011` では、`BufferGeometry` と `Points` を使ってパーティクルシステムを実装しています。これらの概念について詳しく見ていきましょう。

### 4-1. BufferGeometryとは

`BufferGeometry` は、Three.jsで頂点データを効率的に格納するためのクラスです。従来の `Geometry` クラスと比べて、以下のような利点があります：

- **メモリ効率**: 頂点データを TypedArray（Float32Array など）に直接格納するため、メモリ使用量が少ない
- **パフォーマンス**: GPUに直接データを送ることができるため、レンダリングが高速
- **柔軟性**: 任意の頂点属性（位置、色、法線、UV座標など）を追加できる

パーティクルシステムのように多数の頂点を扱う場合、`BufferGeometry` を使うことでパフォーマンスを大幅に向上させることができます。

### 4-2. BufferAttributeとは

`BufferAttribute` は、`BufferGeometry` の頂点属性を表すクラスです。頂点の位置、色、法線などの情報を格納します。

```js
particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
particles.setAttribute("color", new THREE.BufferAttribute(colors, 3));
```

第1引数は属性の名前、第2引数は `BufferAttribute` オブジェクトです。`BufferAttribute` のコンストラクタの第1引数は TypedArray、第2引数は各頂点あたりの要素数です。例えば、位置属性は各頂点が3つの要素（x, y, z）を持つため、第2引数は `3` になります。

### 4-3. PointsMaterialとは

`PointsMaterial` は、点（パーティクル）をレンダリングするためのマテリアルです。主なパラメータは以下の通りです：

- **size**: 点のサイズ
- **sizeAttenuation**: カメラからの距離に応じてサイズを変更するかどうか
- **vertexColors**: 頂点ごとに色を設定するかどうか
- **map**: テクスチャ（点の形状を定義）
- **transparent**: 透明度を有効にするかどうか
- **opacity**: 不透明度

```js
const material = new THREE.PointsMaterial({
  size: 0.1,
  vertexColors: true,
  transparent: true,
  opacity: 0.8,
});
```

### 4-4. Pointsとは

`Points` は、多数の点（パーティクル）を効率的にレンダリングするためのクラスです。`BufferGeometry` と `PointsMaterial` を組み合わせて使用します。

```js
const points = new THREE.Points(particles, material);
scene.add(points);
```

`Points` オブジェクトをシーンに追加することで、パーティクルシステムが表示されます。

---

## 5. ユーザーインタラクションの実装

`usecase-011` では、マウスの動きに反応するインタラクティブな要素を導入しています。これにより、ユーザーがシーンと対話できるようになります。

### 5-1. マウスイベントの設定

```js
window.addEventListener("mousemove", (event) => {
  this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});
```

`mousemove` イベントのリスナーを設定することで、マウスが動くたびに `this.mouse` の値が更新されます。マウスの位置は、ウィンドウの座標系（ピクセル単位）から正規化された座標系（-1から1の範囲）に変換されます。

### 5-2. マウスの位置の利用

```js
const distance = Math.sqrt(
  Math.pow(positions[i] - mouse.x, 2) +
    Math.pow(positions[i + 1] - mouse.y, 2)
);

if (distance < 2) {
  positions[i] += (mouse.x - positions[i]) * 0.02;
  positions[i + 1] += (mouse.y - positions[i + 1]) * 0.02;
}
```

各パーティクルとマウスの位置との距離を計算し、距離が2未満の場合はパーティクルをマウスの方向に移動させます。これにより、マウスがパーティクルを引き寄せるような効果が生まれます。

### 5-3. インタラクションの効果

このようなインタラクションには、以下のような効果があります：

1. **ユーザーエンゲージメントの向上**: ユーザーがシーンと対話することで、より長く関心を持ち続ける
2. **直感的な操作**: マウスの動きという自然な操作で効果を生み出す
3. **視覚的なフィードバック**: ユーザーの操作に対して即座に視覚的なフィードバックを提供する
4. **没入感の向上**: ユーザーがシーンの一部になったような感覚を与える

---

## 6. 応用例：パーティクルシステムとインタラクションの拡張

`usecase-011` のコードをベースに、以下のような拡張が考えられます：

### 6-1. パーティクルの見た目を変更する

```js
// テクスチャを使ったパーティクル
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('particle.png');
const material = new THREE.PointsMaterial({
  size: 0.2,
  map: texture,
  vertexColors: true,
  transparent: true,
  opacity: 0.8,
  depthWrite: false,
});

// サイズの変更
const sizes = new Float32Array(1000);
for (let i = 0; i < 1000; i++) {
  sizes[i] = Math.random() * 0.2 + 0.05;
}
particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

// カスタムシェーダーマテリアル
const material = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    pointTexture: { value: texture }
  },
  vertexShader: `
    attribute float size;
    varying vec3 vColor;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D pointTexture;
    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4(vColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
    }
  `,
  transparent: true,
  depthWrite: false
});
```

### 6-2. パーティクルの動きを変更する

```js
// より複雑な動き
for (let i = 0; i < positions.length; i += 3) {
  // 螺旋状の動き
  const angle = time * 0.2 + i * 0.01;
  const radius = 2 + Math.sin(time * 0.5 + i * 0.02) * 0.5;
  positions[i] = Math.cos(angle) * radius;
  positions[i + 1] = Math.sin(angle) * radius;
  positions[i + 2] = Math.sin(time + i * 0.003) * 2;
  
  // マウスとの相互作用
  const distance = Math.sqrt(
    Math.pow(positions[i] - mouse.x * 5, 2) +
    Math.pow(positions[i + 1] - mouse.y * 5, 2) +
    Math.pow(positions[i + 2], 2)
  );
  
  if (distance < 2) {
    // マウスから逃げる
    positions[i] -= (mouse.x * 5 - positions[i]) * 0.02;
    positions[i + 1] -= (mouse.y * 5 - positions[i + 1]) * 0.02;
  }
}
```

### 6-3. 色の変化を追加する

```js
// 時間に応じて色を変化
for (let i = 0; i < colors.length; i += 3) {
  const h = (time * 0.1 + i * 0.001) % 1;
  const s = 0.5;
  const l = 0.5;
  
  // HSLからRGBに変換
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  
  colors[i] = hue2rgb(p, q, h + 1/3);
  colors[i + 1] = hue2rgb(p, q, h);
  colors[i + 2] = hue2rgb(p, q, h - 1/3);
}
```

### 6-4. インタラクションを拡張する

```js
// クリックでパーティクルを爆発させる
window.addEventListener("click", (event) => {
  const clickX = (event.clientX / window.innerWidth) * 2 - 1;
  const clickY = -(event.clientY / window.innerHeight) * 2 + 1;
  
  for (let i = 0; i < positions.length; i += 3) {
    const distance = Math.sqrt(
      Math.pow(positions[i] - clickX, 2) +
      Math.pow(positions[i + 1] - clickY, 2)
    );
    
    if (distance < 2) {
      // クリックした位置から外側に向かって飛ばす
      const dirX = positions[i] - clickX;
      const dirY = positions[i + 1] - clickY;
      const length = Math.sqrt(dirX * dirX + dirY * dirY);
      
      if (length > 0) {
        const normalizedDirX = dirX / length;
        const normalizedDirY = dirY / length;
        
        positions[i] += normalizedDirX * 0.5;
        positions[i + 1] += normalizedDirY * 0.5;
      }
    }
  }
});
```

---

## 7. パーティクルシステムの応用例

パーティクルシステムは、様々な視覚効果を表現するために使用されます。以下に、一般的な応用例をいくつか紹介します。

### 7-1. 自然現象の表現

```js
// 雪
for (let i = 0; i < positions.length; i += 3) {
  // 雪が降る
  positions[i + 1] -= 0.01 + Math.random() * 0.01;
  
  // 風の影響
  positions[i] += Math.sin(time + i) * 0.002;
  
  // 地面に着いたら上に戻る
  if (positions[i + 1] < -5) {
    positions[i + 1] = 5;
    positions[i] = (Math.random() - 0.5) * 10;
    positions[i + 2] = (Math.random() - 0.5) * 10;
  }
}

// 炎
for (let i = 0; i < positions.length; i += 3) {
  // 上昇
  positions[i + 1] += 0.05;
  
  // 揺らぎ
  positions[i] += (Math.random() - 0.5) * 0.02;
  positions[i + 2] += (Math.random() - 0.5) * 0.02;
  
  // 寿命
  particleLife[i / 3] -= 0.01;
  
  // 寿命が尽きたらリセット
  if (particleLife[i / 3] <= 0) {
    positions[i] = (Math.random() - 0.5) * 2;
    positions[i + 1] = -5;
    positions[i + 2] = (Math.random() - 0.5) * 2;
    particleLife[i / 3] = 1;
  }
  
  // 色を寿命に応じて変化（赤→黄→白）
  const life = particleLife[i / 3];
  colors[i] = 1;
  colors[i + 1] = life < 0.5 ? life * 2 : 1;
  colors[i + 2] = life < 0.5 ? 0 : (life - 0.5) * 2;
}
```

### 7-2. 宇宙の表現

```js
// 星空
for (let i = 0; i < positions.length; i += 3) {
  // 星のまたたき
  const twinkle = 0.7 + Math.sin(time * 3 + i) * 0.3;
  colors[i] = colors[i + 1] = colors[i + 2] = twinkle;
}

// 銀河
for (let i = 0; i < positions.length; i += 3) {
  const angle = Math.atan2(positions[i + 2], positions[i]);
  const radius = Math.sqrt(positions[i] * positions[i] + positions[i + 2] * positions[i + 2]);
  
  // 螺旋状の回転
  const newAngle = angle + 0.001 * (5 - radius);
  positions[i] = Math.cos(newAngle) * radius;
  positions[i + 2] = Math.sin(newAngle) * radius;
  
  // 中心ほど明るく
  const brightness = 0.5 + 0.5 * (1 - radius / 5);
  colors[i] = colors[i + 1] = colors[i + 2] = brightness;
}
```

### 7-3. 魔法のエフェクト

```js
// 魔法の渦
for (let i = 0; i < positions.length; i += 3) {
  const angle = time * 2 + i * 0.01;
  const radius = 2 + Math.sin(time + i * 0.1) * 0.5;
  const height = Math.cos(time * 3 + i * 0.05) * 3;
  
  positions[i] = Math.cos(angle) * radius;
  positions[i + 1] = height;
  positions[i + 2] = Math.sin(angle) * radius;
  
  // 色の変化
  const h = (time * 0.1 + i * 0.001) % 1;
  colors[i] = Math.sin(h * Math.PI * 2) * 0.5 + 0.5;
  colors[i + 1] = Math.sin((h + 1/3) * Math.PI * 2) * 0.5 + 0.5;
  colors[i + 2] = Math.sin((h + 2/3) * Math.PI * 2) * 0.5 + 0.5;
}
```

---

## 8. まとめ

「**Usecase-011: Interactive Particle System**」では、Three.jsでパーティクルシステムを作成し、マウスの動きに反応するインタラクティブな要素を導入する方法を学びました。

主なポイントは以下の通りです：

1. **BufferGeometryの使用**: 効率的なデータ構造を使って多数のパーティクルを管理する方法を学びました。
2. **Pointsの使用**: 多数の点を効率的にレンダリングする方法を学びました。
3. **動的な更新**: パーティクルの位置をフレームごとに更新する方法を学びました。
4. **ユーザーインタラクション**: マウスの動きに反応するインタラクティブな要素を導入する方法を学びました。
5. **パーティクルシステムの応用**: パーティクルシステムを使って様々な視覚効果を表現する方法を学びました。

このサンプルは、Three.jsでのパーティクルシステムとユーザーインタラクションの基本を示す良い例となっています。特に、多数のパーティクルを効率的に管理し、動的に更新する方法は、より複雑な視覚効果を実現する際に非常に有用です。

---

## 9. 次のステップ

`usecase-011` を理解したら、次のステップとして以下のような発展が考えられます：

1. **テクスチャの使用**: パーティクルにテクスチャを適用して、より複雑な形状を表現する。
2. **物理シミュレーション**: 重力や衝突などの物理法則に基づいてパーティクルを動かす。
3. **パーティクルの生成と消滅**: 時間経過とともにパーティクルを生成したり消滅させたりする。
4. **複数のインタラクション**: クリック、ドラッグ、キーボード入力など、様々な方法でパーティクルと対話する。
5. **シェーダーの使用**: カスタムシェーダーを使って、より高度な視覚効果を実現する。

これらの発展は、今後のユースケースで順次紹介していく予定です。`usecase-011` で学んだパーティクルシステムとユーザーインタラクションの基本を応用することで、より高度な3D表現へと進んでいきましょう。
