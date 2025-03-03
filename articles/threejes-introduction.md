---
title: "Three.jsをはじめよう！- Introduction"
emoji: "📐"
type: "tech"
topics: ["threejs","webgl","javascript","3d"]
published: true
---

# Three.jsをはじめよう！- Introduction

この記事では、ブラウザ上で動く3Dライブラリ **Three.js** の基礎や魅力についてご紹介します。WebGLの複雑な処理をラップしてくれるThree.jsを使えば、JavaScriptの初歩知識だけで簡単にリッチな3D表現を実装できるようになります。  

「なんだか難しそう…」と思われるかもしれませんが、はじめはほんの数行のコードからスタートできるのがThree.jsの良いところです。実際にサンプルコードを試しながら進めると、3Dプログラミングの楽しさをすぐに体感できるでしょう。

---

## 1. Three.jsって何が良いの？

### 1-1. WebGLをシンプルに使える

Three.jsは、ブラウザで3Dを描画するためのWebGL APIを高レベルに抽象化して提供してくれます。直感的にシーン（Scene）・カメラ（Camera）・メッシュ（Mesh）などを組み合わせるだけで、複雑な3D空間を気軽に扱えます。

### 1-2. 豊富な機能＆コミュニティ

- **豊富なジオメトリ・マテリアル**  
  BoxGeometryやSphereGeometry、MeshBasicMaterialやMeshStandardMaterialなどが標準搭載。
- **充実したドキュメント**  
  公式ExamplesやGitHubリポジトリには多くのサンプルがあり、ブログ記事やQiitaなどの日本語リソースも豊富です。
- **拡張性・応用範囲**  
  パーティクル、シェーダーカスタマイズ、物理演算との連携など、アイデア次第で幅広い表現が可能。

---

## 2. どんなときにThree.jsを使う？

- **製品の3Dビュー**  
  ブラウザでインストール不要。3Dモデルをくるくる回して確認できる
- **データビジュアライゼーション**  
  大規模データの可視化を3D空間でインタラクティブに行う
- **ゲームやインタラクティブコンテンツ**  
  Canvas 2Dよりもリッチな表現が求められる場合に最適
- **学習・教育用途**  
  天体シミュレーション、物理現象の可視化など

---

## 3. まずは動くサンプルコード

HTMLファイルにCDN経由でThree.jsを読み込んで、緑色のキューブを回転表示する例です。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Three.js Basic Sample</title>
  <style> body { margin: 0; } canvas { display: block; } </style>
</head>
<body>
  <!-- Three.jsのCDNを読み込み -->
  <script src="https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js"></script>
  <script>
    // Three.jsの初期設定
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // キューブを作成してシーンに追加
    const geometry = new THREE.BoxGeometry(1,1,1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // 毎フレームごとの描画
    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01; // キューブを回転
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    animate();
  </script>
</body>
</html>
