---
title: インタラクティブなダイアグラムの作成
---

前章では、データベース図の作成とカスタマイズについて学びました。この章では、より高度な機能として、インタラクティブなダイアグラムの作成方法について解説します。ユーザーとの対話性を高めたダイアグラムは、情報の理解を促進し、より効果的な視覚化を実現します。

## インタラクティブなダイアグラムの意義と用途

静的なダイアグラムも十分に情報を伝えることができますが、インタラクティブな要素を追加することで、以下のような利点があります：

1. **情報の階層化**: 詳細情報を隠しておき、必要に応じて表示することで、複雑な情報を整理できます
2. **ユーザーの関心に応じた表示**: ユーザーが興味のある部分だけを詳しく見ることができます
3. **動的なデータ表示**: リアルタイムデータやシミュレーション結果を視覚的に表現できます
4. **ナビゲーション補助**: 大規模なダイアグラムでの移動や探索をサポートします

インタラクティブなダイアグラムは、システム説明、教育コンテンツ、プレゼンテーション、意思決定支援ツールなど、様々な用途に活用できます。

## Draw.ioでのインタラクティブ要素

Draw.ioでは、様々なインタラクティブ要素を実装することができます。以下に主な機能を示します：

### 1. リンクとURLの追加

ノードやエッジにハイパーリンクを追加して、外部リソースや他のダイアグラムの部分にリンクすることができます：

```python
def add_node_with_link(client, diagram, label, x, y, width, height, url, style=""):
    """URLリンク付きのノードを追加する"""
    # リンク情報を含むスタイル
    link_style = f"{style}link={url};"
    
    # ノードを追加
    diagram = client.add_node(diagram, label, x, y, width, height, link_style)
    
    return diagram, diagram["cells"][-1]["id"]
```

### 2. ツールチップの追加

ノードにマウスを合わせたときに追加情報を表示するツールチップを設定できます：

```python
def add_node_with_tooltip(client, diagram, label, x, y, width, height, tooltip, style=""):
    """ツールチップ付きのノードを追加する"""
    # ツールチップ情報を含むスタイル
    tooltip_style = f"{style}tooltip={tooltip};"
    
    # ノードを追加
    diagram = client.add_node(diagram, label, x, y, width, height, tooltip_style)
    
    return diagram, diagram["cells"][-1]["id"]
```

### 3. 折りたたみ可能なコンテナ

関連する要素をグループ化し、折りたたみ/展開できるコンテナを作成することで、情報の階層化が可能になります：

```python
def add_collapsible_container(client, diagram, title, x, y, width, height, is_collapsed=False, style=""):
    """折りたたみ可能なコンテナを追加する"""
    # 基本スタイル
    base_style = "swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=30;fillColor=#dae8fc;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;strokeColor=#6c8ebf;"
    
    # 折りたたみ状態を設定
    if is_collapsed:
        base_style += "collapsed=1;"
    
    # 追加のスタイルを適用
    full_style = f"{base_style}{style}"
    
    # コンテナを追加
    diagram = client.add_node(diagram, title, x, y, width, height, full_style)
    container_id = diagram["cells"][-1]["id"]
    
    return diagram, container_id
```

### 4. タブ付きコンテナ

タブを切り替えることで異なる情報セットを表示するコンテナを作成できます：

```python
def create_tabbed_container(client, diagram, tabs, x, y, width, height):
    """タブ付きコンテナを作成する
    
    Args:
        tabs: タブ情報のリスト。各タブは {"title": "タブ名", "content": [{"label": "コンテンツラベル", "type": "ノード種類"}]} の形式
    """
    # メインコンテナを作成
    diagram, container_id = client.add_node(
        diagram, "", x, y, width, height,
        "swimlane;childLayout=stackLayout;resizeParent=1;resizeParentMax=0;horizontal=1;horizontalStack=0;strokeColor=none;fillColor=none;"
    )
    
    # タブヘッダーのコンテナを作成
    diagram, tabs_header_id = client.add_node(
        diagram, "", x, y, width, 30,
        "fillColor=none;strokeColor=none;swimlane;childLayout=stackLayout;resizeParent=1;resizeParentMax=0;horizontal=1;horizontalStack=1;points=[[0,0,0,0,0],[0,1,0,0,0],[1,0,0,0,0],[1,1,0,0,0]];"
    )
    diagram["cells"][-1]["parent"] = container_id
    
    # コンテンツエリアのコンテナを作成
    diagram, content_area_id = client.add_node(
        diagram, "", x, y + 30, width, height - 30,
        "fillColor=#f5f5f5;strokeColor=#666666;swimlane;collapsible=0;dropTarget=0;"
    )
    diagram["cells"][-1]["parent"] = container_id
    
    # 各タブとそのコンテンツを作成
    tab_content_ids = []
    
    for i, tab in enumerate(tabs):
        tab_width = width / len(tabs)
        
        # タブヘッダーを作成
        tab_style = "fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1;fontSize=12;"
        if i == 0:  # 最初のタブはアクティブに
            tab_style = "fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1;fontSize=12;fontColor=#0066CC;"
        
        diagram, tab_id = client.add_node(
            diagram, tab["title"], x + i * tab_width, y, tab_width, 30, tab_style
        )
        diagram["cells"][-1]["parent"] = tabs_header_id
        
        # タブのコンテンツエリアを作成
        content_style = "fillColor=none;strokeColor=none;swimlane;collapsible=0;dropTarget=0;"
        if i > 0:  # 最初以外は非表示に
            content_style += "visible=0;"
        
        diagram, content_id = client.add_node(
            diagram, "", x, y + 30, width, height - 30, content_style
        )
        diagram["cells"][-1]["parent"] = content_area_id
        tab_content_ids.append(content_id)
        
        # コンテンツの要素を追加
        if "content" in tab:
            y_offset = 20
            for item in tab["content"]:
                # コンテンツアイテムを追加
                diagram, _ = client.add_node(
                    diagram, item["label"], x + 10, y + 30 + y_offset, width - 20, 30,
                    "rounded=1;whiteSpace=wrap;html=1;fontSize=12;fillColor=#f9f9f9;strokeColor=#666666;"
                )
                diagram["cells"][-1]["parent"] = content_id
                y_offset += 40
    
    return diagram, container_id, tab_content_ids
```

### 5. インタラクティブなボタンとアクション

ユーザーがクリックするとアクションが実行されるボタンを追加できます：

```python
def add_action_button(client, diagram, label, x, y, width, height, action_type, target_id=None, style=""):
    """アクション付きのボタンを追加する
    
    Args:
        action_type: 'link', 'show', 'hide', 'toggle' などのアクションタイプ
        target_id: アクションの対象となる要素のID（必要な場合）
    """
    # 基本スタイル
    base_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    
    # アクション情報
    action_info = ""
    if action_type == "link" and target_id:
        action_info = f"link={target_id};"
    elif action_type == "show" and target_id:
        action_info = f"link=data:action/json,{{\"actions\":[{{\"show\":[\"{target_id}\"]}}]}};"
    elif action_type == "hide" and target_id:
        action_info = f"link=data:action/json,{{\"actions\":[{{\"hide\":[\"{target_id}\"]}}]}};"
    elif action_type == "toggle" and target_id:
        action_info = f"link=data:action/json,{{\"actions\":[{{\"toggle\":[\"{target_id}\"]}}]}};"
    
    # 追加のスタイルを適用
    full_style = f"{base_style}{action_info}{style}"
    
    # ボタンを追加
    diagram = client.add_node(diagram, label, x, y, width, height, full_style)
    button_id = diagram["cells"][-1]["id"]
    
    return diagram, button_id
```

## インタラクティブビューワーの実装

Draw.ioのダイアグラムをWebページに埋め込み、インタラクティブに表示するためのビューワーを実装します。

### 1. 基本的なビューワーHTMLの生成

```python
def generate_viewer_html(diagram_data, options=None):
    """Draw.ioダイアグラムを表示するHTMLを生成する"""
    if options is None:
        options = {}
    
    # デフォルトオプション
    default_options = {
        "title": "Diagram Viewer",
        "width": "100%",
        "height": "600px",
        "highlight_enabled": True,
        "lightbox": False,
        "nav": True,
        "zoom": True,
        "toolbar": True
    }
    
    # オプションをマージ
    for key, value in default_options.items():
        if key not in options:
            options[key] = value
    
    # ダイアグラムデータをBase64エンコード
    import base64
    import json
    encoded_data = base64.b64encode(json.dumps(diagram_data).encode('utf-8')).decode('utf-8')
    
    # HTML生成
    html = f"""<!DOCTYPE html>
<html>
<head>
    <title>{options['title']}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; }}
        .diagram-container {{ width: {options['width']}; height: {options['height']}; border: 1px solid #ddd; margin: 20px auto; }}
    </style>
    <script src="https://viewer.diagrams.net/js/viewer-static.min.js"></script>
</head>
<body>
    <div class="diagram-container" id="diagramContainer"></div>
    <script>
        // ダイアグラムデータをデコード
        const diagramData = JSON.parse(atob("{encoded_data}"));
        
        // ビューワー設定
        const config = {{
            highlight: {str(options['highlight_enabled']).lower()},
            lightbox: {str(options['lightbox']).lower()},
            nav: {str(options['nav']).lower()},
            zoom: {str(options['zoom']).lower()},
            toolbar: {str(options['toolbar']).lower()},
            "toolbar-buttons": "zoom layers lightbox",
            "toolbar-position": "top"
        }};
        
        // ビューワーを初期化
        const viewer = new GraphViewer(document.getElementById('diagramContainer'), config);
        viewer.setXmlData(JSON.stringify(diagramData));
    </script>
</body>
</html>"""
    
    return html
```

### 2. カスタマイズ可能なビューワーの実装

```python
def generate_enhanced_viewer_html(diagram_data, options=None):
    """拡張機能付きのDraw.ioダイアグラムビューワーHTMLを生成する"""
    if options is None:
        options = {}
    
    # デフォルトオプション
    default_options = {
        "title": "Enhanced Diagram Viewer",
        "width": "100%",
        "height": "600px",
        "highlight_enabled": True,
        "lightbox": False,
        "nav": True,
        "zoom": True,
        "toolbar": True,
        "dark_mode": False,
        "auto_fit": True,
        "enable_search": True,
        "custom_css": ""
    }
    
    # オプションをマージ
    for key, value in default_options.items():
        if key not in options:
            options[key] = value
    
    # ダイアグラムデータをBase64エンコード
    import base64
    import json
    encoded_data = base64.b64encode(json.dumps(diagram_data).encode('utf-8')).decode('utf-8')
    
    # ダークモード用のスタイル
    dark_mode_style = """
        body { background-color: #2d2d2d; color: #f0f0f0; }
        .diagram-container { border-color: #444; }
        .controls { background-color: #333; border-color: #444; }
        .controls button { background-color: #444; color: #f0f0f0; border-color: #555; }
        .controls button:hover { background-color: #555; }
        .search-box { background-color: #333; color: #f0f0f0; border-color: #444; }
    """
    
    # HTML生成
    html = f"""<!DOCTYPE html>
<html>
<head>
    <title>{options['title']}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; transition: background-color 0.3s; }}
        .diagram-container {{ width: {options['width']}; height: {options['height']}; border: 1px solid #ddd; margin: 20px auto; overflow: hidden; position: relative; }}
        .controls {{ display: flex; gap: 10px; padding: 10px; border-bottom: 1px solid #ddd; background: #f9f9f9; }}
        .controls button {{ padding: 5px 10px; cursor: pointer; background: #fff; border: 1px solid #ddd; border-radius: 4px; }}
        .controls button:hover {{ background: #f0f0f0; }}
        .search-box {{ padding: 5px; border: 1px solid #ddd; border-radius: 4px; margin-left: auto; }}
        .highlight {{ animation: pulse 1.5s infinite; }}
        @keyframes pulse {{ 0% {{ opacity: 1; }} 50% {{ opacity: 0.5; }} 100% {{ opacity: 1; }} }}
        {dark_mode_style if options['dark_mode'] else ''}
        {options['custom_css']}
    </style>
    <script src="https://viewer.diagrams.net/js/viewer-static.min.js"></script>
</head>
<body class="{('dark-mode' if options['dark_mode'] else '')}">
    <div class="controls">
        <button id="zoomIn">拡大 (+)</button>
        <button id="zoomOut">縮小 (-)</button>
        <button id="zoomFit">全体表示</button>
        <button id="toggleDarkMode">ダークモード切替</button>
        {('<input type="text" class="search-box" id="searchBox" placeholder="検索..." />' if options['enable_search'] else '')}
    </div>
    <div class="diagram-container" id="diagramContainer"></div>
    <script>
        // ダイアグラムデータをデコード
        const diagramData = JSON.parse(atob("{encoded_data}"));
        
        // ビューワー設定
        const config = {{
            highlight: {str(options['highlight_enabled']).lower()},
            lightbox: {str(options['lightbox']).lower()},
            nav: {str(options['nav']).lower()},
            zoom: {str(options['zoom']).lower()},
            toolbar: {str(options['toolbar']).lower()},
            "toolbar-buttons": "zoom layers lightbox",
            "toolbar-position": "top"
        }};
        
        // ビューワーを初期化
        const viewer = new GraphViewer(document.getElementById('diagramContainer'), config);
        viewer.setXmlData(JSON.stringify(diagramData));
        
        // 自動フィット
        if ({str(options['auto_fit']).lower()}) {{
            setTimeout(() => viewer.fit(), 500);
        }}
        
        // コントロールの機能実装
        document.getElementById('zoomIn').addEventListener('click', () => viewer.zoomIn());
        document.getElementById('zoomOut').addEventListener('click', () => viewer.zoomOut());
        document.getElementById('zoomFit').addEventListener('click', () => viewer.fit());
        
        // ダークモード切替
        document.getElementById('toggleDarkMode').addEventListener('click', () => {{
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            
            // 背景色を変更
            if (isDark) {{
                document.body.style.backgroundColor = '#2d2d2d';
                document.body.style.color = '#f0f0f0';
            }} else {{
                document.body.style.backgroundColor = '';
                document.body.style.color = '';
            }}
        }});
        
        // 検索機能
        if (document.getElementById('searchBox')) {{
            document.getElementById('searchBox').addEventListener('input', (e) => {{
                const searchTerm = e.target.value.toLowerCase();
                
                // 検索語が空の場合はハイライトをクリア
                if (!searchTerm) {{
                    viewer.hideToolbar();
                    return;
                }}
                
                // ノードのテキストコンテンツを検索
                const nodes = viewer.graph.getModel().cells;
                let found = false;
                
                for (const id in nodes) {{
                    const cell = nodes[id];
                    if (cell.value && typeof cell.value === 'string' && cell.value.toLowerCase().includes(searchTerm)) {{
                        viewer.highlight(cell);
                        found = true;
                    }}
                }}
                
                if (!found) {{
                    viewer.hideToolbar();
                }}
            }});
        }}
    </script>
</body>
</html>"""
    
    return html
```

### 3. 埋め込み用のIFrameコード生成

```python
def generate_iframe_embed_code(html_file_url, width="100%", height="600px"):
    """HTMLビューワーを埋め込むためのiframeコードを生成する"""
    iframe_code = f'<iframe src="{html_file_url}" width="{width}" height="{height}" frameborder="0" allowfullscreen></iframe>'
    return iframe_code
```

## 実践例：インタラクティブなシステムアーキテクチャ図

ここでは、インタラクティブなシステムアーキテクチャ図を作成する実践例を示します。この例では、詳細情報を隠したり表示したりできる折りたたみ可能なコンポーネントや、コンポーネント間の関係を強調表示するボタンなどの機能を実装します。

```python
def create_interactive_architecture_diagram():
    """インタラクティブなシステムアーキテクチャ図を作成する"""
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="インタラクティブシステムアーキテクチャ")
    
    # 主要なレイヤーを作成
    # 1. ユーザーインターフェース層
    diagram, ui_layer_id = add_collapsible_container(
        client, diagram, "ユーザーインターフェース層", 100, 100, 600, 200,
        style="fillColor=#dae8fc;strokeColor=#6c8ebf;"
    )
    
    # UI層のコンポーネント
    diagram, web_ui_id = client.add_node(
        diagram, "Webインターフェース", 130, 150, 160, 60,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = ui_layer_id
    
    diagram, mobile_ui_id = client.add_node(
        diagram, "モバイルアプリ", 320, 150, 160, 60,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = ui_layer_id
    
    diagram, admin_ui_id = client.add_node(
        diagram, "管理画面", 510, 150, 160, 60,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = ui_layer_id
    
    # 2. API/サービス層
    diagram, api_layer_id = add_collapsible_container(
        client, diagram, "API/サービス層", 100, 320, 600, 200,
        style="fillColor=#d5e8d4;strokeColor=#82b366;"
    )
    
    # API層のコンポーネント
    diagram, rest_api_id = client.add_node(
        diagram, "REST API", 150, 370, 120, 60,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = api_layer_id
    
    diagram, auth_service_id = client.add_node(
        diagram, "認証サービス", 300, 370, 120, 60,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = api_layer_id
    
    diagram, notification_id = client.add_node(
        diagram, "通知サービス", 450, 370, 120, 60,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = api_layer_id
    
    # 3. データ層
    diagram, data_layer_id = add_collapsible_container(
        client, diagram, "データ層", 100, 540, 600, 200,
        style="fillColor=#fff2cc;strokeColor=#d6b656;"
    )
    
    # データ層のコンポーネント
    diagram, database_id = client.add_node(
        diagram, "メインデータベース", 160, 590, 160, 60,
        "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = data_layer_id
    
    diagram, cache_id = client.add_node(
        diagram, "キャッシュ", 360, 590, 120, 60,
        "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = data_layer_id
    
    diagram, file_storage_id = client.add_node(
        diagram, "ファイルストレージ", 520, 590, 120, 60,
        "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = data_layer_id
    
    # 4. 外部システム
    diagram, external_layer_id = add_collapsible_container(
        client, diagram, "外部システム", 730, 100, 250, 400,
        style="fillColor=#e1d5e7;strokeColor=#9673a6;"
    )
    
    # 外部システムのコンポーネント
    diagram, payment_id = client.add_node(
        diagram, "決済システム", 780, 150, 150, 60,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = external_layer_id
    
    diagram, email_id = client.add_node(
        diagram, "メール配信", 780, 250, 150, 60,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = external_layer_id
    
    diagram, analytics_id = client.add_node(
        diagram, "分析サービス", 780, 350, 150, 60,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = external_layer_id
    
    # コンポーネント間の接続を追加
    # UI層 -> API層
    diagram = client.add_edge(
        diagram, web_ui_id, rest_api_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    diagram = client.add_edge(
        diagram, mobile_ui_id, rest_api_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    diagram = client.add_edge(
        diagram, admin_ui_id, rest_api_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # UI層 -> 認証サービス
    diagram = client.add_edge(
        diagram, web_ui_id, auth_service_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    diagram = client.add_edge(
        diagram, mobile_ui_id, auth_service_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    diagram = client.add_edge(
        diagram, admin_ui_id, auth_service_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # API層 -> データ層
    diagram = client.add_edge(
        diagram, rest_api_id, database_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    diagram = client.add_edge(
        diagram, rest_api_id, cache_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    diagram = client.add_edge(
        diagram, rest_api_id, file_storage_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # サービス -> 外部システム
    diagram = client.add_edge(
        diagram, rest_api_id, payment_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    diagram = client.add_edge(
        diagram, notification_id, email_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    diagram = client.add_edge(
        diagram, rest_api_id, analytics_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # 詳細情報コンテナ（折りたたみ可能）を追加
    diagram, details_id = add_collapsible_container(
        client, diagram, "コンポーネント詳細", 100, 760, 880, 200,
        is_collapsed=True,  # デフォルトで折りたたむ
        style="fillColor=#f8cecc;strokeColor=#b85450;"
    )
    
    # 各コンポーネントの詳細情報
    component_details = [
        {
            "title": "REST API",
            "details": "・Node.js Express\n・JWT認証\n・レート制限\n・エンドポイントバージョニング"
        },
        {
            "title": "認証サービス",
            "details": "・OAuth2.0対応\n・SAML連携\n・多要素認証\n・アクセス制御"
        },
        {
            "title": "メインデータベース",
            "details": "・PostgreSQL\n・マスター/スレーブ構成\n・自動バックアップ\n・クエリキャッシング"
        }
    ]
    
    # 詳細情報を追加
    for i, detail in enumerate(component_details):
        x_pos = 120 + i * 290
        diagram, _ = client.add_node(
            diagram, f"<b>{detail['title']}</b><hr>{detail['details']}",
            x_pos, 800, 280, 150,
            "rounded=1;whiteSpace=wrap;html=1;fillColor=#f9f9f9;strokeColor=#666666;align=left;verticalAlign=top;"
        )
        diagram["cells"][-1]["parent"] = details_id
    
    # 説明用のノートを追加
    diagram, note_id = client.add_node(
        diagram, "このダイアグラムはインタラクティブです。各レイヤーの + / - ボタンをクリックして展開/折りたたみができます。詳細情報セクションでは各コンポーネントの追加情報を確認できます。",
        100, 50, 880, 40,
        "shape=note;strokeWidth=2;fontSize=14;size=20;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontColor=#666600;"
    )
    
    # 表示/非表示を制御するボタンを追加
    diagram, show_details_btn = add_action_button(
        client, diagram, "詳細情報を表示", 400, 720, 120, 30, "toggle", details_id,
        style="fillColor=#f8cecc;strokeColor=#b85450;fontSize=12;"
    )
    
    # レジェンド（凡例）を追加
    diagram, legend_id = client.add_node(
        diagram, "レジェンド：\n● UI層\n● API/サービス層\n● データ層\n● 外部システム",
        740, 540, 230, 120,
        "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;align=left;fontSize=12;fillColor=#ffffff;strokeColor=#000000;"
    )
    
    return diagram
```

## 実践例：インタラクティブなビジネスプロセス図

次に、インタラクティブなビジネスプロセス図の作成例を示します。この例では、プロセスのフローを段階的に表示したり、各ステップの詳細情報をリンクで参照できるようにしたりする機能を実装します。

```python
def create_interactive_process_diagram():
    """インタラクティブなビジネスプロセス図を作成する"""
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="インタラクティブビジネスプロセス")
    
    # 主要なアクター（レーン）を定義
    diagram, swimlane_container = client.add_node(
        diagram, "", 100, 100, 700, 600,
        "swimlane;childLayout=stackLayout;resizeParent=1;resizeParentMax=0;horizontal=1;startSize=20;horizontalStack=0;html=1;fillColor=none;strokeColor=#000000;"
    )
    
    # 顧客レーン
    diagram, customer_lane = client.add_node(
        diagram, "顧客", 100, 120, 700, 150,
        "swimlane;startSize=20;horizontal=0;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
    )
    diagram["cells"][-1]["parent"] = swimlane_container
    
    # 販売部門レーン
    diagram, sales_lane = client.add_node(
        diagram, "販売部門", 100, 270, 700, 150,
        "swimlane;startSize=20;horizontal=0;html=1;fillColor=#d5e8d4;strokeColor=#82b366;"
    )
    diagram["cells"][-1]["parent"] = swimlane_container
    
    # 製造部門レーン
    diagram, manufacturing_lane = client.add_node(
        diagram, "製造部門", 100, 420, 700, 150,
        "swimlane;startSize=20;horizontal=0;html=1;fillColor=#fff2cc;strokeColor=#d6b656;"
    )
    diagram["cells"][-1]["parent"] = swimlane_container
    
    # 物流部門レーン
    diagram, logistics_lane = client.add_node(
        diagram, "物流部門", 100, 570, 700, 150,
        "swimlane;startSize=20;horizontal=0;html=1;fillColor=#f8cecc;strokeColor=#b85450;"
    )
    diagram["cells"][-1]["parent"] = swimlane_container
    
    # プロセスフローの作成：顧客レーンのステップ
    diagram, inquire_id = client.add_node(
        diagram, "問い合わせ", 150, 170, 100, 50,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = customer_lane
    
    diagram, order_id = client.add_node(
        diagram, "注文", 350, 170, 100, 50,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = customer_lane
    
    diagram, receive_id = client.add_node(
        diagram, "商品受取", 650, 170, 100, 50,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = customer_lane
    
    # 販売部門レーンのステップ
    diagram, respond_id = client.add_node(
        diagram, "問い合わせ対応", 250, 320, 100, 50,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = sales_lane
    
    diagram, process_order_id = client.add_node(
        diagram, "注文処理", 450, 320, 100, 50,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = sales_lane
    
    # 製造部門レーンのステップ
    diagram, production_id = client.add_node(
        diagram, "製品製造", 450, 470, 100, 50,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = manufacturing_lane
    
    # 物流部門レーンのステップ
    diagram, shipping_id = client.add_node(
        diagram, "出荷準備", 550, 620, 100, 50,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    )
    diagram["cells"][-1]["parent"] = logistics_lane
    
    # フロー接続
    # 問い合わせ -> 問い合わせ対応
    diagram = client.add_edge(
        diagram, inquire_id, respond_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # 問い合わせ対応 -> 注文
    diagram = client.add_edge(
        diagram, respond_id, order_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # 注文 -> 注文処理
    diagram = client.add_edge(
        diagram, order_id, process_order_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # 注文処理 -> 製品製造
    diagram = client.add_edge(
        diagram, process_order_id, production_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # 製品製造 -> 出荷準備
    diagram = client.add_edge(
        diagram, production_id, shipping_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # 出荷準備 -> 商品受取
    diagram = client.add_edge(
        diagram, shipping_id, receive_id, "",
        "endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # 詳細情報のポップアップ/ツールチップを追加
    # 各ステップに詳細情報ツールチップを追加
    steps_details = {
        inquire_id: "顧客が電話、メール、またはWebフォームから問い合わせを行います。平均応答時間：1営業日以内",
        respond_id: "販売担当者が顧客の問い合わせに対応し、製品情報や価格を提供します。",
        order_id: "顧客がオンラインシステムまたは注文書で製品を注文します。通常の注文処理時間：1時間以内",
        process_order_id: "注文が在庫確認され、財務承認が行われます。必要に応じて製造指示が発行されます。",
        production_id: "製品が製造工程に入ります。標準的な製造リードタイム：2-5営業日",
        shipping_id: "製品が梱包され、配送のための準備が行われます。配送時間：国内1-3日、国際3-7日",
        receive_id: "顧客が製品を受け取り、必要に応じて受領確認を行います。問題がある場合は返品手続きを開始します。"
    }
    
    # 各ステップにツールチップを追加
    for step_id, detail in steps_details.items():
        # 該当するセルを探す
        for i, cell in enumerate(diagram["cells"]):
            if cell["id"] == step_id:
                # ツールチップ情報を追加
                diagram["cells"][i]["style"] += "tooltip=" + detail + ";"
                break
    
    # インタラクティブ機能のための説明ノートを追加
    diagram, note_id = client.add_node(
        diagram, "このプロセス図はインタラクティブです。各ステップにマウスを合わせると詳細が表示されます。",
        100, 50, 700, 30,
        "shape=note;strokeWidth=2;fontSize=14;size=20;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontColor=#666600;"
    )
    
    # タイムライン表示のためのボタンを追加
    # フェーズ1: 問い合わせと注文フェーズ
    diagram, phase1_btn = add_action_button(
        client, diagram, "フェーズ1: 問い合わせ〜注文", 100, 720, 200, 30, "show", 
        f"{inquire_id},{respond_id},{order_id}",
        style="fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;"
    )
    
    # フェーズ2: 処理と製造フェーズ
    diagram, phase2_btn = add_action_button(
        client, diagram, "フェーズ2: 注文処理〜製造", 320, 720, 200, 30, "show",
        f"{process_order_id},{production_id}",
        style="fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;"
    )
    
    # フェーズ3: 出荷と受取フェーズ
    diagram, phase3_btn = add_action_button(
        client, diagram, "フェーズ3: 出荷〜受取", 540, 720, 200, 30, "show",
        f"{shipping_id},{receive_id}",
        style="fillColor=#f8cecc;strokeColor=#b85450;fontSize=12;"
    )
    
    # 全工程表示ボタン
    diagram, show_all_btn = add_action_button(
        client, diagram, "全工程を表示", 320, 760, 200, 30, "show",
        f"{inquire_id},{respond_id},{order_id},{process_order_id},{production_id},{shipping_id},{receive_id}",
        style="fillColor=#e1d5e7;strokeColor=#9673a6;fontSize=12;"
    )
    
    return diagram
```

## ユーザー定義のインタラクションの実装

より高度なインタラクティブ機能を実装するために、ユーザー定義のJavaScriptアクションを組み込むことができます。

### 1. カスタムアクションの定義

```python
def add_custom_action_node(client, diagram, label, x, y, width, height, custom_action, style=""):
    """カスタムJavaScriptアクションを持つノードを追加する"""
    # 基本スタイル
    base_style = "rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
    
    # JavaScriptアクションを含むリンク
    js_action = f"data:action/json,{{\"actions\":[{{\"onClick\":\"{custom_action}\"}}]}}"
    
    # リンク情報を含むスタイル
    action_style = f"{base_style}{style}link={js_action};"
    
    # ノードを追加
    diagram = client.add_node(diagram, label, x, y, width, height, action_style)
    
    return diagram, diagram["cells"][-1]["id"]
```

### 2. カスタムビューワーHTMLの拡張

```python
def generate_custom_viewer_html(diagram_data, custom_actions=None, options=None):
    """カスタムアクションをサポートするビューワーHTMLを生成する"""
    if custom_actions is None:
        custom_actions = {}
    
    if options is None:
        options = {}
    
    # デフォルトオプション
    default_options = {
        "title": "Interactive Diagram with Custom Actions",
        "width": "100%",
        "height": "600px",
    }
    
    # オプションをマージ
    for key, value in default_options.items():
        if key not in options:
            options[key] = value
    
    # ダイアグラムデータをBase64エンコード
    import base64
    import json
    encoded_data = base64.b64encode(json.dumps(diagram_data).encode('utf-8')).decode('utf-8')
    
    # カスタムアクション関数を生成
    custom_action_functions = ""
    for action_name, action_code in custom_actions.items():
        custom_action_functions += f"""
        function {action_name}(cell) {{
            {action_code}
        }}
        """
    
    # HTML生成
    html = f"""<!DOCTYPE html>
<html>
<head>
    <title>{options['title']}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; }}
        .diagram-container {{ width: {options['width']}; height: {options['height']}; border: 1px solid #ddd; margin: 20px auto; }}
        .custom-modal {{ display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; 
                      overflow: auto; background-color: rgba(0,0,0,0.4); }}
        .modal-content {{ background-color: #fefefe; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%; }}
        .close-btn {{ color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer; }}
        .close-btn:hover {{ color: black; }}
    </style>
    <script src="https://viewer.diagrams.net/js/viewer-static.min.js"></script>
</head>
<body>
    <div class="diagram-container" id="diagramContainer"></div>
    <div class="custom-modal" id="customModal">
        <div class="modal-content">
            <span class="close-btn" id="closeModal">&times;</span>
            <h2 id="modalTitle">詳細情報</h2>
            <div id="modalContent"></div>
        </div>
    </div>
    
    <script>
        // ダイアグラムデータをデコード
        const diagramData = JSON.parse(atob("{encoded_data}"));
        
        // モーダル要素
        const modal = document.getElementById('customModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        const closeModal = document.getElementById('closeModal');
        
        // モーダルを閉じる
        closeModal.onclick = function() {{
            modal.style.display = "none";
        }}
        
        // モーダル外クリックで閉じる
        window.onclick = function(event) {{
            if (event.target == modal) {{
                modal.style.display = "none";
            }}
        }}
        
        // カスタムアクション関数
        {custom_action_functions}
        
        // カスタムアクションを処理する関数
        function handleCustomAction(action, cell) {{
            if (typeof window[action] === 'function') {{
                window[action](cell);
            }}
        }}
        
        // ビューワー設定
        const config = {{
            highlight: true,
            lightbox: false,
            nav: true,
            zoom: true,
            "toolbar-buttons": "zoom layers lightbox",
            "toolbar-position": "top",
            tooltips: true,
            "link-target": "_self",
            "link-callback": function(link, cell) {{
                if (link && link.startsWith('data:action/json,')) {{
                    try {{
                        const json = JSON.parse(decodeURIComponent(link.substring(16)));
                        if (json.actions && json.actions.length > 0) {{
                            const action = json.actions[0];
                            if (action.onClick) {{
                                handleCustomAction(action.onClick, cell);
                                return true; // リンクのデフォルト動作を防止
                            }}
                        }}
                    }} catch (e) {{
                        console.error('JSONパースエラー:', e);
                    }}
                }}
                return false; // デフォルトのリンク動作を許可
            }}
        }};
        
        // ビューワーを初期化
        const viewer = new GraphViewer(document.getElementById('diagramContainer'), config);
        viewer.setXmlData(JSON.stringify(diagramData));
    </script>
</body>
</html>"""
    
    return html
```

### 3. アプリケーション実装例

```python
def create_interactive_app_diagram():
    """カスタムアクションを持つアプリケーション図を作成する"""
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="インタラクティブアプリケーション")
    
    # メインコンポーネントを作成
    diagram, frontend_id = client.add_node(
        diagram, "フロントエンド", 350, 150, 200, 100,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
    )
    
    diagram, backend_id = client.add_node(
        diagram, "バックエンド", 350, 350, 200, 100,
        "rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;"
    )
    
    diagram, database_id = client.add_node(
        diagram, "データベース", 350, 550, 200, 100,
        "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;fillColor=#fff2cc;strokeColor=#d6b656;"
    )
    
    # コンポーネント接続
    diagram = client.add_edge(
        diagram, frontend_id, backend_id, "API呼び出し",
        "endArrow=classic;startArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    diagram = client.add_edge(
        diagram, backend_id, database_id, "クエリ/更新",
        "endArrow=classic;startArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;"
    )
    
    # カスタムアクションボタンを追加
    diagram, frontend_btn = add_custom_action_node(
        client, diagram, "フロントエンド詳細", 100, 150, 150, 50, "showFrontendDetails",
        style="fillColor=#dae8fc;strokeColor=#6c8ebf;"
    )
    
    diagram, backend_btn = add_custom_action_node(
        client, diagram, "バックエンド詳細", 100, 350, 150, 50, "showBackendDetails",
        style="fillColor=#d5e8d4;strokeColor=#82b366;"
    )
    
    diagram, db_btn = add_custom_action_node(
        client, diagram, "データベース詳細", 100, 550, 150, 50, "showDatabaseDetails",
        style="fillColor=#fff2cc;strokeColor=#d6b656;"
    )
    
    diagram, metrics_btn = add_custom_action_node(
        client, diagram, "パフォーマンス指標", 600, 350, 150, 50, "showPerformanceMetrics",
        style="fillColor=#e1d5e7;strokeColor=#9673a6;"
    )
    
    return diagram
```

### 4. カスタムアクションの定義と HTML 生成

```python
def generate_app_diagram_html(diagram):
    """アプリケーション図用のHTMLを生成する"""
    # カスタムアクションを定義
    custom_actions = {
        "showFrontendDetails": """
            modalTitle.textContent = 'フロントエンド詳細';
            modalContent.innerHTML = `
                <h3>技術スタック</h3>
                <ul>
                    <li>React.js 18.0</li>
                    <li>Redux für state management</li>
                    <li>Material UI コンポーネント</li>
                    <li>SASS スタイリング</li>
                </ul>
                
                <h3>主要機能</h3>
                <ul>
                    <li>レスポンシブUI</li>
                    <li>認証・認可</li>
                    <li>データ可視化</li>
                    <li>オフライン対応</li>
                </ul>
                
                <h3>デプロイ</h3>
                <p>AWS CloudFront + S3</p>
            `;
            modal.style.display = "block";
        """,
        
        "showBackendDetails": """
            modalTitle.textContent = 'バックエンド詳細';
            modalContent.innerHTML = `
                <h3>技術スタック</h3>
                <ul>
                    <li>Node.js with Express</li>
                    <li>GraphQL API</li>
                    <li>認証: JWT + OAuth2.0</li>
                    <li>バリデーション: joi</li>
                </ul>
                
                <h3>主要機能</h3>
                <ul>
                    <li>RESTful API</li>
                    <li>WebSocketサポート</li>
                    <li>タスクキュー</li>
                    <li>ファイルアップロード処理</li>
                </ul>
                
                <h3>デプロイ</h3>
                <p>AWS Elastic Beanstalk</p>
            `;
            modal.style.display = "block";
        """,
        
        "showDatabaseDetails": """
            modalTitle.textContent = 'データベース詳細';
            modalContent.innerHTML = `
                <h3>データベース構成</h3>
                <ul>
                    <li>PostgreSQL (メインDB)</li>
                    <li>Redis (キャッシュ)</li>
                    <li>Amazon S3 (ファイルストレージ)</li>
                </ul>
                
                <h3>データモデル</h3>
                <ul>
                    <li>ユーザー・認証情報</li>
                    <li>プロジェクト・タスク管理</li>
                    <li>顧客・取引データ</li>
                    <li>分析・レポート用データ</li>
                </ul>
                
                <h3>バックアップ戦略</h3>
                <p>日次バックアップ + ポイントインタイムリカバリ</p>
            `;
            modal.style.display = "block";
        """,
        
        "showPerformanceMetrics": """
            modalTitle.textContent = 'パフォーマンス指標';
            modalContent.innerHTML = `
                <h3>リアルタイムメトリクス</h3>
                <div style="display: flex; justify-content: space-between;">
                    <div style="text-align: center; padding: 10px; border: 1px solid #ddd; border-radius: 5px; width: 30%;">
                        <h4>応答時間</h4>
                        <div style="font-size: 24px; font-weight: bold; color: green;">128ms</div>
                        <div style="color: gray; font-size: 12px;">前週比 -12%</div>
                    </div>
                    <div style="text-align: center; padding: 10px; border: 1px solid #ddd; border-radius: 5px; width: 30%;">
                        <h4>CPU使用率</h4>
                        <div style="font-size: 24px; font-weight: bold; color: orange;">65%</div>
                        <div style="color: gray; font-size: 12px;">前週比 +8%</div>
                    </div>
                    <div style="text-align: center; padding: 10px; border: 1px solid #ddd; border-radius: 5px; width: 30%;">
                        <h4>メモリ使用率</h4>
                        <div style="font-size: 24px; font-weight: bold; color: blue;">42%</div>
                        <div style="color: gray; font-size: 12px;">前週比 -5%</div>
                    </div>
                </div>
                
                <h3>アプリケーションメトリクス</h3>
                <ul>
                    <li>平均ページロード時間: 1.2秒</li>
                    <li>アクティブユーザー: 1,245人</li>
                    <li>エラー率: 0.5%</li>
                    <li>成功トランザクション: 99.5%</li>
                </ul>
            `;
            modal.style.display = "block";
        """
    }
    
    # カスタムビューワーHTMLを生成
    html = generate_custom_viewer_html(
        diagram,
        custom_actions=custom_actions,
        options={
            "title": "インタラクティブアプリケーション図",
            "width": "90%",
            "height": "700px"
        }
    )
    
    return html
```

## まとめ

この章では、Draw.ioを使ったインタラクティブなダイアグラムの作成方法について学びました。主なポイントは以下の通りです：

1. インタラクティブなダイアグラムの意義と用途
2. Draw.ioでのインタラクティブ要素（リンク、ツールチップ、折りたたみ可能なコンテナなど）
3. インタラクティブビューワーの実装方法
4. システムアーキテクチャ図とビジネスプロセス図の実践例
5. ユーザー定義のインタラクションの実装（カスタムアクション、モーダルダイアログなど）

インタラクティブなダイアグラムは、単なる静的な図よりも情報の伝達効果が高く、ユーザーの理解を促進します。特に複雑なシステムやプロセスを表現する場合に有効です。Draw.ioのAPIを使うことで、これらのインタラクティブな要素を簡単に実装し、Webアプリケーションやドキュメントに組み込むことができます。

次の章では、Draw.ioとデータ可視化ライブラリを組み合わせた、動的なデータ駆動型ダイアグラムの作成方法について学びます。リアルタイムデータの表示や時系列データの視覚化など、より高度なテクニックを解説します。

## 練習問題

1. 折りたたみ可能なコンテナを使用して、3層のネットワークアーキテクチャ（DMZ、ミドルウェア層、データベース層）を表現するインタラクティブなダイアグラムを作成してください。各層には少なくとも3つのコンポーネントを含めてください。

2. ツールチップ機能を使用して、ソフトウェア開発ライフサイクル（要件定義、設計、実装、テスト、デプロイ、保守）を表現するプロセス図を作成してください。各ステップにはツールチップを使って詳細情報を追加してください。

3. カスタムアクションを使用して、クリックすると関連するコンポーネントがハイライトされるマイクロサービスアーキテクチャ図を作成してください。少なくとも5つのマイクロサービスと、それらの相互依存関係を含めてください。

4. タブ付きコンテナを使用して、プロジェクト計画の異なるフェーズ（初期化、計画、実行、監視、終了）を表示するダイアグラムを作成してください。各タブには、そのフェーズの主要なタスクと成果物を含めてください。

5. このチャプターで学んだ技術を組み合わせて、インタラクティブな組織図を作成してください。組織図には部門の折りたたみ/展開機能、社員情報のツールチップ、組織図とプロジェクト割り当て図を切り替えるタブなどの機能を含めてください。