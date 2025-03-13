---
title: データ駆動型ダイアグラムの作成
---

前章では、インタラクティブなダイアグラムの作成方法について学びました。この章では、さらに高度な機能として、データに基づいて自動的に生成・更新されるデータ駆動型ダイアグラムの作成方法について解説します。外部データソースとの連携や、リアルタイム更新など、動的なダイアグラムの実現方法を学びます。

## データ駆動型ダイアグラムの意義と用途

データ駆動型ダイアグラムは、静的なダイアグラムとは異なり、元となるデータの変化に応じて自動的に更新される動的な図です。これには以下のような利点があります：

1. **常に最新の情報を表示**: データソースが更新されると、それに合わせてダイアグラムも自動的に更新されます
2. **手作業によるエラーの削減**: 手動でのダイアグラム作成・更新に伴う人的ミスを防ぎます
3. **大量のデータの視覚化**: 手動では作成が困難な大量のデータを効率的に視覚化できます
4. **リアルタイム監視**: システム状態やデータの変化をリアルタイムで視覚的に監視できます

データ駆動型ダイアグラムは、システム監視、ネットワーク構成図、組織図、プロジェクト依存関係、データフロー図など、さまざまな用途に活用できます。特に、データが頻繁に変更される環境や、大規模で複雑なシステムの視覚化に適しています。

## データソースとの連携

データ駆動型ダイアグラムを作成するには、まず外部データソースとの連携方法を理解する必要があります。以下に、様々なデータソースとの連携方法を示します。

### 1. CSVやJSONファイルの読み込み

最も基本的なデータソースとして、CSVやJSONファイルからデータを読み込む方法があります：

```python
def create_diagram_from_csv(csv_file_path):
    """CSVファイルからデータを読み込み、ダイアグラムを生成する"""
    import csv
    
    # CSVデータの読み込み
    nodes_data = []
    edges_data = []
    
    with open(csv_file_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # ノードの場合
            if row.get('type') == 'node':
                nodes_data.append({
                    'id': row.get('id'),
                    'label': row.get('label'),
                    'x': int(row.get('x', 0)),
                    'y': int(row.get('y', 0)),
                    'width': int(row.get('width', 100)),
                    'height': int(row.get('height', 50)),
                    'style': row.get('style', '')
                })
            # エッジの場合
            elif row.get('type') == 'edge':
                edges_data.append({
                    'source': row.get('source'),
                    'target': row.get('target'),
                    'label': row.get('label', ''),
                    'style': row.get('style', '')
                })
    
    # ダイアグラムの生成
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="CSV生成ダイアグラム")
    
    # ノードIDの辞書を作成（後でエッジ接続用）
    node_ids = {}
    
    # ノードの追加
    for node in nodes_data:
        diagram = client.add_node(
            diagram, node['label'], node['x'], node['y'], node['width'], node['height'], node['style']
        )
        # ID記録
        node_id = diagram['cells'][-1]['id']
        node_ids[node['id']] = node_id
    
    # エッジの追加
    for edge in edges_data:
        source_id = node_ids.get(edge['source'])
        target_id = node_ids.get(edge['target'])
        
        if source_id and target_id:
            diagram = client.add_edge(
                diagram, source_id, target_id, edge['label'], edge['style']
            )
    
    return diagram
```

JSONファイルからの読み込みも同様に実装できます：

```python
def create_diagram_from_json(json_file_path):
    """JSONファイルからデータを読み込み、ダイアグラムを生成する"""
    import json
    
    # JSONデータの読み込み
    with open(json_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    nodes_data = data.get('nodes', [])
    edges_data = data.get('edges', [])
    
    # ダイアグラムの生成
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="JSON生成ダイアグラム")
    
    # ノードIDの辞書を作成
    node_ids = {}
    
    # ノードの追加
    for node in nodes_data:
        diagram = client.add_node(
            diagram, 
            node.get('label', ''), 
            node.get('x', 0), 
            node.get('y', 0), 
            node.get('width', 100), 
            node.get('height', 50), 
            node.get('style', '')
        )
        # ID記録
        node_id = diagram['cells'][-1]['id']
        node_ids[node.get('id')] = node_id
    
    # エッジの追加
    for edge in edges_data:
        source_id = node_ids.get(edge.get('source'))
        target_id = node_ids.get(edge.get('target'))
        
        if source_id and target_id:
            diagram = client.add_edge(
                diagram, 
                source_id, 
                target_id, 
                edge.get('label', ''), 
                edge.get('style', '')
            )
    
    return diagram
```

### 2. データベースからのデータ取得

リレーショナルデータベースやNoSQLデータベースからデータを取得して、ダイアグラムを生成することもできます：

```python
def create_diagram_from_database(db_config, query):
    """データベースからデータを取得し、ダイアグラムを生成する"""
    import sqlite3  # 例としてSQLiteを使用
    
    # データベース接続
    conn = sqlite3.connect(db_config['database'])
    cursor = conn.cursor()
    
    # クエリ実行
    cursor.execute(query)
    results = cursor.fetchall()
    
    # 列名を取得
    column_names = [description[0] for description in cursor.description]
    
    # 結果をディクショナリのリストに変換
    rows = []
    for row in results:
        row_dict = {}
        for i, value in enumerate(row):
            row_dict[column_names[i]] = value
        rows.append(row_dict)
    
    # 接続を閉じる
    conn.close()
    
    # ダイアグラムの生成
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="データベース生成ダイアグラム")
    
    # データに基づいてダイアグラムを構築
    # （実際のロジックは取得するデータ構造に依存します）
    
    return diagram
```

### 3. APIからのデータ取得

Web APIからデータを取得して、ダイアグラムを生成する方法も有用です：

```python
def create_diagram_from_api(api_url, headers=None, params=None):
    """Web APIからデータを取得し、ダイアグラムを生成する"""
    import requests
    import json
    
    # APIリクエスト
    response = requests.get(api_url, headers=headers, params=params)
    
    # レスポンス確認
    if response.status_code != 200:
        raise Exception(f"API request failed with status code {response.status_code}: {response.text}")
    
    # JSONデータを取得
    data = response.json()
    
    # ダイアグラムの生成
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="API生成ダイアグラム")
    
    # データに基づいてダイアグラムを構築
    # （実際のロジックはAPIレスポンスの構造に依存します）
    
    return diagram
```

### 4. 既存のシステム構成からの自動抽出

クラウドインフラやコンテナ環境など、既存のシステム構成からデータを抽出してダイアグラムを生成することもできます：

```python
def create_diagram_from_aws_resources(region_name, access_key=None, secret_key=None):
    """AWS リソース情報からシステム構成図を自動生成する"""
    import boto3
    
    # AWS認証情報を設定
    session = boto3.Session(
        region_name=region_name,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key
    )
    
    # 各サービスのクライアントを作成
    ec2_client = session.client('ec2')
    rds_client = session.client('rds')
    s3_client = session.client('s3')
    elb_client = session.client('elbv2')
    
    # EC2インスタンス情報を取得
    ec2_instances = ec2_client.describe_instances()
    
    # RDSインスタンス情報を取得
    rds_instances = rds_client.describe_db_instances()
    
    # S3バケット情報を取得
    s3_buckets = s3_client.list_buckets()
    
    # ロードバランサー情報を取得
    load_balancers = elb_client.describe_load_balancers()
    
    # ダイアグラムの生成
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="AWS インフラ構成")
    
    # 配置設定
    x_spacing = 200
    y_spacing = 150
    
    # VPCの配置（中央にVPCを配置）
    diagram, vpc_container_id = add_collapsible_container(
        client, diagram, "VPC", 100, 100, 800, 500,
        style="fillColor=#f5f5f5;strokeColor=#666666;dashed=1;"
    )
    
    # EC2インスタンスの配置
    ec2_node_ids = {}
    for i, reservation in enumerate(ec2_instances['Reservations']):
        for j, instance in enumerate(reservation['Instances']):
            instance_id = instance['InstanceId']
            instance_type = instance['InstanceType']
            state = instance['State']['Name']
            
            # インスタンス名を取得
            instance_name = "EC2 Instance"
            for tag in instance.get('Tags', []):
                if tag['Key'] == 'Name':
                    instance_name = tag['Value']
                    break
            
            # EC2アイコンを配置
            x = 150 + (i % 3) * x_spacing
            y = 200 + (i // 3) * y_spacing
            
            diagram, node_id = client.add_node(
                diagram, 
                f"{instance_name}\n({instance_type})\n{state}", 
                x, y, 120, 60,
                "shape=mxgraph.aws4.instance;verticalLabelPosition=bottom;verticalAlign=top;fillColor=#F58534;strokeColor=#DE6C0E;"
            )
            
            # VPC内に配置
            diagram['cells'][-1]['parent'] = vpc_container_id
            
            # IDを記録
            ec2_node_ids[instance_id] = node_id
    
    # RDSインスタンスの配置
    rds_node_ids = {}
    for i, instance in enumerate(rds_instances['DBInstances']):
        db_id = instance['DBInstanceIdentifier']
        engine = instance['Engine']
        status = instance['DBInstanceStatus']
        
        # RDSアイコンを配置
        x = 150 + (i % 3) * x_spacing
        y = 400 + (i // 3) * y_spacing
        
        diagram, node_id = client.add_node(
            diagram, 
            f"{db_id}\n({engine})\n{status}", 
            x, y, 120, 60,
            "shape=mxgraph.aws4.rds_db_instance;verticalLabelPosition=bottom;verticalAlign=top;fillColor=#2E73B8;strokeColor=#135E9D;"
        )
        
        # VPC内に配置
        diagram['cells'][-1]['parent'] = vpc_container_id
        
        # IDを記録
        rds_node_ids[db_id] = node_id
    
    # S3バケットの配置（VPC外）
    for i, bucket in enumerate(s3_buckets['Buckets']):
        bucket_name = bucket['Name']
        
        x = 950
        y = 150 + i * 100
        
        diagram, _ = client.add_node(
            diagram, 
            bucket_name, 
            x, y, 120, 60,
            "shape=mxgraph.aws4.s3_bucket;verticalLabelPosition=bottom;verticalAlign=top;fillColor=#E05243;strokeColor=#BE3B31;"
        )
    
    # ロードバランサーの配置
    for i, lb in enumerate(load_balancers['LoadBalancers']):
        lb_name = lb['LoadBalancerName']
        lb_type = lb['Type']
        
        x = 500
        y = 100 + i * 60
        
        diagram, lb_id = client.add_node(
            diagram, 
            f"{lb_name}\n({lb_type})", 
            x, y, 120, 60,
            "shape=mxgraph.aws4.elastic_load_balancing;verticalLabelPosition=bottom;verticalAlign=top;fillColor=#F58534;strokeColor=#DE6C0E;"
        )
        
        # VPC内に配置
        diagram['cells'][-1]['parent'] = vpc_container_id
        
        # LBとEC2インスタンスを接続
        for instance_id, ec2_id in ec2_node_ids.items():
            diagram = client.add_edge(
                diagram, lb_id, ec2_id, "",
                "endArrow=classic;html=1;edgeStyle=orthogonalEdgeStyle;"
            )
    
    # EC2インスタンスとRDSインスタンスを接続
    for ec2_id in ec2_node_ids.values():
        for rds_id in rds_node_ids.values():
            diagram = client.add_edge(
                diagram, ec2_id, rds_id, "",
                "endArrow=classic;html=1;edgeStyle=orthogonalEdgeStyle;"
            )
    
    return diagram
```

## データ変換とビジュアライゼーション

データを効果的にビジュアライズするために、データ変換とレイアウト最適化のテクニックが重要です。

### 1. データ構造からダイアグラム要素へのマッピング

データ構造を適切にダイアグラム要素にマッピングする関数を実装します：

```python
def map_data_to_diagram_elements(data, mapping_rules):
    """データをダイアグラム要素にマッピングする
    
    Args:
        data: 変換元のデータ
        mapping_rules: データ属性とダイアグラム要素の対応ルール
    
    Returns:
        nodes_data, edges_data: ダイアグラム生成用のノードとエッジのデータ
    """
    nodes_data = []
    edges_data = []
    
    # ノードマッピングルールを適用
    for item in data:
        if 'node' in mapping_rules:
            node_rules = mapping_rules['node']
            
            # ルールに基づいてノードデータを作成
            if eval(node_rules.get('condition', 'True'), {'item': item}):
                node = {
                    'id': eval(node_rules['id'], {'item': item}),
                    'label': eval(node_rules['label'], {'item': item}),
                    'x': eval(node_rules.get('x', '0'), {'item': item}),
                    'y': eval(node_rules.get('y', '0'), {'item': item}),
                    'width': eval(node_rules.get('width', '100'), {'item': item}),
                    'height': eval(node_rules.get('height', '50'), {'item': item}),
                    'style': eval(node_rules.get('style', "''"), {'item': item})
                }
                nodes_data.append(node)
    
    # エッジマッピングルールを適用
    for item in data:
        if 'edge' in mapping_rules:
            edge_rules = mapping_rules['edge']
            
            # ルールに基づいてエッジデータを作成
            if eval(edge_rules.get('condition', 'True'), {'item': item}):
                edge = {
                    'source': eval(edge_rules['source'], {'item': item}),
                    'target': eval(edge_rules['target'], {'item': item}),
                    'label': eval(edge_rules.get('label', "''"), {'item': item}),
                    'style': eval(edge_rules.get('style', "''"), {'item': item})
                }
                edges_data.append(edge)
    
    return nodes_data, edges_data
```

### 2. 自動レイアウトアルゴリズム

ノードの適切な配置を自動で計算するアルゴリズムを実装します：

```python
def apply_force_directed_layout(nodes_data, edges_data, iterations=50, width=800, height=600):
    """力指向レイアウトアルゴリズムを適用してノードの座標を最適化する
    
    Args:
        nodes_data: ノードデータのリスト
        edges_data: エッジデータのリスト
        iterations: レイアウト計算の反復回数
        width: キャンバス幅
        height: キャンバス高さ
    
    Returns:
        更新されたノードデータ
    """
    import math
    import random
    
    # ノードの初期位置をランダムに設定
    for node in nodes_data:
        if node.get('x', 0) == 0 and node.get('y', 0) == 0:
            node['x'] = random.randint(50, width - 50)
            node['y'] = random.randint(50, height - 50)
    
    # ノードIDとインデックスのマッピングを作成
    node_indices = {node['id']: i for i, node in enumerate(nodes_data)}
    
    # 反発力と引力の係数
    k = math.sqrt((width * height) / len(nodes_data))
    repulsive_force = 0.1
    attractive_force = 0.01
    
    # 力指向レイアウトの反復計算
    for _ in range(iterations):
        # 各ノードの移動量を初期化
        displacement = [[0, 0] for _ in range(len(nodes_data))]
        
        # 反発力の計算（すべてのノードペア間）
        for i, node1 in enumerate(nodes_data):
            for j, node2 in enumerate(nodes_data):
                if i != j:
                    dx = node1['x'] - node2['x']
                    dy = node1['y'] - node2['y']
                    
                    # 距離が0の場合は微小な値を使用
                    distance = max(1.0, math.sqrt(dx*dx + dy*dy))
                    
                    # 反発力（距離の逆二乗に比例）
                    force = repulsive_force * k*k / distance
                    
                    # 反発方向の単位ベクトルに力をかける
                    displacement[i][0] += dx / distance * force
                    displacement[i][1] += dy / distance * force
        
        # 引力の計算（接続されたノード間）
        for edge in edges_data:
            if edge['source'] in node_indices and edge['target'] in node_indices:
                i = node_indices[edge['source']]
                j = node_indices[edge['target']]
                
                dx = nodes_data[i]['x'] - nodes_data[j]['x']
                dy = nodes_data[i]['y'] - nodes_data[j]['y']
                
                distance = max(1.0, math.sqrt(dx*dx + dy*dy))
                
                # 引力（距離に比例）
                force = attractive_force * distance / k
                
                # 引力方向の単位ベクトルに力をかける
                displacement[i][0] -= dx / distance * force
                displacement[i][1] -= dy / distance * force
                displacement[j][0] += dx / distance * force
                displacement[j][1] += dy / distance * force
        
        # ノードの位置を更新
        for i, node in enumerate(nodes_data):
            # 変位の大きさを制限
            disp_mag = math.sqrt(displacement[i][0]**2 + displacement[i][1]**2)
            max_disp = min(k, disp_mag)
            
            if disp_mag > 0:
                node['x'] += displacement[i][0] / disp_mag * max_disp
                node['y'] += displacement[i][1] / disp_mag * max_disp
            
            # キャンバス範囲内に収める
            node['x'] = max(node['width']/2, min(width - node['width']/2, node['x']))
            node['y'] = max(node['height']/2, min(height - node['height']/2, node['y']))
    
    return nodes_data
```

### 3. スタイルのデータ駆動生成

データの内容や状態に基づいて、ダイアグラム要素のスタイルを動的に生成します：

```python
def generate_data_driven_style(item, style_rules):
    """データに基づいてスタイルを動的に生成する
    
    Args:
        item: スタイルを生成するデータ項目
        style_rules: スタイル生成ルール
    
    Returns:
        スタイル文字列
    """
    style = ""
    
    # 基本スタイル
    if 'base_style' in style_rules:
        style = style_rules['base_style']
    
    # 条件付きスタイル
    if 'conditional_styles' in style_rules:
        for condition_rule in style_rules['conditional_styles']:
            condition = condition_rule['condition']
            if eval(condition, {'item': item}):
                # 既存のスタイルに追加
                additional_style = condition_rule['style']
                style = modify_style(style, additional_style)
    
    # 値に基づくスタイル（例：数値を色の濃さに変換）
    if 'value_based_styles' in style_rules:
        for value_rule in style_rules['value_based_styles']:
            value_expr = value_rule['value']
            value = eval(value_expr, {'item': item})
            
            min_val = value_rule.get('min_value', 0)
            max_val = value_rule.get('max_value', 100)
            
            # 値を0-1の範囲に正規化
            normalized = max(0, min(1, (value - min_val) / (max_val - min_val)))
            
            if 'color_gradient' in value_rule:
                start_color = value_rule['color_gradient']['start']
                end_color = value_rule['color_gradient']['end']
                
                # グラデーションの中間色を計算
                r = int((1 - normalized) * int(start_color[1:3], 16) + normalized * int(end_color[1:3], 16))
                g = int((1 - normalized) * int(start_color[3:5], 16) + normalized * int(end_color[3:5], 16))
                b = int((1 - normalized) * int(start_color[5:7], 16) + normalized * int(end_color[5:7], 16))
                
                color = f"#{r:02x}{g:02x}{b:02x}"
                
                # スタイルに色を設定
                style = modify_style(style, f"fillColor={color};")
    
    return style
```

## リアルタイムデータの視覚化

データの変化をリアルタイムに反映するダイアグラムを作成する方法を解説します。

### 1. ポーリングベースの更新機能

定期的にデータソースを確認し、変更があればダイアグラムを更新する仕組みを実装します：

```python
def create_polling_based_viewer_html(data_source_url, polling_interval=5000, options=None):
    """ポーリングベースでリアルタイム更新するダイアグラムビューワーHTMLを生成する
    
    Args:
        data_source_url: データソースのURL
        polling_interval: ポーリング間隔（ミリ秒）
        options: ビューワーオプション
    """
    if options is None:
        options = {}
    
    # デフォルトオプション
    default_options = {
        "title": "リアルタイムダイアグラム",
        "width": "100%",
        "height": "600px",
        "zoom": True,
        "nav": True,
        "toolbar": True
    }
    
    # オプションをマージ
    for key, value in default_options.items():
        if key not in options:
            options[key] = value
    
    # HTML生成
    html = f"""<!DOCTYPE html>
<html>
<head>
    <title>{options['title']}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; }}
        .diagram-container {{ width: {options['width']}; height: {options['height']}; border: 1px solid #ddd; margin: 20px auto; }}
        .status {{ padding: 10px; background-color: #f0f0f0; border-radius: 4px; margin-bottom: 10px; }}
        .status.updating {{ background-color: #fff8e1; }}
        .error {{ color: #d32f2f; font-weight: bold; }}
    </style>
    <script src="https://viewer.diagrams.net/js/viewer-static.min.js"></script>
</head>
<body>
    <div class="status" id="statusBar">データを読み込んでいます...</div>
    <div class="diagram-container" id="diagramContainer"></div>
    
    <script>
        // ビューワー設定
        const config = {{
            highlight: true,
            lightbox: false,
            nav: {str(options['nav']).lower()},
            zoom: {str(options['zoom']).lower()},
            toolbar: {str(options['toolbar']).lower()},
            "toolbar-buttons": "zoom layers lightbox",
            "toolbar-position": "top"
        }};
        
        // ビューワーを初期化
        const viewer = new GraphViewer(document.getElementById('diagramContainer'), config);
        const statusBar = document.getElementById('statusBar');
        
        // 最後に受信したデータのハッシュ
        let lastDataHash = '';
        
        // データソースを定期的にポーリング
        function fetchDiagramData() {{
            statusBar.textContent = 'データを更新しています...';
            statusBar.classList.add('updating');
            
            fetch('{data_source_url}')
                .then(response => {{
                    if (!response.ok) {{
                        throw new Error(`HTTP error! status: ${{response.status}}`);
                    }}
                    return response.json();
                }})
                .then(data => {{
                    // データハッシュを計算（単純化のため文字列化して比較）
                    const currentHash = JSON.stringify(data);
                    
                    // 前回と異なる場合のみダイアグラムを更新
                    if (currentHash !== lastDataHash) {{
                        lastDataHash = currentHash;
                        
                        // ダイアグラムデータを更新
                        viewer.setXmlData(JSON.stringify(data));
                        
                        statusBar.textContent = `データを更新しました（${{new Date().toLocaleTimeString()}}）`;
                    }} else {{
                        statusBar.textContent = `変更はありません（${{new Date().toLocaleTimeString()}}）`;
                    }}
                    
                    statusBar.classList.remove('updating');
                }})
                .catch(error => {{
                    console.error('データ取得エラー:', error);
                    statusBar.textContent = `エラー: ${{error.message}}`;
                    statusBar.classList.remove('updating');
                    statusBar.classList.add('error');
                }});
        }}
        
        // 初回データ取得
        fetchDiagramData();
        
        // ポーリングタイマーを設定
        setInterval(fetchDiagramData, {polling_interval});
    </script>
</body>
</html>"""
    
    return html
```

### 2. WebSocketを使用したリアルタイム更新

WebSocketを使用して、サーバーからのプッシュ通知でダイアグラムをリアルタイム更新します：

```python
def create_websocket_viewer_html(websocket_url, options=None):
    """WebSocketを使用してリアルタイム更新するダイアグラムビューワーHTMLを生成する
    
    Args:
        websocket_url: WebSocketサーバーURL
        options: ビューワーオプション
    """
    if options is None:
        options = {}
    
    # デフォルトオプション
    default_options = {
        "title": "WebSocketリアルタイムダイアグラム",
        "width": "100%",
        "height": "600px",
        "zoom": True,
        "nav": True,
        "toolbar": True
    }
    
    # オプションをマージ
    for key, value in default_options.items():
        if key not in options:
            options[key] = value
    
    # HTML生成
    html = f"""<!DOCTYPE html>
<html>
<head>
    <title>{options['title']}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; }}
        .diagram-container {{ width: {options['width']}; height: {options['height']}; border: 1px solid #ddd; margin: 20px auto; }}
        .status {{ padding: 10px; background-color: #f0f0f0; border-radius: 4px; margin-bottom: 10px; }}
        .status.connected {{ background-color: #e8f5e9; }}
        .status.disconnected {{ background-color: #ffebee; }}
        .status.updating {{ background-color: #fff8e1; }}
    </style>
    <script src="https://viewer.diagrams.net/js/viewer-static.min.js"></script>
</head>
<body>
    <div class="status disconnected" id="statusBar">WebSocketに接続しています...</div>
    <div class="diagram-container" id="diagramContainer"></div>
    
    <script>
        // ビューワー設定
        const config = {{
            highlight: true,
            lightbox: false,
            nav: {str(options['nav']).lower()},
            zoom: {str(options['zoom']).lower()},
            toolbar: {str(options['toolbar']).lower()},
            "toolbar-buttons": "zoom layers lightbox",
            "toolbar-position": "top"
        }};
        
        // ビューワーを初期化
        const viewer = new GraphViewer(document.getElementById('diagramContainer'), config);
        const statusBar = document.getElementById('statusBar');
        
        // WebSocket接続
        let socket;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        const reconnectInterval = 3000;
        
        function connectWebSocket() {{
            // WebSocketを接続
            socket = new WebSocket('{websocket_url}');
            
            // 接続イベント
            socket.onopen = function(event) {{
                statusBar.textContent = 'WebSocketに接続しました';
                statusBar.classList.remove('disconnected');
                statusBar.classList.add('connected');
                reconnectAttempts = 0;
            }};
            
            // メッセージ受信イベント
            socket.onmessage = function(event) {{
                try {{
                    statusBar.classList.add('updating');
                    
                    // 受信データをパース
                    const data = JSON.parse(event.data);
                    
                    // ダイアグラムデータを更新
                    viewer.setXmlData(JSON.stringify(data));
                    
                    statusBar.textContent = `データを更新しました（${{new Date().toLocaleTimeString()}}）`;
                    statusBar.classList.remove('updating');
                }} catch (error) {{
                    console.error('データ処理エラー:', error);
                    statusBar.textContent = `エラー: ${{error.message}}`;
                    statusBar.classList.remove('updating');
                }}
            }};
            
            // エラーイベント
            socket.onerror = function(error) {{
                console.error('WebSocketエラー:', error);
                statusBar.textContent = 'WebSocket接続でエラーが発生しました';
                statusBar.classList.remove('connected');
                statusBar.classList.add('disconnected');
            }};
            
            // 切断イベント
            socket.onclose = function(event) {{
                statusBar.textContent = 'WebSocket接続が切断されました';
                statusBar.classList.remove('connected');
                statusBar.classList.add('disconnected');
                
                // 再接続を試みる
                if (reconnectAttempts < maxReconnectAttempts) {{
                    reconnectAttempts++;
                    statusBar.textContent = `再接続を試みています (${{reconnectAttempts}}/${{maxReconnectAttempts}})...`;
                    setTimeout(connectWebSocket, reconnectInterval);
                }}
            }};
        }}
        
        // WebSocket接続を開始
        connectWebSocket();
    </script>
</body>
</html>"""
    
    return html
```

### 3. インクリメンタル更新システム

大規模ダイアグラムを効率的に更新するための部分更新システムを実装します：

```python
def calculate_diagram_diff(old_diagram, new_diagram):
    """2つのダイアグラム間の差分を計算する
    
    Args:
        old_diagram: 古いダイアグラムデータ
        new_diagram: 新しいダイアグラムデータ
    
    Returns:
        変更操作のリスト
    """
    diff_operations = []
    
    # 古いダイアグラムのセル（ノード・エッジ）のIDマップを作成
    old_cells = {cell['id']: cell for cell in old_diagram.get('cells', [])}
    new_cells = {cell['id']: cell for cell in new_diagram.get('cells', [])}
    
    # 削除されたセルを特定
    for cell_id in old_cells:
        if cell_id not in new_cells:
            diff_operations.append({
                'op': 'remove',
                'id': cell_id
            })
    
    # 追加または変更されたセルを特定
    for cell_id, new_cell in new_cells.items():
        if cell_id not in old_cells:
            # 新規追加
            diff_operations.append({
                'op': 'add',
                'cell': new_cell
            })
        else:
            # 既存セルの変更を確認
            old_cell = old_cells[cell_id]
            
            # 属性の比較（親、スタイル、ジオメトリなど）
            changes = {}
            
            if new_cell.get('parent') != old_cell.get('parent'):
                changes['parent'] = new_cell.get('parent')
            
            if new_cell.get('style') != old_cell.get('style'):
                changes['style'] = new_cell.get('style')
            
            if new_cell.get('value') != old_cell.get('value'):
                changes['value'] = new_cell.get('value')
            
            # ジオメトリの比較
            if 'geometry' in new_cell and 'geometry' in old_cell:
                new_geo = new_cell['geometry']
                old_geo = old_cell['geometry']
                
                geo_changes = {}
                
                for key in ['x', 'y', 'width', 'height']:
                    if key in new_geo and new_geo[key] != old_geo.get(key):
                        geo_changes[key] = new_geo[key]
                
                if geo_changes:
                    changes['geometry'] = geo_changes
            
            # 変更がある場合は更新操作を追加
            if changes:
                diff_operations.append({
                    'op': 'update',
                    'id': cell_id,
                    'changes': changes
                })
    
    return diff_operations
```

これをWebSocketベースのビューワーに組み込みます：

```python
def create_incremental_update_viewer_html(websocket_url, options=None):
    """インクリメンタル更新をサポートするリアルタイムダイアグラムビューワーHTMLを生成する"""
    if options is None:
        options = {}
    
    # HTMLのベース部分は同じですが、onmessage処理を変更
    html = f"""<!-- 前半部分は同じなので省略 -->
    
    <script>
        // 前半部分は同じ...
        
        // メッセージ受信イベント
        socket.onmessage = function(event) {{
            try {{
                statusBar.classList.add('updating');
                
                // 受信データをパース
                const data = JSON.parse(event.data);
                
                // 完全な更新かインクリメンタル更新かを確認
                if (data.type === 'full_update') {{
                    // 完全な更新
                    viewer.setXmlData(JSON.stringify(data.diagram));
                    statusBar.textContent = `ダイアグラムを完全更新しました（${{new Date().toLocaleTimeString()}}）`;
                }} else if (data.type === 'incremental_update') {{
                    // インクリメンタル更新
                    const operations = data.operations;
                    const graph = viewer.graph;
                    const model = graph.getModel();
                    
                    // 更新トランザクションを開始
                    model.beginUpdate();
                    try {{
                        for (const op of operations) {{
                            if (op.op === 'remove') {{
                                // セルの削除
                                const cell = model.getCell(op.id);
                                if (cell) {{
                                    model.remove(cell);
                                }}
                            }} else if (op.op === 'add') {{
                                // セルの追加
                                // mxGraphのAPIを使用して新しいセルを作成
                                // 実際の実装は複雑なので省略
                            }} else if (op.op === 'update') {{
                                // セルの更新
                                const cell = model.getCell(op.id);
                                if (cell) {{
                                    // 各種プロパティを更新
                                    if (op.changes.style) {{
                                        graph.setCellStyle(op.changes.style, [cell]);
                                    }}
                                    
                                    if (op.changes.value) {{
                                        model.setValue(cell, op.changes.value);
                                    }}
                                    
                                    if (op.changes.parent) {{
                                        const parent = model.getCell(op.changes.parent);
                                        if (parent) {{
                                            model.setParent(cell, parent);
                                        }}
                                    }}
                                    
                                    if (op.changes.geometry) {{
                                        const geo = cell.getGeometry().clone();
                                        
                                        if ('x' in op.changes.geometry) {{
                                            geo.x = op.changes.geometry.x;
                                        }}
                                        
                                        if ('y' in op.changes.geometry) {{
                                            geo.y = op.changes.geometry.y;
                                        }}
                                        
                                        if ('width' in op.changes.geometry) {{
                                            geo.width = op.changes.geometry.width;
                                        }}
                                        
                                        if ('height' in op.changes.geometry) {{
                                            geo.height = op.changes.geometry.height;
                                        }}
                                        
                                        model.setGeometry(cell, geo);
                                    }}
                                }}
                            }}
                        }}
                    }} finally {{
                        // 更新トランザクションを終了
                        model.endUpdate();
                    }}
                    
                    statusBar.textContent = `ダイアグラムを差分更新しました (${{operations.length}}件の変更)（${{new Date().toLocaleTimeString()}}）`;
                }}
                
                statusBar.classList.remove('updating');
            }} catch (error) {{
                console.error('データ処理エラー:', error);
                statusBar.textContent = `エラー: ${{error.message}}`;
                statusBar.classList.remove('updating');
            }}
        }};
        
        // 以下は同じ...
    </script>
</body>
</html>"""
    
    return html
```

## 実践例：システム監視ダッシュボード

システムの状態をリアルタイムで監視するダッシュボードを作成する実践例を紹介します。

```python
def create_system_monitoring_dashboard(monitor_data):
    """システム監視ダッシュボードを作成する
    
    Args:
        monitor_data: システム監視データ
        
    Returns:
        生成されたダイアグラム
    """
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="システム監視ダッシュボード")
    
    # ダッシュボードのタイトルと更新時間
    current_time = monitor_data.get('timestamp', '')
    diagram, title_id = client.add_node(
        diagram, 
        f"システム監視ダッシュボード（更新：{current_time}）", 
        400, 30, 400, 40,
        "fillColor=none;strokeColor=none;fontStyle=1;fontSize=18;"
    )
    
    # サーバー情報を取得
    servers = monitor_data.get('servers', [])
    
    # サーバーごとのノードを配置
    server_node_ids = {}
    server_statuses = {}
    
    for i, server in enumerate(servers):
        server_id = server.get('id')
        server_name = server.get('name')
        status = server.get('status', 'unknown')
        cpu_usage = server.get('cpu_usage', 0)
        memory_usage = server.get('memory_usage', 0)
        
        # サーバーのステータスに基づいてスタイルを決定
        status_styles = {
            'healthy': "fillColor=#d5e8d4;strokeColor=#82b366;",
            'warning': "fillColor=#fff2cc;strokeColor=#d6b656;",
            'critical': "fillColor=#f8cecc;strokeColor=#b85450;",
            'unknown': "fillColor=#f5f5f5;strokeColor=#666666;"
        }
        
        server_style = status_styles.get(status, status_styles['unknown'])
        server_style += "rounded=1;whiteSpace=wrap;html=1;"
        
        # サーバーノードのラベル
        label = f"{server_name}\nCPU: {cpu_usage}%\nメモリ: {memory_usage}%"
        
        # 配置位置を計算
        x = 100 + (i % 3) * 250
        y = 100 + (i // 3) * 150
        
        # サーバーノードを追加
        diagram, server_node_id = client.add_node(
            diagram, label, x, y, 200, 80, server_style
        )
        
        # IDを記録
        server_node_ids[server_id] = server_node_id
        server_statuses[server_id] = status
    
    # サービス情報を取得
    services = monitor_data.get('services', [])
    
    # サービスノードを配置
    service_node_ids = {}
    service_y_start = 100 + ((len(servers) + 2) // 3) * 150
    
    for i, service in enumerate(services):
        service_id = service.get('id')
        service_name = service.get('name')
        status = service.get('status', 'unknown')
        response_time = service.get('response_time', 0)
        error_rate = service.get('error_rate', 0)
        server_id = service.get('server_id')
        
        # サービスのステータスに基づいてスタイルを決定
        status_styles = {
            'healthy': "fillColor=#dae8fc;strokeColor=#6c8ebf;",
            'warning': "fillColor=#ffe6cc;strokeColor=#d79b00;",
            'critical': "fillColor=#e1d5e7;strokeColor=#9673a6;",
            'unknown': "fillColor=#f5f5f5;strokeColor=#666666;"
        }
        
        service_style = status_styles.get(status, status_styles['unknown'])
        service_style += "shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;"
        
        # サービスノードのラベル
        label = f"{service_name}\n応答時間: {response_time}ms\nエラー率: {error_rate}%"
        
        # 配置位置を計算
        x = 100 + (i % 4) * 200
        y = service_y_start + (i // 4) * 120
        
        # サービスノードを追加
        diagram, service_node_id = client.add_node(
            diagram, label, x, y, 180, 80, service_style
        )
        
        # IDを記録
        service_node_ids[service_id] = service_node_id
        
        # サーバーとサービスを接続（サーバーがわかっている場合）
        if server_id and server_id in server_node_ids:
            server_node_id = server_node_ids[server_id]
            
            # サーバーのステータスに基づいてエッジスタイルを決定
            edge_style = "endArrow=classic;html=1;edgeStyle=orthogonalEdgeStyle;"
            
            if server_statuses.get(server_id) == 'critical':
                edge_style += "strokeColor=#b85450;strokeWidth=2;dashed=1;"
            elif server_statuses.get(server_id) == 'warning':
                edge_style += "strokeColor=#d6b656;strokeWidth=1;dashed=1;"
            
            # サーバーとサービスを接続
            diagram = client.add_edge(
                diagram, server_node_id, service_node_id, "", edge_style
            )
    
    # データベース情報を取得
    databases = monitor_data.get('databases', [])
    
    # データベースノードを配置
    database_y_start = service_y_start + ((len(services) + 3) // 4) * 120
    
    for i, db in enumerate(databases):
        db_id = db.get('id')
        db_name = db.get('name')
        status = db.get('status', 'unknown')
        connections = db.get('connections', 0)
        query_time = db.get('avg_query_time', 0)
        
        # データベースのステータスに基づいてスタイルを決定
        status_styles = {
            'healthy': "fillColor=#d5e8d4;strokeColor=#82b366;",
            'warning': "fillColor=#fff2cc;strokeColor=#d6b656;",
            'critical': "fillColor=#f8cecc;strokeColor=#b85450;",
            'unknown': "fillColor=#f5f5f5;strokeColor=#666666;"
        }
        
        db_style = status_styles.get(status, status_styles['unknown'])
        db_style += "shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;"
        
        # データベースノードのラベル
        label = f"{db_name}\n接続数: {connections}\nクエリ時間: {query_time}ms"
        
        # 配置位置を計算
        x = 150 + i * 250
        y = database_y_start
        
        # データベースノードを追加
        diagram, db_node_id = client.add_node(
            diagram, label, x, y, 120, 80, db_style
        )
        
        # 関連するサービスと接続
        for service in services:
            if db_id in service.get('database_ids', []):
                service_id = service.get('id')
                if service_id in service_node_ids:
                    service_node_id = service_node_ids[service_id]
                    
                    # エッジスタイル
                    edge_style = "endArrow=classic;startArrow=classic;html=1;edgeStyle=orthogonalEdgeStyle;"
                    
                    # データベースとサービスを接続
                    diagram = client.add_edge(
                        diagram, service_node_id, db_node_id, "", edge_style
                    )
    
    # アラート情報をノートとして追加
    alerts = monitor_data.get('alerts', [])
    if alerts:
        alerts_text = "⚠️ アラート\n\n"
        for alert in alerts:
            severity = alert.get('severity', 'info')
            message = alert.get('message', '')
            source = alert.get('source', '')
            
            alerts_text += f"[{severity.upper()}] {source}: {message}\n"
        
        # アラートノートを追加
        diagram, _ = client.add_node(
            diagram, 
            alerts_text, 
            800, 100, 250, 200,
            "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;fillColor=#f8cecc;strokeColor=#b85450;align=left;"
        )
    
    return diagram
```

## 実践例：データベースER図の自動生成

データベースのスキーマ情報からER図を自動生成するシステムを実装します：

```python
def create_dynamic_er_diagram(db_connection_config, schema_name=None):
    """データベースのスキーマ情報からER図を自動生成する
    
    Args:
        db_connection_config: データベース接続設定
        schema_name: 取得するスキーマ名（指定しない場合はデフォルトスキーマ）
    """
    import psycopg2
    
    # データベースに接続
    conn = psycopg2.connect(
        host=db_connection_config['host'],
        database=db_connection_config['database'],
        user=db_connection_config['user'],
        password=db_connection_config['password']
    )
    
    cursor = conn.cursor()
    
    # スキーマ内のテーブル一覧を取得
    if schema_name:
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = %s 
            AND table_type = 'BASE TABLE'
        """, (schema_name,))
    else:
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        """)
    
    tables = [row[0] for row in cursor.fetchall()]
    
    # テーブル情報を格納する辞書
    table_info = {}
    table_positions = {}
    
    # テーブルの列情報を取得
    for i, table in enumerate(tables):
        # テーブルの列情報を取得
        if schema_name:
            cursor.execute("""
                SELECT c.column_name, c.data_type, c.is_nullable, 
                       tc.constraint_type, kcu.referenced_table_name, kcu.referenced_column_name
                FROM information_schema.columns c
                LEFT JOIN information_schema.key_column_usage kcu 
                    ON c.table_schema = kcu.table_schema 
                    AND c.table_name = kcu.table_name 
                    AND c.column_name = kcu.column_name
                LEFT JOIN information_schema.table_constraints tc 
                    ON kcu.constraint_name = tc.constraint_name 
                    AND kcu.table_schema = tc.table_schema
                WHERE c.table_schema = %s 
                AND c.table_name = %s
                ORDER BY c.ordinal_position
            """, (schema_name, table))
        else:
            cursor.execute("""
                SELECT c.column_name, c.data_type, c.is_nullable, 
                       tc.constraint_type, kcu.referenced_table_name, kcu.referenced_column_name
                FROM information_schema.columns c
                LEFT JOIN information_schema.key_column_usage kcu 
                    ON c.table_schema = kcu.table_schema 
                    AND c.table_name = kcu.table_name 
                    AND c.column_name = kcu.column_name
                LEFT JOIN information_schema.table_constraints tc 
                    ON kcu.constraint_name = tc.constraint_name 
                    AND kcu.table_schema = tc.table_schema
                WHERE c.table_schema = 'public' 
                AND c.table_name = %s
                ORDER BY c.ordinal_position
            """, (table,))
        
        columns = cursor.fetchall()
        
        # テーブル情報を格納
        table_info[table] = {
            'columns': [],
            'foreign_keys': []
        }
        
        # 列情報を処理
        for column in columns:
            column_name, data_type, is_nullable, constraint_type, ref_table, ref_column = column
            
            column_info = {
                'name': column_name,
                'type': data_type,
                'constraints': []
            }
            
            if is_nullable == 'NO':
                column_info['constraints'].append('NOT NULL')
            
            if constraint_type == 'PRIMARY KEY':
                column_info['constraints'].append('PK')
            elif constraint_type == 'FOREIGN KEY':
                column_info['constraints'].append('FK')
                
                # 外部キー情報を追加
                if ref_table and ref_column:
                    table_info[table]['foreign_keys'].append({
                        'column': column_name,
                        'referenced_table': ref_table,
                        'referenced_column': ref_column
                    })
            
            table_info[table]['columns'].append(column_info)
        
        # テーブルの位置を計算（自動レイアウト用）
        table_positions[table] = {
            'x': 100 + (i % 3) * 350,
            'y': 100 + (i // 3) * 250
        }
    
    # データベース接続を閉じる
    conn.close()
    
    # ER図を生成
    client = DrawioAPIClient()
    diagram = client.create_diagram(title="自動生成ER図")
    
    # テーブルノードのIDを格納する辞書
    table_node_ids = {}
    
    # テーブルノードを追加
    for table_name, info in table_info.items():
        columns = info['columns']
        
        # 列情報からテーブルのHTML表現を作成
        html = f'<table border="1" cellpadding="4" style="width:100%;font-size:1em;"><tr><th bgcolor="#e0e0e0" colspan="3">{table_name}</th></tr>'
        html += '<tr><th>列名</th><th>型</th><th>制約</th></tr>'
        
        for column in columns:
            name = column['name']
            data_type = column['type']
            constraints = ', '.join(column['constraints'])
            
            # 主キーは太字、外部キーは斜体で表示
            if 'PK' in constraints:
                name = f'<b>{name}</b>'
            elif 'FK' in constraints:
                name = f'<i>{name}</i>'
            
            html += f'<tr><td>{name}</td><td>{data_type}</td><td>{constraints}</td></tr>'
        
        html += '</table>'
        
        # テーブルノードを追加
        x = table_positions[table_name]['x']
        y = table_positions[table_name]['y']
        
        # テーブルの高さを列数に基づいて調整
        height = 30 + (len(columns) + 1) * 26  # ヘッダー + 列
        
        style = "rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;fontColor=#333333;"
        
        diagram, node_id = client.add_node(
            diagram, html, x, y, 300, height, style
        )
        
        # テーブルIDを記録
        table_node_ids[table_name] = node_id
    
    # 外部キー関係を表すエッジを追加
    for table_name, info in table_info.items():
        foreign_keys = info['foreign_keys']
        
        for fk in foreign_keys:
            source_id = table_node_ids.get(table_name)
            target_id = table_node_ids.get(fk['referenced_table'])
            
            if source_id and target_id:
                # 関係ラベル
                label = f"{fk['column']} -> {fk['referenced_column']}"
                
                # 関係エッジを追加
                diagram = client.add_edge(
                    diagram, source_id, target_id, label,
                    "endArrow=ERmany;startArrow=ERone;html=1;entryX=0;entryY=0.5;endFill=0;startFill=0;"
                )
    
    return diagram
```

## まとめ

この章では、データ駆動型ダイアグラムの作成方法について学びました。主なポイントは以下の通りです：

1. データ駆動型ダイアグラムの意義と用途
2. 様々なデータソース（CSV、JSON、データベース、API）からのデータ取得と変換
3. データ構造からダイアグラム要素へのマッピング方法
4. 自動レイアウトアルゴリズムの実装
5. データに基づくスタイルの動的生成
6. ポーリングやWebSocketを使ったリアルタイム更新機能
7. インクリメンタル更新による大規模ダイアグラムの効率的な更新
8. システム監視ダッシュボードやデータベースER図の自動生成などの実践例

データ駆動型ダイアグラムは、データの可視化や監視、自動ドキュメント生成など、様々な用途に活用できます。特に、データが頻繁に変更される環境や、大規模で複雑なシステムの視覚化において、その威力を発揮します。Draw.ioのAPIとウェブテクノロジーを組み合わせることで、インタラクティブかつリアルタイムに更新されるダイアグラムを実現できます。

次の章では、Draw.ioを使ったビジュアルプログラミングインターフェースの構築方法について学びます。ノードとエッジを使った視覚的なプログラム表現や、編集可能なビジュアルエディタの実装方法などを解説します。

## 練習問題

1. GitHubのリポジトリ情報（ファイル構造、コミット履歴など）からプロジェクト構造を可視化するダイアグラムを生成するプログラムを作成してください。

2. システムログファイルを解析し、エラーや警告の発生パターンを可視化するダイアグラムを自動生成するプログラムを作成してください。

3. WebSocketを使用して、サーバーのリソース使用状況（CPU、メモリ、ディスク、ネットワーク）をリアルタイムで可視化するダッシュボードを実装してください。

4. MongoDB（NoSQLデータベース）のコレクション構造を分析し、その関係性を可視化するER図のような図を自動生成するプログラムを作成してください。

5. クラウドサービス（AWS、Azure、GCPなど）のリソース構成情報を取得し、インフラ構成図を自動生成するプログラムを作成してください。インフラの変更を検出して差分更新する機能も含めてください。