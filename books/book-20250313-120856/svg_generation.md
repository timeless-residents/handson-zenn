---
title: SVG形式でのダイアグラム生成
---

前章では、データ駆動型のダイアグラム作成について学びました。この章では、Scalable Vector Graphics (SVG) 形式でのダイアグラム生成について詳しく解説します。SVGは拡大しても画質が劣化しない、Webに最適化されたベクター画像形式であり、Draw.ioダイアグラムの出力形式として非常に重要です。

## SVG形式の基礎と利点

SVG (Scalable Vector Graphics) は、XML形式で記述されたベクターグラフィックス形式です。SVGには以下のような特徴と利点があります：

1. **スケーラビリティ**: サイズを変更しても画質が劣化しません
2. **テキスト検索可能**: SVG内のテキストはそのままテキストとして保持されます
3. **編集可能**: SVGファイルはテキストエディタで直接編集できます
4. **軽量**: 多くの場合、同等のラスター画像よりファイルサイズが小さくなります
5. **アニメーション対応**: アニメーションやインタラクティブな要素を追加できます
6. **CSSスタイリング**: CSSでスタイルを変更できます
7. **アクセシビリティ**: 適切なマークアップを含めることで、アクセシビリティを向上できます

Draw.ioのダイアグラムをSVG形式で出力することで、これらの利点を活用できます。

## Draw.ioからSVGを生成する基本的な方法

Draw.ioのダイアグラムからSVGを生成する基本的な方法を見ていきましょう：

```python
def export_diagram_to_svg(diagram, output_path):
    """ダイアグラムをSVG形式でエクスポートする
    
    Args:
        diagram: Draw.ioダイアグラムデータ
        output_path: 出力SVGファイルのパス
    """
    import json
    import base64
    import requests
    
    # Draw.ioのエクスポートAPI URL
    export_url = "https://convert.diagrams.net/node/export"
    
    # リクエストデータの準備
    request_data = {
        "format": "svg",
        "xml": json.dumps(diagram),
        "embedXml": "0",  # XMLをSVGファイルに埋め込まない
        "bg": "#ffffff",  # 背景色（白）
        "scale": "1.0",   # スケール
        "border": "10"    # 境界線のパディング（ピクセル）
    }
    
    # エクスポートAPIにリクエスト
    response = requests.post(export_url, json=request_data)
    
    # レスポンスを確認
    if response.status_code != 200:
        raise Exception(f"SVG export failed: {response.text}")
    
    # Base64エンコードされたSVGデータを取得
    result = response.json()
    svg_data = base64.b64decode(result.get("data", ""))
    
    # SVGファイルに保存
    with open(output_path, "wb") as file:
        file.write(svg_data)
    
    return output_path
```

## SVG出力のカスタマイズオプション

SVG出力をカスタマイズするためのさまざまなオプションを提供する関数を作成します：

```python
def export_diagram_to_svg_with_options(diagram, output_path, options=None):
    """ダイアグラムを様々なオプションでSVG形式にエクスポートする
    
    Args:
        diagram: Draw.ioダイアグラムデータ
        output_path: 出力SVGファイルのパス
        options: エクスポートオプション辞書
    """
    import json
    import base64
    import requests
    
    if options is None:
        options = {}
    
    # デフォルトオプション
    default_options = {
        "bg": "#ffffff",           # 背景色
        "scale": "1.0",            # スケール
        "border": "10",            # 境界線のパディング
        "embedXml": "0",           # XMLを埋め込まない
        "embedImages": "1",        # 画像を埋め込む
        "noHeader": "0",           # SVGヘッダーを含める
        "transparency": "0",       # 透過設定（0=不透明）
        "shadow": "0",             # 影の表示
        "lightbox": "0",           # ライトボックスHTML
        "nav": "0",                # ナビゲーションUI
        "layers": "1",             # レイヤー表示
        "width": "",               # 固定幅（指定しない場合は自動）
        "height": "",              # 固定高さ（指定しない場合は自動）
        "crop": "0"                # クロップ（0=クロップしない）
    }
    
    # オプションをマージ
    for key, value in default_options.items():
        if key not in options:
            options[key] = value
    
    # Draw.ioのエクスポートAPI URL
    export_url = "https://convert.diagrams.net/node/export"
    
    # リクエストデータの準備
    request_data = {
        "format": "svg",
        "xml": json.dumps(diagram),
        **options
    }
    
    # エクスポートAPIにリクエスト
    response = requests.post(export_url, json=request_data)
    
    # レスポンスを確認
    if response.status_code != 200:
        raise Exception(f"SVG export failed: {response.text}")
    
    # Base64エンコードされたSVGデータを取得
    result = response.json()
    svg_data = base64.b64decode(result.get("data", ""))
    
    # SVGファイルに保存
    with open(output_path, "wb") as file:
        file.write(svg_data)
    
    return output_path
```

## SVGの後処理とカスタマイズ

生成したSVGをさらにカスタマイズするためのユーティリティ関数を作成します：

```python
def customize_svg_output(svg_file_path, custom_options=None):
    """SVGファイルをさらにカスタマイズする
    
    Args:
        svg_file_path: SVGファイルのパス
        custom_options: カスタマイズオプション辞書
    """
    if custom_options is None:
        custom_options = {}
    
    # SVGファイルを読み込む
    with open(svg_file_path, 'r', encoding='utf-8') as file:
        svg_content = file.read()
    
    # カスタマイズオプションに基づいて変更
    if 'add_title' in custom_options:
        title_value = custom_options['add_title']
        if '<title>' not in svg_content:
            svg_content = svg_content.replace('<svg ', f'<svg>\n  <title>{title_value}</title>\n', 1)
        else:
            import re
            svg_content = re.sub(r'<title>.*?</title>', f'<title>{title_value}</title>', svg_content)
    
    if 'add_description' in custom_options:
        desc_value = custom_options['add_description']
        if '<desc>' not in svg_content:
            svg_content = svg_content.replace('<svg ', f'<svg>\n  <desc>{desc_value}</desc>\n', 1)
        else:
            import re
            svg_content = re.sub(r'<desc>.*?</desc>', f'<desc>{desc_value}</desc>', svg_content)
    
    if 'add_css' in custom_options:
        css_content = custom_options['add_css']
        if '<style' not in svg_content:
            # SVGのopening tagの後に<style>タグを追加
            style_tag = f'\n<style type="text/css"><![CDATA[\n{css_content}\n]]></style>\n'
            svg_content = svg_content.replace('<svg ', f'<svg {style_tag}', 1)
        else:
            # 既存のスタイルタグの内容を更新
            import re
            svg_content = re.sub(r'<style.*?>(.*?)</style>', 
                               f'<style type="text/css"><![CDATA[\\1\n{css_content}\n]]></style>', 
                               svg_content, flags=re.DOTALL)
    
    # SVGサイズの変更
    if 'width' in custom_options:
        import re
        svg_content = re.sub(r'width=".*?"', f'width="{custom_options["width"]}"', svg_content)
    
    if 'height' in custom_options:
        import re
        svg_content = re.sub(r'height=".*?"', f'height="{custom_options["height"]}"', svg_content)
    
    # 背景色の変更
    if 'background' in custom_options:
        bg_color = custom_options['background']
        if 'style="background-color:' in svg_content:
            import re
            svg_content = re.sub(r'style="background-color:.*?"', 
                              f'style="background-color:{bg_color}"', 
                              svg_content)
        else:
            svg_content = svg_content.replace('<svg ', f'<svg style="background-color:{bg_color}" ', 1)
    
    # 特定要素のクラス追加
    if 'add_class_to_elements' in custom_options:
        for selector, class_name in custom_options['add_class_to_elements'].items():
            # この例では簡易的な置換を行いますが、より複雑なケースではXMLパーサーの使用を検討
            if selector == 'rect':
                import re
                svg_content = re.sub(r'<rect ', f'<rect class="{class_name}" ', svg_content)
    
    # 変更を保存
    with open(svg_file_path, 'w', encoding='utf-8') as file:
        file.write(svg_content)
    
    return svg_file_path
```

## インタラクティブなSVG要素の追加

SVGにインタラクティブな要素を追加するユーティリティ関数：

```python
def add_interactivity_to_svg(svg_file_path, interactive_elements):
    """SVGにインタラクティブな要素を追加する
    
    Args:
        svg_file_path: SVGファイルのパス
        interactive_elements: インタラクティブ要素の定義リスト
            [{
                'type': 'tooltip'|'highlight'|'click'|'link',
                'selector': '要素を選択するCSSセレクタ',
                'action': アクションの詳細（タイプによって異なる）
            }]
    """
    import re
    from xml.dom import minidom
    
    # SVGファイルを解析
    doc = minidom.parse(svg_file_path)
    svg_root = doc.documentElement
    
    # スクリプトを追加するための要素
    script_element = doc.createElement('script')
    script_element.setAttribute('type', 'text/javascript')
    
    # インタラクティブ機能のJavaScript
    js_code = """
    <![CDATA[
    document.addEventListener('DOMContentLoaded', function() {
    """
    
    # インタラクティブ要素を処理
    for element in interactive_elements:
        element_type = element.get('type')
        selector = element.get('selector')
        action = element.get('action')
        
        if element_type == 'tooltip':
            # ツールチップ機能
            tooltip_text = action.get('text', '')
            js_code += f"""
            var elements_{id(element)} = document.querySelectorAll('{selector}');
            for (var i = 0; i < elements_{id(element)}.length; i++) {{
                var el = elements_{id(element)}[i];
                el.setAttribute('title', '{tooltip_text}');
                
                el.addEventListener('mouseover', function(e) {{
                    var tooltip = document.createElement('div');
                    tooltip.className = 'svg-tooltip';
                    tooltip.textContent = '{tooltip_text}';
                    tooltip.style.position = 'absolute';
                    tooltip.style.left = (e.clientX + 10) + 'px';
                    tooltip.style.top = (e.clientY + 10) + 'px';
                    tooltip.style.background = '#333';
                    tooltip.style.color = '#fff';
                    tooltip.style.padding = '5px';
                    tooltip.style.borderRadius = '3px';
                    tooltip.style.zIndex = '1000';
                    document.body.appendChild(tooltip);
                    this._tooltip = tooltip;
                }});
                
                el.addEventListener('mouseout', function() {{
                    if (this._tooltip) {{
                        document.body.removeChild(this._tooltip);
                        this._tooltip = null;
                    }}
                }});
            }}
            """
        
        elif element_type == 'highlight':
            # ハイライト効果
            highlight_color = action.get('color', '#ffcc00')
            original_styles = {}
            
            js_code += f"""
            var elements_{id(element)} = document.querySelectorAll('{selector}');
            for (var i = 0; i < elements_{id(element)}.length; i++) {{
                var el = elements_{id(element)}[i];
                // ハイライト前のスタイルを保存
                var original_fill = el.getAttribute('fill');
                var original_stroke = el.getAttribute('stroke');
                
                el.addEventListener('mouseover', function() {{
                    this.setAttribute('data-original-fill', this.getAttribute('fill'));
                    this.setAttribute('data-original-stroke', this.getAttribute('stroke'));
                    this.setAttribute('fill', '{highlight_color}');
                    this.setAttribute('stroke', '#ff0000');
                    this.setAttribute('stroke-width', '2');
                }});
                
                el.addEventListener('mouseout', function() {{
                    this.setAttribute('fill', this.getAttribute('data-original-fill'));
                    this.setAttribute('stroke', this.getAttribute('data-original-stroke'));
                    this.setAttribute('stroke-width', '1');
                }});
            }}
            """
        
        elif element_type == 'click':
            # クリックアクション
            click_action = action.get('code', '')
            js_code += f"""
            var elements_{id(element)} = document.querySelectorAll('{selector}');
            for (var i = 0; i < elements_{id(element)}.length; i++) {{
                var el = elements_{id(element)}[i];
                el.style.cursor = 'pointer';
                el.addEventListener('click', function() {{
                    {click_action}
                }});
            }}
            """
        
        elif element_type == 'link':
            # リンク
            url = action.get('url', '#')
            target = action.get('target', '_blank')
            js_code += f"""
            var elements_{id(element)} = document.querySelectorAll('{selector}');
            for (var i = 0; i < elements_{id(element)}.length; i++) {{
                var el = elements_{id(element)}[i];
                el.style.cursor = 'pointer';
                el.addEventListener('click', function() {{
                    window.open('{url}', '{target}');
                }});
            }}
            """
    
    # JavaScriptコードを終了
    js_code += """
    });
    ]]>
    """
    
    # スクリプト内容を設定
    script_element.appendChild(doc.createCDATASection(js_code.strip()))
    
    # スクリプト要素をSVGに追加
    svg_root.appendChild(script_element)
    
    # CSSスタイルを追加
    style_element = doc.createElement('style')
    style_element.setAttribute('type', 'text/css')
    style_content = """
    <![CDATA[
    .svg-tooltip {
        position: absolute;
        background: #333;
        color: #fff;
        padding: 5px;
        border-radius: 3px;
        z-index: 1000;
        font-family: Arial, sans-serif;
        font-size: 12px;
    }
    ]]>
    """
    style_element.appendChild(doc.createCDATASection(style_content.strip()))
    svg_root.appendChild(style_element)
    
    # 更新したSVGを保存
    with open(svg_file_path, 'w', encoding='utf-8') as file:
        file.write(doc.toxml())
    
    return svg_file_path
```

## SVGのバッチ処理

複数のダイアグラムをSVGにバッチ変換するユーティリティ：

```python
def batch_export_diagrams_to_svg(diagrams, output_dir, options=None, filename_template=None):
    """複数のダイアグラムをSVGファイルにバッチエクスポートする
    
    Args:
        diagrams: ダイアグラムデータのリスト（各要素はタイトルを含む辞書）
        output_dir: 出力ディレクトリ
        options: エクスポートオプション
        filename_template: ファイル名テンプレート（例: "diagram_{index}_{title}.svg"）
    
    Returns:
        エクスポートされたファイルパスのリスト
    """
    import os
    import re
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    if filename_template is None:
        filename_template = "diagram_{index}_{title}.svg"
    
    exported_files = []
    
    for i, diagram_data in enumerate(diagrams):
        diagram = diagram_data.get("diagram", {})
        title = diagram_data.get("title", f"diagram_{i}")
        
        # ファイル名に使えない文字を置換
        safe_title = re.sub(r'[\\/*?:"<>|]', "_", title)
        
        # ファイル名を生成
        filename = filename_template.format(index=i, title=safe_title)
        output_path = os.path.join(output_dir, filename)
        
        # SVGにエクスポート
        exported_file = export_diagram_to_svg_with_options(diagram, output_path, options)
        exported_files.append(exported_file)
    
    return exported_files
```

## SVGの最適化ユーティリティ

SVGファイルを最適化するためのユーティリティ関数を作成します：

```python
def optimize_svg(svg_file_path, optimization_level=2):
    """SVGファイルを最適化する
    
    Args:
        svg_file_path: SVGファイルのパス
        optimization_level: 最適化レベル（1=軽度、2=中度、3=高度）
    
    Returns:
        最適化されたSVGファイルのパス
    """
    try:
        from svgutils import transform
        import xml.etree.ElementTree as ET
        from lxml import etree
        import re
    except ImportError:
        raise ImportError("SVGの最適化には以下のパッケージが必要です: svgutils, lxml")
    
    # SVGファイルを読み込む
    with open(svg_file_path, 'r', encoding='utf-8') as file:
        svg_content = file.read()
    
    # 最適化レベル1: 基本的な最適化
    if optimization_level >= 1:
        # 空白文字の削除
        svg_content = re.sub(r'\s+', ' ', svg_content)
        svg_content = re.sub(r'>\s+<', '><', svg_content)
        
        # コメントの削除
        svg_content = re.sub(r'<!--.*?-->', '', svg_content)
    
    # 最適化レベル2: より高度な最適化
    if optimization_level >= 2:
        # 不要な属性を削除
        svg_content = re.sub(r'xmlns:xlink=".*?"', '', svg_content)
        svg_content = re.sub(r'xml:space=".*?"', '', svg_content)
        
        # 丸め処理（小数点以下の桁数を制限）
        svg_content = re.sub(r'(\d+\.\d{5})\d*', r'\1', svg_content)
    
    # 最適化レベル3: 構造的な最適化
    if optimization_level >= 3:
        # XMLとして解析して構造的な最適化を行う
        root = etree.fromstring(svg_content.encode('utf-8'))
        
        # 空のグループを削除
        for g in root.xpath('//g'):
            if len(g) == 0 and not g.text and not g.attrib:
                g.getparent().remove(g)
        
        # 冗長なネストを削除
        for g in root.xpath('//g'):
            if len(g) == 1 and g[0].tag == '{http://www.w3.org/2000/svg}g':
                child = g[0]
                for attr, value in g.attrib.items():
                    if attr in child.attrib:
                        continue
                    child.set(attr, value)
                
                parent = g.getparent()
                index = parent.index(g)
                parent.remove(g)
                parent.insert(index, child)
        
        # XMLをシリアライズ
        svg_content = etree.tostring(root, encoding='unicode')
    
    # 最適化したSVGを保存
    with open(svg_file_path, 'w', encoding='utf-8') as file:
        file.write(svg_content)
    
    return svg_file_path
```

## 実践例：複雑なダイアグラムのSVG出力

複雑なダイアグラムをSVGで出力し、さまざまなカスタマイズを適用する実践例：

```python
def create_and_export_complex_diagram():
    """複雑なダイアグラムを作成し、カスタマイズしたSVGとして出力する実践例"""
    # APIクライアントの初期化
    client = DrawioAPIClient()
    
    # 新しいダイアグラムを作成
    diagram = client.create_diagram(title="複雑なシステムアーキテクチャ")
    
    # フロントエンドコンテナを作成
    diagram, frontend_container = add_collapsible_container(
        client, diagram, "フロントエンド層", 100, 100, 700, 200,
        style="fillColor=#dae8fc;strokeColor=#6c8ebf;"
    )
    
    # フロントエンドコンポーネント
    components = [
        {"label": "Webアプリケーション", "x": 150, "y": 150, "width": 200, "height": 80},
        {"label": "モバイルアプリ", "x": 400, "y": 150, "width": 200, "height": 80},
        {"label": "デスクトップアプリ", "x": 650, "y": 150, "width": 200, "height": 80}
    ]
    
    frontend_components = []
    for comp in components:
        diagram, comp_id = client.add_node(
            diagram, comp["label"], comp["x"], comp["y"], comp["width"], comp["height"],
            "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
        )
        diagram["cells"][-1]["parent"] = frontend_container
        frontend_components.append(comp_id)
    
    # バックエンドコンテナを作成
    diagram, backend_container = add_collapsible_container(
        client, diagram, "バックエンド層", 100, 350, 700, 250,
        style="fillColor=#d5e8d4;strokeColor=#82b366;"
    )
    
    # バックエンドコンポーネント
    backend_comps = [
        {"label": "API Gateway", "x": 150, "y": 400, "width": 150, "height": 70},
        {"label": "認証サービス", "x": 350, "y": 400, "width": 150, "height": 70},
        {"label": "ビジネスロジック", "x": 550, "y": 400, "width": 150, "height": 70},
        {"label": "キャッシュ", "x": 350, "y": 500, "width": 150, "height": 70},
        {"label": "メッセージキュー", "x": 550, "y": 500, "width": 150, "height": 70}
    ]
    
    backend_component_ids = []
    for comp in backend_comps:
        diagram, comp_id = client.add_node(
            diagram, comp["label"], comp["x"], comp["y"], comp["width"], comp["height"],
            "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
        )
        diagram["cells"][-1]["parent"] = backend_container
        backend_component_ids.append(comp_id)
    
    # データ層コンテナを作成
    diagram, data_container = add_collapsible_container(
        client, diagram, "データ層", 100, 650, 700, 200,
        style="fillColor=#fff2cc;strokeColor=#d6b656;"
    )
    
    # データコンポーネント
    data_comps = [
        {"label": "リレーショナルDB", "x": 200, "y": 700, "width": 150, "height": 100,
         "style": "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#f5f5f5;strokeColor=#666666;"},
        {"label": "ドキュメントDB", "x": 400, "y": 700, "width": 150, "height": 100,
         "style": "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#f5f5f5;strokeColor=#666666;"},
        {"label": "オブジェクトストレージ", "x": 600, "y": 700, "width": 150, "height": 100,
         "style": "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#f5f5f5;strokeColor=#666666;"}
    ]
    
    data_component_ids = []
    for comp in data_comps:
        diagram, comp_id = client.add_node(
            diagram, comp["label"], comp["x"], comp["y"], comp["width"], comp["height"],
            comp["style"]
        )
        diagram["cells"][-1]["parent"] = data_container
        data_component_ids.append(comp_id)
    
    # コンポーネント間の接続
    # フロントエンド -> バックエンド
    for front_id in frontend_components:
        diagram = client.add_edge(
            diagram, front_id, backend_component_ids[0], "リクエスト",
            "endArrow=classic;startArrow=classic;html=1;rounded=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;"
        )
    
    # バックエンドコンポーネント間の接続
    for i in range(1, len(backend_component_ids)):
        diagram = client.add_edge(
            diagram, backend_component_ids[0], backend_component_ids[i], "",
            "endArrow=classic;html=1;rounded=0;"
        )
    
    # バックエンド -> データ層
    for i, db_id in enumerate(data_component_ids):
        diagram = client.add_edge(
            diagram, backend_component_ids[2], db_id, "",
            "endArrow=classic;startArrow=classic;html=1;rounded=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;"
        )
    
    # 外部システムを追加
    diagram, ext_cloud = client.add_node(
        diagram, "外部サービス", 900, 300, 200, 100,
        "ellipse;shape=cloud;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;"
    )
    
    # 外部システムとの接続
    diagram = client.add_edge(
        diagram, backend_component_ids[2], ext_cloud, "API呼び出し",
        "endArrow=classic;startArrow=classic;html=1;rounded=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;"
    )
    
    # 凡例を追加
    diagram, legend = client.add_node(
        diagram, "凡例：\n青: フロントエンド\n緑: バックエンド\n黄: データ層\n赤: 外部システム",
        900, 700, 200, 100,
        "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;align=left;"
    )
    
    # SVGエクスポートオプション
    svg_options = {
        "bg": "#ffffff",
        "scale": "1.2",
        "border": "20",
        "embedImages": "1",
        "transparency": "0",
        "shadow": "1"
    }
    
    # SVGエクスポート
    svg_file = export_diagram_to_svg_with_options(diagram, "complex_architecture.svg", svg_options)
    
    # SVGカスタマイズ
    customize_svg_output(svg_file, {
        "add_title": "システムアーキテクチャ図",
        "add_description": "フロントエンド、バックエンド、データ層の構造を示す図",
        "add_css": """
            .frontend-component:hover { fill: #a7c7ff; }
            .backend-component:hover { fill: #a7e8a5; }
            .data-component:hover { fill: #ffe3a0; }
        """,
        "add_class_to_elements": {
            "rect": "component"
        }
    })
    
    # インタラクティブ要素を追加
    add_interactivity_to_svg(svg_file, [
        {
            "type": "tooltip",
            "selector": ".component",
            "action": {"text": "コンポーネントをクリックして詳細を表示"}
        },
        {
            "type": "highlight",
            "selector": "g[id^='cell-'] rect",
            "action": {"color": "#ffcc00"}
        },
        {
            "type": "link",
            "selector": "g[id$='API Gateway']",
            "action": {"url": "https://example.com/api-docs", "target": "_blank"}
        }
    ])
    
    # SVGを最適化
    optimize_svg(svg_file, optimization_level=2)
    
    return svg_file
```

## SVG配置の自動最適化

ダイアグラム内の要素を自動的に最適配置し、SVGとして出力する関数：

```python
def optimize_diagram_layout_and_export_svg(diagram, output_path, layout_algorithm="force-directed"):
    """ダイアグラムのレイアウトを最適化し、SVGとして出力する
    
    Args:
        diagram: ダイアグラムデータ
        output_path: SVG出力パス
        layout_algorithm: 使用するレイアウトアルゴリズム
            - "force-directed": 力指向レイアウト
            - "hierarchical": 階層レイアウト
            - "circular": 円形レイアウト
    """
    # ノードとエッジのデータを抽出
    nodes = []
    edges = []
    
    for cell in diagram.get("cells", []):
        if "edge" in cell and cell["edge"]:
            # エッジ情報を抽出
            edges.append({
                "id": cell["id"],
                "source": cell["source"],
                "target": cell["target"]
            })
        elif "vertex" in cell and cell["vertex"]:
            # ノード情報を抽出
            geometry = cell.get("geometry", {})
            nodes.append({
                "id": cell["id"],
                "width": geometry.get("width", 100),
                "height": geometry.get("height", 50),
                "x": geometry.get("x", 0),
                "y": geometry.get("y", 0)
            })
    
    if layout_algorithm == "force-directed":
        # 力指向レイアウトアルゴリズムを適用
        nodes = apply_force_directed_layout(nodes, edges, iterations=100)
    elif layout_algorithm == "hierarchical":
        # 階層レイアウトアルゴリズムを適用
        nodes = apply_hierarchical_layout(nodes, edges)
    elif layout_algorithm == "circular":
        # 円形レイアウトアルゴリズムを適用
        nodes = apply_circular_layout(nodes)
    
    # 新しい座標をダイアグラムに適用
    node_map = {node["id"]: node for node in nodes}
    
    for cell in diagram["cells"]:
        if "vertex" in cell and cell["vertex"] and cell["id"] in node_map:
            node = node_map[cell["id"]]
            cell["geometry"]["x"] = node["x"]
            cell["geometry"]["y"] = node["y"]
    
    # SVGにエクスポート
    return export_diagram_to_svg(diagram, output_path)
```

階層レイアウトの実装例：

```python
def apply_hierarchical_layout(nodes, edges, x_spacing=200, y_spacing=100):
    """階層型レイアウトアルゴリズムを適用する"""
    # ノードの依存関係グラフを構築
    graph = {}
    for node in nodes:
        graph[node["id"]] = {"in": [], "out": []}
    
    for edge in edges:
        source = edge["source"]
        target = edge["target"]
        if source in graph and target in graph:
            graph[source]["out"].append(target)
            graph[target]["in"].append(source)
    
    # ノードのレベル（階層）を計算
    levels = {}
    remaining = list(graph.keys())
    
    # 入力エッジがないノードはレベル0
    current_level = 0
    while remaining:
        current_nodes = [node for node in remaining if all(in_edge not in remaining for in_edge in graph[node]["in"])]
        if not current_nodes:
            # サイクルが存在する場合、残りのノードを強制的に現在のレベルに配置
            current_nodes = remaining
        
        for node in current_nodes:
            levels[node] = current_level
            remaining.remove(node)
        
        current_level += 1
    
    # 各レベルでのノードの横位置を計算
    level_counts = {}
    level_positions = {}
    
    for node_id, level in levels.items():
        if level not in level_counts:
            level_counts[level] = 0
            level_positions[level] = []
        
        level_counts[level] += 1
        level_positions[level].append(node_id)
    
    # 座標を適用
    for level, node_ids in level_positions.items():
        total_nodes = len(node_ids)
        for i, node_id in enumerate(node_ids):
            for node in nodes:
                if node["id"] == node_id:
                    # 水平方向の位置を計算（均等分布）
                    node["x"] = 100 + (i * x_spacing)
                    # 垂直方向の位置を計算（レベルに基づく）
                    node["y"] = 100 + (level * y_spacing)
                    break
    
    return nodes
```

円形レイアウトの実装例：

```python
def apply_circular_layout(nodes, center_x=500, center_y=500, radius=300):
    """円形レイアウトアルゴリズムを適用する"""
    import math
    
    total_nodes = len(nodes)
    if total_nodes == 0:
        return nodes
    
    # 円周に沿ってノードを配置
    for i, node in enumerate(nodes):
        # 角度を計算（ラジアン）
        angle = 2 * math.pi * i / total_nodes
        
        # 座標を計算
        node["x"] = center_x + radius * math.cos(angle)
        node["y"] = center_y + radius * math.sin(angle)
    
    return nodes
```

## SEO最適化とアクセシビリティ

SEOとアクセシビリティに対応したSVGを生成する関数：

```python
def generate_accessible_svg(diagram, output_path, accessibility_options=None):
    """SEOとアクセシビリティに最適化されたSVGを生成する
    
    Args:
        diagram: ダイアグラムデータ
        output_path: SVG出力パス
        accessibility_options: アクセシビリティオプション
    """
    if accessibility_options is None:
        accessibility_options = {}
    
    # デフォルトオプション
    default_options = {
        "title": "ダイアグラム",
        "description": "ダイアグラムの説明",
        "language": "ja",
        "add_aria_labels": True,
        "add_role_attributes": True,
        "include_metadata": True,
        "author": "",
        "keywords": []
    }
    
    # オプションをマージ
    for key, value in default_options.items():
        if key not in accessibility_options:
            accessibility_options[key] = value
    
    # 基本的なSVGエクスポート
    export_diagram_to_svg(diagram, output_path)
    
    # SVGを読み込み
    with open(output_path, 'r', encoding='utf-8') as file:
        svg_content = file.read()
    
    # SVG名前空間の追加
    if 'xmlns:xlink' not in svg_content:
        svg_content = svg_content.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ', 1)
    
    # アクセシビリティ属性を追加
    if accessibility_options["add_role_attributes"]:
        # グラフィック要素にロール属性を追加
        import re
        svg_content = re.sub(r'<(rect|circle|ellipse|line|polyline|polygon|path|text)',
                          r'<\1 role="img"', svg_content)
        
        # SVG要素自体にロール属性を追加
        svg_content = svg_content.replace('<svg ', '<svg role="img" ', 1)
    
    # ARIA属性を追加
    if accessibility_options["add_aria_labels"]:
        # SVG要素にaria-labelledby属性を追加
        if '<title id="title">' not in svg_content:
            title_id = "diagramTitle"
            desc_id = "diagramDesc"
            
            # aria-labelledby属性を追加
            svg_content = svg_content.replace('<svg ', f'<svg aria-labelledby="{title_id} {desc_id}" ', 1)
            
            # タイトルとdesc要素を追加
            title_element = f'<title id="{title_id}">{accessibility_options["title"]}</title>'
            desc_element = f'<desc id="{desc_id}">{accessibility_options["description"]}</desc>'
            
            # SVG要素の直後に挿入
            svg_content = svg_content.replace('<svg ', f'<svg>{title_element}{desc_element}', 1)
    
    # メタデータを追加
    if accessibility_options["include_metadata"]:
        metadata = f"""<metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:dc="http://purl.org/dc/elements/1.1/">
        <rdf:Description rdf:about="">
            <dc:title>{accessibility_options["title"]}</dc:title>
            <dc:description>{accessibility_options["description"]}</dc:description>
            <dc:language>{accessibility_options["language"]}</dc:language>
            {'<dc:creator>' + accessibility_options["author"] + '</dc:creator>' if accessibility_options["author"] else ''}
            {'<dc:subject>' + ', '.join(accessibility_options["keywords"]) + '</dc:subject>' if accessibility_options["keywords"] else ''}
            <dc:format>image/svg+xml</dc:format>
        </rdf:Description>
    </rdf:RDF>
</metadata>"""
        
        # メタデータをSVG要素内に挿入
        if '<metadata>' not in svg_content:
            if '<title' in svg_content:
                # タイトル要素の後に挿入
                svg_content = svg_content.replace('</title>', '</title>' + metadata, 1)
            elif '<desc' in svg_content:
                # desc要素の後に挿入
                svg_content = svg_content.replace('</desc>', '</desc>' + metadata, 1)
            else:
                # SVG要素の開始直後に挿入
                svg_content = svg_content.replace('<svg ', '<svg>' + metadata, 1)
    
    # 変更をファイルに保存
    with open(output_path, 'w', encoding='utf-8') as file:
        file.write(svg_content)
    
    return output_path
```

## まとめ

この章では、Draw.ioで作成したダイアグラムをSVG形式で出力し、さまざまな方法でカスタマイズする方法を学びました。主なポイントは以下の通りです：

1. SVG形式の基本特性と利点（スケーラビリティ、編集可能性、軽量さなど）
2. Draw.ioダイアグラムをSVGにエクスポートする基本的な方法
3. SVG出力のカスタマイズオプション（背景色、スケール、境界線など）
4. SVGの後処理とカスタマイズ（タイトル、説明、CSSの追加など）
5. インタラクティブなSVG要素の追加（ツールチップ、ハイライト、クリックアクションなど）
6. 複数ダイアグラムのバッチ処理と最適化
7. 複雑なダイアグラムのSVG出力と各種カスタマイズの実践例
8. ダイアグラムレイアウトの自動最適化（力指向、階層型、円形レイアウトなど）
9. SEO最適化とアクセシビリティ対応のSVG生成

SVG形式は、Web上でのダイアグラム表示に最適な形式であり、その柔軟性と拡張性により、単なる静的画像を超えた様々な用途に活用できます。Draw.ioのAPIと組み合わせることで、カスタマイズ性の高い、インタラクティブなダイアグラムを効率的に生成できることが分かりました。

次の章では、SVG以外の画像形式（PNG、JPG、PDFなど）でのエクスポート方法について解説します。さまざまな用途に応じた適切な画像形式の選択肢と、それぞれの形式に最適化されたエクスポート方法を学びます。

## 練習問題

1. Draw.ioで作成したシステムアーキテクチャ図をSVGとしてエクスポートし、各コンポーネントにマウスホバーで説明が表示されるインタラクティブな要素を追加してください。

2. 以下の仕様に基づいてSVGエクスポートとカスタマイズを行う関数を実装してください：
   - 透過背景
   - 影の除去
   - 各ノードにクリックでウェブページへのリンクを追加
   - SVGファイルサイズの最適化

3. チームの組織図をSVG形式でエクスポートし、以下の機能を実装してください：
   - 部門ごとに異なる色でハイライト
   - 役職レベルに応じた階層表示
   - 各メンバーをクリックすると詳細情報が表示される機能
   - アクセシビリティ対応（スクリーンリーダー用のARIA属性など）

4. 特定のダイアグラム要素を強調表示するアニメーション効果をSVGに追加する関数を実装してください。（例：点滅、色の変化、サイズの拡大縮小など）

5. データベーススキーマ図をSVG形式でエクスポートし、テーブルの関係性を視覚的に強調するスクリプトを追加してください。特定のテーブルをクリックすると、そのテーブルに関連するすべてのテーブルとその関係が強調表示される機能を実装してください。