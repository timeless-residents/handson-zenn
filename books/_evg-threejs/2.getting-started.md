---
title:  はじめかた
free: true
---
# Three.js Everyday Season 01 - Getting Started

**「Three.js Everyday SEASON 01」**の第二章である本章では、Three.jsを活用するために必要な開発環境の準備や、最初のプロジェクトの立ち上げ方を具体的に解説します。前章（Introduction）でThree.jsの概要やメリットに触れましたが、ここからは**実際に手を動かして**進めていく部分がメインとなります。

多くのプログラミング学習では、最初に「環境構築の問題」に直面しがちです。本章を読むことで、そうした環境構築のつまづきを回避し、スムーズにThree.jsを始められることを目指します。

---

## 1. はじめに

### 1-1. どのような環境で開発するのか？

Three.jsによる開発は、以下の2つの方法が大きな柱となります。

1. **CDNを利用してscriptタグで読み込む**  
   - 小規模・短期で試作する際に便利  
   - 学習用途やプロトタイプ作成に向いている  
   - 本格的なビルドやトランスパイルのプロセスを必要としないため、導入が簡単

2. **Node.js（npm）を利用したローカル環境で開発する**  
   - 中規模以上のプロジェクトやチーム開発に適している  
   - WebpackやViteなどのビルドツールと連携しやすい  
   - モジュールとしてThree.jsをインポートし、複数ファイルを管理しやすい

どちらか一方しか使わないというわけではなく、**まずはCDNで簡単に試し、次のステップでnpm環境に移行**という手順を踏む方も多いです。本章では、**CDNを使った最も簡単なセットアップ**と**npmを使った本格的なセットアップ**を段階的に紹介します。

### 1-2. 前提となるソフトウェア

- **ウェブブラウザ**: 最新版のChrome, Firefox, Safari, Edgeなど  
  基本的に最新バージョンを用いることで、WebGLやES6に対応した状態で開発ができます。
- **テキストエディタまたはIDE**: Visual Studio Code, Atom, Sublime Textなど  
  開発効率を高めるには、シンタックスハイライトや補完機能を備えたIDEが便利ですが、メモ帳レベルでも作れないことはありません。
- **Node.js & npm**(後述する方法で開発する場合)  
  Node.jsをインストールすると`npm`（Node Package Manager）も付属します。npmはJavaScriptのライブラリ管理に必須のツールです。

---

## 2. CDNを利用する方法

### 2-1. CDNとは？

CDN（Content Delivery Network）とは、世界中の複数のサーバーにホストされているライブラリファイルをインターネット経由で取得する仕組みです。Three.jsも主要なCDNサービス（jsDelivrやUNPKG、cdnjsなど）を通じてホスティングされており、HTMLファイルに**scriptタグ**を挿入するだけで利用できます。

CDNを使うメリット:
- ローカルにライブラリをダウンロードする必要がない
- ファイル構成が非常にシンプル
- すぐにデモやサンプルを動かせる

CDNを使うデメリット:
- オフライン環境では利用できない
- バージョン管理が煩雑になる可能性がある
- 大規模開発や高度なビルドタスクとは相性が良くない

### 2-2. 最小限のサンプルHTML

CDN利用の例として、以下のようなHTMLファイルを作成してみましょう。ファイル名は`index.html`とします。ここでは`jsDelivr`を利用したURLを使っていますが、他のCDNでも構いません。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Three.js CDN Sample</title>
  <style>
    body { margin: 0; }
    canvas { display: block; }
  </style>
</head>
<body>
  <!-- Three.jsのCDN -->
  <script src="https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js"></script>
  <script>
    // シーンを作成
    const scene = new THREE.Scene();

    // カメラを作成
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 立方体ジオメトリとマテリアル、メッシュ
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // アニメーションループ
    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    animate();
  </script>
</body>
</html>
```

### 2-3. ローカルで開く際の注意点

HTMLファイルをダブルクリックしてブラウザで開くだけでも、多くの場合は問題なく動きますが、**一部ブラウザではローカルファイルからの読み込み制限**がかかる場合があります。もしエラーが出た場合は、簡易サーバーを立ち上げるとスムーズです。

#### Pythonの簡易サーバー例

Pythonがインストールされているなら、ターミナル（コマンドプロンプト）でHTMLを置いたフォルダに移動し、以下のコマンドを実行します。

```bash
python -m http.server 8000
```

これでポート8000番にサーバーが立ち上がるので、ブラウザで`http://localhost:8000/`にアクセスすればOKです。

#### Live Serverプラグイン（VS Codeなど）

Visual Studio Codeなら「Live Server」プラグインをインストールして、右クリックから「Open with Live Server」を選ぶだけでローカル開発サーバーが起動します。こういったツールを活用すると、ブラウザをリロードしなくても変更が即時反映される「ライブリロード」機能が使えるため、非常に便利です。

---

## 3. npmを使った本格的な開発環境

ここからは、より実践的な方法として**Node.js**や**npm**を利用した開発環境の構築手順を解説します。CDNでの簡単なセットアップはプロトタイプや勉強には良いものの、大規模なアプリやプロフェッショナルな現場では以下のメリットがあるnpmによる開発が主流となっています。

### 3-1. npm開発のメリット

- **バージョン管理が容易**  
  `package.json`にThree.jsのバージョンや依存関係が明示的に書かれるため、プロジェクトの再現性が高い。  
- **モジュール分割とツールチェーン**  
  ESモジュール（import/export）を使って複数ファイルを組織的に管理しやすい。  
  Babel, TypeScript, Webpack, Viteなどのツールを組み合わせやすい。  
- **テストや自動デプロイの連携**  
  CI/CDパイプラインに組み込みやすく、継続的なリリースやビルドが楽になる。  

### 3-2. Node.jsのインストール

まずは[Node.js公式サイト](https://nodejs.org/)から最新のLTS（長期サポート版）をダウンロード＆インストールします。インストールが完了すると、`node`と`npm`のコマンドが使用できるようになります。バージョンは以下のようにして確認可能です。

```bash
node -v
npm -v
```

ここではバージョンはあまり厳密にこだわらず、基本的には最新のLTSを使っておけばOKです。

### 3-3. プロジェクトフォルダの作成と初期化

以下のような手順で、作業ディレクトリを作り、npmの初期化を行います。

```bash
# プロジェクト用ディレクトリ作成
mkdir threejs-tutorial
cd threejs-tutorial

# npm初期化
npm init -y
```

これで同ディレクトリに`package.json`が作成されます。`-y`フラグは対話的な質問をスキップするためのものです。必要に応じて`package.json`の内容は後から編集できます。

### 3-4. Three.jsのインストール

```bash
npm install three
```

これで`node_modules`フォルダにThree.jsがインストールされ、`package.json`の`dependencies`に`"three": "^0.xxx.x"`のようなエントリが追加されるはずです。

### 3-5. プロジェクトの基本構成

ここでは最もシンプルな構成例を提示しますが、アプリの規模に応じて細かく分割したり、`src`フォルダを作成したりします。

```
threejs-tutorial/
├── package.json
├── package-lock.json
├── node_modules/
└── index.js   // ここにThree.jsのメインコードを書いてみる
```

#### index.js（サンプルコード）

```js
// ES Modules形式でThree.jsをインポート
import * as THREE from 'three';

// シーン
const scene = new THREE.Scene();

// カメラ
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.z = 5;

// レンダラー
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// DOMに追加
document.body.appendChild(renderer.domElement);

// 立方体メッシュ
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
```

しかし、この状態ではブラウザが直接`index.js`を読み込めません。ES Modules対応の静的サーバーを使うか、ビルドツールを導入してバンドルする必要があります。

---

## 4. ローカルサーバーを立ち上げる方法（ES Modules対応）

### 4-1. Node.jsのhttp-serverやlive-server

簡単な静的サーバーとしては以下のようにインストールして使う方法があります。

```bash
# グローバルインストール
npm install -g live-server

# またはプロジェクト内にローカルインストール
npm install --save-dev live-server
```

プロジェクトフォルダ内で以下のコマンドを実行すると、`index.js`や`index.html`などが配置されているディレクトリがルートとして公開されます。

```bash
live-server .
```

ただし、`live-server`だけだとES Modulesを使っている場合にうまく動作しないケースがあります。こうした場合は、ES Modulesを適切に扱ってくれるサーバーやビルドツールを利用しましょう。

### 4-2. Viteの導入（推奨）

**Vite**は近年非常に人気の高いフロントエンドビルドツールです。**高速な開発サーバー**と簡単なビルドステップを提供してくれます。Three.jsの学習プロジェクトでもViteを導入することで、スムーズに開発を進められるようになるでしょう。

#### Viteをインストールしてプロジェクトを作成

Viteはテンプレートからプロジェクトを新規作成できますが、すでにディレクトリを用意している場合は以下のステップを踏みます。

```bash
# Viteを開発依存としてインストール
npm install --save-dev vite
```

`package.json`の`scripts`に開発用のコマンドを追加します。

```jsonc
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "three": "^0.147.0"
  },
  "devDependencies": {
    "vite": "^4.0.0"
  }
}
```

プロジェクトの構成例（Vite利用）:

```
threejs-tutorial/
├── package.json
├── index.html   // エントリーポイント（Viteが読み込むHTML）
├── src/
│   └── main.js  // Three.jsのコードを記述
└── node_modules/
```

#### index.html（Vite用の例）

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>Three.js with Vite</title>
    <style>
      body { margin: 0; }
      canvas { display: block; }
    </style>
  </head>
  <body>
    <!-- Viteでは、モジュールを<script type="module">で読み込むのが基本 -->
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

#### src/main.js

```js
import * as THREE from 'three';

const scene = new THREE.Scene();

// カメラ設定
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.z = 5;

// レンダラー設定
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 立方体生成
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
```

上記の状態で、

```bash
npm run dev
```

を実行すると、Viteが開発サーバーを起動してくれます。ターミナル上に表示されるURL（通常は`http://localhost:5173/`など）にアクセスすれば、Three.jsのサンプルが動いているはずです。

---

## 5. Webpackを使った場合の例

Viteがシンプルでおすすめではありますが、プロジェクトによっては**Webpack**が既存で導入されていたり、設定を細かくコントロールしたい場合もあるでしょう。ここでは簡単な例だけ示します。

### 5-1. Webpackのインストール

```bash
npm install --save-dev webpack webpack-cli webpack-dev-server
```

### 5-2. 最小限の`webpack.config.js`

```js
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 8080,
  },
};
```

### 5-3. プロジェクト構成例（Webpack）

```
threejs-tutorial/
├── package.json
├── webpack.config.js
├── dist/
│   └── index.html
├── src/
│   └── main.js
└── node_modules/
```

#### dist/index.html

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>Three.js + Webpack</title>
  <style>
    body { margin: 0; }
    canvas { display: block; }
  </style>
</head>
<body>
  <!-- Webpackによってbundle.jsが生成される -->
  <script src="bundle.js"></script>
</body>
</html>
```

#### src/main.js

```js
import * as THREE from 'three';

const scene = new THREE.Scene();
// ... 以下Viteと同じように実装 ...
```

### 5-4. 起動

`package.json`に以下のスクリプトを追加しておくと便利です。

```json
{
  "scripts": {
    "build": "webpack",
    "start": "webpack serve"
  }
}
```

```bash
npm run start
```

これで`webpack-dev-server`が起動し、`http://localhost:8080/`をブラウザで開くと、Three.jsのアプリが動きます。

---

## 6. 開発中に便利なツールと設定

### 6-1. Live Reload / HMR

ViteやWebpack Dev Serverでは、ファイルを編集して保存すると、自動的にブラウザがリフレッシュされ、変更が即座に反映されます（Hot Module Replacement: HMR）。Three.jsの開発ではアセット（画像、モデル、シェーダーなど）の変更を頻繁に行うため、こうした仕組みがあると非常に効率的です。

### 6-2. ESLintやPrettier

コード品質やスタイルを保つために、**ESLint**や**Prettier**などのツールを導入するのも一般的です。

```bash
npm install --save-dev eslint prettier
```

設定ファイル（`.eslintrc.js`や`.prettierrc`）をプロジェクトルートに置くことで、文法チェックや自動整形を行えます。Three.jsのプロジェクトでも、チーム開発を見据えるなら早めに導入しておくとよいでしょう。

### 6-3. ブラウザの開発者ツール

- **JavaScriptコンソール**: エラーやログの確認  
- **Canvas/Renderingのパフォーマンス解析**: ブラウザによってはWebGLのパフォーマンス情報を確認できる拡張機能があります。  
- **ネットワークタブ**: アセット（テクスチャやモデル）の読み込み状況をチェック  

Three.js開発では、テクスチャやモデルが正しく読み込めているか、フレームレートがどの程度出ているかを都度確認しながら進めることが重要です。

---

## 7. ディレクトリ構成のベストプラクティス

Three.jsの学習用プロジェクトはシンプルでもOKですが、少し規模が大きくなると、以下のようなディレクトリ構成をとることが多いです。ここでは一例を示します。

```
threejs-project/
├── package.json
├── vite.config.js           // または webpack.config.js
├── public/                  // 静的ファイル置き場（画像、モデルなど）
│   ├── images/
│   ├── models/
│   └── index.html           // メインのHTML
└── src/
    ├── main.js              // エントリーポイント
    ├── utils/               // ユーティリティ系ファイル
    ├── shaders/             // カスタムシェーダーファイル (glsl など)
    └── components/          // ReactやVueなどを使う場合のコンポーネント
```

- `public`ディレクトリ: Viteの場合はデフォルトで、ビルド時に`public`以下がルートにコピーされる仕組みがあります。  
- `src`ディレクトリ: JavaScript/TypeScriptやシェーダーコードなどのソースを配置。モジュール単位で分割しやすい構成にすると管理がしやすいです。

---

## 8. TypeScriptでThree.jsを使う

### 8-1. TypeScriptの導入

JavaScriptよりも安全に型検査を行いたい場合は、TypeScriptの利用がおすすめです。TypeScriptでThree.jsを使うメリットとしては、**Three.jsの型定義ファイル**が用意されているため、メソッド名やプロパティの補完が効きやすくなります。

```bash
npm install --save-dev typescript
npm install --save-dev @types/three
```

### 8-2. tsconfig.json

TypeScriptを使うには`tsconfig.json`が必要です。以下は最小限の例です。

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

### 8-3. Vite + TypeScriptの例

Viteでは、`.ts`ファイルをサポートするプラグインがデフォルトで有効になっているため、特別な設定なしでも動作します。`src/main.ts`のように拡張子を変えるだけでOKです。

```ts
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x6666ff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// TypeScriptならコンパイル時にタイポを検出してくれる
function animate(): void {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
```

開発を続けていく中で、「誤ったプロパティ名を使っていた」などのミスをコンパイル時に見つけてくれるのは非常に大きなメリットです。

---

## 9. Gitでバージョン管理

### 9-1. なぜバージョン管理が必要？

- 実験的な機能やブランチを切り替えながら開発できる  
- いつでも過去のバージョンに戻せる  
- チーム開発時の衝突を最小化できる  

Three.jsのプロジェクトに限らず、どんなプログラムでもGitによるバージョン管理はほぼ必須といえます。学習プロジェクトでも、「どこでエラーが出るようになったか」を調べる際などに役立ちます。

### 9-2. .gitignore例

Node.js系プロジェクトであれば、以下のように`node_modules`などをバージョン管理から除外します。

```
node_modules/
dist/
.vscode/
.DS_Store
```

---

## 10. デバッグやトラブルシューティングのヒント

### 10-1. 黒画面・何も表示されない場合

- カメラの位置や向きが正しいか？
- レンダラーの`setSize`や`appendChild`が正しく呼ばれているか？
- JSファイルが正しく読み込まれていない（コンソールエラーをチェック）

### 10-2. WebGLが有効になっているか？

古いブラウザや、ユーザーのPC設定でWebGLが無効化されている場合があります。Three.jsではエラー表示用の`WEBGL.isWebGLAvailable()`などのヘルパーも用意されています。

```js
if (!WEBGL.isWebGLAvailable()) {
  alert('WebGLが対応されていません。設定を確認してください。');
}
```

（`three/examples/jsm/WebGL.js`をインポートすると使えます）

### 10-3. モデルやテクスチャが読み込まれない

- `import`パスや配置ディレクトリが正しいか？
- CORSポリシーの問題（ローカルファイルを直接参照していないか）
- ローカルサーバー上で動かしているか

---

## 11. まとめと次章への案内

**「Getting Started」**では、Three.jsの開発環境を整えるための手順と、それぞれの方法（CDN／npm・Node.js／ビルドツール）について詳細を解説しました。

- **CDN**でのスクリプト読み込みは、最速で始めるには最適。  
- **npm**とビルドツール（ViteやWebpackなど）を組み合わせると、大規模開発にスケールできる。  
- **ローカルサーバー**を利用しないと、モジュールやアセットの読み込みでエラーが出ることが多い。  
- **TypeScript**導入による型安全性や開発効率の向上。  
- **Git**によるバージョン管理はプロジェクト運営の基本。

次の章**「Basic Concepts」**では、Three.jsの根本的な概念（シーン・カメラ・レンダラー・ライティングなど）をさらに深掘りしていきます。実際に**Vite**や**Webpack**など何らかのビルドツールを導入した環境を用意しておくとスムーズに学習を進められるでしょう。もしまだ導入していない場合は、ここまでの手順を参考にしてセットアップしておいてください。

---

## 12. 追加Tips：プロジェクトテンプレートを活用する

- **Create Three App**: `create-react-app`や`vue create`などと同じように、Three.jsのスターターテンプレートを用意しているコミュニティベースのプロジェクトがあります。`npx create-three-app`のようにして、最初から設定済みの環境を取得できる場合もあります。  
- **Boilerplateリポジトリ**: GitHub上にThree.js + ViteやThree.js + Webpackのボイラープレートが多数あります。「threejs boilerplate vite」などで検索してみると、すでにデモページやセットアップが整ったリポジトリが見つかるかもしれません。

---

## 13. 今後の学習計画に合わせた環境カスタマイズ

Three.jsを使って学習を進めるうちに、次のような追加ニーズが出てくることがあります。

1. **カメラ操作を簡単にしたい**  
   - `OrbitControls` などのコントロールユーティリティを使いたい場合、追加で`three/examples/jsm/controls/OrbitControls.js`をインポートする必要があります。  
2. **モデルを読み込みたい**  
   - `GLTFLoader`, `OBJLoader`, `FBXLoader`などのローダーを使います。これらも`three/examples/jsm/loaders/`以下に存在します。  
3. **ポストプロセスを導入したい**  
   - `EffectComposer`, `ShaderPass` などの機能を活用して、Bloomや被写界深度などのビジュアルエフェクトを追加。  
4. **物理演算をしたい**  
   - `cannon-es` や `ammo.js` と組み合わせて、重力・衝突判定などをシミュレーション。  

こうした追加機能を使うたびに、**importパス**や**バンドラーの設定**を変更する必要が出る場合があります。最初は戸惑うこともあるかもしれませんが、慣れてくると「ビルドツールでライブラリを取り込むのはこうやるんだな」というパターンがつかめるようになるでしょう。

---

## 14. トラブルシューティング事例集

最後に、よくあるトラブルとその解決法をもう少し詳しくまとめておきます。とくにThree.js＋ビルドツールの環境周りで起きがちなエラーやつまずきをピックアップしました。

### 14-1. `Uncaught SyntaxError: Unexpected token 'export'`

- **原因**: ブラウザがES Modulesに対応していない（古いバージョン）、またはサーバー経由ではなくファイルを直接開いている。  
- **対策**: 開発サーバー経由でアクセスする。ブラウザをアップデートする。ビルドツールでトランスパイルする。

### 14-2. `Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/plain"`

- **原因**: サーバーの設定で、`.js`ファイルが正しいMIMEタイプとして返されていない可能性。  
- **対策**: ローカルサーバーの設定を見直す、またはビルドツールを利用して正しいサーバー設定を行う。

### 14-3. `404 error`でThree.jsの追加ライブラリが読み込めない

- **原因**: `OrbitControls`や`GLTFLoader`のような拡張モジュールを読み込むパスが誤っている。  
- **対策**: Three.jsのexamplesフォルダ内の正しいパスを確認し、`three/examples/jsm/...`形式でインポートする。ビルドツール側の設定（aliasなど）を見直す。

### 14-4. 画面が激重・カクカクする

- **原因**: テクスチャのサイズが大きすぎる、モデルのポリゴン数が過多、ライティングやシャドウ設定が複雑でGPU負荷が高い。  
- **対策**: テクスチャを圧縮する、モデルを減ポリゴン化する、シャドウ設定を簡略化する、フレームレートを確認しながら徐々に要素を追加する。

### 14-5. モバイル端末で表示が崩れる・操作できない

- **原因**: スマホやタブレットの画面サイズ・ピクセル密度に対応していない。タッチイベントの処理を実装していない。  
- **対策**: `window.innerWidth`, `window.innerHeight` を再計算し、`devicePixelRatio`なども考慮する。`touchstart`イベントなどを使ってインタラクションを実装する。

---

## 15. まとめ

本章では「Three.jsで何をするにも、まず必要となる開発環境構築」について、多角的に解説しました。再度ポイントを振り返ってみましょう。

1. **CDNでの導入**: 最短ルートで簡単に試す場合に有効。学習初期や小さなサンプルにおすすめ。  
2. **npm + ビルドツール（Vite/Webpackなど）**: 中〜大規模プロジェクトに必要な構成。依存関係やビルドプロセスを管理しやすい。  
3. **ローカルサーバー必須**: ESM（ES Modules）を使う場合、HTTPサーバーがないとエラーになるケースが多い。  
4. **TypeScriptの活用**: 型情報を使って安全にThree.jsのAPIを呼び出す。コード補完が強力。  
5. **Gitでの管理**: プロジェクトの成長とともにバージョン管理は不可欠。  
6. **ビルドツールやLoaderの追加設定**: Three.jsの拡張機能やモデルローダーを使うときは、パスの指定やバンドラーの設定が必要になる場合あり。

いよいよ次の章から、**Three.jsのコア概念**（Scene, Camera, Renderer, Light, Geometry, Materialなど）を一つひとつ掘り下げて学んでいきます。開発環境はお好みのものを選んで構いませんが、**ViteかWebpack**、あるいは**CDNだけで行う**か――どれか一つのパターンは必ず用意しておいてください。セクションごとのサンプルコードを動かしながら理解を深めるのがベストです。

次章「**Basic Concepts**」でお待ちしています！
