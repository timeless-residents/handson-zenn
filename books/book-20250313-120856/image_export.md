---
title: 画像形式でのエクスポート
---

前章では、SVG形式でのダイアグラム生成について学びました。この章では、PNG、JPEG、PDFなどの一般的な画像形式でダイアグラムをエクスポートする方法を解説します。ドキュメントやプレゼンテーション、Webサイト、印刷物など、様々な媒体や用途に応じた適切な画像形式の選択と最適なエクスポート設定について学びます。

## 画像形式の種類と特徴

Draw.ioからエクスポート可能な主な画像形式には、以下のようなものがあります：

1. **PNG (Portable Network Graphics)**
   - 透過背景をサポート
   - 可逆圧縮による高品質
   - Webでの使用に適している
   - 図表やスクリーンショットに最適

2. **JPEG/JPG (Joint Photographic Experts Group)**
   - 写真などの複雑な画像に適した圧縮方式
   - 小さなファイルサイズが可能
   - 透過をサポートしない
   - ダイアグラムよりも写真向き

3. **PDF (Portable Document Format)**
   - 印刷やドキュメントに最適
   - ベクター要素と高品質
   - 複数ページをサポート
   - 詳細な設定オプションあり

4. **WebP**
   - 最新のWeb向け画像形式
   - 高圧縮率と高品質
   - アニメーションと透過をサポート
   - ブラウザの対応状況に注意が必要

用途によって最適な形式は異なるため、目的に応じた適切な形式を選択することが重要です。

## 基本的な画像エクスポート機能

まず、基本的な画像エクスポート機能を実装します。以下は、ダイアグラムを様々な形式でエクスポートする汎用関数です：

```python
def export_diagram_to_image(diagram, output_path, format="png", options=None):
    """ダイアグラムを指定された画像形式でエクスポートする
    
    Args:
        diagram: Draw.ioダイアグラムデータ
        output_path: 出力ファイルのパス
        format: エクスポート形式（'png', 'jpg', 'pdf', 'webp'など）
        options: エクスポートオプション辞書
    
    Returns:
        出力ファイルのパス
    """
    import json
    import base64
    import requests
    
    if options is None:
        options = {}
    
    # デフォルトオプション
    default_options = {
        "bg": "#ffffff",     # 背景色
        "scale": "1.0",      # スケール
        "border": "10",      # 境界線のパディング
        "quality": "100",    # JPEG品質（0-100）
        "transparent": "0",  # 透過背景（1=透過）
        "dpi": "300"         # 解像度（DPI）
    }
    
    # オプションをマージ
    for key, value in default_options.items():
        if key not in options:
            options[key] = value
    
    # Draw.ioのエクスポートAPI URL
    export_url = "https://convert.diagrams.net/node/export"
    
    # リクエストデータの準備
    request_data = {
        "format": format.lower(),
        "xml": json.dumps(diagram),
        **options
    }
    
    # エクスポートAPIにリクエスト
    response = requests.post(export_url, json=request_data)
    
    # レスポンスを確認
    if response.status_code != 200:
        raise Exception(f"Image export failed: {response.text}")
    
    # Base64エンコードされた画像データを取得
    result = response.json()
    image_data = base64.b64decode(result.get("data", ""))
    
    # ファイルに保存
    with open(output_path, "wb") as file:
        file.write(image_data)
    
    return output_path
```

## PNG画像の最適化

PNG形式は、ダイアグラムの出力に最も一般的に使用される形式です。以下に、PNG出力のための特化した関数と最適化オプションを示します：

```python
def export_diagram_to_png(diagram, output_path, options=None):
    """ダイアグラムをPNG形式でエクスポートし、最適化する
    
    Args:
        diagram: Draw.ioダイアグラムデータ
        output_path: 出力ファイルのパス
        options: エクスポートオプション辞書
    
    Returns:
        出力ファイルのパス
    """
    if options is None:
        options = {}
    
    # PNGのデフォルトオプション
    png_options = {
        "transparent": "0",  # 透過背景（1=透過）
        "dpi": "150",        # 解像度（DPI）
        "scale": "1.0",      # スケール
        "border": "0",       # 境界線のパディング
        "grid": "0",         # グリッド表示（1=表示）
        "shadow": "0"        # 影の表示（1=表示）
    }
    
    # オプションをマージ
    for key, value in png_options.items():
        if key not in options:
            options[key] = value
    
    # PNG形式でエクスポート
    exported_file = export_diagram_to_image(diagram, output_path, "png", options)
    
    # PNG最適化（オプション）
    if options.get("optimize", False):
        optimize_png(exported_file)
    
    return exported_file
```

PNG画像を最適化するための補助関数：

```python
def optimize_png(png_file_path):
    """PNG画像を最適化して、ファイルサイズを削減する
    
    Args:
        png_file_path: 最適化するPNGファイルのパス
    
    Returns:
        最適化されたPNGファイルのパス
    """
    try:
        from PIL import Image
        import os
    except ImportError:
        raise ImportError("PNG最適化にはPillowライブラリが必要です。pip install pillow でインストールしてください。")
    
    # 画像を開く
    img = Image.open(png_file_path)
    
    # 一時ファイル名を生成
    temp_file = f"{os.path.splitext(png_file_path)[0]}_temp.png"
    
    # 最適化オプションでPNGとして保存
    img.save(temp_file, "PNG", optimize=True, compress_level=9)
    
    # 元のファイルと一時ファイルのサイズを比較
    original_size = os.path.getsize(png_file_path)
    optimized_size = os.path.getsize(temp_file)
    
    if optimized_size < original_size:
        # 最適化が効果的だった場合、元のファイルを置き換え
        os.remove(png_file_path)
        os.rename(temp_file, png_file_path)
        print(f"PNG最適化: {original_size} -> {optimized_size} バイト ({(1 - optimized_size/original_size)*100:.1f}% 削減)")
    else:
        # 最適化の効果がなかった場合、一時ファイルを削除
        os.remove(temp_file)
        print("PNG最適化: 改善なし")
    
    return png_file_path
```

## 透過背景のPNG生成

透過背景のPNG画像は、様々な背景色やデザインに合わせやすく、Webサイトなどでの使用に適しています：

```python
def export_diagram_to_transparent_png(diagram, output_path, options=None):
    """透過背景のPNG画像としてダイアグラムをエクスポートする
    
    Args:
        diagram: Draw.ioダイアグラムデータ
        output_path: 出力ファイルのパス
        options: 追加のエクスポートオプション
    
    Returns:
        出力ファイルのパス
    """
    if options is None:
        options = {}
    
    # 透過背景の設定を追加
    options["transparent"] = "1"
    
    # 透過PNGとしてエクスポート
    return export_diagram_to_png(diagram, output_path, options)
```

## 高解像度・高品質のJPEG出力

JPEG形式は、写真や画像が多いダイアグラムに適しています。以下に、高品質なJPEG出力のための関数を示します：

```python
def export_diagram_to_jpeg(diagram, output_path, quality=90, options=None):
    """ダイアグラムを高品質JPEG形式でエクスポートする
    
    Args:
        diagram: Draw.ioダイアグラムデータ
        output_path: 出力ファイルのパス
        quality: JPEG品質（0-100）
        options: 追加のエクスポートオプション
    
    Returns:
        出力ファイルのパス
    """
    if options is None:
        options = {}
    
    # JPEGのデフォルトオプション
    jpeg_options = {
        "quality": str(quality),  # JPEG品質
        "dpi": "300",             # 解像度（DPI）
        "scale": "1.5",           # スケール（高解像度向け）
        "border": "0",            # 境界線のパディング
        "bg": "#ffffff"           # 背景色（白）
    }
    
    # オプションをマージ
    for key, value in jpeg_options.items():
        if key not in options:
            options[key] = value
    
    # JPEG形式でエクスポート
    return export_diagram_to_image(diagram, output_path, "jpg", options)
```

## PDF出力と詳細設定

PDF形式は、印刷物やビジネス文書にダイアグラムを含める際に最適です。以下に、PDF出力の詳細設定を含む関数を示します：

```python
def export_diagram_to_pdf(diagram, output_path, options=None):
    """ダイアグラムをPDF形式でエクスポートする
    
    Args:
        diagram: Draw.ioダイアグラムデータ
        output_path: 出力ファイルのパス
        options: PDF出力オプション
    
    Returns:
        出力ファイルのパス
    """
    if options is None:
        options = {}
    
    # PDFのデフォルトオプション
    pdf_options = {
        "pageScale": "1.0",     # ページスケール
        "pageWidth": "595",     # ページ幅（ポイント、A4=595）
        "pageHeight": "842",    # ページ高さ（ポイント、A4=842）
        "allPages": "1",        # すべてのページを含める
        "crop": "0",            # クロップなし
        "margin": "10"          # マージン（ポイント）
    }
    
    # オプションをマージ
    for key, value in pdf_options.items():
        if key not in options:
            options[key] = value
    
    # PDF形式でエクスポート
    return export_diagram_to_image(diagram, output_path, "pdf", options)
```

## 異なる解像度の画像生成

Webサイトやレスポンシブデザインでは、同じダイアグラムを異なる解像度で提供する必要があることがあります。以下に、異なる解像度の画像を生成する関数を示します：

```python
def export_diagram_multiple_resolutions(diagram, base_filename, resolutions=None, format="png"):
    """ダイアグラムを複数の解像度でエクスポートする
    
    Args:
        diagram: Draw.ioダイアグラムデータ
        base_filename: 出力ファイル名の基本部分（拡張子なし）
        resolutions: 解像度とスケールのリスト [{"width": w, "scale": s, "suffix": sfx}, ...]
        format: 出力画像フォーマット（デフォルトはpng）
    
    Returns:
        生成された画像ファイルのパスのリスト
    """
    if resolutions is None:
        # デフォルトの解像度設定
        resolutions = [
            {"width": 640, "scale": "0.5", "suffix": "sm"},   # 小サイズ
            {"width": 1280, "scale": "1.0", "suffix": "md"},  # 中サイズ
            {"width": 1920, "scale": "1.5", "suffix": "lg"},  # 大サイズ
            {"width": 2560, "scale": "2.0", "suffix": "xl"}   # 特大サイズ
        ]
    
    exported_files = []
    
    for res in resolutions:
        # 出力ファイル名を生成
        output_filename = f"{base_filename}_{res['suffix']}.{format}"
        
        # エクスポートオプションを設定
        options = {
            "scale": res["scale"],
            "width": str(res["width"]),
            "border": "0"
        }
        
        # 指定された形式でエクスポート
        exported_file = export_diagram_to_image(diagram, output_filename, format, options)
        exported_files.append(exported_file)
    
    return exported_files
```

## 画像の後処理とエンハンスメント

エクスポートした画像に様々な後処理を適用して、視覚的な品質を向上させる機能を提供します：

```python
def enhance_exported_image(image_path, enhancements=None):
    """エクスポートした画像に後処理とエンハンスメントを適用する
    
    Args:
        image_path: 処理する画像ファイルのパス
        enhancements: 適用するエンハンスメントのリスト（辞書形式）
    
    Returns:
        処理された画像ファイルのパス
    """
    try:
        from PIL import Image, ImageEnhance, ImageFilter
        import os
    except ImportError:
        raise ImportError("画像処理にはPillowライブラリが必要です。pip install pillow でインストールしてください。")
    
    if enhancements is None:
        return image_path
    
    # 画像を開く
    img = Image.open(image_path)
    
    # 各エンハンスメントを適用
    for enhancement in enhancements:
        enhancement_type = enhancement.get("type")
        value = enhancement.get("value", 1.0)
        
        if enhancement_type == "sharpen":
            # シャープネス調整
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(value)
        
        elif enhancement_type == "contrast":
            # コントラスト調整
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(value)
        
        elif enhancement_type == "brightness":
            # 明るさ調整
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(value)
        
        elif enhancement_type == "color":
            # 色彩調整
            enhancer = ImageEnhance.Color(img)
            img = enhancer.enhance(value)
        
        elif enhancement_type == "blur":
            # ぼかし効果
            img = img.filter(ImageFilter.GaussianBlur(radius=value))
        
        elif enhancement_type == "border":
            # 境界線を追加
            border_color = enhancement.get("color", "#000000")
            border_width = int(enhancement.get("width", 1))
            
            # 新しいサイズの画像を作成
            bordered_img = Image.new(
                'RGBA' if img.mode == 'RGBA' else 'RGB',
                (img.width + 2 * border_width, img.height + 2 * border_width),
                border_color
            )
            
            # 元の画像を境界線の中に配置
            bordered_img.paste(img, (border_width, border_width))
            img = bordered_img
    
    # 処理した画像を保存
    img.save(image_path)
    
    return image_path
```

## 画像エクスポートの実践例

以上の関数を活用して、実際のダイアグラムを様々な形式でエクスポートする例を見てみましょう：

```python
def export_diagram_for_documentation(diagram, base_directory, title=None):
    """ドキュメント用に複数形式でダイアグラムをエクスポートする
    
    Args:
        diagram: エクスポートするダイアグラムデータ
        base_directory: 出力ディレクトリ
        title: ダイアグラムのタイトル（ファイル名の基本部分）
    
    Returns:
        エクスポートされたファイルのリスト
    """
    import os
    import re
    
    # タイトルが指定されていない場合、ダイアグラムから取得を試みる
    if title is None:
        try:
            # ダイアグラムのタイトルを取得（存在する場合）
            for cell in diagram.get("cells", []):
                if cell.get("value") and "title" in str(cell.get("value")).lower():
                    title = cell.get("value")
                    break
            
            # タイトルがない場合はデフォルト値を使用
            if title is None:
                title = "diagram"
        except:
            title = "diagram"
    
    # ファイル名に使用できない文字を置換
    safe_title = re.sub(r'[\\/*?:"<>|]', "_", title)
    
    # 出力ディレクトリが存在しない場合は作成
    if not os.path.exists(base_directory):
        os.makedirs(base_directory)
    
    # 各フォーマットのファイルパスを生成
    png_path = os.path.join(base_directory, f"{safe_title}.png")
    transparent_png_path = os.path.join(base_directory, f"{safe_title}_transparent.png")
    jpeg_path = os.path.join(base_directory, f"{safe_title}.jpg")
    pdf_path = os.path.join(base_directory, f"{safe_title}.pdf")
    
    exported_files = []
    
    # 標準PNG画像をエクスポート
    exported_files.append(export_diagram_to_png(
        diagram, png_path, {"scale": "1.0", "optimize": True}
    ))
    
    # 透過背景PNG画像をエクスポート
    exported_files.append(export_diagram_to_transparent_png(
        diagram, transparent_png_path, {"scale": "1.0"}
    ))
    
    # 高品質JPEG画像をエクスポート
    exported_files.append(export_diagram_to_jpeg(
        diagram, jpeg_path, quality=95, 
        options={"scale": "1.2", "border": "5"}
    ))
    
    # 印刷用PDF形式をエクスポート
    exported_files.append(export_diagram_to_pdf(
        diagram, pdf_path
    ))
    
    # 複数解像度の画像をエクスポート
    multi_res_files = export_diagram_multiple_resolutions(
        diagram, os.path.join(base_directory, safe_title),
        resolutions=[
            {"width": 800, "scale": "0.7", "suffix": "small"},
            {"width": 1600, "scale": "1.4", "suffix": "large"}
        ]
    )
    exported_files.extend(multi_res_files)
    
    return exported_files
```

## バッチエクスポートの効率化

複数のダイアグラムを一括でエクスポートする場合や、大量のダイアグラムを処理する場合の効率的な方法を提供します：

```python
def batch_export_diagrams(diagrams, output_directory, formats=None, concurrent=True):
    """複数のダイアグラムを一括でエクスポートする
    
    Args:
        diagrams: ダイアグラムデータのリスト（各要素はタイトルを含む辞書）
        output_directory: 出力ディレクトリ
        formats: エクスポートするフォーマットのリスト（例：["png", "pdf"]）
        concurrent: 並行処理を使用するかどうか
    
    Returns:
        エクスポートされたファイルのリスト
    """
    import os
    import re
    
    if formats is None:
        formats = ["png"]
    
    # 出力ディレクトリが存在しない場合は作成
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
    
    exported_files = []
    
    if concurrent:
        # 並行処理でエクスポート
        try:
            from concurrent.futures import ThreadPoolExecutor
        except ImportError:
            print("並行処理ライブラリが利用できません。逐次処理に切り替えます。")
            concurrent = False
    
    if concurrent:
        # 並行処理用の関数
        def export_single_diagram(diagram_data):
            diagram = diagram_data.get("diagram", {})
            title = diagram_data.get("title", "diagram")
            safe_title = re.sub(r'[\\/*?:"<>|]', "_", title)
            
            files = []
            for fmt in formats:
                output_path = os.path.join(output_directory, f"{safe_title}.{fmt}")
                files.append(export_diagram_to_image(diagram, output_path, fmt))
            
            return files
        
        # スレッドプールを使用して並行処理
        with ThreadPoolExecutor() as executor:
            results = list(executor.map(export_single_diagram, diagrams))
            
            # 結果をフラット化
            for result in results:
                exported_files.extend(result)
    else:
        # 逐次処理
        for diagram_data in diagrams:
            diagram = diagram_data.get("diagram", {})
            title = diagram_data.get("title", "diagram")
            safe_title = re.sub(r'[\\/*?:"<>|]', "_", title)
            
            for fmt in formats:
                output_path = os.path.join(output_directory, f"{safe_title}.{fmt}")
                exported_files.append(export_diagram_to_image(diagram, output_path, fmt))
    
    return exported_files
```

## WebP形式のサポート

WebP形式は、PNG/JPEGよりも小さなファイルサイズでの高品質な画像表現が可能な新しい画像形式です。最新のWebブラウザでのサポートが広がっています：

```python
def export_diagram_to_webp(diagram, output_path, options=None):
    """ダイアグラムをWebP形式でエクスポートする
    
    Args:
        diagram: Draw.ioダイアグラムデータ
        output_path: 出力ファイルのパス
        options: WebP出力オプション
    
    Returns:
        出力ファイルのパス
    """
    try:
        from PIL import Image
    except ImportError:
        raise ImportError("WebP出力にはPillowライブラリが必要です。pip install pillow でインストールしてください。")
    
    if options is None:
        options = {}
    
    # WebPのデフォルトオプション
    webp_options = {
        "quality": "90",       # 画質（0-100）
        "lossless": "0",       # 可逆圧縮（1=可逆）
        "transparent": "0",    # 透過（1=透過）
        "scale": "1.0"         # スケール
    }
    
    # オプションをマージ
    for key, value in webp_options.items():
        if key not in options:
            options[key] = value
    
    # まずPNG形式でエクスポート
    temp_png_path = f"{output_path}.temp.png"
    export_diagram_to_png(diagram, temp_png_path, options)
    
    # PNGからWebPに変換
    try:
        img = Image.open(temp_png_path)
        
        # WebPでの品質設定
        quality = int(options["quality"])
        lossless = options["lossless"] == "1"
        
        # WebP形式で保存
        img.save(output_path, "WEBP", quality=quality, lossless=lossless)
        
        # 一時ファイルを削除
        import os
        os.remove(temp_png_path)
        
        return output_path
    except Exception as e:
        # エラーが発生した場合、一時ファイルをコピー
        import shutil
        shutil.copy(temp_png_path, output_path)
        print(f"WebP変換エラー: {e}")
        return output_path
```

## 画像形式選択のガイドライン

どの画像形式を選ぶべきかのガイドラインを提供する関数です：

```python
def suggest_export_format(diagram_characteristics):
    """ダイアグラムの特性に基づいて最適な画像形式を提案する
    
    Args:
        diagram_characteristics: ダイアグラムの特性を表す辞書
    
    Returns:
        推奨フォーマットと理由を含む辞書
    """
    # 初期スコア
    scores = {
        "png": 0,
        "jpg": 0,
        "pdf": 0,
        "svg": 0,
        "webp": 0
    }
    
    # 用途に基づくスコア調整
    usage = diagram_characteristics.get("usage", "").lower()
    if "web" in usage:
        scores["png"] += 3
        scores["svg"] += 4
        scores["webp"] += 5
        scores["jpg"] += 2
    elif "print" in usage or "document" in usage:
        scores["pdf"] += 5
        scores["png"] += 3
        scores["svg"] += 4
    elif "presentation" in usage:
        scores["png"] += 4
        scores["pdf"] += 3
        scores["svg"] += 2
    
    # 透過が必要な場合
    if diagram_characteristics.get("needs_transparency", False):
        scores["png"] += 3
        scores["svg"] += 4
        scores["webp"] += 3
        scores["jpg"] -= 5  # JPEGは透過をサポートしない
    
    # ファイルサイズの重要性
    file_size_importance = diagram_characteristics.get("file_size_importance", 0)
    if file_size_importance > 0:
        scores["jpg"] += file_size_importance * 2
        scores["webp"] += file_size_importance * 3
        scores["svg"] += file_size_importance * 1  # SVGは内容による
    
    # 品質の重要性
    quality_importance = diagram_characteristics.get("quality_importance", 0)
    if quality_importance > 0:
        scores["png"] += quality_importance * 2
        scores["svg"] += quality_importance * 3
        scores["pdf"] += quality_importance * 2
        scores["jpg"] += quality_importance * 1
    
    # インタラクティブ要素の有無
    if diagram_characteristics.get("has_interactive_elements", False):
        scores["svg"] += 5  # SVGのみインタラクティブ要素をサポート
    
    # ブラウザ互換性
    browser_compatibility = diagram_characteristics.get("browser_compatibility", "").lower()
    if browser_compatibility == "all":
        scores["png"] += 3
        scores["jpg"] += 3
        scores["webp"] -= 2  # 一部の古いブラウザはWebPをサポートしない
    
    # 最適なフォーマットを決定
    best_format = max(scores, key=scores.get)
    max_score = scores[best_format]
    
    # 理由を生成
    reasons = []
    if best_format == "png":
        reasons.append("高品質で透過をサポート")
        if "web" in usage:
            reasons.append("Web向けに適しています")
    elif best_format == "jpg":
        reasons.append("小さなファイルサイズ")
        if file_size_importance > 0:
            reasons.append("ファイルサイズの最適化が重要な場合に適しています")
    elif best_format == "pdf":
        reasons.append("印刷に最適")
        if "print" in usage or "document" in usage:
            reasons.append("文書や印刷物向けに適しています")
    elif best_format == "svg":
        reasons.append("任意のサイズに拡大縮小可能")
        if diagram_characteristics.get("has_interactive_elements", False):
            reasons.append("インタラクティブ要素をサポートします")
    elif best_format == "webp":
        reasons.append("高圧縮率と高品質")
        if "web" in usage:
            reasons.append("最新のWebブラウザ向けに最適化されています")
    
    return {
        "recommended_format": best_format,
        "reasons": reasons,
        "scores": scores
    }
```

## 画像メタデータの追加

画像にメタデータを追加して、画像の出所や著作権情報などを埋め込むことができます：

```python
def add_metadata_to_image(image_path, metadata):
    """画像ファイルにメタデータを追加する
    
    Args:
        image_path: メタデータを追加する画像ファイルのパス
        metadata: 追加するメタデータの辞書
    
    Returns:
        メタデータが追加された画像ファイルのパス
    """
    try:
        from PIL import Image, PngImagePlugin
        import piexif
        import json
        import os
    except ImportError:
        raise ImportError("メタデータ追加には以下のライブラリが必要です: pillow, piexif")
    
    # ファイル拡張子を取得
    _, ext = os.path.splitext(image_path)
    ext = ext.lower()
    
    # 画像を開く
    img = Image.open(image_path)
    
    if ext == ".png":
        # PNGメタデータの作成
        png_metadata = PngImagePlugin.PngInfo()
        
        # メタデータを追加
        for key, value in metadata.items():
            png_metadata.add_text(key, str(value))
        
        # メタデータ付きで保存
        img.save(image_path, "PNG", pnginfo=png_metadata)
    
    elif ext == ".jpg" or ext == ".jpeg":
        # JPEGのEXIFメタデータを作成
        try:
            # 既存のEXIFデータを取得
            exif_dict = piexif.load(img.info.get("exif", b""))
        except:
            # EXIFデータがない場合は新規作成
            exif_dict = {"0th": {}, "Exif": {}, "GPS": {}, "1st": {}, "thumbnail": None}
        
        # メタデータをユーザーコメントとして追加
        metadata_json = json.dumps(metadata)
        exif_dict["Exif"][piexif.ExifIFD.UserComment] = metadata_json.encode("utf-8")
        
        # EXIFデータをバイナリに変換
        exif_bytes = piexif.dump(exif_dict)
        
        # メタデータ付きで保存
        img.save(image_path, "JPEG", exif=exif_bytes, quality=img.info.get("quality", 95))
    
    elif ext == ".webp":
        # WebPはメタデータのサポートが限られているため、基本的な情報のみ保持
        img.save(image_path, "WEBP", quality=img.info.get("quality", 90))
        print("注意: WebP形式ではメタデータのサポートが限られています")
    
    return image_path
```

## 実践例：複数形式のエクスポートとバッチ処理

フローチャートやER図など、様々なタイプのダイアグラムを適切な形式でエクスポートする実践例を示します：

```python
def export_diagram_set_for_documentation(diagram_set, output_directory):
    """ドキュメンテーション用にダイアグラムセットを最適な形式でエクスポートする
    
    Args:
        diagram_set: ダイアグラムの辞書のリスト
            各辞書は以下のキーを含む:
            - diagram: ダイアグラムデータ
            - title: ダイアグラムのタイトル
            - type: ダイアグラムのタイプ（"flowchart", "er_diagram", "system_architecture" など）
            - usage: 用途（"web", "print", "presentation" など）
        output_directory: 出力ディレクトリ
    
    Returns:
        エクスポートされたファイルのリスト
    """
    import os
    import re
    
    # 出力ディレクトリが存在しない場合は作成
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
    
    exported_files = []
    
    for diagram_info in diagram_set:
        diagram = diagram_info.get("diagram", {})
        title = diagram_info.get("title", "diagram")
        diagram_type = diagram_info.get("type", "general")
        usage = diagram_info.get("usage", "general")
        
        # ファイル名に使用できない文字を置換
        safe_title = re.sub(r'[\\/*?:"<>|]', "_", title)
        
        # ダイアグラムの特性に基づいて最適な形式を選択
        characteristics = {
            "usage": usage,
            "needs_transparency": "web" in usage,
            "file_size_importance": 3 if "web" in usage else 1,
            "quality_importance": 4 if "print" in usage or "presentation" in usage else 2,
            "has_interactive_elements": False,
            "browser_compatibility": "all" if "web" in usage else "modern"
        }
        
        # ダイアグラムのタイプに応じた調整
        if diagram_type == "flowchart":
            characteristics["needs_transparency"] = True
        elif diagram_type == "er_diagram":
            characteristics["quality_importance"] = 5
        elif diagram_type == "system_architecture":
            characteristics["needs_transparency"] = True
            characteristics["file_size_importance"] = 2
        
        # 最適な形式を提案
        format_suggestion = suggest_export_format(characteristics)
        recommended_format = format_suggestion["recommended_format"]
        
        # 推奨形式でエクスポート
        output_path = os.path.join(output_directory, f"{safe_title}.{recommended_format}")
        
        if recommended_format == "png":
            exported_files.append(export_diagram_to_png(
                diagram, output_path, {"optimize": True}
            ))
        elif recommended_format == "jpg":
            exported_files.append(export_diagram_to_jpeg(
                diagram, output_path, quality=90
            ))
        elif recommended_format == "pdf":
            exported_files.append(export_diagram_to_pdf(
                diagram, output_path
            ))
        elif recommended_format == "svg":
            # SVGエクスポートは別の関数を使用
            from svg_export import export_diagram_to_svg
            exported_files.append(export_diagram_to_svg(
                diagram, output_path
            ))
        elif recommended_format == "webp":
            exported_files.append(export_diagram_to_webp(
                diagram, output_path
            ))
        
        # Web用途の場合、複数解像度も生成
        if "web" in usage:
            multi_res_files = export_diagram_multiple_resolutions(
                diagram, os.path.join(output_directory, f"{safe_title}_web"),
                resolutions=[
                    {"width": 800, "scale": "0.7", "suffix": "sm"},
                    {"width": 1600, "scale": "1.4", "suffix": "lg"}
                ],
                format="png"
            )
            exported_files.extend(multi_res_files)
        
        # 印刷用途の場合、高解像度PDFも生成
        if "print" in usage:
            pdf_high_res_path = os.path.join(output_directory, f"{safe_title}_print.pdf")
            exported_files.append(export_diagram_to_pdf(
                diagram, pdf_high_res_path, 
                {"pageScale": "2.0", "margin": "5"}
            ))
        
        # メタデータを追加
        if recommended_format in ["png", "jpg", "webp"]:
            add_metadata_to_image(output_path, {
                "Title": title,
                "Author": "Draw.io API",
                "Description": f"{diagram_type.capitalize()} diagram for {usage} usage",
                "Copyright": "© " + str(__import__("datetime").datetime.now().year),
                "Creation-Date": __import__("datetime").datetime.now().isoformat()
            })
    
    return exported_files
```

## まとめ

この章では、Draw.ioで作成したダイアグラムを様々な画像形式でエクスポートする方法を学びました。主なポイントは以下の通りです：

1. 画像形式（PNG、JPEG、PDF、WebP）の特徴と適切な用途
2. 基本的な画像エクスポート機能の実装方法
3. PNG画像の透過背景や最適化テクニック
4. 高解像度・高品質のJPEG出力方法
5. PDF出力と詳細設定オプション
6. 異なる解像度の画像生成手法
7. 画像の後処理とエンハンスメント
8. バッチエクスポートの効率化手法
9. WebP形式のサポート
10. 画像形式選択のガイドライン
11. 画像メタデータの追加
12. ドキュメンテーション用のダイアグラムエクスポート実践例

これらの知識を活用することで、様々な用途や媒体に最適化されたダイアグラム画像を効率的に生成できます。特に、Web、印刷物、プレゼンテーションなど、用途に応じた適切な形式と設定を選択することが重要です。

次の章では、Draw.ioファイル形式の詳細について解説します。Draw.ioのファイル構造、データフォーマット、互換性の確保など、より深いレベルでの理解と操作方法を学びます。

## 練習問題

1. 以下の仕様に基づいて、高品質かつ小さなファイルサイズのPNG画像を生成する関数を実装してください：
   - 白背景
   - 解像度300 DPI
   - ノードの影を無効化
   - 最適化でファイルサイズを削減

2. Webサイトのレスポンシブデザイン用に、指定されたダイアグラムから以下のサイズ分のPNG画像を生成する関数を実装してください：
   - モバイル向け（幅480px）
   - タブレット向け（幅768px）
   - デスクトップ向け（幅1200px）
   - 高解像度デスクトップ向け（幅1920px）
   また、それぞれのサイズで適切なスケールと最適化を行ってください。

3. ドキュメント印刷用とWeb公開用の両方の用途に適したダイアグラムのエクスポート関数を実装してください。印刷用にはPDF、Web用にはPNGとSVG形式でエクスポートし、適切なフォルダ構造で整理してください。

4. 社内プレゼンテーション用のダイアグラムセットをエクスポートする関数を実装してください。以下の要件を満たしてください：
   - 会社のロゴを各ダイアグラムの右下に追加
   - 著作権情報をメタデータに埋め込む
   - 高解像度（1920x1080以上）の画像生成
   - PowerPointに適したアスペクト比（16:9）の維持

5. テストを目的とした特殊なユースケースとして、同じダイアグラムを5種類の異なる画像形式（PNG、JPEG、PDF、SVG、WebP）でエクスポートし、それぞれのファイルサイズと画質を比較する分析ツールを実装してください。結果をCSVファイルに出力し、形式ごとの長所と短所を示してください。