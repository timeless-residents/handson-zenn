---
title: "HTMLとCSSの基礎"
---

# HTMLとCSSの基礎

この章では、Webページの見た目を作成するためのHTMLとCSSの基礎を学びます。

## HTMLとは

HTML (HyperText Markup Language) は、Webページの構造を記述するためのマークアップ言語です。

```html
<!DOCTYPE html>
<html>
<head>
  <title>はじめてのHTML</title>
</head>
<body>
  <h1>こんにちは、世界！</h1>
  <p>これはHTMLで記述した段落です。</p>
</body>
</html>
```

## CSSとは

CSS (Cascading Style Sheets) は、Webページのスタイル (見た目) を指定するための言語です。

```css
h1 {
  color: blue;
}
p {
  font-size: 16px;
}
```

## HTMLとCSSの連携

HTMLとCSSを連携することで、Webページの見た目を自由にデザインできます。

### 例

HTMLファイルにCSSを適用する方法はいくつかありますが、`<link>`タグを使って外部CSSファイルを読み込むのが一般的です。

```html
<!DOCTYPE html>
<html>
<head>
  <title>HTMLとCSSの連携</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>タイトル</h1>
  <p class="paragraph">段落</p>
</body>
</html>
```

```css
h1 {
    color: red;
}

.paragraph{
    font-size: 18px;
    color: green;
}
```
