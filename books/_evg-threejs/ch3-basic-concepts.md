---
title: 基本的な仕組みと概念
free: true
---

# Three.js Everyday Season 01 - Basic Concepts

Three.jsの概要や開発環境の整え方を学んだら、いよいよその核心を理解するステージに入ります。本章では、Three.jsがどのように3Dを描画し、どのようにオブジェクトやカメラなどを扱うのか――その基本的な仕組みと概念を、じっくり掘り下げていきましょう。

これから先は多くの専門用語が登場し、初めて3Dプログラミングに触れる方にはやや抽象的に感じる部分もあるかもしれません。しかし、3Dの世界観やルール、Three.jsが提供する主要なクラスや機能をしっかりと押さえることで、「なんとなくコードを写経して動かす」だけの状態から抜け出し、自由自在に3D表現をコントロールできる段階へステップアップできます。

本文中では随所にThree.jsの基礎から応用までを丁寧に紹介した「handson-threejs」プロジェクトの内容や構成を参照しつつ、さまざまなサンプルやヒントを共有していきます。長文ではありますが、途中で休憩しながら読み進めてみてください。目標は **「Three.jsの主要構造と基本クラスを理解し、自分のアイデアに応じて扱えるようになる」** ことです。

## 1. Three.jsの世界観

### 1-1. シーン、カメラ、レンダラーの関係性

Three.jsにおける最重要キーワードは、Scene（シーン）、Camera（カメラ）、そして **Renderer（レンダラー）** です。これら3つがそろわないと、ブラウザ上に3Dを描画することはできません。「handson-threejs」プロジェクトでも最初に出てくるエントリーポイントで、必ずこれらを初期化しているのが確認できるでしょう。
	•	Scene: 3D空間の入れ物
すべてのオブジェクト、ライト、カメラなどが存在する「ステージ」のような役割を果たします。実際のステージで言えば背景に相当し、配置されるオブジェクト（役者や小道具）はシーンに紐づきます。
	•	Camera: 観測者（ユーザー）の視点
3D空間をどのような視点（位置・角度）から見ているかを決定する要素です。Three.jsでは遠近感のあるPerspectiveCameraと、遠近感を排したOrthographicCameraが代表的です。
	•	Renderer: シーンとカメラをもとに絵を描画する
WebGL（またはCanvasやSVG）を用いて、シーンとカメラが定義する空間の最終イメージをブラウザ上にレンダリングします。標準的にはWebGLRendererを使うことがほとんどです。

フローイメージ
	1.	Sceneに3Dオブジェクトを追加
	2.	Cameraでそのシーンをどの角度から見るか設定
	3.	Rendererで描画してキャンバスに映し出す

この3ステップが、最低限のThree.jsアプリの核となります。

### 1-2. Three.jsが提供する抽象化

Three.jsはWebGLを抽象化して扱いやすくしたライブラリです。WebGLを直接触ると、頂点シェーダーやフラグメントシェーダー、コンテキストの初期化、バッファオブジェクト管理など、低レベルなAPIに多くの手間を取られます。しかしThree.jsでは、ジオメトリ（形状）とマテリアル（質感）、それらを組み合わせたメッシュという概念が導入され、ライトやカメラもオブジェクトとして管理されます。結果的に、3D空間の構築やアニメーションを直感的に記述しやすくなっています。

## 2. Scene（シーン）を理解する

### 2-1. シーンの役割

Three.jsのSceneクラスは、3D空間を表す最上位のオブジェクトです。シーンは「すべての3D要素を階層的に管理するルート」であり、メッシュやライト、フォグ、背景などを保有します。sceneを生成し、そこへscene.add(object)することで、オブジェクトをどんどん空間に配置できます。

```

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // 背景色の設定

```

### 2-2. シーングラフ（Scene Graph）

Three.jsはシーングラフ構造を採用しており、各オブジェクトが階層構造（親子関係）を持ちます。あるメッシュを親オブジェクトにし、その子要素として別のメッシュを追加すれば、親メッシュを回転させたときに子メッシュも一緒に回転するといった挙動が簡単に実現できます。

親子関係の例

```

// 親メッシュ（親オブジェクト）
const parentMesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
scene.add(parentMesh);

// 子メッシュ（親の子供）
const childMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x0000ff })
);
parentMesh.add(childMesh);

// 親を回転させると、子も一緒に回転する
parentMesh.rotation.y = Math.PI * 0.25;

```


parentMesh.add(childMesh)のようにして親子関係を築き、シーン全体はそれらの階層的な要素を最終的に管理しています。もちろん深いネストも可能です。

### 2-3. フォグや背景

Sceneには、背景色や背景テクスチャを設定することができます。さらに、遠方が霧のように見えるFog機能も含まれています。

```

// 背景色を白に設定
scene.background = new THREE.Color(0xffffff);

// フォグを導入（シーン全体が霧に包まれたような効果）
scene.fog = new THREE.Fog(0xffffff, 1, 20); 

```

Fogを使うときは、近距離から遠距離に向かって徐々にオブジェクトが白く（上記例の場合）霞んでいきます。広い空間を演出したいときなどに便利です。

## 3. Camera（カメラ）を理解する

### 3-1. カメラの種類

Three.jsには大きく分けて以下のカメラが用意されています。
	1.	PerspectiveCamera: 遠近感を表現する一般的な3Dカメラ
	2.	OrthographicCamera: 遠近感のない平行投影カメラ（CADツールなどでよく見られる）

最もよく使われるのはPerspectiveCameraで、オブジェクトがカメラから遠ざかるにつれて縮小表示される（遠近感が付与される）ため、自然な3D視覚表現が得られます。

```

const camera = new THREE.PerspectiveCamera(
  75, // 視野角 (Field of View: FOV)
  window.innerWidth / window.innerHeight, // アスペクト比
  0.1, // ニアクリップ
  1000 // ファークリップ
);
camera.position.set(0, 1, 5); // カメラ位置

```

パラメータ解説
	•	FOV (Field of View): カメラが捉える範囲の角度。値が大きいほど魚眼レンズのように広い範囲を映すが、遠近の歪みが大きくなる。
	•	Aspect: 描画領域の横幅/高さ。画面リサイズ時に合わせて更新する必要がある。
	•	Near / Far: ニアクリップ面・ファークリップ面。これより手前、またはこれより奥のオブジェクトはカメラに映らなくなる（描画されない）。

### 3-2. OrthographicCamera

一方、OrthographicCameraは遠近感のない投影を行います。たとえば2DのUIや、正面図・側面図などの確認用として用いる場合があります。

```

const left = -10;
const right = 10;
const topValue = 10;
const bottom = -10;
const near = 0.1;
const far = 1000;

const orthoCamera = new THREE.OrthographicCamera(
  left, right, topValue, bottom, near, far
);
orthoCamera.position.set(0, 10, 10);
orthoCamera.lookAt(new THREE.Vector3(0, 0, 0));

```

以上のように、視野領域を数値で指定する必要があります。たとえば、left = -10かつright = 10であれば、X軸方向は-10から+10までがカメラに映る範囲となり、オブジェクトが遠くにあろうと同じ大きさで描画されます。

### 3-3. カメラの制御

通常、Three.jsで3D空間を閲覧するときは、マウス操作などでカメラを回転・ズームさせる操作を実装することが多いです。「handson-threejs」や公式Examplesでも登場するOrbitControlsを使うと、以下のように簡単にカメラ操作が導入できます。

```

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ...

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 慣性を効かせる

function animate() {
  requestAnimationFrame(animate);
  controls.update(); // 毎フレーム呼ぶ
  renderer.render(scene, camera);
}
animate();

```

OrbitControlsはカメラに対する回転、ズーム、平行移動などをマウス操作で実装してくれます。3D空間を自由に見回せるので、デバッグ用途にも便利です。

## 4. Renderer（レンダラー）を理解する

### 4-1. WebGLRenderer

Three.jsのメインレンダラーはWebGLRendererです。HTML5の<canvas>要素にWebGLコンテキストを生成し、GPUを使って高速な3D描画を行います。設定やオプションが多数存在しますが、まずは最もシンプルな例から。

```

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

```

•	antialias: trueにすると、ジオメトリのエッジなどが滑らかに描画される。
•	setSize(width, height): 描画領域のサイズを指定。ブラウザ全体を使うならwindow.innerWidthとwindow.innerHeightを設定。

### 4-2. ピクセル比と高解像度対応

Retinaディスプレイなど、高解像度のデバイスを使っているときには、renderer.setPixelRatio(window.devicePixelRatio)と設定しておくと見た目がシャープになります。しかし、極端に大きいdevicePixelRatioだとパフォーマンスが落ちる可能性もありますので注意が必要です。

```

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

```

### 4-3. レンダリングループ

Three.jsでアニメーションを実装するには、基本的にブラウザのrequestAnimationFrameを使って毎フレーム描画を更新します。典型的なコードは以下のようになります。

```

function animate() {
  requestAnimationFrame(animate);

  // 何らかのアニメーション処理や更新処理
  mesh.rotation.y += 0.01;

  renderer.render(scene, camera);
}
animate();

```

renderer.render(scene, camera);を呼び出すたびに、シーンの現在の状態がカメラ視点で描画されます。これを1秒間に60回（環境によってはそれ以上/以下）呼び出せば、スムーズに動く3Dシーンが実現するわけです。

## 5. Geometry（ジオメトリ）とMaterial（マテリアル）

### 5-1. 形状（ジオメトリ）の基本

Three.jsでは「形状」を表すクラスとしてBufferGeometryがベースになっており、そこから派生したプリミティブジオメトリ（BoxGeometry, SphereGeometry, PlaneGeometryなど）が用意されています。handson-threejsプロジェクトでも、初歩の段階でこうしたプリミティブジオメトリを使ってオブジェクトを作成する例を多く紹介しています。

```

const boxGeom = new THREE.BoxGeometry(1, 1, 1); // 幅・高さ・奥行きが1の立方体
const sphereGeom = new THREE.SphereGeometry(1, 32, 32); // 半径1、セグメント数32
const planeGeom = new THREE.PlaneGeometry(5, 5); // 横5×縦5の平面

```

### 5-2. マテリアルの基本

マテリアルは、オブジェクトの「見た目」を決定する要素（色・反射率・質感など）を定義します。代表的なものにMeshBasicMaterial, MeshStandardMaterial, MeshPhongMaterial, MeshLambertMaterialなどがあり、簡易的なものから物理ベースレンダリング（PBR）を扱うものまで多彩です。

```

const basicMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const standardMat = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  metalness: 0.5,
  roughness: 0.2,
});

```

•	MeshBasicMaterial: ライティングの影響を受けず、単純な色やテクスチャを表示する
•	MeshStandardMaterial: PBRベース。物理的に正しい光の反射をシミュレートする。metalnessやroughnessが設定可能
•	MeshPhongMaterial: 古いスペキュラーベースのライティング手法。ハイライト表現などが簡単
•	MeshLambertMaterial: より軽量なライティングモデル（Lambertian）

### 5-3. メッシュ（Mesh）

ジオメトリ（形状）とマテリアル（質感）を組み合わせると、Meshという描画可能なオブジェクトが生成されます。

```

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const standardMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cubeMesh = new THREE.Mesh(boxGeometry, standardMaterial);
scene.add(cubeMesh);

```

このcubeMeshをシーンに追加することで、3D空間に「緑色の立方体」が現れます。あとは、カメラやライトの設定次第で、よりリアルな見た目になったり影がついたりします。

## 6. Lighting（ライティング）を理解する

### 6-1. ライトの種類

3Dシーンをリアルに見せるうえで不可欠なのがライトです。Three.jsには多数のライトクラスが存在し、それぞれが異なる光源特性を持ちます。主なものを挙げると:
	1.	AmbientLight: 環境光。シーン全体を均一に照らす。影はできない。
	2.	DirectionalLight: 平行光源。太陽光のように一定方向から差す光。影あり。
	3.	PointLight: 点光源。電球のように周囲全方向に光を放つ。影あり。
	4.	SpotLight: スポットライト。一定の角度で照射範囲が限定される。影あり。
	5.	HemisphereLight: 半球光。空（上方向）と地面（下方向）からのライトをシミュレート。

### 6-2. 代表的なライトの使い方

```

// 環境光：全体をうっすら照らす
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// 平行光：強めに当てる（太陽光っぽい）
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

```

AmbientLightだけだとオブジェクトがベタ塗りで影や立体感が出ないため、一般的にはDirectionalLightやPointLightなど、方向性のある光を組み合わせるのが基本です。

### 6-3. 影のレンダリング

Three.jsで影を描画するには、レンダラーとライト、メッシュごとに影の有効化を指定する必要があります。

```

// 1. レンダラーで影を有効にする
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 影を柔らかくする設定例

// 2. ライトに対して影の有効化
directionalLight.castShadow = true; 
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;

// 3. オブジェクト側でも影の有効/受けの指定
cubeMesh.castShadow = true; // 影を落とす側
planeMesh.receiveShadow = true; // 影を受ける側

```

•	castShadow: そのオブジェクトが影を落とすかどうか
•	receiveShadow: そのオブジェクトが影を受け取るかどうか

これを正しく設定すると、床（plane）にキューブの影が落ちるなど、リアルなライティング表現が可能になります。

## 7. 空間変換と座標系

### 7-1. 座標系の基本

Three.jsは、右手座標系を採用しています。初期状態ではカメラから見て、X軸が横方向、Y軸が上方向、Z軸が奥行き方向（手前がZのマイナス）となるのが一般的な解釈です。
オブジェクトをシーンに配置する際は、mesh.position.set(x, y, z)で位置を指定し、mesh.rotation.set(rx, ry, rz)やmesh.scale.set(sx, sy, sz)で回転・拡大縮小を指定します。

```

cubeMesh.position.set(2, 1, -3);
cubeMesh.rotation.set(0, Math.PI / 4, 0);
cubeMesh.scale.set(1, 2, 1);

```

### 7-2. 行列変換

Three.js内部では、オブジェクトの位置・回転・拡大縮小を行列変換として扱っています。通常は行列を意識せずにposition, rotation, scaleを使えばOKですが、複雑な動きをさせる際には行列を直接操作する場合もあります。

```

cubeMesh.matrixAutoUpdate = false;
// 必要に応じて自分で行列を設定する
cubeMesh.matrix.makeTranslation(2, 1, -3);
// ...など

```

ただし、行列を直接扱うのは上級テクニック寄りです。通常はposition/rotation/scaleを使った方が直感的にわかりやすいです。

## 8. アニメーションと更新処理の基礎

### 8-1. requestAnimationFrame

前述のとおり、Three.jsでアニメーションを実装する場合は、requestAnimationFrameを使って毎フレームごとにオブジェクトの状態を更新→レンダリングという流れを回します。以下の例では、キューブをX軸・Y軸で回転させ続ける実装をしています。

```

function animate() {
  requestAnimationFrame(animate);

  // 毎フレーム実行される更新処理
  cubeMesh.rotation.x += 0.01;
  cubeMesh.rotation.y += 0.01;

  renderer.render(scene, camera);
}
animate();

```

### 8-2. Delta Time（経過時間）の活用

より物理的に正しい動きを実装するには、前フレームからの経過時間（Delta Time）を考慮します。clock.getDelta()を使うと、1フレームにかかった時間を秒単位で取得可能です。

```

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta(); // 前フレームとの経過時間（秒）
  // 回転スピードを秒基準で適用（1秒あたり45度回転：Math.PI/4）
  cubeMesh.rotation.x += (Math.PI / 4) * delta;
  cubeMesh.rotation.y += (Math.PI / 4) * delta;

  renderer.render(scene, camera);
}
animate();

```

こうすることで、フレームレートが低い環境でも高い環境でも同じ速度で動くようになり、カクつきや動きの速さの差を吸収できます。

## 9. ヘルパーオブジェクトとデバッグ

### 9-1. AxesHelper

座標軸を可視化するのに便利なのがAxesHelperです。引数には軸の長さを指定します。

```

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

```

画面内にX（赤）, Y（緑）, Z（青）の軸が表示されるため、オブジェクトをどう配置すべきか把握しやすくなります。

### 9-2. GridHelper

地面や向きを確認するのにGridHelperを表示するのも定番です。以下のように使います。

```

const gridHelper = new THREE.GridHelper(30, 30);
scene.add(gridHelper);

```

30×30のグリッドが敷かれ、中央が(0,0,0)であることが一目でわかるようになります。

### 9-3. CameraHelper / LightHelper

カメラやライトの可視化ヘルパーも存在します。

```

// CameraHelper
const cameraHelper = new THREE.CameraHelper(camera);
scene.add(cameraHelper);

// LightHelper
const lightHelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(lightHelper);

```

DirectionalLightHelperなどを使うと、ライトの向きや位置がどこになっているかを直感的に確認できます。

## 10. Group（グループ）を使ったオブジェクト管理

THREE.Groupクラスは、複数のメッシュやライトなどをまとめて管理するためのオブジェクトです。シーングラフの親オブジェクトとしてGroupを用意し、その下に様々な子オブジェクトを配置すれば、全体をまとめて位置や回転を操作できます。

```

const group = new THREE.Group();
scene.add(group);

const box = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);

group.add(box);
group.add(sphere);

// グループごと回転
group.rotation.y = Math.PI * 0.5;

```

「handson-threejs」プロジェクトの例でも、複数のパーツをまとめて動かす表現などでGroupが頻繁に使用されています。オブジェクト構成が増えてきたらGroupで整理するとよいでしょう。

## 11. インタラクションとイベント

### 11-1. マウスイベントとRaycaster

Three.jsではRaycasterを用いてクリックしたオブジェクトを特定することができます。マウス座標を正規化デバイス座標（-1〜+1）に変換し、レイをシーンに飛ばしてどのオブジェクトと交差したかを判定します。

```

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  // マウス座標を正規化
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    // 最も手前にあるオブジェクトにアクセス
    const hitObject = intersects[0].object;
    hitObject.material.color.set(0xffff00); 
  }
});

```

このようにユーザーがクリックした対象メッシュを特定し、色を変えたりアニメーションさせたりしてインタラクションを実装できます。

### 11-2. キーボード操作

一般的にはwindow.addEventListener('keydown', ...)を使い、キーコードに応じてカメラやオブジェクトを移動させるなどの処理を記述します。

```

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    cube.position.x -= 0.1;
  } else if (event.key === 'ArrowRight') {
    cube.position.x += 0.1;
  }
});

```

ゲームのような操作感を実装したい場合は、状態管理を行いながらフレームごとに更新処理を書く形になります（例えば、押しっぱなしで移動し続けるなど）。

## 12. バリエーション豊かなGeometry

### 12-1. 基本のプリミティブ

Three.jsで用意されている代表的なジオメトリには以下があります。
•	BoxGeometry / SphereGeometry / PlaneGeometry
•	CylinderGeometry / ConeGeometry / TorusGeometry
•	CircleGeometry / RingGeometry / TorusKnotGeometry

他にも多数ありますが、「handson-threejs」プロジェクトでもこれらのジオメトリを組み合わせてシンプルな形状のオブジェクトを作り、徐々にシーンを賑やかにしていく例が多く取り上げられています。最初はプリミティブだけでも十分に面白い表現を作ることができます。

### 12-2. BufferGeometryと属性

BoxGeometryなどは内部でBufferGeometryを継承しており、頂点データ（Position, Normal, UVなど）をBufferAttributeとして保持しています。自作のジオメトリを作成したい場合や頂点をダイナミックに操作したい場合は、BufferGeometryを直接扱います。

```

// 頂点3つ (三角形) の単純なジオメトリを手動で作る例
const positions = new Float32Array([
  // x,   y,   z
   0.0, 0.5, 0.0,
  -0.5,-0.5, 0.0,
   0.5,-0.5, 0.0
]);

const geometry = new THREE.BufferGeometry();
const positionAttribute = new THREE.BufferAttribute(positions, 3);
geometry.setAttribute('position', positionAttribute);

```

このようにして低レベルに頂点情報を定義できるのがThree.jsの特徴の一つです。カスタムの波打つ平面や、頂点シェーダーでアニメーションするメッシュを作りたいときに活きてきます。

## 13. テクスチャとマテリアルの応用

### 13-1. テクスチャの読み込み

Three.jsでは、TextureLoaderを用いて画像ファイルを読み込み、マテリアルのmapなどに割り当てることでテクスチャを貼り付けられます。

```

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('path/to/texture.jpg');

const material = new THREE.MeshStandardMaterial({
  map: texture,
});

```

handson-threejsプロジェクトでもテクスチャを活用して、よりリアルな見た目を作る例が多数あります。画像形式としては、JPGやPNGだけでなく、HDR（高ダイナミックレンジ）テクスチャを使った環境マッピングなども可能です。

### 13-2. 各種マップの活用

PBRをサポートするMeshStandardMaterialでは、以下のようなマップを適用することで材質表現を格段にリッチにできます。
	•	normalMap: 法線マップ（凹凸感）
	•	roughnessMap: ラフネスマップ（表面の荒さ）
	•	metalnessMap: 金属度マップ
	•	envMap: 環境マップ（反射環境）

これらを組み合わせると、金属感ある表現やマットな質感などが自在に表現できます。

## 14. シェーダーへの入り口

### 14-1. カスタムシェーダーを書ける

Three.jsでは、ShaderMaterialやRawShaderMaterialを使うと、自作のGLSL（シェーダー言語）を組み込み、より高度なビジュアル表現が可能になります。通常のマテリアルではできない特殊効果やアニメーションを実現したい場合に有効です。

```

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(vUv, 0.5, 1.0);
  }
`;

const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader
});

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  shaderMaterial
);
scene.add(plane);

```

この例では頂点シェーダーでUV座標をvarying変数としてフラグメントシェーダーに渡し、フラグメントシェーダーでvUvを使って色を決定しています。シェーダーを書くと、多彩なアニメーションやポストエフェクトも含め、3D表現の幅が一気に広がります。

### 14-2. three.js + GLSL の学習ステップ
	1.	既存のマテリアルで十分ならばまずそれを使う
	2.	**MeshStandardMaterial等の拡張機能（onBeforeCompile）** で一部だけカスタマイズする
	3.	ShaderMaterialやRawShaderMaterialをフルで使う

「handson-threejs」でも、後半の上級トピックでシェーダーを使ったオリジナルのエフェクトなどを紹介しており、実用例が満載です。最初は難しく感じるかもしれませんが、一歩ずつステップアップしていきましょう。

## 15. アニメーションライブラリや外部ライブラリとの連携

### 15-1. GSAPとの組み合わせ

Three.js単独でもアニメーションはできますが、GSAP（GreenSock Animation Platform）のようなアニメーションライブラリを使うと、よりシンプルにイージングやタイムラインを管理できます。

```

gsap.to(cube.rotation, {
  x: Math.PI * 2,
  duration: 2,
  ease: "power2.inOut",
  repeat: -1, // 無限リピート
  yoyo: true,
});

```

Three.jsのオブジェクトはJSオブジェクトとして各プロパティを持っているため、GSAPのtoやfromなどで数値を補間すれば、滑らかなアニメーション制御が簡単です。

### 15-2. physics: cannon-esやammo.js

物理シミュレーションを導入したい場合は、cannon-esやammo.jsなどの物理エンジンと組み合わせるのが一般的です。剛体（Rigid Body）や衝突判定、重力などを考慮した動きが再現できます。「handson-threejs」でも、落下物がぶつかり合うなどの物理デモが紹介されることがあります。

```

// cannon-es の例
import * as CANNON from 'cannon-es';

// 1. ワールド作成
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// 2. 剛体作成
const shape = new CANNON.Sphere(0.5);
const body = new CANNON.Body({
  mass: 1,
  shape: shape,
});
world.addBody(body);

// 3. Three.js側のメッシュと同期
function animate() {
  requestAnimationFrame(animate);
  world.step(1/60);

  mesh.position.copy(body.position);
  mesh.quaternion.copy(body.quaternion);

  renderer.render(scene, camera);
}
animate();

```

こうして物理エンジンのワールド更新とThree.jsの描画を同期させることで、リアルな動きの3Dシーンを作ることができます。

## 16. ポストプロセッシング

### 16-1. EffectComposerを使った後処理

Three.jsの標準マテリアルでも大半の表現が可能ですが、被写界深度（DOF）やブラー効果、ゴッドレイなどを実装したい場合はポストプロセッシングという手法を使います。EffectComposerとShaderPassを組み合わせ、描画後に追加のエフェクトをかける仕組みです。

```

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new GlitchPass());

// アニメーションループでcomposer.render()を呼ぶ
function animate() {
  requestAnimationFrame(animate);
  composer.render();
}
animate();

```

RenderPassで通常描画を行い、その結果に対してGlitchPassなどの特殊効果を適用して最終出力を得ます。ほかにもBloomPass, FilmPassなど豊富なパスが存在し、自分でカスタムシェーダーを組んで追加することも可能です。

## 17. 「handson-threejs」プロジェクトに見る基本的な流れ

「handson-threejs」では、以下のようなステップを踏んで基本概念を網羅していく構成が多いです。
	1.	Scene, Camera, Rendererの初期化
	2.	プリミティブジオメトリやモデルをロードして配置
	3.	Lightsを設置し、影を有効化
	4.	OrbitControlsなどでカメラ操作を可能にする
	5.	アニメーションループでオブジェクトやカメラを更新
	6.	デバッグ用ヘルパーを表示・調整
	7.	必要に応じてRaycasterやイベントを使ったインタラクション追加
	8.	GUIツール(dat.GUIなど)を用いてパラメータをリアルタイムに調整
	9.	ポストプロセッシングやシェーダーで見た目を強化

順を追って実装していくうちに、Three.jsの基本構造を自然と理解できます。この章でも取り上げた個々の要素（Scene, Camera, Renderer, Geometry, Material, Lights, Controls, Raycaster, PostProcessingなど）は、すべて繋がっており、組み合わせ次第で無限の表現が可能になります。

## 18. Three.jsのパフォーマンスと最適化

### 18-1. レンダリング負荷を下げるコツ
	•	モデルのポリゴン数を減らす（適切なLOD：Level of Detailを活用）
	•	テクスチャサイズを最適化する（大きなテクスチャは読み込みと描画で負荷増大）
	•	影の設定を厳選する（影は描画負荷が高い）
	•	インスタンシングの活用（大量の同一メッシュを効率的に描画）

### 18-2. フレームレートの監視

開発中にはStats.jsやdat.GUI（またはlil-gui）を使ってフレームレートを監視しながらチューニングするのが一般的です。パフォーマンスが落ちてきたら原因を探り、小さなサンプルで再現テストを行うことが重要です。

```

// Statsの導入例
import Stats from 'three/examples/jsm/libs/stats.module.js';

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update(); // フレームレート測定
}

```

## 19. レスポンシブ対応とウィンドウリサイズ

### 19-1. ウィンドウのリサイズ検知

ブラウザのウィンドウサイズが変更された際には、カメラとレンダラーのサイズを再調整してやらなければなりません。典型的には以下のようなコードが使われます。

```

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // カメラのアスペクト比更新
  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  // レンダラーのサイズ更新
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

```

モバイルなどでも正しく表示されるようにレスポンシブ対応しておくことで、ユーザー体験を損なわない3Dコンテンツを提供できます。

## 20. まとめと次章へのブリッジ

ここまでがThree.jsの基本概念に関する総合的な説明でした。本章は非常に長い内容となりましたが、要点を振り返ってみましょう。
	1.	Scene, Camera, Renderer: Three.jsの三本柱。
	2.	Scene: オブジェクトやライトを格納する空間。シーングラフで階層管理。
	3.	Camera: 視点を決定。PerspectiveCameraとOrthographicCameraが主流。
	4.	Renderer: WebGLRendererで実際に描画。リサイズやピクセル比の扱いに注意。
	5.	Geometry & Material: 形状と質感を組み合わせてメッシュを生成。PBRやテクスチャで表現力アップ。
	6.	Lighting: AmbientLight, DirectionalLightなどを組み合わせてリアルな見た目に。影描画時は各種設定が必須。
	7.	座標系・行列変換: オブジェクトのposition/rotation/scaleを理解し、シーングラフを活用。
	8.	アニメーション: requestAnimationFrameループで毎フレーム描画。Delta Timeで時間制御も可能。
	9.	Raycasterやイベント: ユーザー入力（クリックやキーボード）を使ってインタラクティブに。
	10.	ShaderMaterial: カスタムシェーダーでさらに高度な表現。
	11.	ポストプロセッシング: EffectComposerなどで映像効果を追加。
	12.	パフォーマンス最適化: モデルやテクスチャの工夫、フレームレート監視など。
	13.	レスポンシブ: ウィンドウリサイズ時の処理を忘れずに。

今後のチャプターでは、これらの基礎をもとにより実践的な使い方（「Basic Usage」や「usecase-001」など）を学んでいきます。具体的なコード例を通じて、3Dシーンを組み立て、アニメーションし、インタラクティブに操作する一連の流れが見えてくるはずです。

次章「Basic Usage」では、今回紹介した基本概念を踏まえたうえで、もう少し発展的なアニメーションパターンやUI連携、リアルタイムでのパラメータ変更などに踏み込んだ解説を行います。ぜひ引き続き学習を進めてください。

## 21. （おまけ）これから先の学習に役立つリファレンスやリンク
	1.	Three.js公式リファレンス
	•	最新版に対応したメソッドリファレンス。日本語翻訳も有志で進行中。
	2.	Three.js公式Examples
	•	多数のデモがあり、ソースコードもすべて公開されている。
	3.	handson-threejsリポジトリ
	•	（実際のURLはプロジェクトに応じて）書籍やチュートリアルと連携しながら進めるサンプルコードが詰まっている。
	4.	MDN WebGL Fundamentals
	•	Three.jsのさらに基礎となるWebGLの仕組みを知りたい場合に。
	5.	Discover three.js
	•	英語だが、初心者向けに丁寧な解説があり、チュートリアルも多い。

着実にこのBasic Conceptsを押さえていけば、Three.jsで作れるものの幅が一気に広がります。 それでは次章「Basic Usage」で具体的な実装例をさらに深めていきましょう！
