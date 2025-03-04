---
title: Usecase-007 Color-Changing Octahedron
free: true
---
# Usecase-007: Color-Changing Octahedron

**本章では、`usecases/usecase-007` ディレクトリに格納されている「Color-Changing Octahedron」のコードを解説します。**  
このサンプルは、八面体（Octahedron）が回転しながら色が周期的に変化するシーンです。前章までの様々なジオメトリとアニメーション技術を踏まえつつ、新たなジオメトリである八面体と、マテリアルの色を動的に変化させる手法を組み合わせた例となっています。

---

## 1. Octahedronとは？

Octahedron（八面体）は、8つの三角形の面を持つ正多面体です。Three.jsでは `THREE.OctahedronGeometry` クラスとして実装されており、以下のような特徴があります：

- 8つの正三角形の面
- 6つの頂点
- 12の辺
- 各頂点から4つの辺が伸びる
- 正八面体は、すべての面が合同な正三角形

`usecase-007` では、この八面体を使って、回転しながら色が変化するアニメーションを実装しています。これは前章までの回転アニメーションに、マテリアルの色を動的に変化させる新しい要素を加えたものです。

---

## 2. `usecase-007/index.js` コード詳細

それでは、実際の `usecase-007` のコードを詳しく見ていきましょう。

```js
// usecase-007/index.js

import { UseCaseBase } from "../../core/UseCaseBase";
import * as THREE from "three";

export default class GeometryShowcase007 extends UseCaseBase {
  static metadata = {
    id: "007",
    title: "Color-Changing Octahedron",
    description: "An octahedron with cycling colors",
    categories: ["Geometry", "Animation"],
  };

  constructor(scene) {
    super(scene);
    this.objects = new Set();
    this.time = 0;
  }

  static setupScene(scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(ambientLight, directionalLight);

    const geometry = new THREE.OctahedronGeometry(1);
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return { objects: [mesh], geometries: [geometry] };
  }

  static updateObjects(objects, time, deltaTime = 0.016) {
    objects[0].rotation.y += deltaTime;
    objects[0].material.color.setHSL(time % 1, 0.5, 0.5);
  }

  async init() {
    const { objects } = GeometryShowcase007.setupScene(this.scene);
    objects.forEach((obj) => this.objects.add(obj));
  }

  update(deltaTime) {
    this.time += deltaTime;
    GeometryShowcase007.updateObjects(
      Array.from(this.objects),
      this.time,
      deltaTime
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
  id: "007",
  title: "Color-Changing Octahedron",
  description: "An octahedron with cycling colors",
  categories: ["Geometry", "Animation"],
};
```

- ギャラリーや検索機能で使用する**シーンのメタ情報**を定義。
- `id` は `007`、 `title` は「Color-Changing Octahedron」など。
- `description` には、八面体の色が変化することについて言及されています。

### 2-2. `setupScene(scene)`

```js
static setupScene(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(ambientLight, directionalLight);

  const geometry = new THREE.OctahedronGeometry(1);
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return { objects: [mesh], geometries: [geometry] };
}
```

前章の `usecase-006` との主な違いは以下の点です：

1. **ジオメトリの変更**:
   ```js
   // usecase-006
   const geometry = new THREE.TetrahedronGeometry(1);
   
   // usecase-007
   const geometry = new THREE.OctahedronGeometry(1);
   ```
   
   `THREE.OctahedronGeometry` は、八面体を作成するためのジオメトリです。引数は以下の通りです：
   - 第1引数: 半径（この場合は1）
   - 第2引数: 詳細度（省略されているため、デフォルトの0）

2. **マテリアルの色**:
   ```js
   // usecase-006
   const material = new THREE.MeshPhongMaterial({ color: 0x00ff88 });
   
   // usecase-007
   const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
   ```
   
   ライトグリーン色（`0x00ff88`）から白色（`0xffffff`）に変更されています。これは、後で色を動的に変化させるための初期値として白色を設定しています。

### 2-3. `updateObjects(objects, time, deltaTime)`

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].rotation.y += deltaTime;
  objects[0].material.color.setHSL(time % 1, 0.5, 0.5);
}
```

ここでの主な特徴は以下の点です：

1. **回転**:
   ```js
   objects[0].rotation.y += deltaTime;
   ```
   
   Y軸周りの回転を標準速度（`deltaTime`）で行っています。

2. **色の変化**:
   ```js
   objects[0].material.color.setHSL(time % 1, 0.5, 0.5);
   ```
   
   `setHSL()` メソッドを使って、HSL色空間で色を設定しています。引数は以下の通りです：
   - 第1引数: 色相（Hue）- `time % 1` で0から1の間を循環
   - 第2引数: 彩度（Saturation）- 0.5（中程度の彩度）
   - 第3引数: 明度（Lightness）- 0.5（中程度の明るさ）
   
   `time % 1` により、時間経過とともに色相が0から1の間を循環し、赤→黄→緑→青→紫→赤...と虹色のグラデーションで変化します。

この実装により、八面体がY軸周りに回転しながら、色が虹色のグラデーションで変化するアニメーションが実現されています。

### 2-4. `getThumbnailBlob()`

```js
static getThumbnailBlob() {
  // Create a simple SVG representation of a color-changing octahedron
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#111111"/>
      
      <!-- Octahedron representation with rainbow gradient -->
      <defs>
        <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff0000"/>
          <stop offset="16.6%" stop-color="#ff8800"/>
          <stop offset="33.3%" stop-color="#ffff00"/>
          <stop offset="50%" stop-color="#00ff00"/>
          <stop offset="66.6%" stop-color="#0088ff"/>
          <stop offset="83.3%" stop-color="#0000ff"/>
          <stop offset="100%" stop-color="#ff00ff"/>
        </linearGradient>
      </defs>
      
      <!-- Top pyramid -->
      <polygon points="100,60 140,100 100,100 60,100" fill="url(#rainbow)" stroke="#ffffff" stroke-width="1"/>
      
      <!-- Bottom pyramid -->
      <polygon points="100,140 140,100 100,100 60,100" fill="url(#rainbow)" opacity="0.8" stroke="#ffffff" stroke-width="1"/>
      
      <!-- Highlight -->
      <polygon points="100,60 110,80 90,80" fill="#ffffff" opacity="0.3"/>
    </svg>
  `;

  // Unicode-safe encoding
  const encodedSvg = unescape(encodeURIComponent(svgString));
  const dataURL = "data:image/svg+xml;base64," + btoa(encodedSvg);

  // Convert to Blob
  return fetch(dataURL).then((res) => res.blob());
}
```

サムネイル生成用のSVGが、八面体を表現するように変更されています。また、虹色のグラデーションを使用して、色が変化する様子を表現しています。

---

## 3. 前章との比較

`usecase-007` は前章までと基本的な構造は同じですが、以下の点が異なります：

1. **ジオメトリ**: TetrahedronGeometry から OctahedronGeometry に変更
2. **色**: 固定色から動的に変化する色に変更
3. **アニメーション**: 複数軸での高速回転から、単一軸回転と色の変化の組み合わせに変更
4. **サムネイル**: 四面体から八面体を表現するSVGに変更し、虹色のグラデーションを追加

特に重要なのは、**マテリアルの色を動的に変化させる手法**が導入された点です。これにより、形状の変化だけでなく、色の変化によるアニメーション表現が可能になります。

---

## 4. OctahedronGeometryの詳細

`THREE.OctahedronGeometry` は、正八面体を作成するためのジオメトリです。内部的には、球体を6つの頂点で近似した形状として実装されています。

```js
// OctahedronGeometryの基本的な使い方
const geometry = new THREE.OctahedronGeometry(radius, detail);
```

- **radius**: 八面体を内包する球の半径（デフォルト: 1）
- **detail**: 細分化レベル（デフォルト: 0）
  - 0: 基本的な八面体（8面）
  - 1以上: 各面をさらに細分化し、より球体に近づく

`usecase-007` では以下のパラメータを使用しています：

```js
const geometry = new THREE.OctahedronGeometry(1);
```

- 半径: 1
- 詳細度: 省略（デフォルトの0）

これにより、半径1の球に内接する基本的な八面体が作成されます。

### 4-1. OctahedronGeometryのバリエーション

```js
// 基本的な八面体
const octa1 = new THREE.OctahedronGeometry(1, 0);

// より大きな八面体
const octa2 = new THREE.OctahedronGeometry(2, 0);

// 細分化された八面体（より球体に近い）
const octa3 = new THREE.OctahedronGeometry(1, 1);

// さらに細分化された八面体
const octa4 = new THREE.OctahedronGeometry(1, 2);
```

詳細度を上げると、以下のような変化が起こります：

- **detail = 0**: 8つの三角形の面を持つ基本的な八面体
- **detail = 1**: 各面が4つの三角形に分割され、合計32面の多面体に
- **detail = 2**: さらに細分化され、より球体に近い形状に

詳細度を上げるほど滑らかな見た目になりますが、その分処理負荷も高くなります。用途に応じて適切な詳細度を選ぶことが重要です。

---

## 5. HSL色空間と色の変化

`usecase-007` の重要な特徴の一つは、HSL色空間を使って色を動的に変化させている点です。

```js
objects[0].material.color.setHSL(time % 1, 0.5, 0.5);
```

### 5-1. HSL色空間とは

HSL（Hue, Saturation, Lightness）色空間は、色を以下の3つの要素で表現します：

1. **色相（Hue）**: 色合い（赤、黄、緑、青、紫など）を0から1の値で表します。
   - 0.0: 赤
   - 0.17: 黄
   - 0.33: 緑
   - 0.5: シアン
   - 0.67: 青
   - 0.83: マゼンタ
   - 1.0: 赤（一周して元に戻る）

2. **彩度（Saturation）**: 色の鮮やかさを0から1の値で表します。
   - 0.0: 灰色（彩度なし）
   - 1.0: 鮮やかな色（最大彩度）

3. **明度（Lightness）**: 色の明るさを0から1の値で表します。
   - 0.0: 黒（光なし）
   - 0.5: 標準的な明るさ
   - 1.0: 白（最大の明るさ）

HSL色空間は、RGB色空間よりも直感的に色を操作できるため、アニメーションや色の変化を実装する際に便利です。

### 5-2. 時間に基づく色相の変化

`usecase-007` では、時間に基づいて色相を変化させています：

```js
objects[0].material.color.setHSL(time % 1, 0.5, 0.5);
```

`time % 1` は、時間を0から1の間に正規化する操作です。例えば：
- time = 0.5 → 0.5（色相は青緑）
- time = 1.0 → 0.0（色相は赤）
- time = 1.5 → 0.5（色相は青緑）
- time = 2.0 → 0.0（色相は赤）

これにより、時間経過とともに色相が0から1の間を循環し、赤→黄→緑→青→紫→赤...と虹色のグラデーションで変化します。

### 5-3. 彩度と明度の固定

`usecase-007` では、彩度と明度を0.5に固定しています：

```js
objects[0].material.color.setHSL(time % 1, 0.5, 0.5);
```

これにより、中程度の彩度と明るさの色が使用されます。彩度と明度を変更することで、以下のような効果を得ることができます：

- **彩度を上げる**: より鮮やかな色になります。
  ```js
  objects[0].material.color.setHSL(time % 1, 0.8, 0.5);
  ```

- **彩度を下げる**: よりくすんだ色になります。
  ```js
  objects[0].material.color.setHSL(time % 1, 0.2, 0.5);
  ```

- **明度を上げる**: より明るい色になります。
  ```js
  objects[0].material.color.setHSL(time % 1, 0.5, 0.7);
  ```

- **明度を下げる**: より暗い色になります。
  ```js
  objects[0].material.color.setHSL(time % 1, 0.5, 0.3);
  ```

---

## 6. 応用例：OctahedronGeometryと色の変化の拡張

`usecase-007` のコードをベースに、以下のような拡張が考えられます：

### 6-1. 八面体のパラメータを変更する

```js
// より大きな八面体
const geometry = new THREE.OctahedronGeometry(1.5, 0);

// 細分化された八面体
const geometry = new THREE.OctahedronGeometry(1, 1);
```

### 6-2. 色の変化パターンを変更する

```js
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].rotation.y += deltaTime;
  
  // より速い色の変化
  objects[0].material.color.setHSL((time * 2) % 1, 0.5, 0.5);
  
  // または、彩度と明度も変化させる
  const hue = time % 1;
  const saturation = 0.5 + Math.sin(time * 3) * 0.5; // 0～1の間で変動
  const lightness = 0.5 + Math.cos(time * 2) * 0.3; // 0.2～0.8の間で変動
  objects[0].material.color.setHSL(hue, saturation, lightness);
}
```

### 6-3. マテリアルを変更する

```js
// 物理ベースのマテリアル
const material = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 0.5,
  roughness: 0.2
});

// または、エミッシブマテリアル（自己発光）
const material = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  emissive: 0xffffff,
  emissiveIntensity: 0.5
});

// 更新関数で色と発光色を同時に変化
static updateObjects(objects, time, deltaTime = 0.016) {
  objects[0].rotation.y += deltaTime;
  
  const hue = time % 1;
  objects[0].material.color.setHSL(hue, 0.5, 0.5);
  objects[0].material.emissive.setHSL(hue, 0.5, 0.2);
}
```

### 6-4. 複数の八面体を配置する

```js
static setupScene(scene) {
  // 複数の八面体を作成
  const objects = [];
  const geometries = [];
  
  for (let i = 0; i < 5; i++) {
    const geometry = new THREE.OctahedronGeometry(0.5, 0);
    geometries.push(geometry);
    
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = i * 2 - 4;
    scene.add(mesh);
    objects.push(mesh);
  }
  
  return { objects, geometries };
}

static updateObjects(objects, time, deltaTime = 0.016) {
  // 各八面体に異なる色を適用
  objects.forEach((obj, i) => {
    obj.rotation.y += deltaTime;
    
    // 位相をずらした色の変化
    const hue = (time + i * 0.2) % 1;
    obj.material.color.setHSL(hue, 0.5, 0.5);
  });
}
```

---

## 7. 色の変化とアニメーション

色の変化は、形状の変化や位置の変化と同様に、アニメーションの重要な要素です。色の変化を使うことで、以下のような表現が可能になります：

### 7-1. 感情や状態の表現

色は感情や状態を表現するのに効果的です：

```js
// 興奮状態（赤色）から落ち着いた状態（青色）への変化
const excitementLevel = Math.max(0, 1 - time * 0.1); // 1から0へ徐々に減少
const hue = 0.67 + excitementLevel * 0.67; // 0.67（青）から0（赤）の間で変化
objects[0].material.color.setHSL(hue, 0.7, 0.5);
```

### 7-2. 警告や注意喚起

点滅するような色の変化で、警告や注意喚起を表現できます：

```js
// 赤と黄色の間で点滅
const isRed = Math.floor(time * 2) % 2 === 0;
const hue = isRed ? 0 : 0.17; // 0（赤）または0.17（黄）
objects[0].material.color.setHSL(hue, 0.7, 0.5);
```

### 7-3. 時間経過の表現

色の変化で時間経過を表現できます：

```js
// 緑（開始）から赤（終了）への変化
const progress = Math.min(1, time / 10); // 0から1へ10秒かけて変化
const hue = 0.33 * (1 - progress); // 0.33（緑）から0（赤）へ
objects[0].material.color.setHSL(hue, 0.7, 0.5);
```

### 7-4. 複数のオブジェクト間の関係性

色の変化で、複数のオブジェクト間の関係性を表現できます：

```js
// 2つのオブジェクトの色が互いに補色の関係になるように
objects[0].material.color.setHSL(time % 1, 0.7, 0.5);
objects[1].material.color.setHSL((time % 1 + 0.5) % 1, 0.7, 0.5); // 0.5ずらすと補色になる
```

---

## 8. まとめ

「**Usecase-007: Color-Changing Octahedron**」では、Three.jsの `OctahedronGeometry` を使って、色が変化する八面体を実装しました。

主なポイントは以下の通りです：

1. **OctahedronGeometryの使用**: 八面体を作成し、正多面体の一つである八面体の表現方法を学びました。
2. **HSL色空間の使用**: HSL色空間を使って、色相を時間の関数として変化させる方法を学びました。
3. **色のアニメーション**: 形状や位置だけでなく、色の変化によるアニメーション表現を実現しました。
4. **サムネイル生成**: 八面体と虹色のグラデーションを表現するSVGを作成し、ギャラリー表示に対応しました。

このサンプルは、Three.jsでのマテリアルの色を動的に変化させる方法を示す良い例となっています。特に、HSL色空間を使うことで、直感的に色の変化を制御できることを学びました。

---

## 9. 次のステップ

`usecase-007` を理解したら、次のステップとして以下のような発展が考えられます：

1. **他のマテリアルプロパティの変化**: 色だけでなく、反射率や粗さなどのマテリアルプロパティも動的に変化させる。
2. **テクスチャの使用**: 単色ではなく、テクスチャを使用し、テクスチャのパラメータを動的に変化させる。
3. **ユーザーインタラクション**: マウスやキーボードの入力に応じて、色や回転速度を変更できるようにする。
4. **パーティクルとの連携**: 八面体の色に合わせて、周囲にパーティクルを放出するエフェクトを追加する。

これらの発展は、今後のユースケースで順次紹介していく予定です。`usecase-007` で学んだ色のアニメーション技術を応用することで、より高度な3D表現へと進んでいきましょう。
