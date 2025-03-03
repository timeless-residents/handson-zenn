---
title: "Three.jsをはじめよう！- Introduction"
emoji: "📐"
type: "tech" # tech: 技術記事 / idea: アイデア
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
```

これを保存してブラウザで開くだけで、回転するキューブが表示されます。ほんの数十行のコードから始められるのは、Three.jsの大きな魅力のひとつです。

---

## 4. Three.jsの知識を深めたい？

「簡単なキューブは出せたけど、もっと本格的に学びたい…」という方は、下記の書籍やサンプルプロジェクトを活用してみてください。

### Three.js Everyday Season 01

[**【NEW】Three.js Everyday Season 01**](https://zenn.dev/idev/books/_evg-threejs)  
こちらの書籍では、環境構築やThree.jsの基本概念、基本的なジオメトリやマテリアルの使い方、アニメーション・インタラクション・モデル読み込みなど、ステップバイステップで丁寧に解説しています。  
**JavaScriptの基礎があれば、複雑なWebGLのローレベルAPIを意識せずに3D表現を楽しめるようになる**ことをゴールに据えているため、初心者から中級者まで幅広くおすすめです。

> #### 📌 Zenn.dev book 書籍
> - [Three.js Everyday Season 01](https://zenn.dev/idev/books/_evg-threejs)  
>  少しずつ実践を重ねてスキルを伸ばすスタイルで、いつの間にかThree.jsを自在に操れるようになります！

---

## 5. ショールームギャラリーで実例をチェック！

### handson-threejs

- **GitHubリポジトリ**: [timeless-residents/handson-threejs](https://github.com/timeless-residents/handson-threejs)  
- **デモページ**: [こちら](https://timeless-residents.github.io/handson-threejs/)  

複数のThree.jsシーンを展示するギャラリーサイトで、カテゴリ別にシーンを切り替えたり、検索バーから探したりできます。ソースコードが公開されているため、興味のあるシーンの実装を読むだけでも大いに勉強になるでしょう。

#### セットアップ方法

1. Node.js (v14以上) をインストール  
2. リポジトリをクローン:
   ```sh
   git clone https://github.com/timeless-residents/handson-threejs.git
   ```
3. ディレクトリへ移動＆依存関係インストール:
   ```sh
   cd handson-threejs
   npm install
   ```
4. 開発サーバー起動:
   ```sh
   npm run dev
   ```
   ブラウザで `http://localhost:3000` を開くだけ。

複数のユースケース（回転キューブ、パーティクルなど）を覗き見して、コードの書き方やデザインパターンを学んでみてください。

---

## 6. これから始める3Dプログラミングライフ

- **1日1つの小さなデモを作る**  
  ライトの種類を試してみたり、色を変えてみたりするだけで大きな発見があります。
- **公式ドキュメント・Examplesを活用**  
  Three.js公式のexamplesフォルダには多数のサンプルがあり、そのソースコードを読むだけで勉強になります。
- **メタバースやWebXRとの連携**  
  VR・ARデバイスにも対応可能で、最先端の3D体験をWebで実現できます。
- **コミュニティで情報共有**  
  SNSやブログ、勉強会を通じてアウトプットしながら理解を深めましょう。

---

## 7. まとめ

- **Three.jsはWebGLを楽に扱うためのライブラリ**  
  JavaScriptの知識だけでも本格的な3Dを実装できる。
- **充実したコミュニティとリソース**  
  公式Examples・QiitaやZennなどの日本語情報も豊富で学びやすい。
- **学習への次のステップ**  
  - 書籍 [Three.js Everyday Season 01](https://zenn.dev/idev/books/_evg-threejs)  
  - [handson-threejs](https://github.com/timeless-residents/handson-threejs) プロジェクトでの実例チェック

「ブラウザで動く3Dなんて夢のようだった…」という方も、Three.jsなら思いのほかシンプルに始められます。今回の記事をきっかけに、一歩踏み出してみてはいかがでしょうか？ 次々と新しいアイデアが浮かび、**気づいたら本格的な3Dプログラミングの世界**にハマっているかもしれません！

- - -
**それでは、Three.jsの冒険を楽しんでください！**  

[Three.js Everyday Season 01](https://zenn.dev/idev/books/_evg-threejs)で、インタラクティブな3D表現の学びをさらに深めましょう。あなたの3Dライフがより充実することを願っています！
