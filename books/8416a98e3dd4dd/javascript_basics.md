---
title: "JavaScriptの基礎"
---
# JavaScriptの基礎

この章では、Webページに動きをつけるためのJavaScriptの基礎を学びます。

## JavaScriptとは

JavaScriptは、Webページにインタラクティブな機能を追加するためのプログラミング言語です。

## JavaScriptの基本構文

### 変数

変数は、データを格納するための箱のようなものです。`let` や `const` を使って宣言します。

```javascript
let message = "こんにちは";
const pi = 3.14;
```

### データの型

JavaScriptには、文字列、数値、真偽値などのさまざまなデータ型があります。

```javascript
let str = "文字列";
let num = 100;
let bool = true;
```

### 関数

関数は、特定の処理をまとめたものです。

```javascript
function greet(name) {
  console.log("こんにちは、" + name + "さん!");
}

greet("太郎");
```

### 制御構文

`if` 文や `for` 文などを使って、処理の流れを制御できます。

```javascript
let age = 20;

if (age >= 20) {
    console.log("成人です。");
} else {
  console.log("未成年です。")
}
```
```javascript
for(let i = 0; i < 5; i++){
    console.log(i);
}
```

## ブラウザでJavaScriptを実行する

HTMLファイルに`<script>`タグを追加することで、JavaScriptを実行できます。

```html
<!DOCTYPE html>
<html>
<head>
  <title>JavaScriptの実行</title>
</head>
<body>
  <script>
    console.log("JavaScriptが実行されました！");
  </script>
</body>
</html>
```

上記のHTMLファイルをブラウザで開くと、コンソールに'JavaScriptが実行されました！'と出力されます。
